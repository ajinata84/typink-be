FROM node:18

WORKDIR /app
COPY package.json package-lock.json ./

RUN npm ci

COPY prisma/schema.prisma ./prisma/
RUN npx prisma generate

COPY . .

EXPOSE 3000