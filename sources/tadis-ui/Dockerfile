# stage: build
FROM node:26.8.1-alpine@sha256:2d984a15c9b54fd0aeb608b8e0d0d83529eb34d2966db27a1fb4f1edc3d298a3 AS build
WORKDIR /viewer

COPY *.json ./
RUN npm ci

COPY *.js .
COPY *.ts .
COPY src ./src/

RUN npm run test && npm run build

# stage: install prod packages & run
FROM node:26.8.1-alpine@sha256:2d984a15c9b54fd0aeb608b8e0d0d83529eb34d2966db27a1fb4f1edc3d298a3

RUN mkdir -p /viewer/build
COPY --from=build /viewer/build /viewer/build/
COPY --from=build /viewer/*.json /viewer/
COPY --from=build /viewer/*.js /viewer/
RUN mkdir -p /viewer/src/html
COPY --from=build /viewer/src/html /viewer/src/html/

WORKDIR /viewer
RUN npm ci --production

USER node
EXPOSE 8080
CMD [ "npm", "run", "start:prod" ]
