/* jshint esversion: 6 */

/* 
   Creating a server for our fb-bot 
*/

'use strict'

const fetch = require('node-fetch');
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

let Wit = null;
let log = null;
try {
  // if running from repo
  Wit = require('../').Wit;
  log = require('../').log;
} catch (e) {
  Wit = require('node-wit').Wit;
  log = require('node-wit').log;
}

const token = "EAADqjcqoQfUBAJO7VdIluMYBQPbVnOHs0L6t1sV8cifJr5isyNpRW9CboAyZCkIo2g7kA2CUPqVvXnvYKDoyBBiZCDm1ZAI5zyMJ2ftH9Y57okvsOA1ZCf2ZAZAYUSRTDt8P5SIqFUpjlmdKVbCnycZBS0NOPGXDBMVNczhJMavrwZDZD";



app.set('port', (process.env.PORT || 5000));

// Process application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// Process application/json
app.use(bodyParser.json());

// Index route
app.get('/', function (req, res) {
    res.send('Hello world, I am a simple bank bot');
});

// for Facebook verification (webhooks)
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'asdfjkl;') {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong token');
});

// app.post('/webhook/', function (req, res) {
//     let messaging_events = req.body.entry[0].messaging;
//     for (let i = 0; i < messaging_events.length; i++) {
//         let event = req.body.entry[0].messaging[i];
//         let sender = event.sender.id;
//         if (event.message && event.message.text) {
//             let text = event.message.text;
//             sendTextMessage(sender, "Text received, echo: " + text.substring(0, 200));
//         }
//     }
//     res.sendStatus(200);
// });


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


// This will contain all user sessions.
// Each session has an entry:
// sessionId -> {fbid: facebookUserId, context: sessionState}
const sessions = {};

const findOrCreateSession = (fbid) => {
  let sessionId;
  // Let's see if we already have a session for the user fbid
  Object.keys(sessions).forEach(k => {
    if (sessions[k].fbid === fbid) {
      // Yep, got it!
      sessionId = k;
    }
  });
  if (!sessionId) {
    // No session found for user fbid, let's create a new one
    sessionId = new Date().toISOString();
    sessions[sessionId] = {fbid: fbid, context: {}};
  }
  return sessionId;
};


const actions = {
  // send({sessionId}, {text}) {
  //   // Our bot has something to say!
  //   // Let's retrieve the Facebook user whose session belongs to
  //   const recipientId = sessions[sessionId].fbid;
  //   if (recipientId) {
  //     // Yay, we found our recipigent!
  //     // Let's forward our bot response to her.
  //     // We return a promise to let our bot know when we're done sending
  //     return sendTextMessage(recipientId, text)
  //     .then(() => null)
  //     .catch((err) => {
  //       console.error(
  //         'Oops! An error occurred while forwarding the response to',
  //         recipientId,
  //         ':',
  //         err.stack || err
  //       );
  //     });
  //   } else {
  //     console.error('Oops! Couldn\'t find user for session:', sessionId);
  //     // Giving the wheel back to our bot
  //     return Promise.resolve()
  //   }
  // },
  // // You should implement your custom actions here
    // // See https://wit.ai/docs/quickstart

    send({context, entites}) {
        return new Promise(function(resolve,reject) {
            context.name = "Bobby";
            return resolve(context);
        });
    },
};


// Setting up our bot
const wit = new Wit({
  accessToken: '4SEVM5UZWCD3V3QPQJ3HXJCHUFGTHGV5',
  actions,
  logger: new log.Logger(log.INFO)
});



// Message handler
app.post('/webhook', (req, res) => {
  // Parse the Messenger payload
  // See the Webhook reference
  // https://developers.facebook.com/docs/messenger-platform/webhook-reference
  const data = req.body;

  if (data.object === 'page') {
    data.entry.forEach(entry => {
      entry.messaging.forEach(event => {
        if (event.message && !event.message.is_echo) {
          // Yay! We got a new message!
          // We retrieve the Facebook user ID of the sender
          const sender = event.sender.id;

          // We retrieve the user's current session, or create one if it doesn't exist
          // This is needed for our bot to figure out the conversation history
          const sessionId = findOrCreateSession(sender);

          // We retrieve the message content
          const {text, attachments} = event.message;

          if (attachments) {
            // We received an attachment
            // Let's reply with an automatic message
            fbMessage(sender, 'Sorry I can only process text messages for now.')
            .catch(console.error);
          } else if (text) {
            // We received a text message

            // Let's forward the message to the Wit.ai Bot Engine
            // This will run all actions until our bot has nothing left to do
            wit.runActions(
              sessionId, // the user's current session
              text, // the user's message
              sessions[sessionId].context // the user's current session state
            ).then((context) => {
              // Our bot did everything it has to do.
              // Now it's waiting for further messages to proceed.
              console.log('Waiting for next user messages');

              // Based on the session state, you might want to reset the session.
              // This depends heavily on the business logic of your bot.
              // Example:
              // if (context['done']) {
              //   delete sessions[sessionId];
              // }

              // Updating the user's current session state
              sessions[sessionId].context = context;
            })
            .catch((err) => {
              console.error('Oops! Got an error from Wit: ', err.stack || err);
            })
          }
        } else {
          console.log('received event', JSON.stringify(event));
        }
      });
    });
  }
  res.sendStatus(200);
});



// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'));
});
