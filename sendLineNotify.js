//LINE_CHANNEL_ACCESS_TOKEN 
//LINE_TARGET_GROUP_ID
//https://api.line.me/v2/bot/message/push
function sendLinePushMessage(message, token, targetId) {
  var url = "https://api.line.me/v2/bot/message/push";
  
  
  var payload = {
    "to": targetId, // ใส่ Group ID, Room ID หรือ User ID
    "messages": [
      {
        "type": "text",
        "text": message // ข้อความที่ส่งมาจาก AppSheet
      }
    ]
  };

  var options = {
    "method": "post",
    "contentType": "application/json",
    "headers": {
      "Authorization": "Bearer " + token
    },
    "payload": JSON.stringify(payload),
    "muteHttpExceptions": true // เปิดไว้เพื่อช่วยดูข้อผิดพลาดกรณีส่งไม่ผ่าน
  };

  var response = UrlFetchApp.fetch(url, options);
  Logger.log(response.getContentText()); // ตรวจสอบสถานะการส่งใน Log
}
//---------------------------------------------

//-----------------------------------