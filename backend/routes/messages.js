// backend/routes/messages.js
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
router.get('/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).send(err);
  }
});
// GET /api/conversations
// grouped by wa_id, with last message + unread count
router.get('/conversations', async (req, res) => {
  try {
    const conv = await Message.aggregate([
      { $sort: { timestamp: -1 } },
      { $group: {
          _id: "$wa_id",
          name: { $first: "$name" },
          number: { $first: "$number" },
          lastMessage: { $first: "$text" },
          lastMessageObj: { $first: "$$ROOT" },
          unread: { $sum: { $cond: [
            { $and: [ { $eq: ["$direction","inbound"] }, { $ne: ["$status","read"] } ] },
            1, 0
          ] } }
      }},
      { $project: {
          wa_id: "$_id",
          name: 1, number: 1, lastMessage: 1, lastMessageObj: 1, unread: 1
      }},
      { $sort: { "lastMessageObj.timestamp": -1 } }
    ]);
    res.json(conv);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/conversations/:wa_id/messages
router.get('/conversations/:wa_id/messages', async (req, res) => {
  try {
    const wa_id = req.params.wa_id;
    const messages = await Message.find({ wa_id }).sort({ timestamp: 1 }).limit(1000);
    res.json(messages);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/conversations/:wa_id/messages  (send message - store only)
router.post('/conversations/:wa_id/messages', async (req, res) => {
  try {
    const wa_id = req.params.wa_id;
    const { text, name, number } = req.body;
    const msg = new Message({
      wa_id,
      name,
      number: number || wa_id,
      message_id: 'local_' + Date.now(),
      direction: 'outbound',
      type: 'text',
      text,
      status: 'sent',
      timestamp: new Date()
    });
    const saved = await msg.save();

    // optional simulation: mark delivered/read after short delays
    setTimeout(async () => {
      await Message.updateOne({ _id: saved._id }, { status: 'delivered' });
    }, 1500);
    setTimeout(async () => {
      await Message.updateOne({ _id: saved._id }, { status: 'read' });
    }, 4000);

    res.json(saved);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
