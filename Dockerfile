FROM node:16-bullseye

RUN apt-get update && \
    apt-get install -y zip

COPY . /app

WORKDIR /app

RUN yarn install --pure-lockfile && \
    yarn run build

RUN mkdir build && \
    zip -r /opt/dist.zip ./dist 

CMD ["cp", "/opt/dist.zip", "/host"]
