FROM node:10.15.3-alpine
ENV NODE_ENV production
WORKDIR /usr/src/app
COPY ["package.json", "./"]

RUN npm install 
COPY . .
EXPOSE 3000 6380 8008
RUN ls -al -R
CMD ["npm", "start"]