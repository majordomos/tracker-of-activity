FROM node:fermium

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package*.json /usr/src/app/
RUN npm install

COPY . /usr/src/app/

EXPOSE 5001

CMD ["npm", "start"]