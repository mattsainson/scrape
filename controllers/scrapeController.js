var express = require("express");
var router = express.Router();

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Import the models for database functions.
var db = require("../models/index.js");

// ======

// Routes
// Route for grabbing a specific Article by id, populate it with it's note
router.get("/", function (req, res) {
  res.render("index");
});

// A GET route for scraping website (Scrape Site)
router.get("/scrape", function (req, res) {
  // First, we grab the body of the html with axios
  console.log("scraping...");
  axios.get("http://delishably.com/vegetable-dishes/corn/").then(function (response) {

    // Then, we load that into cheerio and save it to $ for a shorthand selector
    // console.log(response.data);
    var $ = cheerio.load(response.data);

    var articles = [];

    // Now, we grab the info from each item:article h2
    $(".singlehubbox").each(function (i, element) {
      // Save an empty result object
      var article = {};

      // Add the text and href of every link, and save them as properties of the result object
      article.title = $(this)
        .find("a.title")
        .text();
      article.summary = $(this)
        .find(".summary")
        .text();
      article.link = $(this)
        .find("a.title")
        .attr("href");
      article.imglink = $(this)
        .find("img")
        .attr("src");

      article.id = i;
      article.scrape = true;
      articles.push(article);

    });

    res.render("index", { articles: articles });

  });
});

// Route for getting all Articles from the db (Saved Articles)
router.get("/articles", function (req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function (dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.render("index", { articles: dbArticle });
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
router.get("/articles/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("note")
    .then(function (dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving an Article
router.post("/articles", function (req, res) {
  // Create a new article and pass the req.body to the entry
  db.Article.create(req.body)
    .then(function (dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for saving/updating an Article's associated Note
router.post("/articles/:id", function (req, res) {
  // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function (dbNote) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
    })
    .then(function (dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// router.delete("/articles/note/:id", function(req, res) {
//   var condition = "id = " + req.params.id;

//   db.Note.delete(condition)
//   .then(function(result) {
//     if (result.affectedRows == 0) {
//       // If no rows were changed, then the ID must not exist, so 404
//       return res.status(404).end();
//     } else {

// // need to update the corresponding article by removing the note id from the Notes object

//       res.status(200).end();
//     }
//   });
// });

//  ======

// Export routes for server.js to use.
module.exports = router;
