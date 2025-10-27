
FROM node:18-slim
WORKDIR /app
RUN apt-get update && apt-get install -y wget ca-certificates fonts-liberation libnss3 libatk1.0-0 libx11-xcb1 libxcomposite1 libxcursor1 libxdamage1 libxrandr2 libxss1 libasound2 libpangocairo-1.0-0 libgtk-3-0 git --no-install-recommends && rm -rf /var/lib/apt/lists/*
COPY package*.json ./
RUN npm install --production
COPY . .
CMD ["node","worker.js"]
