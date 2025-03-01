FROM node:22-alpine
ARG SERVER_PORT=5000
RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY --chown=node:node package*.json .
USER node
RUN npm install
COPY --chown=node:node . .
EXPOSE $SERVER_PORT
CMD ["npm", "run", "start"]