
Deploy to Render.com:
1. Create GitHub repo and push these files.
2. On Render: New -> Web Service -> connect repo -> root=backend -> build npm install -> start node app.js
3. New -> Static Site -> root=frontend -> build npm install && npm run build -> publish dist
4. New -> Background Worker -> root=worker -> build npm install -> start node worker.js
5. Set environment variables in Render: S3 keys, DATABASE_URL (Postgres), REDIS_URL, JWT_SECRET, ADMIN_PASSWORD
