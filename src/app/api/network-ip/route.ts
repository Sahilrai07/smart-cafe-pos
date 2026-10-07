import { NextResponse } from 'next/server';
import os from 'os';

export async function GET(request: Request) {
  let lanIp = '127.0.0.1';

  try {
    const interfaces = os.networkInterfaces();
    const candidates: string[] = [];

    for (const [name, addrs] of Object.entries(interfaces)) {
      if (!addrs) continue;
      for (const addr of addrs) {
        if (addr.family === 'IPv4' && !addr.internal) {
          const isVirtual = /vmnet|virtual|vethernet|loopback/i.test(name);
          const isWifi = /wi-fi|wlan|wireless|en0|eth0/i.test(name);
          if (isWifi) {
            candidates.unshift(addr.address);
          } else if (!isVirtual) {
            candidates.splice(candidates.length > 0 ? 1 : 0, 0, addr.address);
          } else {
            candidates.push(addr.address);
          }
        }
      }
    }

    if (candidates.length > 0) {
      lanIp = candidates[0];
    }
  } catch (e) {
    console.warn('Could not determine LAN IP:', e);
  }

  const host = request.headers.get('host') || 'localhost:3000';
  const port = host.includes(':') ? host.split(':')[1] : '3000';

  const envAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  let finalUrl = `http://${lanIp}:${port}`;

  if (envAppUrl && !envAppUrl.includes('localhost') && !envAppUrl.includes('127.0.0.1')) {
    finalUrl = envAppUrl.replace(/\/$/, '');
  }

  return NextResponse.json({
    ip: lanIp,
    port: parseInt(port, 10) || 3000,
    networkUrl: finalUrl,
  });
}
