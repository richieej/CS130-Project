const { FusekiProxy } = require("../db/fuseki");
const { MappingDBProxy } = require("../db/mapping");
const { MappingApplier } = require("../src/mapping_applier");
const { ExcelTable } = require('../src/excel.js');

const stream = require('stream');
const ExcelJS = require('exceljs');
const fs = require('fs');

const applier = new MappingApplier();
const fuseki = new FusekiProxy("Main");
const map_db = new MappingDBProxy();

beforeAll(async () => {
    await map_db.connect();
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
        `, "PLACEHOLDER", "PLACEHOLDER");
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

    // TODO: do we need a delete?

    test('download excel from simple subject predicate object mapping', async () => {
        const table = await applier.table_from_mapping(simple_mapping);
        expect(table).toBeDefined();
    
        const passStream = new stream.PassThrough();        
        await table.write(passStream);
        const workbook_result = new ExcelJS.Workbook();
        await workbook_result.xlsx.read(passStream);
        
        expect(workbook_result.worksheets.length).toBe(1);
        expect(workbook_result.worksheets[0]).toBeDefined();
    
        const sheetValues = workbook_result.worksheets[0].getSheetValues();
        expect(sheetValues).toContainEqual(
            [, "http://schools/HarvardLaw", "http://excql.org/relations/#name", "Harvard University - Harvard Law School"]
        );
        expect(sheetValues).toContainEqual(
            [, "http://schools/Columbia", "http://excql.org/relations/#name", "Columbia University"]
        );
        expect(sheetValues).toContainEqual(
            [, "http://schools/UCLA", "http://excql.org/relations/#name", "University of California - Los Angeles"]
        );
        expect(sheetValues).toContainEqual(
            [, "http://students/BarackObama", "http://excql.org/relations/#name", "Barack Obama"]
        );
        expect(sheetValues).toContainEqual(
            [, "http://students/BarackObama", "http://excql.org/relations/#school", "http://schools/HarvardLaw"]
        );
        expect(sheetValues).toContainEqual(
            [, "http://students/BarackObama", "http://excql.org/relations/#school", "http://schools/Columbia"]
        );
        expect(sheetValues).toContainEqual(
            [, "http://students/JoeBruin", "http://excql.org/relations/#name", "Joe Bruin"]
        );
        expect(sheetValues).toContainEqual(
            [, "http://students/JoeBruin", "http://excql.org/relations/#school", "http://schools/UCLA"]
        );
        expect(sheetValues).toContainEqual(
            [, "http://students/TracyZhao", "http://excql.org/relations/#name", "Tracy Zhao"]
        );
        expect(sheetValues).toContainEqual(
            [, "http://students/TracyZhao", "http://excql.org/relations/#school", "http://schools/UCLA"]
        );
    });
    
    test('download excel from student school mapping', async () => {
        const table = await applier.table_from_mapping(school_mapping);
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
            [, "Joe Bruin", "University of California - Los Angeles"]
        );
        expect(sheetValues).toContainEqual(
            [, "Tracy Zhao", "University of California - Los Angeles"]
        );
        expect(sheetValues).toContainEqual(
            [, "Barack Obama", "Harvard University - Harvard Law School"]
        );
        expect(sheetValues).toContainEqual(
            [, "Barack Obama", "Columbia University"]
        );
    });

    test('upload excel student school mapping', async () => {
        const table = new ExcelTable();
        table.add_data("Students and Schools", {
            headers: ["Name", "SchoolName"],
            data: [
                {Name: "Joe Bruin", SchoolName: "Harvard University - Harvard Law School"},
                {Name: "Tracy Zhao", SchoolName: "University of California - Los Angeles"},
                {Name: "Tracy Zhao", SchoolName: "Harvard University - Harvard Law School"},
                {Name: "Joe Bruin", SchoolName: "Columbia University"},
                {Name: "Barack Obama", SchoolName: "Columbia University"}
            ]
        });
        
        const write_result = await applier.update_from_table(table, school_mapping);
        expect(write_result.results).toBe(true);
        expect(write_result.error).toBeUndefined();

        const read_result = await fuseki.read_data(school_mapping.read_query);
        expect(read_result.error).toBeUndefined();
        expect(read_result.headers).toEqual(["Name", "SchoolName"]);
        expect(read_result.data).toContainEqual({Name: "Joe Bruin", SchoolName: "Harvard University - Harvard Law School"});
        expect(read_result.data).toContainEqual({Name: "Tracy Zhao", SchoolName: "University of California - Los Angeles"});
        expect(read_result.data).toContainEqual({Name: "Tracy Zhao", SchoolName: "Harvard University - Harvard Law School"});
        expect(read_result.data).toContainEqual({Name: "Joe Bruin", SchoolName: "Columbia University"});
        expect(read_result.data).toContainEqual({Name: "Barack Obama", SchoolName: "Columbia University"});
    });
});

