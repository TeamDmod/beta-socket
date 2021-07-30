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

      server.send(
        toJson({
          op: 6,
          cmd: 'CONNECT_GUILD',
          d: {
            token: '0123456789',
            gid: '728814703266234435',
          },
        })
      );
      break;
    }

    case 5: {
      console.log(payload);

      setTimeout(() => {
        console.log('disconnecting...');
        server.send(
          toJson({
            op: 6,
            cmd: 'DESCONNECT_GUILD',
            d: {
              gid: '728814703266234435',
            },
          })
        );
        // console.log('connecting to a another guild...');
        // setTimeout(() => {
        //   server.send(
        //     toJson({
        //       op: 6,
        //       cmd: 'CONNECT_GUILD',
        //       d: {
        //         token: '0123456789',
        //         gid: '862560584170864680',
        //       },
        //     })
        //   );
        // }, 300);
      }, 1000);
      break;
    }

    default:
      console.log('unhandleed', payload);
      break;
  }
}.bind(this);

server.onclose = function () {
  console.log('closed');
}.bind(this);
