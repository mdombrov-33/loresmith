FROM node:25-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000

ENV MODE=dev
CMD ["sh", "-c", "if [ \"$MODE\" = \"prod\" ]; then npm run build && npm start; else npm run dev; fi"]