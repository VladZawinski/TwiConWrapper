const express = require('express');
const router = express.Router();
const User = require('../models/User')
const Conversation = require('../models/Conversation')

router.get('/users', async (req,res) => {
    try {
        let users = await User.find({"_id" : { $ne: req.user.id }}).select("_id name");
        let mappedUsers = await Promise.all( users.map( async (user) => {
            let conversation = await Conversation.find({participants: { $all: [req.user.id,user._id]}});
            
        
            console.log(`Conversation: ${conversation}`);
            if(conversation === undefined || conversation.length == 0){
                return {...user.toObject(),isAlreadyConnected: false}
            }else {
                return {...user.toObject(),isAlreadyConnected: true, conversationSId: conversation[0].sid, chatServiceSid: conversation[0].chatServiceSid }
            }
            
        }))
        res.send(mappedUsers)
    } catch (error) {
        res.send(error)
    }
})

module.exports = router;