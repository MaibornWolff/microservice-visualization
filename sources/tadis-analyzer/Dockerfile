# stage: build
FROM node:26.11.1-alpine@sha256:143494b1da2945f061539253adc65e4f1569ddf07da2d384c022c791a9d90a4a as build

RUN mkdir -p /app/src
COPY src /app/src/
COPY *.json /app/
COPY vitest.config.ts /app/

WORKDIR /app
RUN npm ci
RUN npm run test
RUN npm run build

# stage: install prod packages & run
FROM node:26.11.1-alpine@sha256:143494b1da2945f061539253adc65e4f1569ddf07da2d384c022c791a9d90a4a

RUN apk update && apk add --no-cache openssh-client git bash

RUN mkdir -p /app/build
COPY --from=build /app/build /app/build/
COPY --from=build /app/*.json /app/

WORKDIR /app
RUN npm ci --omit=dev

COPY entrypoint.sh /
COPY entrypoint-ssh.sh /

RUN mkdir -p /app/temp && chown -R node:node /app

ARG VERSION
ENV VERSION=$VERSION
EXPOSE 8080

WORKDIR /
USER node
CMD [ "./entrypoint.sh" ]
