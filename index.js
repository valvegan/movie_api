const express = require('express'),
  bodyParser = require('body-parser'),
  morgan = require('morgan');
const res = require('express/lib/response');
  uuid = require('uuid');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

app.use(morgan('common'));

//mongoose
const mongoose = require('mongoose');
const Models = require('./models.js');
const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });

  // GET requests
  //welcome page
  app.get('/', (req, res) => {
    res.send('Welcome to my movie API! (myFlix app)');
  });
  //express.static (to get the documentation file)
  app.use(express.static('public'));



  //get list of all movies (json)
  app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(201).json(movies);
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });
  

  // Get all users
/*app.get('/users', (req, res) => {
  Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});*/
  
  //get data about a single movie (by title)
  app.get('/movies/:title', (req, res) => {
    Movies.findOne({Title: req.params.title})
    .then((movie) => {
      res.json(movie)
  })
  .catch((err)=>{
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
})


  //get data about a genre (by genre name)
  app.get('/movies/genre/:name', (req, res) => {
    Movies.findOne({'Genre.Name': req.params.name })
    .then((genre) => {
      res.json(genre)
  })
  .catch((err)=>{
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

  //get data about a director (by name)
  app.get('/movies/director/:name', (req, res) => {
    Movies.findOne({'Director.Name': req.params.name })
    .then((genre) => {
      res.json(genre)
  })
  .catch((err)=>{
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});
  //get requests finished


  //post and put requests
  //Add a user
/* We’ll expect JSON in this format
{
  ID: Integer,
  Username: String,
  Password: String,
  Email: String,
  Birthday: Date
}*/
app.post('/users', (req, res) => {
  Users.findOne({ username: req.body.username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.username + 'already exists');
      } else {
        Users
          .create({
            username: req.body.username,
            password: req.body.password,
            email: req.body.email,
            birthday: req.body.birthday
          })
          .then((user) =>{res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

  // Update a user's info, by username 
  /* We’ll expect JSON in this format
{
  Username: String,(required)
  Password: String,(required)
  Email: String,(required)
  Birthday: Date
}*/

app.put('/users/:Username', (req, res) => {
  Users.findOneAndUpdate({ username: req.params.username }, 
{ $set:
    {
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      birthday: req.body.birthday
    }
  },
  { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if(err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});

// Add a movie to a user's list of favorites
app.post('/users/:username/favoriteMovies/:MovieID', (req, res) => {
  Users.findOneAndUpdate({ username: req.params.username }, {
     $push: { favoriteMovies: req.params.MovieID }
   },
   { new: true }, // This line makes sure that the updated document is returned
  (err, updatedUser) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error: ' + err);
    } else {
      res.json(updatedUser);
    }
  });
});
 //post and put requests finished


  //delete requests 
  //remove movie from a favourite list
  app.delete('/users/:username/favoriteMovies/:MovieID', (req, res) => {
    Users.findOneAndUpdate({ username: req.params.username }, {
       $pull: { favoriteMovies: req.params.MovieID }
     },
     { new: true }, // This line makes sure that the updated document is returned
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  });

  // Delete a user by username
app.delete('/users/:username', (req, res) => {
  Users.findOneAndRemove({ username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.username + ' was not found');
      } else {
        res.status(200).send(req.params.username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

  //error handling
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
  
  // listen for requests
  app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });
  