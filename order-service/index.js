const express = require('express')
const app = express()
const jwt = require('jsonwebtoken')
const PORT = process.env.PORT || 9090
const mongoose = require('mongoose')
const Order = require("./order")
const amqp = require('amqplib')
const isAuthenticated = require("../isAuthenticated")

mongoose.connect("mongodb://localhost/order-service",{
    useNewUrlParser : true,
    useUnifiedTopology : true
},()=>{
    console.log(`Order-service DB connected!`)
})

app.use(express.json())

var channel,connection;

function createOrder(products, userEmail){
    let total = 0;
    for(let t=0;t<products.length;++t){
        total = total + products[t].price
    }
    const newOrder = new Order({
        products,
        user:userEmail,
        total
    })
    newOrder.save()
    return newOrder
}

async function connect(){
    try{
        const amqpServer = "amqp://localhost:5672"
        connection = await amqp.connect(amqpServer)
        channel = await connection.createChannel();
        await channel.assertQueue("ORDER");
    }
    catch(e){
        console.log("RabbitMQ Error from Order !")
    }
}
connect().then(()=>{
        channel.consume("ORDER",(data)=>{
        console.log("Consuming ORDER queue : \n")
        const {products, userEmail} = JSON.parse(data.content)
        const newOrder = createOrder(products, userEmail)
        channel.ack(data)
        channel.sendToQueue("PRODUCT",Buffer.from(JSON.stringify({newOrder})))
        console.log({newOrder})
        
    })
})



app.listen(PORT, ()=>{
    console.log(`Order-service is at ${PORT}`)
})