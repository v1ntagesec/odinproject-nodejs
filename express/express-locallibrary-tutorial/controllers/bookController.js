var Book = require("../models/book");
var Author = require("../models/author");
var BookInstance = require("../models/bookinstance");
var Genre = require("../models/genre");

var async = require("async");

exports.index = (req, res) => {
  async.parallel(
    {
      book_count: function (callback) {
        Book.countDocuments({}, callback);
      },
      book_instance_count: function (callback) {
        BookInstance.countDocuments({}, callback);
      },
      book_instance_available_count: function (callback) {
        BookInstance.countDocuments({ status: "Available" }, callback);
      },
      author_count: function (callback) {
        Author.countDocuments({}, callback);
      },
      genre_count: function (callback) {
        Genre.countDocuments({}, callback);
      },
    },
    function (err, data) {
      res.render("index", { title: "Local Library Home", error: err, data });
    }
  );
};

exports.book_list = (req, res, next) => {
  Book.find({}, "title author")
    .populate("author")
    .exec(function (err, book_list) {
      if (err) return next(err);
      res.render("book_list", { title: "Book List", book_list });
    });
};

exports.book_detail = (req, res, next) => {
  async.parallel(
    {
      book: function (callback) {
        Book.findById(req.params.id)
          .populate("author")
          .populate("genre")
          .exec(callback);
      },
      book_instance: function (callback) {
        BookInstance.find({ book: req.params.id }).exec(callback);
      },
    },
    function (err, data) {
      if (err) return next(err);
      if (data.book == null) {
        var err = new Error("Book Not Found");
        err.status = 404;
        return next(err);
      }
      res.render("book_detail", {
        title: data.book.title,
        book: data.book,
        book_instances: data.book_instance,
      });
    }
  );
};

exports.book_create_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Book create GET");
};

exports.book_create_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Book create POST");
};

exports.book_delete_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Book delete GET");
};

exports.book_delete_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Book delete POST");
};

exports.book_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Book update GET");
};

exports.book_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Book update POST");
};
