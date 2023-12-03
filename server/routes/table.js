const express = require("express");
const stream = require('stream');
const ExcelJS = require('exceljs');
const fs = require('fs');

const { MappingApplier } = require("../src/mapping_applier");
const { ExcelTable } = require('../src/excel.js');


const tableRoutes = express.Router();
const applier = new MappingApplier();


//const dbo = require("../db/conn");

//receive a mapping, return a excel table (in the form of a stream)
tableRoutes.route("/tables/download").post(async (req, res) => {
    let mappings = req.body.mappings;
    let resp, err = await applier.table_from_mapping(mappings);
    if (resp) {
        if (err) {
            console.log(err);
        }
        res.sendStatus(200) // success
    } else {
        if (err) {
            console.log(err);
        }
        res.sendStatus(400); // failed
    }
    
});

//receive a table, commit mapping
tableRoutes.route("/tables/upload").post(async (req, res) => {
    let table = new ExcelTable();
    const dropdownPairs = req.body.data;
    const mappings = Object.values(dropdownPairs);
    const stream = req.body.stream;
    await table.read(stream);

    const write_result = await applier.update_from_table(table, mappings);
    res.json(write_result);
  
})

module.exports = tableRoutes;

