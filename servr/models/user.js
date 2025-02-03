const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    title: String,
    released: String,
    description: String,
    watchDate: Date,
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

module.exports = mongoose.model('User',userSchema)