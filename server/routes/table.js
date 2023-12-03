const express = require("express");
const stream = require('stream');
const ExcelJS = require('exceljs');
const fs = require('fs');
const multer = require('multer')
const upload = multer({ dest: os.tmpdir() })

const { MappingApplier } = require("../src/mapping_applier");
const { ExcelTable } = require('../src/excel.js');


const tableRoutes = express.Router();
const applier = new MappingApplier();

//receive a mapping, return a excel table (in the form of a stream)
tableRoutes.route("/tables/download").post(async (req, res) => {
    let mappings = req.body.mappings;
    let table = await applier.table_from_mapping(mappings);
    const file = await table.writeBuffer();

    res.send(file);

});

//receive a table, commit mapping
tableRoutes.route("/tables/upload", upload.single('file')).post(async (req, res) => {
    let table = new ExcelTable();
    const mappings = Object.values(req.body.data);
    await table.readBuffer(req.file.buffer);

    const write_result = await applier.update_from_table(table, mappings);
    res.json(write_result);
    
})

module.exports = tableRoutes;
