# stage: build
FROM node:26.3.0-alpine@sha256:9c0e1e52125d6b67d505cf75b4880fcf1290ccea5c480849910e1d57b2cf72b5 as build

RUN mkdir -p /app/src
COPY src /app/src/
COPY test /app/test/
COPY *.json /app/
COPY *.lock /app/

WORKDIR /app
RUN yarn install
RUN yarn test
RUN yarn build

# stage: install prod packages & run
FROM node:26.3.0-alpine@sha256:9c0e1e52125d6b67d505cf75b4880fcf1290ccea5c480849910e1d57b2cf72b5

RUN apk update && apk add --no-cache openssh-client git bash

RUN mkdir -p /app/build
COPY --from=build /app/build /app/build/
COPY --from=build /app/*.json /app/
COPY --from=build /app/*.lock /app/

WORKDIR /app
RUN yarn install --production

COPY entrypoint.sh /
COPY entrypoint-ssh.sh /

RUN mkdir -p /app/temp && chown -R node:node /app

ARG VERSION
ENV VERSION=$VERSION
EXPOSE 8080

WORKDIR /
USER node
CMD [ "./entrypoint.sh" ]
