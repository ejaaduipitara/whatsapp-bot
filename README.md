# Sunbird VA  Whatsapp
This Node.js project demonstrates WhatsApp integration for three bots: Parent Sakhi,Teacher Sakhi, and Story bot.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)

## Features

- WhatsApp integration with three bots.
- Easy-to-use Node.js application.

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js
- npm/yarn
- Redis (for session management)

## Getting Started

### 1. Clone the repository:

   ```bash
   git clone https://github.com/DJP-Digital-Jaaduii-Pitara/whatsapp-bot.git
   cd whatsapp-bot
   ```

### 2. Install dependencies:

   ```
   npm install
   ```

### 3. configuration

- Duplicate the `.env` file & name it to `.env.local` for local development. 
- Update the respective values. refer below  
    
  PORT=3010  
  CHAR_LIMIT=1024  
  LOG_LEVEL=info  # for local development user `debug` & for server instance use `info`  
  NODE_ENV=local  # To handle .env file specific to local, prod etc..  

  // Bot specific properties  
  ACTIVITY_SAKHI_URL=xxxx     # Activity sakhi bot service internal public endpoint for parent & teacher ex: https://activity-bot-service:7081/api/v1/query  
  STORY_SAKHI_UTL=xxxx     # Story sakhi bot service internal public endpoint https://story-bot-service:7081/api/v1/query  
  BOT_API_TOKEN=xxxx    # BOT API token - If required  

  // Telemetry specific properties 
  TELEMETRY_SERVICE_URL=xxxx     # Telemetry servie internal public endpoint to send telemetry events  ex: https://telemetry-service:9000/v1/telemetry
  API_TOKEN=xxxx     # For telemetry server  
  APP_ENV=dev     #For telemetry pdata  
  APP_NAME=djp    #For telemetry pdata service provider portal  

  // WhatsApp service provider specific keys
  WA_PROVIDER_TOKEN=XXXX      # ex: API_TOKEN of the app created in the Whatsapp service provider 
  WA_PROVIDER_NUMBER=91XXXXXXX4     # The phone number attached to the app in the WhatsApp service  provider  
  WA_PROVIDER_APPNAME=TestmyJP   # Name of the app created in the Whatsapp service provider  

  // For Postgress DB
  POSTGRES_URL=postgres://<username>:<password>@<ip>:<port>/<database_name>   # ex: postgres://postgress:password@localhost:5432/myJP  

sample `.env.local` file
```
PORT=3010
LOG_LEVEL=debug
CHAR_LIMIT=1024
ACTIVITY_SAKHI_URL=https://<internal_public_ip>:7081/v1/query
STORY_SAKHI_URL=http://<internal_public_ip>:7081/v1/query
POSTGRES_URL=postgres://postgres:password4@127.0.0.1:5432/myJP
TELEMETRY_SERVICE_URL=http://<internal_public_ip>:9001/v1/telemetry
APP_ENV=dev
APP_NAME=djp
WA_PROVIDER_APPNAME=myJPApp
WA_PROVIDER_NUMBER=91xxxxxxxxxx
WA_PROVIDER_TOKEN=<api_token>
```

*Note:*  
If Postgres is SSL enabled, then to avoid ssl check you can set `?sslmode=no-verify` to the POSTGRES_URL .env property  ([ref](https://github.com/brianc/node-postgres/issues/2281))

### 4. Start the application:

For local development use `npm run local`

For Production/Live development use `npm run start`

*Note:*    
To test/verify the application is running after start/deploy, run the below command
`curl localhost:3010/health`  
(or)  
Use browser to test using public ip  
`<ip>:3010/health`  

output : "myJP WhatsApp Bot is runnig v<version>"  

### [API Collection](./docs/api.md)
   [Postman collection for testing](./docs/postman/eDP-WhatsApp-Bot.postman_collection.json)

### Build Docker image  
- To build Docker image `docker build -t whatsappbot:latest .`  

## [Gupshup - How to setup](./docs/gupshup/how-to-configure-webhook.md)
   
