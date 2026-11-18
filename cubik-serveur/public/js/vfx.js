"use strict";
/* ============================================================================
   EFFETS VISUELS EN PLUS : poussière de course, traînée de vitesse, météo
   (neige, braises, brume, poussière, lucioles la nuit), bulles sous l'eau,
   flash rouge quand on est touché, onde de choc à l'atterrissage.
   ============================================================================ */
const VFX2={runT:0,lastHp:null,flash:0,wasGround:true,lastVy:0};
(()=>{const base=ambientVFX;ambientVFX=function(dt,t){base(dt,t);try{vfx2(dt,t)}catch(e){}};
  const st=document.createElement('style');st.textContent='#hurtfx{position:fixed;inset:0;pointer-events:none;z-index:5;opacity:0;background:radial-gradient(ellipse at center,transparent 45%,rgba(255,30,30,.55));transition:opacity .25s}';document.head.appendChild(st);
  const d=document.createElement('div');d.id='hurtfx';document.body.appendChild(d)})();
const WEATHER={manoir:'brume',camp:'lucioles',neige:'neige',tour:'braise',mine:'poussiere',zombies:'brume',prison:'brume',peche:'mouettes',animaux:'paillettes',rpg:'lucioles',defense:'feuilles'};
function vfx2(dt,t){if(!pl||MODE!=='game')return;const q=(typeof QC!=='undefined'&&QC.parts)||1,R=k=>Math.random()<dt*k*q;
  const sp=Math.hypot(pl.vel[0],pl.vel[2]);
  // poussière de course + traînée de vitesse
  if(pl.grounded&&sp>6.5){VFX2.runT-=dt;if(VFX2.runT<=0){VFX2.runT=.09;emit({pos:V.add(pl.pos,[rnd(-.25,.25),.08,rnd(-.25,.25)]),vel:[-pl.vel[0]*.08+rnd(-.3,.3),rnd(.4,.9),-pl.vel[2]*.08+rnd(-.3,.3)],life:rnd(.35,.6),size:.18,size1:.55,col:[.75,.72,.68],alpha:.35,drag:.6})}}
  if(sp>13)for(let k=0;k<2;k++)if(R(30))emit({pos:V.add(pl.pos,[rnd(-.5,.5),rnd(.4,2.2),rnd(-.5,.5)]),vel:V.mul(pl.vel,-.15),life:.25,size:.06,size1:0,col:[2,2.4,3],add:1,shape:2});
  // onde de choc à l'atterrissage (grosses chutes)
  if(pl.grounded&&!VFX2.wasGround&&VFX2.lastVy<-18){for(let i=0;i<20;i++){const a=i/20*6.283;emit({pos:V.add(pl.pos,[Math.cos(a)*.4,.1,Math.sin(a)*.4]),vel:[Math.cos(a)*6,.6,Math.sin(a)*6],life:.35,size:.25,size1:.05,col:[1.4,1.4,1.5],alpha:.6,drag:2})}shake=Math.max(shake,.15)}
  VFX2.wasGround=pl.grounded;VFX2.lastVy=pl.vel[1];
  // bulles sous l'eau
  if(pl.inWater&&R(6))emit({pos:V.add(pl.pos,[rnd(-.3,.3),rnd(1,2.2),rnd(-.3,.3)]),vel:[rnd(-.2,.2),rnd(1,2),rnd(-.2,.2)],life:rnd(.6,1.2),size:.06,size1:.12,col:[1.6,2,2.4],alpha:.6,shape:2});
  // flash rouge quand les PV baissent
  const hp=WORLD.hp;if(typeof hp==='number'){if(VFX2.lastHp!=null&&hp<VFX2.lastHp-.5)VFX2.flash=.5;VFX2.lastHp=hp}else VFX2.lastHp=null;if(pl.dead&&VFX2.flash<.2&&!VFX2.dd){VFX2.flash=.7;VFX2.dd=1}if(!pl.dead)VFX2.dd=0;
  VFX2.flash=Math.max(0,VFX2.flash-dt);const hf=$('hurtfx');if(hf)hf.style.opacity=Math.min(1,VFX2.flash*2).toFixed(2);
  // météo selon le jeu
  const w=WORLD.weather||WEATHER[GAME_ID]||((WORLD.clock??12)<5.5||(WORLD.clock??12)>20.5?'lucioles':null);const c=camEye||pl.pos;
  if(w==='neige')for(let k=0;k<3;k++)if(R(14))emit({pos:V.add(c,[rnd(-18,18),rnd(6,12),rnd(-18,18)]),vel:[rnd(-.6,.6),-rnd(1.2,2.2),rnd(-.6,.6)],life:6,size:.09,size1:.09,col:[2.4,2.5,2.7],alpha:.9,shape:2,drag:.1});
  if(w==='braise')for(let k=0;k<2;k++)if(R(10))emit({pos:V.add(pl.pos,[rnd(-12,12),rnd(-2,2),rnd(-12,12)]),vel:[rnd(-.4,.4),rnd(1,2.5),rnd(-.4,.4)],life:rnd(2,3.5),size:.07,size1:0,col:[5,1.6,.3],add:1,shape:2});
  if(w==='brume'&&R(3))emit({pos:V.add(pl.pos,[rnd(-16,16),rnd(.2,1.2),rnd(-16,16)]),vel:[rnd(-.3,.3),.05,rnd(-.3,.3)],life:rnd(5,8),size:1.5,size1:3.5,col:[.5,.55,.6],alpha:.09,drag:.2});
  if(w==='lucioles'&&R(4))emit({pos:V.add(pl.pos,[rnd(-14,14),rnd(.5,4),rnd(-14,14)]),vel:[rnd(-.3,.3),rnd(-.1,.3),rnd(-.3,.3)],life:rnd(3,5),size:.08,size1:.06,col:[2.2,2.6,.8],add:1,shape:2});
  if(w==='poussiere'&&pl.pos[1]<-3&&R(6))emit({pos:V.add(pl.pos,[rnd(-6,6),rnd(0,4),rnd(-6,6)]),vel:[rnd(-.1,.1),rnd(-.1,.05),rnd(-.1,.1)],life:4,size:.05,size1:.05,col:[1.2,1.1,.9],alpha:.5,shape:2});
  if(w==='paillettes'&&R(5))emit({pos:V.add(pl.pos,[rnd(-10,10),rnd(.5,3),rnd(-10,10)]),vel:[0,rnd(.2,.5),0],life:2,size:.07,size1:0,col:pick([[3,2.4,.5],[2.6,1,2.4],[.8,2,3]]),add:1,shape:2});
  if(w==='feuilles'&&R(3))emit({pos:V.add(pl.pos,[rnd(-14,14),rnd(5,8),rnd(-14,14)]),vel:[rnd(.4,1),-rnd(.5,.9),rnd(-.3,.3)],life:6,size:.1,size1:.1,col:pick([[.8,.5,.15],[.6,.7,.2],[.9,.3,.1]]),shape:0,drag:.2});
  if(w==='mouettes'&&R(1.2))emit({pos:V.add(pl.pos,[rnd(-20,20),.7,rnd(-20,20)]),vel:[0,.1,0],life:1.4,size:.2,size1:1.4,col:[1.5,1.7,1.8],alpha:.25,drag:.5})}
