FROM node:26.4.0-alpine@sha256:725aeba2364a9b16beae49e180d83bd597dbd0b15c47f1f28875c290bfd255b9

RUN mkdir -p /tadis-analyzer/src
COPY tadis-analyzer/src /tadis-analyzer/src/
COPY tadis-analyzer/*.json /tadis-analyzer/
WORKDIR /tadis-analyzer
RUN npm ci && \
    npm run build

RUN mkdir -p /app/src
COPY custom-example-analyzer/src /app/src/
COPY custom-example-analyzer/*.json /app/

WORKDIR /app
# use latest version of tadis-analyzer; therefore, context has to be one level up
RUN npm install && \
    npm run build && \
    apk update && apk add --no-cache openssh-client git bash

RUN mkdir -p /app/temp && chown -R node:node /app /tadis-analyzer

ARG VERSION
ENV VERSION=$VERSION
EXPOSE 8080

USER node
CMD [ "npm", "run", "server" ]
