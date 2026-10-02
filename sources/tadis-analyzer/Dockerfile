# stage: build
FROM node:26.10.0-alpine@sha256:0b36e8c136b94cd4fcf02188228e76c31ad5872eef3fec8cbd2eee500cfd9e80 as build

RUN mkdir -p /app/src
COPY src /app/src/
COPY *.json /app/
COPY vitest.config.ts /app/

WORKDIR /app
RUN npm ci
RUN npm run test
RUN npm run build

# stage: install prod packages & run
FROM node:26.10.0-alpine@sha256:0b36e8c136b94cd4fcf02188228e76c31ad5872eef3fec8cbd2eee500cfd9e80

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
