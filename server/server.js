const { App } = require('@slack/bolt');

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const ws = require('ws');
const https = require('https');
const http = require('http');
const fs = require('fs');
require('dotenv').config();

//slack app
const slackApp = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  appToken: process.env.SLACK_APP_TOKEN
});

async function findChannel(name) {
  try {
    let conversationId = null;
    let result = await slackApp.client.conversations.list({
      token: process.env.SLACK_BOT_TOKEN
    });
    for (let channel of result.channels) {
      if (channel.name === name) {
        conversationId = channel.id;
        break;
      }
    }
    return conversationId;
  }
  catch (error) {
    console.error(error);
  }
}

async function getUsers() {
  try {
    let users = [];
    let result = await slackApp.client.users.list({
      token: process.env.SLACK_BOT_TOKEN,
      limit: 200
    });
    users = result || [];
    return result;
  }
  catch (error) {
    console.error(error);
  }
}

async function getMessages(id) {
  try {
    let conversationHistory = [];
    const result = await slackApp.client.conversations.history({
      token: process.env.SLACK_BOT_TOKEN,
      channel: id
    });
    conversationHistory = result.messages || [];
    return conversationHistory;
  }
  catch (error) {
    console.error(error);
  }
}

async function publishMessage(id, text) {
  try {
    const result = await slackApp.client.chat.postMessage({
      token: process.env.SLACK_BOT_TOKEN,
      channel: id,
      text: text
    });
    return result;
  }
  catch (error) {
    console.error(error);
  }
}

(async () => {
  // Start the slack app
  await slackApp.start(process.env.SLACK_PORT || 3000);
  console.log('⚡️ Bolt app is running');
})();

//express app
const privateKey  = process.env.NODE_ENV == 'production' ? fs.readFileSync('/etc/letsencrypt/live/slack.uttamsdarji.online/privkey.pem', 'utf8') : '';
const certificate = process.env.NODE_ENV == 'production' ? fs.readFileSync('/etc/letsencrypt/live/slack.uttamsdarji.online/cert.pem', 'utf8') : '';

const credentials = { key: privateKey, cert: certificate };

const app = express();

const wsServer = new ws.Server({ port: process.env.SOCKET_PORT })

app.use(cors({origin: '*'}));

app.use(bodyParser.json());

wsServer.on('connection', socket => {
  socket.on('message', data => {
    try {
      data = JSON.parse(data)
    } catch (err) {
      return socket.send(JSON.stringify({ error: true, message: data }))
    }

    const messageToSend = JSON.stringify({ error: false, message: data })

    wsServer.clients.forEach(function each(client) {
      if (client !== wsServer && client.readyState === ws.OPEN && client !== socket) {
        client.send(messageToSend)
      }
    })
  })

  socket.on('close', function () {
    // the socket/client disconnected.
  })
})

app.on('upgrade', (request, socket, head) => {
  wsServer.handleUpgrade(request, socket, head, socket => {
    wsServer.emit('connection', socket, request)
  })
})

// hold a reference to our singleton
app.websocketServer = wsServer

app.get('/get-socket-url', (req, res) => {
  axios.post('https://slack.com/api/apps.connections.open', {}, {
    headers: {
      ["Content-type"]: "application/x-www-form-urlencoded",
      Authorization: `Bearer ${process.env.SLACK_APP_TOKEN}`
    }
  }).then((response) => {
    res.send((response.data))
  })
});

app.get('/get-channel-id', async (req, res) => {
  let channelId = await findChannel('slack-app');
  res.send(channelId);
})

app.get('/get-users', async (req, res) => {
  let users = await getUsers();
  res.send(users);
})

app.get('/get-messages', async (req, res) => {
  let result = await getMessages(process.env.CHANNEL_ID)
  res.send(result);  
})

app.post('/publish-message', async (req, res) => {
  const body = req.body;
  let text = body?.text || null;
  if (text) {
    let result = await publishMessage(process.env.CHANNEL_ID, text)
    res.send(result);  
  } else {
    res.status(400).send(`Can't send empty messages`)
  }
})

app.post('/get-events-data', async (req, res) => {
  const body = req.body;
  if (body?.type == 'url_verification' && body?.challenge) {
    res.status(200).send(body.challenge) 
    return;
  }
  if (body?.event?.type == 'message') {
    const messageToSend = JSON.stringify({ error: false, message: body })
    wsServer.clients.forEach(function each(client) {
      if (client !== wsServer && client.readyState === ws.OPEN) {
        client.send(messageToSend)
      }
    })
  }
  res.status(200).end()
})

if (process.env.NODE_ENV == 'production') {
  const httpServer = http.createServer(app);
  const httpsServer = https.createServer(credentials, app);
  httpsServer.listen(process.env.EXPRESS_PORT, () => {
    console.log(`Server app listening on port ${process.env.EXPRESS_PORT}`)
  })
} else {
  app.listen(process.env.EXPRESS_PORT, () => {
    console.log(`Server app listening on port ${process.env.EXPRESS_PORT}`)
  })
}

