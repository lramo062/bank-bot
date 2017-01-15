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

const config = require('./config.js');
var FB = require('./facebook.js')
var Bot = require('./bot.js');

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
    if (req.query['hub.verify_token'] === config.FB_PAGE_TOKEN) {
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong token');
});

// to send messages to facebook
app.post('/webhooks', function (req, res) {
  var entry = FB.getMessageEntry(req.body)
  // IS THE ENTRY A VALID MESSAGE?
  if (entry && entry.message) {
    if (entry.message.attachments) {
      // NOT SMART ENOUGH FOR ATTACHMENTS YET
      FB.newMessage(entry.sender.id, "That's interesting!")
    } else {
      // SEND TO BOT FOR PROCESSING
      Bot.read(entry.sender.id, entry.message.text, function (sender, reply) {
        FB.newMessage(sender, reply)
      })
    }
  }
    

  res.sendStatus(200)
})

// Spin up the server
app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'));
});
