const User = require('../models/User')
const jwt = require('jsonwebtoken');

module.exports = async (req,res,next) => {
    try {
        const token = req.headers["authorization"];
        let payload = jwt.verify(token,process.env.JWT_SECRET);
        
        let user = await User.findById(payload.id).select("_id name")
        
        if(user){
            req.user = user;
            next()
        }else {
            res.status(401).json({
                message: "Unauthorized"
            })
        }

    } catch (error) {
        res.status(401).json({
            message: "Unauthorized"
        })
    }
}