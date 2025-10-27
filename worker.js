
const { Worker } = require('bullmq');
const fs = require('fs-extra');
const path = require('path');
const Handlebars = require('handlebars');
const puppeteer = require('puppeteer');
const { MinioClient } = require('../backend/lib/minioClient');

const redisHost = process.env.REDIS_HOST || 'redis';
const worker = new Worker('print-jobs', async job => {
  console.log('Worker got job', job.id, job.name, job.data);
  if(job.name !== 'render-job') return;
  const { jobId } = job.data;
  const minio = MinioClient();
  const tmpDir = path.join('/tmp', jobId);
  await fs.ensureDir(tmpDir);
  // download records.json from minio
  const recKey = `uploads/${jobId}/records.json`;
  try{
    await new Promise((resolve,reject)=>{
      minio.getObject('uploads', recKey, (err, stream) => {
        if(err) return reject(err);
        const out = fs.createWriteStream(path.join(tmpDir,'records.json'));
        stream.pipe(out);
        stream.on('end', ()=>resolve());
      });
    });
  } catch(e){
    console.warn('records.json not found', e.message);
    return;
  }
  const records = fs.readJsonSync(path.join(tmpDir,'records.json'));
  const tmplSrc = fs.readFileSync(path.join(__dirname,'..','templates','mp-front.html'),'utf8');
  const tpl = Handlebars.compile(tmplSrc);
  const outFiles = [];
  const browser = await puppeteer.launch({ args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  for(const r of records){
    const html = tpl(r);
    const filePath = path.join(tmpDir, `${r.record_id}-front.html`);
    fs.writeFileSync(filePath, html);
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.emulateMediaType('print');
    const pdfPath = path.join(tmpDir, `${r.record_id}-front.pdf`);
    await page.pdf({ path: pdfPath, printBackground: true, width: '85.6mm', height: '53.98mm' });
    const key = `outputs/${jobId}/${r.record_id}-front.pdf`;
    await new Promise((resolve,reject)=>{
      minio.putObject('uploads', key, fs.createReadStream(pdfPath), function(err, etag){
        if(err) return reject(err);
        resolve();
      });
    });
    outFiles.push(key);
  }
  await browser.close();
  console.log('Worker completed job', jobId, outFiles.length, 'files');
}, { connection: { host: redisHost, port: 6379 } });

worker.on('completed', job => console.log('Job completed', job.id));
worker.on('failed', (job, err) => console.error('Job failed', job.id, err));
