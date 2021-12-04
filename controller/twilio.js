const twilio = require('twilio');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
let client = twilio(accountSid,authToken);

exports.createConversation = () => {
      return new Promise((resolve, reject) => {
            client.conversations.conversations
                          .create({friendlyName: 'Conversations'})
                          .then(conversation => resolve(conversation))
                          .catch(e => reject(e))
      })
}

exports.fetchConversation = (sid) => {
      return new Promise((resolve, reject) => {
            client.conversations.conversations(sid)
                          .fetch()
                          .then(conversation => resolve(conversation))
                          .catch(e => reject(e))
      });
}

exports.addSingleParticipant = (sid,participantId) => {
      return new Promise((resolve, reject) => {
            client.conversations.conversations(sid)
                          .participants
                          .create({identity: participantId})
                          .then(participant => resolve(participant))
                          .catch(e => reject(e))
      })
}

exports.fetchParticipants = (sid) => {
      return new Promise((resolve, reject) => {
            client.conversations.conversations(sid)
                        .participants
                        .list({limit: 20})
                        .then(participants => resolve(participants))
                        .catch(e => reject(e));
      });
}

exports.sendMessage = (sid, userId, body) => {
      return new Promise((resolve, reject) => {
            client.conversations.conversations(sid)
                    .messages
                    .create({author: userId, body})
                    .then(message => resolve(message))
                    .catch(e => reject(e))
      });
}

exports.readMessages = (sid) => {
      return new Promise((resolve, reject) => {
            client.conversations.conversations(sid)
                  .messages
                  .list({limit: 20})
                  .then(messages => resolve(messages))
                  .catch(e => reject(e))
      })
} 


// // Create the conversations
// client.conversations.conversations
//                     .create({friendlyName: 'My First Conversation'})
//                     .then(conversation => console.log(conversation));

// // Fetch the conversations

// client.conversations.conversations('CH109c011432bd4461872ec6f71fa4b25a')
//                     .fetch()
//                     .then(conversation => console.log(conversation));

