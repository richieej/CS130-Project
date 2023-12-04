const express = require("express");

const userRoutes = express.Router();

const dbo = require("../db/conn");


// This section will help you get a list of all the users.
userRoutes.route("/users").get(function (req, res) {
  try {
    let db_connect = dbo.getDb("users");
    db_connect
      .collection("users")
      .find({})
      .toArray(function (err, result) {
        if (err) throw err;
        res.json(result);
      });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// This section will help you get a single user by id
userRoutes.route("/users/user").get(function (req, res) {
  try {
    let db_connect = dbo.getDb();
    let myquery = { email: req.query.email };
    db_connect
      .collection("users")
      .findOne(myquery, function (err, result) {
        if (err) throw err;
        res.json(result);
      });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// This section will help you create a new user.
userRoutes.route("/users/add").post(function (req, response) {
  try {
    let db_connect = dbo.getDb();
    let myobj = {
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        admin: req.body.admin,
    };
    db_connect.collection("users").insertOne(myobj, function (err, res) {
      if (err) throw err;
      response.json(res);
    });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// This section will help you update a user by id.
userRoutes.route("/users/update").post(function (req, response) {
  let db_connect = dbo.getDb();
  let myquery = { email: req.query.email };
  let newvalues = {
    $set: {
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      admin: req.body.admin
    },
  };

  try {
    db_connect
      .collection("users")
      .updateOne(myquery, newvalues, function (err, res) {
        if (err) throw err;
        console.log("1 document updated");
        response.json(res);
      });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

// This section will help you delete a user
userRoutes.route("/users").delete((req, response) => {
  try {
    let db_connect = dbo.getDb();
    let myquery = { email: req.query.email };
    db_connect.collection("users").deleteOne(myquery, function (err, obj) {
      if (err) throw err;
      console.log("1 document deleted");
      response.json(obj);
    });
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
});

module.exports = userRoutes;
