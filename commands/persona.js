const persona = require('../lib/personaManager');

module.exports = {
    name: "persona",
    alias: ["mode"],
    isOwner: false,
    isAdmin: true,
    desc: "Change bot speaking style",
    use: "<type>",

    async run({ msg, args }) {
        if (!args[0]) {
            return msg.reply(
                `Choose persona:\n\n${persona.list()
                    .map(p => `• ${p}`)
                    .join("\n")}\n\nExample: .persona anime`
            );
        }

        const type = args[0].toLowerCase();
        if (!persona.list().includes(type)) {
            return msg.reply(`Invalid persona!\nAvailable: ${persona.list().join(", ")}`);
        }

        persona.setPersona(msg.chat, type);

        msg.reply(`✔ Persona changed to: *${type}*`);
    }
};
