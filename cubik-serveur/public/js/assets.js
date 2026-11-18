"use strict";
/* ============================================================================
   RESSOURCES (textures, sons, meshes) — locales ou venues du Blocubik Hub
   Chaque ressource a un identifiant (ex. hub_k3v6q2, snd_ab12cd) utilisable
   sur un bloc dans le Studio ou dans le code : Sound.Play("hub_k3v6q2").
   ============================================================================ */
const ASSETS=new Map();            // id -> {id,type,name,data,parts,slot,author}
const ASSET_TEX=new Map(),ASSET_BUF=new Map();
const ASSET_ID_RE=/^(hub|snd|tex|msh)_[a-z0-9]{4,12}$/;
const assetKind={texture:['🖼️','Texture'],sound:['🔊','Son'],mesh:['🧩','Mesh']};
function newAssetId(type){return({texture:'tex',sound:'snd',mesh:'msh'}[type]||'tex')+'_'+Math.random().toString(36).slice(2,8)}
function registerAsset(a){if(!a||!ASSET_ID_RE.test(a.id)||!assetKind[a.type])return null;const clean={id:a.id,type:a.type,name:filterText(String(a.name||a.id)).slice(0,40),author:String(a.author||'').slice(0,20)};
  if(a.type==='mesh'){clean.parts=sanitizeParts(a.parts);clean.slot=['chapeau','lunettes','dos','cou','epaule','visage','objet'].includes(a.slot)?a.slot:'objet'}
  else{if(typeof a.data!=='string'||!/^data:(image|audio)\/[a-z0-9.+-]+;base64,/i.test(a.data))return null;clean.data=a.data}
  const old=ASSETS.get(clean.id);ASSETS.set(clean.id,clean);if(old&&old.data!==clean.data){const t=ASSET_TEX.get(clean.id);if(t){gl.deleteTexture(t.tex);ASSET_TEX.delete(clean.id)}ASSET_BUF.delete(clean.id)}
  if(clean.type==='texture')assetMaterial(clean.id);return clean}
function sanitizeParts(P){const S=['box','rbox','sphere','cyl','cone','torus'];const out=[];for(const p of Array.isArray(P)?P.slice(0,60):[]){if(!Array.isArray(p))continue;const n=i=>{const v=+p[i];return isFinite(v)?clamp(v,-3,3):0};
    out.push([S.includes(p[0])?p[0]:'box',n(1),n(2),n(3),clamp(Math.abs(+p[4])||.2,.01,3),clamp(Math.abs(+p[5])||.2,.01,3),clamp(Math.abs(+p[6])||.2,.01,3),/^#[0-9a-f]{6}$/i.test(p[7])?p[7]:'#a3a2a5',clamp(+p[8]||0,0,3)])}return out}
// texture -> matériau « asset:<id> » utilisable comme n'importe quel matériau
function assetMaterial(id){const key='asset:'+id;if(MATS[key])return key;const a=ASSETS.get(id);if(!a||a.type!=='texture')return null;
  MATS[key]={tex:null,scale:4,shin:20,snd:'plastic',fr:a.name,asset:id};const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');x.imageSmoothingEnabled=false;x.drawImage(im,0,0,128,128);
    MATS[key].tex=glTex(c,true);ASSET_TEX.set(id,{tex:MATS[key].tex})};im.src=a.data;return key}
// sons
async function assetBuffer(id){if(ASSET_BUF.has(id))return ASSET_BUF.get(id);const a=ASSETS.get(id);if(!a||a.type!=='sound'||!AU.ctx)return null;
  const p=(async()=>{const b=await(await fetch(a.data)).arrayBuffer();return AU.ctx.decodeAudioData(b)})().catch(()=>null);ASSET_BUF.set(id,p);return p}
const LOOPS=new Map();
async function playAsset(id,{vol=1,loop=false,key=null,rate=1}={}){audioInit();const buf=await assetBuffer(id);if(!buf)return null;const C=AU.ctx,s=C.createBufferSource(),g=C.createGain();s.buffer=buf;s.loop=loop;s.playbackRate.value=clamp(rate,.25,4);g.gain.value=clamp(vol,0,2)*.8;s.connect(g);g.connect(AU.sfx);s.start();
  if(key){const o=LOOPS.get(key);if(o)try{o.s.stop()}catch(e){}LOOPS.set(key,{s,g})}return{s,g}}
function stopLoops(){for(const o of LOOPS.values())try{o.s.stop()}catch(e){}LOOPS.clear()}
// import d'un son : mono, 16 kHz, 8 bits, 6 s max -> WAV en data URL (léger)
async function importSoundFile(file){audioInit();if(!AU.ctx)throw new Error('audio indisponible');if(file.size>12e6)throw new Error('fichier trop gros (12 Mo max)');
  const raw=await AU.ctx.decodeAudioData(await file.arrayBuffer()).catch(()=>{throw new Error('format audio non reconnu (essaie mp3, wav, ogg)')});
  const SR=16000,dur=Math.min(6,raw.duration),off=new OfflineAudioContext(1,Math.ceil(dur*SR),SR),src=off.createBufferSource();src.buffer=raw;src.connect(off.destination);src.start(0,0,dur);
  const out=await off.startRendering(),d=out.getChannelData(0);let pk=0;for(let i=0;i<d.length;i++)pk=Math.max(pk,Math.abs(d[i]));const k=pk>0?.95/pk:1;
  const n=d.length,buf=new Uint8Array(44+n),v=new DataView(buf.buffer),w=(o,s)=>{for(let i=0;i<s.length;i++)buf[o+i]=s.charCodeAt(i)};
  w(0,'RIFF');v.setUint32(4,36+n,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,SR,true);v.setUint32(28,SR,true);v.setUint16(32,1,true);v.setUint16(34,8,true);w(36,'data');v.setUint32(40,n,true);
  for(let i=0;i<n;i++)buf[44+i]=clamp(Math.round(d[i]*k*127+128),0,255);let s='';for(let i=0;i<buf.length;i+=0x8000)s+=String.fromCharCode.apply(null,buf.subarray(i,i+0x8000));return{data:'data:audio/wav;base64,'+btoa(s),dur}}
// import d'une image -> texture 128 px
function importTextureFile(file){return new Promise((res,rej)=>{if(!/^image\//.test(file.type))return rej(new Error('choisis une image (png, jpg, webp)'));const im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=c.height=128;const x=c.getContext('2d');
    const s=Math.min(im.width,im.height);x.drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,128,128);const u=c.toDataURL('image/webp',.85);res(u.startsWith('data:image/webp')?u:c.toDataURL('image/png'))};im.onerror=()=>rej(new Error('image illisible'));im.src=URL.createObjectURL(file)})}
// mesh : dessin à une position / taille donnée
function meshDraws(parts,m,L,TR){for(const p of parts){const mesh=MESH[p[0]]||MESH.box;const mm=M.mul(m,M.mul(M.T(p[1],p[2],p[3]),M.S(p[4],p[5],p[6])));L.push({mesh,m:mm,mode:3,color:p[7],shin:40,emis:p[8]?(HDR?p[8]*2:p[8]*.5):0})}}
// codes d'échange (Hub -> Studio / Cubik)
async function encodeAsset(a){const raw=new TextEncoder().encode(JSON.stringify({v:1,id:a.id,type:a.type,name:a.name,author:a.author||'',data:a.data,parts:a.parts,slot:a.slot}));
  if(typeof CompressionStream!=='undefined'){try{return'CUBIK-ASSET.1.'+b64u.enc(await zip(raw,true))}catch(e){}}return'CUBIK-ASSET.0.'+b64u.enc(raw)}
async function decodeAssets(text){const codes=String(text||'').match(/CUBIK-ASSET\.[01]\.[A-Za-z0-9_-]+/g);if(!codes)throw new Error('Aucun code CUBIK-ASSET trouvé');const out=[];
  for(const code of codes){const m=code.match(/^CUBIK-ASSET\.([01])\.(.+)$/);let u=b64u.dec(m[2]);if(m[1]==='1')u=await zip(u,false);const a=registerAsset(JSON.parse(new TextDecoder().decode(u)));if(a)out.push(a)}
  if(!out.length)throw new Error('Code abîmé');return out}
// sauvegarde des ressources d'un projet / jeu (un document par ressource)
async function saveAssetDoc(a){await Store.putDoc('asset_'+a.id,a)}
async function loadAssetDocs(ids){await Promise.all((ids||[]).filter(id=>ASSET_ID_RE.test(id)&&!ASSETS.has(id)).map(id=>Store.getDoc('asset_'+id).then(registerAsset).catch(()=>null)))}
function assetsUsedBy(g){const ids=new Set();const scan=s=>{for(const m of String(s||'').matchAll(/\b((?:hub|snd|tex|msh)_[a-z0-9]{4,12})\b/g))ids.add(m[1])};scan(g.script);for(const o of g.objects){for(const k of['tex','sound','mesh'])if(o[k])ids.add(o[k]);scan(o.script)}return[...ids].filter(id=>ASSETS.has(id))}

/* ---------- sons d'horreur et d'ambiance (synthétisés) ---------- */
Object.assign(SFX,{
  scream(){noise(1.1,.45,{type:'bandpass',f:2400,f2:900,q:2,rev:.4});tone('sawtooth',880,1,.12,{f2:300,vib:[22,60],rev:.4});tone('square',1240,.8,.06,{f2:500,vib:[30,80]})},
  heartbeat(){tone('sine',58,.16,.5,{f2:40});tone('sine',52,.18,.4,{f2:36,delay:.24})},
  creak(){tone('sawtooth',140,.9,.05,{f2:90,vib:[8,30],rev:.3});noise(.8,.03,{type:'bandpass',f:600,q:6,rev:.3})},
  whisper(){noise(1.6,.06,{type:'bandpass',f:3200,f2:1800,q:3,rev:.5})},
  door(){tone('square',90,.2,.08,{f2:50});noise(.3,.1,{type:'lowpass',f:700,rev:.3})},
  thunder(){noise(2.4,.4,{type:'lowpass',f:300,f2:60,rev:.5});tone('sine',45,1.8,.3,{f2:30})},
  bell(){tone('sine',392,2.5,.12,{rev:.6});tone('sine',784,1.8,.05,{rev:.6})},
  pickup(){tone('triangle',660,.1,.08,{f2:990});tone('triangle',990,.12,.06,{delay:.08})}});
SONGS.horreur={bpm:62,key:45,prog:[[0,3,6],[1,4,7],[0,3,6],[-1,2,6]],pad:'sawtooth',bass:['0','.','.','.','.','.','.','.','1','.','.','.','.','.','.','.'],arp:{every:4,type:'sine',oct:12},scale:[0,1,3,6,7,10],melType:'sine',
  mel:['.','.','.','.','5','.','.','.','.','.','4','.','.','.','.','.','.','.','.','.','.','.','.','.','2','.','.','.','1','.','.','.'],drums:{k:'x...............',s:'................',h:'................'}};

/* ---------- jumpscare ---------- */
function jumpscare(kind){const d=document.createElement('div');d.className='jumpscare';d.innerHTML=kind==='flash'?'':'<div class="jsface"><i></i><i></i><b></b></div>';document.body.appendChild(d);SFX.scream();shake=Math.max(shake,.6);setTimeout(()=>d.classList.add('out'),650);setTimeout(()=>d.remove(),1300)}
