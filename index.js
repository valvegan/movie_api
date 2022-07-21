//load express (framework)
const express = require("express"),
  //import bodyparser
  bodyParser = require("body-parser"),
  //import morgan
  morgan = require("morgan");

//mongoose, models.js
const mongoose = require("mongoose");
const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;

// Require passport module & import passport.js file
const passport = require("passport");
require("./passport");

const { check, validationResult } = require("express-validator");

const res = require("express/lib/response");
const app = express();

const port = process.env.PORT || 8080;

const cors = require("cors");
//allow requests from all domains
app.use(cors());

//bodyparser to parse http body requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/*let allowedOrigins = ['http://localhost:8080', 
'https://my-flix-api-2022.herokuapp.com/', 
'https://valentina-my-flix-client.netlify.app/', 
];*/

//Cross-Origin Resource Sharing
app.use(
  cors({
    origin: "*",

    /*(origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }*/
  })
);

//import auth.js
let auth = require("./auth")(app);

/**
 * logging with morgan
 */
app.use(morgan("common"));

/**
 * connecting to mongoDB Atlast
 */
mongoose.connect(process.env.CONNECTION_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

/*
 * Start of Enpoints
 */

/**
 * GET: welcome page
 * @returns welcome text
 * @requires express
 */
app.get("/", (req, res) => {
  res.send("Welcome to my movie API! (myFlix app)");
});
//express.static (to get the documentation file)
app.use(express.static("public"));

/**
 * GET: list of ALL movies
 * Request body: Bearer token
 * @returns array of movie objects
 * @requires passport
 */
app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    Movies.find()
      .then(function (movies) {
        res.status(201).json(movies);
      })
      .catch(function (error) {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

/**
 * GET: data about a single movie, by title
 * Request body: Bearer token
 * @param title
 * @returns movie object
 * @requires passport
 */
//get data about a single movie (by title)
app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ Title: req.params.title })
      .then((movie) => {
        res.json(movie);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * GET: data about a genre by name
 * Request body: Bearer token
 * @param name
 * @returns genre object
 * @requires passport
 */
app.get(
  "/genres/:name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.name })
      .then((movie) => {
        res.json(movie.Genre);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * GET: data about a director by name
 * Request body: Bearer token
 * @param name
 * @returns director object
 * @requires passport
 */
app.get(
  "/directors/:name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.findOne({ "Director.Name": req.params.name })
      .then((movie) => {
        res.json(movie.Director);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * GET: data on a single user by username
 * Request body: Bearer token
 * @param username
 * @returns user object
 * @requires passport
 */
app.get(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ username: req.params.username })
      .then((user) => {
        res.json(user);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * GET: all users
 * Request body: Bearer token
 * @returns array of users
 * @requires passport
 */
app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.find()
      .then((users) => {
        res.status(201).json(users);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * GET: a user's favorite movies
 * Request body: Bearer token
 * @param username
 * @returns array of favorite movies (id's)
 * @requires passport
 */
app.get(
  "/users/:username/favoriteMovies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOne({ username: req.params.username })
      .then((user) => {
        if (user) {
          res.status(201).json(user.favoriteMovies);
        } else {
          res
            .status(400)
            .send("Could not find any favorite movies for this user!");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * get requests finished
 */

/**
 * post and put requests
 */
/**
 * POST: user registration
 * Request body: Bearer token, JSON with user info (username, password, email address, and optional birthday)
 * @returns user object
 */
app.post(
  "/users",
  //you can either use a chain of methods like .not().isEmpty()
  //which means "opposite of isEmpty" in plain english "is not empty"
  //or use .isLength({min: 5}) which means minimum value of 5 characters are only allowed
  [
    check("username", "Username is required").isLength({ min: 3 }),
    check(
      "username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("password", "Password is required").not().isEmpty(),
    check("email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.password);
    Users.findOne({ username: req.body.username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.username + "already exists");
        } else {
          Users.create({
            username: req.body.username,
            password: hashedPassword,
            email: req.body.email,
            birthday: req.body.birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((error) => {
              console.error(error);
              res.status(500).send("Error: " + error);
            });
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send("Error: " + error);
      });
  }
);

/**
 * POST: Add a movie to a user's list of favorite
 * Request body: Bearer token
 * @param username
 * @param movieID
 * @returns user object
 * @requires passport
 */
app.post(
  "/users/:username/favoriteMovies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { username: req.params.username },
      {
        $push: { favoriteMovies: req.params.MovieID },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/**
 * Put requests
 */
/**
 * PUT: update profile information
 * Request body: Bearer token, JSON body with new information for the user
 * @param username
 * @returns user object with updates
 * @requires passport
 */
/* We’ll expect JSON in this format
{
  Username: String,(required)
  Password: String,(required)
  Email: String,(required)
  Birthday: Date
}*/
app.put(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { username: req.params.username },
      {
        $set: {
          username: req.body.username,
          password: req.body.password,
          email: req.body.email,
          birthday: req.body.birthday,
        },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/**
 * delete requests
 */

/**
 * DELETE: remove movie from a favourite list
 * Request body: Bearer token
 * @param username
 * @param movieID
 * @returns user object
 * @requires passport
 */
app.delete(
  "/users/:username/favoriteMovies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { username: req.params.username },
      {
        $pull: { favoriteMovies: req.params.MovieID },
      },
      { new: true }, // This line makes sure that the updated document is returned
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send("Error: " + err);
        } else {
          res.json(updatedUser);
        }
      }
    );
  }
);

/**
 * DELETE: Delete a user by username (deregister)
 * Request body: Bearer token
 * @param username
 * @returns success message
 * @requires passport
 */
app.delete(
  "/users/:username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ username: req.params.username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.username + " was not found");
        } else {
          res.status(200).send(req.params.username + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

/**
 * end of endpoints
 */

/**
 * error handling
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

/**
 * listen for requests
 */
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
