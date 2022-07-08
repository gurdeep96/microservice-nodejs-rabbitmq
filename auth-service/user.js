const mongoose = require('mongoose')
const userSchema =mongoose.Schema({
    name : String,
    email : {
        type :String,
        required : true,
        unique: true,
    },
    password : String,
    created_at : {
        type :Date,
        default : Date.now(),
    }
})
const User = mongoose.model("user",userSchema)
module.exports = User