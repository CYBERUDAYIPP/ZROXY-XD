const fs = require('fs');
const path = require('path');

const DBPATH = path.join(__dirname, '../data/captcha.json');

function ensure() {
  const dir = path.join(__dirname, '../data');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DBPATH)) {
    fs.writeFileSync(DBPATH, JSON.stringify({ groups: {}, pending: {} }, null, 2));
  }
}

function read() {
  ensure();
  return JSON.parse(fs.readFileSync(DBPATH, 'utf8'));
}
function write(db) {
  fs.writeFileSync(DBPATH, JSON.stringify(db, null, 2));
}

// enable/disable per group
function setGroupEnabled(groupId, enabled) {
  const db = read();
  db.groups[groupId] = db.groups[groupId] || {};
  db.groups[groupId].enabled = !!enabled;
  write(db);
}
function isGroupEnabled(groupId) {
  const db = read();
  return !!(db.groups[groupId] && db.groups[groupId].enabled);
}

// pending captchas: { [groupId]: { [participant]: { code, expiresAt } } }
function addPending(groupId, participant, code, ttlSec) {
  const db = read();
  db.pending = db.pending || {};
  db.pending[groupId] = db.pending[groupId] || {};
  db.pending[groupId][participant] = { code, expiresAt: Date.now() + ttlSec * 1000 };
  write(db);
}
function removePending(groupId, participant) {
  const db = read();
  if (db.pending && db.pending[groupId]) {
    delete db.pending[groupId][participant];
    if (Object.keys(db.pending[groupId]).length === 0) delete db.pending[groupId];
    write(db);
  }
}
function getPending(groupId, participant) {
  const db = read();
  return db.pending && db.pending[groupId] ? db.pending[groupId][participant] : null;
}
function cleanupExpired() {
  const db = read();
  if (!db.pending) return;
  const now = Date.now();
  let changed = false;
  for (const g of Object.keys(db.pending)) {
    for (const p of Object.keys(db.pending[g])) {
      if (db.pending[g][p].expiresAt <= now) {
        delete db.pending[g][p];
        changed = true;
      }
    }
    if (db.pending[g] && Object.keys(db.pending[g]).length === 0) {
      delete db.pending[g];
      changed = true;
    }
  }
  if (changed) write(db);
}

module.exports = {
  setGroupEnabled,
  isGroupEnabled,
  addPending,
  removePending,
  getPending,
  cleanupExpired
};
