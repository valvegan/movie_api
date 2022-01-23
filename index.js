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
      genres: ['Crime', 'Drama'],
      director: 'Quentin Tarantino',
      year: 1994,
      URL: 'https://upload.wikimedia.org/wikipedia/en/3/3b/Pulp_Fiction_%281994%29_poster.jpg', 

    },
    {
      title: 'Donnie Darko',
      description: 'After narrowly escaping a bizarre accident, a troubled teenager is plagued by visions of a man in a large rabbit suit who manipulates him to commit a series of crimes.',
      genres: ['Drama', 'Mistery', 'Sci-fi', 'Thriller'],
      director: 'Richard Kelly',
      year: 2001,
      URL: '', 

    },
    {
      title: 'Pretty Woman',
      description: 'A man in a legal but hurtful business needs an escort for some social events, and hires a beautiful prostitute he meets... only to fall in love.',
      genres: ['Comedy', 'Romance'],
      director: 'Garry Marshall',
      year: 1990,
      URL: '', 

    },
    {
      title: 'Spirited Away',
      description: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.",
      genres: ['Animation', 'Adventure', 'Family', 'Fantasy', 'Mistery'],
      director: 'Hayao Miyazaki',
      year: 2001,
      URL: '', 

    },
    {
      title: 'Memento',
      description: "A man with short-term memory loss attempts to track down his wife's murderer.",
      genres: ['Mystery', 'Thriller'],
      director: 'Christopher Nolan',
      year: 2000,
      URL: 'https://upload.wikimedia.org/wikipedia/en/3/3b/Pulp_Fiction_%281994%29_poster.jpg', 

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
    res.json(movies.find((movie) =>
      { return movie.title === req.params.title }));
  });

  //get data about a genre (by genre name)
  app.get('/genres/:name', (req, res) => {
    res.json(genres.find((genre) =>
      { return genre.name === req.params.name }));
  });

  //get data about a director (by name)
  app.get('/directors/:name', (req, res) => {
    res.json(directors.find((director) =>
      { return director.name === req.params.name }));
  });
  //get requests finished

  //post and put requests
  //allow users to register
  app.post('/users', (req, res) => {
    let newUser = req.body;
    if (!newUser.username || !newUser.email) {
      const message = 'The following are required fields: "username", "email", and "favorites"';
      res.status(400).send(message)}
    
    //to check : not sure if conditional for lacking "favorites" field needs to be added 
    else {
      newUser.id = uuid.v4();
      users.push(newUser);
      res.status(201).send(newUser);
    }
  });
  //update user info (username)
  app.put('/users/:username', (req, res) => {
  let user = users.find((user) => { return user.username === req.params.username });
  if (user) {
    //replace the name with the new one
    user.username = req.params.newusername 
    res.status(201).send('User ' + req.params.username + ' was replaced with the following username: ' + req.params.newusername);
  } else {
    res.status(404).send('User ' + req.params.username + ' was not found.');
  }
});
  //add a movie to a favourite list 
app.put('/users/:username/favorites/:title', (req, res) => {
  let user = users.find((user) => { return user.username === req.params.username });
  let movie = movies.find((movie) => { return movie.title === req.params.title });
  let favorites = user.favorites;
  
  if (movie && !favorites.includes(movie)) {
    user.favorites.push(movie);
    res.status(201).send(req.params.title + ' was added to your list of favourite movies');
  } else {
    res.status(404).send(req.params.title + ' was not found in the list of movies');
  }
}); //post and put requests finished


  //delete requests 
  //remove movie from a favourite list
  app.delete('/users/:username/favorites/:title', (req, res) => {
    let user = users.find((user) => { return user.name === req.params.username });
    let movie = movies.find((movie) => { return movie.title === req.params.title });
    let favorites = user.favorites 
    if (favorites.includes(movie)) {
      //to check - remove the movie title into the list of favourites 
      user.favorites.remove(movie);
      res.status(201).send(req.params.title + ' was removed from your list of favourite movies');
    } else {
      res.status(404).send(req.params.title + ' was not found in your list of favourite movies');
    }
  });
  //de-register user
  app.delete('/users/:username', (req, res) => {
  let user = users.find((user) => { return user.username === req.params.username });
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
  