/**
 * ©copyright 2021 dmod
 */

import { Schema, model, Model } from 'mongoose';

interface TokenData {
  /*** Typeof token */
  type: 'user' | 'gatewayGuild' | 'gatewayUser';
  /*** Token key */
  token: string;
  /*** The id if the corresponding id object (guildID/userID) */
  for: string;
  /*** Token hashed */
  tokenHash: string;
  /*** Times token has been used */
  use: number;
}

const Token = new Schema({
  type: {
    type: String,
    required: true,
  },
  for: {
    type: String,
  },
  token: {
    type: String,
    required: true,
  },
  tokenHash: {
    type: String,
  },
  use: {
    type: Number,
    min: 0,
    default: 0,
  },
});

export default model('tokens', Token) as Model<TokenData>;
