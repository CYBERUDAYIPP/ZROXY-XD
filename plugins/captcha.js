const CaptchaStore = {};

module.exports = {
    name: "captcha-plugin",
    description: "Auto captcha verification for new group members",

    onGroupParticipantsUpdate: async ({ sock, id, participants, action }) => {
        if (action !== 'add') return;

        for (const user of participants) {
            const code = Math.floor(1000 + Math.random() * 9000).toString();

            // save pending captcha
            if (!CaptchaStore[id]) CaptchaStore[id] = {};
            CaptchaStore[id][user] = {
                code,
                time: Date.now()
            };

            // send captcha message
            await sock.sendMessage(id, {
                text: `👋 @${user.split('@')[0]}\n\nPlease verify you are human.\nReply with this code:\n\n*${code}*`,
                mentions: [user]
            });

            // auto-remove after timeout
            setTimeout(async () => {
                if (CaptchaStore[id] && CaptchaStore[id][user]) {
                    await sock.groupParticipantsUpdate(id, [user], "remove");
                    delete CaptchaStore[id][user];

                    await sock.sendMessage(id, {
                        text: `❌ @${user.split('@')[0]} removed (captcha failed)`,
                        mentions: [user]
                    });
                }
            }, 45000);
        }
    },

    onMessage: async ({ sock, message, chatId, senderId, text }) => {
        if (!CaptchaStore[chatId]) return;

        const pending = CaptchaStore[chatId][senderId];
        if (!pending) return;

        const cleaned = text.replace(/\s+/g, '');
        if (cleaned === pending.code) {
            // success
            delete CaptchaStore[chatId][senderId];

            await sock.sendMessage(chatId, {
                text: `✅ Verification successful @${senderId.split('@')[0]}`,
                mentions: [senderId]
            });
        } else {
            await sock.sendMessage(chatId, {
                text: `❌ Wrong code @${senderId.split('@')[0]}.\nTry again with *${pending.code}*`,
                mentions: [senderId]
            });
        }
    }
};
