FROM node:25.1.0-alpine

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

RUN mkdir -p /app/temp

ARG VERSION
ENV VERSION=$VERSION
EXPOSE 8080

CMD [ "npm", "run", "server" ]
