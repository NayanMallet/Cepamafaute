# 1. Image de base OS minimaliste
FROM nginx:alpine

# 2. Manipulation OS : Nettoyage de la configuration par défaut
RUN rm -rf /etc/nginx/conf.d/default.conf

# 3. Configuration de notre Reverse Proxy
COPY default.conf /etc/nginx/conf.d/default.conf

# 4. Exposition du port
EXPOSE 80

# 5. Signal d'arrêt : pour Nginx, SIGQUIT = arrêt gracieux (termine les requêtes en cours)
STOPSIGNAL SIGQUIT

# 6. Lancement de Nginx au premier plan
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]
