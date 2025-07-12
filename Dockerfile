# Use the official Bun image
FROM oven/bun:1.2.18-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and bun.lockb (if exists)
COPY package.json bun.lock* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the application
RUN bun run build

# Expose port (even though we won't expose it externally)
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Command to run the application
CMD ["bun", "start"] 