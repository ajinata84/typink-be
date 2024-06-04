# Use the official Node.js image as the base image
FROM node:21.2.0-alpine

# Install app dependencies including development dependencies
RUN npm install

# Expose the port on which the app will run
EXPOSE 3000

# Start the app
CMD [ "npm", "run", "dev" ]
