const { FusekiProxy } = require("../db/fuseki");
const { MappingDBProxy } = require("../db/mapping");
const { MappingApplier } = require("../src/mapping_applier");
const { ExcelTable } = require('../src/excel.js');

const stream = require('stream');
const ExcelJS = require('exceljs');

const applier = new MappingApplier();
const fuseki = new FusekiProxy("Main");
const map_db = new MappingDBProxy();

beforeAll(async () => {
    await map_db.connect();
    expect(map_db.isConnected).toBe(true);

    const has_dataset = await fuseki.create_dataset();
    expect(has_dataset.error).toBeFalsy();
    expect(has_dataset.results).toBe(true);

    const connection = await fuseki.test_connection();
    expect(connection).toBe(true);
});

afterAll(async () => {
    await map_db.disconnect();
});

describe('Using Students and Schools dataset', () => {

    let simple_mapping;
    let school_mapping;

    beforeEach(async () => {
        const clear_result = await fuseki.write_data(`
            DELETE {
                ?s ?p ?o
            }
            WHERE {
                ?s ?p ?o.
            };
        `);
        expect(clear_result.error).toBeUndefined();
        expect(clear_result.results).toBe(true);

        const write_result = await fuseki.write_data(`
        PREFIX eql: <http://excql.org/relations/#>
        INSERT DATA
        {
            <http://students/JoeBruin>
                eql:name "Joe Bruin";
                eql:school <http://schools/UCLA>.
            <http://students/TracyZhao>
                eql:name "Tracy Zhao";
                eql:school <http://schools/UCLA>.
            <http://students/BarackObama>
                eql:name "Barack Obama";
                eql:school <http://schools/HarvardLaw>, <http://schools/Columbia>.
            <http://schools/UCLA>
                eql:name "University of California - Los Angeles".
            <http://schools/HarvardLaw>
                eql:name "Harvard University - Harvard Law School".
            <http://schools/Columbia>
                eql:name "Columbia University".
        }
        `);
        expect(write_result.err).toBeUndefined();
        expect(write_result.results).toBe(true);
    });

    beforeAll(async () => {
        const simple_create_result = await map_db.create_new_mapping("Subject Predicate Object", `
            PREFIX eql: <http://excql.org/relations/#>
            SELECT ?subject ?predicate ?object
            WHERE {
                ?subject ?predicate ?object
            }
        `, `
            PREFIX eql: <http://excql.org/relations/#>
            DELETE {
                ?subject ?predicate ?object
            } 
            WHERE {
                FILTER(?subject=<<OLD.subject>> && ?predicate=<<OLD.predicate>> && ?object=<<OLD.object>>).
            };

            INSERT {
                <<NEW.subject>> <<NEW.predicate>> <<NEW.object>>
            } 
            WHERE {};
        `, "PLACEHOLDER");
        expect(simple_create_result.err).toBeUndefined();
        expect(simple_create_result.uuid).toBeDefined();
    
        simple_mapping = await map_db.get_mapping_by_uuid(simple_create_result.uuid);
        expect(simple_mapping).toBeTruthy();
        expect(simple_mapping.name).toEqual("Subject Predicate Object");
        expect(simple_mapping.uuid).toEqual(simple_create_result.uuid);

        const school_create_result = await map_db.create_new_mapping("Students and Schools", `
            PREFIX eql: <http://excql.org/relations/#>
            SELECT ?Name ?SchoolName
            WHERE {
                ?student eql:school ?school.
                ?student eql:name ?Name.
                ?school eql:name ?SchoolName.
            }
        `, `
            PREFIX eql: <http://excql.org/relations/#>
            
            DELETE {
                ?student eql:school ?school
            }
            WHERE {
                ?student eql:name <<OLD.Name>>.
                ?school eql:name <<OLD.SchoolName>>.
            };

            INSERT {
                ?student eql:school ?school
            }
            WHERE {
                ?student eql:name <<NEW.Name>>.
                ?school eql:name <<NEW.SchoolName>>.
            };
        `, "PLACEHOLDER");
        expect(school_create_result.err).toBeUndefined();
        expect(school_create_result.uuid).toBeDefined();
    
        school_mapping = await map_db.get_mapping_by_uuid(school_create_result.uuid);
        expect(school_mapping).toBeTruthy();
        expect(school_mapping.name).toEqual("Students and Schools");
        expect(school_mapping.uuid).toEqual(school_create_result.uuid);
    });

    afterAll(async () => {
        const simple_mapping_delete = await map_db.delete_mapping(simple_mapping.uuid);
        expect(simple_mapping_delete.err).toBeFalsy();

        const confirm_simple_mapping_delete = await map_db.get_mapping_by_uuid(simple_mapping.uuid);
        expect(confirm_simple_mapping_delete).toBeUndefined();

        const school_mapping_delete = await map_db.delete_mapping(school_mapping.uuid);
        expect(school_mapping_delete.err).toBeFalsy();

        const confirm_school_mapping_delete = await map_db.get_mapping_by_uuid(school_mapping.uuid);
        expect(confirm_school_mapping_delete).toBeUndefined();
    });

    test('download excel from simple subject predicate object mapping', async () => {
        const table = await applier.table_from_mapping([simple_mapping.uuid]);
        expect(table).toBeDefined();
    
        const passStream = new stream.PassThrough();        
        await table.write(passStream);
        const workbook_result = new ExcelJS.Workbook();
        await workbook_result.xlsx.read(passStream);
        
        expect(workbook_result.worksheets.length).toBe(1);
        expect(workbook_result.worksheets[0]).toBeDefined();
    
        const sheetValues = workbook_result.worksheets[0].getSheetValues();
        expect(sheetValues).toContainEqual(
            [, "<http://schools/HarvardLaw>", "<http://excql.org/relations/#name>", '"Harvard University - Harvard Law School"']
        );
        expect(sheetValues).toContainEqual(
            [, "<http://schools/Columbia>", "<http://excql.org/relations/#name>", '"Columbia University"']
        );
        expect(sheetValues).toContainEqual(
            [, "<http://schools/UCLA>", "<http://excql.org/relations/#name>", '"University of California - Los Angeles"']
        );
        expect(sheetValues).toContainEqual(
            [, "<http://students/BarackObama>", "<http://excql.org/relations/#name>", '"Barack Obama"']
        );
        expect(sheetValues).toContainEqual(
            [, "<http://students/BarackObama>", "<http://excql.org/relations/#school>", "<http://schools/HarvardLaw>"]
        );
        expect(sheetValues).toContainEqual(
            [, "<http://students/BarackObama>", "<http://excql.org/relations/#school>", "<http://schools/Columbia>"]
        );
        expect(sheetValues).toContainEqual(
            [, "<http://students/JoeBruin>", "<http://excql.org/relations/#name>", '"Joe Bruin"']
        );
        expect(sheetValues).toContainEqual(
            [, "<http://students/JoeBruin>", "<http://excql.org/relations/#school>", "<http://schools/UCLA>"]
        );
        expect(sheetValues).toContainEqual(
            [, "<http://students/TracyZhao>", "<http://excql.org/relations/#name>", '"Tracy Zhao"']
        );
        expect(sheetValues).toContainEqual(
            [, "<http://students/TracyZhao>", "<http://excql.org/relations/#school>", "<http://schools/UCLA>"]
        );
    });
    
    test('download excel from student school mapping', async () => {
        const table = await applier.table_from_mapping([school_mapping.uuid]);
        expect(table).toBeDefined();

        const passStream = new stream.PassThrough();        
        await table.write(passStream);
        const workbook_result = new ExcelJS.Workbook();
        await workbook_result.xlsx.read(passStream);
        
        expect(workbook_result.worksheets.length).toBe(1);
        expect(workbook_result.worksheets[0]).toBeDefined();
    
        const sheetValues = workbook_result.worksheets[0].getSheetValues();
        expect(sheetValues[1]).toEqual([, "Name", "SchoolName"]);
        expect(sheetValues).toContainEqual(
            [, '"Joe Bruin"', '"University of California - Los Angeles"']
        );
        expect(sheetValues).toContainEqual(
            [, '"Tracy Zhao"', '"University of California - Los Angeles"']
        );
        expect(sheetValues).toContainEqual(
            [, '"Barack Obama"', '"Harvard University - Harvard Law School"']
        );
        expect(sheetValues).toContainEqual(
            [, '"Barack Obama"', '"Columbia University"']
        );
    });

    test('upload excel student school mapping', async () => {
        const table = new ExcelTable();
        table.add_data("Students and Schools", {
            headers: ["Name", "SchoolName"],
            data: [
                {Name: '"Joe Bruin"', SchoolName: '"Harvard University - Harvard Law School"'},
                {Name: '"Tracy Zhao"', SchoolName: '"University of California - Los Angeles"'},
                {Name: '"Tracy Zhao"', SchoolName: '"Harvard University - Harvard Law School"'},
                {Name: '"Joe Bruin"', SchoolName: '"Columbia University"'},
                {Name: '"Barack Obama"', SchoolName: '"Columbia University"'}
            ]
        });
        
        const write_result = await applier.update_from_table(table, {"Students and Schools": school_mapping.uuid});
        expect(write_result[0].results).toBe(true);
        expect(write_result[0].error).toBeUndefined();

        const read_result = await fuseki.read_data(school_mapping.read_query);
        expect(read_result.error).toBeUndefined();
        expect(read_result.headers).toEqual(["Name", "SchoolName"]);
        expect(read_result.data).toContainEqual({Name: '"Joe Bruin"', SchoolName: '"Harvard University - Harvard Law School"'});
        expect(read_result.data).toContainEqual({Name: '"Tracy Zhao"', SchoolName: '"University of California - Los Angeles"'});
        expect(read_result.data).toContainEqual({Name: '"Tracy Zhao"', SchoolName: '"Harvard University - Harvard Law School"'});
        expect(read_result.data).toContainEqual({Name: '"Joe Bruin"', SchoolName: '"Columbia University"'});
        expect(read_result.data).toContainEqual({Name: '"Barack Obama"', SchoolName: '"Columbia University"'});
    });

    test('download excel with multiple sheets', async () => {
        const table = await applier.table_from_mapping([simple_mapping.uuid, school_mapping.uuid]);
        expect(table).toBeDefined();

        const passStream = new stream.PassThrough();        
        await table.write(passStream);
        const workbook_result = new ExcelJS.Workbook();
        await workbook_result.xlsx.read(passStream);
        
        expect(workbook_result.worksheets.length).toBe(2);
        expect(workbook_result.worksheets[0]).toBeDefined();
        expect(workbook_result.worksheets[1]).toBeDefined();

        const sheetValues1 = workbook_result.worksheets[0].getSheetValues();
        expect(sheetValues1).toContainEqual(
            [, "<http://schools/HarvardLaw>", "<http://excql.org/relations/#name>", '"Harvard University - Harvard Law School"']
        );
        expect(sheetValues1).toContainEqual(
            [, "<http://schools/Columbia>", "<http://excql.org/relations/#name>", '"Columbia University"']
        );
        expect(sheetValues1).toContainEqual(
            [, "<http://schools/UCLA>", "<http://excql.org/relations/#name>", '"University of California - Los Angeles"']
        );
        expect(sheetValues1).toContainEqual(
            [, "<http://students/BarackObama>", "<http://excql.org/relations/#name>", '"Barack Obama"']
        );
        expect(sheetValues1).toContainEqual(
            [, "<http://students/BarackObama>", "<http://excql.org/relations/#school>", "<http://schools/HarvardLaw>"]
        );
        expect(sheetValues1).toContainEqual(
            [, "<http://students/BarackObama>", "<http://excql.org/relations/#school>", "<http://schools/Columbia>"]
        );
        expect(sheetValues1).toContainEqual(
            [, "<http://students/JoeBruin>", "<http://excql.org/relations/#name>", '"Joe Bruin"']
        );
        expect(sheetValues1).toContainEqual(
            [, "<http://students/JoeBruin>", "<http://excql.org/relations/#school>", "<http://schools/UCLA>"]
        );
        expect(sheetValues1).toContainEqual(
            [, "<http://students/TracyZhao>", "<http://excql.org/relations/#name>", '"Tracy Zhao"']
        );
        expect(sheetValues1).toContainEqual(
            [, "<http://students/TracyZhao>", "<http://excql.org/relations/#school>", "<http://schools/UCLA>"]
        );
    
        const sheetValues2 = workbook_result.worksheets[1].getSheetValues();
        expect(sheetValues2[1]).toEqual([, "Name", "SchoolName"]);
        expect(sheetValues2).toContainEqual(
            [, '"Joe Bruin"', '"University of California - Los Angeles"']
        );
        expect(sheetValues2).toContainEqual(
            [, '"Tracy Zhao"', '"University of California - Los Angeles"']
        );
        expect(sheetValues2).toContainEqual(
            [, '"Barack Obama"', '"Harvard University - Harvard Law School"']
        );
        expect(sheetValues2).toContainEqual(
            [, '"Barack Obama"', '"Columbia University"']
        );
    });

    test('upload excel with multiple mappings', async () => {
        const table = new ExcelTable();
        table.add_data("Sheet1", {
            headers: ["subject", "predicate", "object"],
            data: [
                {subject: "<http://students/JoeBruin>", predicate: "<http://excql.org/relations/#name>", object:'"Joe Bruin"'},
                {subject: "<http://students/TracyZhao>", predicate: "<http://excql.org/relations/#name>", object:'"Tracy Zhao"'},
                {subject: "<http://students/BarackObama>", predicate: "<http://excql.org/relations/#name>", object:'"Barack Obama"'},
                {subject: "<http://schools/UCLA>", predicate: "<http://excql.org/relations/#name>", object:'"University of California - Los Angeles"'},
                {subject: "<http://schools/HarvardLaw>", predicate: "<http://excql.org/relations/#name>", object:'"Harvard University - Harvard Law School"'},
                {subject: "<http://schools/Columbia>", predicate: "<http://excql.org/relations/#name>", object:'"Columbia University"'},
                {subject: "<http://schools/Delaware>", predicate: "<http://excql.org/relations/#name>", object: '"Delaware University"'},
                {subject: "<http://students/JoeBruin>", predicate: "<http://excql.org/relations/#school>", object:"<http://schools/UCLA>"},
                {subject: "<http://students/TracyZhao>", predicate: "<http://excql.org/relations/#school>", object:"<http://schools/UCLA>"},
                {subject: "<http://students/BarackObama>", predicate: "<http://excql.org/relations/#school>", object:"<http://schools/HarvardLaw>"},
                {subject: "<http://students/BarackObama>", predicate: "<http://excql.org/relations/#school>", object:"<http://schools/Columbia>"},
            ]
        });
        table.add_data("Sheet2", {
            headers: ["Name", "SchoolName"],
            data: [
                {Name: '"Joe Bruin"', SchoolName: '"Harvard University - Harvard Law School"'},
                {Name: '"Tracy Zhao"', SchoolName: '"University of California - Los Angeles"'},
                {Name: '"Tracy Zhao"', SchoolName: '"Harvard University - Harvard Law School"'},
                {Name: '"Joe Bruin"', SchoolName: '"Columbia University"'},
                {Name: '"Barack Obama"', SchoolName: '"Columbia University"'}
            ]
        });
        
        const write_result = await applier.update_from_table(table, {"Sheet1": simple_mapping.uuid, "Sheet2": school_mapping.uuid});
        expect(write_result[0].results).toBe(true);
        expect(write_result[0].error).toBeUndefined();
        expect(write_result[1].results).toBe(true);
        expect(write_result[1].error).toBeUndefined();

        const read_result = await fuseki.read_data(school_mapping.read_query);
        expect(read_result.error).toBeUndefined();
        expect(read_result.headers).toEqual(["Name", "SchoolName"]);
        expect(read_result.data).toContainEqual({Name: '"Joe Bruin"', SchoolName: '"Harvard University - Harvard Law School"'});
        expect(read_result.data).toContainEqual({Name: '"Tracy Zhao"', SchoolName: '"University of California - Los Angeles"'});
        expect(read_result.data).toContainEqual({Name: '"Tracy Zhao"', SchoolName: '"Harvard University - Harvard Law School"'});
        expect(read_result.data).toContainEqual({Name: '"Joe Bruin"', SchoolName: '"Columbia University"'});
        expect(read_result.data).toContainEqual({Name: '"Barack Obama"', SchoolName: '"Columbia University"'});

        const read_result2 = await fuseki.read_data(simple_mapping.read_query);
        expect(read_result2.data).toContainEqual({subject: '<http://students/BarackObama>', predicate: '<http://excql.org/relations/#school>', object: "<http://schools/Columbia>"});
    });
});

