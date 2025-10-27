
const { Queue } = require('bullmq');
let q;
module.exports.Queue = function(){
  if(q) return q;
  q = new Queue('print-jobs', { connection: { host: process.env.REDIS_HOST || 'redis', port: 6379 } });
  return q;
}
