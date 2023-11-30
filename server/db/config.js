require("dotenv").config({ path: "./config.env" });

module.exports = {
    ATLAS_URI: process.env.ATLAS_URI,
};