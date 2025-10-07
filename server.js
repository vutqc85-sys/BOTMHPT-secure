const http = require('http');
const fs = require('fs');
const path = require('path');

const USER = 'vu';
const PASS = '1234';

const server = http.createServer((req, res) => {
  const auth = req.headers['authorization'];
  if (!auth || auth.indexOf('Basic ') === -1) {
    res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="BOTMHPT Site"' });
    return res.end('Authentication required.');
  }

  const b64 = auth.split(' ')[1];
  const [user, pass] = Buffer.from(b64, 'base64').toString().split(':');
  if (user !== USER || pass !== PASS) {
    res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="BOTMHPT Site"' });
    return res.end('Authentication required.');
  }

  // Root '/' mở listAccount.html
  let reqPath = req.url === '/' ? 'listAccount.html' : req.url.replace(/^\/+/, '');
  let filePath = path.join(__dirname, 'public', reqPath);

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('File not found.');
    }

    const mimeTypes = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.gif': 'image/gif'
    };

    let ext = path.extname(filePath).toLowerCase();
    let contentType = mimeTypes[ext] || 'application/octet-stream';

    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

// ❗ SỬ DỤNG PORT DO RENDER CUNG CẤP
const port = process.env.PORT || 3000;
server.listen(port, () => console.log(`Server chạy ở port ${port}`));
