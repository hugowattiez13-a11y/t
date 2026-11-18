"use strict";
/* ============================== MONDE ============================== */
const blocks=[],signs=[],decos=[],waters=[],trees=[],chars=[],npcs=[],killers=[],extras=[];
let solids=[],SPAWN={pos:[0,0,0],size:[6,.2,6]},pl=null,WORLD={};
const refreshSolids=()=>{solids=blocks.filter(b=>!b.off&&!b.nocol)};
function resetWorld(){for(const a of[blocks,signs,decos,waters,trees,npcs,killers,extras,parts,debris,glows])a.length=0;
  for(const c of chars)c.bw&&c.bw.remove();chars.length=0;solids=[];SPAWN={pos:[0,0,0],size:[6,.2,6]};WORLD={motes:false}}
function B(x,y,z,sx,sy,sz,o={}){const p={pos:[x,y,z],size:[sx,sy,sz],base:[x,y,z],mat:'plastique',color:'#ffffff',kind:'solid',delta:[0,0,0],...o};
  if(p.kind==='lava')p.mat='lave';if(p.kind==='bounce')p.mat='trampoline';if(p.kind==='conv')p.mat='tapis';blocks.push(p);bmat(p);return p}
const bmat=p=>{p.m=M.mul(M.T(...p.pos),M.S(...p.size));p.nm=M.tr(M.inv(p.m))};
const D=(x,y,z,sx,sy,sz,color,emis=0)=>decos.push({pos:[x,y,z],size:[sx,sy,sz],color,emis});
const SIGN_CACHE=new Map();
function cachedSignTex(text,o){const k=text+'|'+(o.w||'')+(o.h||'')+(o.bg1||'')+(o.ink||'');let t=SIGN_CACHE.get(k);if(t){SIGN_CACHE.delete(k);SIGN_CACHE.set(k,t);return t}
  t=signTexEx(text,o);SIGN_CACHE.set(k,t);if(SIGN_CACHE.size>60){const[k0,t0]=SIGN_CACHE.entries().next().value;if(!signs.some(s=>s.tex===t0)){gl.deleteTexture(t0);SIGN_CACHE.delete(k0)}}return t}
function SIGN(x,y,z,text,post=true,o={}){const s={pos:[x,y,z],tex:o.cache?cachedSignTex(text,o):signTexEx(text,o),yaw:o.yaw||0,text,o};signs.push(s);if(post)B(x,y/2-.3,z-.15*Math.cos(s.yaw),.25,y-.6,.25,{mat:'bois'});return s}
function setSign(s,text){if(s.text===text)return;s.text=text;updateTex(s.tex,signCanvas(text,s.o))}
// bûche : cylindre texturé (écorce + cernes), collision en boîte
function LOG(x,y,z,len,d,axis='x'){const size=axis==='x'?[len,d,d]:axis==='z'?[d,d,len]:[d,len,d];return B(x,y,z,...size,{mat:'buche',shape:'log',axis,len,d})}
function TREE(x,z,h=3,s=3,leaf='feuillage'){LOG(x,h/2,z,h,.8,'y');B(x,h+s*.4,z,s,s*.8,s,{mat:leaf});B(x,h+s*.9,z,s*.6,s*.5,s*.6,{mat:leaf});trees.push([x,h+s*.4,z])}
const bnd=p=>({mn:V.sub(p.pos,V.mul(p.size,.5)),mx:V.add(p.pos,V.mul(p.size,.5))});
function finalizeWorld(){for(const p of blocks)bmat(p);refreshSolids()}
// Hitbox = forme exacte du modèle : jambes (0→1), torse + bras (1→2,02), tête (2,02→2,64)
const HB=[[0,1,.47,.25],[1,2.02,.96,.26],[2.02,2.64,.35,.35]];
const HW=.96,HD=.26,H=2.64,STEP=.55,GRAV=40,JUMP=13,WALK=8,CLIMB=5.2,BOUNCE=25;
function sat(c,b){let best=null,bl=0;for(const h of HB){if(c.pos[1]+h[0]>=b.mx[1]-1e-4||c.pos[1]+h[1]<=b.mn[1]+1e-4)continue;const m=sat1(c,b,h[2],h[3]);if(m){const l=Math.hypot(m[0],m[1]);if(l>bl){bl=l;best=m}}}return best}
function sat1(c,b,HW,HD){const ux=Math.cos(c.yaw),uz=-Math.sin(c.yaw),fx=Math.sin(c.yaw),fz=Math.cos(c.yaw);
  const bx=(b.mx[0]-b.mn[0])/2,bz=(b.mx[2]-b.mn[2])/2,dx=(b.mx[0]+b.mn[0])/2-c.pos[0],dz=(b.mx[2]+b.mn[2])/2-c.pos[2];let best=1e9,r=null;
  for(const[a0,a1]of[[1,0],[0,1],[ux,uz],[fx,fz]]){const rp=HW*Math.abs(ux*a0+uz*a1)+HD*Math.abs(fx*a0+fz*a1),rb=bx*Math.abs(a0)+bz*Math.abs(a1),d=dx*a0+dz*a1,o=rp+rb-Math.abs(d);
    if(o<=1e-5)return null;if(o<best){best=o;const s=d>0?-1:1;r=[a0*s*o,a1*s*o]}}return r}
const yOv=(c,b)=>c.pos[1]<b.mx[1]-1e-4&&c.pos[1]+H>b.mn[1]+1e-4;
function resolveH(c,wasG){let block=null;
  for(let it=0;it<4;it++){let any=false;
    for(const p of solids){const b=bnd(p);if(!yOv(c,b))continue;const m=sat(c,b);if(!m)continue;const step=b.mx[1]-c.pos[1];
      if(wasG&&!c.climb&&step>0&&step<=STEP){c.pos[1]=b.mx[1];any=true;continue}
      c.pos[0]+=m[0];c.pos[2]+=m[1];any=true;const l=Math.hypot(m[0],m[1]),nx=m[0]/l,nz=m[1]/l,vn=c.vel[0]*nx+c.vel[2]*nz;
      if(vn<0){c.vel[0]-=vn*nx;c.vel[2]-=vn*nz}if(!block||b.mx[1]>block.top)block={top:b.mx[1],p}}
    if(!any)break}return block}
function moveV(c,dy){c.pos[1]+=dy;
  for(const p of solids){const b=bnd(p);if(!yOv(c,b)||!sat(c,b))continue;
    if(dy<=0&&b.mx[1]-c.pos[1]<.7){c.pos[1]=b.mx[1];c.vel[1]=0;c.grounded=true;c.ground=p}
    else if(dy>0&&c.pos[1]+H-b.mn[1]<.7){c.pos[1]=b.mn[1]-H;c.vel[1]=Math.min(0,c.vel[1])}}}
function probe(c,h,ahead){const f=[Math.sin(c.yaw),0,Math.cos(c.yaw)];return V.add(c.pos,[f[0]*(HD+ahead),h,f[2]*(HD+ahead)])}
const inside=(pt,p,e=.05)=>{const b=bnd(p);return pt[0]>b.mn[0]-e&&pt[0]<b.mx[0]+e&&pt[1]>b.mn[1]-e&&pt[1]<b.mx[1]+e&&pt[2]>b.mn[2]-e&&pt[2]<b.mx[2]+e};
function faceNormal(c,p){const dx=c.pos[0]-p.pos[0],dz=c.pos[2]-p.pos[2];return Math.abs(dx)/(p.size[0]/2)>Math.abs(dz)/(p.size[2]/2)?[Math.sign(dx)||1,0,0]:[0,0,Math.sign(dz)||1]}

/* ---------- escalade façon Roblox ---------- */
function startClimb(c,p,n){n=n||faceNormal(c,p);const b=bnd(p),to=[...c.pos];
  if(n[0]){to[0]=(n[0]>0?b.mx[0]:b.mn[0])+n[0]*(HD+.01);to[2]=clamp(c.pos[2],b.mn[2]+.1,b.mx[2]-.1);if(p.wrap)to[2]=p.pos[2]}
  else{to[2]=(n[2]>0?b.mx[2]:b.mn[2])+n[2]*(HD+.01);to[0]=clamp(c.pos[0],b.mn[0]+.1,b.mx[0]-.1);if(p.wrap)to[0]=p.pos[0]}
  c.climb={p,n,att:0,from:[...c.pos],to,yawFrom:c.yaw,yawTo:Math.atan2(-n[0],-n[2])};c.vel=[0,0,0];c.climbAcc=0;
  if(c.isPlayer){SFX.grab();}}
function stopClimb(c,cd=.25){c.climb=null;c.climbCd=cd}
function startMantle(c){const cl=c.climb,b=bnd(cl.p),n=cl.n;stopClimb(c,.3);
  const to=[c.pos[0]-n[0]*(HD+.5),b.mx[1]+.02,c.pos[2]-n[2]*(HD+.5)];c.mantle={t:0,from:[...c.pos],to,p:cl.p};
  if(c.isPlayer)SFX.mantle();dust(V.add(to,[0,.05,0]),[.8,.78,.74],5,1.2)}

function stepChar(c,dt,t,inp){
  c.climbCd-=dt;c.jumpBuf-=dt;if(inp.jump)c.jumpBuf=.15;
  if(c.swimming&&!c.mantle&&!c.climb){if(swimStep(c,dt,t,inp))return}
  const wl=Math.min(1,V.len(inp.wish));
  /* hisse en haut d'une paroi */
  if(c.mantle){const m=c.mantle;m.t+=dt/.42;const k=Math.min(1,m.t),ky=1-Math.pow(1-Math.min(1,k*1.5),3),kh=clamp((k-.35)/.65,0,1),ks=kh*kh*(3-2*kh);
    c.pos=[lerp(m.from[0],m.to[0],ks),lerp(m.from[1],m.to[1],ky),lerp(m.from[2],m.to[2],ks)];c.vel=[0,0,0];
    if(k>=1){c.mantle=null;c.grounded=true;c.ground=m.p;c.climbCd=.25;if(c.isPlayer)SFX.step(MATS[m.p.mat]?.snd||'stone',1)}return}
  /* escalade */
  if(c.climb){const cl=c.climb,n=cl.n,sd=[n[2],0,-n[0]];
    if(cl.att<1){cl.att=Math.min(1,cl.att+dt/.14);const e=1-Math.pow(1-cl.att,3);c.pos[0]=lerp(cl.from[0],cl.to[0],e);c.pos[2]=lerp(cl.from[2],cl.to[2],e);c.yaw=angLerp(cl.yawFrom,cl.yawTo,e);return}
    const up=inp.iz,side=inp.ix;
    if(c.jumpBuf>0){c.jumpBuf=0;stopClimb(c,.35);c.vel=[n[0]*7.5,10,n[2]*7.5];c.yaw=Math.atan2(n[0],n[2]);if(c.isPlayer)SFX.jump();dust(V.add(c.pos,[0,1,0]),[.8,.78,.74],5,1);return}
    c.vel=[sd[0]*side*2.8,up*CLIMB,sd[2]*side*2.8];c.grounded=false;
    c.pos[0]+=c.vel[0]*dt;c.pos[2]+=c.vel[2]*dt;resolveH(c,false);moveV(c,c.vel[1]*dt);
    const mv=Math.abs(c.vel[1])*dt+Math.abs(side)*2.8*dt;c.cphase+=mv*Math.PI/.62;c.climbAcc+=mv;
    if(c.climbAcc>.62){c.climbAcc-=.62;if(c.isPlayer)SFX.climb(cl.p.climb);const hp=V.add(c.pos,[0,2.1,0]);dust(V.add(hp,V.mul(n,-.3)),[.75,.72,.68],2,.5)}
    const p=cl.p,b=bnd(p),chest=probe(c,1.4,.16),waist=probe(c,.5,.16);
    if(chest[1]>b.mx[1]&&up>0)startMantle(c);
    else if(c.grounded&&up<0)stopClimb(c,.2);
    else if(!inside(chest,p,.1)&&!inside(waist,p,.1)){
      if(p.wrap&&side!==0)startClimb(c,p,V.mul(sd,Math.sign(side)));   // contourne l'angle du treillis
      else stopClimb(c,.2)}
    return}
  /* marche / saut */
  const mat=c.ground?MATS[c.ground.mat]||{}:{};
  const spd=(c.walk||WALK)*(mat.speed||1)*(c.inWater?.6:1),fr=c.grounded?16*(mat.fric??1):5;
  c.vel[0]=lerp(c.vel[0],inp.wish[0]*spd,Math.min(1,fr*dt));c.vel[2]=lerp(c.vel[2],inp.wish[2]*spd,Math.min(1,fr*dt));
  if(wl>.05)c.yaw=angLerp(c.yaw,Math.atan2(inp.wish[0],inp.wish[2]),Math.min(1,dt*14));
  c.coyote=c.grounded?.1:c.coyote-dt;
  if(c.jumpBuf>0&&c.coyote>0){c.vel[1]=c.jumpV||JUMP;c.coyote=0;c.jumpBuf=0;c.grounded=false;c.jumps++;if(c.isPlayer)SFX.jump();else SFX.jump(distVol(c));dust(V.add(c.pos,[0,.05,0]),dustCol(mat),6,1.4);ring(c.pos,dustCol(mat),1.2,.35)}
  if(c.doubleJump&&c.jumpBuf>0&&c.coyote<=0&&!c.djUsed&&!c.grounded){c.djUsed=true;c.jumpBuf=0;c.vel[1]=(c.jumpV||JUMP)*.9;if(c.isPlayer)SFX.jump();ring(c.pos,[1.6,2.4,4],1.4,.35,true);c.wave=0}
  if(c.grounded)c.djUsed=false;
  c.vel[1]=Math.max(c.vel[1]-GRAV*(WORLD.grav||1)*dt,-48);
  if(c.grounded&&c.ground){if(c.ground.move)c.pos=V.add(c.pos,c.ground.delta);if(c.ground.kind==='conv')c.pos=V.add(c.pos,V.mul(c.ground.dir,c.ground.speed*dt))}
  const wasG=c.grounded,vy0=c.vel[1];c.grounded=false;c.ground=null;
  c.pos[0]+=c.vel[0]*dt;c.pos[2]+=c.vel[2]*dt;const blk=resolveH(c,wasG);moveV(c,c.vel[1]*dt);
  if(!wasG&&c.grounded)onLand(c,-vy0);
  if(c.autoJump&&wasG&&blk&&!blk.p.climb&&wl>.3){const dh=blk.top-c.pos[1];if(dh>STEP&&dh<2.05)c.jumpBuf=.1}
  if(c.canClimb&&c.climbCd<=0&&wl>.05){const fw=[Math.sin(c.yaw),0,Math.cos(c.yaw)];
    if(V.dot(inp.wish,fw)>.5){const pt=probe(c,1.4,.2);for(const p of blocks)if(p.climb&&inside(pt,p)){startClimb(c,p);break}}}
  const g=c.ground;
  if(g&&g.kind==='bounce'){c.vel[1]=BOUNCE;c.grounded=false;c.land=0;SFX.boing(distVol(c));sparks(V.add(c.pos,[0,.2,0]),[2.5,.6,1.6],14);ring(c.pos,[2.4,.6,1.5],2.2,.5,true);if(c.isPlayer){fovKick=9}}
  // eau : on nage quand l'eau dépasse un certain niveau de la hitbox (réglable par bloc d'eau)
  const W=waterAt(c);const nowW=!!W;
  if(nowW&&!c.inWater){splash([c.pos[0],W.top,c.pos[2]],Math.min(1.5,Math.abs(vy0)/10+.4));SFX.splash(distVol(c))}c.inWater=nowW;
  if(W&&(W.top-c.pos[1])/H>=W.swimAt&&!c.climb){if(!c.swimming){c.swimming=true;c.strokeT=0;if(c.isPlayer)SFX.dive()}}
  // pas
  const hs=Math.hypot(c.vel[0],c.vel[2]);
  if(c.grounded&&hs>1){c.stepAcc+=hs*dt;if(c.stepAcc>1.25){c.stepAcc=0;const sn=c.inWater?'water':(mat.snd||'plastic');SFX.step(sn,distVol(c));
    if(sn==='sand'||sn==='grass'||sn==='ice'||c.inWater||Math.random()<.35)dust(V.add(c.pos,[0,.05,0]),c.inWater?[.7,.85,1]:dustCol(mat),c.inWater?4:2,.6)}}
}
function waterAt(c){for(const w of waters){if(Math.abs(c.pos[0]-w.pos[0])<w.size[0]/2&&Math.abs(c.pos[2]-w.pos[2])<w.size[2]/2){const top=w.pos[1]+w.size[1]/2,bot=w.pos[1]-w.size[1]/2;if(c.pos[1]+.15<top&&c.pos[1]+H>bot)return{w,top,swimAt:w.swimAt??.55,cur:w.current}}}return null}
// nage : flottaison à hauteur d'épaules, Espace = remonter, brasses + bulles + clapotis
function swimStep(c,dt,t,inp){const W=waterAt(c);if(!W||(W.top-c.pos[1])/H<W.swimAt-.12){c.swimming=false;return false}
  const wl=Math.min(1,V.len(inp.wish)),spd=(c.walk||WALK)*.62;c.vel[0]=lerp(c.vel[0],inp.wish[0]*spd,Math.min(1,dt*4));c.vel[2]=lerp(c.vel[2],inp.wish[2]*spd,Math.min(1,dt*4));
  if(wl>.05)c.yaw=angLerp(c.yaw,Math.atan2(inp.wish[0],inp.wish[2]),Math.min(1,dt*8));
  const floatY=W.top-H*.72,up=inp.up||c.jumpBuf>0,dive=inp.down;let ty=(floatY-c.pos[1])*3;if(up)ty=4.2;if(dive)ty=-3.2;c.vel[1]=lerp(c.vel[1],ty,Math.min(1,dt*3));
  if(W.cur)c.pos=V.add(c.pos,V.mul(W.cur,dt));
  // sortie de l'eau : saut quand on arrive au bord
  if(c.jumpBuf>0&&c.pos[1]>floatY-.2){const near=solids.some(p=>{const b=bnd(p);return b.mx[1]>W.top-.2&&b.mx[1]<W.top+1.6&&sat(c,{mn:V.sub(b.mn,[.6,0,.6]),mx:V.add(b.mx,[.6,0,.6])})});if(near){c.jumpBuf=0;c.swimming=false;c.vel[1]=JUMP*.95;if(c.isPlayer)SFX.jump();splash([c.pos[0],W.top,c.pos[2]],.8);return true}}
  c.grounded=false;c.ground=null;c.pos[0]+=c.vel[0]*dt;c.pos[2]+=c.vel[2]*dt;resolveH(c,false);moveV(c,c.vel[1]*dt);if(c.grounded&&(W.top-c.pos[1])/H<W.swimAt){c.swimming=false}
  c.swimPhase=(c.swimPhase||0)+dt*(wl>.1?6:2.4);c.strokeT=(c.strokeT||0)-dt;
  if(wl>.1&&c.strokeT<=0){c.strokeT=.52;SFX.swim(distVol(c));splash([c.pos[0]+Math.sin(c.yaw)*.6,W.top,c.pos[2]+Math.cos(c.yaw)*.6],.35)}
  if(Math.random()<dt*(wl>.1?14:4))emit({pos:V.add(c.pos,[rnd(-.3,.3),H*.55,rnd(-.3,.3)]),vel:[rnd(-.2,.2),rnd(.6,1.2),rnd(-.2,.2)],life:rnd(.5,1),size:.06,size1:.1,col:[.8,1,1.2],alpha:.6,shape:1});
  if(Math.random()<dt*(wl>.1?10:3))emit({pos:[c.pos[0]+rnd(-.6,.6),W.top+.02,c.pos[2]+rnd(-.6,.6)],vel:[0,0,0],life:.8,size:.2,size1:1,col:[.9,.97,1],alpha:.35,shape:1,flat:1});
  c.inWater=true;return true}
function onLand(c,impact){const mat=MATS[c.ground?.mat]||{};
  if(impact>6){c.land=clamp(impact/26,.2,1);SFX.land(clamp(impact/30,.2,1),mat.snd||'plastic',distVol(c));dust(V.add(c.pos,[0,.05,0]),dustCol(mat),Math.round(impact/3),impact/10);
    if(impact>14){ring(c.pos,dustCol(mat),1+impact/14,.45);if(mat.snd==='metal')sparks(V.add(c.pos,[0,.1,0]),[3,2,1],10,.6);else if(mat.snd==='stone')chips(c.pos,'#8d8a84',6);else if(mat.snd==='wood')chips(c.pos,'#9a6a3a',5);else if(mat.snd==='snow'||mat.snd==='sand')dust(V.add(c.pos,[0,.05,0]),dustCol(mat),8,2.2)}if(c.isPlayer&&impact>24)shake=Math.min(.35,impact/120)}}
function dustCol(mat){const m={snow:[.95,.97,1],fabric:[.8,.78,.85],sand:[.86,.78,.6],grass:[.55,.7,.4],ice:[.9,.97,1],wood:[.7,.6,.5],metal:[.75,.75,.78],glass:[.9,.95,1]};return m[mat.snd]||[.82,.8,.76]}
function distVol(c){return c.isPlayer?1:clamp(1-V.len(V.sub(c.pos,pl.pos))/30,0,1)}

function die(c,lava){if(c.dead||c.left)return;c.dead=1.4;stopClimb(c);c.mantle=null;c.emote=null;c.dance=false;SFX.die(lava,distVol(c));WORLD.onDeath&&WORLD.onDeath(c);
  for(let i=0;i<20;i++){const a=Math.random()*6.28,u=Math.random()*7;debris.push({pos:V.add(c.pos,[0,1.3,0]),vel:[Math.cos(a)*u,rnd(4,10),Math.sin(a)*u],life:rnd(1,1.6),color:pick(avColors(c.av)),size:rnd(.16,.3),rot:Math.random()*6})}
  if(lava){for(let i=0;i<30;i++)emit({pos:V.add(c.pos,[rnd(-.5,.5),rnd(0,2),rnd(-.5,.5)]),vel:[rnd(-2,2),rnd(2,7),rnd(-2,2)],life:rnd(.5,1.2),size:rnd(.15,.35),size1:0,col:[4,1.2,.2],add:1,shape:2,grav:3});
    for(let i=0;i<10;i++)emit({pos:V.add(c.pos,[rnd(-.4,.4),rnd(.5,2),rnd(-.4,.4)]),vel:[rnd(-.6,.6),rnd(1.5,3),rnd(-.6,.6)],life:rnd(1.2,2),size:.4,size1:1.6,col:[.18,.16,.16],alpha:.55,drag:.6})}
  else ring(c.pos,[1,1,1],2,.4);
  if(c.isPlayer)shake=.3}
function respawn(c){if(c.left)return;const s=c.isPlayer?(WORLD.spawn?WORLD.spawn(c):[SPAWN.pos[0],SPAWN.pos[1]+SPAWN.size[1]/2+.05,SPAWN.pos[2]]):c.ai.home;c.pos=[s[0]+rnd(-1,1),s[1]+.05,s[2]+rnd(-1,1)];WORLD.onRespawn&&WORLD.onRespawn(c);c.vel=[0,0,0];c.dead=0;c.ground=null;c.yaw=Math.PI;c.climb=null;c.mantle=null;
  for(let i=0;i<26;i++)emit({pos:V.add(c.pos,[rnd(-.7,.7),rnd(0,.3),rnd(-.7,.7)]),vel:[0,rnd(2,6),0],life:rnd(.6,1.3),size:rnd(.08,.18),size1:0,col:[1.2,2.2,3.5],add:1,shape:2,drag:.5});
  emit({pos:V.add(c.pos,[0,1.4,0]),vel:[0,0,0],life:.6,size:1.6,size1:2.4,col:[.8,1.6,3],add:1,shape:0,alpha:.7});ring(c.pos,[1,2,3.5],2.4,.6,true);
  if(c.isPlayer)SFX.respawn()}

/* ---------- personnages ---------- */
function makeChar(o){return Object.assign({pos:[0,0,0],vel:[0,0,0],yaw:Math.PI,grounded:false,ground:null,coyote:0,jumpBuf:0,dead:0,climb:null,climbCd:0,mantle:null,
  jumps:0,point:0,clap:0,phase:0,cphase:0,climbAcc:0,sn:0,wave:0,dance:false,emote:null,swing:0,land:0,state:'repos',stepAcc:0,inWater:false,blinkT:rnd(2,5),blink:0,canClimb:true,autoJump:false,
  a:{armL:0,armR:0,legL:0,legR:0,sideL:0,sideR:0,head:0,bob:0,lean:0,twist:0,headY:0,flip:0,pitch:0},bubbles:[],vis:1},o)}
function addChar(c){chars.push(c);if(!c.isPlayer&&!c.remote)npcs.push(c);if(typeof bubbleFor==='function')bubbleFor(c);return c}
function avColors(av){return[IT[av.haut]?.c||'#ff7a59',IT[av.bas]?.c||'#33415c',av.skin]}

/* ---------- IA des PNJ (bavardage, balade) ---------- */
function npcThink(c,dt,t){const ai=c.ai;ai.t-=dt;ai.chatT-=dt;
  if(ai.t<=0){ai.t=rnd(2.5,6);ai.target=Math.random()<.35||ai.still?null:[ai.home[0]+rnd(-ai.r,ai.r),0,ai.home[2]+rnd(-ai.r,ai.r)];if(!ai.still){if(Math.random()<.1)c.dance=!c.dance;else if(Math.random()<.08)c.clap=2}}
  if(ai.chatT<=0){ai.chatT=rnd(18,32);if(pl&&V.len(V.sub(c.pos,pl.pos))<26&&ai.lines)say(c,pick(ai.lines))}
  if(c.forceWish){const w=c.forceWish;if(V.len(w)>.1)c.yaw=angLerp(c.yaw,Math.atan2(w[0],w[2]),dt*8);return{wish:w,ix:0,iz:0,jump:!!(c.grounded&&Math.random()<dt*.6&&V.len(w)>.1)}}
  let wish=[0,0,0];if(ai.target){const d=V.sub(ai.target,c.pos);d[1]=0;if(V.len(d)>1)wish=V.norm(d);else ai.target=null}
  if(V.len(wish)>0)c.dance=false;
  const dp=V.sub(pl.pos,c.pos);if(!ai.target&&Math.hypot(dp[0],dp[2])<6&&!c.dance)c.yaw=angLerp(c.yaw,Math.atan2(dp[0],dp[2]),dt*4);
  return{wish,ix:0,iz:0,jump:!!(ai.target&&Math.random()<dt*.12)}}
const REPLIES=[[/salut|bonjour|coucou|hello|hey|yo\b|slt/i,['Salut ! 👋','Coucou !','Hey, ça va ?','Yo !'],'salut'],[/ça va|ca va|cv/i,['Oui super, et toi ?','Tranquille 😎','Nickel !']],
  [/dans/i,['Allez, on danse ! 🕺','Musique !'],'danse'],[/merci/i,['De rien !','Avec plaisir 😊']],[/\?/,['Bonne question…','Aucune idée 😅','Peut-être !']],[/./,['Haha','Trop bien !','Ok !','😄','Grave !']]];
function npcReply(text){const near=npcs.filter(n=>!n.dead&&!n.ai?.quiet&&V.len(V.sub(n.pos,pl.pos))<18).sort((a,b)=>V.len(V.sub(a.pos,pl.pos))-V.len(V.sub(b.pos,pl.pos)));
  if(!near.length)return;const n=near[0];for(const[re,ans,emote]of REPLIES){if(re.test(text)){if(re.source==='.'&&Math.random()<.5)return;
    setTimeout(()=>{if(n.dead)return;say(n,pick(ans));if(emote==='salut')n.wave=1.6;if(emote==='danse')n.dance=true},rnd(700,1500));return}}}

/* ============================== ANIMATIONS ============================== */
function animate(c,dt,t){const a=c.a,hs=Math.hypot(c.vel[0],c.vel[2]);
  c.sn=lerp(c.sn,c.grounded?hs/WALK:0,Math.min(1,dt*10));c.phase+=hs*dt*1.5;
  const T={armL:0,armR:0,legL:0,legR:0,sideL:.06,sideR:-.06,head:0,bob:0,lean:0,twist:0,headY:0,pitch:0};if(c.emote!=='salto')c.a.flip=0;
  if(c.swimming){const ph=c.swimPhase||0,mv=Math.hypot(c.vel[0],c.vel[2])>1;
    if(mv){const s=Math.sin(ph);T.pitch=1.3;T.armL=-1.6-Math.sin(ph)*1.5;T.armR=-1.6+Math.sin(ph)*1.5;T.sideL=.25;T.sideR=-.25;T.legL=Math.sin(ph*2)*.35;T.legR=-Math.sin(ph*2)*.35;T.head=-.9;T.bob=Math.cos(ph)*.05;c.state='nage'}
    else{const s=Math.sin(ph);T.armL=-.5+s*.3;T.armR=-.5-s*.3;T.sideL=.9+s*.2;T.sideR=-.9-s*.2;T.legL=.3+s*.25;T.legR=.3-s*.25;T.bob=s*.06;T.head=.05;c.state='flotte'}}
  else if(c.mantle){const k=c.mantle.t;T.armL=T.armR=lerp(-2.6,-.3,clamp(k*1.6,0,1));T.legL=-1.3;T.legR=-.7;T.lean=.45*(1-k);T.head=.15;c.state='se hisse'}
  else if(c.climb){const s=Math.sin(c.cphase),moving=Math.abs(c.vel[1])+Math.abs(c.vel[0])+Math.abs(c.vel[2])>.1;
    T.armL=-2.45-.5*s;T.armR=-2.45+.5*s;T.legL=-.4+.5*s;T.legR=-.4-.5*s;T.sideL=.14;T.sideR=-.14;T.head=moving?-.3:-.1;T.lean=.1;T.bob=Math.abs(s)*.04;c.state='grimpe'}
  else if(!c.grounded&&c.vel[1]>0){T.armL=T.armR=-2.95;T.legL=-.2;T.legR=.15;T.sideL=.12;T.sideR=-.12;T.head=-.12;c.state='saut'}
  else if(!c.grounded){T.armL=T.armR=-2.4;T.sideL=.4;T.sideR=-.4;const s=Math.sin(t*9)*.35;T.legL=s;T.legR=-s;T.head=.1;c.state='chute'}
  else if(c.sn>.12){const amp=clamp(.45+.4*c.sn,0,.9)*(c.inWater?.7:1),s=Math.sin(c.phase);
    T.legL=amp*s;T.legR=-amp*s;T.armL=-amp*s*.9;T.armR=amp*s*.9;T.bob=Math.abs(Math.cos(c.phase))*.07;T.lean=.06*c.sn;T.twist=s*.06;c.state=c.inWater?'nage':'marche'}
  else if(c.emote){const e=c.emote,s=Math.sin(t*8);
    if(e==='robot'){const st=Math.floor(t*4)%4;T.armL=[-1.57,0,-1.57,-.8][st];T.armR=[0,-1.57,-.8,-1.57][st];T.head=[.1,-.1,0,.1][st];T.twist=[.3,-.3,0,.15][st];T.legL=st%2?-.2:0}
    else if(e==='disco'){const k=Math.floor(t*2.5)%2;T.armR=k?-2.9:-.6;T.sideR=k?-.4:.6;T.armL=.2;T.sideL=.3;T.twist=k?.25:-.25;T.legL=k?.3:0;T.bob=Math.abs(s)*.08}
    else if(e==='toupie'){T.twist=(t*10)%(Math.PI*2);T.armL=T.armR=0;T.sideL=1.5;T.sideR=-1.5;T.bob=.05}
    else if(e==='flexion'){const k=Math.abs(Math.sin(t*3));T.lean=1.45;T.bob=-1.15+k*.3;T.armL=T.armR=-1.4-k*.2;T.legL=T.legR=.0;T.head=-.6}
    else if(e==='dab'){T.armR=-2.3;T.sideR=-.9;T.armL=-1.6;T.sideL=-.9;T.head=.55;T.headY=.5;T.lean=.12}
    else if(e==='rire'){const k=Math.sin(t*22);T.lean=.15+k*.04;T.head=-.35+k*.06;T.armL=-.3;T.armR=-.3;T.sideL=-.6;T.sideR=.6;T.bob=Math.abs(k)*.04}
    else if(e==='pleurer'){T.head=.45;T.armL=T.armR=-2.2;T.sideL=-.75;T.sideR=.75;T.lean=.15;T.bob=Math.sin(t*14)*.02;if(Math.random()<.25)emit({pos:V.add(c.pos,[Math.sin(c.yaw)*.45+rnd(-.2,.2),2.3,Math.cos(c.yaw)*.45]),vel:[rnd(-.5,.5),1.5,rnd(-.5,.5)],life:.6,size:.07,size1:.05,col:[.4,.8,1.6],add:1,grav:9})}
    else if(e==='hourra'){const k=Math.abs(Math.sin(t*6));T.armL=T.armR=-2.9;T.sideL=.35;T.sideR=-.35;T.bob=k*.5;T.legL=T.legR=-k*.4;T.head=-.2}
    else if(e==='courbette'){const k=clamp(Math.sin((t%2.4)/2.4*Math.PI)*1.6,0,1);T.lean=k*1.1;T.armR=-k*1.2;T.sideR=.2;T.armL=k*.3;T.head=k*.3}
    else if(e==='assis'){T.legL=T.legR=-1.57;T.bob=-.98;T.armL=T.armR=-.5;T.lean=-.08}
    else if(e==='salto'){const k=(t%1.4)/1.4;T.bob=Math.sin(Math.min(1,k*1.3)*Math.PI)*2.2;T.armL=T.armR=-2.8*Math.sin(k*Math.PI);T.legL=T.legR=-1.2*Math.sin(k*Math.PI);c.a.flip=-k*Math.PI*2*(k<.77?1/.77:0)}
    else if(e==='zombie'){T.armL=T.armR=-1.57;T.sideL=.08;T.sideR=-.08;T.head=.3+Math.sin(t*2)*.1;T.headY=Math.sin(t*1.3)*.3;T.legL=Math.sin(t*2)*.2;T.legR=-T.legL;T.lean=.08;T.twist=Math.sin(t*2)*.1}
    else if(e==='guitare'){const k=Math.sin(t*14);T.armR=-.6+k*.25;T.sideR=.5;T.armL=-1.3;T.sideL=-.5;T.head=.25+Math.abs(Math.sin(t*4))*.2;T.bob=Math.abs(Math.sin(t*4))*.06;T.legL=-.15}
    else if(e==='moonwalk'){const k=Math.sin(t*5);T.legL=k*.35;T.legR=-k*.35;T.bob=Math.abs(k)*.05;T.lean=-.1;T.armL=-k*.3;T.armR=k*.3;c.mw=(c.mw||0)+1}
    else if(e==='meditation'){T.legL=-1.57;T.legR=-1.57;T.sideL=.0;T.bob=-.98+Math.sin(t*1.2)*.03;T.armL=T.armR=-.7;T.sideL=-.55;T.sideR=.55;T.head=-.05}
    else if(e==='muscles'){const k=Math.abs(Math.sin(t*3));T.armL=T.armR=-1.57;T.sideL=1.2;T.sideR=-1.2;T.lean=-.05-k*.05;T.bob=k*.03}
    else{T.armL=-1.4-1.4*s;T.armR=-1.4+1.4*s;T.sideL=.5;T.sideR=-.5;T.legL=.25*s;T.legR=-.25*s;T.bob=Math.abs(s)*.14;T.twist=Math.sin(t*4)*.45;T.head=Math.sin(t*8)*.12}
    c.state='emote'}
  else if(c.dance){const s=Math.sin(t*8);T.armL=-1.4-1.4*s;T.armR=-1.4+1.4*s;T.sideL=.5;T.sideR=-.5;T.legL=.25*s;T.legR=-.25*s;T.bob=Math.abs(s)*.14;T.twist=Math.sin(t*4)*.45;T.head=Math.sin(t*8)*.12;c.state='danse'}
  else{const s=Math.sin(t*2.2);T.armL=s*.04;T.armR=-s*.04;T.sideL=.07+s*.02;T.sideR=-.07-s*.02;T.head=Math.sin(t*.9)*.05;T.bob=s*.012;c.state='repos';if(c.held){T.armR=-.35}}
  if(c.point>0&&!c.climb&&!c.mantle){c.point-=dt;T.armR=-1.57;T.sideR=-.05;T.head=-.05;if(c.state==='repos')c.state='pointe'}
  if(c.clap>0&&!c.climb&&!c.mantle){c.clap-=dt;const s=Math.abs(Math.sin(t*9));T.armL=T.armR=-1.35;T.sideL=-.35+.45*s;T.sideR=.35-.45*s;T.bob+=s*.02;if(c.state==='repos')c.state='applaudit'}
  if(c.wave>0&&!c.climb&&!c.mantle){c.wave-=dt;T.armR=0;T.sideR=-2.55+Math.sin(t*12)*.35;T.head=-.05;if(c.state==='repos')c.state='salut'}
  if(c.swing>0){const k=1-c.swing/.38;T.armR=lerp(-2.7,.5,Math.min(1,k*1.4));T.sideR=-.3;T.twist=lerp(.45,-.35,k);c.swing-=dt}
  if(c.land>0){c.land-=dt*5;const l=Math.max(c.land,0);T.bob-=.16*l;T.legL-=.35*l;T.legR-=.35*l;T.armL+=.3*l;T.armR+=.3*l}
  const kk=Math.min(1,dt*(c.grounded||c.climb||c.mantle?16:11));for(const n in T){if(n==='twist'&&c.emote==='toupie'&&!(c.sn>.12)){a.twist=T.twist;continue}a[n]=lerp(a[n],T[n],c.swing>0&&(n==='armR'||n==='twist')?Math.min(1,dt*30):kk)}
  c.blinkT-=dt;if(c.blinkT<0){c.blink=.12;c.blinkT=rnd(2,5)}c.blink-=dt;
}
/* ============================== JEUX ============================== */
const GAMES={};
function hsl(h,s,l){s/=100;l/=100;const k=n=>(n+h/30)%12,a=s*Math.min(l,1-l),f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));return'#'+[f(0),f(8),f(4)].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('')}
const NPC_AV={
  leo:{skin:'#8d5524',haut:'hoodie_gris',bas:'jogging',visage:'coin',chapeau:'casquette_envers',cheveux:null,lunettes:null,dos:null,cou:null,epaule:null},
  mia:{skin:'#ffe0c4',haut:'mariniere',bas:'jupe',visage:'kawaii',chapeau:null,cheveux:'ch_couettes_rose',lunettes:null,dos:null,cou:null,epaule:null},
  ancien:{skin:'#e0ac7e',haut:'kimono',bas:'costume_p',visage:'serieux',chapeau:'sorcier',cheveux:null,lunettes:'moustache',dos:null,cou:null,epaule:null},
  forge:{skin:'#c68642',haut:'armure',bas:'cargo',visage:'grand_sourire',chapeau:null,cheveux:'ch_queue_brun',lunettes:'bandeau',dos:null,cou:null,epaule:null},
  monstre:{skin:'#2a2d33',haut:'armure',bas:'ninja',visage:'demon',chapeau:null,cheveux:null,lunettes:null,dos:null,cou:null,epaule:null},
  fantome:{skin:'#e8eef5',haut:'labcoat',bas:'pyjama',visage:'choque',chapeau:null,cheveux:null,lunettes:null,dos:null,cou:null,epaule:null},
  guide:{skin:'#f6cfa9',haut:'maillot',bas:'short',visage:'grand_sourire',chapeau:'casquette_bleue',cheveux:null,lunettes:null,dos:null,cou:'noeud',epaule:null}};
function spawnNPC(name,avKey,pos,ai={}){return addChar(makeChar({name,av:NPC_AV[avKey],pos:[...pos],canClimb:false,nameCol:ai.col||'#9ad7ff',ai:{home:[...pos],t:rnd(1,3),target:null,chatT:rnd(6,14),r:ai.r??7,lines:ai.lines,still:ai.still,quiet:ai.quiet}}))}

/* ===================================================================== BAC À SABLE */
GAMES.sandbox={name:'Bac à sable',genre:'Détente',icon:'🧱',colors:['#3d7eff','#2fbf71'],
  desc:"Le terrain de jeu pour tout tester : escalade, 29 matériaux, trampoline, eau, portes de hitbox. Retrouve tes amis sur le même serveur !",
  badges:['Explorer la galerie des matériaux'],
  build(){WORLD.motes=true;
    B(0,-.5,-14,120,1,96,{color:'#4fa046'});
    SPAWN=B(0,.1,12,6,.2,6,{color:'#3d7eff',mat:'lisse'});
    SIGN(0,3.4,6.5,'BAC À SABLE\nbienvenue !');
    for(const[x,z,c]of[[-6,6,'#22e3ff'],[6,6,'#ff3ea5'],[-6,18,'#ff3ea5'],[6,18,'#22e3ff']])B(x,2,z,.45,4,.45,{mat:'neon',color:c});
    // bûches & foin près du spawn
    LOG(-10,.45,14,4,.9,'x');LOG(-10,.45,15,4,.9,'x');LOG(-10,1.2,14.5,4,.9,'x');B(10,.6,15,2.2,1.2,1.4,{mat:'foin'});B(10,.6,13.4,2.2,1.2,1.4,{mat:'foin'});B(10,1.8,14.2,2.2,1.2,1.4,{mat:'foin'});
    SIGN(1,3.6,-3,'ESCALADE\néchelle · treillis · mur');
    B(-5,4,-12,4,8,4,{mat:'mousse'});B(-5,4,-9.85,2,8,.3,{mat:'bois',mode:4,climb:'wood'});
    B(1,5,-11,2,10,2,{mat:'metal',mode:5,climb:'metal',wrap:true,color:'#cfd6de'});B(1,9.75,-14,4,.5,4,{mat:'metal'});B(-2,7.75,-14,2,.5,1.4,{mat:'planches'});
    B(7,3,-11.5,4,6,1,{mat:'beton',climb:'stone'});B(7,5.75,-13.5,4,.5,3,{mat:'bois'});
    for(let i=0;i<18;i++){const hx=7+(rh(i*3.1)-.5)*3.3,hy=.5+i*.3;D(hx,hy,-10.95,.26+rh(i)*.12,.2,.14,['#ef476f','#ffd166','#06d6a0','#118ab2'][i%4])}
    SIGN(-32.5,4,6.5,'GALERIE DES MATÉRIAUX\nmarche dessus pour les sons');
    const gal=[['plastique','#e74c3c'],['lisse','#3d7eff'],['bois'],['planches'],['brique'],['pierre'],['mousse'],['metal'],['rouille'],['cuivre'],['or'],['herbe'],['terre'],['gravier'],['sable'],['foin'],['neige'],['glace'],['marbre'],['granit'],['basalte'],['carrelage'],['ardoise'],['beton'],['feuillage'],['tissu','#7b5cff'],['cristal'],['neon','#a64dff'],['verre','#bfe9ff']];
    gal.forEach(([m,c],i)=>{const x=[-43,-36,-29,-22][i%4],z=1-(i/4|0)*6;B(x,.5,z,4.4,1,4.4,{mat:m,color:c||'#ffffff'});SIGN(x,3,z-.6,MATS[m].fr,false)});
    LOG(-32.5,.5,-46,6,1,'x');SIGN(-32.5,3,-44.6,'Bûches',false);
    B(-32,.2,-55,12,.4,8,{mat:'glace'});SIGN(-32,3,-50.5,'PATINOIRE',false);
    SIGN(-12,3.6,-22,'PONT DE VERRE');B(-12,.1,-28,8,.2,7,{kind:'lava'});B(-12,.35,-28,1.8,.3,7.6,{mat:'verre',color:'#bfe9ff'});
    SIGN(16,4.6,2,'HITBOX (touche H)\nlarge 2 · haut 2,65');
    B(11.4,2,-6,2.8,4,1,{mat:'brique'});B(16.9,2,-6,3.4,4,1,{mat:'brique'});B(21.6,2,-6,2.8,4,1,{mat:'brique'});B(14,3.5,-6,2.4,1,1,{mat:'brique'});B(19.4,3.5,-6,1.6,1,1,{mat:'brique'});
    SIGN(14,4.9,-5.38,'2,4 : ça passe',false);SIGN(19.4,4.9,-5.38,'1,6 : bloqué',false);
    B(12,1.5,-14,.5,3,6,{mat:'beton'});B(16,1.5,-14,.5,3,6,{mat:'beton'});B(14,3.25,-14,4.5,.5,6,{mat:'beton'});
    B(19,1.25,-14,.5,2.5,6,{mat:'beton'});B(23,1.25,-14,.5,2.5,6,{mat:'beton'});B(21,2.75,-14,4.5,.5,6,{mat:'beton'});
    SIGN(14,4.3,-10.88,'plafond 3 : ok',false);SIGN(21,3.8,-10.88,'plafond 2,5 : trop bas',false);
    SIGN(33,3.6,2,'ESCALIERS & SAUTS');for(let i=0;i<6;i++){const t=.5*(i+1);B(30,t/2,-2-i*1.2,3,t,1.2,{mat:'bois'})}for(let i=0;i<4;i++){const t=1+i;B(35,t/2,-2-i*2,3,t,2,{mat:'brique'})}
    {let z=-14;B(33,.5,z,3,1,2,{color:'#9b5de5'});for(const g of[2,3,4,5]){z-=2+g;B(33,.5,z,3,1,2,{color:'#9b5de5'})}}
    SIGN(44,3.6,2,'GADGETS\ntrampoline · tapis · eau');
    B(42,.25,-3,3,.5,3,{kind:'bounce',color:'#ff4fa3'});B(42,6.5,-9.5,4,1,4,{mat:'marbre'});
    B(47,.15,-6,3,.3,9,{kind:'conv',dir:[0,0,-1],speed:6,mode:6,color:'#3a3f4b'});
    B(42,2,-16,3,.6,3,{color:'#4cc9f0',mat:'lisse',move:{axis:[0,1,0],amp:1.6,speed:1.2}});B(42,4.6,-20.5,3,.6,3,{color:'#4cc9f0',mat:'lisse',move:{axis:[1,0,0],amp:3,speed:.9}});
    const PX=45,PZ=-30;B(PX,.5,PZ-4.2,9,1,.4,{mat:'marbre'});B(PX,.5,PZ+4.2,9,1,.4,{mat:'marbre'});B(PX-4.3,.5,PZ,.4,1,8,{mat:'marbre'});B(PX+4.3,.5,PZ,.4,1,8,{mat:'marbre'});B(PX,.25,PZ+5,2,.5,1.2,{mat:'marbre'});
    waters.push({pos:[PX,.42,PZ],size:[8.2,.84,8]});
    for(const[x,z]of[[-52,12],[52,12],[-54,-30],[56,-40],[-10,-52],[18,-54],[-54,-8],[26,20]])TREE(x,z,3.2,3);
  }};

/* ===================================================================== OBBY */
GAMES.obby={name:'Obby Arc-en-ciel',genre:'Obby',icon:'🌈',colors:['#ff4fa3','#ffd23f'],
  desc:"14 étapes de parcours : lave, plateformes mobiles, échelles, barres tournantes, pont de verre piégé, glace… Atteins le sommet !",
  badges:['Terminer l\'obby : +100 Blox (puis +15)'],
  build(sv){const G=this;G.sv=sv;sv.stage=sv.stage||0;G.cps=[];G.fades=[];G.fakes=[];G.timer=0;G.running=false;G.done=false;
    let z=0,y=0;const col=i=>hsl((i*26)%360,78,58);
    B(0,-1,4,24,1,24,{color:'#3a3f4b'});
    const cp=(i,x,yy,zz)=>{const p=B(x,yy,zz,6,.3,6,{mat:'lisse',color:i?'#9aa4b2':'#3d7eff',cp:i});G.cps[i]=p;SIGN(x,yy+3.4,zz-2.8,i===0?'OBBY ARC-EN-CIEL\n14 étapes':'ÉTAPE '+i,false,{size:i?60:40});return p};
    SPAWN=cp(0,0,0,0);
    const plat=(x,yy,zz,sx,sz,i,o={})=>B(x,yy,zz,sx,.8,sz,{mat:'lisse',color:col(i),...o});
    // 1 sauts
    z=-6;for(let k=0;k<4;k++){z-=3.4;plat(k%2?1.5:-1.5,y,z,2.6,2.6,1)}z-=5;cp(1,0,y,z);
    // 2 lave + pierres
    B(0,y-.2,z-10,10,.3,12,{kind:'lava'});for(const[x,dz]of[[-2,-6],[1.5,-8.5],[-1,-11],[2,-13.5]])plat(x,y+.2,z+dz,1.8,1.8,2);z-=20;cp(2,0,y,z);
    // 3 plateformes mobiles
    for(let k=0;k<3;k++)plat(0,y,z-6-k*5,3,3,3,{move:{axis:[1,0,0],amp:3.5,speed:1+k*.25}});z-=24;cp(3,0,y,z);
    // 4 échelle
    B(0,y+4,z-7,6,8,2,{mat:'brique'});B(0,y+4,z-5.85,2,8,.3,{mat:'bois',mode:4,climb:'wood'});y+=8;z-=12;cp(4,0,y,z);
    // 5 barre tournante
    plat(0,y,z-8,10,10,5);killers.push({type:'spin',c:[0,y+.9,z-8],len:4.6,speed:1.4,ang:0});z-=17;cp(5,0,y,z);
    // 6 plateformes qui disparaissent
    for(let k=0;k<5;k++){const p=plat(k%2?1.2:-1.2,y,z-5-k*3.6,2.6,2.6,6,{fade:1});G.fades.push(p)}z-=26;cp(6,0,y,z);
    // 7 treillis
    B(0,y+5,z-5,2,10,2,{mat:'metal',mode:5,climb:'metal',wrap:true,color:'#e3e8ef'});y+=10;B(0,y-.25,z-8,4,.5,4,{mat:'metal'});z-=13;cp(7,0,y,z);
    // 8 tapis à contresens
    B(0,y,z-9,2.2,.8,12,{kind:'conv',dir:[0,0,1],speed:4,mode:6,color:'#3a3f4b'});z-=19;cp(8,0,y,z);
    // 9 trampolines
    B(0,y,z-5,3,.5,3,{kind:'bounce',color:'#ff4fa3'});y+=6;plat(0,y,z-11,4,4,9);z-=17;cp(9,0,y,z);
    // 10 pont de verre piégé
    for(let r=0;r<5;r++){const fake=Math.random()<.5?0:1;for(let s=0;s<2;s++){const p=B(s?1.6:-1.6,y,z-5-r*3.2,2.6,.3,2.6,{mat:'verre',color:'#bfe9ff',fake:s===fake});if(s===fake)G.fakes.push(p)}}z-=23;cp(10,0,y,z);
    // 11 glace avec trous
    for(let k=0;k<3;k++)B(0,y,z-6-k*6,4,.8,4.4,{mat:'glace'});z-=24;cp(11,0,y,z);
    // 12 poutres en zigzag
    let x=0;for(let k=0;k<5;k++){const nx=k%2?2.5:-2.5;B((x+nx)/2,y,z-3-k*3,Math.abs(nx-x)+.8,.6,.8,{mat:'lisse',color:col(12)});B(nx,y,z-4.5-k*3,.8,.6,3,{mat:'lisse',color:col(12)});x=nx}z-=21;cp(12,0,y,z);
    // 13 ascenseurs
    for(let k=0;k<3;k++)plat(k%2?2:-2,y+1.5+k*2.6,z-5-k*4,3,3,13,{move:{axis:[0,1,0],amp:1.5,speed:1.3+k*.2}});y+=8;z-=19;cp(13,0,y,z);
    // 14 marches piégées puis arrivée
    for(let k=0;k<5;k++){plat(0,y+k*1.2,z-4-k*3,3,2,14);B(0,y+k*1.2+.5,z-4-k*3+.9,3,.2,.2,{kind:'lava'})}y+=6;z-=21;
    G.finish=B(0,y,z,7,.4,7,{mat:'or'});B(0,y+1.4,z-2.4,.7,2.4,.7,{mat:'or'});B(0,y+3,z-2.4,1.6,1,1.6,{mat:'or'});SIGN(0,y+5,z-3.6,'BRAVO !',false);
    G.total=14;WORLD.voidY=-30;
  },
  spawn(c){const p=this.cps[this.sv.stage]||this.cps[0];return[p.pos[0],p.pos[1]+.2,p.pos[2]]},
  hud(el){el.innerHTML=`<div class="ghud center"><div class="gtitle" id="obSt">Étape 0 / 14</div><div class="gbar"><i id="obBar"></i></div><div class="gsub" id="obT">0:00.0</div></div>`},
  update(dt,t){const G=this;
    if(!G.done&&pl.ground&&pl.ground.cp!=null){const i=pl.ground.cp;if(i>G.sv.stage){G.sv.stage=i;pl.ground.color='#2fbf71';SFX.checkpoint();toast(`Étape ${i} atteinte !`);sparks(V.add(pl.ground.pos,[0,.4,0]),[1,3,1.5],18);markDirty()}if(i>0&&!G.running){G.running=true}}
    if(pl.ground&&pl.ground.cp===0&&G.sv.stage===0){G.timer=0;G.running=false}
    if(!G.running&&V.len(playerWish())>.1)G.running=true;
    if(G.running&&!G.done)G.timer+=dt;
    for(const k of killers){k.ang+=k.speed*dt;const d=[Math.cos(k.ang),0,Math.sin(k.ang)],rel=V.sub(pl.pos,k.c);rel[1]=0;const along=clamp(V.dot(rel,d),-k.len,k.len),perp=V.len(V.sub(rel,V.mul(d,along)));
      if(!pl.dead&&perp<.55&&pl.pos[1]<k.c[1]+.4&&pl.pos[1]+H>k.c[1]-.4)die(pl,false)}
    for(const p of G.fades){if(p.fT==null&&pl.ground===p)p.fT=0;if(p.fT!=null){p.fT+=dt;p.alpha=Math.max(0,1-p.fT/.7);if(p.fT>.7&&!p.off){p.off=true;refreshSolids()}if(p.fT>3){p.fT=null;p.off=false;p.alpha=1;refreshSolids()}}}
    for(const p of G.fakes){if(!p.off&&pl.ground===p){p.off=true;refreshSolids();SFX.glass();for(let i=0;i<24;i++)debris.push({pos:V.add(p.pos,[rnd(-1.2,1.2),0,rnd(-1.2,1.2)]),vel:[rnd(-2,2),rnd(0,3),rnd(-2,2)],life:rnd(.8,1.4),color:'#d8f3ff',size:rnd(.12,.3),rot:Math.random()*6});p.reT=4}
      if(p.off&&(p.reT-=dt)<0){p.off=false;refreshSolids()}}
    if(!G.done&&pl.ground===G.finish){G.done=true;SFX.win();const first=!G.sv.done;G.sv.done=(G.sv.done||0)+1;if(!G.sv.best||G.timer<G.sv.best)G.sv.best=G.timer;
      giveBlox(first?100:15,first?'Obby terminé !':'Obby terminé');unlockBadge('obby');for(let i=0;i<5;i++)setTimeout(()=>sparks(V.add(G.finish.pos,[0,1,0]),[[3,1,1],[1,3,1],[1,1.6,3],[3,2.6,.5]][i%4],30,1.4),i*200);
      setTimeout(()=>{showResult('Obby terminé !',`Temps : ${fmtT(G.timer)} · Record : ${fmtT(G.sv.best)}`,[['Recommencer',()=>{G.sv.stage=0;G.done=false;G.timer=0;G.running=false;for(const c of G.cps)if(c.cp)c.color='#9aa4b2';respawn(pl)}],['Retour à l\'accueil',()=>exitGame()]])},1400);markDirty()}
    $('obSt').textContent=G.done?'Terminé !':`Étape ${G.sv.stage} / ${G.total}`;$('obBar').style.width=(G.done?100:G.sv.stage/G.total*100)+'%';$('obT').textContent=fmtT(G.timer)+(G.sv.best?` · record ${fmtT(G.sv.best)}`:'')},
  extraDraw(L){for(const k of killers){const m=M.chain(M.T(...k.c),M.RY(-k.ang),M.S(k.len*2,.35,.35));L.push({mesh:MESH.rbox,m,mode:3,color:'#ff3030',emis:HDR?2:.6,shin:60});L.push({mesh:MESH.cyl,m:M.chain(M.T(k.c[0],k.c[1]-.5,k.c[2]),M.S(.6,1,.6)),mode:3,color:'#3a3f4b',shin:60})}}
};
function fmtT(s){s=s||0;const m=Math.floor(s/60);return m+':'+(s%60).toFixed(1).padStart(4,'0')}

/* ===================================================================== TYCOON */
const TY_ITEMS=[
  {id:'d1',name:'Dropper 1',price:0,req:null,pad:[-12,6]},{id:'d2',name:'Dropper 2',price:25,req:'d1',pad:[-9,6]},{id:'walls',name:'Murs',price:120,req:'d1',pad:[-12,9.5]},
  {id:'d3',name:'Dropper 3',price:150,req:'d2',pad:[-6,6]},{id:'spd',name:'Tapis rapide',price:220,req:'d2',pad:[-9,9.5]},{id:'up1',name:'Améliorateur ×2',price:350,req:'d2',pad:[-6,9.5]},
  {id:'lamp',name:'Lampadaires néon',price:200,req:'walls',pad:[-12,13]},{id:'floor',name:'Sol en marbre',price:300,req:'walls',pad:[-9,13]},{id:'d4',name:'Dropper 4',price:600,req:'d3',pad:[-3,6]},
  {id:'garden',name:'Jardin',price:450,req:'floor',pad:[-6,13]},{id:'up2',name:'Améliorateur +25',price:1500,req:'up1',pad:[-3,9.5]},{id:'fount',name:'Fontaine',price:1100,req:'garden',pad:[-3,13]},
  {id:'auto',name:'Collecte auto',price:2500,req:'d4',pad:[0,6]},{id:'gold',name:'Dropper doré',price:3500,req:'d4',pad:[0,9.5]},{id:'stairs',name:'Étage + escalier',price:4000,req:'walls',pad:[0,13]},
  {id:'statue',name:'Statue en or',price:8000,req:'stairs',pad:[3,13]},{id:'rebirth',name:'RENAISSANCE',price:15000,req:'gold',pad:[3,6],rebirth:true}];
const TY_DROP={d1:{x:-10,val:1,rate:1.6,col:'#9aa4b2'},d2:{x:-6.5,val:3,rate:1.6,col:'#4ea8ff'},d3:{x:-3,val:8,rate:1.5,col:'#2fbf71'},d4:{x:.5,val:20,rate:1.4,col:'#b46bff'},gold:{x:4,val:80,rate:1.6,col:'#ffd23f',glow:1}};
GAMES.tycoon={name:'Usine à Blocs Tycoon',genre:'Tycoon',icon:'🏭',colors:['#2fbf71','#ffd23f'],
  desc:"Construis ton usine : achète des droppers, améliore le minerai, collecte l'argent et agrandis ta base. Renaissance = multiplicateur + 100 Blox.",
  badges:['Renaissance : +100 Blox','Gros achats : Blox bonus'],
  build(sv){const G=this;G.sv=sv;sv.cash=sv.cash??0;sv.owned=sv.owned||[];sv.reb=sv.reb||0;sv.pending=sv.pending||0;G.ores=[];G.dT={};G.pads=[];G.pop=[];
    B(0,-.5,0,60,1,60,{mat:'herbe'});G.plotFloor=B(0,.05,0,32,.1,32,{mat:'beton'});
    SPAWN={pos:[-4,.2,16],size:[4,.2,4]};B(-4,.1,16,4,.2,4,{color:'#3d7eff',mat:'lisse'});
    // tapis + four + collecteur
    G.conv=B(-2,.5,-6,24,1,2.4,{kind:'conv',dir:[1,0,0],speed:0,mode:6,color:'#30343d'});
    B(11.5,1.6,-6,3.4,3.2,3.4,{mat:'basalte'});B(11.5,3.3,-6,3.6,.3,3.6,{mat:'metal'});B(9.9,1.6,-6,.2,1.4,2,{kind:'lava'});
    G.collector=B(11.5,.15,-2,3,.3,2.2,{mat:'lisse',color:'#2fbf71'});G.cSign=SIGN(11.5,3.2,-.6,'En attente\n0 $',false,{size:44,bg1:'#e9fff1',bg2:'#c7f5d8',border:'#1d8a50'});
    SIGN(8,4.2,16,'USINE À BLOCS\nTYCOON',true,{size:46});
    for(const it of TY_ITEMS){const p=B(it.pad[0],.12,it.pad[1],2.2,.24,2.2,{mat:'lisse',color:'#2fbf71',tyItem:it,nocol:1});p.hidden=true;p.sign=SIGN(it.pad[0],2.4,it.pad[1],'',false,{w:384,h:150,size:34,lh:40,bg1:'#1f232b',bg2:'#13161c',border:'#2fbf71',ink:'#ffffff'});p.sign.hidden=true;G.pads.push(p)}
    for(const id of sv.owned)G.construct(id,true);G.refreshPads();
  },
  construct(id,instant){const G=this,pop=b=>{if(!instant){b.pop=0;G.pop.push(b)}return b};
    const dr=TY_DROP[id];if(dr){pop(B(dr.x,4.2,-6,1.6,1.6,1.6,{mat:id==='gold'?'or':'metal'}));pop(B(dr.x,3.2,-6,.7,.5,.7,{mat:'rouille'}));if(dr.glow)pop(B(dr.x,5.1,-6,.4,.4,.4,{mat:'neon',color:'#ffd23f',nocol:1}));G.dT[id]=rnd(0,dr.rate)}
    if(id==='spd')G.conv.speed=0;
    if(id==='up1'){pop(B(5,2,-7.4,.4,3,.4,{mat:'neon',color:'#39ffb6'}));pop(B(5,2,-4.6,.4,3,.4,{mat:'neon',color:'#39ffb6'}));pop(B(5,3.6,-6,.4,.4,3.2,{mat:'neon',color:'#39ffb6',nocol:1}))}
    if(id==='up2'){pop(B(8,2,-7.4,.4,3,.4,{mat:'neon',color:'#ff4fa3'}));pop(B(8,2,-4.6,.4,3,.4,{mat:'neon',color:'#ff4fa3'}));pop(B(8,3.6,-6,.4,.4,3.2,{mat:'neon',color:'#ff4fa3',nocol:1}))}
    if(id==='walls'){for(const[x,z,sx,sz]of[[0,-16,32,.6],[-16,0,.6,32],[16,-5,.6,22]])pop(B(x,2,z,sx,4,sz,{mat:'brique'}));pop(B(16,2,13,.6,4,6,{mat:'brique'}))}
    if(id==='floor'){G.plotFloor.mat='marbre'}
    if(id==='lamp')for(const[x,z]of[[-14,-14],[14,-14],[-14,14],[14,14]]){pop(B(x,2,z,.3,4,.3,{mat:'metal'}));pop(B(x,4.2,z,.7,.5,.7,{mat:'neon',color:'#ffe6a8'}))}
    if(id==='garden'){for(const[x,z]of[[-12,-12],[-8,-13],[12,10],[13,3]])TREE(x,z,2.6,2.4);for(let i=0;i<14;i++)D(rnd(-14,-6),.15,rnd(1,4),.25,.3,.25,pick(['#ff4fa3','#ffd23f','#ffffff','#b46bff']))}
    if(id==='fount'){pop(B(9,.35,10,5,.7,.4,{mat:'marbre'}));pop(B(9,.35,14,5,.7,.4,{mat:'marbre'}));pop(B(6.7,.35,12,.4,.7,4,{mat:'marbre'}));pop(B(11.3,.35,12,.4,.7,4,{mat:'marbre'}));pop(B(9,1.2,12,.6,2.4,.6,{mat:'marbre'}));waters.push({pos:[9,.35,12],size:[4.2,.6,3.6]});G.fount=[9,2.5,12]}
    if(id==='stairs'){pop(B(0,4.2,-12.25,30,.4,7.5,{mat:'planches'}));for(let i=0;i<9;i++)pop(B(-14,(.5+i*.5)/2,-i*1.0+.5,2.4,.5+i*.5,1,{mat:'planches'}));pop(B(1.5,4.9,-8.6,27,1,.3,{mat:'verre',color:'#bfe9ff'}))}
    if(id==='statue'){pop(B(-6,5.4,-12,2,2,2,{mat:'or'}));pop(B(-6,7.2,-12,1.2,1.6,1.2,{mat:'or'}));pop(B(-6,8.4,-12,1,.8,1,{mat:'or'}))}
    if(!instant){finalizeWorld()}},
  refreshPads(){const G=this;for(const p of G.pads){const it=p.tyItem,owned=G.sv.owned.includes(it.id),avail=!owned&&(!it.req||G.sv.owned.includes(it.req));
      p.hidden=p.sign.hidden=!avail;if(avail){const ok=G.sv.cash>=it.price;p.color=it.rebirth?'#ffd23f':(ok?'#2fbf71':'#e5484d');setSign(p.sign,`${it.name}\n${it.price?fmtCash(it.price):'GRATUIT'}`)}}},
  hud(el){el.innerHTML=`<div class="ghud left"><div class="gtitle">💰 <span id="tyC">0 $</span></div><div class="gsub" id="tyR"></div></div>`},
  update(dt,t){const G=this,sv=G.sv,mult=1+sv.reb*.5;
    G.conv.speed=sv.owned.includes('spd')?5:3;
    for(const id in G.dT){const dr=TY_DROP[id];G.dT[id]-=dt;if(G.dT[id]<=0){G.dT[id]=dr.rate;G.ores.push({pos:[dr.x,3.1,-6+rnd(-.3,.3)],vy:0,val:dr.val,col:dr.col,glow:dr.glow,up:0,rot:Math.random()*6})}}
    for(let i=G.ores.length-1;i>=0;i--){const o=G.ores[i];if(o.pos[1]>1.25){o.vy-=25*dt;o.pos[1]=Math.max(1.22,o.pos[1]+o.vy*dt)}else{o.pos[0]+=G.conv.speed*dt;o.rot+=dt*2}
      if(sv.owned.includes('up1')&&!(o.up&1)&&o.pos[0]>5){o.up|=1;o.val*=2;sparks(o.pos,[.5,3,1.6],5,.5)}
      if(sv.owned.includes('up2')&&!(o.up&2)&&o.pos[0]>8){o.up|=2;o.val+=25;sparks(o.pos,[3,.6,1.6],5,.5)}
      if(o.pos[0]>9.8){G.ores.splice(i,1);const v=Math.round(o.val*mult);sv.pending+=v;emit({pos:[9.8,1.6,-6],vel:[0,2,0],life:.5,size:.3,size1:0,col:[4,1.5,.3],add:1,shape:0});if(sv.owned.includes('auto')){sv.cash+=sv.pending;sv.earned=(sv.earned||0)+sv.pending;sv.pending=0}}}
    if(sv.pending>0&&pl.ground===G.collector){sv.cash+=sv.pending;sv.earned=(sv.earned||0)+sv.pending;floatText(V.add(pl.pos,[0,3,0]),'+'+fmtCash(sv.pending),'#7dffb0');sv.pending=0;SFX.kaching();sparks(V.add(G.collector.pos,[0,.3,0]),[1,3,1.4],14);markDirty()}
    // achats : marcher sur un bouton
    for(const p of G.pads){if(p.hidden)continue;const b=bnd(p);const on=Math.abs(pl.pos[0]-p.pos[0])<1.3&&Math.abs(pl.pos[2]-p.pos[2])<1.3&&pl.pos[1]<.6;
      if(on&&!p.touch){const it=p.tyItem;if(sv.cash>=it.price){if(it.rebirth){G.rebirth();return}sv.cash-=it.price;sv.owned.push(it.id);G.construct(it.id);SFX.buy();toast(`${it.name} acheté !`);sparks(V.add(p.pos,[0,.5,0]),[1,3,1.5],24);if(it.price>=1000)giveBlox(Math.round(it.price/200),'Grand achat');markDirty();G.refreshPads()}
        else{SFX.error();floatText(V.add(pl.pos,[0,3,0]),'Pas assez d\'argent','#ff8a8a')}}p.touch=on}
    for(let i=G.pop.length-1;i>=0;i--){const b=G.pop[i];b.pop=Math.min(1,b.pop+dt*2.6);if(b.pop>=1){G.pop.splice(i,1);delete b.pop}}
    if(G.fount&&Math.random()<dt*20)emit({pos:[...G.fount],vel:[rnd(-1.2,1.2),rnd(4,6),rnd(-1.2,1.2)],life:rnd(.6,1),size:.12,size1:.05,col:[.8,.92,1],alpha:.8,grav:12});
    G.padT=(G.padT||0)-dt;if(G.padT<0){G.padT=.4;G.refreshPads();setSign(G.cSign,`En attente\n${fmtCash(sv.pending)}`)}
    $('tyC').textContent=fmtCash(sv.cash);$('tyR').textContent=`Renaissances : ${sv.reb} · multiplicateur ×${mult}`;
    if(Math.random()<dt*.3)markDirty()},
  rebirth(){const G=this,sv=G.sv;sv.reb++;sv.cash=0;sv.pending=0;sv.owned=[];SFX.levelUp();giveBlox(100,'Renaissance !');unlockBadge('tycoon');markDirty();
    showResult('Renaissance !',`Multiplicateur ×${1+sv.reb*.5} · +100 Blox`,[['Continuer',()=>restartGame()]])},
  extraDraw(L){for(const o of this.ores)L.push({mesh:MESH.cube,m:M.chain(M.T(...o.pos),M.RY(o.rot),M.S(.45,.45,.45)),mode:3,color:o.up&2?'#ff6fd0':o.up&1?'#39ffb6':o.col,shin:o.glow?160:60,emis:o.glow?(HDR?1.6:.4):0})}
};
function fmtCash(n){n=Math.floor(n);return(n>=1e6?(n/1e6).toFixed(2)+' M':n>=1e4?(n/1e3).toFixed(1)+' k':n.toLocaleString('fr-FR'))+' $'}

/* ===================================================================== RPG */
const ENEMY={slime:{name:'Slime',hp:30,dmg:6,spd:3.2,range:1.6,aggro:9,xp:10,gold:[3,6],col:'#5ee04a',size:1},
  squelette:{name:'Squelette',hp:70,dmg:12,spd:4,range:1.9,aggro:12,xp:30,gold:[10,18],col:'#ece6d6',size:1},
  golem:{name:'Golem de pierre',hp:600,dmg:28,spd:2.2,range:2.6,aggro:16,xp:300,gold:[150,180],col:'#8d8a84',size:2.2,boss:true}};
const SWORDS=[{name:'Épée en bois',dmg:0,col:'#a87444'},{name:'Épée en fer',dmg:6,col:'#d8dee6',price:80},{name:'Épée de cristal',dmg:16,col:'#7fdcff',glow:1,price:350}];
const QUESTS=[{txt:'Les slimes envahissent la prairie. Élimine-en 5 !',type:'slime',n:5,gold:40,blox:25},{txt:'Des squelettes rôdent dans la forêt. Élimine-en 3 !',type:'squelette',n:3,gold:80,blox:50},
  {txt:'Le Golem de pierre garde l\'arène au nord-ouest. Vaincs-le !',type:'golem',n:1,gold:300,blox:200},{txt:'Héros du royaume : élimine 10 monstres.',type:'any',n:10,gold:60,blox:30,repeat:true}];
GAMES.rpg={name:'Royaume des Slimes',genre:'Aventure',icon:'⚔️',colors:['#7a5cff','#ff8a3d'],
  desc:"Un RPG d'action : combats des slimes, des squelettes et un golem, gagne de l'expérience, achète des épées et accomplis les quêtes de l'Ancien.",
  badges:['Quêtes : jusqu\'à +200 Blox','Vaincre le Golem'],attack:true,
  build(sv){const G=this;G.sv=sv;Object.assign(sv,{lvl:sv.lvl||1,xp:sv.xp||0,gold:sv.gold??10,sword:sv.sword||0,pot:sv.pot??2,q:sv.q||0,qn:sv.qn||0});
    G.en=[];G.dmgT=0;G.regenT=0;G.hp=G.maxHp();G.atkCd=0;
    B(0,-.5,-10,160,1,160,{mat:'herbe'});SPAWN={pos:[0,.1,6],size:[4,.2,4]};
    // chemins
    B(0,.03,-6,4,.06,30,{mat:'gravier',nocol:1});B(18,.03,-10,32,.06,4,{mat:'gravier',nocol:1});B(-20,.03,-20,36,.06,4,{mat:'gravier',nocol:1});
    // village
    const house=(x,z,w,d,mat,roof)=>{B(x,1.6,z,w,3.2,d,{mat});B(x,3.5,z,w+.6,.6,d+.6,{mat:roof});B(x,4.1,z,w-.6,.6,d-.6,{mat:roof});B(x,4.6,z,w-1.8,.5,d-1.8,{mat:roof});B(x,1.1,z+d/2+.02,1.2,2.2,.1,{color:'#5a3a22',mat:'planches',nocol:1})};
    house(-9,6,6,5,'planches','ardoise');house(10,8,5,5,'brique','ardoise');house(-10,-4,5,5,'brique','ardoise');
    B(4,1,-3,3,.2,2,{mat:'planches'});for(const[x,z]of[[2.7,-2.2],[5.3,-2.2],[2.7,-3.8],[5.3,-3.8]])B(x,.5,z,.2,1,.2,{mat:'bois'});B(4,2.2,-3,3.4,.15,2.4,{color:'#e5484d',mat:'tissu'});
    B(-3,.6,-1,1.8,1.2,1.8,{mat:'pierre'});B(-3,1.6,-1,.15,2,.15,{mat:'bois'});
    for(let i=0;i<6;i++){LOG(-16+i*6.4,.7,14,6,.35,'x');B(-16+i*6.4-3,.7,14,.4,1.4,.4,{mat:'bois'})}
    SIGN(-5,3.4,1,'ROYAUME DES SLIMES',true,{size:44});SIGN(0,2.6,-12,'↑ Prairie · → Forêt · ↖ Arène',true,{size:32});
    // forêt
    for(let i=0;i<18;i++)TREE(32+rh(i)*30,-12-rh(i+5)*38,3+rh(i+9)*1.5,3);for(let i=0;i<6;i++)LOG(36+rh(i*2)*22,.45,-16-rh(i*3)*30,3.5,.9,i%2?'x':'z');
    // arène
    B(-42,.1,-50,22,.2,22,{mat:'basalte'});for(const[x,z]of[[-52,-40],[-32,-40],[-52,-60],[-32,-60],[-42,-38],[-42,-62]])B(x,3,z,1.6,6,1.6,{mat:'mousse'});
    for(const[x,z]of[[-52,-50],[-32,-50]])B(x,.8,z,.5,1.6,.5,{mat:'neon',color:'#ff6a2a'});
    // PNJ
    G.ancien=spawnNPC('Ancien Maël','ancien',[-2,.2,3],{still:true,quiet:true,col:'#ffd23f'});G.ancien.yaw=0;
    G.forge=spawnNPC('Forgeronne Lina','forge',[6,.2,-1],{still:true,quiet:true,col:'#ff9a3d'});G.forge.yaw=Math.PI;
    WORLD.prompts=[{who:G.ancien,label:'Parler',act:()=>G.talkQuest()},{who:G.forge,label:'Boutique',act:()=>G.talkShop()}];
    // ennemis
    for(let i=0;i<7;i++)G.addEnemy('slime',[rnd(-20,20),0,rnd(-42,-18)]);
    for(let i=0;i<5;i++)G.addEnemy('squelette',[rnd(36,58),0,rnd(-46,-16)]);
    G.addEnemy('golem',[-42,.2,-52]);
    pl.held=G.swordParts();
  },
  maxHp(){return 100+(this.sv.lvl-1)*20},dmg(){return 8+this.sv.lvl*2+SWORDS[this.sv.sword].dmg},
  swordParts(){const s=SWORDS[this.sv.sword];return[PT('box',0,-.88,.8,.08,.14,1.3,s.col,{shin:200,emis:s.glow?(HDR?1.4:.4):0}),PT('box',0,-.88,.13,.4,.08,.08,'#8a6a2a'),PT('cyl',0,-.88,-.04,.08,.26,.08,'#3b2617',{rx:Math.PI/2})]},
  addEnemy(type,pos){const E=ENEMY[type];this.en.push({type,E,pos:[...pos],home:[...pos],vel:[0,0,0],yaw:rnd(0,6),hp:E.hp,cd:0,state:'idle',t:rnd(0,3),hitT:0,dead:false,resT:0,hop:0,slam:null})},
  hud(el){el.innerHTML=`<div class="ghud rpg"><div class="lvl" id="rpL">1</div><div style="flex:1"><div class="bar hp"><i id="rpH"></i><span id="rpHt"></span></div><div class="bar xp"><i id="rpX"></i></div></div><div class="gold">🪙 <span id="rpG">0</span></div><div class="pot" id="rpP" title="Potion (Q)">🧪 <span id="rpPn">0</span></div></div>
    <div class="ghud quest" id="rpQ"></div><div class="ghud boss" id="rpB" hidden><div class="bn">Golem de pierre</div><div class="bar hp"><i id="rpBh"></i></div></div><div id="rpHurt" class="hurt"></div>`;
    $('rpP').onclick=()=>this.drink()},
  drink(){const G=this;if(G.sv.pot<=0||G.hp>=G.maxHp()){SFX.error();return}G.sv.pot--;G.hp=Math.min(G.maxHp(),G.hp+60);SFX.potion();floatText(V.add(pl.pos,[0,3,0]),'+60 PV','#7dffb0');for(let i=0;i<14;i++)emit({pos:V.add(pl.pos,[rnd(-.6,.6),rnd(0,2.4),rnd(-.6,.6)]),vel:[0,rnd(1,3),0],life:rnd(.6,1),size:.15,size1:0,col:[.6,3,1],add:1,shape:2});markDirty()},
  talkQuest(){const G=this,q=QUESTS[Math.min(G.sv.q,QUESTS.length-1)];
    if(G.sv.qn>=q.n){G.sv.gold+=q.gold;giveBlox(q.blox,'Quête terminée');SFX.quest();if(q.type==='golem')unlockBadge('golem');if(!q.repeat)G.sv.q++;G.sv.qn=0;markDirty();
      openDialog('Ancien Maël',`Bravo, héros ! Voici ta récompense : ${q.gold} or et ${q.blox} Blox.`,[['Merci !',null]]);return}
    openDialog('Ancien Maël',`${q.txt}\n\nProgression : ${G.sv.qn} / ${q.n} · Récompense : ${q.gold} or + ${q.blox} Blox`,[['J\'y vais !',null]])},
  talkShop(){const G=this,sv=G.sv,next=SWORDS[sv.sword+1],btn=[];
    btn.push([`Potion de soin — 20 or`,()=>{if(sv.gold<20){SFX.error();toast('Pas assez d\'or');return true}sv.gold-=20;sv.pot++;SFX.coin();markDirty();return true}]);
    if(next)btn.push([`${next.name} — ${next.price} or (+${next.dmg} dégâts)`,()=>{if(sv.gold<next.price){SFX.error();toast('Pas assez d\'or');return true}sv.gold-=next.price;sv.sword++;pl.held=G.swordParts();SFX.buy();toast(next.name+' équipée !');markDirty()}]);
    btn.push(['Au revoir',null]);openDialog('Forgeronne Lina',`Bienvenue à la forge ! Tu as ${sv.gold} or.${next?'':' Tu as déjà ma meilleure épée !'}`,btn)},
  attack(){const G=this;if(G.atkCd>0||pl.dead||pl.climb)return;G.atkCd=.45;pl.swing=.38;SFX.sword();
    {const gl_=SWORDS[G.sv.sword].glow,col=gl_?[1.2,2.6,4.5]:[2.4,2.4,2.6];for(let k=0;k<14;k++){const tt=k/13;setTimeout(()=>{if(pl.dead)return;const a=pl.yaw+lerp(-1.25,1.1,tt),r=1.75;
      for(let q=0;q<3;q++){const rr=r*(.55+q*.22);emit({pos:V.add(pl.pos,[Math.sin(a)*rr,1.65-tt*.7,Math.cos(a)*rr]),vel:[0,0,0],life:.18,size:.32-q*.06,size1:0,col,add:1,shape:0})}},40+k*12)}}
    setTimeout(()=>{const f=[Math.sin(pl.yaw),0,Math.cos(pl.yaw)];let hit=false;
      const tip=V.add(pl.pos,[f[0]*1.6,1.3,f[2]*1.6]);for(let i=0;i<8;i++)emit({pos:V.add(tip,[rnd(-.8,.8),rnd(-.4,.4),rnd(-.8,.8)]),vel:V.mul(f,rnd(1,3)),life:.25,size:.25,size1:0,col:SWORDS[G.sv.sword].glow?[1,2.5,4]:[2,2,2],add:1,shape:2});
      for(const e of G.en){if(e.dead)continue;const d=V.sub(e.pos,pl.pos);d[1]=0;const L=V.len(d),reach=2.9+(e.E.size-1)*.9;if(L>reach)continue;if(L>.4&&V.dot(V.mul(d,1/L),f)<.25)continue;
        const crit=Math.random()<.12,dm=Math.round(G.dmg()*(crit?2:1)*rnd(.9,1.1));e.hp-=dm;e.hitT=.15;hit=true;const kb=e.E.boss?1:7;e.vel=V.add(e.vel,V.mul(V.norm(d),kb));if(!e.E.boss)e.vel[1]=4;
        floatText(V.add(e.pos,[0,2*e.E.size+.6,0]),(crit?'CRITIQUE ':'')+dm,crit?'#ffd23f':'#ffffff');sparks(V.add(e.pos,[0,e.E.size,0]),[3,2.4,1.2],8,.7);e.state='chase';
        hitStop=crit?.09:.045;shake=Math.max(shake,crit?.18:.08);if(crit)ring(V.add(e.pos,[0,e.E.size,0]),[3,2.4,.6],2,.3,true);
        if(e.hp<=0)G.kill(e)}
      if(hit){SFX.hit();shake=Math.max(shake,.08)}},140)},
  kill(e){const G=this,sv=G.sv,E=e.E;e.dead=true;e.resT=E.boss?45:12;SFX.enemyDie();
    for(let i=0;i<(E.boss?40:16);i++)debris.push({pos:V.add(e.pos,[0,E.size*.8,0]),vel:[rnd(-4,4),rnd(3,8),rnd(-4,4)],life:rnd(.8,1.4),color:E.col,size:rnd(.12,.3)*E.size,rot:Math.random()*6});
    const g=Math.round(rnd(...E.gold)),pk=partyMult(),xp=Math.round(E.xp*pk*(hasPass('rpg','xp2')?2:1));sv.gold+=g;sv.xp+=xp;floatText(V.add(e.pos,[0,2*E.size+1,0]),`+${xp} XP${pk>1?' (groupe ×'+pk+')':''} · +${g} or`,'#9ad7ff');setTimeout(()=>SFX.coin(),200);
    const q=QUESTS[Math.min(sv.q,QUESTS.length-1)];if(q.type===e.type||q.type==='any'){if(sv.qn<q.n){sv.qn++;if(sv.qn===q.n){SFX.quest();toast('Quête accomplie ! Retourne voir l\'Ancien.')}}}
    while(sv.xp>=G.xpNext()){sv.xp-=G.xpNext();sv.lvl++;G.hp=G.maxHp();SFX.levelUp();toast(`Niveau ${sv.lvl} !`);ring(pl.pos,[1.6,2.4,4],3,.8,true);for(let i=0;i<30;i++)emit({pos:V.add(pl.pos,[rnd(-.8,.8),rnd(0,.4),rnd(-.8,.8)]),vel:[0,rnd(3,7),0],life:rnd(.6,1.2),size:.14,size1:0,col:[3,2.6,.6],add:1,shape:2})}
    markDirty()},
  xpNext(){return 40+this.sv.lvl*30},
  hurt(dm,from){const G=this;if(pl.dead)return;G.hp-=dm;G.dmgT=4;SFX.hurt();shake=Math.max(shake,.15);floatText(V.add(pl.pos,[0,3,0]),'-'+dm,'#ff6b6b');const h=$('rpHurt');h.classList.remove('on');void h.offsetWidth;h.classList.add('on');
    const d=V.sub(pl.pos,from);d[1]=0;pl.vel=V.add(pl.vel,V.mul(V.norm(d),6));if(G.hp<=0){G.hp=0;die(pl,false)}},
  onDeath(c){if(c!==pl)return;const G=this,lost=Math.floor(G.sv.gold*.1);G.sv.gold-=lost;setTimeout(()=>toast(`Tu es tombé au combat… -${lost} or`),300);markDirty()},
  onRespawn(c){if(c===pl)this.hp=this.maxHp()},
  update(dt,t){const G=this,sv=G.sv;G.atkCd-=dt;G.dmgT-=dt;
    if(G.dmgT<0&&G.hp<G.maxHp()&&!pl.dead){G.regenT+=dt;if(G.regenT>.5){G.regenT=0;G.hp=Math.min(G.maxHp(),G.hp+2)}}
    let boss=null;
    for(const e of G.en){const E=e.E;
      if(e.dead){e.resT-=dt;if(e.resT<=0){e.dead=false;e.hp=E.hp;e.pos=[...e.home];e.state='idle';for(let i=0;i<12;i++)emit({pos:V.add(e.pos,[rnd(-.5,.5),rnd(0,1),rnd(-.5,.5)]),vel:[0,rnd(1,3),0],life:.8,size:.2,size1:0,col:[1.5,1.5,1.5],add:1,shape:0})}continue}
      if(E.boss&&V.len(V.sub(e.pos,pl.pos))<26)boss=e;
      e.hitT-=dt;e.cd-=dt;e.t+=dt;if(e.atk>0)e.atk-=dt;const d=V.sub(pl.pos,e.pos);d[1]=0;const L=V.len(d);
      if(!pl.dead&&L<E.aggro&&V.len(V.sub(e.home,e.pos))<E.aggro*2.2)e.state='chase';else if(e.state==='chase'&&(L>E.aggro*1.6||pl.dead))e.state='home';
      let want=[0,0,0];
      if(e.state==='chase'){if(L>E.range*.8)want=V.mul(V.norm(d),E.spd);e.yaw=angLerp(e.yaw,Math.atan2(d[0],d[2]),dt*8);
        if(E.boss){if(!e.slam&&L<7&&e.cd<=0){e.slam={t:0,at:[...pl.pos]};e.cd=3.2}}
        else if(L<E.range&&e.cd<=0){e.cd=1.2;e.atk=.3;G.hurt(E.dmg,e.pos)}}
      else if(e.state==='home'){const h=V.sub(e.home,e.pos);h[1]=0;if(V.len(h)>1)want=V.mul(V.norm(h),E.spd*.7);else e.state='idle'}
      else{if(e.t>3){e.t=0;e.wander=[e.home[0]+rnd(-4,4),0,e.home[2]+rnd(-4,4)]}if(e.wander){const h=V.sub(e.wander,e.pos);h[1]=0;if(V.len(h)>.6){want=V.mul(V.norm(h),E.spd*.35);e.yaw=angLerp(e.yaw,Math.atan2(h[0],h[2]),dt*4)}}}
      if(e.slam){e.slam.t+=dt;want=[0,0,0];if(e.slam.t>.9&&!e.slam.done){e.slam.done=1;SFX.slam();shake=.35;ring(e.slam.at,[1,.5,.3],5,.6);for(let i=0;i<20;i++)debris.push({pos:V.add(e.slam.at,[rnd(-2,2),.2,rnd(-2,2)]),vel:[rnd(-3,3),rnd(3,7),rnd(-3,3)],life:1,color:'#8d8a84',size:rnd(.15,.35),rot:0});
          if(V.len(V.sub(pl.pos,e.slam.at))<4.5&&pl.pos[1]<1.5)G.hurt(E.dmg,e.slam.at)}if(e.slam.t>1.4)e.slam=null}
      if(e.type==='slime'){e.hop-=dt;if(V.len(want)>.1&&e.hop<=0&&e.pos[1]<=.01){e.vel[1]=6;e.hop=.55;if(L<14)SFX.slime(clamp(1-L/14,0,1)*.6)}if(e.pos[1]>.01)want=V.mul(want,1.4);else want=[0,0,0]}
      e.vel[0]=lerp(e.vel[0],want[0],Math.min(1,dt*8));e.vel[2]=lerp(e.vel[2],want[2],Math.min(1,dt*8));e.vel[1]-=30*dt;
      e.pos=V.add(e.pos,V.mul(e.vel,dt));if(e.pos[1]<0){e.pos[1]=0;e.vel[1]=0}
      const r=.5*E.size;for(const p of solids){if(p.size[1]<.5)continue;const b=bnd(p);if(e.pos[1]>b.mx[1]||e.pos[1]+1.5*E.size<b.mn[1])continue;
        const cx=clamp(e.pos[0],b.mn[0],b.mx[0]),cz=clamp(e.pos[2],b.mn[2],b.mx[2]),dx=e.pos[0]-cx,dz=e.pos[2]-cz,dd=Math.hypot(dx,dz);if(dd<r&&dd>1e-4){e.pos[0]+=dx/dd*(r-dd);e.pos[2]+=dz/dd*(r-dd)}}}
    // invites d'interaction
    const B_=$('rpB');B_.hidden=!boss;if(boss)$('rpBh').style.width=(boss.hp/boss.E.hp*100)+'%';
    $('rpL').textContent=sv.lvl;$('rpH').style.width=(G.hp/G.maxHp()*100)+'%';$('rpHt').textContent=`${Math.ceil(G.hp)} / ${G.maxHp()}`;$('rpX').style.width=(sv.xp/G.xpNext()*100)+'%';$('rpG').textContent=sv.gold;$('rpPn').textContent=sv.pot;
    const q=QUESTS[Math.min(sv.q,QUESTS.length-1)];$('rpQ').innerHTML='';const qt=document.createElement('div');qt.className='qt';qt.textContent='📜 '+(sv.qn>=q.n?'Retourne voir l\'Ancien !':q.txt);const qp=document.createElement('div');qp.className='qp';qp.textContent=`${Math.min(sv.qn,q.n)} / ${q.n}`;$('rpQ').append(qt,qp)},
  input(k){if(k==='attack')this.attack();if(k==='potion')this.drink()},
  extraDraw(L,TR,t){for(const e of this.en){if(e.dead)continue;const E=e.E,s=E.size,flash=e.hitT>0?(HDR?3:1):0;
      if(e.type==='slime'){const sq=e.pos[1]>.01?1.15:1-Math.abs(Math.sin(t*4))*.08;const m=M.chain(M.T(e.pos[0],e.pos[1]+.45*sq,e.pos[2]),M.RY(e.yaw),M.S(1.1/Math.sqrt(sq),.9*sq,1.1/Math.sqrt(sq)));
        L.push({mesh:MESH.rbox,m,mode:3,color:E.col,shin:140,emis:flash||.08,rim:.6});for(const sx of[-.2,.2]){L.push({mesh:MESH.sphere,m:M.mul(m,M.chain(M.T(sx,.15,.5),M.S(.16,.22,.06))),mode:3,color:'#15161b',shin:200})}}
      else{const base=M.chain(M.T(e.pos[0],e.pos[1],e.pos[2]),M.RY(e.yaw),M.S(s,s,s)),sw=Math.sin(t*8)*(V.len([e.vel[0],0,e.vel[2]])>.3?.6:0),atk=e.atk>0?-1.6:0;
        const part=(x,y,z,sx,sy,sz,c,rx=0,piv=null)=>{let m=piv?M.chain(base,M.T(...piv),M.RX(rx),M.T(x-piv[0],y-piv[1],z-piv[2])):M.mul(base,M.T(x,y,z));L.push({mesh:MESH.rbox,m:M.mul(m,M.S(sx,sy,sz)),mode:3,color:c,shin:30,emis:flash})};
        const c=E.col,c2=e.type==='golem'?'#6d6a64':'#d8d1bf';
        part(0,1.5,0,.9,1,.45,c);part(0,2.3,0,.6,.6,.6,c2);part(.65,1.5,0,.3,1,.3,c,sw+atk,[.65,1.95,0]);part(-.65,1.5,0,.3,1,.3,c,-sw+atk,[-.65,1.95,0]);part(.22,.5,0,.32,1,.32,c2,-sw,[.22,1,0]);part(-.22,.5,0,.32,1,.32,c2,sw,[-.22,1,0]);
        for(const sx of[-.13,.13])L.push({mesh:MESH.box,m:M.mul(base,M.chain(M.T(sx,2.36,.3),M.S(.12,.1,.02))),mode:3,color:e.type==='golem'?'#39f0ff':'#15161b',emis:e.type==='golem'?(HDR?4:1):0})}
      if(e.slam&&!e.slam.done){const k=e.slam.t/.9;L.push({mesh:MESH.cyl,m:M.chain(M.T(e.slam.at[0],.05,e.slam.at[2]),M.S(9*k,.04,9*k)),mode:3,color:'#ff3030',emis:HDR?1.5:.5})}}
    // barres de vie au-dessus des ennemis (HTML)
    updEnemyBars(this.en)}
};

/* ---------- classement multijoueur (affiché dans la liste des joueurs de chacun) ---------- */
GAMES.obby.lbLabel='Étape';GAMES.obby.lbValue=function(c){return c.isPlayer?(this.done?'🏁 '+fmtT(this.timer):(this.sv.stage||0)+'/14'):''};
GAMES.tycoon.lbLabel='Cash';GAMES.tycoon.lbValue=function(c){const v=Math.floor(this.sv.cash||0);return c.isPlayer?(v>=1e6?(v/1e6).toFixed(1)+' M':v>=1e3?(v/1e3).toFixed(1)+' k':String(v))+' $':''};
GAMES.rpg.lbLabel='Niveau';GAMES.rpg.lbValue=function(c){return c.isPlayer?'Nv '+(this.sv.lvl||1):''};
