# stage: build
FROM node:26.4.0-alpine@sha256:725aeba2364a9b16beae49e180d83bd597dbd0b15c47f1f28875c290bfd255b9 as build

RUN mkdir -p /app/src
COPY src /app/src/
COPY *.json /app/
COPY vitest.config.ts /app/

WORKDIR /app
RUN npm ci
RUN npm run test
RUN npm run build

# stage: install prod packages & run
FROM node:26.4.0-alpine@sha256:725aeba2364a9b16beae49e180d83bd597dbd0b15c47f1f28875c290bfd255b9

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
