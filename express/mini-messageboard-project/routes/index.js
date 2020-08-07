var express = require("express");
var router = express.Router();

const message = [
  {
    text: "Hello there!",
    user: "Obi Wan",
    added: new Date().toDateString(),
  },
  {
    text: "General Kenobi",
    user: "Grievous",
    added: new Date().toDateString(),
  },
];

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Star Wars Message Board", message });
});

/* GET new message form */
router.get("/new", function (req, res, next) {
  res.render("form", { title: "Create new message" });
});

/* POST new message */
router.post("/new", function (req, res, next) {
  message.push({
    text: req.body.message,
    user: req.body.user,
    added: new Date().toDateString(),
  });
  res.redirect("/");
});

module.exports = router;
