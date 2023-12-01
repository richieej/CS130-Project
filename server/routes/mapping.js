const express = require("express");

const mappingRoutes = express.Router();

const { MappingDBProxy } = require('../db/mapping.js');

const mapDB = new MappingDBProxy();

// This section will help you get a list of all the mappings.
mappingRoutes.route("/mappings").get(async function (req, res) {
  if (!mapDB.isConnected) {
    await mapDB.connect();
  }

  const mappings = await mapDB.get_all_mappings();
  console.log(mappings);
  res.json(mappings);
});

// This section will help you get a single mapping by id
mappingRoutes.route("/mappings/mapping").get(async function (req, res) {
  if (!mapDB.isConnected) {
    await mapDB.connect();
  }

  const uuid = req.query.uuid;
  const mapping = await mapDB.get_mapping_by_uuid(uuid);
  console.log(mapping);
  res.json(mapping);
});

// This section will help you create a new mapping.
mappingRoutes.route("/mappings/add").post(async function (req, response) {
  if (!mapDB.isConnected) {
    await mapDB.connect();
  }

  const { name, owner_uuid, read_query, write_query } = req.body;
  const res = await mapDB.create_new_mapping(name, read_query, write_query, owner_uuid);

  if (res.error)
    throw res.error;
  console.log(res.uuid);
  response.json(res.uuid);

});

module.exports = mappingRoutes;
