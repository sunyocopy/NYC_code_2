require('dotenv').config();
const express = require('express');
const path = require('path');
const axios = require('axios');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// In-memory logs
const logs = [];

function maskString(str) {
  if (!str) return '';
  if (str.length <= 8) return '****';
  return str.slice(0, 4) + '...' + str.slice(-4);
}

// API status endpoint
app.get('/api/status', (req, res) => {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
  const targetId = process.env.LINE_TARGET_GROUP_ID || '';

  res.json({
    hasToken: Boolean(token.trim()),
    hasTarget: Boolean(targetId.trim()),
    maskedToken: maskString(token.trim()),
    defaultTargetId: targetId.trim(),
    serverTime: new Date().toISOString()
  });
});

// API send endpoint
app.post('/api/send', async (req, res) => {
  const token = (req.body.token || process.env.LINE_CHANNEL_ACCESS_TOKEN || '').trim();
  const toId = (req.body.targetId || process.env.LINE_TARGET_GROUP_ID || '').trim();
  const message = (req.body.message || '').trim();

  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'LINE_CHANNEL_ACCESS_TOKEN is required. Please set it in .env or enter it in the form.'
    });
  }

  if (!toId) {
    return res.status(400).json({
      success: false,
      error: 'Target ID (Group ID, Room ID, or User ID) is required. Please set it in .env or enter it in the form.'
    });
  }

  if (!message) {
    return res.status(400).json({
      success: false,
      error: 'Message text cannot be empty.'
    });
  }

  const url = 'https://api.line.me/v2/bot/message/push';
  const startTime = Date.now();

  try {
    const response = await axios.post(
      url,
      {
        to: toId,
        messages: [
          {
            type: 'text',
            text: message
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        timeout: 10000
      }
    );

    const logEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      targetId: toId,
      message,
      success: true,
      statusCode: response.status,
      response: response.data || { message: 'Push message accepted by LINE' }
    };

    logs.unshift(logEntry);
    if (logs.length > 50) logs.pop();

    return res.json({
      success: true,
      status: response.status,
      message: 'ข้อความถูกส่งไปยัง LINE สำเร็จแล้ว!',
      log: logEntry
    });
  } catch (error) {
    let statusCode = 500;
    let details = null;
    let errorMessage = error.message;

    if (error.response) {
      statusCode = error.response.status;
      details = error.response.data;
      if (details && details.message) {
        errorMessage = details.message;
      }
    }

    const logEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      targetId: toId,
      message,
      success: false,
      statusCode,
      error: errorMessage,
      details
    };

    logs.unshift(logEntry);
    if (logs.length > 50) logs.pop();

    return res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500).json({
      success: false,
      status: statusCode,
      error: errorMessage,
      details,
      log: logEntry
    });
  }
});

// Logs endpoint
app.get('/api/logs', (req, res) => {
  res.json({ logs });
});

app.delete('/api/logs', (req, res) => {
  logs.length = 0;
  res.json({ success: true, message: 'Logs cleared' });
});

// Code files endpoint
app.get('/api/files', (req, res) => {
  try {
    const gasFile = fs.readFileSync(path.join(__dirname, 'sendLineNotify.js'), 'utf8');
    const nodeFile = fs.readFileSync(path.join(__dirname, 'test.js'), 'utf8');
    res.json({
      gasCode: gasFile,
      nodeCode: nodeFile
    });
  } catch (err) {
    res.status(500).json({ error: 'Could not read source files' });
  }
});

// Fallback to index.html for SPA/static
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`NYC Code server running at http://${HOST}:${PORT}`);
});
