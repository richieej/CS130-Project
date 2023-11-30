const { MongoClient } = require("mongodb");
const { UUID } = require('bson');

const logger = require('./logger.js');
const { ATLAS_URI } = require('./config.js');

class Mapping {
    constructor(uuid, name, owner_uuid, read_query, write_query) {
        this.uuid = uuid;
        this.name = name;
        this.owner_uuid = owner_uuid;
        this.read_query = read_query;
        this.write_query = write_query;
    }

    // get uuid() { return this.uuid; }
    // get name() { return this.name; }
    // get owner_uuid() { return this.owner_uuid; }
    // get read_query() { return this.read_query; }
    // get write_query() { return this.write_query; }

    get_write_with_data(new_data, old_data) {
        const m = Math.max(new_data.data.length, old_data.data.length);
        let final_query = "";
        for (let i = 0; i < m; i++) {
            let copy_query = this.write_query.slice();
            for (let header of new_data.headers) {
                const new_val = i < new_data.data.length ? new_data.data[i][header] : undefined;
                copy_query = copy_query.replace(`<<NEW.${header}>>`, `"${ new_val !== undefined ? new_val : "" }"`);
            }
            for (let header of old_data.headers) {
                const old_val = i < old_data.data.length ? old_data.data[i][header] : undefined;
                copy_query = copy_query.replace(`<<OLD.${header}>>`, `"${ old_val !== undefined ? old_val : "" }"`);
            }
            final_query += copy_query + "\n";
        }
        return final_query;
    }
}

class MappingDBProxy {
    constructor(hostname=ATLAS_URI) {
        this.client = new MongoClient(ATLAS_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            pkFactory: { createPk: () => new UUID().toString() }
        });
        this.connected = false;
    }

    async connect() {
        this.db = await this.client.connect();
        this.mapping_db = this.db.db("mappings");
        logger.info("Connected to mapping database");
        this.connected = true;
    }

    async disconnect() {
        await this.db.close();
        this.mapping_db = undefined;
        logger.info("Disconnected from mapping database");
        this.connected = false;
    }

    get isConnected() {
        return this.connected;
    }

    /**
     * Gets all the stored mappings in the database
     * @returns list of all mappings in the database
     */
    async get_all_mappings() {
        if (!this.connected) {
            throw new Error("Not connected to the database");
        }

        let mapping_col = this.mapping_db.collection("mapping");
        let cursor = mapping_col.find({}).project({
            _id: 1,
            name: 1,
            owner_uuid: 1,
            read_query: 1,
            write_query: 1
        });
        let mappings = [];
        for await (const doc of cursor) {
            let mapping = this._mapping_doc_to_mapping(doc);
            mappings.push(mapping);
        }
        return mappings;
    }

    /**
     * Finds a mapping in the database by the given uuid
     * @param {String} uuid 
     * @returns the resulting mapping
     */
    async get_mapping_by_uuid(uuid) {
        if (!this.connected) {
            throw new Error("Not connected to the database");
        }
        let mapping_col = this.mapping_db.collection("mapping");
        let data = await mapping_col.findOne({_id : uuid }, {projection: {
            _id: 1,
            name: 1,
            owner_uuid: 1,
            read_query: 1,
            write_query: 1
        }});
        let mapping = this._mapping_doc_to_mapping(data);

        return mapping;
    }

    /**
     * Creates a new mapping in the database and returns the new mapping's UUID
     * @param {String} name 
     * @param {String} read_query 
     * @param {String} write_query 
     * @param {String} owner_uuid 
     * @returns an object result; on success result.uuid contains the new mapping's UUID, on failure, result.err contains the error value  
     */
    async create_new_mapping(name, read_query, write_query, owner_uuid) {
        if (!this.connected) {
            throw new Error("Not connected to the database");
        }

        let mapping_col = this.mapping_db.collection("mapping");
        let result = await mapping_col.insertOne({
            name: name,
            owner_uuid: owner_uuid,
            read_query: read_query,
            write_query: write_query
        });

        let result_mapping = undefined;
        let result_err = undefined;

        if (!result.acknowledged) {
            result_err = new Error("write error");
        }
        else {
            result_mapping = result.insertedId;
        }
        
        return {
            uuid: result_mapping,
            err: result_err
        }
    }

    _mapping_doc_to_mapping(doc) {
        return new Mapping(doc._id, doc.name, doc.owner_uuid, doc.read_query, doc.write_query);
    }
}

module.exports = { MappingDBProxy, Mapping };