const ws = require('ws');
const server = new ws('ws://localhost:7102');

const toJson = content => JSON.stringify(content);
let notifications = null;

server.onmessage = function (ev) {
  const payload = JSON.parse(ev.data);

  console.log(payload);
  switch (payload.op) {
    case 0: {
      server.send(
        toJson({
          op: 1,
          d: {
            token: null,
            uid: null,
          },
        })
      );
      break;
    }

    case 2: {
      notifications = payload.d.missed_notifications;

      // server.send(
      //   toJson({
      //     op: 6,
      //     cmd: 'CONNECT_GUILD',
      //     d: {
      //       token: '0123456789',
      //       gid: '862560584170864680',
      //     },
      //   })
      // );
      break;
    }

    default:
      break;
  }
}.bind(this);

server.onclose = function ({ reason }) {
  console.log('closed', reason);
}.bind(this);
