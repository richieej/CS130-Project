const { MappingDBProxy, Mapping } = require('../db/mapping.js');


test('Can connect and disconnect with database', async () => {
    const mapDB = new MappingDBProxy();
    await mapDB.connect();
    expect(mapDB.isConnected).toBe(true);
    await mapDB.disconnect();
    expect(mapDB.isConnected).toBe(false);
});

describe('Mapping read and write', () => {
    const mapDB = new MappingDBProxy();
    
    beforeAll(async () => {
        await mapDB.connect();
    });

    afterAll(async () => {
        await mapDB.disconnect();
    });

    test('Create new mappings adds new mapping', async () => {
        const create_result = await mapDB.create_new_mapping(
            "test_mapping",
            `
                SELECT ?subject ?predicate ?object
                WHERE {
                    ?subject ?predicate ?object
                }
            `,
            `
                INSERT DATA {
                    ?subject ?predicate ?object.
                }
            `,
            "PLACEHOLDER_OWNER_UUID"
        );
        expect(create_result.uuid).toBeTruthy();
        expect(create_result.err).toBeFalsy();
        
        const all_mappings_result = await mapDB.get_all_mappings();
        expect(all_mappings_result).toContainEqual(expect.objectContaining({
            uuid: create_result.uuid
        }));

        const mapping = await mapDB.get_mapping_by_uuid(create_result.uuid);
        expect(mapping).toBeDefined();
        expect(mapping.name).toEqual("test_mapping");
        expect(mapping.owner_uuid).toEqual("PLACEHOLDER_OWNER_UUID");
        expect(mapping.uuid).toEqual(create_result.uuid);
    });
});

test('fill mapping with write data', () => {
    const mapping = new Mapping("PLACEHOLDER", "PLACEHOLDER", "PLACEHOLDER", "PLACEHOLDER", 
        `PREFIX eql: <http://excql.org/relations/#>
        DELETE {
            ?student eql:school ?school1
        }
        INSERT {
            ?student eql:student ?school2
        }
        WHERE {
            ?student eql:name <<NEW.Name>>.
            ?school1 eql:name <<OLD.SchoolName>>.
            ?school2 eql:name <<NEW.SchoolName>>.
        };`
    );

    const new_data = {
        headers: ["Name", "SchoolName"],
        data: [{
            Name: "Joe Bruin",
            SchoolName: "Harvard University"
        }, {
            Name: "Tracy Zhao",
            SchoolName: "University of California - Los Angeles"
        }, {
            Name: "Joe Biden",
            SchoolName: undefined
        }]
    };

    const old_data = {
        headers: ["Name", "SchoolName"],
        data: [{
            Name: "Joe Bruin",
            SchoolName: "University of California - Los Angeles"
        }, {
            Name: "Tracy Zhao",
            SchoolName: "Harvard University"
        }, {
            Name: "Joe Biden",
            SchoolName: "University of Delaware"
        }]
    };

    const query = mapping.get_write_with_data(new_data, old_data);
    // console.log(query);
    expect(query.includes('?student eql:name <<NEW.Name>>.')).toBe(false);
    expect(query.includes('?school1 eql:name <<OLD.SchoolName>>.')).toBe(false);
    expect(query.includes('?school2 eql:name <<NEW.SchoolName>>.')).toBe(false);
    expect(query.includes('?student eql:name "Joe Bruin".')).toBe(true); // TODO: switch to regexp?
    expect(query.includes('?school1 eql:name "University of California - Los Angeles".')).toBe(true);
    expect(query.includes('?school2 eql:name "Harvard University".')).toBe(true);

    expect(query.includes('?student eql:name "Tracy Zhao".')).toBe(true);
    expect(query.includes('?school1 eql:name "Harvard University".')).toBe(true);
    expect(query.includes('?school2 eql:name "University of California - Los Angeles".')).toBe(true);

    expect(query.includes('?student eql:name "Joe Biden".')).toBe(true);
    expect(query.includes('?school1 eql:name "University of Delaware".')).toBe(true);
    expect(query.includes('?school2 eql:name "".')).toBe(true);
});