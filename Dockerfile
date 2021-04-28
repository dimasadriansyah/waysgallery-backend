# node version 14
FROM node:14

# working directory
WORKDIR /usr/src/app

# copy file to container
COPY . .

# expose to 5000
EXPOSE 5000

# run command in background
CMD ["node", "index.js"]