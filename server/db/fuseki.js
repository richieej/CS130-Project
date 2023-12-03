/*
Fuseki server API wrapper/proxy
*/
const http = require('http');

const logger = require('./logger.js');

class FusekiProxy {
    constructor(dataset_name, hostname = "localhost", port = 3030) {
        this.dataset_name = dataset_name;
        this.hostname = hostname;
        this.port = port;
    }

    async test_connection() {
        const data = await this.read_data(`
            SELECT ?subject ?predicate ?object
            WHERE {
                ?subject ?predicate ?object
            }
            LIMIT 1
        `);
        if (data)
            return true;
        return false;
    }

    /**
     * Submits a write query to the Fuseki database
     * @param {String} query 
     * @returns {Promise<{error:any, results: boolean}>}
     */
    async write_data(query) {
        const options = {
            hostname: this.hostname,
            port: this.port,
            path: `/${this.dataset_name}/update`,
            method: 'POST',
            headers: {
              'Content-Type': `application/sparql-update`
            }
        }

        return await new Promise((resolve, reject) => {
            const req = http.request(options, (res) => {
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    logger.error(`SPARQL write query ended with bad status code: ${res.statusCode}`);
                    resolve({
                        error: `Bad status code ${res.statusCode}`,
                        results: false
                    });
                }
                else{
                    resolve({
                        error: undefined,
                        results: true
                    });
                }
            });
        
            // reject on request error
            req.on('error', err => {
                resolve({
                    error: err,
                    results: false
                });
            });
            if (query) {
                logger.info(`Starting SPARQL query: '${query}'`);
                req.write(query);
            }

            req.end();
        });
    }

    /**
     * Submit a SPARQL query to the Fuseki database
     * @param {string} query 
     * @param {function(data, resolve, reject)} on_end
     * @returns {Promise<{headers:[string], data:[any], error}>}
     */
    async read_data(query) {
        const options = {
            hostname: this.hostname,
            port: this.port,
            path: `/${this.dataset_name}/query`,
            method: 'POST',
            headers: {
              'Accept': 'application/json',
              'Content-Type': `application/sparql-query`
            }
        }

        const data = await new Promise((resolve, reject) => {
            const req = http.request(options, (res) => {
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    logger.error(`SPARQL read query ended with bad status code: ${res.statusCode}`);
                    resolve({
                        error: `Bad status code: ${res.statusCode}`
                    });
                }
                else {
                    var data = [];
                    res.on('data', chunk => {
                        data.push(chunk);
                    });
                    res.on('end', () => {
                        const query_result = JSON.parse(data[0]);
                        logger.info('Finished SPARQL query');
                        logger.debug(`Got SPARQL response: '${JSON.stringify(query_result)}'`);
                        resolve(query_result);
                    });
                }
            });
        
            // reject on request error
            req.on('error', err => {
                resolve({
                    error: err
                });
            });
            if (query) {
                logger.info(`Starting SPARQL query: '${query}'`);
                req.write(query);
            }

            req.end();
        });

        const headers = data.head ? data.head.vars : [];
        const rows = data.results ? data.results.bindings : [];
        return {
            headers: headers,
            data: rows.map((row) => {
                let obj = {};
                for (let header of headers) {
                    if (row[header].type === 'uri')
                        obj[header] = `<${row[header].value}>`;
                    else if (row[header].type === 'literal')
                        obj[header] = `"${row[header].value}"`;
                    else
                        obj[header] = row[header].value;
                }
                return obj;
            }),
            error: data.error
        };
    }
}

module.exports = { FusekiProxy }