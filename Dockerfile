FROM node:18

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/

# Install backend dependencies
RUN cd backend && npm install

# Copy all files
COPY . .

# Expose port
EXPOSE 8080

# Start command
CMD ["sh", "-c", "cd backend && npm start"] 