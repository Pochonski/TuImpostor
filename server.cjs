const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8000;
const BASE_DIR = __dirname;

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  // Normalizar la URL (remover query strings)
  const urlPath = req.url.split('?')[0];
  let filePath = path.join(BASE_DIR, urlPath === '/' ? 'index.html' : urlPath);
  
  // Prevenir path traversal
  if (!filePath.startsWith(BASE_DIR)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
    return;
  }

  // Si es un archivo con extensión, servirlo
  const ext = path.extname(filePath);
  if (ext) {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        // Si no existe el archivo y no es index.html, servir index.html (SPA fallback)
        fs.readFile(path.join(BASE_DIR, 'index.html'), (fallbackErr, fallbackData) => {
          if (fallbackErr) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(fallbackData);
          }
        });
      } else {
        const contentType = mimeTypes[ext] || 'application/octet-stream';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
      }
    });
  } else {
    // No tiene extensión, asumir que es una ruta SPA y servir index.html
    fs.readFile(path.join(BASE_DIR, 'index.html'), (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n✓ Servidor SPA ejecutándose en http://localhost:${PORT}`);
  console.log(`✓ Acceso desde red: http://192.168.56.1:${PORT}`);
  console.log(`✓ Presiona Ctrl+C para detener\n`);
});
