# Statische Auslieferung für Coolify (Build Pack: Dockerfile, Port 80).
# Die Simulation läuft komplett im Browser, der Server liefert nur die eine Seite aus.
FROM nginx:1.27-alpine
COPY Fenster-Simulator.html /usr/share/nginx/html/index.html
EXPOSE 80
