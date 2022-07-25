# stage: build
FROM node:16-alpine

RUN mkdir -p /app/src
COPY src /app/src/
COPY *.json /app/

WORKDIR /app
RUN npm ci
RUN apk update && apk add --no-cache openssh-client git bash

COPY entrypoint.sh /

RUN mkdir -p /app/temp

ARG VERSION
ENV VERSION=$VERSION
EXPOSE 8080

WORKDIR /
CMD [ "./entrypoint.sh" ]
