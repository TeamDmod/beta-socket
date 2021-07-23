const ws = require('ws');
const server = new ws('ws://localhost:7102');

const toJson = content => JSON.stringify(content);

server.onmessage = function (ev) {
  const payload = JSON.parse(ev.data);
  console.log(payload);

  switch (payload.op) {
    case 0: {
      server.send(
        toJson({
          op: 1,
          d: {
            token: '',
            gid: '',
            uid: null,
          },
        })
      );
      break;
    }

    default:
      console.log(payload);
      break;
  }
}.bind(this);

server.onclose = function () {
  console.log('closed');
}.bind(this);
