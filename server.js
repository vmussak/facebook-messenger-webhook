'use strict';

const
  express = require('express'),
  bodyParser = require('body-parser'),
  fs = require('fs'),
  app = express().use(bodyParser.json());

app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

app.get('/ping', (req, res) => {
  res.status(200).json({tudo: 'certo :)'});
})

app.get('politica-privacidade', (req, res) => {
  let html = fs.readFileSync('./politica-privacidade.html');

  res.writeHeader(200, {"Content-Type": "text/html"});  
  res.write(html);  
  res.end();  
})

app.post('/webhook', (req, res) => {

  let body = req.body;

  if (body.object === 'page') {

    body.entry.forEach(function (entry) {
      let webhook_event = entry.messaging[0];
      console.log(webhook_event);
    });

    let sender_psid = webhook_event.sender.id;
    console.log('Sender PSID: ' + sender_psid);

    if (webhook_event.message) {
      handleMessage(sender_psid, webhook_event.message);
    } 

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }

});

app.get('/webhook', (req, res) => {

  let VERIFY_TOKEN = process.env.VERIFY_TOKEN || "ARVOROS_TOKEN";

  let mode = req.query['hub.mode'];
  let token = req.query['hub.verify_token'];
  let challenge = req.query['hub.challenge'];

  if (mode && token) {

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {

      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);

    } else {
      res.sendStatus(403);
    }
  }
});

function handleMessage(sender_psid, received_message) {

  let response;

  // Check if the message contains text
  if (received_message.text) {    

    // Create the payload for a basic text message
    response = {
      "text": `Você disse: "${received_message.text}". ARVOROSSSS`
    }
  }  
  
  // Sends the response message
  callSendAPI(sender_psid, response);    
}

function callSendAPI(sender_psid, response) {
  // Construct the message body
  let request_body = {
    "recipient": {
      "id": sender_psid
    },
    "message": response
  }

  // Send the HTTP request to the Messenger Platform
  request({
    "uri": "https://graph.facebook.com/v2.6/me/messages",
    "qs": { "access_token": PAGE_ACCESS_TOKEN },
    "method": "POST",
    "json": request_body
  }, (err, res, body) => {
    if (!err) {
      console.log('message sent!')
    } else {
      console.error("Unable to send message:" + err);
    }
  }); 
}