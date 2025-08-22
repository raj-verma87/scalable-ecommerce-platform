import path from 'path';
// 👇 Use require for express-gateway
const gateway = require('express-gateway');

gateway()
  .load(path.join(__dirname, '..', 'config'))
  .run();

