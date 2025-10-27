
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const { v4: uuidv4 } = require('uuid');
const { MinioClient } = require('./lib/minioClient');
const { Queue } = require('./lib/queue');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const upload = multer({ dest: '/tmp/uploads' });
const JOBS = {};

app.get('/', (req, res) => res.json({ status: 'multilink backend ok' }));

app.post('/api/upload', upload.fields([{ name: 'csv' }, { name: 'photos' }]), async (req, res) => {
  try {
    if(!req.files || !req.files.csv) return res.status(400).json({ error: 'CSV required' });
    const csvFile = req.files.csv[0];
    const csvText = fs.readFileSync(csvFile.path);
    parse(csvText, { columns: true, skip_empty_lines: true }, (err, output) => {
      if(err) return res.status(400).json({ error: 'CSV parse error' });
      const jobId = uuidv4();
      JOBS[jobId] = { id: jobId, status: 'uploaded', total: output.length, records: output };
      // store records.json to Minio (or local)
      const minio = MinioClient();
      const tmp = path.join('/tmp', jobId);
      if(!fs.existsSync(tmp)) fs.mkdirSync(tmp, { recursive: true });
      fs.writeFileSync(path.join(tmp, 'records.json'), JSON.stringify(output));
      // upload to minio
      const key = `uploads/${jobId}/records.json`;
      minio.putObject('uploads', key, JSON.stringify(output), function(err, etag){
        // ignore
      });
      Queue().add('render-job', { jobId });
      return res.json({ jobId, total: output.length });
    });
  } catch(e) {
    console.error(e);
    res.status(500).json({ error: 'internal' });
  }
});

app.get('/api/jobs/:id', (req, res) => {
  const j = JOBS[req.params.id];
  if(!j) return res.status(404).json({ error: 'not found' });
  res.json(j);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Backend listening on', PORT));
