const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Conversation = require('../models/Conversation')
const twilio = require('../controller/twilio')
// Multer
const multer = require('multer');
var storage = multer.diskStorage({
    destination: 'images/',
    filename: function(req, file, callback) {
      callback(null, file.originalname);
    }
  });
const upload = multer({ storage: storage})
// Axios
const axios = require('axios');
const path = require('path')

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
        // Check whether they are already connected or not
        let localConversation = await Conversation.find({participants: { $all: [ senderId,receiverId ]}});
        
        if(localConversation.length !== 0){
            return res.status(300).send({
                status: 300,
                message: "Both parties already connected!"
            })
        }

        // Create conversation
        let conversation = await twilio.createConversation()
        // Add Sender As Participant
        await twilio.addSingleParticipant(conversation.sid, senderId)
        // Add Receiver As Participant
        await twilio.addSingleParticipant(conversation.sid, receiverId)
        // Add conversation with userId attached
        // await Conversation.insertMany([
        //     {
        //         userId: senderId,
        //         sid: conversation.sid,
        //         chat_service_sid: conversation.chat_service_sid
        //     },
        //     {
        //         userId: receiverId,
        //         sid: conversation.sid,
        //         chat_service_sid: conversation.chat_service_sid
        //     }
        // ]);
        await Conversation.create({
            sid: conversation.sid,
            chatServiceSid: conversation.chatServiceSid,
            participants: [
                senderId,
                receiverId
            ]
        });

        res.json({
            status: 200,
            message: "Message room created",
            conversationId: conversation.sid
        })
        
    } catch (error) {
        console.log(error);
    }



})

router.get('/conversations', async (req,res) => {
    try {
        // let myConversations = await Conversation.find({userId: req.user.id})
        let myConversations = await Conversation.find({participants: { $all: [req.user.id]}})

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
                chatServiceSid: conversation.chatServiceSid,
                conversationSid: conversation.sid,
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
        let { conversationSid,body } = req.body;
        let message = await twilio.sendMessage(conversationSid, req.user.id, body);
        res.send(message);
    } catch (error) {
        console.log(error);
    }
})

router.post('/sendImage', upload.single('image'), async (req,res) => {
    let { sid,chatServiceSid } = req.query;

    let actualFilePath = path.join(__dirname, '../' + req.file.path)
    var config = {
        method: 'post',
        url: `https://mcs.us1.twilio.com/v1/Services/${chatServiceSid}/Media`,
        headers: { 
          'Content-Type': 'image/png'
        },
        data : require("fs").createReadStream(actualFilePath),
        auth: {
            username: "ACb0fa555b2da6ba23202f296b525274b3",
            password: "aa317ae85830ce9bbf11fe32ac30aeca"
        }
      };


    let request = await axios(config)
    let message = await twilio.sendImageMessage(sid,req.user.id,request.data.sid)

    res.send(message)
})

// const host = req.host;
// const filePath = req.protocol + "://" + host + '/' + req.file.path;

router.get('/messages', async (req, res) => {
    try {
        let { chatServiceSid,sid } = req.query;
        let message = await twilio.readMessages(sid);
        
        let simplifiedMessage = await Promise.all(message.map( async (m) => {
            let inOut = (m.author === req.user.id) ? "outgoing" : "incoming";
            
            let image = (m.media) ? await twilio.readMedia(chatServiceSid,m.media[0].sid) : null
            let type = (image == null) ? "text" : "image"

            return {
                sid: m.sid,
                inOut,
                type,
                body: m.body,
                image: (image) ? image.links.content_direct_temporary : null
            }
        }))

        res.send(simplifiedMessage.reverse())
    } catch (error) {
        console.log(error);
    }
})

module.exports = router;