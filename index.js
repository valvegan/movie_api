const express = require('express'),
  bodyParser = require('body-parser'),
  morgan = require('morgan');
  uuid = require('uuid');
const app = express();

app.use(bodyParser.json());
app.use(morgan('common'));

//movie list
let movies = [
    {
      title: 'Pulp Fiction',
      description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
      genres: [crime, drama],
      director: 'Quentin Tarantino',
      year: 1994,
      URL: 'https://upload.wikimedia.org/wikipedia/en/3/3b/Pulp_Fiction_%281994%29_poster.jpg', 

    },
    {
      title: 'Donnie Darko',
    },
    {
      title: 'Pretty Woman',
    },
    {
      title: 'Spirited Away',
    },
    {
        title: 'Memento',
    },
    {
        title: 'Good Will Hunting',
    },
    {
        title: 'The Silence of the Lambs',
    },
    {
        title: 'Django Unchained',
    },
    {
        title: 'The Shining',
    },
    {
        title: 'Call me by your name',
    }
  ];
  
  //directors 
  let directors = [
    {
      name: 'Quentin Tarantino',
      bornDate: 'March 27, 1963',
      placeOfBirth: 'Knoxville, Tennessee, USA',
      deathYear: null,
      shortBio: 'Quentin Jerome Tarantino[2] (/ˌtærənˈtiːnoʊ/; born March 27, 1963)[3] is an American film director, screenwriter, producer, film critic, and actor. His films are characterized by nonlinear storylines, dark humor, stylized violence, extended dialogue, ensemble casts, references to popular culture, alternate history, and neo-noir.'
      }
  ];
  //genres
  let genres = [
    {
      name: 'Science fiction (scifi)',
      description: 'Science fiction (once known as scientific romance) is similar to fantasy, except stories in this genre use scientific understanding to explain the universe that it takes place in. It generally includes or is centered on the presumed effects or ramifications of computers or machines; travel through space, time or alternate universes; alien life-forms; genetic engineering; or other such things. The science or technology used may or may not be very thoroughly elaborated on.',
      subGenres: 'Cyberpunk'
    }
  ];
  
  //users
  let users = []

  // GET requests
  //get list of all movies (json)
  app.get('/movies', (req, res) => {
    res.json(movies);
  });
  //welcome page
  app.get('/', (req, res) => {
    res.send('Welcome to my movie API! (myFlix app)');
  });
  //express.static (to get the documentation file)
  app.use(express.static('public'));
  
  //get data about a single movie (by title)
  app.get('/movies/:title', (req, res) => {
    res.json(movies.find((title) =>
      { return movies.title === req.params.title }));
  });

  //get data about a genre (by genre name)
  app.get('/genres/:name', (req, res) => {
    res.json(genres.find((name) =>
      { return genres.name === req.params.name }));
  });

  //get data about a director (by name)
  app.get('/directors/:name', (req, res) => {
    res.json(directors.find((name) =>
      { return directors.name === req.params.name }));
  });
  //get requests finished

  //post and put requests
  //allow users to register
  app.post('/users/new', (req, res) => {
    let newUser = req.body;
    const fields = 'The following are required fields: "username", "email", and "favorites"'
    if (!newUser.name) {
      const message = 'Missing a username in the request body';
      res.status(400).send(fields + message);
    } if (!email){
      const message = 'Missing email in the request body';
      res.status(400).send(fields + message);
    }
    //to check : not sure if conditional for lacking "favorites" field needs to be added 
    else {
      newUser.id = uuid.v4();
      users.push(newUser);
      res.status(201).send(newUser);
    }
  });
  //update user info (username)
  app.put('/users/:username/:newusername', (req, res) => {
  let user = users.find((user) => { return user.name === req.params.username });
  if (user) {
    //replace the name with the new one
    user.name = req.params.newusername 
    res.status(201).send('User ' + req.params.username + ' was replaced with the following username: ' + req.params.newusername);
  } else {
    res.status(404).send('User ' + req.params.username + ' was not found.');
  }
});
  //add a movie to a favourite list 
app.put('/users/:username/favourites/:title', (req, res) => {
  let user = users.find((user) => { return user.name === req.params.username });
  let movie = movies.find((movie) => { return movie.title === req.params.title });
  let favorites = users.favorites
  if (movie && !favorites.includes(movie)) {
    user.favorites.push(movie);
    res.status(201).send(req.params.title + ' was added to your list of favourite movies');
  } else {
    res.status(404).send(req.params.title + ' was not found in the list of movies');
  }
});
  //remove movie from a favourite list
  app.delete('/users/:username/favourites/:title', (req, res) => {
    let user = users.find((user) => { return user.name === req.params.username });
    let movie = movies.find((movie) => { return movie.title === req.params.title });
    let favorites = users.favorites 
    if (favorites.includes(movie)) {
      //to check - remove the movie title into the list of favourites 
      user.favorites.remove(movie);
      res.status(201).send(req.params.title + ' was removed from your list of favourite movies');
    } else {
      res.status(404).send(req.params.title + ' was not found in your list of favourite movies');
    }
  });
  //post and put requests finished

  //delete requests 
  //de-register user
  app.delete('/users/:username', (req, res) => {
  let user = users.find((user) => { return user.name === req.params.username });
  if (user) {
    users = users.filter((obj) => { return obj.username !== req.params.username });
    res.status(201).send('User ' + req.params.username + ' with email ' + user.email + ' was deleted.');
  }
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
  
  
  




// Gets the GPA of a student
app.get('/students/:name/gpa', (req, res) => {
  let student = students.find((student) => { return student.name === req.params.name });

  if (student) {
    let classesGrades = Object.values(student.classes); // Object.values() filters out object's keys and keeps the values that are returned as a new array
    let sumOfGrades = 0;
    classesGrades.forEach(grade => {
      sumOfGrades = sumOfGrades + grade;
    });

    let gpa = sumOfGrades / classesGrades.length;
    console.log(sumOfGrades);
    console.log(classesGrades.length);
    console.log(gpa);
    res.status(201).send('' + gpa);
    //res.status(201).send(gpa);
  } else {
    res.status(404).send('Student with the name ' + req.params.name + ' was not found.');
  }
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080');
});