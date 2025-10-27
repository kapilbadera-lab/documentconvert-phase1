
const Minio = require('minio');
module.exports.MinioClient = function(){
  const client = new Minio.Client({
    endPoint: process.env.S3_ENDPOINT || 'localhost',
    port: parseInt(process.env.S3_PORT||'9000'),
    useSSL: false,
    accessKey: process.env.S3_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.S3_SECRET_KEY || 'minioadmin'
  });
  client.bucketExists('uploads', function(err, exists){
    if(err || !exists){
      client.makeBucket('uploads', 'us-east-1', function(e){ if(e) console.error(e); });
    }
  });
  return client;
}
