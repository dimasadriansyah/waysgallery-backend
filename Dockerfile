# node version 14
FROM node:14

# working directory
WORKDIR /usr/src/app

# add variable ENV NODE_ENV production
ENV NODE_ENV production

# copy file to container
COPY . .

# install & builds
RUN npm i

# install sequelize
RUN npm install -g sequelize-cli

# expose to 5000
EXPOSE 5000

# run command in background
CMD ["node", "index.js"]
