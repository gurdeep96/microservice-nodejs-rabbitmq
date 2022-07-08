const jwt = require('jsonwebtoken')
const isAuthenticated =async (req,res,next)=>{
    try{
        const token = req.headers["authorization"].split(" ")[1];

        const user = jwt.verify(token,"secret")
        //const user = await User.findOne({_id : decoder._id})
        if(!user){
            throw new Error()
        }
        
        //req.token = token
        req.user = user
        next()
    }
    catch(e){
        res.status(401).send({error : 'Please Authenticate!'})
    }
}
module.exports = isAuthenticated