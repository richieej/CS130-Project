const express = require("express");
 
const userRoutes = express.Router();
 
const dbo = require("../db/conn");
 
// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;
 
 
// This section will help you get a list of all the users.
userRoutes.route("/user").get(function (req, res) {
 let db_connect = dbo.getDb("users");
 db_connect
   .collection("users")
   .find({})
   .toArray(function (err, result) {
     if (err) throw err;
     res.json(result);
   });
});
 
// This section will help you get a single user by id
userRoutes.route("/user/:id").get(function (req, res) {
 let db_connect = dbo.getDb();
 let myquery = { _id: ObjectId(req.params.id) };
 db_connect
   .collection("users")
   .findOne(myquery, function (err, result) {
     if (err) throw err;
     res.json(result);
   });
});
 
// This section will help you create a new user.
userRoutes.route("/user/add").post(function (req, response) {
 let db_connect = dbo.getDb();
 let myobj = {
    id: req.body.id,
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    admin: false
 };
 db_connect.collection("users").insertOne(myobj, function (err, res) {
   if (err) throw err;
   response.json(res);
 });
});
 
// This section will help you update a user by id.
userRoutes.route("/update/:id").post(function (req, response) {
 let db_connect = dbo.getDb();
 let myquery = { _id: ObjectId(req.params.id) };
 let newvalues = {
   $set: {
    id: req.body.id,
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    admin: req.body.admin_status
   },
 };
 db_connect
   .collection("users")
   .updateOne(myquery, newvalues, function (err, res) {
     if (err) throw err;
     console.log("1 document updated");
     response.json(res);
   });
});
 
// This section will help you delete a user
userRoutes.route("/:id").delete((req, response) => {
 let db_connect = dbo.getDb();
 let myquery = { _id: ObjectId(req.params.id) };
 db_connect.collection("users").deleteOne(myquery, function (err, obj) {
   if (err) throw err;
   console.log("1 document deleted");
   response.json(obj);
 });
});
 
module.exports = userRoutes;