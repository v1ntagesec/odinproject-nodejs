var BookInstance = require("../models/bookinstance");
var Book = require("../models/book");

var async = require("async");
var validator = require("express-validator");

exports.bookinstance_list = (req, res, next) => {
  BookInstance.find()
    .populate("book")
    .exec(function (err, bookinstance_list) {
      if (err) return next(err);
      res.render("bookinstance_list", {
        title: "Book Instance List",
        bookinstance_list,
      });
    });
};

exports.bookinstance_detail = (req, res) => {
  BookInstance.findById(req.params.id)
    .populate("book")
    .exec(function (err, bookinstance) {
      if (err) {
        return next(err);
      }
      if (bookinstance == null) {
        var err = new Error("Book Copy Not Found");
        err.status = 404;
        return next(err);
      }
      res.render("bookinstance_detail", {
        title: "Copy: " + bookinstance.book.title,
        bookinstance,
      });
    });
};

exports.bookinstance_create_get = (req, res, next) => {
  Book.find({}, "title").exec(function (err, books) {
    if (err) return next(err);
    res.render("bookinstance_form", {
      title: "Create New Book Instance",
      book_list: books,
    });
  });
};

exports.bookinstance_create_post = [
  validator.body("book", "Book must be specified.").trim().isLength({ min: 1 }),
  validator
    .body("imprint", "Imprint must be specified.")
    .trim()
    .isLength({ min: 1 }),
  validator
    .body("due_back", "Invalid date")
    .optional({ checkFalsy: true })
    .isISO8601(),

  validator.body("book").escape(),
  validator.body("imprint").escape(),
  validator.body("status").trim().escape(),
  validator.body("due_back").toDate(),

  (req, res, next) => {
    const err = validator.validationResult(req);

    var bookinstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.boy.status,
      due_back: req.body.due_back,
    });
    if (!err.isEmpty()) {
      Book.find({}, "title").exec(function (err, books) {
        if (err) return next(err);
        res.render("bookinstance_form", {
          title: "Create New Book Instance",
          book_list: books,
        });
      });
      return;
    } else {
      bookinstance.save(function (err) {
        if (err) return next(err);
        res.redirect(bookinstance.url);
      });
    }
  },
];

exports.bookinstance_delete_get = (req, res, next) => {
  async.parallel(
    {
      bookinstance: function (callback) {
        BookInstance.findById(req.params.id).exec(callback);
      },
    },
    function (err, data) {
      if (err) return next(err);
      if (data.bookinstance == null) {
        res.redirect("/catalog/bookinstances");
      }
      res.render("bookinstance_delete", {
        title: "Delete Book Instance",
        bookinstance: data.bookinstance,
      });
    }
  );
};

exports.bookinstance_delete_post = (req, res, next) => {
  async.parallel(
    {
      bookinstance: function (callback) {
        BookInstance.findById(req.params.id).exec(callback);
      },
    },
    function (err, data) {
      if (err) return next(err);
      BookInstance.findByIdAndRemove(req.params.id, function deleteBookInstance(
        err
      ) {
        if (err) return next(err);
        res.redirect("/catalog/bookinstances");
      });
    }
  );
};
