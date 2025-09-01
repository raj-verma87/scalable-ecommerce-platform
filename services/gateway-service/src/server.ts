import path from 'path';

import dotenv from "dotenv";
dotenv.config(); // loads .env before Express Gateway starts

// 👇 Use require for express-gateway
const gateway = require('express-gateway');

gateway()
  .load(path.join(__dirname, '..', 'config'))
  .run();

