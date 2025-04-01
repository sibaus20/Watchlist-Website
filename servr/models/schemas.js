const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const movieSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    released: String,
    description: String,
    watchDate: Date,
    posterUrl: String,
})

const userSchema = new mongoose.Schema({
   userName : {
    type: String,
    required: true,
    unique: true,
   },
   password : {
    type: String,
    required: true
   },
   admin : {
    type: Boolean,
    default: false
   },
   disabled : {
    type: Boolean,
    default: false
   },
   want : {
    type: [movieSchema],
    default: [] 
   },
   watched : {
    type: [movieSchema],
    default: []
   }
})

userSchema.pre('save', async function(next) {
    if(this.isModified('password')){
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } 
    next();   
});

userSchema.index({ userName: 1});

//Allows mongoose operations on userSchema data
const User = mongoose.model('User', userSchema);

module.exports = {
    User,
    movieSchema: movieSchema,
};