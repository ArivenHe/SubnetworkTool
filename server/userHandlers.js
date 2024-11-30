const { query } = require('./database');
const { saveUsersToFile, broadcastUsers } = require('./utils');
let users = [];

function handleConnection(ws, req, wss) {
  const ip = req.socket.remoteAddress;
  let userId;
  const loginTime = new Date().toISOString();

  ws.on('message', async (message) => {
    const data = JSON.parse(message);
    if (data.type === 'login') {
      userId = data.user_num;

      try {
        const results = await query('SELECT user_num, user_qq FROM user WHERE user_num = ?', [userId]);
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
          duration: null,
          user_qq: userQQ
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
        saveUsersToFile(users);

        broadcastUsers(users, wss);
      } catch (err) {
        console.error('Database or API query error:', err);
        ws.send(JSON.stringify({ error: 'Database or API query failed' }));
      }
    }
  });

  ws.on('close', async () => {
    if (userId) {
      const user = users.find(u => u.id === userId);
      if (user) {
        user.logouttime = new Date().toISOString();
        const loginDate = new Date(user.loginontime);
        const logoutDate = new Date(user.logouttime);
        user.duration = Math.floor((logoutDate - loginDate) / 1000);

        users = users.filter(u => u.id !== userId);
        try {
          const results = await query('SELECT integral FROM user WHERE user_num = ?', [userId]);
          if (results.length === 0) {
            ws.send(JSON.stringify({ error: 'User not found' }));
            return;
          }

          const integral = results[0].integral;
          const point = user.duration * 0.0083;
          const newIntegral = integral - point;
          await query('UPDATE user SET integral = ? WHERE user_num = ?', [newIntegral, userId]);

          console.log(`User ${userId} disconnected after ${user.duration} seconds. New integral: ${newIntegral}`);
          broadcastUsers(users, wss);
          saveUsersToFile(users);
        } catch (err) {
          console.error('Database query error:', err);
        }
      }
    }
  });
}

module.exports = {
  handleConnection
};
