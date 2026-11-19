"use strict";
/* ============================================================================
   SONS 2.0 (plus riches, en couches) + EFFETS D'IMPACT (anneaux, flashs de
   lumière, pluie de pièces, colonne de lumière au niveau supérieur)
   ============================================================================ */
(()=>{const T=(...a)=>tone(...a),N=(...a)=>noise(...a);
  Object.assign(SFX,{
    click(){T('sine',1400,.04,.05,{f2:900,rev:.02});T('triangle',700,.05,.03,{delay:.005,rev:.02})},
    error(){T('square',220,.12,.06,{f2:180,rev:.05});T('square',165,.18,.06,{delay:.1,f2:140,rev:.05})},
    pop(v=1){N(.06,.22*v,{type:'bandpass',f:1800,f2:600,q:2,rev:.08});T('sine',180,.09,.18*v,{f2:60,rev:.05});T('square',900,.03,.04*v,{f2:300})},
    hit(v=1){N(.08,.3*v,{type:'lowpass',f:1600,f2:300,q:1,rev:.1});T('sine',140,.12,.25*v,{f2:50});T('triangle',520,.05,.05*v,{f2:200})},
    hurt(){T('sawtooth',300,.18,.08,{f2:120,vib:[18,30],rev:.12});N(.12,.15,{type:'lowpass',f:900,f2:200});T('sine',90,.2,.2,{f2:45})},
    sword(){N(.16,.16,{type:'bandpass',f:5200,f2:900,q:3,rev:.15});T('sine',1600,.08,.03,{f2:600})},
    pickup(){[0,4,7,12].forEach((s,i)=>T('triangle',660*Math.pow(2,s/12),.12,.07,{delay:i*.045,rev:.25}));T('sine',1980,.25,.03,{delay:.18,rev:.4})},
    coin(){T('square',1320,.06,.05,{rev:.2});T('square',1760,.18,.05,{delay:.06,rev:.3})},
    kaching(){N(.05,.15,{type:'highpass',f:4000,rev:.1});[0,7,12,16].forEach((s,i)=>T('triangle',880*Math.pow(2,s/12),.18,.07,{delay:.03+i*.05,rev:.35}));T('sine',2640,.5,.03,{delay:.2,rev:.5})},
    buy(){[0,4,7].forEach((s,i)=>T('triangle',523*Math.pow(2,s/12),.14,.08,{delay:i*.06,rev:.25}));N(.2,.06,{type:'highpass',f:6000,delay:.12,rev:.3})},
    levelUp(){const sc=[0,4,7,12,16,19,24];sc.forEach((s,i)=>{T('triangle',392*Math.pow(2,s/12),.22,.08,{delay:i*.06,rev:.35});T('sine',784*Math.pow(2,s/12),.18,.03,{delay:i*.06+.01,rev:.4})});T('sawtooth',196,.9,.04,{delay:.1,f2:392,rev:.5})},
    quest(){[0,5,9,12].forEach((s,i)=>T('square',587*Math.pow(2,s/12),.16,.05,{delay:i*.09,rev:.3}));T('triangle',1174,.6,.05,{delay:.36,rev:.5})},
    checkpoint(){T('sine',880,.12,.09,{rev:.3});T('sine',1318,.3,.09,{delay:.09,rev:.4});N(.3,.04,{type:'highpass',f:7000,delay:.05,rev:.4})},
    win(){const m=[0,4,7,12,7,12,16];m.forEach((s,i)=>T('square',523*Math.pow(2,s/12),.16,.06,{delay:i*.11,rev:.3}));T('triangle',1046,.8,.07,{delay:.77,rev:.5})},
    enemyDie(){N(.3,.2,{type:'lowpass',f:2400,f2:200,rev:.2});T('square',300,.25,.06,{f2:60,rev:.2})},
    boom(){N(.8,.5,{type:'lowpass',f:900,f2:60,q:1,rev:.35});T('sine',70,.7,.5,{f2:28});T('sawtooth',140,.3,.08,{f2:40})},
    whoosh(){N(.35,.16,{type:'bandpass',f:400,f2:2600,q:1.5,rev:.2})},
    door(){T('sawtooth',90,.35,.05,{f2:70,vib:[6,10],rev:.25});N(.25,.12,{type:'lowpass',f:500,delay:.25,rev:.3})},
    glass(){for(let i=0;i<5;i++)T('sine',2000+Math.random()*3000,.25,.03,{delay:i*.03,rev:.4});N(.25,.15,{type:'highpass',f:3000})},
    potion(){for(let i=0;i<6;i++)T('sine',500+i*120,.1,.04,{delay:i*.05,rev:.3});T('triangle',1200,.4,.04,{delay:.3,rev:.5})},
    slam(){T('sine',60,.5,.5,{f2:30});N(.4,.35,{type:'lowpass',f:700,f2:80,rev:.3})},
    daily(){[0,4,7,11,14].forEach((s,i)=>T('triangle',698*Math.pow(2,s/12),.2,.06,{delay:i*.05,rev:.4}))}});
  // ---------- effets d'impact ----------
  window.VFXL=[];
  window.vfxFlash=(pos,col,range=10,dur=.25,bright=3)=>{if(!WORLD.lights)WORLD.lights=[];const L={pos:[...pos],color:col,range,bright,base:bright,fx:dur,fx0:dur};WORLD.lights.unshift(L);VFXL.push(L)};
  window.vfxRing=(pos,col=[3,2.6,1.6],n=18,sp=6)=>{for(let i=0;i<n;i++){const a=i/n*6.283;emit({pos:V.add(pos,[Math.cos(a)*.2,0,Math.sin(a)*.2]),vel:[Math.cos(a)*sp,rnd(.2,.8),Math.sin(a)*sp],life:.3,size:.18,size1:0,col,add:1,drag:2})}};
  window.vfxCoins=(pos,n=14)=>{for(let i=0;i<n;i++)emit({pos:V.add(pos,[0,.5,0]),vel:[rnd(-3,3),rnd(5,9),rnd(-3,3)],life:rnd(.8,1.2),size:.16,size1:.12,col:[3.2,2.4,.3],add:1,grav:16,shape:2})};
  window.vfxPillar=pos=>{for(let i=0;i<40;i++)emit({pos:V.add(pos,[rnd(-.6,.6),rnd(0,1),rnd(-.6,.6)]),vel:[0,rnd(4,9),0],life:rnd(.6,1.1),size:.12,size1:0,col:[1.6,2.6,3.4],add:1,shape:2});vfxFlash(V.add(pos,[0,2,0]),'#9ad7ff',12,.6,3)};
  const amb0=ambientVFX;ambientVFX=function(dt,t){amb0(dt,t);for(let i=VFXL.length-1;i>=0;i--){const L=VFXL[i];L.fx-=dt;L.bright=L.base*Math.max(0,L.fx/L.fx0);if(L.fx<=0){VFXL.splice(i,1);const j=WORLD.lights?WORLD.lights.indexOf(L):-1;if(j>=0)WORLD.lights.splice(j,1)}}};
  const dmg0=KIT.damage;KIT.damage=function(G,c,dm,kb,dir,onDie){const before=c.mob?.hp;const r=dmg0.call(this,G,c,dm,kb,dir,onDie);try{const p=V.add(c.pos,[0,1.3,0]);vfxRing(p,[3,1.4,.6],10,4);if(before!=null&&c.mob&&c.mob.hp<=0||!G.mobs.includes(c)){vfxFlash(p,'#ffb35a',8,.2,2.5);vfxRing(p,[3,2,.6],24,8)}}catch(e){}return r};
  const gb0=giveBlox;giveBlox=function(n,reason){gb0(n,reason);try{if(MODE==='game'&&pl&&n>0)vfxCoins(pl.pos,Math.min(30,6+n/4))}catch(e){}};
  const lv0=SFX.levelUp;SFX.levelUp=function(){lv0();try{if(MODE==='game'&&pl)vfxPillar(pl.pos)}catch(e){}};
  const hurt0=KIT.hurt;KIT.hurt=function(G,d){hurt0.call(this,G,d);try{if(pl&&d>=5)vfxRing(V.add(pl.pos,[0,1.4,0]),[3,.4,.4],8,3)}catch(e){}}})();
