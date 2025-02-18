FROM node:20-alpine AS build
WORKDIR /app

COPY . . 
RUN rm package-lock.json
RUN npm install --force
RUN npm run build:qa
# Serve Application using Nginx Server

FROM nginx:alpine
COPY --from=build /app/dist/snz-web/browser/ /usr/share/nginx/html
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d
EXPOSE 80
