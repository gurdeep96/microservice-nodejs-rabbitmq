const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const PORT = process.env.PORT || 7070
const mongoose = require('mongoose')
const { rawListeners } = require('./user')
const User = require("./user")
mongoose.connect("mongodb://localhost/auth-service",{
    useNewUrlParser : true,
    useUnifiedTopology : true
},()=>{
    console.log(`Auth-service DB connected!`)
})


app.use(express.json())

app.post("/auth/login",async(req,res)=>{
    const {email,password} = req.body
    const user = await User.findOne({email})
    if(!user){
        return res.json({message : "User doesn't exists"})
    }
    else{
        if(user.password !== password){
            return res.json({message : "Password Incorrect!"})
        }
        const payload = {
            email,
            name : user.name
        }
        jwt.sign(payload, "secret", (err,token)=>{
            if(err){
                console.log(err)
            }
            else{
                return res.json({token: token})
            }
        })
    }
})
app.post("/auth/register",async(req,res)=>{
    const {name, email, password}  = req.body;
    const userExists = await User.findOne({email})
    if(userExists){
        return res.json({message:"User already exists!"})
    }
    else{
        const newUser = new User({
            name,
            email,
            password
        })
        await newUser.save()
        return res.json(newUser)
    }
})



app.listen(PORT, ()=>{
    console.log(`Auth-service is at ${PORT}`)
})