const { MappingDBProxy } = require('../db/mapping.js');


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
    });
});
