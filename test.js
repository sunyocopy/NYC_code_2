// ดึงตัวแปรสภาพแวดล้อมจากไฟล์ .env
require('dotenv').config();
const axios = require('axios');

async function sendLinePushMessage(message, token, toId) {
  const url = 'https://api.line.me/v2/bot/message/push';

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
        }
      }
    );

    console.log('ส่งข้อความสำเร็จ Status:', response.status);
  } catch (error) {
    if (error.response) {
      console.error('LINE API Error Status:', error.response.status);
      console.error('Error Details:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
  }
}

function testSendLinePush() {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const targetGroupId = process.env.LINE_TARGET_GROUP_ID;

  if (!token || !targetGroupId) {
    console.error('Error: กรุณาตั้งค่า LINE_CHANNEL_ACCESS_TOKEN และ LINE_TARGET_GROUP_ID ในไฟล์ .env ก่อน');
    return;
  }

  const testMessage = 'ทดสอบการส่งข้อความจาก VS Code ผ่าน LINE Messaging API สวัสดี กู้เกียรติ เกื้อกูล';

  sendLinePushMessage(testMessage, token, targetGroupId);
}

// เรียกใช้งานฟังก์ชันเมื่อรันไฟล์โดยตรง
if (require.main === module) {
  testSendLinePush();
}

module.exports = { sendLinePushMessage, testSendLinePush };