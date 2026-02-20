import os from 'os';

function getLocalIPv4() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return null;
}

const ip = getLocalIPv4();
if (ip) {
  console.log(ip);
  process.exit(0);
} else {
  console.error('No se encontró IP local');
  process.exit(1);
}
