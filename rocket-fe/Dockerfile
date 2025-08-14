# Base image: Node 20 LTS
FROM node:20-alpine

# Cài thêm một số packages cần thiết cho Expo
RUN apk add --no-cache bash git python3 make g++ libc6-compat

# Tạo thư mục app
WORKDIR /app

# Copy package files trước để cache dependencies
COPY package.json yarn.lock ./

# Cài dependencies
RUN yarn install

# Copy toàn bộ mã nguồn
COPY . .

# Expo dev server
EXPOSE 8081

# Chạy Expo
CMD ["yarn", "start"]
