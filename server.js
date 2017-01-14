/* jshint esversion: 6 */

/* 
   Creating a server for our fb-bot 
*/

'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

app.set('port', (process.env.PORT || 5000));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// Process application/json
app.use(bodyParser.json());

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a simple bank bot');
});

// // initialy for Facebook verification (webhooks)
// app.get('/webhook/', function (req, res) {
//     if (req.query['hub.verify_token'] === 'asdfjkl;') {
//         res.send(req.query['hub.challenge'])
//     }
//     res.send('Error, wrong token')
// })

app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging;
    for (let i = 0; i < messaging_events.length; i++) {
        let event = req.body.entry[0].messaging[i];
        let sender = event.sender.id;
        if (event.message && event.message.text) {
            let text = event.message.text;
            sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200));
        }
    }
    res.sendStatus(200);
});


const token = "EAADqjcqoQfUBAJO7VdIluMYBQPbVnOHs0L6t1sV8cifJr5isyNpRW9CboAyZCkIo2g7kA2CUPqVvXnvYKDoyBBiZCDm1ZAI5zyMJ2ftH9Y57okvsOA1ZCf2ZAZAYUSRTDt8P5SIqFUpjlmdKVbCnycZBS0NOPGXDBMVNczhJMavrwZDZD";


function sendTextMessage(sender, text) {
    let messageData = { text:text };
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'));
});
