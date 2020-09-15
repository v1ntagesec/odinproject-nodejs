var Author = require("../models/author");
var Book = require("../models/book");

var async = require("async");

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
  res.send("NOT IMPLEMENTED: Author create GET");
};

// Author create on POST
exports.author_create_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Author create POST");
};

// Delete author on GET
exports.author_delete_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Author delete GET");
};

// Delete author on POST
exports.author_delete_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Author delete POST");
};

// Update author on GET
exports.author_update_get = (req, res) => {
  res.send("NOT IMPLEMENTED: Author update GET");
};

// Update author on POST
exports.author_update_post = (req, res) => {
  res.send("NOT IMPLEMENTED: Author update POST");
};
