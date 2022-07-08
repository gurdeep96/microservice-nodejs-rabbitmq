const mongoose = require('mongoose')
const orderSchema =mongoose.Schema({
    products : [
        {
            product_id : String
        }
    ],
    user : String,
    total : Number,
    created_at : {
        type: Date,
        default : Date.now()
    }
})
const Order = mongoose.model("order",orderSchema)
module.exports = Order