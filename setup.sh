#!/bin/bash

# Create Next.js project with TypeScript
npx create-next-app@latest . --typescript --tailwind --no-app --src-dir --import-alias "@/*"

# Install additional dependencies
npm install \
  mongodb \
  mongoose \
  next-auth \
  bcryptjs \
  jsonwebtoken \
  @heroicons/react \
  react-hook-form \
  zod \
  @hookform/resolvers \
  @tailwindcss/forms \
  @tailwindcss/line-clamp

# Install development dependencies
npm install -D \
  @types/bcryptjs \
  @types/jsonwebtoken

# Create necessary directories
mkdir -p src/{components,lib,middleware,models,styles}

# Copy configuration files
echo "Done! Please follow these steps:

1. Update the .env file with your MongoDB connection string and JWT secret
2. Start the development server with: npm run dev
3. Visit http://localhost:3000 to see your application

Note: Make sure MongoDB is running locally or update the connection string to point to your MongoDB instance." 