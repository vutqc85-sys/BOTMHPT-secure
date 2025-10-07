const http = require('http')
const fs = require('fs')
const path = require('path')

// ===== Cấu hình username/password =====
const USER = 'vu'
const PASS = '1234'

const server = http.createServer((req, res) => {
  // ===== Basic Auth =====
  const auth = req.headers['authorization']
  if (!auth || auth.indexOf('Basic ') === -1) {
    res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="BOTMHPT Site"' })
    return res.end('Authentication required.')
  }

  const b64 = auth.split(' ')[1]
  const [user, pass] = Buffer.from(b64, 'base64').toString().split(':')
  if (user !== USER || pass !== PASS) {
    res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="BOTMHPT Site"' })
    return res.end('Authentication required.')
  }

  // ===== Lấy file tương ứng =====
  let filePath = path.join(__dirname, 'public', req.url === '/' ? 'listAccount.html' : req.url)
  
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404)
      return res.end('File not found.')
    }

    // ===== Xác định Content-Type =====
    let ext = path.extname(filePath).toLowerCase()
    let contentType = 'text/html'
    if (ext === '.css') contentType = 'text/css'
    if (ext === '.js') contentType = 'text/javascript'

    res.writeHead(200, { 'Content-Type': contentType })
    res.end(data)
  })
})

server.listen(3000, () => console.log('Server chạy ở port 3000'))
