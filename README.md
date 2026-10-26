# NYC_code by Kukiat keakool

LINE Push Message sender for AppSheet, Google Apps Script (GAS), and Node.js testing.

## Overview
This project provides utilities to send push messages using the LINE Messaging API (`https://api.line.me/v2/bot/message/push`).

- `sendLineNotify.js`: Google Apps Script (GAS) function for AppSheet / Google Sheets automation.
- `test.js`: Node.js test script to send test push messages.
- `server.js`: Web interface and API server running on port 3000 to test and send push messages directly.

## Environment Variables
Create a `.env` file with:
```env
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token_here
LINE_TARGET_GROUP_ID=your_target_group_or_user_id_here
PORT=3000
```

## Running the Web App
```bash
npm install
npm run dev
```
