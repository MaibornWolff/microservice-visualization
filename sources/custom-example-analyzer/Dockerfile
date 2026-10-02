FROM node:26.10.0-alpine@sha256:0b36e8c136b94cd4fcf02188228e76c31ad5872eef3fec8cbd2eee500cfd9e80

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
