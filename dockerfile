# Use the official Node.js image as the base image
FROM node:alpine

# Create a directory for the app
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install app dependencies including development dependencies
RUN npm install
RUN npx prisma generate

# Copy the entire app
COPY . .

# Expose the port on which the app will run
EXPOSE 3000

# Start the app
CMD [ "npm", "run", "dev" ]
