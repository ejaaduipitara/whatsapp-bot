FROM node:16-alpine
RUN mkdir -p /app
ENV BOT_SERVICE_URL=$BOT_SERVICE_URL \
    BOT_API_TOKEN=$BOT_API_TOKEN \
    PORT=$PORT \
    REDIS_HOST=$REDIS_HOST \
    REDIS_PORT=$REDIS_PORT \
    REDIS_INDEX=$REDIS_INDEX \
    WHATSAPP_VERSION=$WHATSAPP_VERSION \
    WHATSAPP_PHONEID=$WHATSAPP_PHONEID \
    WHATSAPP_TOKEN=$WHATSAPP_TOKEN \
    VERIFY_TOKEN=$VERIFY_TOKEN \
    CHAR_LIMIT=$CHAR_LIMIT \
    WA_PROVIDER_TOKEN=$WA_PROVIDER_TOKEN \
    TELEMETRY_SERVICE_URL=$TELEMETRY_SERVICE_URL \
    API_TOKEN=$API_TOKEN \
    APP_ENV=$APP_ENV \
    APP_NAME=$APP_NAME \
    LOG_LEVEL=$LOG_LEVEL 
WORKDIR /app

# Install dependencies first to leverage Docker cache
COPY package.json yarn.lock ./
# RUN rm -rf node_modules/

# Using cache mount for npm install, so unchanged packages aren’t downloaded every time
RUN --mount=type=cache,target=/app/node_modules \
    yarn

# Copy the rest of your app's source code
COPY . .
EXPOSE 3010

# Your app's start command
CMD [ "npm" , "start"]
