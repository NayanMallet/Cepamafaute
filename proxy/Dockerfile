# 1. Image de base OS minimaliste
FROM nginx:alpine

# 2. Configuration de notre Reverse Proxy : remplace la configuration par défaut de Nginx
COPY default.conf /etc/nginx/conf.d/default.conf

# 3. Exposition du port
EXPOSE 80

# 4. Signal d'arrêt : pour Nginx, SIGQUIT = arrêt gracieux (termine les requêtes en cours)
STOPSIGNAL SIGQUIT

# 5. Lancement de Nginx au premier plan
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
