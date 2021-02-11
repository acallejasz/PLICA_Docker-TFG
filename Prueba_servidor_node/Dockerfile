FROM node:12

WORKDIR /home

COPY . .

RUN git clone https://github.com/CORE-UPM/quiz_2021.git

WORKDIR /home/quiz_2021

RUN npm install \
 && npm run-script migrate \
 && npm run-script seed \
 && sed '29d' ./app.js > hola \
 && rm -rf app.js \
 && mv hola app.js

CMD [ "npm", "start" ]