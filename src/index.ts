/**
 * ©copyright 2021 dmod
 */

import WS from './internal/main';
import mongoose from 'mongoose';
import { MONGO } from './configs';

(async () => {
  await mongoose
    .connect(MONGO, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      bufferCommands: false,
      bufferMaxEntries: 0,
      useFindAndModify: false,
      useCreateIndex: true,
    })
    .then(() => console.log('Database connected'))
    .catch(e => {
      throw e;
    });

  new WS();
})();
