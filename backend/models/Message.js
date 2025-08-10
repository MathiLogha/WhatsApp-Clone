// backend/models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  wa_id: { type: String, index: true },
  name: String,
  number: String,
  message_id: { type: String, index: true },
  direction: { type: String, enum: ['inbound', 'outbound'], default: 'inbound' },
  type: String,
  text: String,
  status: { type: String, enum: ['sent','delivered','read'], default: 'sent' },
  timestamp: Date,
  raw_payload: Object
}, { timestamps: true });

module.exports = mongoose.model('Message', MessageSchema);