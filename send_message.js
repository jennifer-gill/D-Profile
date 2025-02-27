const axios = require('axios');


// Usage Example: node send_message.js AE00027 923108559858 "hello world"
const url = 'https://wa.mytime2cloud.com/send-message';

const [, , clientId, recipient, text] = process.argv;

if (!clientId || !recipient || !text) {
    console.error('Usage: node script.js <clientId> <recipient> <text>');
    process.exit(1);
}

const message = `Child Processes Report:\n
1️⃣ ID: 40 | Name: child-process-AE00027 | PID: 3510879 | Uptime: 3m | CPU: 6 | Mem: 30.9MB\n
2️⃣ ID: 47 | Name: child-process-again_sleeping | PID: 3515518 | Uptime: 2m | CPU: 1 | Mem: 30.9MB\n
3️⃣ ID: 41 | Name: child-process-client_id_1740554784744 | PID: 3512799 | Uptime: 3m | CPU: 0 | Mem: 31.7MB\n
4️⃣ ID: 42 | Name: child-process-client_id_1740555796038 | PID: 3515837 | Uptime: 2m | CPU: 2 | Mem: 32.2MB\n
5️⃣ ID: 43 | Name: child-process-client_id_1740559926485 | PID: 3513622 | Uptime: 3m | CPU: 0 | Mem: 31.4MB\n
6️⃣ ID: 44 | Name: child-process-client_id_1740579798863 | PID: 3514147 | Uptime: 2m | CPU: 3 | Mem: 31.1MB\n
7️⃣ ID: 45 | Name: child-process-client_id_1740579824775 | PID: 3514516 | Uptime: 2m | CPU: 0 | Mem: 31.8MB\n
8️⃣ ID: 48 | Name: child-process-test | PID: 3517727 | Uptime: 117s | CPU: 1 | Mem: 40.4MB`;


const data = {
    clientId,
    recipient,
    text: message
};

axios.post(url, data)
    .then(response => {
        console.log('Message sent successfully:', response.data);
    })
    .catch(error => {
        console.error('Error sending message:', error.response ? error.response.data : error.message);
    });
