const express = require('express');
const router = express.Router();
const { Notification } = require('../models');
const { isDbReady, memoryNotifications } = require('../store');

// GET Notifications for User or Admin
router.get('/', async (req, res) => {
  try {
    const { recipientType = 'USER', recipientId = '' } = req.query;
    const effId = (recipientId || '').trim().toLowerCase();
    const effType = (recipientType || 'USER').toUpperCase();

    let list = memoryNotifications.filter(n => {
      const matchType = n.recipientType === effType;
      const notifRecipId = (n.recipientId || '').toLowerCase();
      const matchId = effType === 'ADMIN' || !notifRecipId || notifRecipId === effId || notifRecipId === 'admin';
      return matchType && matchId;
    });

    if (isDbReady()) {
      try {
        const query = { recipientType: effType };
        if (effType === 'USER' && effId) {
          query.$or = [
            { recipientId: new RegExp(`^${effId}$`, 'i') }, 
            { recipientId: '' }, 
            { recipientId: null }
          ];
        }
        const dbList = await Notification.find(query).sort({ createdAt: -1 });
        if (dbList && dbList.length) list = dbList;
      } catch (e) {}
    }

    const unreadCount = list.filter(n => !n.isRead).length;

    res.json({
      recipientType: effType,
      unreadCount,
      notifications: list
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH Mark Single Notification as Read
router.patch('/:id/read', async (req, res) => {
  try {
    const { id } = req.params;

    let target = memoryNotifications.find(n => n.id === id);
    if (target) target.isRead = true;

    if (isDbReady()) {
      try {
        await Notification.findOneAndUpdate({ id }, { $set: { isRead: true } });
      } catch (e) {}
    }

    res.json({ success: true, id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH Mark All Notifications as Read
router.patch('/read-all', async (req, res) => {
  try {
    const { recipientType = 'USER', recipientId = '' } = req.body;
    const effId = (recipientId || '').toLowerCase();
    const effType = (recipientType || 'USER').toUpperCase();

    memoryNotifications.forEach(n => {
      if (n.recipientType === effType) {
        if (effType === 'ADMIN' || !n.recipientId || n.recipientId === effId) {
          n.isRead = true;
        }
      }
    });

    if (isDbReady()) {
      try {
        await Notification.updateMany({ recipientType: effType }, { $set: { isRead: true } });
      } catch (e) {}
    }

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
