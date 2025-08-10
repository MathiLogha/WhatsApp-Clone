// backend/routes/webhook.js
const express = require('express');
const router = express.Router();
const Message = require('../models/Message');

// POST /api/webhook -> expects the payload object
router.post('/webhook', async (req, res) => {
  try {
    const payload = req.body;
    const entry = payload.metaData?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value || {};

    // messages
    if (value.messages && value.contacts) {
      const contact = value.contacts[0];
      const message = value.messages[0];
      const direction = message.from === contact.wa_id ? 'inbound' : 'outbound';

      const doc = {
        wa_id: contact.wa_id,
        name: contact.profile?.name || null,
        number: contact.wa_id,
        message_id: message.id,
        direction,
        type: message.type,
        text: message.text?.body || null,
        status: 'sent',
        timestamp: new Date(parseInt(message.timestamp) * 1000),
        raw_payload: payload
      };

      await Message.updateOne(
        { message_id: doc.message_id },
        { $setOnInsert: doc },
        { upsert: true }
      );

      return res.json({ ok: true });
    }

    // statuses
    if (value.statuses) {
      for (const s of value.statuses) {
        const idToFind = s.id || s.meta_msg_id;
        if (!idToFind) continue;
        await Message.updateMany({ message_id: idToFind }, { $set: { status: s.status } });
      }
      return res.json({ ok: true });
    }

    res.json({ ok: false, reason: 'nothing to process' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
