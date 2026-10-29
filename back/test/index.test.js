const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const app = require('../src/app.js');
const corporatePhrases = require('../src/data/corporate.json');

// Port 0 : l'OS choisit un port libre, pas de conflit avec un backend déjà lancé
const server = app.listen(0);

const makeRequest = (path, method = 'GET', postData = null) => {
  return new Promise((resolve, reject) => {
    const port = server.address().port;
    const options = {
      hostname: 'localhost',
      port: port,
      path: path,
      method: method,
      headers: {}
    };

    if (postData) {
      options.headers['Content-Type'] = 'application/json';
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: JSON.parse(data || '{}')
        });
      });
    });

    req.on('error', reject);

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
};

// Remplace l'API IA par une fausse réponse : aucun appel réseau réel, aucune clé nécessaire en CI
const mockAI = (t, response) => {
  process.env.AI_API_KEY = 'test-key';
  t.after(() => { delete process.env.AI_API_KEY; });
  return t.mock.method(globalThis, 'fetch', async () => response);
};

test('Backend API Suite', async (t) => {
  await t.test('GET /api/health - retourne 200 et les informations de santé', async () => {
    const res = await makeRequest('/api/health');
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.status, 'ok');
    assert.ok(typeof res.body.uptime === 'number');
    assert.ok(typeof res.body.timestamp === 'string');
  });

  await t.test('POST /api/translate - sans clé IA, retourne une phrase du fallback', async () => {
    const postData = JSON.stringify({ text: "Je suis fatigué" });
    const res = await makeRequest('/api/translate', 'POST', postData);
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.original, "Je suis fatigué");
    assert.equal(res.body.source, 'fallback');
    assert.ok(corporatePhrases.includes(res.body.translated));
  });

  await t.test('POST /api/translate - avec clé IA, retourne la traduction de l\'IA', async (t) => {
    const fetchMock = mockAI(t, {
      ok: true,
      json: async () => ({ choices: [{ message: { content: 'Merci Ludovic pour ton intérêt.' } }] })
    });
    const res = await makeRequest('/api/translate', 'POST', JSON.stringify({ text: 'Ludovic tu me fatigues' }));
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.source, 'ai');
    assert.equal(res.body.translated, 'Merci Ludovic pour ton intérêt.');

    // Le prompt est construit côté back : le texte brut est envoyé comme message utilisateur
    const sentBody = JSON.parse(fetchMock.mock.calls[0].arguments[1].body);
    assert.equal(sentBody.messages[1].content, 'Ludovic tu me fatigues');
  });

  await t.test('POST /api/translate - si l\'IA est en erreur, bascule sur le fallback', async (t) => {
    mockAI(t, { ok: false, status: 503 });
    const res = await makeRequest('/api/translate', 'POST', JSON.stringify({ text: 'Encore une réunion' }));
    assert.equal(res.statusCode, 200);
    assert.equal(res.body.source, 'fallback');
    assert.ok(corporatePhrases.includes(res.body.translated));
  });

  await t.test('POST /api/translate - retourne 400 si texte manquant', async () => {
    const res = await makeRequest('/api/translate', 'POST', JSON.stringify({}));
    assert.equal(res.statusCode, 400);
    assert.equal(res.body.error, "Le champ 'text' est requis.");
  });

  await t.test('POST /api/translate - retourne 400 si texte trop long', async () => {
    const res = await makeRequest('/api/translate', 'POST', JSON.stringify({ text: 'a'.repeat(501) }));
    assert.equal(res.statusCode, 400);
  });

  t.after(() => {
    server.close();
  });
});
