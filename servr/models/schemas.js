const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: String,
    released: String,
    description: String,
    watchDate: Date,
    posterUrl: String,
})

const userSchema = new mongoose.Schema({
    id : String,
   userName : String,
   password : String,
   admin : Boolean,
   disabled : Boolean,
   want : [movieSchema],
   watched : [movieSchema]
})
//Allows mongoose operations on userSchema data
const User = mongoose.model('User', userSchema);

module.exports = {
    User,
    movieSchema: movieSchema,
};