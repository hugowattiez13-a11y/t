// =============================================================================
//  Serveur Cubik — multijoueur, comptes, Hub et projets d'équipe sans Claude
//  Aucune dépendance : Node.js 18 ou plus.   Lancer :  node server.js
//  Variables : PORT (8080 par défaut), DATA (dossier des données, ./data)
// =============================================================================
'use strict';
const http = require('http'), fs = require('fs'), path = require('path'), crypto = require('crypto');
const PORT = +process.env.PORT || 8080;
const PUB = path.join(__dirname, 'public');
const DATA_DIR = process.env.DATA || path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'store.json');
const MAX_DOC = 400 * 1024, MAX_DOCS = 60000, MAX_PEERS_PER_ROOM = 40;

// ---------- stockage (une seule base JSON, sauvegardée toutes les 5 s) ----------
fs.mkdirSync(DATA_DIR, { recursive: true });
let store = new Map();
try { store = new Map(Object.entries(JSON.parse(fs.readFileSync(DB_FILE, 'utf8')))); console.log(`📦 ${store.size} documents chargés`); } catch (e) { }
let dirty = false;
setInterval(() => { if (!dirty) return; dirty = false; const tmp = DB_FILE + '.tmp'; fs.writeFile(tmp, JSON.stringify(Object.fromEntries(store)), e => { if (!e) fs.rename(tmp, DB_FILE, () => { }); }); }, 5000);
const validPath = p => typeof p === 'string' && p.length < 300 && /^[A-Za-z0-9_\-./]+$/.test(p) && !p.includes('..') && p.split('/').length % 2 === 0;
const collOf = p => p.slice(0, p.lastIndexOf('/'));

// ---------- fichiers du jeu ----------
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css', '.png': 'image/png', '.svg': 'image/svg+xml', '.json': 'application/json' };
const ROUTES = { '/': 'index.html', '/studio': 'studio.html', '/hub': 'hub.html' };
const server = http.createServer((req, res) => {
  const url = decodeURIComponent((req.url || '/').split('?')[0]);
  const file = ROUTES[url] || url.replace(/^\/+/, '');
  const full = path.join(PUB, file);
  if (!full.startsWith(PUB)) { res.writeHead(403); return res.end(); }
  fs.readFile(full, (err, buf) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Introuvable'); }
    const ext = path.extname(full);
    if (ext === '.html') buf = Buffer.from(buf.toString('utf8').replace('<head>', '<head>\n<script>window.CUBIK_SERVER=true</script>'));
    res.writeHead(200, { 'Content-Type': TYPES[ext] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); res.end(buf);
  });
});

// ---------- WebSocket minimal (RFC 6455) ----------
const clients = new Set(), rooms = new Map(), subs = new Map();
server.on('upgrade', (req, sock) => {
  if ((req.url || '').split('?')[0] !== '/ws') return sock.destroy();
  const key = req.headers['sec-websocket-key']; if (!key) return sock.destroy();
  const acc = crypto.createHash('sha1').update(key + '258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
  sock.write(`HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: ${acc}\r\n\r\n`);
  sock.setNoDelay(true);
  const c = { sock, id: crypto.randomBytes(8).toString('hex'), buf: Buffer.alloc(0), frag: [], rooms: new Set(), subs: new Set(), budget: 120, alive: true };
  clients.add(c); send(c, { t: 'hello', peer: c.id });
  sock.on('data', d => { c.buf = Buffer.concat([c.buf, d]); if (c.buf.length > 3e6) return drop(c); parse(c); });
  sock.on('close', () => drop(c)); sock.on('error', () => drop(c));
});
function parse(c) {
  while (c.buf.length >= 2) {
    const b0 = c.buf[0], b1 = c.buf[1], op = b0 & 15, fin = b0 & 128, masked = b1 & 128; let len = b1 & 127, off = 2;
    if (len === 126) { if (c.buf.length < 4) return; len = c.buf.readUInt16BE(2); off = 4; }
    else if (len === 127) { if (c.buf.length < 10) return; len = Number(c.buf.readBigUInt64BE(2)); off = 10; }
    if (len > 2e6) return drop(c);
    const need = off + (masked ? 4 : 0) + len; if (c.buf.length < need) return;
    let payload = c.buf.subarray(off + (masked ? 4 : 0), need);
    if (masked) { const m = c.buf.subarray(off, off + 4); payload = Buffer.from(payload); for (let i = 0; i < payload.length; i++) payload[i] ^= m[i & 3]; }
    c.buf = c.buf.subarray(need);
    if (op === 8) return drop(c);
    if (op === 9) { frame(c, payload, 10); continue; }
    if (op === 10) continue;
    if (op === 1 || op === 0) { c.frag.push(payload); if (fin) { const txt = Buffer.concat(c.frag).toString('utf8'); c.frag = []; let m; try { m = JSON.parse(txt); } catch (e) { continue; } handle(c, m); } }
  }
}
function frame(c, data, op = 1) {
  if (c.sock.destroyed) return; const len = data.length; let head;
  if (len < 126) head = Buffer.from([128 | op, len]);
  else if (len < 65536) { head = Buffer.alloc(4); head[0] = 128 | op; head[1] = 126; head.writeUInt16BE(len, 2); }
  else { head = Buffer.alloc(10); head[0] = 128 | op; head[1] = 127; head.writeBigUInt64BE(BigInt(len), 2); }
  c.sock.write(Buffer.concat([head, data]));
}
const send = (c, m) => frame(c, Buffer.from(JSON.stringify(m)));
function drop(c) {
  if (!clients.has(c)) return; clients.delete(c);
  for (const r of c.rooms) leave(c, r);
  for (const s of c.subs) { const set = subs.get(s); if (set) { set.delete(c); if (!set.size) subs.delete(s); } }
  try { c.sock.destroy(); } catch (e) { }
}
setInterval(() => { for (const c of clients) c.budget = Math.min(240, c.budget + 120); }, 1000);

// ---------- salons (présence + événements) ----------
function peersMsg(room, name, ids, joined = [], left = []) { return { t: 'peers', r: name, peers: ids.map(id => ({ peer: id, presence: room.get(id)?.p || {} })), joined, left }; }
function join(c, name) {
  if (typeof name !== 'string' || !/^[a-z0-9][a-z0-9_.-]{0,47}$/.test(name)) return;
  let room = rooms.get(name); if (!room) { room = new Map(); rooms.set(name, room); }
  if (room.size >= MAX_PEERS_PER_ROOM && !room.has(c.id)) return;
  room.set(c.id, { c, p: {} }); c.rooms.add(name);
  send(c, peersMsg(room, name, [...room.keys()], [...room.keys()]));
  for (const [id, x] of room) if (id !== c.id) send(x.c, peersMsg(room, name, [c.id], [c.id]));
}
function leave(c, name) {
  const room = rooms.get(name); if (!room) return; room.delete(c.id); c.rooms.delete(name);
  for (const x of room.values()) send(x.c, { t: 'peers', r: name, peers: [], joined: [], left: [c.id] });
  if (!room.size) rooms.delete(name);
}

// ---------- messages ----------
function handle(c, m) {
  if (--c.budget < 0) return; // trop de messages : on ignore
  const reply = (ok, v, e) => m.q && send(c, { t: 'res', q: m.q, ok, v, e });
  switch (m.t) {
    case 'join': return join(c, m.r || 'lobby');
    case 'leave': return leave(c, m.r);
    case 'pres': { const room = rooms.get(m.r); const me = room?.get(c.id); if (!me || typeof m.p !== 'object') return; const s = JSON.stringify({ ...me.p, ...m.p }); if (s.length > 4096) return; me.p = JSON.parse(s);
      for (const x of room.values()) send(x.c, peersMsg(room, m.r, [c.id])); return; }
    case 'emit': { const room = rooms.get(m.r); if (!room?.has(c.id) || JSON.stringify(m.d ?? null).length > 4096) return; for (const x of room.values()) send(x.c, { t: 'msg', r: m.r, topic: String(m.topic).slice(0, 48), d: m.d, peer: c.id }); return; }
    case 'get': return validPath(m.k) ? reply(true, store.get(m.k) ?? null) : reply(false, null, 'chemin invalide');
    case 'set': { if (!validPath(m.k)) return reply(false, null, 'chemin invalide'); const s = JSON.stringify(m.v ?? null); if (s.length > MAX_DOC) return reply(false, null, 'document trop gros');
      if (!store.has(m.k) && store.size >= MAX_DOCS) return reply(false, null, 'serveur plein'); store.set(m.k, JSON.parse(s)); dirty = true; reply(true); notify(m.k, store.get(m.k)); return; }
    case 'del': { if (!validPath(m.k)) return reply(false, null, 'chemin invalide'); store.delete(m.k); dirty = true; reply(true); notify(m.k, null); return; }
    case 'list': { const pre = String(m.c) + '/'; const out = []; for (const [k, v] of store) if (k.startsWith(pre) && !k.slice(pre.length).includes('/')) { out.push({ id: k.slice(pre.length), data: v }); if (out.length >= 3000) break; } return reply(true, out); }
    case 'sub': { const k = String(m.c).slice(0, 300); let set = subs.get(k); if (!set) { set = new Set(); subs.set(k, set); } set.add(c); c.subs.add(k); return; }
    case 'unsub': { const set = subs.get(m.c); if (set) set.delete(c); c.subs.delete(m.c); return; }
  }
}
function notify(p, v) { const set = subs.get(collOf(p)); if (!set) return; const id = p.slice(p.lastIndexOf('/') + 1); for (const c of set) send(c, { t: 'chg', c: collOf(p), id, v }); }

server.listen(PORT, () => {
  const nets = require('os').networkInterfaces(); const ips = [];
  for (const l of Object.values(nets)) for (const n of l || []) if (n.family === 'IPv4' && !n.internal) ips.push(n.address);
  console.log(`\n🎮 Serveur Cubik prêt !\n   Jeu    : http://localhost:${PORT}/\n   Studio : http://localhost:${PORT}/studio\n   Hub    : http://localhost:${PORT}/hub`);
  if (ips.length) console.log(`   Sur ton réseau (amis à la maison) : ${ips.map(i => `http://${i}:${PORT}/`).join('  ')}`);
  console.log('   Ctrl+C pour arrêter.\n');
});
