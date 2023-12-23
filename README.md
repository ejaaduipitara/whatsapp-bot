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

1. Clone the repository:

   ```bash
   git clone https://github.com/DJP-Digital-Jaaduii-Pitara/whatsapp-bot.git
   cd whatsapp-bot
   ```

2. Install dependencies:

   ```
   npm install / yarn  install
   ```

3. Set the configuration

    In `.env `file set your respective keys and values
    
  ACTIVITY_SAKHI_URL: "http://144.24.130.223:7081/v1/query"  # Activity sakhi bot url for parent & teacher  
  STORY_SAKHI_UTL: "http://152.67.183.46:7081/v1/query"  # Story sakhi bot url 
  BOT_API_TOKEN:""   # BOT API token - If required
  REDIS_HOST: "http://localhost"  
  REDIS_PORT: "6379"  
  REDIS_INDEX: "0"  
  PORT: 3010  
  CHAR_LIMIT: 1024   
  TELEMETRY_SERVICE_URL: "http://152.67.162.156:9001/v1/telemetry"   # Telemetry servie endpoint to send telemetry events  
  API_TOKEN: 'xxxxxxxx'   # For telemetry server  
  APP_ENV: "dev"  #For telemetry pdata  
  APP_NAME: "djp"  #For telemetry pdata  
  WA_PROVIDER_NUMBER: "917834811114"  # The phone number attached to WhatsApp service provider  
  WA_PROVIDER_APPNAME: "TestDJP"  # Name of the app given for the above number in WhatsApp service provider portal  
  WA_PROVIDER_TOKEN: "XXXX"  

4. Start the application:

   ```
   npm run start
   ```