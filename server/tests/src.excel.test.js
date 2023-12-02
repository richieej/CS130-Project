const ExcelJS = require('exceljs');
const { ExcelTable } = require('../src/excel.js');
const stream = require('stream');

test('Add data to table', async () => {
    const testTable = new ExcelTable();
    testTable.add_data("Schools attended", ["Student", "School"], [
        {Student: "Joe Bruin", School: "UCLA", Unknown: "N/A"},
        {School: "UCLA", Student: "Tracy Zhao"},
        ["Barack Obama", "Harvard"]
    ]);

    const workbook = new ExcelJS.Workbook();
    const pass = new stream.PassThrough();
    const fs = require('fs');
    const writeStream = fs.createWriteStream("./test.xlsx");
    testTable.write(writeStream);
    testTable.write(pass);
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