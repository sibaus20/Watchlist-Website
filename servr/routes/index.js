var express = require('express');
var router = express.Router();
var axios = require('axios');

const {User, movieSchema} = require('../models/schemas');

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

var curUser =null;//set upon login, reset on logout

//Testing DB
async function run(){
  User.create({
    userName: 'admin',
    password: 'admin',
    admin : true
  })
  User.create({
    userName: 'userA',
    password: 'userA',
  });
  User.create({
    userName: 'userB',
    password: 'userB'
  })
}
function printMovies(){ // testing func
  console.log("PRINTNG MOVIES");
  console.log(curUser.want);
  console.log(curUser.watched);
}

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('Welcome to the Server');
});

//Searches for title and returns options
router.get('/search/:title', async function(req, res, next){
  let title = req.params.title;
  const options = {
    method: 'GET',
    url:'https://api.themoviedb.org/3/search/movie?api_key=638e95b205871e729e3f953bb7e055b5&page=1&query='+title,
   };
  try {
    const response = await axios.request(options);
    const movies = response.data.results.map(movie => ({
      title: movie.title,
      released: movie.release_date,
      description: movie.overview,
      posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}w154${movie.poster_path}` :  null,// w154 is thumbnail size
    
    }))
    res.json(movies);

  } catch (err) {
    console.log(err);
    res.status(500).send('Error retrieving movie data');
  }
});

//Adds movie to watchlist and returns the User
router.get('/addWatchlist/:title', async function(req, res, next){
  let title = req.params.title;
  const options = {
    method: 'GET',
    url:'https://api.themoviedb.org/3/search/movie?api_key=638e95b205871e729e3f953bb7e055b5&page=1&query='+title,
  };
  try {
    const response = await axios.request(options);
    var data = response.data.results[0];

    var movie = {
      title: data.title,
      released: data.release_date,
      description: data.overview,
      posterUrl: data.poster_path ? `${TMDB_IMAGE_BASE_URL}w154${data.poster_path}` :  null,// w154 is thumbnail size
      watchDate: new Date()
    };

    //If movie is in either list already do nothing.
    var dupe = false;
    curUser.want.forEach(Wmovie =>{
      if(Wmovie.title == movie.title){
        dupe = true;
      }
    });
    curUser.watched.forEach(Wmovie =>{
      if(Wmovie.title == movie.title){
        dupe = true;
      }
    })
    if(!dupe){
      curUser.want[curUser.want.length] = movie;
      res.send(curUser);
    }
  } catch (err) {
    console.log(err);
    res.status(500).send('Error adding movie data');
  }
});

router.post('/login', async function(req, res, next){
  //access mongo here to login
  try{
    curUser = await User.findOne({userName : req.body.userName});
    if(curUser.password !== req.body.password){
      return res.status(401).json({ error: 'Incorrect Password' });
    }
    if(curUser.disabled == false || curUser.disabled == undefined){
      return res.statuus(403).json({ error: 'Account Disabled' });  
    }
    let sentUser = curUser.toObject();
    delete sentUser.password;
    
    res.send(curUser);
  }catch(err){
    console.log(err)
  }
});
router.post('/logout', function(req,res,next){
  this.curUser =null;
})
router.post('/update', async function(req,res,next){
  try{
    curUser = await User.findByIdAndUpdate(req.body._id, req.body, {new :true});
    res.send(curUser);
  }catch(err){
    console.log(err);
  }
});
router.post('/rewatch/:title', async function(req,res,next){
  try{
    let user = req.body;
    user.watched.forEach(movie =>{
      if(movie.title == req.params.title){
        movie.watchDate = new Date;
      }
    });
    curUser = user;
    res.send(curUser);
  }catch(err){
    console.log(err);
  }
})
router.get('/users', async function(req,res,next){
  try{
    let userList = await User.find({});
    res.send(userList);
  }catch(err){
    console.log(err);
  }
});
router.post('/sort/:filter', async function(req,res,next){ //Sort by title or date watched
  try{
    let list = req.body.watched;
    if(req.params.filter == 'title'){
      list.sort((a, b) => {
        if (a.title < b.title) {
          return -1;
        } else if (a.title > b.title) {
          return 1;
        }
        return 0;
      });
    }else if(req.params.filter == 'date'){
      list.sort((a, b) => {
        return new Date(a.watchDate) - new Date(b.watchDate);
      });
    }
    req.body.watched = list;
    res.send(req.body);
  }catch(err){
    console.log(err);
  }
})

module.exports = router;