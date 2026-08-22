# ============================================================
#  Frontend image
#  - default (dev) stage: Vite dev server, used by docker-compose
#  - prod stage: static build served by nginx (target: prod on Railway)
# ============================================================

# --- Base with deps ---
FROM node:22-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# --- Dev (default) ---
FROM node:22-alpine AS dev
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# --- Prod build + static serve ---
FROM deps AS build
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
RUN printf 'server {\n\
  listen 5173;\n\
  root /usr/share/nginx/html;\n\
  index index.html;\n\
  location / { try_files $uri $uri/ /index.html; }\n\
}\n' > /etc/nginx/conf.d/default.conf
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
