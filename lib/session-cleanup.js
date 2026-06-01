const { Op } = require('sequelize');
const config = require('../config');
const log = require('../log');
const models = require('../models');

const DEFAULT_CLEANUP_INTERVAL_MS = 60 * 60 * 1000;
let cleanupTimer = null;
let cleanupRunning = false;

function getCleanupIntervalMs(options) {
  options = options || {};
  const configured = options.intervalMs || config.get('app.sessionCleanupIntervalMs');
  const intervalMs = parseInt(configured, 10);
  return intervalMs > 0 ? intervalMs : DEFAULT_CLEANUP_INTERVAL_MS;
}

async function deleteExpiredSessions(now) {
  if (!models.Sessions || typeof models.Sessions.destroy !== 'function') {
    return 0;
  }

  return await models.Sessions.destroy({
    where: {
      expires: {
        [Op.lt]: now || new Date()
      }
    }
  });
}

async function cleanupExpiredSessions() {
  if (cleanupRunning) {
    return;
  }

  cleanupRunning = true;
  try {
    const deleted = await deleteExpiredSessions();
    if (deleted > 0) {
      log.info(`Deleted ${deleted} expired session(s)`);
    }
  } catch (error) {
    log.error(`Expired session cleanup failed: ${error.message}`);
  } finally {
    cleanupRunning = false;
  }
}

function startExpiredSessionCleanup(options) {
  if (cleanupTimer) {
    return cleanupTimer;
  }

  const intervalMs = getCleanupIntervalMs(options);
  cleanupExpiredSessions();
  cleanupTimer = setInterval(cleanupExpiredSessions, intervalMs);

  if (typeof cleanupTimer.unref === 'function') {
    cleanupTimer.unref();
  }

  return cleanupTimer;
}

function stopExpiredSessionCleanup() {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
  }
}

module.exports = {
  cleanupExpiredSessions,
  deleteExpiredSessions,
  startExpiredSessionCleanup,
  stopExpiredSessionCleanup
};
