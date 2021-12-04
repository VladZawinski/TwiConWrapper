const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Conversation = require('../models/Conversation')
const twilio = require('../controller/twilio')

/**
 * Create Conversation
 * Add participants
 * Store sId with both sender and receiver ids;
 */
router.post('/connect', async (req,res) => {
    const { receiverId } = req.query;
    let senderId = req.user.id;

    if(!receiverId){
        return res.status(404).json({
            message: "Attach receiverId"
        })
    }

    try {
        // Create conversation
        let conversation = await twilio.createConversation()
        // Add Sender As Participant
        await twilio.addSingleParticipant(conversation.sid, senderId)
        // Add Receiver As Participant
        await twilio.addSingleParticipant(conversation.sid, receiverId)
        // Add conversation with userId attached
        await Conversation.insertMany([
            {
                userId: senderId,
                sid: conversation.sid
            },
            {
                userId: receiverId,
                sid: conversation.sid
            }
        ]);

        res.json({
            message: "Message room created",
            conversationId: conversation.sid
        })
        
    } catch (error) {
        console.log(error);
    }



})

router.get('/conversations', async (req,res) => {
    try {
        let myConversations = await Conversation.find({userId: req.user.id})

        let conversations = await Promise.all(myConversations.map( async (conversation) => {
            // let twiConversation = await twilio.fetchConversation(conversation.sid)
            let twiParticipants = await twilio.fetchParticipants(conversation.sid)
            let participants = await Promise.all( 
                twiParticipants.filter( (p) => { 
                    return p.identity !== req.user.id
                }).map( async (m) => {
                    return await User.findById(m.identity).select("_id name")
                })
            )
            // let participants = await Promise.all(twiParticipants.map( async (p) => {
            //     return await User.findById(p.identity).select("_id name")
            // }));
            return {
                // friendlyName: twiConversation.friendlyName,
                // participants,
                // twiConversation,
                sid: conversation.sid,
                peer: participants[0]
            }
        }))

        res.send(conversations)
    } catch (error) {
        console.log(error);
    }
})

router.post('/send', async (req, res) => {
    try {
        let { sid,body } = req.body;
        let message = await twilio.sendMessage(sid, req.user.id, body);
        res.send(message);
    } catch (error) {
        console.log(error);
    }
})

router.get('/messages', async (req, res) => {
    try {
        let { sid } = req.query;
        let message = await twilio.readMessages(sid);
        let simplifiedMessage = await Promise.all(message.map( async (m) => {
            let messageType = (m.author === req.user.id) ? "outgoing" : "incoming";
            return {
                sid: m.sid,
                type: messageType,
                body: m.body
            }
        }))

        res.send(simplifiedMessage)
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;