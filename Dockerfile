# Use the official Node.js 14 image as base
FROM node:20.10.0

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code to the container
COPY . .

# Build the Next.js application
RUN npm run build

# Expose the port Next.js is running on (default is 3000)
EXPOSE 3005

# Command to run the Next.js application
CMD ["npm", "start"]
