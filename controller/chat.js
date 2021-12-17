const twilio = require('twilio');

const AccessToken = twilio.jwt.AccessToken;
const ChatGrant = AccessToken.ChatGrant;

exports.generateChatToken = function TokenGenerator(identity) {
    return new Promise((resolve,reject) => {
        try {
            const chatGrant = new ChatGrant({
                serviceSid: process.env.PROGRAMMABLE_CHAT_SERVICE_SID
            });
    
            const token = new AccessToken(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.PROGRAMMABLE_CHAT_API_KEY,
                process.env.PROGRAMMABLE_CHAT_API_SECRET
            );
    
            token.addGrant(chatGrant);
            token.identity = identity;
    
            resolve(token.toJwt());
        } catch (error) {
            reject(error);
        }
    })
}

