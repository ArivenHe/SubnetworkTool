const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2');


const server = http.createServer();
const wss = new WebSocket.Server({ server });

let users = [];


const db = mysql.createConnection({
  host: 'localhost',
  user: 'imp',
  password: 'ab321818',
  database: 'imp'
});


db.connect(err => {
  if (err) {
    console.error('Database connection error:', err);
    return;
  }
  console.log('Connected to MySQL database');
});


function saveUsersToFile() {
  const filePath = path.join(__dirname, 'users.json');

  const usersToSave = users.map(user => ({
    cid: user.id,
    ip: user.ip,
    loginontime: user.loginontime,
    logouttime: user.logouttime,
    duration: user.duration,
    user_qq: user.user_qq
  }));
  fs.writeFileSync(filePath, JSON.stringify(usersToSave, null, 2));
}

wss.on('connection', (ws, req) => {
  const ip = req.socket.remoteAddress;
  let userId;
  const loginTime = new Date().toISOString();

  ws.on('message', (message) => {
    const data = JSON.parse(message);
    if (data.type === 'login') {
      userId = data.user_num;


      db.query('SELECT user_num, user_qq FROM user WHERE user_num = ?', [userId], (err, results) => {
        if (err) {
          console.error('Database query error:', err);
          ws.send(JSON.stringify({ error: 'Database query failed' }));
          return;
        }

        if (results.length === 0) {
          ws.send(JSON.stringify({ error: 'User not found' }));
          return;
        }

        const userQQ = results[0].user_qq;

        const user = {
          id: userId,
          ip,
          ws,
          loginontime: loginTime,
          logouttime: null,
          duration: null
        };

        users.push(user);
        console.log(`${user.id} connected with IP: ${user.ip} at ${user.loginontime}`);

        ws.send(JSON.stringify(users.map(u => ({
          id: u.id,
          ip: u.ip,
          loginontime: u.loginontime,
          logouttime: u.logouttime,
          duration: u.duration,
          user_qq: u.user_qq
        }))));
        saveUsersToFile();

        broadcastUsers();
      });
    }
  });

  ws.on('close', () => {
    if (userId) {
      const user = users.find(u => u.id === userId);
      if (user) {
        user.logouttime = new Date().toISOString();
        const loginDate = new Date(user.loginontime);
        const logoutDate = new Date(user.logouttime);
        user.duration = Math.floor((logoutDate - loginDate) / 1000);

        users = users.filter(u => u.id !== userId);
        db.query('SELECT integral FROM user WHERE user_num = ?', [userId], (err, results) => {
            if (err) {
              console.error('Database query error:', err);
              ws.send(JSON.stringify({ error: 'Database query failed' }));
              return;
            }

            if (results.length === 0) {
              ws.send(JSON.stringify({ error: 'User not found' }));
              return;
            }

            const integral = results[0].integral;
            point=user.duration*0.0083;
            let newIntegral = integral - point;
            db.query('UPDATE user SET integral = ? WHERE user_num = ?', [newIntegral, userId], (err, results) => {
                if (err) {
                  console.error('Database query error:', err);
                  ws.send(JSON.stringify({ error: 'Database query failed' }));
                  return;
                }

                if (results.length === 0) {
                  ws.send(JSON.stringify({ error: 'User not found' }));
                  return;
                }

                console.log(`User ${userId} disconnected after ${user.duration} seconds New integral ${newIntegral} `);
                broadcastUsers();
                saveUsersToFile();
              });
          });

      }
    }
  });
});

function broadcastUsers() {
  const usersToBroadcast = users.map(u => ({
    id: u.id,
    ip: u.ip,
    loginontime: u.loginontime,
    logouttime: u.logouttime,
    duration: u.duration,
    user_qq: u.user_qq
  }));
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(usersToBroadcast));
    }
  });
}

server.listen(8080, () => {
  console.log('Server is listening on port 8080');
});
