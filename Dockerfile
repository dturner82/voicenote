FROM nginx:stable-alpine

COPY demo/ /usr/share/nginx/html/
COPY dist/ /usr/share/nginx/dist/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
