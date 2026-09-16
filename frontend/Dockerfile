FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN test -f package-lock.json && npm ci
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
RUN chown -R nginx:nginx /var/cache/nginx /var/run /etc/nginx/conf.d /usr/share/nginx/html \
    && touch /var/run/nginx.pid \
    && chown nginx:nginx /var/run/nginx.pid
USER nginx
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s --retries=10 CMD wget -qO- http://localhost:8080/release.json >/dev/null || exit 1
