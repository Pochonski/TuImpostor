import http from 'http';

const urls = [
  'http://localhost:5173/',
  'http://192.168.11.100:5173/',
  'http://192.168.56.1:5173/',
  'http://10.144.117.2:5173/',
  'http://172.19.48.1:5173/'
];

function check(url, timeout = 3000) {
  return new Promise(resolve => {
    const req = http.request(url, { method: 'HEAD', timeout }, res => {
      resolve({ url, status: res.statusCode });
    });
    req.on('timeout', () => { req.destroy(); resolve({ url, error: 'timeout' }); });
    req.on('error', err => resolve({ url, error: err.message }));
    req.end();
  });
}

(async () => {
  for (const url of urls) {
    try {
      const r = await check(url, 2000);
      if (r.status) console.log(`${r.url} -> ${r.status}`);
      else console.log(`${r.url} -> error: ${r.error}`);
    } catch (e) {
      console.log(`${url} -> exception: ${e.message}`);
    }
  }
})();
