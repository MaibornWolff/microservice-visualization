# stage: build
FROM node:26.9.0-alpine@sha256:2c45bdcbf63561a54da9549612084b43ca309854a4110c87857d609ddeb61c9e AS build
WORKDIR /viewer

COPY *.json ./
RUN npm ci

COPY *.js .
COPY *.ts .
COPY src ./src/

RUN npm run test && npm run build

# stage: install prod packages & run
FROM node:26.9.0-alpine@sha256:2c45bdcbf63561a54da9549612084b43ca309854a4110c87857d609ddeb61c9e

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
