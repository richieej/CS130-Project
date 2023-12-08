const ExcelJS = require('exceljs');

// Converter from/to table to/from unified data object

class ExcelTable {
    
    /**
     * Creates an instance of ExcelTable.
     *
     * @param {ExcelJS.Workbook} workbook A new ExcelJS workbook
     */
    constructor() {
        this.workbook = new ExcelJS.Workbook();
        this.workbook.creator = "EXCQL";
        this.workbook.lastModifiedBy = "EXCQL";
    }

    
    /**
     * Write the Excel Table to the stream
     *
     * @async
     * @param {*} stream Stream object to write the table to
     */
    async write(stream) {
        await this.workbook.xlsx.write(stream);
    }

    
    /**
     * Write Excel Table to buffer
     *
     * @async
     */
    async writeBuffer() {
        return await this.workbook.xlsx.writeBuffer()
    }

    
    /**
     * Reads the stream into the Excel Table
     *
     * @async
     * @param {*} stream Stream object to write to the table
     */
    async read(stream) {
        await this.workbook.xlsx.read(stream);
    }

    
    /**
     * Read contents of buffer into the Excel Table
     *
     * @async
     * @param {*} buffer Buffer to write to the table
     */
    async readBuffer(buffer) {
        await this.workbook.xlsx.load(buffer);
    }

    
    /**
     * Reads file filename into Excel Table
     *
     * @async
     * @param {*} filename Name of file
     */
    async readFile(filename) {
        await this.workbook.xlsx.readFile(filename);
    }

    
    /**
     * add data to a worksheet in Excel Table
     *
     * @param {string} name Name of worksheet
     * @param {any} data_obj  Object containing mapping names and corresponding mappings
     */
    add_data(name, data_obj) {
        const {headers, data} = data_obj;
        const sheet = this.workbook.addWorksheet(name);
        this._add_headers_to_sheet(sheet, headers);
        sheet.addRows(data);
    }

    
    /**
     * get data in table "name"
     *
     * @param {string} name Name of worksheet
     * @returns {{ headers: string[], data: any[] }}
     */
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

    
    /**
     * returns sheet names in the Excel Table
     *
     * @returns {Array}
     */
    get_sheet_names() {
        return this.workbook.worksheets.map(sheet => sheet.name);
    }

    
    /**
     * Adds headers to a specified sheet in the Excel Table
     *
     * @param {*} sheet Excel Table worksheet
     * @param {Array} headers Array of headers that the user wants
     */
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