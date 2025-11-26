const fs = require('fs');
const path = require('path');

const personaPath = path.join(__dirname, '../data/persona.json');

function loadPersonaDB() {
    return JSON.parse(fs.readFileSync(personaPath));
}

function savePersonaDB(db) {
    fs.writeFileSync(personaPath, JSON.stringify(db, null, 2));
}

module.exports = {

    setPersona(chatId, persona) {
        let db = loadPersonaDB();

        if (!db.groups[chatId]) db.groups[chatId] = {};
        db.groups[chatId].persona = persona;

        savePersonaDB(db);
    },

    getPersona(chatId) {
        let db = loadPersonaDB();
        return db.groups[chatId]?.persona || "normal";
    },

    list() {
        return ["normal", "anime", "hacker", "sarcastic", "kid"];
    }
};
