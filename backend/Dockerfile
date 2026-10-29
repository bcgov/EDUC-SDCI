FROM artifacts.developer.gov.bc.ca/docker-remote/node:22.23.4-alpine3.23

RUN mkdir -p /logs
RUN chmod 775 /logs

RUN mkdir -p /public
RUN chmod 775 /public

WORKDIR /opt/app-root/src
RUN ln -s /logs .
RUN ln -s /public .

COPY package*.json ./
RUN npm ci

COPY . /opt/app-root/src
EXPOSE 443 8080
CMD ["npm", "start"]
