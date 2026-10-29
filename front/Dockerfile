# ==========================================
# ÉTAPE 1 : Compilation du projet frontend (Build stage)
# ==========================================
# image légère Node 24 Alpine (LTS active) pour compiler les assets Vue 3 / TypeScript
FROM node:24-alpine AS build-stage

# 1. Structure de dossiers et Dépendances
WORKDIR /app
COPY package*.json ./
# npm ci installe exactement les versions du package-lock.json (build reproductible)
RUN npm ci

# 2. Copie des sources et compilation
COPY . .
RUN npm run build

# ==========================================
# ÉTAPE 2 : Serveur Web Nginx de production (Production stage)
# ==========================================
# image Nginx Alpine (20-30 Mo) pour servir les fichiers statiques de manière ultra-rapide
FROM nginx:alpine AS production-stage

# 3. Manipulation OS : Nettoyage de Nginx (supp fichiers HTML par défaut et configurations de bienvenue)
# Suppression des fichiers HTML par défaut pour n'exposer que notre application
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# 4. Copie des assets compilés et de la configuration du proxy
COPY --from=build-stage /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 5. Exposition du port
EXPOSE 80

# 6. Signal d'arrêt : pour Nginx, SIGQUIT = arrêt gracieux (SIGTERM = arrêt immédiat)
STOPSIGNAL SIGQUIT

# 7. Entrypoint
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
