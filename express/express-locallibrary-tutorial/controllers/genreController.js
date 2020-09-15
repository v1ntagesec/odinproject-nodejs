var Genre = require("../models/genre");
var Book = require("../models/book");

var async = require("async");
var mongoose = require("mongoose");

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

exports.genre_create_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre create GET");
};

exports.genre_create_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre create POST");
};

exports.genre_delete_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre delete GET");
};

exports.genre_delete_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre delete POST");
};

exports.genre_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre update GET");
};

exports.genre_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Genre update POST");
};
