const express = require("express");
const stream = require('stream');
const ExcelJS = require('exceljs');
const fs = require('fs');
const multer = require('multer');
const os = require('os');
const upload = multer({ dest: os.tmpdir() });

const { MappingApplier } = require("../src/mapping_applier");
const { ExcelTable } = require('../src/excel.js');
const { MappingDBProxy } = require('../db/mapping.js');


const tableRoutes = express.Router();
const applier = new MappingApplier();
const map_db = new MappingDBProxy();

map_db.connect();

// this section will help you download a mapping

tableRoutes.route("/tables/download").post(async (req, res) => {
    try {
        let mappings = req.body.mappings;
        let table = await applier.table_from_mapping(mappings);
        const file = await table.writeBuffer();

        fs.writeFileSync("test.xlsx", file);

        res.send(file);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

// this section will help you upload a mapping
tableRoutes.route("/tables/upload").post(upload.single('file'), async (req, res) => {
    try {
        let table = new ExcelTable();
        let mappings = JSON.parse(req.body.pairs);
        await table.readFile(req.file.path);
        
        const write_result = await applier.update_from_table(table, mappings);
        res.json(write_result);
    } catch (error) {
        console.log(error);
        res.sendStatus(500);
    }
});

module.exports = tableRoutes;

