# syntax=docker/dockerfile:1
# 静态托管 Vite 产物。勿使用 `npm update -g npm`，易损坏镜像内全局 npm。
# Zeabur：将「构建方式」选 Dockerfile，根目录指向前端仓库的 front/，或把本文件路径设为 front/Dockerfile。
#
# 构建时注入 API 地址（与 Zeabur 环境变量一致）：
#   docker build -f front/Dockerfile --build-arg VITE_API_BASE_URL=https://api.example.com/api -t sam-front ./front

FROM node:22-bookworm AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.docker.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
