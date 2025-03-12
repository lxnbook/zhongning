# 前端构建阶段
FROM node:16 as frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# 后端构建阶段
FROM node:16
WORKDIR /app
COPY backend/package*.json ./
RUN npm install --production
COPY backend/ ./
COPY --from=frontend-build /app/frontend/build ./public

# 环境变量
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000
CMD ["node", "server.js"] 