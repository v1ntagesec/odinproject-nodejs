var Genre = require("../models/genre");
var Book = require("../models/book");

var async = require("async");
var mongoose = require("mongoose");
var validator = require("express-validator");

exports.genre_list = (req, res, next) => {
  Genre.find()
    .populate("genre")
    .sort([["name", "ascending"]])
    .exec(function (err, genre_list) {
      if (err) return next(err);
      res.render("genre_list", { title: "Genre List", genre_list });
    });
};

exports.genre_detail = (req, res, next) => {
  var id = mongoose.Types.ObjectId(req.params.id);
  async.parallel(
    {
      genre: function (callback) {
        Genre.findById(req.params.id).exec(callback);
      },
      genre_books: function (callback) {
        Book.find({ genre: req.params.id }).exec(callback);
      },
    },
    function (err, data) {
      if (err) return next(err);
      if (data.genre == null) {
        var err = new Error("Genre not found");
        err.status = 404;
        return next(err);
      }
      res.render("genre_detail", {
        title: "Genre Detail",
        genre: data.genre,
        genre_books: data.genre_books,
      });
    }
  );
};

exports.genre_create_get = (req, res, next) => {
  res.render("genre_form", { title: "Create Genre" });
};

exports.genre_create_post = [
  validator.body("name", "Genre name required").trim().isLength({ min: 1 }),
  validator.body("name").escape(),
  (req, res, next) => {
    const err = validator.validationResult(req);
    var genre = new Genre({ name: req.body.name });

    if (!err.isEmpty()) {
      res.render("genre_form", {
        title: "Create Genre",
        genre,
        errors: err.array(),
      });
    } else {
      Genre.findOne({ name: req.body.name }).exec(function (err, found_genre) {
        if (err) return next(err);
        if (found_genre) {
          res.redirect(found_genre.url);
        } else {
          genre.save(function (err) {
            if (err) return next(err);
            res.redirect(genre.url);
          });
        }
      });
    }
  },
];
