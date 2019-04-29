var express = require("express");
var exphbs = require("express-handlebars");
// var logger = require("morgan");
var mongoose = require("mongoose");
require("path");

// Require all models
var db = require("./models");

var PORT = 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
// app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// If deployed, use the deployed database. Otherwise use the local scrape database , { useNewUrlParser: true }
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/scrape";
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

// Set Handlebars
app.engine("handlebars", exphbs({ 
  extname: "handlebars",
  defaultLayout: "main",
  layoutsDir: __dirname + "/views/layouts/",
  partialsDir: __dirname + "/views/partials/"
 }));
app.set("view engine", "handlebars");

// Import routes and give the server access to them.
var routes = require("./controllers/scrapeController.js");
app.use(routes);

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
