const { FusekiProxy } = require("../db/fuseki");
const { MappingDBProxy } = require("../db/mapping");
const { MappingApplier } = require("../src/mapping_applier");

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
    beforeAll(async () => {
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

    // TODO: do we need a delete?

    test('download excel from simple subject predicate object mapping', async () => {
        const create_result = await map_db.create_new_mapping("Subject Predicate Object", `
            PREFIX eql: <http://excql.org/relations/#>
            SELECT ?subject ?predicate ?object
            WHERE {
                ?subject ?predicate ?object
            }
        `, `PLACEHOLDER`, "PLACEHOLDER");
        expect(create_result.err).toBeUndefined();
        expect(create_result.uuid).toBeDefined();
    
        const mapping = await map_db.get_mapping_by_uuid(create_result.uuid);
        expect(mapping).toBeTruthy();
        expect(mapping.name).toEqual("Subject Predicate Object");
        expect(mapping.uuid).toEqual(create_result.uuid);
    
        const table = await applier.table_from_mapping(mapping);
        expect(table).toBeDefined();
    
        const passStream = new stream.PassThrough();        
        table.write(passStream);
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
    
        // expect(sheetValues).toContainEqual(
        //     [, "Joe Bruin", "University of California - Los Angeles"]
        // );
        // expect(sheetValues).toContainEqual(
        //     [, "Tracy Zhao", "University of California - Los Angeles"]
        // );
        // expect(sheetValues).toContainEqual(
        //     [, "Barack Obama", "Harvard University - Harvard Law School"]
        // );
        // expect(sheetValues).toContainEqual(
        //     [, "Barack Obama", "Columbia University"]
        // );
    });
    
    test('download excel from student school mapping', async () => {
        const create_result = await map_db.create_new_mapping("Students and Schools", `
            PREFIX eql: <http://excql.org/relations/#>
            SELECT ?Name ?SchoolName
            WHERE {
                ?student eql:school ?school.
                ?student eql:name ?Name.
                ?school eql:name ?SchoolName.
            }
        `, `PLACEHOLDER`, "PLACEHOLDER");
        expect(create_result.err).toBeUndefined();
        expect(create_result.uuid).toBeDefined();
    
        const mapping = await map_db.get_mapping_by_uuid(create_result.uuid);
        expect(mapping).toBeTruthy();
        expect(mapping.name).toEqual("Students and Schools");
        expect(mapping.uuid).toEqual(create_result.uuid);
    
        const table = await applier.table_from_mapping(mapping);
        expect(table).toBeDefined();

        const passStream = new stream.PassThrough();        
        table.write(passStream);
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
})

