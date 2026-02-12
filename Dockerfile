FROM node:lts-bullseye

RUN apt-get update && \
    npm i -g pm2 && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json .
RUN yarn install
COPY . .

EXPOSE 8080
CMD ["yarn", "start"]
