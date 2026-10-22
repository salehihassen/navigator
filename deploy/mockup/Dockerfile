# Static, throwaway preview of the HTML mockups. Nothing is stored server-side:
# trips added in the UI live in the visitor's tab and vanish on reload.
FROM nginx:1.29-alpine
COPY deploy/mockup/nginx.conf /etc/nginx/conf.d/default.conf
COPY mockups/ /usr/share/nginx/html/
