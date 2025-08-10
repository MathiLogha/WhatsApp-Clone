// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 5001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

// connect to mongo
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true, useUnifiedTopology: true
}).then(() => console.log('Mongo connected'))
  .catch(err => { console.error(err); process.exit(1); });

// routes
const messagesRouter = require('./routes/messages');
const webhookRouter = require('./routes/webhook');

app.use('/api', messagesRouter);
app.use('/api', webhookRouter);

// start
server.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
