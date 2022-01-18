FROM node:17

WORKDIR /usr/src/project-tracker-api

COPY ./ ./

RUN rm -rf node_modules/

RUN yarn

RUN yarn global add nodemon

CMD ["/bin/bash"]