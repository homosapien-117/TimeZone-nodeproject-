const express = require("express");
const session = require("express-session");
const app = express();
const bodyparser = require("body-parser");
const nocache = require("nocache");
const mongo = require("./config/connection");
const multer = require("multer");
const usrouter = require("./router/user");
const adrouter = require("./router/admin");
const path = require("path");

app.use(
  session({
    secret: "your-secret-key",
    resave: false,
    saveUninitialized: true,
  })
);

//static
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(bodyparser.urlencoded({ extended: true }));
app.set("public", path.join(__dirname, "public/user_assets"));

//view engine
app.set("view engine", "ejs");

app.use(express.json());
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use(nocache());

//uploads
app.use("/uploads", express.static("uploads"));

mongo.connect();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname + ".png");
  },
});

const upload = multer({ storage: storage });

app.post("/your-upload-route", upload.array("files"), (req, res) => {
  console.log(req.files);
});

app.use("/", usrouter);
app.use("/admin", adrouter);

//port
app.listen(4000, () => {
  console.log("http://localhost:4000");
});
