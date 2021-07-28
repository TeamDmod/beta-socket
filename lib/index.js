const ws = require('ws');
const server = new ws('ws://localhost:7102');

const toJson = content => JSON.stringify(content);
let notifications = null;

server.onmessage = function (ev) {
  const payload = JSON.parse(ev.data);

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

      console.log(notifications);
      break;
    }

    default:
      break;
  }
}.bind(this);

server.onclose = function () {
  console.log('closed');
}.bind(this);
