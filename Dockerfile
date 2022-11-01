FROM node:latest
ENV NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json* .

RUN set -ex; \
        apt-get update; \
        apt-get install -y --no-install-recommends \
                python-is-python3 \
        ; \
        rm -rf /var/lib/apt/lists/*

RUN npm install --production

COPY . .

CMD [ "node", "index.js" ]
