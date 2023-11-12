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
                    logger.error(`SPARQL query ended with bad status code: ${res.statusCode}`);
                    reject(new Error('Fuseki Error'));
                }
                else{
                    resolve(true);
                }
            });
        
            // reject on request error
            req.on('error', err => {
                reject(err);
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
     * @returns {Promise}
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

        return await new Promise((resolve, reject) => {
            const req = http.request(options, (res) => {
                if (res.statusCode < 200 || res.statusCode >= 300) {
                    logger.error(`SPARQL query ended with bad status code: ${res.statusCode}`);
                    reject(new Error('Fuseki Error'));
                }
                var data = [];
                res.on('data', chunk => {
                    data.push(chunk);
                });
                res.on('end', () => {
                    const query_result = JSON.parse(data[0]);
                    logger.info('Finished SPARQL query');
                    logger.debug(`Got SPARQL response: '${query_result}'`);
                    resolve(query_result);
                });
            });
        
            // reject on request error
            req.on('error', err => {
                reject(err);
            });
            if (query) {
                logger.info(`Starting SPARQL query: '${query}'`);
                req.write(query);
            }

            req.end();
        });
    }
}

module.exports = { FusekiProxy }