# stage: build
FROM node:18-alpine as build
WORKDIR /viewer

COPY *.json ./
RUN npm ci

COPY *.js .
COPY src ./src/
COPY test ./test/

RUN npm run test && npm run build

# stage: install prod packages & run
FROM node:18-alpine

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
