"use strict";
/* ============================== ÉTAT GLOBAL ============================== */
const $=id=>document.getElementById(id);
let MODE='boot',cam={yaw:0,pitch:.3,dist:12,target:[0,2,12]},camEye=[0,0,0],shake=0,fovKick=0,time=0,camDistS=12,flareI=0,lastVP=M.id();
const keys=new Set();let joy={x:0,y:0},jumpPressed=false,camDrag=false,isTouch=matchMedia('(pointer:coarse)').matches;
const SET_DEFAULT={q:isTouch?5:8,auto:false,vol:80,amb:60,mus:50,sens:1,invY:false,autoJump:isTouch,bubbles:true,hit:false,info:false};
let SET={...SET_DEFAULT};
function QS(){const l=clamp(SET.q|0,1,10);return{level:l,dpr:l>=9?2:(l>=6?1.5:1),scale:[.5,.6,.7,.8,.9,1,1,1,1,1][l-1],sh:l<=2?0:(l<=4?1024:(l<=8?2048:4096)),
  taps:[0,0,4,4,8,8,12,16,16,16][l-1],bloom:l>=4,msaa:l>=5?4:0,parts:[.25,.35,.5,.6,.7,.8,.9,1,1,1][l-1],flare:l>=7,clouds:l>=3}}
function applySettings(){QC=QS();const need=QC.sh||256;if(shadowRes!==need)makeShadow(need);if(pl)pl.autoJump=!!SET.autoJump;applyVolume();
  $('info').classList.toggle('hidden',!SET.info);if(!SET.bubbles)for(const c of chars){c.bubbles.forEach(b=>b.el.remove());c.bubbles=[]}}

/* ============================== RENDU : AIDES ============================== */
const SKY={sun:V.norm([.45,.78,.38]),sunCol:[2.3,2.12,1.86],zen:[.1,.3,.85],hor:[.62,.78,1],gnd:[.24,.28,.2]};
let _lastTex=null,_lastMat=null;const _hexCache=new Map();function hexC(h){let v=_hexCache.get(h);if(!v){v=new Float32Array(hexRGB(h));if(_hexCache.size>4000)_hexCache.clear();_hexCache.set(h,v)}return v}
function beginScene(o){const u=P.u;gl.useProgram(P.p);
  gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,shTex);gl.uniform1i(u.uShadow,0);gl.uniform1i(u.uTex,1);gl.uniform1i(u.uMat,4);
  gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,studTex);gl.uniform1i(u.uStud,2);gl.activeTexture(gl.TEXTURE3);gl.bindTexture(gl.TEXTURE_2D,inletTex);gl.uniform1i(u.uInlet,3);
  const sc=o.sunCol||(o.hdr?SKY.sunCol:V.mul(SKY.sunCol,.5));
  gl.uniformMatrix4fv(u.uVP,false,o.VP);gl.uniformMatrix4fv(u.uLVP,false,o.LVP);gl.uniform3fv(u.uCam,o.eye);gl.uniform3fv(u.uSun,o.sun||SKY.sun);gl.uniform3fv(u.uSunCol,sc);
  gl.uniform3fv(u.uSky,V.mul(V.add(SKY.zen,SKY.hor),.5));gl.uniform3fv(u.uGnd,SKY.gnd);gl.uniform3fv(u.uHor,SKY.hor);gl.uniform3fv(u.uZen,SKY.zen);gl.uniform1f(u.uTime,time);gl.uniform1f(u.uHDR,o.hdr);gl.uniform1i(u.uTaps,o.taps);
  gl.uniform1f(u.uFogD,o.fogOff?0:(WORLD.fog||.0028));gl.uniform3fv(u.uFogC,WORLD.fogCol||SKY.hor);
  const LS=o.noLights?[]:sceneLights(o.eye);gl.uniform1i(u.uNL,LS.length);if(LS.length){const lp=new Float32Array(32),lc=new Float32Array(24);LS.forEach((l,i)=>{lp.set([l.pos[0],l.pos[1],l.pos[2],l.range],i*4);const c=hexRGB(l.color),k=l.bright*(o.hdr?1:.55);lc.set([c[0]*k,c[1]*k,c[2]*k],i*3)});gl.uniform4fv(u.uLP,lp);gl.uniform3fv(u.uLC,lc)}
  _lastTex=_lastMat=null}
// lumières ponctuelles : les 8 plus proches de la caméra
function sceneLights(eye){const L=WORLD.lights;if(!L||!L.length)return[];if(L.length<=8)return L.filter(l=>!l.off);return L.filter(l=>!l.off).map(l=>[l,V.len(V.sub(l.pos,eye))-l.range]).sort((a,b)=>a[1]-b[1]).slice(0,8).map(x=>x[0])}
function drawItem(d){const u=P.u;gl.uniformMatrix4fv(u.uM,false,d.m);gl.uniformMatrix4fv(u.uNM,false,d.nm||M.tr(M.inv(d.m)));
  gl.uniform1i(u.uMode,d.mode);gl.uniform3fv(u.uColor,hexC(d.color||'#ffffff'));gl.uniform1f(u.uShin,d.shin||24);gl.uniform1f(u.uEmis,d.emis||0);gl.uniform1f(u.uRim,d.rim||0);
  gl.uniform1f(u.uAlpha,d.alpha??1);gl.uniform1f(u.uAO,d.ao||0);
  if(d.bmin){gl.uniform3fv(u.uBMin,d.bmin);gl.uniform3fv(u.uBSize,d.bsize)}if(d.dir)gl.uniform3fv(u.uDir,d.dir);
  if(d.mat&&d.mat.tex){if(_lastMat!==d.mat.tex){gl.activeTexture(gl.TEXTURE4);gl.bindTexture(gl.TEXTURE_2D,d.mat.tex);_lastMat=d.mat.tex}gl.uniform1f(u.uMatScale,d.mat.scale);gl.uniform1f(u.uTint,d.mat.tint?1:0);gl.uniform1f(u.uStuds,d.mat.studs?1:0)}
  else gl.uniform1f(u.uStuds,0);
  if(d.mode===0&&_lastTex!==d.tex){gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,d.tex);_lastTex=d.tex}
  gl.bindVertexArray(d.mesh.vao);gl.drawElements(gl.TRIANGLES,d.mesh.count,gl.UNSIGNED_INT,0)}
function blockDraw(p,L,TR){if(p.hidden)return;const m=MATS[p.mat]||{};let mm=p.m,nm=p.nm;
  if(p.pop!=null){const k=p.pop,e=1+2.7*Math.pow(k-1,3)+1.7*Math.pow(k-1,2);mm=M.mul(M.T(...p.pos),M.S(...V.mul(p.size,Math.max(.01,e))));nm=null}
  if(p.shape==='sphere'||p.shape==='cyl'){const d={mesh:p.shape==='sphere'?MESH.sphere:MESH.cyl,m:mm,nm,bmin:bnd(p).mn,bsize:p.size,color:p.color,mat:m,shin:m.shin||20,mode:m.tex?1:3};if(m.neon){d.mode=3;d.emis=HDR?6:1.2}if(p.kind==='lava')d.mode=2;if(m.glass||(p.alpha!=null&&p.alpha<1)){d.alpha=m.glass?undefined:p.alpha;if(m.glass)d.mode=8;TR.push(d)}else L.push(d);return}
  if(p.shape==='log'){const r=p.axis==='x'?M.RZ(Math.PI/2):p.axis==='z'?M.RX(Math.PI/2):M.id();L.push({mesh:MESH.cyl,m:M.chain(M.T(...p.pos),r,M.S(p.d,p.len,p.d)),mode:0,tex:logTex,shin:14});return}
  const d={mesh:MESH.box,m:mm,nm,bmin:bnd(p).mn,bsize:p.size,dir:p.dir,color:p.color,mat:m,shin:m.shin||20,ao:1};
  if(p.kind==='lava')d.mode=2;else if(p.mode)d.mode=p.mode;else if(m.glass){d.mode=8;TR.push(d);return}else if(m.neon){d.mode=3;d.emis=HDR?6:1.2;d.ao=0}else if(m.tex)d.mode=1;else d.mode=3;
  if(m.glow)d.emis=HDR?m.glow:m.glow*.3;if(p.kind==='bounce')d.emis=HDR?.6:.15;
  if(p.alpha!=null&&p.alpha<1){d.alpha=p.alpha;TR.push(d);return}L.push(d)}
function rayBlocks(o,d,maxT,bubble){let best=maxT;for(const p of solids){if(p.mode===4||p.mat==='verre'||p.hidden)continue;if(bubble?p.mode===5:p.size[1]<1.2)continue;const b=bnd(p);let t0=0,t1=best;
  for(let k=0;k<3;k++){if(Math.abs(d[k])<1e-6){if(o[k]<b.mn[k]||o[k]>b.mx[k]){t0=1e9;break}continue}let a=(b.mn[k]-o[k])/d[k],c=(b.mx[k]-o[k])/d[k];if(a>c)[a,c]=[c,a];t0=Math.max(t0,a);t1=Math.min(t1,c);if(t0>t1)break}
  if(t0<=t1&&t0>0&&t0<best)best=t0}return best}

/* scène complète : ombres → ciel → opaques → transparents → particules → halo → composition */
function renderFrame(dt,o){const Q=QC,dpr=Math.min(devicePixelRatio||1,Q.dpr),w=Math.max(4,Math.round(cv.clientWidth*dpr*Q.scale)),h=Math.max(4,Math.round(cv.clientHeight*dpr*Q.scale));
  if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}if(!RT||RT.w!==w||RT.h!==h||RT.want!==Q.msaa)makeRT(w,h,Q.msaa);
  const{eye,target,L,TR,shadowCenter}=o,H_=HDR?1:0,sunC=HDR?SKY.sunCol:V.mul(SKY.sunCol,.5),sun=SKY.sun;
  const view=M.lookAt(eye,target,[0,1,0]);let proj=M.persp((o.fov||62)*Math.PI/180,w/h,.1,700);if(o.lens)proj=M.chain(M.T(o.lens[0],o.lens[1],0),M.S(o.lens[2],o.lens[2],1),proj);
  const VP=M.mul(proj,view),IVP=M.inv(VP);lastVP=VP;
  const ctr=shadowCenter,S=o.shadowSize||30,LVP=M.mul(M.ortho(-S,S,-S,S,1,160),M.lookAt(V.add(ctr,V.mul(sun,80)),ctr,[0,1,0]));
  gl.enable(gl.DEPTH_TEST);gl.depthMask(true);gl.disable(gl.CULL_FACE);gl.disable(gl.BLEND);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,null);
  if(Q.sh){gl.bindFramebuffer(gl.FRAMEBUFFER,shFB);gl.viewport(0,0,shadowRes,shadowRes);gl.clear(gl.DEPTH_BUFFER_BIT);gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(2,3);
    gl.useProgram(PS.p);gl.uniformMatrix4fv(PS.u.uVP,false,LVP);
    const shR=S*1.5;for(const d of L){if(d.mode===2||d.emis>2)continue;{const m=d.m,rr=(Math.abs(m[0])+Math.abs(m[1])+Math.abs(m[2])+Math.abs(m[4])+Math.abs(m[5])+Math.abs(m[6])+Math.abs(m[8])+Math.abs(m[9])+Math.abs(m[10]))*.5;if(Math.abs(m[12]-ctr[0])>shR+rr||Math.abs(m[14]-ctr[2])>shR+rr)continue}gl.uniform1i(PS.u.uMode,d.mode);if(d.bmin){gl.uniform3fv(PS.u.uBMin,d.bmin);gl.uniform3fv(PS.u.uBSize,d.bsize)}
      gl.uniformMatrix4fv(PS.u.uM,false,d.m);gl.bindVertexArray(d.mesh.vao);gl.drawElements(gl.TRIANGLES,d.mesh.count,gl.UNSIGNED_INT,0)}
    gl.disable(gl.POLYGON_OFFSET_FILL)}
  gl.bindFramebuffer(gl.FRAMEBUFFER,RT.ms);gl.viewport(0,0,w,h);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.depthMask(false);gl.disable(gl.DEPTH_TEST);gl.useProgram(PK.p);
  gl.uniformMatrix4fv(PK.u.uIVP,false,IVP);gl.uniform3fv(PK.u.uCam,eye);gl.uniform3fv(PK.u.uZen,SKY.zen);gl.uniform3fv(PK.u.uHor,SKY.hor);gl.uniform3fv(PK.u.uSun,sun);gl.uniform3fv(PK.u.uSunCol,sunC);gl.uniform3fv(PK.u.uGnd,SKY.gnd);gl.uniform1f(PK.u.uHDR,H_);gl.uniform1f(PK.u.uTime,time);gl.uniform1f(PK.u.uClouds,Q.clouds?1:0);
  gl.bindVertexArray(emptyVAO);gl.drawArrays(gl.TRIANGLES,0,3);gl.depthMask(true);gl.enable(gl.DEPTH_TEST);
  beginScene({VP,eye,LVP,hdr:H_,taps:Q.sh?Q.taps:0});L.forEach(drawItem);
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  TR.sort((a,b)=>V.len(V.sub([b.m[12],b.m[13],b.m[14]],eye))-V.len(V.sub([a.m[12],a.m[13],a.m[14]],eye)));gl.enable(gl.CULL_FACE);TR.forEach(drawItem);gl.disable(gl.CULL_FACE);
  if(o.debug){gl.depthMask(false);o.debug.forEach(drawItem);gl.depthMask(true)}
  gl.depthMask(false);gl.useProgram(PP.p);gl.uniformMatrix4fv(PP.u.uVP,false,VP);gl.uniform1f(PP.u.uHDR,H_);gl.bindVertexArray(pVAO);gl.bindBuffer(gl.ARRAY_BUFFER,pBuf);
  const R=[view[0],view[4],view[8]],U=[view[1],view[5],view[9]];
  for(const add of[false,true]){const n=buildParticles(add,R,U);if(!n)continue;gl.uniform1f(PP.u.uAdd,add?1:0);if(add)gl.blendFunc(gl.ONE,gl.ONE);else gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
    gl.bufferData(gl.ARRAY_BUFFER,pData.subarray(0,n*10),gl.STREAM_DRAW);gl.drawArrays(gl.TRIANGLES,0,n)}
  gl.depthMask(true);gl.disable(gl.BLEND);
  gl.bindFramebuffer(gl.READ_FRAMEBUFFER,RT.ms);gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER,RT.scene.fb);gl.blitFramebuffer(0,0,w,h,0,0,w,h,gl.COLOR_BUFFER_BIT,gl.NEAREST);
  gl.disable(gl.DEPTH_TEST);gl.bindVertexArray(emptyVAO);const bloomOn=HDR&&Q.bloom&&RT.bloom.length>1;
  if(bloomOn){gl.useProgram(PD_.p);gl.uniform1i(PD_.u.uSrc,0);gl.activeTexture(gl.TEXTURE0);let src=RT.scene;
    RT.bloom.forEach((B_,i)=>{gl.bindFramebuffer(gl.FRAMEBUFFER,B_.fb);gl.viewport(0,0,B_.w,B_.h);gl.bindTexture(gl.TEXTURE_2D,src.t);gl.uniform2f(PD_.u.uTx,1/src.w,1/src.h);gl.uniform1f(PD_.u.uFirst,i===0?1:0);gl.uniform1f(PD_.u.uTh,1.6);gl.drawArrays(gl.TRIANGLES,0,3);src=B_});
    gl.useProgram(PU.p);gl.uniform1i(PU.u.uSrc,0);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);
    for(let i=RT.bloom.length-1;i>0;i--){const s=RT.bloom[i],d=RT.bloom[i-1];gl.bindFramebuffer(gl.FRAMEBUFFER,d.fb);gl.viewport(0,0,d.w,d.h);gl.bindTexture(gl.TEXTURE_2D,s.t);gl.uniform2f(PU.u.uTx,1/s.w,1/s.h);gl.drawArrays(gl.TRIANGLES,0,3)}gl.disable(gl.BLEND)}
  const sp=M.xf(VP,V.add(eye,V.mul(sun,300)));let fl=0,sx=.5,sy=.5;
  if(Q.flare&&!o.noFlare&&sp[3]>0){sx=sp[0]/sp[3]*.5+.5;sy=sp[1]/sp[3]*.5+.5;const edge=Math.min(sx,1-sx,sy,1-sy);if(edge>-.1&&rayBlocks(eye,sun,300,true)>=300)fl=clamp(edge*4+.4,0,1)}
  flareI=lerp(flareI,fl,Math.min(1,dt*6));
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,w,h);gl.useProgram(PC.p);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,RT.scene.t);gl.uniform1i(PC.u.uScene,0);
  gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,bloomOn?RT.bloom[0].t:RT.scene.t);gl.uniform1i(PC.u.uBloom,1);
  gl.uniform1f(PC.u.uBloomI,bloomOn?.4:0);gl.uniform1f(PC.u.uHDR,H_);gl.uniform1f(PC.u.uTime,time);gl.uniform1f(PC.u.uExp,.92);gl.uniform2f(PC.u.uRes,w,h);gl.uniform2f(PC.u.uSunP,sx,sy);gl.uniform1f(PC.u.uFlare,flareI);
  gl.drawArrays(gl.TRIANGLES,0,3);gl.enable(gl.DEPTH_TEST);return VP}

/* ============================== RENDU DU JEU ============================== */
// élimination des objets hors champ (gros gain sur les grandes cartes)
const CULL={eye:[0,0,0],f:[0,0,-1],cosA:.3,far:520};
function setCull(eye,target,fov){CULL.eye=eye;CULL.f=V.norm(V.sub(target,eye));const asp=Math.max(1,cv.clientWidth/Math.max(1,cv.clientHeight));const half=Math.atan(Math.tan(fov*Math.PI/360)*Math.hypot(1,asp))+.12;CULL.half=half}
function inView(c,r){const dx=c[0]-CULL.eye[0],dy=c[1]-CULL.eye[1],dz=c[2]-CULL.eye[2],d=Math.sqrt(dx*dx+dy*dy+dz*dz);if(d<=r+1)return true;if(d-r>CULL.far)return false;
  const cs=(dx*CULL.f[0]+dy*CULL.f[1]+dz*CULL.f[2])/d;return Math.acos(clamp(cs,-1,1))<=CULL.half+Math.asin(Math.min(1,r/d))}
const bRad=p=>p._r||(p._r=Math.hypot(p.size[0],p.size[1],p.size[2])*.5+(p.move?Math.abs(p.move.amp||0):0));
function renderGame(dt){
  if(isTouch&&!camDrag&&joy.y>.3&&!pl.climb)cam.yaw=angLerp(cam.yaw,pl.yaw+Math.PI,dt*1.4*clamp(pl.sn,0,1));
  if(pl.climb&&!camDrag&&isTouch)cam.yaw=angLerp(cam.yaw,Math.atan2(pl.climb.n[0],pl.climb.n[2]),dt*2);
  const tgt=V.add(pl.dead||pl.left?(WORLD.spawn?WORLD.spawn(pl):SPAWN.pos):pl.pos,[0,2.1,0]);cam.target=V.add(cam.target,V.mul(V.sub(tgt,cam.target),Math.min(1,dt*12)));
  const cp=Math.cos(cam.pitch),dir=[cp*Math.sin(cam.yaw),Math.sin(cam.pitch),cp*Math.cos(cam.yaw)];
  const hit=rayBlocks(cam.target,dir,cam.dist);camDistS=hit<camDistS?hit:lerp(camDistS,hit,Math.min(1,dt*4));
  let eye=V.add(cam.target,V.mul(dir,Math.max(1.2,camDistS-.25)));
  shake=Math.max(0,shake-dt*1.2);if(shake>0)eye=V.add(eye,[rnd(-1,1)*shake,rnd(-1,1)*shake,rnd(-1,1)*shake]);camEye=eye;
  const fallK=pl.grounded||pl.climb?0:clamp((-pl.vel[1]-15)/30,0,1)*8;fovKick=lerp(fovKick,fallK,Math.min(1,dt*3));
  setCull(eye,cam.target,62+fovKick);const L=[],TR=[];for(const p of blocks)if(inView(p.pos,bRad(p)))blockDraw(p,L,TR);
  for(const d of decos)if(inView(d.pos,Math.max(...d.size)))L.push({mesh:MESH.cube,m:M.mul(M.T(...d.pos),M.S(...d.size)),mode:3,color:d.color,shin:50,emis:d.emis||0});
  for(const s of signs){if(s.hidden)continue;const w_=(s.o.w||512)/134.7,h_=(s.o.h||170)/121.4;const R=M.mul(M.T(...s.pos),M.RY(s.yaw));
    L.push({mesh:MESH.box,m:M.mul(R,M.S(w_,h_,.2)),mode:3,color:s.o.border||'#6d4a2a',shin:10},{mesh:MESH.quad1,m:M.mul(R,M.chain(M.T(0,0,.11),M.S(w_,h_,1))),mode:0,tex:s.tex,shin:4,emis:s.o.ink==='#ffffff'?(HDR?.6:.2):0})}
  for(const q of debris){const s=q.size*Math.min(1,q.life/.4);L.push({mesh:MESH.cube,m:M.chain(M.T(...q.pos),M.RY(q.rot),M.RX(q.rot*.7),M.S(s,s,s)),mode:3,color:q.color,shin:30})}
  for(const c of chars)if(c===pl||inView(V.add(c.pos,[0,1.3,0]),2.6))charDraws(c,L,TR,time);
  WORLD.extraDraw&&WORLD.extraDraw(L,TR,time);
  for(const w_ of waters){const mn=V.sub(w_.pos,V.mul(w_.size,.5));TR.push({mesh:MESH.box,m:M.mul(M.T(...w_.pos),M.S(...w_.size)),mode:9,color:w_.color||'#3fb6c9',shin:200,bmin:mn,bsize:w_.size})}
  let debug=null;if(SET.hit){debug=[];for(const c of chars)if(!c.dead&&!c.left)HB.forEach(h=>debug.push({mesh:MESH.box,m:M.chain(M.T(c.pos[0],c.pos[1]+(h[0]+h[1])/2,c.pos[2]),M.RY(c.yaw),M.S(h[2]*2,h[1]-h[0],h[3]*2)),mode:7,color:c.swimming?'#3fb6ff':c.climb?'#38d9ff':(c.isPlayer?'#ff9a3d':'#b8ff5a'),alpha:.14}))}
  const C0=pl.pos;const VP=renderFrame(dt,{eye,target:cam.target,L,TR,shadowCenter:[C0[0],Math.max(0,C0[1]-2),C0[2]],fov:62+fovKick,debug});
  updBubbles(dt,VP,cv.clientWidth,cv.clientHeight);updPrompts(VP);updFloat(dt,VP);updReacts(dt,VP)}

/* ============================== VITRINE D'AVATAR (lanceur) ============================== */
const SHOW={yaw:.5,spin:.25,drag:false,char:null,el:null};
function renderShowroom(dt){const el=SHOW.el;if(!el||!SHOW.char)return;const r=el.getBoundingClientRect(),W=cv.clientWidth,Hh=cv.clientHeight;if(r.width<10)return;
  const c=SHOW.char;if(!SHOW.drag)SHOW.yaw+=dt*SHOW.spin;c.yaw=SHOW.yaw;c.grounded=true;animate(c,dt,time);
  const L=[],TR=[];charDraws(c,L,TR,time);
  L.push({mesh:MESH.cyl,m:M.chain(M.T(0,-.2,0),M.S(3.6,.4,3.6)),mode:3,color:'#e9edf3',shin:120},{mesh:MESH.torus,m:M.chain(M.T(0,-.02,0),M.S(5.1,.25,5.1)),mode:3,color:'#ffd23f',shin:160,emis:HDR?1.2:.3});
  const cx=((r.left+r.width/2)/W)*2-1,cy=1-((r.top+r.height/2)/Hh)*2,s=Math.min(r.height/Hh,r.width/W*1.4)*1.18;
  if(Math.random()<dt*2)emit({pos:[rnd(-1.6,1.6),rnd(0,3),rnd(-1.6,1.6)],vel:[0,rnd(.2,.5),0],life:2.5,size:.05,size1:0,col:[2,1.8,1],add:1,shape:2});updParticles(dt);
  renderFrame(dt,{eye:[0,1.7,7.2],target:[0,1.35,0],L,TR,shadowCenter:[0,0,0],shadowSize:6,fov:38,lens:[cx,cy,s],noFlare:true})}

/* ============================== CHAT & BULLES ============================== */
let chatIdleT=12;const blocked=new Set(),chatHist=[];
function bubbleFor(c){c.bw=document.createElement('div');c.bw.className='bw';c.bstack=document.createElement('div');c.bstack.className='bstack';c.bw.appendChild(c.bstack);
  if(!c.isPlayer){const tg=document.createElement('div');tg.className='tag';tg.textContent=c.name;c.bw.appendChild(tg)}$('bubbles').appendChild(c.bw);c.vis=1}
function logLine(name,col,text,sys){const d=document.createElement('div');d.className=sys?'m sys':'m';
  if(name){const b=document.createElement('b');b.style.color=col;b.textContent='['+name+']:';d.appendChild(b)}
  d.appendChild(document.createTextNode(' '+text));const log=$('chatlog');log.appendChild(d);while(log.children.length>60)log.firstChild.remove();
  log.scrollTop=log.scrollHeight;$('chatWin').classList.remove('faded');chatIdleT=10;if(name)chatHist.push(`[${name}] ${text}`)}
const sys=t=>logLine(null,null,t,true);
function say(c,text){text=filterText(emojify(String(text))).trim().slice(0,120);if(!text||c.left)return;
  const m=text.match(/^\/e\s+(\S+)/i);if(m){emoteCmd(c,m[1].toLowerCase());return}
  if(blocked.has(c.name))return;
  if(SET.bubbles){const el=document.createElement('div');el.className='bub';el.textContent=text;c.bstack.appendChild(el);c.bubbles.push({el,t:9});
    while(c.bubbles.length>3)c.bubbles.shift().el.remove();c.bubbles.forEach((b,i)=>b.el.classList.toggle('old',i<c.bubbles.length-1))}
  logLine(c.name,c.nameCol,text);SFX.pop(distVol(c)*.8+.2);if(c.isPlayer&&!/^\/e\s/i.test(text))MP.sendChat(text)}
function emoteCmd(c,e){c.emote=null;c.dance=false;
  if(/dans|dance/.test(e))c.dance=true;else if(/salu|wave/.test(e))c.wave=1.6;else if(/point/.test(e))c.point=2;else if(/appl|clap/.test(e))c.clap=2.2;
  else{const map={robot:'robot',disco:'disco',toupie:'toupie',spin:'toupie',pompe:'flexion',flexion:'flexion',dab:'dab',rire:'rire',lol:'rire',mdr:'rire',pleur:'pleurer',cry:'pleurer',hourra:'hourra',cheer:'hourra',courbette:'courbette',bow:'courbette',assis:'assis',sit:'assis',salto:'salto',flip:'salto',zombie:'zombie',guitar:'guitare',moon:'moonwalk',gliss:'moonwalk',medit:'meditation',muscle:'muscles',flex:'muscles'};const k=Object.keys(map).find(k=>e.startsWith(k));
    if(k){const em=map[k];if(c.isPlayer&&!ownsEmote(em)){sys(`Tu ne possèdes pas l'emote « ${em} ». Elle est en boutique !`);return}c.emote=em;const snd={rire:'laugh',pleurer:'cry',hourra:'cheer',guitare:'guitar',salto:'flip'}[em];if(snd)SFX[snd]()}}}
function openChat(){const w=$('chatWin');w.classList.remove('hidden','faded');w.classList.add('active');keys.clear();joy={x:0,y:0};$('chatIn').focus()}
function closeChat(){const w=$('chatWin');w.classList.remove('active');$('chatIn').blur();chatIdleT=6;if(isTouch)w.classList.add('hidden')}
function occluded(a,b){const d=V.sub(b,a),L=V.len(d);return rayBlocks(a,V.mul(d,1/L),L-.3,true)<L-.35}
function project(VP,p,w,h){const q=M.xf(VP,p);if(q[3]<=.1)return null;return[(q[0]/q[3]*.5+.5)*w,(1-(q[1]/q[3]*.5+.5))*h,q[3]]}
function updBubbles(dt,VP,w,h){chatIdleT-=dt;if(chatIdleT<0&&document.activeElement!==$('chatIn')&&!$('chatWin').matches(':hover'))$('chatWin').classList.add('faded');
  for(const c of chars){if(!c.bw)continue;for(let i=c.bubbles.length-1;i>=0;i--){const b=c.bubbles[i];b.t-=dt;if(b.t<.5)b.el.style.opacity=Math.max(0,b.t/.5);if(b.t<=0){b.el.remove();c.bubbles.splice(i,1)}}
    const head=V.add(c.pos,[0,H+.35+c.a.bob,0]),p=project(VP,head,w,h),dist=V.len(V.sub(head,camEye));
    if(!p||c.dead||c.left||dist>80||(!c.bubbles.length&&c.isPlayer)){c.bw.style.display='none';continue}
    const vis=c.isPlayer||!occluded(camEye,head);c.vis=lerp(c.vis,vis?1:0,Math.min(1,dt*12));if(c.vis<.03){c.bw.style.display='none';continue}
    const s=clamp(14/dist,.5,1.15);c.bw.style.display='flex';c.bw.style.opacity=c.vis.toFixed(2);c.bw.style.transform=`translate(${p[0].toFixed(1)}px,${p[1].toFixed(1)}px) translate(-50%,-100%) scale(${s.toFixed(3)})`}}
/* textes flottants, barres de vie, invites d'interaction */
const floats=[];
function floatText(pos,text,color='#fff'){const el=document.createElement('div');el.className='ftxt';el.textContent=text;el.style.color=color;$('floats').appendChild(el);floats.push({pos:[...pos],el,t:1.1})}
function updFloat(dt,VP){const w=cv.clientWidth,h=cv.clientHeight;for(let i=floats.length-1;i>=0;i--){const f=floats[i];f.t-=dt;f.pos[1]+=dt*1.2;if(f.t<=0){f.el.remove();floats.splice(i,1);continue}
  const p=project(VP,f.pos,w,h);if(!p){f.el.style.display='none';continue}f.el.style.display='block';f.el.style.opacity=Math.min(1,f.t*2);f.el.style.transform=`translate(${p[0]}px,${p[1]}px) translate(-50%,-50%) scale(${clamp(12/p[2],.6,1.4)})`}}
function updEnemyBars(list){const lay=$('ebars'),w=cv.clientWidth,h=cv.clientHeight;
  for(const e of list){if(!e.bar){e.bar=document.createElement('div');e.bar.className='ebar';e.bar.innerHTML='<span></span><i><b></b></i>';e.bar.firstChild.textContent=e.E.name;lay.appendChild(e.bar)}
    const d=V.len(V.sub(e.pos,pl.pos));const show=!e.dead&&!e.E.boss&&d<16&&(e.hp<e.E.hp||e.state==='chase');if(!show){e.bar.style.display='none';continue}
    const p=project(lastVP,V.add(e.pos,[0,2.9*e.E.size*(e.type==='slime'?.4:1)+.4,0]),w,h);if(!p){e.bar.style.display='none';continue}
    e.bar.style.display='block';e.bar.style.transform=`translate(${p[0]}px,${p[1]}px) translate(-50%,-100%)`;e.bar.querySelector('b').style.width=(e.hp/e.E.hp*100)+'%'}}
let promptCur=null;
function updPrompts(VP){const el=$('prompt');let best=null,bd=4.2;for(const pr of WORLD.prompts||[]){const d=V.len(V.sub(pr.who.pos,pl.pos));if(d<bd){bd=d;best=pr}}
  promptCur=best;if(!best||dialogOpen()){el.style.display='none';return}const p=project(VP,V.add(best.who.pos,[0,1.6,0]),cv.clientWidth,cv.clientHeight);if(!p){el.style.display='none';return}
  el.style.display='flex';el.querySelector('.pl').textContent=best.label;el.querySelector('.pn').textContent=best.who.name;el.style.transform=`translate(${p[0]}px,${p[1]}px) translate(-50%,-50%)`}
function usePrompt(){if(promptCur&&!dialogOpen()){SFX.click();promptCur.act();return true}return false}
const dialogOpen=()=>$('dialog').classList.contains('open');
function openDialog(name,text,buttons){const d=$('dialog');d.querySelector('.dn').textContent=name;d.querySelector('.dt').textContent=text;const bx=d.querySelector('.db');bx.innerHTML='';
  for(const[label,fn]of buttons){const b=document.createElement('button');b.className='btn'+(fn?'':' pri');b.textContent=label;b.onclick=()=>{SFX.click();const keep=fn&&fn();if(keep&&WORLD.talkShop&&name.startsWith('Forgeronne')){WORLD.talkShop();return}d.classList.remove('open')};bx.appendChild(b)}
  d.classList.add('open');keys.clear();joy={x:0,y:0}}

/* ============================== ENTRÉES ============================== */
const typing=()=>document.activeElement===$('chatIn');
const gameBlocked=()=>$('gmenu').classList.contains('open')||$('result').classList.contains('open')||typing()||dialogOpen();
function playerWish(){let ix=0,iz=0;if(!gameBlocked()){if(keys.has('KeyW')||keys.has('ArrowUp'))iz+=1;if(keys.has('KeyS')||keys.has('ArrowDown'))iz-=1;if(keys.has('KeyD')||keys.has('ArrowRight'))ix+=1;if(keys.has('KeyA')||keys.has('ArrowLeft'))ix-=1;ix+=joy.x;iz+=joy.y}
  const l=Math.hypot(ix,iz);if(l>1){ix/=l;iz/=l}const f=[-Math.sin(cam.yaw),0,-Math.cos(cam.yaw)],r=[Math.cos(cam.yaw),0,-Math.sin(cam.yaw)];return Object.assign(V.add(V.mul(f,iz),V.mul(r,ix)),{ix,iz})}
function playerInput(){const w=playerWish(),j=jumpPressed&&!gameBlocked();jumpPressed=false;const blk=gameBlocked();return{ix:w.ix,iz:w.iz,wish:[w[0],w[1],w[2]],jump:j,up:!blk&&(keys.has('Space')||jumpHeld),down:!blk&&(keys.has('KeyC')||keys.has('ControlLeft'))}}
let jumpHeld=false;
addEventListener('keydown',e=>{audioInit();if(MODE!=='game')return;
  if(e.code==='Escape'){e.preventDefault();if(typing()){closeChat();return}if(dialogOpen()){$('dialog').classList.remove('open');return}if($('result').classList.contains('open'))return;toggleGMenu();return}
  if(gameBlocked())return;
  if(e.key==='/'||e.code==='Slash'||e.code==='Enter'||e.code==='NumpadEnter'){e.preventDefault();openChat();return}
  if(e.code==='Tab'){e.preventDefault();$('plist').classList.toggle('hidden');return}
  if(e.code==='Space'){e.preventDefault();if(!e.repeat)jumpPressed=true}
  if(e.code==='KeyE'){if(!usePrompt())emoteCmd(pl,'salut')}
  if(e.code==='KeyF'&&WORLD.input)WORLD.input('attack');if(e.code==='KeyQ'&&WORLD.input)WORLD.input('potion');
  if(e.code==='KeyG')pl.dance=!pl.dance;if(e.code==='KeyH'){SET.hit=!SET.hit}if(e.code==='KeyR'&&!pl.dead)die(pl);
  keys.add(e.code)});
addEventListener('keyup',e=>keys.delete(e.code));addEventListener('blur',()=>{keys.clear();joy={x:0,y:0}});
const ptr=new Map();let joyId=null,joyO=null,pinch=0,downInfo=null;
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointerdown',e=>{audioInit();if(MODE==='launcher'&&SHOW.el){SHOW.drag=true;ptr.set(e.pointerId,[e.clientX,e.clientY]);cv.setPointerCapture(e.pointerId);return}
  if(MODE!=='game')return;$('emotes').classList.remove('open');if(typing())$('chatIn').blur();cv.setPointerCapture(e.pointerId);
  if(e.pointerType==='touch'){setTouch(true);if(e.clientX<innerWidth*.45&&joyId===null){joyId=e.pointerId;joyO=[e.clientX,e.clientY];const j=$('joy');j.style.display='block';j.style.left=e.clientX+'px';j.style.top=e.clientY+'px';$('knob').style.transform='';return}}
  ptr.set(e.pointerId,[e.clientX,e.clientY]);camDrag=true;downInfo={x:e.clientX,y:e.clientY,t:performance.now(),moved:0,btn:e.button};if(ptr.size===2){const[a,b]=[...ptr.values()];pinch=Math.hypot(a[0]-b[0],a[1]-b[1])}});
cv.addEventListener('pointermove',e=>{
  if(MODE==='launcher'&&SHOW.drag){const p=ptr.get(e.pointerId);if(p){SHOW.yaw+=(e.clientX-p[0])*.012;p[0]=e.clientX;p[1]=e.clientY}return}
  if(e.pointerId===joyId){let dx=e.clientX-joyO[0],dy=e.clientY-joyO[1];const l=Math.hypot(dx,dy),R=56;
    if(l>R*1.6){joyO=[e.clientX-dx/l*R*1.6,e.clientY-dy/l*R*1.6];const j=$('joy');j.style.left=joyO[0]+'px';j.style.top=joyO[1]+'px';dx=e.clientX-joyO[0];dy=e.clientY-joyO[1]}
    const L=Math.hypot(dx,dy),m=clamp((Math.min(L,R)/R-.12)/.88,0,1);joy={x:L?dx/L*m:0,y:L?-dy/L*m:0};$('knob').style.transform=`translate(${clamp(dx,-R,R)}px,${clamp(dy,-R,R)}px)`;return}
  const p=ptr.get(e.pointerId);if(!p)return;if(downInfo)downInfo.moved+=Math.abs(e.clientX-p[0])+Math.abs(e.clientY-p[1]);
  if(ptr.size===2){p[0]=e.clientX;p[1]=e.clientY;const[a,b]=[...ptr.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);cam.dist=clamp(cam.dist*pinch/Math.max(d,1),5,30);pinch=d;return}
  const k=(e.pointerType==='touch'?.009:.006)*SET.sens;cam.yaw-=(e.clientX-p[0])*k;cam.pitch=clamp(cam.pitch+(e.clientY-p[1])*k*.85*(SET.invY?-1:1),-.3,1.35);p[0]=e.clientX;p[1]=e.clientY});
const pup=e=>{SHOW.drag=false;if(e.pointerId===joyId){joyId=null;joy={x:0,y:0};$('joy').style.display='none'}
  if(MODE==='game'&&downInfo&&downInfo.moved<6&&performance.now()-downInfo.t<350&&downInfo.btn===0){if(WORLD.click&&WORLD.click(screenRay(e.clientX,e.clientY))){}else if(e.pointerType!=='touch'&&WORLD.input)WORLD.input('attack')}
  ptr.delete(e.pointerId);if(!ptr.size){camDrag=false;downInfo=null}};
cv.addEventListener('pointerup',pup);cv.addEventListener('pointercancel',pup);
cv.addEventListener('wheel',e=>{e.preventDefault();if(MODE==='game')cam.dist=clamp(cam.dist*Math.exp(e.deltaY*.001),5,30)},{passive:false});
document.addEventListener('gesturestart',e=>e.preventDefault());
function tbtn(id,fn){const b=$(id);b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();audioInit();fn();b.classList.add('down');try{navigator.vibrate&&navigator.vibrate(8)}catch(_){}});['pointerup','pointercancel','pointerleave'].forEach(ev=>b.addEventListener(ev,()=>b.classList.remove('down')))}
tbtn('jbtn',()=>{jumpPressed=true;jumpHeld=true});['pointerup','pointercancel','pointerleave'].forEach(ev=>$('jbtn').addEventListener(ev,()=>jumpHeld=false));tbtn('abtn',()=>WORLD.input&&WORLD.input('attack'));tbtn('ubtn',()=>usePrompt());
function setTouch(on){isTouch=on;document.body.classList.toggle('touch',on)}
$('chatForm').addEventListener('submit',e=>{e.preventDefault();audioInit();say(pl,$('chatIn').value);$('chatIn').value='';closeChat()});
$('chatIn').addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Escape'){$('chatIn').value='';closeChat()}});
$('chatIn').addEventListener('focus',()=>{$('chatWin').classList.add('active');$('chatWin').classList.remove('faded');keys.clear()});
$('chatIn').addEventListener('blur',()=>$('chatWin').classList.remove('active'));
$('prompt').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();usePrompt()});
$('bChat').onclick=e=>{e.stopPropagation();audioInit();if($('chatWin').classList.contains('hidden')||!isTouch)openChat();else closeChat()};
$('bEmote').onclick=e=>{e.stopPropagation();SFX.click();document.querySelector('.chatpick')?.classList.remove('open');renderEmotes();$('emotes').classList.toggle('open')};
$('bGMenu').onclick=e=>{e.stopPropagation();toggleGMenu()};
function renderEmotes(){const box=$('emotes');box.innerHTML='';for(const it of CATALOG.filter(i=>i.cat==='emote')){const own=ownsEmote(it.emote);const b=document.createElement('button');b.textContent=(own?'':'🔒 ')+it.name;b.disabled=!own;
    b.onclick=()=>{if(it.emote==='danse'){pl.emote=null;pl.dance=!pl.dance}else emoteCmd(pl,it.emote);$('emotes').classList.remove('open')};box.appendChild(b)}}

/* ============================== MENU EN JEU (Échap) ============================== */
let gTab='joueurs',reportView=null,reportTarget=null;
function toggleGMenu(force){const o=force??!$('gmenu').classList.contains('open');$('gmenu').classList.toggle('open',o);keys.clear();joy={x:0,y:0};SFX.menu(o);if(o){reportView=null;renderGMenu()}}
document.querySelectorAll('#gmenu .tabs button').forEach(b=>b.onclick=()=>{gTab=b.dataset.tab;reportView=null;renderGMenu();SFX.click()});
$('gResume').onclick=()=>toggleGMenu(false);$('gReset').onclick=()=>{toggleGMenu(false);if(!pl.dead)die(pl)};$('gLeave').onclick=()=>{toggleGMenu(false);exitGame()};
$('gmenu').addEventListener('pointerdown',e=>{if(e.target.id==='gmenu')toggleGMenu(false)});
function el(tag,props={},...kids){const e=document.createElement(tag);for(const[k,v]of Object.entries(props)){if(k==='class')e.className=v;else if(k==='text')e.textContent=v;else if(k==='html')e.innerHTML=v;else if(k.startsWith('on'))e[k]=v;else if(k==='style')e.style.cssText=v;else e.setAttribute(k,v)}for(const k of kids)if(k!=null&&k!==false)e.appendChild(typeof k==='string'?document.createTextNode(k):k);return e}
function settingsPanel(B,onChange){const sw=(k,label,sub)=>el('div',{class:'set'},el('div',{},label,sub?el('small',{text:sub}):null),el('button',{class:'sw'+(SET[k]?' on':''),'aria-label':label,onclick:()=>{SET[k]=!SET[k];applySettings();saveSettings();SFX.click();onChange()}}));
  const rng=(k,label,min,max,step,fmt,sub,dis)=>{const o=el('output',{text:fmt(SET[k])}),i=el('input',{type:'range',min,max,step,value:SET[k]});if(dis)i.disabled=true;i.oninput=()=>{SET[k]=+i.value;o.textContent=fmt(SET[k]);applySettings();saveSettings()};return el('div',{class:'set'},el('div',{},label,sub?el('small',{text:sub}):null),el('div',{class:'rng'},i,o))};
  B.append(el('h3',{text:'Graphismes'}),sw('auto','Qualité automatique','Ajuste la qualité selon la fluidité'),rng('q','Qualité graphique',1,10,1,v=>v+'/10','Ombres, lumière, anticrénelage, particules, résolution',SET.auto));
  const q=QS();B.append(el('div',{class:'note',text:`Niveau ${q.level} : résolution ${Math.round(q.scale*100)} % · ombres ${q.sh?q.sh+' px':'non'} · halo ${q.bloom?'oui':'non'} · anticrénelage ${q.msaa?'×'+q.msaa:'non'} · particules ${Math.round(q.parts*100)} %`}));
  B.append(el('h3',{text:'Son'}),rng('vol','Volume général',0,100,1,v=>v+' %'),rng('amb','Ambiance',0,100,1,v=>v+' %'),rng('mus','Musique',0,100,1,v=>v+' %'));
  B.append(el('h3',{text:'Commandes'}),rng('sens','Sensibilité caméra',.3,2.5,.1,v=>(+v).toFixed(1)+'×'),sw('invY','Inverser l\'axe vertical'),sw('autoJump','Saut automatique','Saute tout seul devant les obstacles'));
  B.append(el('h3',{text:'Affichage'}),sw('bubbles','Bulles de discussion'),sw('hit','Afficher la hitbox','Touche H'),sw('info','Infos (FPS, état)'))}
function renderGMenu(){document.querySelectorAll('#gmenu .tabs button').forEach(b=>b.classList.toggle('on',b.dataset.tab===gTab));const B=$('gBody');B.innerHTML='';
  if(gTab==='amis'){gFriendsTab(B);return}
  if(gTab==='joueurs'){B.append(el('h3',{text:`Dans ce serveur · ${chars.filter(c=>!c.left&&!(c.ai&&!c.remote)).length} joueur(s)${MP.room?' · serveur '+MP.server:' · hors ligne'}`}));
    for(const c of chars){if(c.left||(c.ai&&!c.remote))continue;const d=c.isPlayer?null:Math.round(V.len(V.sub(c.pos,pl.pos)));const img=el('img',{class:'ava',alt:''});img.src=headThumb(c.av);
      const row=el('div',{class:'prow'},img,el('div',{class:'nm'},c.name,c.isPlayer?el('span',{class:'you',text:'toi'}):null,el('small',{text:c.isPlayer?ACC.pseudo:`${blocked.has(c.name)?'Bloqué · ':''}à ${d} m`})));
      if(c.remote&&c.fid){frLists();const isF=ACC.friends.some(f=>f.id===c.fid),sent=ACC.friendOut.some(f=>f.id===c.fid);row.append(el('button',{class:'btn sm'+(isF||sent?'':' green'),text:isF?'💬':sent?'Demande envoyée':'＋ Ami',disabled:sent?'':null,onclick:()=>{if(isF)openDm(ACC.friends.find(f=>f.id===c.fid));else{addFriend(c.fid,c.name.replace(/^👑 /,''));renderGMenu()}}}))}
      if(!c.isPlayer){row.append(el('button',{class:'btn sm',text:blocked.has(c.name)?'Débloquer':'Bloquer',onclick:()=>{if(blocked.has(c.name)){blocked.delete(c.name);sys(`${c.name} n'est plus bloqué.`)}else{blocked.add(c.name);c.bubbles.forEach(b=>b.el.remove());c.bubbles=[];sys(`${c.name} est bloqué.`)}renderGMenu();renderPlist()}}),
        el('button',{class:'btn sm red',text:'Signaler',onclick:()=>{reportTarget=c.name;gTab='signal';renderGMenu()}}))}B.append(row)}}
  else if(gTab==='params')settingsPanel(B,renderGMenu);
  else if(gTab==='signal'){if(reportView){B.append(el('div',{class:'ok'},el('div',{class:'big',text:'✅'}),el('h2',{text:'Merci, ton signalement a été envoyé'}),el('p',{class:'note',text:`Ticket n° ${reportView.id} · ${reportView.player} · ${reportView.reason}`}),el('p',{class:'note',text:'Démo : le signalement est enregistré avec ton compte, aucun modérateur ne le reçoit.'})));return}
    const sel=el('select',{});for(const c of chars.filter(c=>c.remote&&!c.left))sel.append(el('option',{value:c.name,text:c.name}));if(reportTarget)sel.value=reportTarget;
    const rs=el('div',{class:'reasons'});['Langage inapproprié','Harcèlement ou intimidation','Triche ou exploit','Spam ou arnaque','Nom ou avatar inapproprié','Autre'].forEach(r=>rs.append(el('label',{},el('input',{type:'radio',name:'rr',value:r}),r)));
    const ta=el('textarea',{maxlength:'300',placeholder:'Explique ce qui s\'est passé (facultatif)'}),err=el('div',{class:'note',style:'color:#ff8a8a'});
    B.append(el('h3',{text:'Signaler un joueur'}),el('div',{class:'fld'},el('span',{text:'Joueur'}),sel),el('div',{class:'fld'},el('span',{text:'Motif'}),rs),el('div',{class:'fld'},el('span',{text:'Détails'}),ta),err,
      el('button',{class:'btn red',text:'Envoyer le signalement',onclick:()=>{const r=rs.querySelector('input:checked');if(!r){err.textContent='Choisis un motif.';return}
        const rep={id:Math.random().toString(36).slice(2,8).toUpperCase(),player:sel.value,reason:r.value,details:ta.value.slice(0,300),chat:chatHist.slice(-10),date:new Date().toISOString()};
        ACC.reports=(ACC.reports||[]).concat([rep]).slice(-30);markDirty();reportView=rep;reportTarget=null;SFX.report();renderGMenu()}}),
      el('div',{class:'note',text:'Démo : le signalement est enregistré avec ton compte.'}))}
  else{const t=el('table',{class:'help'});[['ZQSD / WASD','Marcher'],['Espace','Sauter · se décrocher'],['Avancer contre une échelle/un treillis/un mur','Grimper'],['/ ou Entrée','Chat'],['E','Parler / interagir · sinon saluer'],['F ou clic','Attaquer (RPG)'],['Q','Potion (RPG)'],['G','Danser'],['Tab','Liste des joueurs'],['Échap','Menu'],['R','Réinitialiser'],['H','Hitbox']].forEach(([a,b])=>t.append(el('tr',{},el('td',{},el('kbd',{text:a})),el('td',{text:b}))));B.append(el('h3',{text:'Commandes'}),t)}}
function renderPlist(){const L_=$('plist');L_.innerHTML='';L_.append(el('div',{class:'hd'},el('span',{text:'Joueurs'}),el('span',{text:WORLD.lbLabel||''})));
  for(const c of chars){if(c.left||(c.ai&&!c.remote))continue;const r=el('div',{class:'r'+(c.isPlayer?' me':'')+(blocked.has(c.name)?' blk':'')+(c.remote?' rem':'')},el('span',{},el('i',{class:'dot',style:`background:${IT[c.av.haut]?.c||'#888'}`}),c.name),el('span',{text:c.remote?(c.lb||''):WORLD.lbValue?String(WORLD.lbValue(c)):''}));r.onclick=()=>{gTab='joueurs';toggleGMenu(true)};L_.append(r)}}
function showResult(title,text,buttons){const r=$('result');r.querySelector('h2').textContent=title;r.querySelector('p').textContent=text;const bx=r.querySelector('.rb');bx.innerHTML='';
  for(const[label,fn]of buttons)bx.append(el('button',{class:'btn pri',text:label,onclick:()=>{r.classList.remove('open');fn&&fn()}}));r.classList.add('open')}

/* ============================== BOUCLE ============================== */
let lastT=performance.now(),fpsS=60,autoT=0,plT=0,saveT=0;
function update(dt,t){for(const p of blocks)if(p.move){const np=V.add(p.base,V.mul(p.move.axis,p.move.amp*Math.sin(t*p.move.speed)));p.delta=V.sub(np,p.pos);p.pos=np;bmat(p)}
  for(const c of chars){if(c.left)continue;if(c.remote){if(!c.dead)animate(c,dt,t);continue}if(c.dead){c.dead-=dt;if(c.dead<=0)respawn(c);continue}
    const inp=c.isPlayer?playerInput():npcThink(c,dt,t);if(V.len(inp.wish)>.05){c.dance=false;c.clap=0;c.point=0;c.emote=null}
    stepChar(c,dt,t,inp);
    for(const p of blocks)if(p.kind==='lava'&&!p.off){const b=bnd(p);if(yOv(c,b)&&sat(c,{mn:V.sub(b.mn,[.05,0,.05]),mx:V.add(b.mx,[.05,0,.05])})){die(c,true);break}}
    if(!c.dead&&c.pos[1]<(WORLD.voidY??-25))die(c);if(!c.dead)animate(c,dt,t)}
  MP.step(dt);WORLD.update&&WORLD.update(dt,t);ambientVFX(dt,t);updParticles(dt);ambientAudio(dt)}
function frame(now){const raw=(now-lastT)/1000,dt=Math.min(raw,1/20);lastT=now;time+=dt;fpsS=lerp(fpsS,1/Math.max(raw,1e-3),.05);
  try{
    if(MODE==='game'&&pl){MP.tick(dt);let gd=dt;if(hitStop>0){hitStop-=dt;gd=dt*.12}const n=gd>1/45?3:2;for(let i=0;i<n;i++)update(gd/n,time-gd+gd*(i+1)/n);renderGame(dt);glows.length=0;
      if(SET.info){$('hState').textContent=pl.dead?'K.O.':pl.state;$('hFps').textContent=Math.round(fpsS)}
      if(SET.auto){autoT+=dt;if(autoT>2.5){autoT=0;if(fpsS<42&&SET.q>1){SET.q--;applySettings()}else if(fpsS>57&&SET.q<9){SET.q++;applySettings()}}}
      plT-=dt;if(plT<0){plT=.5;renderPlist()}
      saveT+=dt;if(saveT>20){saveT=0;persistGame()}}
    else if(MODE==='studio'&&CUR_GAME){renderStudio(dt);updParticles(dt);glows.length=0}
    else if(MODE==='launcher'&&SHOW.el&&SHOW.el.offsetParent){renderShowroom(dt);glows.length=0}
    else if(thumbPump)thumbPump();
  }catch(err){console.error(err);if(!frame.errT||performance.now()-frame.errT>5000){frame.errT=performance.now();if(MODE==='studio'&&typeof studioOut==='function')studioOut('Erreur du moteur : '+err.message,'err')}}
  requestAnimationFrame(frame)}
let thumbPump=null,hitStop=0;
