var Book = require("../models/book");
var Author = require("../models/author");
var BookInstance = require("../models/bookinstance");
var Genre = require("../models/genre");

var async = require("async");
var validator = require("express-validator");
const { validationResult } = require("express-validator");

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

exports.book_create_get = (req, res, next) => {
  async.parallel(
    {
      authors: function (callback) {
        Author.find(callback);
      },
      genres: function (callback) {
        Genre.find(callback);
      },
    },
    function (err, data) {
      if (err) return next(err);
      res.render("book_form", {
        title: "Add New Book",
        authors: data.authors,
        genres: data.genres,
      });
    }
  );
};

exports.book_create_post = [
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre === "undefined") req.body.genre = [];
      else req.body.genre = new Array(req.body.genre);
    }
    next();
  },

  validator
    .body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 }),
  validator
    .body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 }),
  validator
    .body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 }),
  validator.body("isbn", "ISBN must not be empty").trim().isLength({ min: 1 }),

  validator.body("*").escape(),

  (req, res, next) => {
    const errors = validator.validationResult(req);

    var book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    });

    if (!errors.isEmpty()) {
      async.parallel(
        {
          authors: function (callback) {
            Author.find(callback);
          },
          genres: function (callback) {
            Genre.find(callback);
          },
        },
        function (err, results) {
          if (err) {
            return next(err);
          }

          for (let i = 0; i < results.genres.length; i++) {
            if (book.genre.indexOf(results.genres[i]._id) > -1) {
              results.genres[i].checked = "true";
            }
          }
          res.render("book_form", {
            title: "Add New Book",
            authors: results.authors,
            genres: results.genres,
            book: book,
            errors,
          });
        }
      );
      return;
    } else {
      book.save(function (err) {
        if (err) {
          return next(err);
        }
        res.redirect(book.url);
      });
    }
  },
];

exports.book_delete_get = (req, res, next) => {
  async.parallel(
    {
      book: function (callback) {
        Book.findById(req.params.id)
          .populate("author")
          .populate("genre")
          .exec(callback);
      },
      book_bookinstances: function (callback) {
        BookInstance.find({ book: req.params.id }).exec(callback);
      },
    },
    function (err, data) {
      if (err) return next(err);
      if (data.book == null) {
        res.redirect("/catalog/books");
      }
      res.render("book_delete", {
        title: "Delete Book",
        book: data.book,
        book_instances: data.book_bookinstances,
      });
    }
  );
};

exports.book_delete_post = (req, res, next) => {
  async.parallel(
    {
      book: function (callback) {
        Book.findById(req.params.id)
          .populate("author")
          .populate("genre")
          .exec(callback);
      },
      book_bookinstance: function (callback) {
        BookInstance.find({ book: req.params.id }).exec(callback);
      },
    },
    function (err, data) {
      if (err) return next(err);
      if (data.book_instance != null && data.book_instance.length > 1) {
        res.render("book_delete", {
          title: "Delete Book",
          book: data.book,
          book_instances: data.book_bookinstance,
        });
        return;
      } else {
        Book.findByIdAndRemove(req.body.id, function deleteBook(err) {
          if (err) return next(err);
          res.redirect("/catalog/books");
        });
      }
    }
  );
};

exports.book_update_get = (req, res, next) => {
  async.parallel(
    {
      book: function (callback) {
        Book.findById(req.params.id)
          .populate("Author")
          .populate("Genre")
          .exec(callback);
      },
      authors: function (callback) {
        Author.find(callback);
      },
      genres: function (callback) {
        Genre.find(callback);
      },
    },
    function (err, data) {
      if (err) return next(err);
      if (data.book == null) {
        var err = new Error("Book Not Found");
        err.status = 404;
        return next(err);
      }

      for (var all_g_iter = 0; all_g_iter < data.genres.length; all_g_iter++) {
        for (
          var book_g_iter = 0;
          book_g_iter < data.book.genre.length;
          book_g_iter++
        ) {
          if (
            data.genres[all_g_iter]._id.toString() ==
            data.book.genre[book_g_iter]._id.toString()
          ) {
            data.genres[all_g_iter].checked = "true";
          }
        }
      }
      res.render("book_form", {
        title: "Update Book",
        authors: data.authors,
        genres: data.genres,
        book: data.book,
      });
    }
  );
};

exports.book_update_post = [
  (req, res, next) => {
    if (!(req.body.genre instanceof Array)) {
      if (typeof req.body.genre == "undefined") {
        req.body.genre = [];
      } else {
        req.body.genre = new Array(req.body.array);
      }
    }
    next();
  },

  validator
    .body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  validator
    .body("author", "Author must not empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  validator
    .body("summary", "Summary must not be empty")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  validator
    .body("isbn", "ISBN must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  validator.body("genre", "Genre must not be empty.").escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    var book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: typeof req.body.genre == "undefined" ? [] : req.body.genre,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      async.parallel(
        {
          authors: function (callback) {
            Author.find(callback);
          },
          genres: function (callback) {
            Genres.find(callback);
          },
        },
        function (err, data) {
          if (err) return next(err);

          for (let i = 0; i < data.genres.length; i++) {
            if (book.genre.indexOf(data.genres[i])._id > -1) {
              results.genres[i].checked = "true";
            }
          }
          res.render("book_form", {
            title: "Update Book",
            authors: data.authors,
            genres: data.genres,
            book,
            errors: errors.array(),
          });
        }
      );
      return;
    } else {
      Book.findByIdAndUpdate(req.params.id, book, {}, function (err, thebook) {
        if (err) return next(err);
        res.redirect(thebook.url);
      });
    }
  },
];
