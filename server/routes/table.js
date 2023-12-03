const express = require("express");
const stream = require('stream');
const ExcelJS = require('exceljs');
const fs = require('fs');
const multer = require('multer')
const os = require('os');
const upload = multer({ dest: os.tmpdir() })

const { MappingApplier } = require("../src/mapping_applier");
const { ExcelTable } = require('../src/excel.js');
const { MappingDBProxy } = require('../db/mapping.js');


const tableRoutes = express.Router();
const applier = new MappingApplier();
const map_db = new MappingDBProxy();

map_db.connect();

//receive a mapping, return a excel table (in the form of a stream)
tableRoutes.route("/tables/download").post(async (req, res) => {
    let mappings = req.body.mappings;
<<<<<<< HEAD
    mappings = await Promise.all(mappings.map(async (uuid) => {
        return await map_db.get_mapping_by_uuid(uuid);
    }));
=======
>>>>>>> main
    let table = await applier.table_from_mapping(mappings);
    const file = await table.writeBuffer();

    fs.writeFileSync("test.xlsx", file);

    res.send(file);

    console.log("mappings:", mappings);
    console.log(file);
});

//receive a table, commit mapping
<<<<<<< HEAD
tableRoutes.route("/tables/upload", upload.single('file')).post(async (req, res) => {
    console.log("Fields", req.body)

    let table = new ExcelTable();
    let mappings = Object.values(req.body.data);
    mappings = await Promise.all(mappings.map(async (uuid) => {
        return await map_db.get_mapping_by_uuid(uuid);
    }));
=======
tableRoutes.route("/tables/upload", upload.single('file'), upload.fields([])).post(async (req, res) => {
    let table = new ExcelTable();
    let mappings = req.body.pairs;
>>>>>>> main
    await table.readBuffer(req.file.buffer);

    const write_result = await applier.update_from_table(table, mappings);
    res.json(write_result);
})

module.exports = tableRoutes;

