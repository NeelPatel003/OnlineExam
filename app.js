const express = require("express");
const app = express();
const http = require("http");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
// fs module, by default module for file management in nodejs
const fs = require("fs");
const config = require("./config/config.js");

const MongoClient = require("mongodb").MongoClient;
// replace the uri string with your connection string.
const uri =
  "mongodb+srv://dbUser:dbUser@cluster0.grzp1.mongodb.net/examGround?retryWrites=true&w=majority";
MongoClient.connect(uri, function (err, client) {
  if (err) {
    console.log("Error occurred while connecting to MongoDB Atlas...\n", err);
  }
  console.log("Connected...yeh");

  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});

//const PORT = process.env.PORT || 5000;

//app.set("port", process.env.PORT || 3000);
/*app.use(cors({
  'allowedHeaders': ['sessionId', 'Content-Type'],
  'exposedHeaders': ['sessionId'],
  'origin': '*',
  'methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
  'preflightContinue': false
}));*/
/*app.options('*', function(req, res, next){
    res.end();
})
*/
//set the view folder for static files
app.use(express.static(path.join(__dirname, "/public")));
//body-parser middleware
app.use(bodyParser.json({ limit: "10mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));
//session middleware
// initialization of session middleware
//app.options('*', cors());
//enables cors
// mongoose.connect(config.db);
// const db = mongoose.connection;
// console.log("DBBB", db.on);
// db.on("connected", () => {
//   console.log("Conneted to db..--------------------");
// });

//Passport
app.use(passport.initialize());
app.use(passport.session());
app.use(
  session({
    name: "myCustomCookie",
    secret: "myAppSecret", // encryption key
    resave: true,
    httpOnly: true,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);
require("./config/google-auth")(passport);
require("./config/facebook-auth")(passport);
// include all our model files
fs.readdirSync("./app/models").forEach(function (file) {
  // check if the file is js or not
  if (file.indexOf(".js"))
    // if it is js then include the file from that folder into our express app using require
    require("./app/models/" + file);
}); // end for each
// include controllers
fs.readdirSync("./app/controllers").forEach(function (file) {
  if (file.indexOf(".js")) {
    // include a file as a route constiable
    const route = require("./app/controllers/" + file);
    //call controller function of each file and pass your app instance to it
    route.controller(app);
  }
});
app.use(function (req, res) {
  res.sendFile("index.html", { root: __dirname + "/public" });
});
//router to handle any other page request
app
  .route("*")
  .get((req, res, next) => {
    res.statusCode = 404;
    next("Path not found");
  })
  .post((req, res, next) => {
    res.statusCode = 404;
    next("Path not found");
  });
//end for each
//using the setLoggedInuser middleware as an application level middleware
//so that it processes every request before responding
//  middleware to set request user(set new values to the session variable if any changes are made) and check which user is logged in
//check if the user is a legitimate user
//application level middleware for error handling of other page request
app.use((err, req, res, next) => {
  console.log("this is error handling middleware");
  if (res.statusCode == 404) {
    const myResponse = responseGenerator.generate(
      true,
      "Page Not Found,Go Back To HomePage",
      404,
      null
    );
    res.render("error", {
      message: myResponse.message,
      status: myResponse.status,
    });
  } else {
    console.log(err);
    res.send(err);
  }
});
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: err,
  });
});

let PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Listening on ${PORT}`));
// const server = http.createServer(app);
// server.listen(app.get("port"), (req, res) => {
//   console.log("App listening to port" + app.get("port"));
// });
