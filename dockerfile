# Use the official Node.js image as the base image
FROM node:alpine


WORKDIR /usr/app
COPY ./ /usr/app
COPY package*.json /usr/app


# Install app dependencies including development dependencies
RUN npm install

# Expose the port on which the app will run
EXPOSE 3000

# Start the app
CMD [ "npm", "run", "dev" ]
