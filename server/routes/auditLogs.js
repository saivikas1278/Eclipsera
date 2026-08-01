const express = require('express');
const router = express.Router();
const { AuditLog } = require('../models');
const { verifyAdminToken } = require('../middleware');
const { isDbReady, memoryAuditLogs } = require('../store');

async function recordAuditLog(action, category = 'ORDER') {
  const newLog = {
    id: `log-${Date.now()}`,
    action,
    category,
    createdAt: new Date().toISOString()
  };
  memoryAuditLogs.unshift(newLog);

  if (isDbReady()) {
    try {
      await AuditLog.create(newLog);
    } catch (e) {}
  }
  return newLog;
}

// GET all audit logs
router.get('/', verifyAdminToken, async (req, res) => {
  try {
    let logs = memoryAuditLogs;
    if (isDbReady()) {
      try {
        const dbLogs = await AuditLog.find().sort({ createdAt: -1 }).limit(50);
        if (dbLogs && dbLogs.length) logs = dbLogs;
      } catch (e) {}
    }
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
    const newLog = await recordAuditLog(action, category);
    res.json({ success: true, id: newLog.id, log: newLog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.recordAuditLog = recordAuditLog;
module.exports = router;
