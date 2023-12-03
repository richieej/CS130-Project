const ExcelJS = require('exceljs');

// Converter from/to table to/from unified data object

class ExcelTable {
    constructor() {
        this.workbook = new ExcelJS.Workbook();
        this.workbook.creator = "EXCQL";
        this.workbook.lastModifiedBy = "EXCQL";
    }

    async write(stream) {
        await this.workbook.xlsx.write(stream);
    }

    async writeBuffer() {
        return await this.workbook.xlsx.writeBuffer()
    }

    async read(stream) {
        await this.workbook.xlsx.read(stream);
    }

    add_data(name, data_obj) {
        const {headers, data} = data_obj;
        const sheet = this.workbook.addWorksheet(name);
        this._add_headers_to_sheet(sheet, headers);
        sheet.addRows(data);
    }

    get_data(name) {
        const sheet = this.workbook.getWorksheet(name);
        const headers = sheet.getRow(1).values.slice(1);
        for (let i = 0; i < headers.length; i++) {
            sheet.setColumnKey(headers[i], sheet.getColumn(i+1));
        }
        const rows = sheet.getRows(2, sheet.rowCount - 1);
        const data = [];
        for (let row of rows) {
            let obj = {}
            for (let header of headers) {
                obj[header] = row.getCell(header).value;
            }
            data.push(obj);
        }

        return {
            headers: headers,
            data: data
        };
    }

    get_sheet_names() {
        return this.workbook.worksheets.map(sheet => sheet.name);
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