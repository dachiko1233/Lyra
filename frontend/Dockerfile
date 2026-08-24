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
# Vite inlines VITE_* at build time. Railway passes service variables as build
# args, so the deployed bundle points at the real backend URL (not localhost).
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html
# Railway assigns the listen port via $PORT at runtime. The official nginx
# image renders /etc/nginx/templates/*.template with envsubst on start;
# NGINX_ENVSUBST_FILTER=PORT limits substitution to ${PORT} so nginx's own
# $uri is left untouched. Single-quoted printf writes the vars literally.
ENV PORT=5173 NGINX_ENVSUBST_FILTER=PORT
RUN rm -f /etc/nginx/conf.d/default.conf \
  && printf 'server {\n  listen ${PORT};\n  root /usr/share/nginx/html;\n  index index.html;\n  location / { try_files $uri $uri/ /index.html; }\n}\n' > /etc/nginx/templates/default.conf.template
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
