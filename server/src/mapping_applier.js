const { MappingDBProxy, Mapping } = require('../db/mapping.js');
const { FusekiProxy } = require('../db/fuseki.js');
const { ExcelTable } = require('./excel.js');
// const { FUSEKI_URI } = require('../db/config.js');

class MappingApplier {
    constructor(fuseki_db = "Main") {
        this.mapDB = new MappingDBProxy();
        this.fuseki = new FusekiProxy(fuseki_db);
    }

    /**
     * Generates Excel sheets from the Fuseki knowledge base using a set of mappings
     * @param {Mapping[]} mappings list of mappings, one for each Excel sheet
     * @returns {Promise<ExcelTable>} the generated Excel table
     */
    async table_from_mapping(mappings) {
        let table = new ExcelTable();

        for (const mapping of mappings) {
            const { read_query, name } = mapping;
            const read_result = await this.fuseki.read_data(read_query);
            
            if (read_result.err) {
                throw new Error(`MappingApplier: ${read_result.err}`);
            }

            table.add_data(name, read_result);
        }
        return table;
    }

    /**
     * Updates the Fuseki database using the table data and mapping queries
     * @param {ExcelTable} table 
     * @param {Mapping[]} mappings
     * @returns {Promise<{error: any, results: boolean}[]>}
     */
    async update_from_table(table, mappings) {
        let results = [];
        const sheet_names = table.get_sheet_names();
        for (let i = 0; i < mappings.length; i++) {
            const mapping = mappings[i];
            const name = sheet_names[i];
            const { read_query } = mapping;
            const old_data = await this.fuseki.read_data(read_query);
            const new_data = table.get_data(name);
            const write_query = mapping.get_write_with_data(new_data, old_data);
            const write_result = await this.fuseki.write_data(write_query);
            results.push(write_result);
        }
        return results;
    }
}

module.exports = { MappingApplier };