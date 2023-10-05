const twilio = require('twilio');
const axios = require('axios');
require('dotenv').config();
const accountSid = process.env.TW_SID||''; 
const authToken = process.env.TW_AUTH || '';   
const senderNumber = process.env.TW_PHONE || ''; 

exports.sendSMSTR = async (phoneNumber, message) => {
    try {
        const apiUrl = process.env.TR_SMS_URL;
        const payload = {
            user: process.env.TR_SMS_USER,
            password: process.env.TR_SMS_PASSWORD,
            originator: process.env.TR_SMS_ORG,
            smsmessages: [
                {
                    messagetext: message,
                    recipient: phoneNumber
                }
            ]
        };

        const response = await axios.post(apiUrl, payload);
        
        if (response.data && response.data.ResponseCode === '00') {
            console.log('SMS sent successfully!');
            return response.data;
        } else {
            console.error('Error sending SMS:', response.data);
            throw new Error('Error sending SMS');
        }
    } catch (error) {
         console.error('Error in sendSMS service:', error.message || error.response.data);
        throw error;
    }
};



const client = new twilio(accountSid, authToken);

exports.sendSMST = async (to, body) => {
    try {
        const message = await client.messages.create({
            body: body,
            to: "+"+to,  
            from: senderNumber 
        });
        console.log(`Message sent: ${message.sid}`);
        return message;
    } catch (error) {
        console.error('Error sending SMS:', error.message);
        throw error; 
    }
};



