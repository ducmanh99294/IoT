# 1. Base image
FROM node:20-alpine

# 2. Tạo thư mục app
WORKDIR /app

# 3. Copy package.json trước (để cache)
COPY package*.json ./

# 4. Cài dependency
RUN npm install --production

# 5. Copy toàn bộ source
COPY . .

# 6. Expose port (đúng với app của bạn)
EXPOSE 8080

# 7. Start app
CMD ["node", "server.js"]
