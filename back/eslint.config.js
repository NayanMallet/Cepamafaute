// Règles ESLint écrites explicitement (aucun import) : l'image de lint n'a besoin que d'ESLint
// et le code est monté en lecture seule, sans node_modules.
module.exports = [
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      // Variables globales fournies par Node.js
      globals: {
        require: 'readonly',
        module: 'readonly',
        process: 'readonly',
        console: 'readonly',
        Buffer: 'readonly',
        fetch: 'readonly',
        AbortSignal: 'readonly',
        globalThis: 'readonly'
      }
    },
    rules: {
      'no-undef': 'error', // variable utilisée mais jamais déclarée
      'no-unused-vars': 'error', // variable ou import déclaré mais jamais utilisé
      'no-unreachable': 'error', // code placé après un return / throw
      'no-dupe-keys': 'error', // clé en double dans un objet
      'eqeqeq': 'error', // impose === au lieu de == (pas de conversion implicite)
      'prefer-const': 'error' // const quand la variable n'est jamais réassignée
    }
  }
];
