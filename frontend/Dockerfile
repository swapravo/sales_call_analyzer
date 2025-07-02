FROM node:18-alpine

WORKDIR /app

COPY package.json yarn.lock* ./

RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; else npm install; fi

COPY . .

COPY .env.local ./

RUN npm run build || yarn build

EXPOSE 3000

CMD ["npm", "run", "start"]
