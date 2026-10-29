# ==========================================
# ÉTAPE 1 : Dépendances de production (commune aux étapes test et production)
# ==========================================
# Node 24 = version LTS active (Node 20 n'a plus de correctifs de sécurité depuis avril 2026)
FROM node:24-alpine AS base

WORKDIR /app

# Installation des dépendances optimisée (mise en cache Docker) : sans les devDependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# ==========================================
# ÉTAPE 2 : Tests (CI) - mêmes dépendances que la production
# ==========================================
FROM base AS test

COPY src/ ./src/
COPY test/ ./test/
USER node

# Code de sortie 0 = tests OK, 1 = au moins un test en échec (le pipeline s'arrête)
ENTRYPOINT ["node"]
CMD ["--test", "test/index.test.js"]

# ==========================================
# ÉTAPE 3 : Image de production (sans les tests)
# ==========================================
FROM base AS production

# Variables d'environnement par défaut (surchargées au run par le docker-compose)
ENV PORT=3000
ENV NODE_ENV=production

# Manipulation OS & Sécurité : création d'un utilisateur et d'un groupe système non-privilégiés
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copie des fichiers métier directement avec le bon propriétaire (évite une couche "chown -R")
COPY --chown=appuser:appgroup src/ ./src/
USER appuser

EXPOSE 3000

# Entrypoint en forme exec : node est lancé directement (pas via npm) pour recevoir le SIGTERM
ENTRYPOINT ["node"]
CMD ["src/server.js"]
