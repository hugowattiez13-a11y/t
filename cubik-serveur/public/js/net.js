"use strict";
/* ============================================================================
   RÉSEAU : données partagées + salons temps réel
   Deux moteurs : la plateforme Claude (db + room) ou un serveur Cubik
   auto-hébergé (version autonome, WebSocket sur le même hôte).
   ============================================================================ */
const Cloud={mode:'local',db:null,roomApi:null,uid:null,srv:null,ready:null,
  async init(){if(this.ready)return this.ready;this.ready=(async()=>{
      if(window.CUBIK_SERVER){try{this.srv=await ServerConn.open();this.mode='server';this.uid=localUid();return}catch(e){console.warn('serveur injoignable',e)}}
      try{if(typeof window.claude?.use==='function'){const to=ms=>new Promise(r=>setTimeout(()=>r(null),ms));
        const[db,room,user]=await Promise.all([Promise.race([claude.use('db'),to(9000)]),Promise.race([claude.use('room'),to(9000)]),Promise.race([claude.use('user'),to(9000)])]);
        this.db=db;this.roomApi=room;this.uid=user?await Promise.race([user.id(),to(5000)]):null;if(db)this.mode='claude'}}catch(e){}
      if(!this.uid)this.uid=localUid()})();return this.ready},
  online(){return this.mode==='server'||!!this.roomApi},
  shared(){return this.mode==='server'||(this.mode==='claude'&&!!this.db)},
  doc(path){const self=this;return{
    async get(){if(self.mode==='server')return self.srv.rpc({t:'get',k:path});if(self.mode==='claude'){const d=await self.db.doc(path).get();return d.exists?JSON.parse(JSON.stringify(d.data())):null}return lsGet('cd:'+path)},
    async set(v){v=JSON.parse(JSON.stringify(v));if(self.mode==='server')return self.srv.rpc({t:'set',k:path,v});if(self.mode==='claude')return self.db.doc(path).set(v);lsSet('cd:'+path,v);localWatch(path,v)},
    async delete(){if(self.mode==='server')return self.srv.rpc({t:'del',k:path});if(self.mode==='claude')return self.db.doc(path).delete();lsDel('cd:'+path);localWatch(path,null)}}},
  async list(coll,lim=500){if(this.mode==='server')return this.srv.rpc({t:'list',c:coll});if(this.mode==='claude'){const s=await this.db.collection(coll).limit(lim).get();return s.docs.map(d=>({id:d.id,data:JSON.parse(JSON.stringify(d.data()))}))}
    const out=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith('cd:'+coll+'/')&&!k.slice(coll.length+4).includes('/'))out.push({id:k.slice(coll.length+4),data:lsGet(k)})}}catch(e){}return out},
  watch(coll,fn){if(this.mode==='server')return this.srv.watch(coll,fn);
    if(this.mode==='claude'){let first=true;return this.db.collection(coll).onSnapshot(s=>{const ch=s.docChanges?s.docChanges():s.docs.map(d=>({type:'added',doc:d}));fn(ch.map(c=>({id:c.doc.id,data:c.type==='removed'?null:JSON.parse(JSON.stringify(c.doc.data()))})),first);first=false},e=>console.warn(e))}
    const w={coll,fn};LOCAL_W.add(w);return()=>LOCAL_W.delete(w)},
  async room(name){await this.init();if(this.mode==='server')return this.srv.join(name);if(!this.roomApi)return null;try{return name?await this.roomApi.join(name):this.roomApi}catch(e){console.warn('salon',e);return null}}};
const LOCAL_W=new Set();function localWatch(path,v){const i=path.lastIndexOf('/'),c=path.slice(0,i),id=path.slice(i+1);for(const w of LOCAL_W)if(w.coll===c)w.fn([{id,data:v}],false)}
function lsGet(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}}function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){throw new Error('stockage du navigateur plein')}}function lsDel(k){try{localStorage.removeItem(k)}catch(e){}}
function localUid(){let u=lsGet('cubik_uid');if(!u){u='u'+Math.random().toString(36).slice(2,10)+Date.now().toString(36);try{lsSet('cubik_uid',u)}catch(e){}}return u}

/* ---------- serveur Cubik auto-hébergé (version autonome) ---------- */
const ServerConn={async open(){const ws=new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host+'/ws');const c=Object.create(ServerConn.proto);c.ws=ws;c.q=0;c.wait=new Map();c.rooms=new Map();c.watches=new Map();
    await new Promise((res,rej)=>{ws.onopen=res;ws.onerror=rej;setTimeout(()=>rej(new Error('délai')),6000)});ws.onmessage=e=>c.onmsg(JSON.parse(e.data));ws.onclose=()=>{c.closed=true;setTimeout(()=>location.reload(),4000);if(typeof toast==='function')toast('Connexion au serveur perdue… reconnexion')};return c},
  proto:{send(m){if(this.ws.readyState===1)this.ws.send(JSON.stringify(m))},rpc(m){return new Promise((res,rej)=>{const q=++this.q;m.q=q;this.wait.set(q,{res,rej});this.send(m);setTimeout(()=>{if(this.wait.has(q)){this.wait.delete(q);rej(new Error('le serveur ne répond pas'))}},15000)})},
    onmsg(m){if(m.t==='hello'){this.peer=m.peer;return}if(m.t==='res'){const w=this.wait.get(m.q);if(w){this.wait.delete(m.q);m.ok?w.res(m.v??null):w.rej(new Error(m.e||'refusé'))}return}
      if(m.t==='chg'){const s=this.watches.get(m.c);if(s)for(const fn of s)fn([{id:m.id,data:m.v}],false);return}
      const r=this.rooms.get(m.r);if(!r)return;if(m.t==='peers')r._peers(m);if(m.t==='msg')for(const h of r.handlers.get(m.topic)||[])h({topic:m.topic,data:m.d,peer:m.peer,isMe:m.peer===this.peer,sameTab:m.peer===this.peer,by:null,kind:'viewer',guest:false})},
    watch(c,fn){let s=this.watches.get(c);if(!s){s=new Set();this.watches.set(c,s);this.send({t:'sub',c})}s.add(fn);this.rpc({t:'list',c}).then(L=>fn(L.map(d=>({id:d.id,data:d.data})),true)).catch(()=>{});return()=>{s.delete(fn);if(!s.size){this.watches.delete(c);this.send({t:'unsub',c})}}},
    async join(name){name=name||'lobby';if(this.rooms.has(name))return this.rooms.get(name);const c=this;const r={name,map:new Map(),handlers:new Map(),fns:new Set(),snap:[],
        _peers(m){for(const p of m.peers||[])r.map.set(p.peer,{peer:p.peer,presence:p.presence||{},isMe:p.peer===c.peer,sameTab:p.peer===c.peer,by:null,kind:'viewer',guest:false,updatedAt:Date.now()});for(const id of m.left||[])r.map.delete(id);
          r.snap=Object.freeze([...r.map.values()]);const ch={peers:r.snap,joined:(m.joined||[]).map(id=>r.map.get(id)).filter(Boolean),left:(m.left||[]).map(id=>({peer:id})),updated:[]};for(const f of r.fns)f(ch)},
        presence(p){c.send({t:'pres',r:name,p});const me=r.map.get(c.peer);if(me){me.presence={...me.presence,...p}}return Promise.resolve()},
        onPeers(fn){r.fns.add(fn);setTimeout(()=>fn({peers:r.snap,joined:r.snap,left:[],updated:[]}),0);return()=>r.fns.delete(fn)},peers(){return r.snap},
        emit(topic,d){c.send({t:'emit',r:name,topic,d});return Promise.resolve()},on(topic,h){let s=r.handlers.get(topic);if(!s){s=new Set();r.handlers.set(topic,s)}s.add(h);return()=>s.delete(h)},
        connected(){return!c.closed},leave(){c.send({t:'leave',r:name});c.rooms.delete(name);return Promise.resolve()}};this.rooms.set(name,r);this.send({t:'join',r:name});return r}}};

/* ============================================================================
   LOBBY : qui joue à quoi (compteurs de joueurs par jeu et par serveur)
   ============================================================================ */
const Lobby={room:null,peers:[],fns:new Set(),where:'menu',
  async start(){if(this.room!==null)return;this.room=false;const r=await Cloud.room(null);if(!r){this.room=null;return}this.room=r;
    r.onPeers(ch=>{this.peers=ch.peers;for(const f of this.fns)f()},e=>{});this.set(this.where)},
  set(where){this.where=where;if(this.room)this.room.presence({where,n:(ACC?.pseudo||'Joueur').slice(0,20),t:Date.now(),...(ACC&&typeof lobbyExtra==='function'?lobbyExtra():{})}).catch(()=>{})},
  count(prefix){return this.peers.filter(p=>!p.isMe&&String(p.presence?.where||'').startsWith(prefix)).length},
  servers(game){const m=new Map();for(const p of this.peers){const w=String(p.presence?.where||'');if(w.startsWith('game:'+game+':')){const s=w.split(':')[2];m.set(s,(m.get(s)||0)+(p.isMe?0:1))}}return m},
  online(){return this.peers.filter(p=>!p.isMe).length}};
/* répartition : on remplit un serveur jusqu'à 15 joueurs (limite douce), puis les nouveaux arrivants vont sur le suivant.
   On peut quand même rejoindre un ami / choisir un serveur jusqu'à la limite dure (20). */
const MAX_PER_SERVER=20,SOFT_PER_SERVER=15;
const maxFor=g=>GAMES[g]?.maxPlayers||MAX_PER_SERVER;
const softFor=g=>GAMES[g]?.maxPlayers||SOFT_PER_SERVER;
function pickServer(game){const m=Lobby.servers(game),soft=softFor(game);let best=null,bn=-1;
  for(let i=1;i<=60;i++){const s=String(i),n=m.get(s)||0;if(n<soft&&n>bn){best=s;bn=n}if(!m.has(s)&&best)break}
  if(best)return best;for(let i=1;i<=200;i++)if(!m.get(String(i)))return String(i);return'1'}

/* ============================================================================
   MULTIJOUEUR EN JEU : chaque joueur partage sa position, son animation,
   son avatar, le chat, les emotes et son score (présence, ~10 fois/s)
   ============================================================================ */
const MP={room:null,remote:new Map(),seq:0,sendT:0,lastSent:'',chat:null,react:null,server:'1',game:null,unsub:null,
  async start(game,server){this.stop();publishWornItems();this.game=game;this.server=server||pickServer(game);this.priv=String(this.server).startsWith('p')&&START_PRIV?START_PRIV:null;START_PRIV=null;Lobby.set(`game:${game}:${this.server}`);
    const r=await Cloud.room(`g-${game}-${this.server}`.toLowerCase().replace(/[^a-z0-9_.-]/g,'-').slice(0,48));if(!r||this.game!==game)return;this.room=r;
    this.unsub=r.onPeers(ch=>this.sync(ch.peers),e=>{});if(Cloud.mode==='server')voiceListen();sys(String(this.server).startsWith('p')?`🔒 Serveur privé · seuls tes amis invités peuvent venir.`:`🌐 Serveur ${this.server} — invite tes amis (menu Amis) !`)},
  stop(){if(this.unsub)try{this.unsub()}catch(e){}if(this.room&&this.room.leave&&this.room!==Cloud.roomApi)this.room.leave().catch(()=>{});this.room=null;this.unsub=null;
    for(const c of this.remote.values())removeRemote(c);this.remote.clear();this.game=null;this.priv=null;VOICE.listening=null;Lobby.set('menu')},
  // envoi : position arrondie, seulement si quelque chose a changé
  tick(dt){if(!this.room||!pl)return;this.sendT-=dt;if(this.sendT>0)return;const moving=V.len(pl.vel)>.1;this.sendT=moving?.066:.5;
    const r2=v=>Math.round(v*100)/100;const p={n:ACC.pseudo.slice(0,20),av:compactAv(ACC.avatar),p:pl.pos.map(r2),v:pl.vel.map(v=>Math.round(v*10)/10),y:r2(pl.yaw),g:pl.grounded?1:0,
      cl:pl.climb?pl.climb.n.map(r2):0,w:pl.inWater?1:0,sm:pl.swimming?1:0,e:pl.emote||0,d:pl.dance?1:0,dd:pl.dead?1:0,wv:pl.wave>0?1:0,sw:pl.swing>0?1:0,lb:WORLD.lbValue?String(WORLD.lbValue(pl)).slice(0,24):'',lbl:WORLD.lbLabel||'',
      h:pl.held?1:0,gt:typeof myGroupTag==='function'?myGroupTag():'',c:this.chat||0,r:this.react||0,vip:pl.vip?1:0,id:myFid(),t:Date.now(),...(WORLD.mpState?WORLD.mpState():{})};
    const k=JSON.stringify({...p,t:0});if(k===this.lastSent&&this.sendT>0.2)return;this.lastSent=k;this.room.presence(p).catch(()=>{})},
  sendChat(text){this.chat={i:++this.seq,x:text.slice(0,120)};this.sendT=0},sendReact(e){this.react={i:++this.seq,e};this.sendT=0},
  sync(peers){const seen=new Set();for(const P of peers){if(P.isMe||P.kind!=='viewer')continue;const pr=P.presence||{};if(!pr.p||!Array.isArray(pr.p))continue;seen.add(P.peer);
      let c=this.remote.get(P.peer);if(!c){if(this.remote.size>=MAX_PER_SERVER*2)continue;c=addChar(makeChar({name:filterText(String(pr.n||'Joueur')).slice(0,20),remote:true,peer:P.peer,av:expandAv(pr.av),pos:[...pr.p],nameCol:'#7fe3ff',canClimb:false}));
        this.remote.set(P.peer,c);c.target=[...pr.p];sys(`${c.name} a rejoint le serveur.`);SFX.pop(.5)}
      c.target=pr.p.map(Number);c.tAt=performance.now();c.tv=Array.isArray(pr.v)?pr.v.map(Number):[0,0,0];c.tyaw=+pr.y||0;c.grounded=!!pr.g;c.inWater=!!pr.w;c.swimming=!!pr.sm;c.climb=Array.isArray(pr.cl)?{n:pr.cl.map(Number),p:null}:null;
      c.emote=typeof pr.e==='string'?pr.e:null;c.dance=!!pr.d;{const nl=String(pr.lb||'');if(nl.startsWith('🏁')&&c.lb!==undefined&&!String(c.lb).startsWith('🏁')){sys(`🏆 ${c.name} a terminé ! (${nl.slice(2)})`);SFX.win()}c.lb=nl}c.lbl=String(pr.lbl||'');if(pr.wv&&!(c.wave>0))c.wave=1.2;if(pr.sw&&!(c.swing>0))c.swing=.38;
      if(pr.dd&&!c.dead){die(c,false);c.dead=99}else if(!pr.dd&&c.dead){c.dead=0;c.pos=[...c.target]}
      const av=expandAv(pr.av);if(JSON.stringify(av)!==JSON.stringify(c.av))c.av=av;
      if(pr.c&&pr.c.i!==c.lastChat){c.lastChat=pr.c.i;if(c.seenChat)say(c,String(pr.c.x||''));c.seenChat=true}else if(!c.seenChat)c.seenChat=true;
      {const gt=String(pr.gt||'').replace(/[^A-Z0-9]/g,'').slice(0,5);if(gt!==(c.gt||'')){c.gt=gt;const tg=c.bw&&c.bw.querySelector('.tag');if(tg)tg.textContent=(gt?`[${gt}] `:'')+c.name}}c.vip=!!pr.vip;c.fid=typeof pr.id==='string'?pr.id.slice(0,60):null;if(c.vip&&!c.name.startsWith('👑')){c.name='👑 '+c.name;c.nameCol='#ffd23f'}if(WORLD.onRemote)try{WORLD.onRemote(c,pr)}catch(e){console.warn(e)}
      if(pr.r&&pr.r.i!==c.lastReact){if(c.lastReact!==undefined)react(c,String(pr.r.e||'👍').slice(0,8));c.lastReact=pr.r.i}else if(c.lastReact===undefined)c.lastReact=pr.r?.i??0}
    for(const[id,c]of this.remote)if(!seen.has(id)){if(WORLD.onRemoteLeave)try{WORLD.onRemoteLeave(c)}catch(e){}removeRemote(c);this.remote.delete(id);sys(`${c.name} a quitté le serveur.`)}renderPlist()},
  // interpolation douce des autres joueurs
  step(dt){voiceStep(dt);for(const c of this.remote.values()){if(!c.target||c.dead)continue;const age=Math.min(.25,(performance.now()-(c.tAt||0))/1000+.04),pred=V.add(c.target,V.mul(c.tv||[0,0,0],c.grounded||c.swimming?age:age*.6));const d=V.sub(pred,c.pos);
      if(V.len(d)>12)c.pos=[...c.target];else c.pos=V.add(c.pos,V.mul(d,Math.min(1,dt*10)));c.vel=c.tv||[0,0,0];c.yaw=angLerp(c.yaw,c.tyaw,Math.min(1,dt*12));if(c.climb)c.cphase+=dt*6*Math.abs(c.vel[1]||0);
      const hs=Math.hypot(c.vel[0],c.vel[2]);c.phase+=hs*dt*1.5;if(c.swimming)c.swimPhase=(c.swimPhase||0)+dt*(hs>1?6:2.4)}}};
function removeRemote(c){c.left=true;c.bw&&c.bw.remove();const i=chars.indexOf(c);if(i>=0)chars.splice(i,1);const j=npcs.indexOf(c);if(j>=0)npcs.splice(j,1)}
// avatar compact (ids seulement) pour tenir dans la présence
const AV_KEYS=['skin','haut','bas','visage','chapeau','cheveux','lunettes','dos','cou','epaule'];
function compactAv(av){const b=av.body;return[...AV_KEYS.map(k=>av[k]||''),b?[b.t||'classique',+(+b.h).toFixed(2),+(+b.w).toFixed(2),+(+b.hd).toFixed(2)].join(','):'']}
function expandAv(a){const o={...DEFAULT_AV};if(Array.isArray(a))AV_KEYS.forEach((k,i)=>{const v=a[i];if(k==='skin'){if(/^#[0-9a-f]{6}$/i.test(v))o.skin=v}else o[k]=v&&typeof v==='string'&&!IT[v]&&typeof PUB_RE!=='undefined'&&PUB_RE.test(v)&&requestPubItem(v),o[k]=v&&IT[v]&&IT[v].cat===(k)?v:(['haut','bas','visage'].includes(k)?DEFAULT_AV[k]:null)});if(Array.isArray(a)&&typeof a[10]==='string'&&a[10]){const[t,h,w,hd]=a[10].split(',');if(typeof BODY_PRESETS!=='undefined'&&BODY_PRESETS[t])o.body={t,h:+h,w:+w,hd:+hd}}return o}
