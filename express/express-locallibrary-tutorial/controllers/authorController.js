var Author = require("../models/author");
var Book = require("../models/book");

var async = require("async");
var validator = require("express-validator");

// Display list of authors
exports.author_list = (req, res, next) => {
  Author.find()
    .populate("author")
    .sort([["family_name", "ascending"]])
    .exec(function (err, author_list) {
      if (err) return next(err);
      res.render("author_list", { title: "Author List", author_list });
    });
};

// Display details of author
exports.author_detail = (req, res, next) => {
  async.parallel(
    {
      author: function (callback) {
        Author.findById(req.params.id).exec(callback);
      },
      author_books: function (callback) {
        Book.find({ author: req.params.id }, "title summary").exec(callback);
      },
    },
    function (err, data) {
      if (err) return next(err);
      if (data.author == null) {
        var err = new Error("Author Not Found");
        err.status = 404;
        return next(err);
      }
      res.render("author_detail", {
        title: "Author Details",
        author: data.author,
        author_books: data.author_books,
      });
    }
  );
};

// Author create form on GET
exports.author_create_get = (req, res) => {
  res.render("author_form", { title: "Add New Author" });
};

// Author create on POST
exports.author_create_post = [
  validator
    .body("first_name")
    .isLength({ min: 1 })
    .trim()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters."),
  validator
    .body("family_name")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters."),
  validator
    .body("date_of_birth", "Invalid date of birth")
    .optional({ checkFalsy: true })
    .isISO8601(),
  validator
    .body("date_of_death", "Invalid date of death")
    .optional({ checkFalsy: true })
    .isISO8601(),

  validator.body("first_name").escape(),
  validator.body("family_name").escape(),
  validator.body("date_of_birth").toDate(),
  validator.body("date_of_death").toDate(),

  (req, res, next) => {
    const err = validator.validationResult(req);
    if (!err.isEmpty()) {
      res.render("author_form", {
        title: "Add New Author",
        author: req.body,
        errors: errors.array(),
      });
      return;
    } else {
      var author = new Author({
        first_name: req.body.first_name,
        family_name: req.body.family_name,
        date_of_birth: req.body.date_of_birth,
        date_of_death: req.body.date_of_death,
      });

      author.save(function (err) {
        if (err) return next(err);
        res.redirect(author.url);
      });
    }
  },
];

// Delete author on GET
exports.author_delete_get = (req, res, next) => {
  async.parallel(
    {
      author: function (callback) {
        Author.findById(req.params.id).exec(callback);
      },
      author_books: function (callback) {
        Book.find({ author: req.params.id }).exec(callback);
      },
    },
    function (err, data) {
      if (err) return next(err);
      if (data.author == null) {
        res.redirect("/catalog/authors");
      }
      res.render("author_delete", {
        title: "Delete Author",
        author: data.author,
        author_books: data.author_books,
      });
    }
  );
};

// Delete author on POST
exports.author_delete_post = (req, res, next) => {
  async.parallel(
    {
      author: function (callback) {
        Author.findById(req.body.authorid).exec(callback);
      },
      authors_books: function (callback) {
        Book.find({ author: req.body.authorid }).exec(callback);
      },
    },
    function (err, data) {
      if (err) {
        return next(err);
      }
      if (data.authors_books.length > 0) {
        res.render("author_delete", {
          title: "Delete Author",
          author: data.author,
          author_books: data.authors_books,
        });
        return;
      } else {
        Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
          if (err) return next(err);
          res.redirect("/catalog/authors");
        });
      }
    }
  );
};

// Update author on GET
exports.author_update_get = (req, res, next) => {
  async.parallel(
    {
      author: function (callback) {
        Author.findById(req.params.id).exec(callback);
      },
    },
    function (err, data) {
      if (err) return next(err);
      if (data.author == null) {
        const err = new Error("Author Not Found");
        err.status = 404;
        return next(err);
      }
      res.render("author_form", {
        title: "Update Author",
        author: data.author,
      });
    }
  );
};

// Update author on POST
exports.author_update_post = [
  validator
    .body("first_name")
    .isLength({ min: 1 })
    .trim()
    .withMessage("First name must be specified.")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters.")
    .escape(),
  validator
    .body("family_name")
    .isLength({ min: 1 })
    .trim()
    .withMessage("Family name must be specified.")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters.")
    .escape(),
  validator
    .body("date_of_birth", "Invalid date of birth")
    .optional({ checkFalsy: true })
    .isISO8601()
    .escape(),
  validator
    .body("date_of_death", "Invalid date of death")
    .optional({ checkFalsy: true })
    .isISO8601()
    .escape(),

  (req, res, next) => {
    const err = validator.validationResult(req);
    if (!err.isEmpty()) {
      res.render("author_form", {
        title: "Update Author",
        author: req.body,
        errors: errors.array(),
      });
      return;
    } else {
      Author.findByIdAndUpdate(req.params.id, {}, function (err, theauthor) {
        if (err) return next(err);
        res.redirect(theauthor.url);
      });
    }
  },
];
