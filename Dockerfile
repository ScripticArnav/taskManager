
FROM node:16-alpine

WORKDIR /app

COPY . .

WORKDIR /app/backend
RUN npm install

WORKDIR /app/frontend
RUN npm install

RUN npm run build

WORKDIR /app/backend

EXPOSE 5002
CMD ["npm", "start"]
