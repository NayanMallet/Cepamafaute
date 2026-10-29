const corporatePhrases = require('../data/corporate.json');
const { translateWithAI } = require('../services/llm.service.js');

// Limite la taille du texte envoyé à l'IA (coût en tokens + surface d'injection de prompt)
const MAX_TEXT_LENGTH = 500;

const getHealth = (req, res) => {
    res.status(200).json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() });
};

const postTranslate = async (req, res) => {
    const { text } = req.body;
    if (typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: "Le champ 'text' est requis." });
    }
    if (text.length > MAX_TEXT_LENGTH) {
        return res.status(400).json({ error: `Le texte ne doit pas dépasser ${MAX_TEXT_LENGTH} caractères.` });
    }

    // Sans clé ou si l'IA est indisponible, on répond quand même avec une phrase corporate locale
    if (process.env.AI_API_KEY) {
        try {
            const translated = await translateWithAI(text);
            return res.status(200).json({ original: text, translated, source: 'ai' });
        } catch (err) {
            console.error(`Appel IA échoué, passage en mode fallback : ${err.message}`);
        }
    }

    const randomIndex = Math.floor(Math.random() * corporatePhrases.length);
    res.status(200).json({ original: text, translated: corporatePhrases[randomIndex], source: 'fallback' });
};

module.exports = { getHealth, postTranslate };
