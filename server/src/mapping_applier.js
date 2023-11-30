const { MappingDBProxy } = require('../db/mapping.js');
const { FusekiProxy } = require('../db/fuseki.js');
const { ExcelTable } = require('./excel.js');
// const { FUSEKI_URI } = require('../db/config.js');

class MappingApplier {
    constructor(fuseki_db = "Main") {
        this.mapDB = new MappingDBProxy();
        this.fuseki = new FusekiProxy(fuseki_db);
    }

    async table_from_mapping(mapping) {
        const { read_query, name } = mapping;
        const read_result = await this.fuseki.read_data(read_query);
        
        if (read_result.err) {
            throw new Error(`MappingApplier: ${read_result.err}`);
        }
        
        const headers = read_result.headers;
        const data = read_result.data.map((row) => {
            let obj = {};
            for (let header of headers) {
                obj[header] = row[header].value;
            }
            return obj;
        });

        let table = new ExcelTable();
        table.add_data(name, headers, data);
        return table;
    }
}

module.exports = { MappingApplier };