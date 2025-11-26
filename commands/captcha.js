const Captcha = require('../lib/captchaManager');

module.exports = {
  name: "captcha",
  alias: ["captchaon","captchaoff"],
  desc: "Enable/Disable captcha on new joins (group admin only)",
  use: "<on|off>",
  async run({ sock, chatId, message, text, isOwner, isAdmin }) {
    // only allow group admins or bot owner
    if (!chatId.endsWith('@g.us')) {
      return sock.sendMessage(chatId, { text: 'This command works only in groups.' });
    }
    // check admin
    if (!isAdmin && !message.key.fromMe) {
      return sock.sendMessage(chatId, { text: 'Only group admins or owner can change captcha setting.' });
    }
    const arg = (text || '').split(/\s+/)[1];
    if (!arg) {
      const cur = Captcha.isGroupEnabled(chatId) ? 'enabled' : 'disabled';
      return sock.sendMessage(chatId, { text: `Captcha is currently *${cur}*.\nUse: .captcha on OR .captcha off` });
    }
    if (arg.toLowerCase() === 'on') {
      Captcha.setGroupEnabled(chatId, true);
      return sock.sendMessage(chatId, { text: '✅ Captcha enabled for this group.' });
    } else if (arg.toLowerCase() === 'off') {
      Captcha.setGroupEnabled(chatId, false);
      return sock.sendMessage(chatId, { text: '❌ Captcha disabled for this group.' });
    } else {
      return sock.sendMessage(chatId, { text: 'Usage: .captcha on | .captcha off' });
    }
  }
};
