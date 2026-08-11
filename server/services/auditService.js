/**
 * Utility to record administrative or system audit logs.
 * Can be expanded to store logs in a MongoDB collection.
 * 
 * @param {string} message - The audit event description
 * @param {string} context - The context module (e.g., 'ORDER', 'PRODUCT', 'USER')
 */
const recordAuditLog = async (message, context = 'SYSTEM') => {
  const timestamp = new Date().toISOString();
  console.log(`[AUDIT - ${context}] ${timestamp}: ${message}`);
  // Future enhancement: await AuditLog.create({ message, context, timestamp });
};

module.exports = {
  recordAuditLog
};
