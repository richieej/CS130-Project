const ExcelJS = require('exceljs');

class ExcelTable {
    constructor() {
        this.workbook = new ExcelJS.Workbook();
        this.workbook.creator = "EXCQL";
        this.workbook.lastModifiedBy = "EXCQL";
    }

    write(stream) {
        this.workbook.xlsx.write(stream);
    }

    // read(stream) {
    //     this.workbook.xlsx.read(stream);
    // }

    add_data(name, headers, data) {
        const sheet = this.workbook.addWorksheet(name);
        this._add_headers_to_sheet(sheet, headers);
        sheet.addRows(data);
    }

    _add_headers_to_sheet(sheet, headers) {
        let columns = [];
        for (let header of headers) {
            columns.push({
                header: header,
                key: header,
                width: 10
            });
        }
        sheet.columns = columns;
    }
}

module.exports = { ExcelTable }