# Use an official Node runtime as a parent image
FROM node:18

# Set the working directory to /app
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install --force

# Copy the rest of the application to the container
COPY . .

# Expose port REST_API_SERVER_PORT=3000 for the server application and TCP_PORT=4000 for tcp server
EXPOSE 3000 4000

# Start the application (check in `docker-compose.yml` file)
# CMD ['npm', 'run', 'start']
