"use strict";
/* ============================================================================
   MULTIJOUEUR 2.0 : un joueur « hôte » (le plus petit identifiant du serveur)
   fait tourner les monstres/zombies et les partage ; les autres les voient au
   même endroit, les frappent (les coups sont envoyés à l'hôte) et se font
   attraper pour de vrai. Si l'hôte part, un autre reprend la main.
   ============================================================================ */
const MS={seq:0,out:[],last:new Map(),hostFid:null,hT:0,isH:true};
function msHost(){if(!MP.room||!MP.remote.size){MS.isH=true;MS.hostFid=typeof myFid==='function'&&ACC?myFid():null;return true}
  if(performance.now()-MS.hT>500){MS.hT=performance.now();const ids=[myFid(),...[...MP.remote.values()].map(c=>c.fid).filter(Boolean)].sort();MS.hostFid=ids[0];MS.isH=ids[0]===myFid()}return MS.isH}
function msHit(id,d){MS.out.push([++MS.seq,id,Math.round(d*10)/10]);if(MS.out.length>24)MS.out.shift();MP.sendT=Math.min(MP.sendT,.05)}
function msHits(c,pr,apply){if(!Array.isArray(pr.mh)||!msHost())return;const k=c.fid||c.name,last=MS.last.get(k)||0;let mx=last;for(const h of pr.mh){if(!Array.isArray(h))continue;const[s,id,d]=h;if(!(s>last))continue;mx=Math.max(mx,s);try{apply(id,+d||0,c)}catch(e){}}MS.last.set(k,mx)}
function msNearest(from){let best=pl&&!pl.dead&&!pl.hidden?pl:null,bd=best?V.len(V.sub(pl.pos,from)):1e9;for(const c of MP.remote.values()){if(c.dead||c.hidden)continue;const d=V.len(V.sub(c.pos,from));if(d<bd){bd=d;best=c}}return best}
const r2=v=>Math.round(v*100)/100;
// ---------- KIT (zombies) ----------
(()=>{const dmg0=KIT.damage.bind(KIT);KIT.damage=function(G,c,dm,kb,dir,onDie){if(G.net&&!msHost()&&c.netId){floatText(V.add(c.pos,[0,3.1,0]),String(Math.round(dm)),'#ffffff');sparks(V.add(c.pos,[0,1.4,0]),[3,1,1],6,.6);SFX.hit?.();c.hitMe=performance.now();msHit(c.netId,dm);return}return dmg0(G,c,dm,kb,dir,onDie)};
  const step0=KIT.mobsStep.bind(KIT);KIT.mobsStep=function(G,dt,onDie){if(!G.net)return step0(G,dt,onDie);
    if(!msHost()){for(const c of G.mobs){if(c.netT){c.pos=V.add(c.pos,V.mul(V.sub(c.netT,c.pos),Math.min(1,dt*10)));const d=V.sub(c.netT,c.pos);c.forceWish=[0,0,0];c.vel=[d[0]*6,c.vel[1],d[2]*6];c.yaw=lerpAngle?lerpAngle(c.yaw,c.netY||0,Math.min(1,dt*10)):c.netY||0}
        const m=c.mob;m.cd-=dt;const L=V.len(V.sub([pl.pos[0],0,pl.pos[2]],[c.pos[0],0,c.pos[2]]));if(L<(m.reach||1.7)&&m.cd<=0&&Math.abs(pl.pos[1]-c.pos[1])<2.5){m.cd=m.rate||1;c.swing=.3;KIT.hurt(G,m.dmg)}}return}
    for(const c of[...G.mobs]){const m=c.mob;m.cd-=dt;if(m.slow>0)m.slow-=dt;if(c.dead)continue;const tg=msNearest(c.pos);if(!tg){c.forceWish=[0,0,0];continue}
      const d=V.sub(tg.pos,c.pos);d[1]=0;const L=V.len(d);c.walk=m.speed*(m.slow>0?.45:1);c.forceWish=L>1.1?V.mul(d,1/L):[0,0,0];
      if(tg===pl&&L<(m.reach||1.7)&&m.cd<=0&&Math.abs(pl.pos[1]-c.pos[1])<2.5){m.cd=m.rate||1;c.swing=.3;KIT.hurt(G,m.dmg)}}}})();
function lerpAngle(a,b,k){let d=((b-a+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;return a+d*k}
// ---------- Nuit des Zombies en réseau ----------
(()=>{const Z=GAMES.zombies,b0=Z.build,u0=Z.update,mob0=KIT.mob.bind(KIT);
  const DEF=n=>({z:{name:'Zombie',av:'zombie',hp:55+n*16,speed:4.4+Math.min(2.8,n*.09),dmg:14,rate:1,pts:12},c:{name:'Coureur',av:'zcourt',hp:30+n*7,speed:7.5+Math.min(2,n*.06),dmg:8,rate:.7,pts:20},b:{name:'Brute',av:'zbrute',hp:150+n*25,speed:3.6,dmg:22,rate:1.3,reach:2,pts:45},x:{name:'☠️ Mégazombie',av:'zbrute',hp:900+n*130,speed:4.6,dmg:30,rate:1.2,reach:2.2,pts:250,boss:1}});
  Z.build=function(sv){b0.call(this,sv);this.net=true;this.nid=0};
  KIT.mob=function(G,def,pos){const c=mob0(G,def,pos);if(G.net){c.netId=c.netId||((G.nid=(G.nid||0)+1)+'.'+Math.random().toString(36).slice(2,5));c.mob.k=def.boss?'x':def.av==='zcourt'?'c':def.av==='zbrute'?'b':'z'}return c};
  Z.mpState=function(){const G=this,o={zw:G.wave};if(msHost()){o.mob=G.mobs.slice(0,28).map(c=>[c.netId,c.mob.k,r2(c.pos[0]),r2(c.pos[1]),r2(c.pos[2]),r2(c.yaw),Math.round(c.mob.hp)]);o.zl=G.left;o.zb=Math.ceil(G.break);o.zs=G.toSpawn}else o.mh=MS.out;return o};
  Z.onRemote=function(c,pr){const G=this;c.lb=pr.zw?'Vague '+pr.zw:'';
    msHits(c,pr,(id,d)=>{const m=G.mobs.find(x=>x.netId===id);if(m)KIT.damage(G,m,d,3,null,(cc,mm)=>{G.left--;G.pts+=Math.round(mm.pts/2)})});
    if(!Array.isArray(pr.mob)||msHost()||c.fid!==MS.hostFid)return;G.wave=+pr.zw||G.wave;G.left=+pr.zl||0;G.break=+pr.zb||0;G.toSpawn=+pr.zs||0;const seen=new Set();
    for(const e of pr.mob){if(!Array.isArray(e))continue;const[id,k,x,y,z,yw,hp]=e;seen.add(id);let m=G.mobs.find(q=>q.netId===id);
      if(!m){const D=DEF(G.wave||1)[k]||DEF(1).z;m=mob0(G,{...D,name:D.boss?`☠️ Mégazombie`:D.name},[x,y,z]);m.netId=id;m.mob.k=k}m.netT=[+x,+y,+z];m.netY=+yw;m.mob.hp=+hp}
    for(const m of[...G.mobs])if(!seen.has(m.netId)){if(m.hitMe&&performance.now()-m.hitMe<2500){G.pts+=m.mob.boss?250:m.mob.pts;floatText(V.add(pl.pos,[0,3.4,0]),'+'+(m.mob.boss?250:m.mob.pts)+' pts','#7dffb0')}sparks(V.add(m.pos,[0,1.2,0]),[2,3,1],14);KIT.kill(G,m)}};
  Z.update=function(dt,t){const G=this;if(!msHost()){const keep={toSpawn:G.toSpawn,brk:G.break,left:G.left};G.toSpawn=0;G.break=1e9;u0.call(this,dt,t);G.toSpawn=keep.toSpawn;G.break=keep.brk;G.left=keep.left;
      $('zT').textContent=G.wave?`Vague ${G.wave} / 30`:'Préparez-vous…';$('zS').textContent=(G.left>0||G.mobs.length?`🧟 ${Math.max(G.left,G.mobs.length)} zombies restants`:`Prochaine vague dans ${Math.max(0,G.break)} s`)+' · 🌐 hôte : '+(MS.hostFid||'?').replace(/^[sc]_(\w+_)?/,'');return}
    u0.call(this,dt,t)}})();
