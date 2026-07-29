const express = require('express');
const router = express.Router();
const { AuditLog } = require('../models');
const { verifyAdminToken } = require('../middleware');

// GET all audit logs
router.get('/', verifyAdminToken, async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(50);
    const formatted = logs.map(l => ({
      id: l.id,
      timestamp: new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      action: l.action,
      category: l.category
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Create Audit Log
router.post('/', verifyAdminToken, async (req, res) => {
  try {
    const { action, category } = req.body;
    const newId = `log-${Date.now()}`;
    const newLog = await AuditLog.create({
      id: newId,
      action,
      category: category || 'ORDER'
    });

    res.json({ success: true, id: newId, log: newLog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
