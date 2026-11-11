const { describe, it } = require('node:test');
const assert = require('node:assert');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const generateToken = require('../utils/generateToken');
const { recordAuditLog } = require('../services/auditService');

describe('Server Security & Utilities', () => {
  it('should generate a valid signed JWT for user ID', () => {
    const mockUserId = '64b1f2e3d4c5a6b7c8d9e0f1';
    const token = generateToken(mockUserId);
    assert.ok(token, 'Token should be defined');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    assert.strictEqual(decoded.id, mockUserId, 'Decoded ID must match original user ID');
  });

  it('should fail token verification with wrong secret key', () => {
    const mockUserId = '64b1f2e3d4c5a6b7c8d9e0f1';
    const token = generateToken(mockUserId);

    assert.throws(() => {
      jwt.verify(token, 'wrong-secret-key');
    }, /invalid signature/);
  });

  it('should record audit log safely', async () => {
    await assert.doesNotReject(async () => {
      await recordAuditLog('Order #123 created', 'TEST');
    });
  });
});
