const ExcelJS = require('exceljs');
const { ExcelTable } = require('../src/excel.js');
const stream = require('stream');

test('Add data to table', async () => {
    const testTable = new ExcelTable();
    testTable.add_data("Schools attended", {
        headers: ["Student", "School"], 
        data: [
            {Student: "Joe Bruin", School: "UCLA", Unknown: "N/A"},
            {School: "UCLA", Student: "Tracy Zhao"},
            {Student: "Barack Obama", School: "Harvard"}
        ]
    });

    const workbook = new ExcelJS.Workbook();
    const pass = new stream.PassThrough();
    // const fs = require('fs');
    // const writeStream = fs.createWriteStream("./test.xlsx");
    // testTable.write(writeStream);
    await testTable.write(pass);
    await workbook.xlsx.read(pass);

    expect(workbook.worksheets.length).toBe(1);
    const sheet = workbook.getWorksheet("Schools attended");
    expect(sheet).toBeDefined();
    expect(sheet.getSheetValues()).toEqual([
        undefined, // TODO: find out why need undefined here
        [,"Student", "School"],
        [,"Joe Bruin", "UCLA"],
        [,"Tracy Zhao", "UCLA"],
        [,"Barack Obama", "Harvard"]
    ]);
});

test('ExcelTable is invertible', async () => {
    const testTable = new ExcelTable();
    testTable.add_data("Schools attended", {
        headers: ["Student", "School"], 
        data: [
            {Student: "Joe Bruin", School: "UCLA", Unknown: "N/A"},
            {School: "UCLA", Student: "Tracy Zhao"},
            {Student: "Barack Obama", School: "Harvard"}
        ]
    });
    testTable.add_data("School Rivalries", {
        headers: ["School A", "School B"], 
        data: [
            {"School A": "UCLA", "School B": "USC"},
            {"School A": "Harvard", "School B": "Yale"}
        ]
    });

    const pass = new stream.PassThrough();
    await testTable.write(pass);

    const newTable = new ExcelTable();
    await newTable.read(pass);

    const sheet_names = newTable.get_sheet_names();
    expect(sheet_names).toEqual(["Schools attended", "School Rivalries"]);

    const sheet1 = newTable.get_data("Schools attended");
    expect(sheet1.headers).toEqual(["Student", "School"]);
    expect(sheet1.data.length).toBe(3);
    expect(sheet1.data).toContainEqual({Student: "Joe Bruin", School: "UCLA"});
    expect(sheet1.data).toContainEqual({Student: "Tracy Zhao", School: "UCLA"});
    expect(sheet1.data).toContainEqual({Student: "Barack Obama", School: "Harvard"});

    const sheet2 = newTable.get_data("School Rivalries");
    expect(sheet2.headers).toEqual(["School A", "School B"]);
    expect(sheet2.data.length).toBe(2);
    expect(sheet2.data).toContainEqual({"School A": "UCLA", "School B": "USC"});
    expect(sheet2.data).toContainEqual({"School A": "Harvard", "School B": "Yale"});
});