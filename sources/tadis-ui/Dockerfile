# stage: build
FROM node:16-alpine as build

RUN mkdir -p /viewer/src
COPY src /viewer/src/

RUN mkdir -p /viewer/test
COPY test /viewer/test/

COPY *.json /viewer/
COPY *.js /viewer/

WORKDIR /viewer
RUN npm install
RUN npm run test
RUN npm run build

# stage: install prod packages & run
FROM node:16-alpine

RUN mkdir -p /viewer/build
COPY --from=build /viewer/build /viewer/build/
COPY --from=build /viewer/*.json /viewer/
COPY --from=build /viewer/*.js /viewer/
RUN mkdir -p /viewer/src/html
COPY --from=build /viewer/src/html /viewer/src/html/

WORKDIR /viewer
RUN npm install --production

USER node
EXPOSE 8080
CMD [ "npm", "run", "start:prod" ]
