FROM node:26.12.0-alpine@sha256:6f08a523443ddedf52941874c203475b0ad503e859ad70cb26ab8be9a517dbd5

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
