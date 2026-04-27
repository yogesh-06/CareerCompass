FROM node:20-alpine

WORKDIR /app

# Copy all files (monorepo)
COPY . .

# Install all workspace deps
RUN npm install

# Generate Prisma client
RUN npx prisma generate --schema=apps/backend/prisma/schema.prisma

# Build backend only
RUN npm run build -w @careercompass/backend

# Expose Render port
EXPOSE 10000

# Start backend workspace
CMD ["npm", "start", "-w", "@careercompass/backend"]

RUN npx prisma db seed --schema=apps/backend/prisma/schema.prisma || true