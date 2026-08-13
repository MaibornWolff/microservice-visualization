# stage: build
FROM node:26.7.0-alpine@sha256:aadf416b2cdce311a8811ba3f0608a61b77dbf997500e2eafe781b51f6a0b019 AS build
WORKDIR /viewer

COPY *.json ./
RUN npm ci

COPY *.js .
COPY *.ts .
COPY src ./src/

RUN npm run test && npm run build

# stage: install prod packages & run
FROM node:26.7.0-alpine@sha256:aadf416b2cdce311a8811ba3f0608a61b77dbf997500e2eafe781b51f6a0b019

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
