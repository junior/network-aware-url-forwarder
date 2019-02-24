FROM node:alpine
LABEL version="0.1"
LABEL authors="Adao Junior"
LABEL maintainer="Adao Junior"

COPY ./entrypoint.sh /
COPY ./app.js /
COPY ./package.json /

RUN apk update && apk upgrade \
    && apk add --update --no-cache bash \
	&& rm -rf /var/cache/apk/* \
    && chmod +x /entrypoint.sh

EXPOSE 80
ENTRYPOINT ["/entrypoint.sh"]