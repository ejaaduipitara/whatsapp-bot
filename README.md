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
   npm install / yarn  install
   ```

### 3. configuration

Update the `.env `file with the respective keys and values
    
  PORT: 3010  
  CHAR_LIMIT: 1024  
  LOG_LEVEL: INFO  

  // Bot specific properties
  ACTIVITY_SAKHI_URL: "xxxx"  # Activity sakhi bot url for parent & teacher  
  STORY_SAKHI_UTL: "xxxx"  # Story sakhi bot url 
  BOT_API_TOKEN:"xxxx"   # BOT API token - If required 

  // Telemetry specific properties 
  TELEMETRY_SERVICE_URL: "xxxx"   # Telemetry servie endpoint to send telemetry events  
  API_TOKEN: 'xxxx'   # For telemetry server  
  APP_ENV: "dev"  #For telemetry pdata  
  APP_NAME: "djp"  #For telemetry pdata service provider portal  

  // WhatsApp service provider specific keys
  WA_PROVIDER_TOKEN: "XXXX"  
  WA_PROVIDER_NUMBER: "917834811114"  # The phone number attached to WhatsApp service provider  
  WA_PROVIDER_APPNAME: "TestDJP"  # Name of the app given for the above number in WhatsApp 

  for Postgress DB
  POSTGRES_URL: "XXXX" 

  For redis DB
  REDIS_HOST: "http://localhost"  
  REDIS_PORT: "6379"  
  REDIS_INDEX: "0" 

#### Note:
Postgres is SSL enabled, then avoid ssl check you can set `?sslmode=no-verify` to the POSTGRES_URL .env property  ([ref](https://github.com/brianc/node-postgres/issues/2281))

### 4. Start the application:

   ```
   npm run start
   ```