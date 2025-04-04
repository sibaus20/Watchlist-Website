var express = require('express');
var router = express.Router();
var axios = require('axios');
var bcrypt = require('bcrypt');
var config = require('../config');

const {User, movieSchema} = require('../models/schemas');

const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

const jwt = require('jsonwebtoken');
const JWT_SECRET = config.JWT_KEY;
const {body, validationResult} = require('express-validator');

var curUser =null;//set upon login, reset on logout DELETE OLD GEN

router.get('/', function(req, res, next) { /* A nice home page. */
  res.send('Hey. \nWelcome to the Server');
});

//Verifies exchanged user and gives req.user for server use
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) return res.status(401).send('Access denied');

  try{
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    console.log("Authenticated user:",req.user);
    next();
  }catch (err){
    res.status(401).send('Invalid token');
  }
};
const ensureStringId = async(req, res, next) =>{
  // Convert params
  if (req.params.movieId) {
    req.params.movieId = String(req.params.movieId);
  }
  // Convert body.movie.id if present
  if (req.body?.movie?.id) {
    req.body.movie.id = String(req.body.movie.id);
  }
  
  next();
}

router.post('/login', async function(req, res, next){
  try{
    const user = await User.findOne({userName : req.body.userName});
    console.log('loginuser: ',user, 'againstthepasswrd: ',req.body.password)
      // .select('userName password admin disabled want');  Limit to Relevant info (not watched)
    if (!user) return res.status(400).send('Invalid username/password')
    const validPassword = await bcrypt.compare(req.body.password, user.password);
  console.log('validpassis ',validPassword)
    if (!validPassword) return res.status(400).send('Invalid username/password');
    if(user.disabled) return res.status(403).send('Account Disabled');  

    const token = jwt.sign(
      {
        userId: user._id,
        userName: user.userName,
        admin: user.admin,
        disabled: user.disabled,
        want: user.want,
        watched: user.watched
      },
      JWT_SECRET,
        { expiresIn: '1h'}
    );
    res.json({token});
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Server Error'});
  }
});
router.post('/logout', function(req,res,next){
  // Removing jwt token client side handles logout
});
router.post('/register', 
  [
    body('userName')
      .isLength({min: 3}).withMessage('Username must be at least 3 characters')
      .trim()
      .escape(),
    body('password')
      .isLength({min: 5}).withMessage('Password must be at least 5 characters')
  ], async function(req, res, next){
  try{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
      return res.status(400).json({errors: errors.array() })
    }

    const user = await User.findOne({userName: req.body.userName});
    if(user){
      return res.status(409).json({
        success: false,
        error: 'Username already exists',
        code: 'USERNAME_EXISTS'
      })
    }
    const newUser = await User.create({
      userName: req.body.userName,
      password: req.body.password
    })
    const token = jwt.sign(
      {
        _id: newUser._id,
        userName: newUser.userName,
        admin: newUser.admin,
        disabled: newUser.disabled,
        want: newUser.want,
        watched: newUser.watched
      },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.status(201).json({  token  })
  }catch(err){
    console.error(err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: 'Invalid username or password format',
        code: 'VALIDATION_ERROR'
      });
    }
    res.status(500).json({
      success: false,
      error: 'Server error during registration',
      code: 'SERVER_ERROR'
    });
  }
});
router.get('/users', async function(req,res,next){
  try{
    let userList = await User.find({});
    res.send(userList);
  }catch(err){
    console.log(err);
  }
});
router.patch('/users/:userId', async function (req, res, next) {
  try{
    let userId = req.params.userId;
    let newState = req.body.disabled;
    console.log("settting to state:", newState)

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: { disabled: newState } },
      { new: true }
    )

    if(!updatedUser){
      return res.status(404)({error: 'User not found'})
    }
    return res.json(updatedUser)
  }catch(error){
    res.status(500).send({error: 'Server error rewatching movie'});
  }
})



//Searches for title and returns movie list
router.get('/search/:title', async function(req, res, next){
  let title = req.params.title;
  const options = {
    method: 'GET',
    url:'https://api.themoviedb.org/3/search/movie?api_key=638e95b205871e729e3f953bb7e055b5&page=1&query='+title,
   };
  try {
    const response = await axios.request(options);

    const movies = response.data.results.map(movie => ({
      id: movie.id,
      title: movie.title,
      released: movie.release_date,
      description: movie.overview,
      posterUrl: movie.poster_path ? `${TMDB_IMAGE_BASE_URL}w154${movie.poster_path}` :  null,// w154 is thumbnail size
    
    }))
    res.json(movies);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving movies data');
  }
});
//Functions to alter movie list
router.post('/addWant', ensureStringId, authenticate, async function(req, res, next){
  try {
    var data = req.body.movie;
    var movie = {
      id: data.id,
      title: data.title,
      released: data.released,
      description: data.description,
      posterUrl: data.posterUrl ? 
        `${TMDB_IMAGE_BASE_URL}w154${data.posterUrl}` :  null,// w154 is thumbnail size
      watchDate: null
    };
    //Checks to verify movie is not already added
    const existingInWant = await User.findOne( {
      _id: req.user._id,
      'want.id': data.id
    });
    if(existingInWant){
      return res.status(409).json({
        message: 'Movie already in this list',
        code: 'EXISTS_IN_WANT'
      })
    }
    const existingInWatched = await User.findOne({
      _id: req.user._id,
      'watched.id': data.id
    });
    if(existingInWatched){
      return res.status(409).json({
        message: 'Movie already in watched list',
        code: 'EXISTS_IN_WATCHED'
      })
    }
    //Update and send user
    const updatedUser = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $push: { want: movie } },
      { new: true}
    );
    console.log("MovieaddedUSER: ",updatedUser)
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding movie to Wants');
  }
});
router.delete('/removeWant/:movieId', ensureStringId, authenticate, async ( req, res) => {
  try{
    const movieId = req.params.movieId;
    const user = req.user;

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $pull: {want: { id: movieId }}},
      { new: true }
    );

    if (!updatedUser){
      return res.status(404).send({ error: 'User not found'})
    }

    return res.json(updatedUser);
  }catch(error){
    console.log('Error removing movie from Wants');
    res.status(500).send({ error: 'Server error removing from want list'});
  }
});
router.post('/addWatched', ensureStringId, authenticate, async function(req, res, next){
  try {
    var data = req.body.movie;
    var movie = {
      id: data.id,
      title: data.title,
      released: data.released,
      description: data.description,
      posterUrl: data.posterUrl ? 
        `${TMDB_IMAGE_BASE_URL}w154${data.posterUrl}` :  null,// w154 is thumbnail size
      watchDate: new Date()
    };
    //Checks to verify movie is not already added
    const existingInWatched = await User.findOne( {
      _id: req.user._id,
      'watched.id': data.id
    });
    if(existingInWatched){
      return res.status(409).json({
        message: 'Movie already in this list',
        code: 'EXISTS_IN_WATCHED'
      })
    }
    //Update and send user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $push: { watched: movie } },
      { new: true}
    );
    res.json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error adding movie to Watched');
  }
});
router.delete('/removeWatched/:movieId', ensureStringId, authenticate, async ( req, res) => {
  try{
    console.log('REMOVING MOVEID: ',req.params.movieId)
    const movieId = req.params.movieId;
    const user = req.user;
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      { $pull: {watched: { id: movieId }}},
      { new: true }
    );
    console.log('User after removal', updatedUser)
    if (!updatedUser){
      return res.status(404).send({ error: 'User not found'})
    }

    return res.json(updatedUser);
  }catch(error){
    console.log('Error removing movie from Watched');
    res.status(500).send({ error: 'Server error removing from Watched list'});
  }
});
router.post('/rewatch/:movieId', ensureStringId, authenticate, async function(req,res,next){
  try{
    console.log('beanshit')
    const updatedUser = await User.findOneAndUpdate(
      {
        _id: req.user._id,
        'watched.id': req.params.movieId
      },
      { $set: { 'watched.$.watchDate': new Date() } },
      { new: true }
    )
    
    if(!updatedUser){
      return res.status(404).json({
        error: 'Movie not found'
      })
    }
    return res.json(updatedUser)
  }catch(error){
    res.status(500).send({error: 'Server error rewatching movie'});
  }
})


module.exports = router;