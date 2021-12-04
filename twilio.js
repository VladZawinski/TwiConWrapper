const twilio = require('twilio');
require("dotenv").config()
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
let client = twilio(accountSid,authToken);


// // Create the conversations
// client.conversations.conversations
//                     .create({friendlyName: 'My First Conversation'})
//                     .then(conversation => console.log(conversation));

// // Fetch the conversations

// client.conversations.conversations('CH109c011432bd4461872ec6f71fa4b25a')
//                     .fetch()
//                     .then(conversation => console.log(conversation));


// Read multiple conversation
client.conversations.conversations
      .list({limit: 20})
      .then(conversations => conversations.forEach(c => console.log(c)));