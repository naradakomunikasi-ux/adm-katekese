FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN test -f package-lock.json && npm ci --omit=dev && npm cache clean --force
COPY --chown=node:node src ./src
ENV NODE_ENV=production
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --retries=10 CMD node -e "fetch('http://127.0.0.1:3000/api/ready').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["npm","run","start:prod"]
