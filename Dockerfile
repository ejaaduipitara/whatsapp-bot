
FROM node:12-slim

MAINTAINER Santhosh Gandham santhosh.g@optit.in

WORKDIR /work
COPY ./ /work
EXPOSE 3002
RUN npm i
CMD npm run start
