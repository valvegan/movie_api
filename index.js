const express = require('express'),
  morgan = require('morgan');
const app = express();
app.use(morgan('common'));


let topMovies = [
    {
      title: 'Pulp Fiction',
      description: '',
      genre: '',
      director: '',
      URL: '', 

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
  
  // GET requests
  app.get('/movies', (req, res) => {
    res.json(topMovies);
  });
  app.get('/', (req, res) => {
    res.send('Welcome to my movie API! (myFlix app)');
  });
  //express.static
  app.use(express.static('public'));
  
  //error handling
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });
  
  // listen for requests
  app.listen(8080, () => {
    console.log('Your app is listening on port 8080.');
  });
  