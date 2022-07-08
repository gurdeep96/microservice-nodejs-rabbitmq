const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const PORT = process.env.PORT || 8080
const mongoose = require('mongoose')
const Product = require("./product")
const amqp = require('amqplib')
const isAuthenticated = require("../isAuthenticated")

mongoose.connect("mongodb://localhost/product-service",{
    useNewUrlParser : true,
    useUnifiedTopology : true
},()=>{
    console.log(`Product-service DB connected!`)
})

app.use(express.json())

var channel,connection;

async function connect(){
    try{
        const amqpServer = "amqp://localhost:5672"
        connection = await amqp.connect(amqpServer)
        channel = await connection.createChannel();
        await channel.assertQueue("PRODUCT");
    }
    catch(e){
        console.log("RabbitMQ Error from Product !")
    }
}
connect()

app.post("/product/create",isAuthenticated,async(req,res)=>{
    const {name,description,price} = req.body;
    const newProduct = new Product({
        name,
        description,
        price
    })
    await newProduct.save()
    return res.json(newProduct)
})

app.post("/product/buy",isAuthenticated,async(req,res)=>{
    try{
        var order;
        const { ids } = req.body;
        const products = await Product.find({_id: {$in : ids}})
        channel.sendToQueue("ORDER",Buffer.from(JSON.stringify({
            products,
            userEmail : req.user.email,
            })
           )
        );
        channel.consume("PRODUCT",(data)=>{
            console.log("COnsuming Product queue")
            order = JSON.parse(data.content)
            channel.ack(data)
            console.log(order)
           
        })
        return res.json({order})
    }
    catch(e){
        console.log("error",e)
    }
})

app.listen(PORT, ()=>{
    console.log(`Product-service is at ${PORT}`)
})