"use strict";
/* ============================================================================
   NOUVEAUX JEUX (1/2) : boîte à outils commune + Nuit des Zombies,
   Grand Prix Turbo, Tour Infernale, Mine Profonde, Défense du Royaume
   ============================================================================ */
NPC_AV.zombie={skin:'#7fb069',haut:'carreaux',bas:'jean_noir',visage:'endormi',chapeau:null,cheveux:null,lunettes:null,dos:null,cou:null,epaule:null};
NPC_AV.zcourt={skin:'#9cc46a',haut:'tee_rouge',bas:'short',visage:'fache',chapeau:null,cheveux:null,lunettes:null,dos:null,cou:null,epaule:null};
NPC_AV.zbrute={skin:'#5d8a4a',haut:'hoodie_gris',bas:'cargo',visage:'demon',chapeau:null,cheveux:null,lunettes:null,dos:null,cou:null,epaule:null};
NPC_AV.pilote={skin:'#f1c27d',haut:'maillot',bas:'jogging',visage:'cool',chapeau:'casquette_rouge',cheveux:null,lunettes:null,dos:null,cou:null,epaule:null};
const KIT={
  hud(extra=''){return`<div class="ghud chp" id="kH" style="display:block"><div class="bar hp"><i id="kHb"></i><span id="kHt"></span></div></div>${extra}`},
  hpUpd(G){const b=$('kHb');if(!b)return;b.style.width=Math.max(0,G.hp/G.maxHp*100)+'%';$('kHt').textContent=`${Math.ceil(G.hp)} / ${G.maxHp}`},
  hurt(G,d){if(pl.dead||G.inv>0)return;G.hp-=d;G.inv=.45;SFX.hurt?.();shake=Math.max(shake,.25);floatText(V.add(pl.pos,[0,3,0]),'-'+Math.round(d),'#ff6b6b');if(G.hp<=0){G.hp=0;die(pl,false)}},
  mob(G,def,pos){const c=spawnNPC(def.name,def.av,pos,{still:true,quiet:true,col:def.boss?'#ffd23f':'#ff6b6b'});c.walk=def.speed;c.mob={...def,hp:def.hp,max:def.hp,cd:rnd(0,.6)};G.mobs.push(c);return c},
  kill(G,c){const i=G.mobs.indexOf(c);if(i>=0)G.mobs.splice(i,1);removeRemote(c)},
  clearMobs(G){for(const c of[...(G.mobs||[])])this.kill(G,c);G.mobs=[]},
  mobsStep(G,dt,onDie){for(const c of[...G.mobs]){const m=c.mob;m.cd-=dt;if(m.slow>0)m.slow-=dt;if(c.dead){continue}
      const d=V.sub(pl.pos,c.pos);d[1]=0;const L=V.len(d);c.walk=m.speed*(m.slow>0?.45:1);
      if(pl.dead){c.forceWish=[0,0,0];continue}c.forceWish=L>1.1?V.mul(d,1/L):[0,0,0];
      if(L<(m.reach||1.7)&&m.cd<=0&&Math.abs(pl.pos[1]-c.pos[1])<2.5){m.cd=m.rate||1;c.swing=.3;KIT.hurt(G,m.dmg)}}},
  damage(G,c,dm,kb,dir,onDie){const m=c.mob;if(!m||m.hp<=0)return;m.hp-=dm;floatText(V.add(c.pos,[0,3.1,0]),String(Math.round(dm)),'#ffffff');sparks(V.add(c.pos,[0,1.4,0]),[3,1,1],6,.6);SFX.hit?.();
    if(dir&&kb&&!m.boss){c.vel=V.add(c.vel,V.mul(dir,kb));c.vel[1]=3}if(m.hp<=0){sparks(V.add(c.pos,[0,1.2,0]),[2,3,1],18);SFX.enemyDie?.();this.kill(G,c);onDie&&onDie(c,m)}},
  swing(G,dmg,range,onDie){if(G.atkCd>0||pl.dead)return false;G.atkCd=.42;pl.swing=.38;SFX.sword?.();const f=[Math.sin(pl.yaw),0,Math.cos(pl.yaw)];
    for(let k=0;k<10;k++){const a=pl.yaw+lerp(-1.1,1.1,k/9);emit({pos:V.add(pl.pos,[Math.sin(a)*1.6,1.5,Math.cos(a)*1.6]),vel:[0,0,0],life:.18,size:.3,size1:0,col:[2.6,2.6,2.6],add:1})}
    for(const c of[...G.mobs]){const d=V.sub(c.pos,pl.pos);d[1]=0;const L=V.len(d);if(L>range)continue;if(L>.5&&V.dot(V.mul(d,1/L),f)<.2)continue;this.damage(G,c,dmg,6,V.norm(d),onDie)}return true},
  shoot(G,o){const f=[Math.sin(pl.yaw),0,Math.cos(pl.yaw)];const n=o.n||1;for(let i=0;i<n;i++){const a=pl.yaw+(n>1?rnd(-o.spread,o.spread):0);
      G.shots.push({pos:V.add(pl.pos,[f[0]*1.1,1.5,f[2]*1.1]),vel:[Math.sin(a)*o.speed,o.up||0,Math.cos(a)*o.speed],life:o.life||1.2,dmg:o.dmg,col:o.col||'#ffd23f',size:o.size||.18,grav:o.grav||0,pierce:o.pierce||0,fire:o.fire})}SFX[o.sfx||'pop']?.()},
  shotsStep(G,dt,onDie){for(let i=G.shots.length-1;i>=0;i--){const s=G.shots[i];s.life-=dt;s.vel[1]-=s.grav*dt;s.pos=V.add(s.pos,V.mul(s.vel,dt));if(s.fire&&Math.random()<.6)emit({pos:[...s.pos],vel:[rnd(-1,1),1,rnd(-1,1)],life:.4,size:.5,size1:.1,col:[3,1.2,.3],add:1});
      let hit=false;for(const c of[...G.mobs]){if(Math.abs(c.pos[0]-s.pos[0])<.9&&Math.abs(c.pos[2]-s.pos[2])<.9&&s.pos[1]>c.pos[1]&&s.pos[1]<c.pos[1]+H+.2){this.damage(G,c,s.dmg,3,V.norm([s.vel[0],0,s.vel[2]]),onDie);if(s.pierce--<=0){hit=true;break}}}
      if(hit||s.life<=0||s.pos[1]<0)G.shots.splice(i,1)}},
  drawShots(G,L){for(const s of G.shots)L.push({mesh:MESH.sphere,m:M.chain(M.T(...s.pos),M.S(s.size,s.size,s.size)),mode:3,color:s.col,shin:100,emis:HDR?2:.6})},
  house(x,z,w,d,h,col,door='s'){const t=.4;B(x,h/2,z-d/2,w,h,t,{mat:'brique',color:col});if(door==='s'){B(x-w/4-.75,h/2,z+d/2,w/2-1.5,h,t,{mat:'brique',color:col});B(x+w/4+.75,h/2,z+d/2,w/2-1.5,h,t,{mat:'brique',color:col})}else B(x,h/2,z+d/2,w,h,t,{mat:'brique',color:col});
    B(x-w/2,h/2,z,t,h,d,{mat:'brique',color:col});B(x+w/2,h/2,z,t,h,d,{mat:'brique',color:col});B(x,h+.25,z,w+1,.5,d+1,{mat:'beton',color:'#4a3f3a'})}};
function kitBase(G,sv,hp=100){G.sv=sv;G.mobs=[];G.shots=[];G.hp=G.maxHp=hp;G.inv=0;G.atkCd=0}
function kitTick(G,dt){G.inv=Math.max(0,G.inv-dt);G.atkCd=Math.max(0,G.atkCd-dt);KIT.hpUpd(G)}

/* ============================== 1. NUIT DES ZOMBIES ============================== */
const ZW={batte:{name:'Batte cloutée',icon:'🏏',price:0,melee:28,range:2.6},pistolet:{name:'Pistolet',icon:'🔫',price:0,dmg:22,cd:.32,speed:46},
  pompe:{name:'Fusil à pompe',icon:'💥',price:900,dmg:16,cd:.8,speed:40,n:7,spread:.22,life:.5},mitra:{name:'Mitraillette',icon:'🔥',price:2200,dmg:14,cd:.09,speed:52},
  arbalete:{name:'Arbalète perçante',icon:'🏹',price:3500,dmg:70,cd:.7,speed:60,pierce:4},flamme:{name:'Lance-flammes',icon:'🌋',price:6000,dmg:9,cd:.05,speed:18,life:.5,spread:.15,n:2,fire:1}};
GAMES.zombies={name:'Nuit des Zombies',genre:'Survie',icon:'🧟',colors:['#1d2b1a','#7fb069'],maxPlayers:8,music:'boss',
  desc:"Survie en équipe : tiens 30 vagues de zombies de plus en plus nombreux (coureurs, brutes, boss toutes les 5 vagues). Gagne des points, achète des armes à l'armurerie et des améliorations entre les vagues. Q change d'arme.",
  badges:['Vague 10 : +40 Blox','Vague 30 : +300 Blox'],
  build(sv){const G=this;kitBase(G,sv,100);G.wave=0;G.left=0;G.toSpawn=0;G.break=12;G.pts=0;G.weap=['batte','pistolet'];G.wi=1;G.dmgM=1;G.spawnT=0;sv.best=sv.best||0;
    setClock(22);WORLD.fog=.012;WORLD.fogCol=[.05,.07,.08];WORLD.lights=[];
    B(0,-.5,0,140,1,140,{mat:'beton',color:'#3a3d42'});for(let i=-60;i<=60;i+=20)B(i,.02,0,4,.04,140,{mat:'lisse',color:'#55585e',nocol:1});
    for(const[x,z,c]of[[-36,-36,'#7a4a3a'],[36,-36,'#4a5a7a'],[-36,36,'#6a6a4a'],[36,36,'#5a3a5a'],[0,-48,'#3a5a4a'],[-50,0,'#5a4a3a'],[50,0,'#4a4a5a']])KIT.house(x,z,16,12,6,c);
    for(let i=0;i<40;i++){const a=i/40*Math.PI*2;B(Math.cos(a)*66,2,Math.sin(a)*66,8,4,2,{mat:'metal',color:'#30343d'})}
    for(const[x,z]of[[-14,-14],[14,-14],[-14,14],[14,14],[0,24],[0,-24],[24,0],[-24,0]]){B(x,2.5,z,.3,5,.3,{mat:'metal'});const L={pos:[x,5.2,z],color:'#ffd9a0',range:16,bright:2.2,base:2.2,flicker:.15};WORLD.lights.push(L);B(x,5.2,z,.8,.4,.8,{mat:'neon',color:'#ffd9a0',nocol:1})}
    for(const[x,z,w,d]of[[-6,6,6,1],[6,-6,1,6],[10,10,4,1],[-10,-10,1,4],[0,14,8,1]])B(x,.6,z,w,1.2,d,{mat:'bois',color:'#6d4a2a'});
    B(0,.1,0,8,.2,8,{mat:'lisse',color:'#2f6a3a'});SPAWN={pos:[0,.2,0],size:[6,.2,6]};
    G.armory=B(-8,1.2,-2,2,2.4,2,{mat:'metal',color:'#c0202a'});SIGN(-8,3.6,-2,'🔫 ARMURERIE',false,{size:40});
    WORLD.prompts=[{who:{pos:[-8,0,-2]},label:'Armurerie',act:()=>G.shop()}];
    G.spawns=[[-60,0,-60],[60,0,-60],[-60,0,60],[60,0,60],[0,0,-62],[0,0,62],[-62,0,0],[62,0,0]]},
  spawn(){return[rnd(-2,2),.3,rnd(-2,2)]},
  hud(el){el.innerHTML=KIT.hud(`<div class="ghud center"><div class="gtitle" id="zT">Préparez-vous…</div><div class="gsub" id="zS"></div></div><div class="ghud quest" id="zW"></div>`)},
  mpState(){return{zw:this.wave}},
  onRemote(c,pr){c.lb=pr.zw?'Vague '+pr.zw:''},
  lbLabel:'Vague',lbValue(c){return c.isPlayer?this.wave:(c.lb||'')},
  onRespawn(c){if(c===pl){this.hp=this.maxHp;this.pts=Math.floor(this.pts*.85)}},
  weapon(){return ZW[this.weap[this.wi]]},
  input(k){const G=this;if(k==='potion'){G.wi=(G.wi+1)%G.weap.length;toast(G.weapon().icon+' '+G.weapon().name);SFX.click();return}
    const w=G.weapon(),onDie=(c,m)=>G.onKill(m);if(w.melee){KIT.swing(G,w.melee*G.dmgM,w.range,onDie);return}if(G.atkCd>0||pl.dead)return;G.atkCd=w.cd;KIT.shoot(G,{...w,dmg:w.dmg*G.dmgM,col:w.fire?'#ff8a3d':'#ffd23f',sfx:'pop'})},
  onKill(m){const G=this,p=m.boss?250:m.pts;G.pts+=p;G.left--;floatText(V.add(pl.pos,[0,3.4,0]),'+'+p+' pts','#7dffb0')},
  shop(){const G=this,b=[];for(const id in ZW){const w=ZW[id];if(G.weap.includes(id))continue;b.push([`${w.icon} ${w.name} · ${w.price} pts`,()=>{if(G.pts<w.price){SFX.error();toast('Pas assez de points');return}G.pts-=w.price;G.weap.push(id);G.wi=G.weap.length-1;SFX.buy();toast(w.icon+' '+w.name+' équipé (Q pour changer)')}])}
    const up=Math.round(400*Math.pow(1.6,(G.dmgM-1)/.25));b.push([`❤️ Soin complet · 150 pts`,()=>{if(G.pts<150)return SFX.error();G.pts-=150;G.hp=G.maxHp;SFX.potion?.()}],[`💪 +25 % dégâts · ${up} pts`,()=>{if(G.pts<up)return SFX.error();G.pts-=up;G.dmgM+=.25;SFX.buy()}],[`🛡️ +25 PV max · ${G.maxHp*4} pts`,()=>{if(G.pts<G.maxHp*4)return SFX.error();G.pts-=G.maxHp*4;G.maxHp+=25;G.hp+=25;SFX.buy()}],['Fermer',null]);
    openDialog('🔫 Armurerie',`Tu as ${G.pts} points. Les armes et bonus durent toute la partie.`,b.slice(0,8))},
  nextWave(){const G=this;G.wave++;const n=G.wave;G.toSpawn=Math.round(7+n*3.2+(n>15?n*1.5:0));G.left=G.toSpawn+(n%5===0?1:0);G.boss=n%5===0;G.spawnT=0;scMessage(G.boss?`☠️ VAGUE ${n} : BOSS !`:`🧟 Vague ${n}`,3);SFX.slam?.();
    if(n===10){giveBlox(40,'Vague 10 !')}if(n>G.sv.best){G.sv.best=n;markDirty()}
    if(G.boss){const p=pick(G.spawns);KIT.mob(G,{name:`☠️ Mégazombie ${n/5}`,av:'zbrute',hp:900+n*130,speed:4.6,dmg:30,rate:1.2,reach:2.2,pts:250,boss:1},[p[0],.3,p[2]])}},
  update(dt,t){const G=this;kitTick(G,dt);worldFx(dt,t,false);const onDie=(c,m)=>G.onKill(m);KIT.mobsStep(G,dt);KIT.shotsStep(G,dt,onDie);
    if(G.wave>=30&&G.left<=0&&!G.won){G.won=true;giveBlox(300,'30 vagues survécues !');unlockBadge('zombie');showResult('🏆 Survivant !',`Tu as tenu les 30 vagues ! ${G.pts} points.`,[['Continuer',null],['Rejouer',()=>restartGame()]])}
    if(G.toSpawn>0){G.spawnT-=dt;if(G.spawnT<=0&&G.mobs.length<26){G.spawnT=Math.max(.35,1.6-G.wave*.04);G.toSpawn--;const n=G.wave,p=pick(G.spawns),r=Math.random();
        const def=r<.2&&n>2?{name:'Coureur',av:'zcourt',hp:30+n*7,speed:7.5+Math.min(2,n*.06),dmg:8,rate:.7,pts:20}:r<.32&&n>4?{name:'Brute',av:'zbrute',hp:150+n*25,speed:3.6,dmg:22,rate:1.3,reach:2,pts:45}:{name:'Zombie',av:'zombie',hp:55+n*16,speed:4.4+Math.min(2.8,n*.09),dmg:14,rate:1,pts:12};
        KIT.mob(G,def,[p[0]+rnd(-4,4),.3,p[2]+rnd(-4,4)])}}
    else if(G.left<=0&&G.mobs.length===0&&G.wave<30){if(G.break<=0){G.break=G.wave?18:10;if(G.wave){G.pts+=50+G.wave*10;sys(`✅ Vague ${G.wave} terminée ! Pause de 18 s : passe à l'armurerie.`);SFX.quest()}}G.break-=dt;if(G.break<=0)G.nextWave()}
    $('zT').textContent=G.wave?`Vague ${G.wave} / 30`:'Préparez-vous…';$('zS').textContent=G.left>0||G.mobs.length?`🧟 ${Math.max(G.left,G.mobs.length)} zombies restants`:`Prochaine vague dans ${Math.ceil(Math.max(0,G.break))} s`;
    $('zW').textContent=`${G.weapon().icon} ${G.weapon().name} (Q) · ⭐ ${G.pts} pts · record vague ${G.sv.best}`},
  extraDraw(L){KIT.drawShots(this,L)},
  exit(){KIT.clearMobs(this);WORLD.fog=0;WORLD.lights=[]}};

/* ============================== 2. GRAND PRIX TURBO ============================== */
const GP_TRACKS=[
  {name:'Circuit Prairie',wp:[[0,0],[80,0],[80,-60],[30,-60],[30,-110],[-40,-110],[-40,-40],[0,-40]].map(([x,z])=>[x,z+30]),sky:14,ground:'herbe'},
  {name:'Désert Canyon',wp:[[0,0],[100,0],[100,-50],[60,-50],[60,-90],[120,-90],[120,-140],[-30,-140],[-30,-60],[0,-60]].map(([x,z])=>[x-40,z+60]),sky:17,ground:'sable'},
  {name:'Néon City (nuit)',wp:[[0,0],[60,0],[60,-30],[110,-30],[110,-120],[50,-120],[50,-80],[-20,-80],[-20,-150],[-70,-150],[-70,-20],[0,-20]].map(([x,z])=>[x,z+70]),sky:23,ground:'beton'}];
GAMES.course={name:'Grand Prix Turbo',genre:'Course',icon:'🏎️',colors:['#e5484d','#ffd23f'],maxPlayers:12,music:'obby',
  desc:"Course de bolides contre 7 pilotes : 3 circuits, 3 tours chacun, pads turbo et raccourcis. Termine le championnat (les 3 courses) pour gagner la coupe ! Reste sur la route : l'herbe ralentit.",
  badges:['Victoire : +30 Blox','Championnat : +120 Blox'],
  build(sv){const G=this;G.sv=sv;sv.cup=sv.cup||0;G.ti=sv.next||0;const T=GP_TRACKS[G.ti];G.T=T;setClock(T.sky);WORLD.lights=[];G.state='count';G.cd=4;G.laps=3;G.time=0;G.racers=[];G.boostT=0;
    B(0,-.5,-40,400,1,400,{mat:T.ground});G.road=new Set();const W=14,wp=T.wp,N=wp.length;
    for(let i=0;i<N;i++){const a=wp[i],b=wp[(i+1)%N];const cx=(a[0]+b[0])/2,cz=(a[1]+b[1])/2,sx=Math.abs(a[0]-b[0])+W,sz=Math.abs(a[1]-b[1])+W;G.road.add(B(cx,.06,cz,sx,.12,sz,{mat:'beton',color:G.ti===2?'#1f2230':'#3a3d42'}));
      const len=Math.hypot(b[0]-a[0],b[1]-a[1]),dir=[(b[0]-a[0])/len,(b[1]-a[1])/len];for(let s=14;s<len-10;s+=26){const p=[a[0]+dir[0]*s,a[1]+dir[1]*s];G.road.add(B(p[0],.14,p[1],4,.06,4,{mat:'neon',color:'#22e3ff',boost:1}))}
      if(G.ti===2)for(let s=0;s<len;s+=20){const p=[a[0]+dir[0]*s+dir[1]*(W/2+3),a[1]+dir[1]*s-dir[0]*(W/2+3)];B(p[0],4,p[1],2,8+rh(i*31+s)*16,2,{mat:'neon',color:pick(['#ff4fa3','#22e3ff','#b46bff'])})}
      else for(let s=6;s<len;s+=18){const o=(W/2+5)*(s%36<18?1:-1),p=[a[0]+dir[0]*s+dir[1]*o,a[1]+dir[1]*s-dir[0]*o];if(G.ti===1)B(p[0],1.5,p[1],1.2,3,1.2,{mat:'lisse',color:'#2f8a3a'});else TREE(p[0],p[1],3,3)}}
    B(wp[0][0],.16,wp[0][1],4,.08,W,{mat:'lisse',color:'#ffffff',nocol:1});SIGN(wp[0][0],7,wp[0][1]-W/2-1,'DÉPART · '+T.name,true,{size:40});B(wp[0][0],7,wp[0][1]+W/2+1,.6,14,.6,{mat:'metal'});
    G.start=[wp[0][0]-6,.3,wp[0][1]];
    const names=['Turbo Tom','Lili Drift','Max Nitro','Zoé Flash','Rocket Raoul','Nina Vroum','Kiko Kart'];names.forEach((n,i)=>{const c=spawnNPC(n,'pilote',[wp[0][0]-10-(i>>1)*5,.3,wp[0][1]+(i%2?4:-4)],{still:true,quiet:true,col:'#ffd23f'});c.av={...NPC_AV.pilote,haut:pick(['maillot','tee_bleu','tee_rouge','hoodie_violet']),chapeau:pick(['casquette_rouge','casquette_bleue','casquette_envers'])};c.racer={wp:1,lap:0,skill:.93+i*.019+G.ti*.015,done:0};G.racers.push(c)});
    G.me={wp:1,lap:0,done:0};WORLD.voidY=-20},
  spawn(){return this.start},
  hud(el){el.innerHTML=`<div class="ghud center"><div class="gtitle" id="gpT"></div><div class="gsub" id="gpS"></div></div><div class="ghud quest" id="gpQ"></div>`},
  prog(r,pos){const wp=this.T.wp,N=wp.length,a=wp[(r.wp-1+N)%N],b=wp[r.wp%N];const L=Math.hypot(b[0]-a[0],b[1]-a[1]);const d=Math.hypot(pos[0]-b[0],pos[2]-b[1]);return r.lap*N+r.wp+(1-Math.min(1,d/L))},
  advance(r,pos,isMe){const wp=this.T.wp,N=wp.length,b=wp[r.wp%N];if(Math.hypot(pos[0]-b[0],pos[2]-b[1])<11){r.wp++;if(r.wp%N===1&&r.wp>1){r.lap++;if(isMe&&r.lap<this.laps){scMessage(`Tour ${r.lap+1} / ${this.laps}`,1.5);SFX.checkpoint()}}if(r.lap>=this.laps&&!r.done)r.done=this.time}},
  update(dt,t){const G=this;
    if(G.state==='count'){G.cd-=dt;pl.pos[0]=Math.min(pl.pos[0],G.start[0]+1);pl.vel=[0,pl.vel[1],0];for(const c of G.racers)c.forceWish=[0,0,0];const n=Math.ceil(G.cd-1);if(n!==G.lastN){G.lastN=n;if(n>0){scMessage(String(n),.8);SFX.click()}else{scMessage('GO !',1);SFX.levelUp();G.state='race'}}}
    else if(G.state==='race'){G.time+=dt;
      const onRoad=pl.ground&&G.road.has(pl.ground);if(pl.ground?.boost){G.boostT=1.4;if(!G.bS){G.bS=1;SFX.whoosh?.()}}else G.bS=0;G.boostT-=dt;pl.walk=(onRoad?19:11)*(G.boostT>0?1.55:1)*(hasPass('course','vit')?1.06:1);pl.emote=null;
      if(G.boostT>0&&Math.random()<.6)emit({pos:V.add(pl.pos,[rnd(-.4,.4),.4,rnd(-.4,.4)]),vel:[rnd(-1,1),1,rnd(-1,1)],life:.4,size:.4,size1:0,col:[.5,2,4],add:1});
      G.advance(G.me,pl.pos,true);
      for(const c of G.racers){const r=c.racer,wp=G.T.wp,b=wp[r.wp%wp.length];const d=[b[0]-c.pos[0],0,b[1]-c.pos[2]];c.forceWish=V.norm(d);c.walk=(c.ground?.boost?27:19*r.skill)*(r.done?.4:1);G.advance(r,c.pos,false)}
      if(G.me.done&&!G.fin){G.fin=1;const place=1+G.racers.filter(c=>c.racer.done&&c.racer.done<G.me.done).length;G.finish(place)}}
    const all=[{n:'Toi',p:G.me.done?1e9-G.me.done:G.prog(G.me,pl.pos)},...G.racers.map(c=>({n:c.name,p:c.racer.done?1e9-c.racer.done:G.prog(c.racer,c.pos)}))].sort((a,b)=>b.p-a.p);
    G.place=all.findIndex(x=>x.n==='Toi')+1;$('gpT').textContent=G.state==='count'?G.T.name:`${G.place}${G.place===1?'er':'e'} / 8 · Tour ${Math.min(G.laps,G.me.lap+1)}/${G.laps}`;
    $('gpS').textContent=`⏱ ${fmtT(G.time)}${G.boostT>0?' · 🔥 TURBO':''}${G.sv.best?.[G.ti]?' · record '+fmtT(G.sv.best[G.ti]):''}`;$('gpQ').textContent=`🏆 Championnat : course ${G.ti+1}/3 · coupes gagnées : ${G.sv.cup}`},
  finish(place){const G=this,sv=G.sv;sv.best=sv.best||[];if(!sv.best[G.ti]||G.time<sv.best[G.ti])sv.best[G.ti]=G.time;sv.pts=(sv.pts||0)+[10,8,6,5,4,3,2,1][place-1];const bl=[30,20,12,8,6,5,4,3][place-1];giveBlox(bl,`${place}e place`);
    let msg=`${place}${place===1?'er':'e'} en ${fmtT(G.time)} · +${bl} Blox`;if(G.ti===2){const pts=sv.pts;sv.pts=0;sv.next=0;if(pts>=24){sv.cup++;giveBlox(120,'Coupe du championnat !');unlockBadge('pilote');msg+=` · 🏆 COUPE GAGNÉE (${pts} pts) !`}else msg+=` · Championnat : ${pts} pts (24 pour la coupe)`}else sv.next=G.ti+1;markDirty();
    place===1?confetti(V.add(pl.pos,[0,2,0])):0;SFX.win?.();showResult(place===1?'🏁 Victoire !':'🏁 Arrivée',msg,[[G.ti<2?'Course suivante':'Nouveau championnat',()=>restartGame()],['Rester',null]])},
  extraDraw(L){const kart=(c,col)=>{if(c.dead)return;const m=M.chain(M.T(c.pos[0],c.pos[1]+.35,c.pos[2]),M.RY(c.yaw));L.push({mesh:MESH.rbox,m:M.mul(m,M.S(1.5,.5,2.6)),mode:3,color:col,shin:160},{mesh:MESH.cyl,m:M.mul(m,M.chain(M.T(.8,-.1,.9),M.RZ(Math.PI/2),M.S(.6,.3,.6))),mode:3,color:'#15161b'},{mesh:MESH.cyl,m:M.mul(m,M.chain(M.T(-.8,-.1,.9),M.RZ(Math.PI/2),M.S(.6,.3,.6))),mode:3,color:'#15161b'},{mesh:MESH.cyl,m:M.mul(m,M.chain(M.T(.8,-.1,-.9),M.RZ(Math.PI/2),M.S(.6,.3,.6))),mode:3,color:'#15161b'},{mesh:MESH.cyl,m:M.mul(m,M.chain(M.T(-.8,-.1,-.9),M.RZ(Math.PI/2),M.S(.6,.3,.6))),mode:3,color:'#15161b'})};
    if(pl)kart(pl,'#3d7eff');this.racers.forEach((c,i)=>kart(c,['#e5484d','#2fbf71','#ffd23f','#ff8a3d','#b46bff','#ff4fa3','#39c5bb'][i]))},
  exit(){if(pl)pl.walk=0;WORLD.lights=[]}};

/* ============================== 3. TOUR INFERNALE ============================== */
GAMES.tour={name:'Tour Infernale',genre:'Obby',icon:'🗼',colors:['#3a0d0d','#ff6a1a'],maxPlayers:16,music:'boss',
  desc:"Grimpe une tour de 40 étages générés (lave, lames tournantes, plateformes mobiles, trampolines, tapis, sols fragiles). Un checkpoint tous les 5 étages. Mode difficile : la lave monte !",
  badges:['Sommet : +150 Blox','Chaque palier : +10 Blox'],
  build(sv){const G=this;G.sv=sv;sv.seed=sv.seed||1+Math.floor(Math.random()*1e5);G.floor=0;G.kill=[];G.fakes=[];G.cps=[];G.time=0;const R=i=>rh(i*7.13+sv.seed);setClock(19);
    B(0,-.5,0,80,1,80,{mat:'basalte'});const FH=7,S=26,hole=f=>[f%2?8:-8,f%4<2?8:-8];
    const ring=(y,h,hx,hz,o)=>{const r=1.7,a=-S/2+.25,b=S/2-.25;const box=(x0,x1,z0,z1)=>{if(x1-x0>.05&&z1-z0>.05)B((x0+x1)/2,y,(z0+z1)/2,x1-x0,h,z1-z0,{...o})};box(a,hx-r,a,b);box(hx+r,b,a,b);box(hx-r,hx+r,a,hz-r);box(hx-r,hx+r,hz+r,b)};
    for(let f=0;f<40;f++){const y=f*FH,c=hsl(f*9,55,42),E=hole(f),A=f?hole(f-1):[0,4],ty=f===0?0:Math.floor(R(f)*7);
      if(f===0)B(0,y+.25,0,S,.5,S,{mat:'pierre',color:'#3a3436'});else ring(y+.25,.5,A[0],A[1],{mat:'pierre',color:'#3a3436'});
      for(const[x,z,sx,sz]of[[0,-S/2,S,.5],[0,S/2,S,.5],[-S/2,0,.5,S],[S/2,0,.5,S]])B(x,y+FH/2,z,sx,FH,sz,{mat:'brique',color:c,alpha:.35});
      const lava=ty!==1&&f>0;if(lava)ring(y+.55,.1,A[0],A[1],{kind:'lava'});
      if(f>0)B(A[0],y+.75,A[1]-3.4,3.4,.5,3,{color:'#2fbf71',mat:'lisse'});
      const M=[E[0],A[1]],pts=[];for(const[P,Q]of[[A,M],[M,E]]){const L=Math.hypot(Q[0]-P[0],Q[1]-P[1]);for(let d=0;d<L;d+=3.6)pts.push([P[0]+(Q[0]-P[0])*d/(L||1),P[1]+(Q[1]-P[1])*d/(L||1)])}
      const st=pts.filter(p=>Math.hypot(p[0]-A[0],p[1]-A[1]+3.4)>2.6&&Math.hypot(p[0]-E[0],p[1]-E[1])>2.6);
      st.forEach((p,i)=>{const o={color:'#4cc9f0',mat:'lisse'};if(ty===2&&i%2)o.move={axis:Math.abs(p[0]-E[0])<.1?[1,0,0]:[0,0,1],amp:1.6,speed:1+f*.02};if(ty===3&&i%2){o.kind='bounce';delete o.mat}if(ty===4)Object.assign(o,{kind:'conv',dir:[0,0,i%2?1:-1],speed:3+f*.05,color:'#30343d'});if(ty===5){o.mat='verre';o.color='#d8f3ff'}if(ty===6)o.color='#b46bff';
        const b=B(p[0],y+1+(ty===6?(i%3)*.5:0),p[1],2.4,.4,2.4,o);if(ty===5&&R(f*13+i)<.68)G.fakes.push(b)});
      if(ty===1){G.kill.push({c:[0,y+1.4,0],len:11,speed:1.1+f*.03,ang:R(f+1)*6});if(f>12)G.kill.push({c:[0,y+1.4,0],len:11,speed:1.1+f*.03,ang:R(f+1)*6+Math.PI/2})}
      if(ty===0&&f>8)G.kill.push({c:[0,y+1.6,0],len:7,speed:-1.3-f*.02,ang:0});
      B(E[0],y+FH/2+.6,E[1]-1.6,2,FH+.4,.3,{mat:'bois',mode:4,climb:'wood'});B(E[0],y+1,E[1],3,.5,3,{color:'#2fbf71',mat:'lisse'});
      if(f%5===0){B(E[0],y+1.3,E[1],3,.1,3,{mat:'neon',color:'#2fbf71',nocol:1});G.cps.push({f,pos:[E[0],y+1.4,E[1]]});SIGN(0,y+4.6,-S/2+.6,`ÉTAGE ${f+1}`,false,{size:46})}}
    G.top=40*FH;ring(G.top+.25,.5,hole(39)[0],hole(39)[1],{mat:'or'});G.goal={pos:[0,G.top+2,0],size:[S,4,S]};SIGN(0,G.top+3,0,'🏆 SOMMET !',true,{size:48});
    G.lava=-6;G.hard=!!sv.hard;WORLD.voidY=-30;G.cp=sv.cp||0},
  spawn(){const c=this.cps.find(x=>x.f===this.cp)||this.cps[0];return c?[c.pos[0],c.pos[1]+.2,c.pos[2]]:[0,1,0]},
  hud(el){el.innerHTML=`<div class="ghud center"><div class="gtitle" id="toT"></div><div class="gsub" id="toS"></div></div>`},
  mpState(){return{tf:this.floor}},onRemote(c,pr){c.lb=pr.tf!=null?'Ét. '+(pr.tf+1):''},lbLabel:'Étage',lbValue(c){return c.isPlayer?'Ét. '+(this.floor+1):(c.lb||'')},
  input(k){if(k==='potion'){this.sv.hard=!this.sv.hard;toast(this.sv.hard?'🔥 Mode difficile : la lave monte !':'Mode normal');markDirty();restartGame()}},
  update(dt,t){const G=this;G.time+=dt;G.floor=Math.max(0,Math.min(39,Math.floor((pl.pos[1]+.5)/7)));
    for(const k of G.kill){k.ang+=k.speed*dt;const d=[Math.cos(k.ang),0,Math.sin(k.ang)],rel=V.sub(pl.pos,k.c);rel[1]=0;const along=clamp(V.dot(rel,d),-k.len,k.len),perp=V.len(V.sub(rel,V.mul(d,along)));if(!pl.dead&&perp<.55&&pl.pos[1]<k.c[1]+.4&&pl.pos[1]+H>k.c[1]-.4)die(pl,false)}
    for(const p of G.fakes){if(!p.off&&p.fT==null&&pl.ground===p){p.fT=.5;p.color='#ff8a8a'}if(p.fT!=null&&!p.off&&(p.fT-=dt)<=0){p.off=true;p.alpha=.12;p.nocol=true;refreshSolids();SFX.glass?.();p.reT=3}if(p.off&&(p.reT-=dt)<0){p.off=false;p.fT=null;p.alpha=1;p.nocol=false;p.color='#d8f3ff';refreshSolids()}}
    for(const c of G.cps)if(c.f>G.cp&&Math.abs(pl.pos[1]-c.pos[1])<2&&Math.hypot(pl.pos[0]-c.pos[0],pl.pos[2]-c.pos[2])<2.5){G.cp=c.f;G.sv.cp=c.f;SFX.checkpoint();toast(`Checkpoint étage ${c.f+1} !`);giveBlox(10,'Palier');markDirty()}
    if(G.sv.hard&&!pl.dead){G.lava+=dt*(.55+G.floor*.012);if(pl.pos[1]<G.lava){die(pl,true);G.lava=Math.max(-6,G.cp*7-6)}}
    if(!G.won&&inBox(V.add(pl.pos,[0,1,0]),G.goal)){G.won=true;G.sv.cp=0;const best=G.sv.best;if(!best||G.time<best)G.sv.best=G.time;G.sv.wins=(G.sv.wins||0)+1;G.sv.seed=0;markDirty();giveBlox(150,'Sommet de la tour !');unlockBadge('tour');confetti(V.add(pl.pos,[0,2,0]));
      showResult('🗼 Sommet !',`Temps : ${fmtT(G.time)}. Une nouvelle tour sera générée la prochaine fois !`,[['Nouvelle tour',()=>restartGame()],['Rester',null]])}
    $('toT').textContent=`Étage ${G.floor+1} / 40`;$('toS').textContent=`⏱ ${fmtT(G.time)} · checkpoint ét. ${G.cp+1}${G.sv.hard?' · 🔥 lave à '+Math.max(0,Math.floor(G.lava/7)+1):''} · Q : mode ${G.sv.hard?'normal':'difficile'}`},
  extraDraw(L){for(const k of this.kill)L.push({mesh:MESH.rbox,m:M.chain(M.T(...k.c),M.RY(-k.ang),M.S(k.len*2,.35,.35)),mode:3,color:'#ff3030',emis:HDR?2:.6,shin:60});
    if(this.sv.hard)L.push({mesh:MESH.box,m:M.chain(M.T(0,this.lava-20,0),M.S(26,40,26)),mode:3,color:'#ff5a1a',emis:HDR?2.4:.8})}};

/* ============================== 4. MINE PROFONDE ============================== */
const MN_ORES=[{n:'Pierre',c:'#7d7f84',v:1,hp:1,d:0},{n:'Charbon',c:'#2b2d33',v:4,hp:2,d:0},{n:'Cuivre',c:'#c87533',v:10,hp:3,d:4},{n:'Fer',c:'#d8c0a8',v:25,hp:4,d:10},{n:'Or',c:'#ffd23f',v:70,hp:6,d:18,g:1},
  {n:'Rubis',c:'#e5484d',v:180,hp:9,d:28,g:1},{n:'Saphir',c:'#3d7eff',v:400,hp:13,d:40,g:1},{n:'Émeraude',c:'#2fbf71',v:900,hp:18,d:55,g:1},{n:'Diamant',c:'#a8f0ff',v:2200,hp:26,d:75,g:1},{n:'Améthyste du Néant',c:'#b46bff',v:6000,hp:40,d:100,g:1},{n:'Cœur de magma',c:'#ff6a1a',v:18000,hp:60,d:130,g:1}];
const MN_PICK=[['Pioche en bois',1,0],['Pioche en pierre',2,150],['Pioche en fer',4,1200],['Pioche en or',7,8000],['Pioche en diamant',12,45000],['Foreuse',20,2.5e5],['Foreuse laser',35,1.5e6],['Marteau cosmique',60,8e6]];
const MN_BAG=[[20,0],[50,300],[120,3000],[300,25000],[800,2e5],[2000,1.5e6],[6000,1e7]];
GAMES.mine={name:'Mine Profonde',genre:'Simulateur',icon:'⛏️',colors:['#2b2d33','#ffd23f'],maxPlayers:12,music:'rpg',
  desc:"Creuse toujours plus profond : 11 minerais, 8 pioches, 7 sacs. Vends au comptoir, améliore ton matériel et atteins le Cœur de magma à 130 m. Renaissance = ×2 sur les ventes.",
  badges:['Profondeur 50 : +40 Blox','Cœur de magma : +200 Blox'],
  build(sv){const G=this;G.sv=sv;sv.cash=sv.cash||0;sv.pick=sv.pick||0;sv.bag=sv.bag||0;sv.reb=sv.reb||0;sv.deep=sv.deep||0;G.inv=[];G.lay=new Map();G.layT=0;setClock(13);
    const N=10,S=2.4;G.N=N;G.S=S;B(0,-.5,31,90,1,38,{mat:'herbe'});B(0,-.5,-31,90,1,38,{mat:'herbe'});B(-28.5,-.5,0,33,1,24,{mat:'herbe'});B(28.5,-.5,0,33,1,24,{mat:'herbe'});
    for(const[x,z,sx,sz]of[[0,-12.2,24.4,.4],[0,12.2,24.4,.4],[-12.2,0,.4,24.4],[12.2,0,.4,24.4]])B(x,-200,z,sx,400,sz,{mat:'basalte',color:'#2a2624'});
    B(0,-401,0,24,2,24,{mat:'basalte'});for(let l=0;l<6;l++)G.layer(l);
    G.sell=B(-20,1,10,3,2,2,{mat:'bois',color:'#8d5a2b'});SIGN(-20,3.4,10,'💰 VENTE',false,{size:40});G.shopB=B(20,1,10,3,2,2,{mat:'metal',color:'#3d7eff'});SIGN(20,3.4,10,'⛏️ MATÉRIEL',false,{size:40});
    WORLD.prompts=[{who:{pos:[-20,0,10]},label:'Vendre',act:()=>G.sellAll()},{who:{pos:[20,0,10]},label:'Matériel',act:()=>G.shop()}];
    for(const[x,z]of[[-30,24],[30,24],[-30,-24],[30,-24],[0,34]])TREE(x,z,3,3);B(0,3,-14,.25,6,.25,{mat:'bois'});SIGN(0,6,-14,'MINE PROFONDE',false,{size:44});
    SPAWN={pos:[0,.2,18],size:[4,.2,4]};WORLD.voidY=-420;G.lightL={pos:[0,0,0],color:'#ffe2a8',range:14,bright:2,base:2};WORLD.lights=[G.lightL]},
  ore(l){const d=l*2.4/2.4;const pool=MN_ORES.filter(o=>o.d<=l);let r=Math.random();for(let i=pool.length-1;i>0;i--){const ch=Math.min(.22,.05+(l-pool[i].d)*.004)*(i>=4?.6:1);if(r<ch)return pool[i];r-=ch}return pool[Math.random()<.25&&l>0?1:0]},
  layer(l){const G=this,N=G.N,S=G.S;if(G.lay.has(l))return;const arr=[];G.lay.set(l,arr);for(let i=0;i<N;i++)for(let j=0;j<N;j++){const o=G.ore(l);const b=B(-(N-1)*S/2+i*S,-S/2-l*S,-(N-1)*S/2+j*S,S,S,S,{mat:o.g?'lisse':'pierre',color:o.c,shin:o.g?140:20});b.ore=o;b.hp=o.hp;b.lay=l;if(o.g)b.emis=.25;arr.push(b)}finalizeWorld()},
  unlayer(l){const arr=this.lay.get(l);if(!arr)return;const set=new Set(arr);for(let i=blocks.length-1;i>=0;i--)if(set.has(blocks[i]))blocks.splice(i,1);this.lay.delete(l);refreshSolids()},
  spawn(){return[0,.4,18]},
  hud(el){el.innerHTML=`<div class="ghud left"><div class="gtitle">💰 <span id="mnC"></span></div><div class="gsub" id="mnS"></div></div><div class="ghud quest" id="mnB"></div>`},
  lbLabel:'Profondeur',lbValue(c){return c.isPlayer?Math.max(0,Math.round(-pl.pos[1]))+' m':''},
  bagMax(){return MN_BAG[this.sv.bag][0]},
  input(k){if(k==='potion')return this.input2();if(k!=='attack')return;const G=this;if(G.atkCd>0||pl.dead)return;G.atkCd=.28;pl.swing=.3;const f=[Math.sin(pl.yaw),0,Math.cos(pl.yaw)];
    const tgt=[V.add(pl.pos,[f[0]*1.6,1,f[2]*1.6]),V.add(pl.pos,[f[0]*1.4,-.6,f[2]*1.4]),V.add(pl.pos,[0,-.8,0])];let b=null;
    for(const p of tgt){b=blocks.find(x=>x.ore&&!x.gone&&Math.abs(x.pos[0]-p[0])<=x.size[0]/2&&Math.abs(x.pos[1]-p[1])<=x.size[1]/2&&Math.abs(x.pos[2]-p[2])<=x.size[2]/2);if(b)break}
    if(b)G.hit(b)},
  click(ray){const G=this;let best=null,bt=12;for(const b of blocks){if(!b.ore||b.gone)continue;const t=rayAABB(ray.o,ray.d,{mn:V.sub(b.pos,V.mul(b.size,.5)),mx:V.add(b.pos,V.mul(b.size,.5))});if(t!=null&&t<bt){bt=t;best=b}}
    if(best&&V.len(V.sub(best.pos,pl.pos))<7&&G.atkCd<=0){G.atkCd=.28;pl.swing=.3;G.hit(best);return true}return false},
  hit(b){const G=this,pw=MN_PICK[G.sv.pick][1];b.hp-=pw;SFX.hit?.();sparks(b.pos,b.ore.g?[3,2.6,.8]:[1.4,1.4,1.4],6,.6);
    if(b.hp<=0){if(G.inv.length>=G.bagMax()){toast('🎒 Sac plein ! Remonte vendre (ou achète un plus grand sac).');SFX.error();b.hp=1;return}
      G.inv.push(b.ore);b.gone=true;const i=blocks.indexOf(b);if(i>=0)blocks.splice(i,1);refreshSolids();if(b.ore.g){floatText(b.pos,'+'+b.ore.n,b.ore.c);SFX.pickup()}
      for(let l=b.lay;l<=b.lay+4&&l<160;l++)G.layer(l)}},
  input2(){pl.pos=[0,.4,18];pl.vel=[0,0,0];toast('⬆️ Retour à la surface')},
  sellAll(){const G=this;if(!G.inv.length){toast('Ton sac est vide');return}const v=G.inv.reduce((s,o)=>s+o.v,0)*Math.pow(2,G.sv.reb);G.sv.cash+=v;G.inv=[];SFX.kaching();floatText(V.add(pl.pos,[0,3,0]),'+'+fmtCash(v),'#7dffb0');markDirty()},
  shop(){const G=this,sv=G.sv,b=[];const np=MN_PICK[sv.pick+1],nb=MN_BAG[sv.bag+1];
    if(np)b.push([`⛏️ ${np[0]} (force ${np[1]}) · ${fmtCash(np[2])}`,()=>{if(sv.cash<np[2])return SFX.error();sv.cash-=np[2];sv.pick++;SFX.buy();toast(np[0]+' !');markDirty()}]);
    if(nb)b.push([`🎒 Sac de ${nb[0]} · ${fmtCash(nb[1])}`,()=>{if(sv.cash<nb[1])return SFX.error();sv.cash-=nb[1];sv.bag++;SFX.buy();markDirty()}]);
    const rp=5e6*Math.pow(4,sv.reb);b.push([`🔁 Renaissance (×${Math.pow(2,sv.reb+1)} ventes) · ${fmtCash(rp)}`,()=>{if(sv.cash<rp)return SFX.error();sv.reb++;sv.cash=0;sv.pick=0;sv.bag=0;giveBlox(80*sv.reb,'Renaissance minière');markDirty();restartGame()}],
      ['⬆️ Remonter à la surface · gratuit',()=>{pl.pos=[0,.4,18];pl.vel=[0,0,0]}],['Fermer',null]);openDialog('⛏️ Matériel',`Pioche : ${MN_PICK[sv.pick][0]} · Sac : ${G.bagMax()} · ${fmtCash(sv.cash)}`,b)},
  update(dt,t){const G=this;G.atkCd=Math.max(0,(G.atkCd||0)-dt);const dep=Math.max(0,-pl.pos[1]);G.lightL.pos=V.add(pl.pos,[0,2.4,0]);WORLD.fog=dep>8?Math.min(.05,.01+dep*.0004):0;WORLD.fogCol=[.03,.025,.02];
    G.layT-=dt;if(G.layT<=0){G.layT=.5;const cl=Math.max(0,Math.floor(dep/2.4));for(const l of[...G.lay.keys()])if(l<cl-7||l>cl+6)G.unlayer(l);for(let l=Math.max(0,cl-7);l<=cl+4;l++)if(!G.lay.has(l)&&(l>=cl-1||dep<1))G.layer(l)}
    const m=Math.floor(dep);if(m>G.sv.deep){G.sv.deep=m;if(m>=50&&!G.sv.d50){G.sv.d50=1;giveBlox(40,'50 m de profondeur')}markDirty()}
    if(G.inv.some(o=>o.n==='Cœur de magma')&&!G.sv.heart){G.sv.heart=1;giveBlox(200,'Cœur de magma !');unlockBadge('mineur');scMessage('🔥 Tu as trouvé le Cœur de magma !',3)}
    $('mnC').textContent=fmtCash(G.sv.cash);$('mnS').textContent=`${MN_PICK[G.sv.pick][0]} · 🎒 ${G.inv.length}/${G.bagMax()} · ${m} m (record ${G.sv.deep} m)${G.sv.reb?' · ×'+Math.pow(2,G.sv.reb):''}`;
    $('mnB').textContent='F / clic : creuser · Q : surface · E : vendre / matériel'},
  exit(){WORLD.fog=0;WORLD.lights=[]}};

/* ============================== 5. DÉFENSE DU ROYAUME ============================== */
const TD_T={archer:{n:'Tour d\'archers',i:'🏹',c:'#8d5a2b',p:100,dmg:14,rate:.55,range:13},canon:{n:'Canon',i:'💣',c:'#30343d',p:220,dmg:40,rate:1.6,range:12,splash:3.5},glace:{n:'Tour de glace',i:'❄️',c:'#7fd3ff',p:180,dmg:6,rate:.8,range:11,slow:1},laser:{n:'Laser',i:'🔆',c:'#ff4fa3',p:500,dmg:9,rate:.1,range:15}};
const TD_PATH=[[-52,-40],[-52,-10],[-20,-10],[-20,-40],[14,-40],[14,0],[-40,0],[-40,30],[0,30],[0,12],[40,12],[40,44],[56,44]];
GAMES.defense={name:'Défense du Royaume',genre:'Stratégie',icon:'🏰',colors:['#2f6a3a','#ffd23f'],maxPlayers:8,music:'rpg',
  desc:"Tower defense : construis et améliore 4 types de tours sur 16 emplacements pour arrêter 40 vagues de monstres (rapides, blindés, volants, boss). Protège le château : 20 vies !",
  badges:['Vague 20 : +50 Blox','Vague 40 : +250 Blox'],
  build(sv){const G=this;G.sv=sv;sv.best=sv.best||0;G.gold=220;G.lives=20;G.wave=0;G.en=[];G.towers=[];G.queue=[];G.break=15;G.fx=[];setClock(15);
    B(0,-.5,0,140,1,120,{mat:'herbe'});for(let i=0;i<TD_PATH.length-1;i++){const a=TD_PATH[i],b=TD_PATH[i+1];B((a[0]+b[0])/2,.04,(a[1]+b[1])/2,Math.abs(a[0]-b[0])+5,.08,Math.abs(a[1]-b[1])+5,{mat:'sable',color:'#c8b28a',nocol:1})}
    const e=TD_PATH.at(-1);B(e[0]+6,4,e[1],8,8,10,{mat:'pierre'});for(const dz of[-4,4])B(e[0]+6,9,e[1]+dz,3,2,2,{mat:'pierre'});B(e[0]+6,10,e[1],.2,4,.2,{mat:'bois'});B(e[0]+6.8,11.4,e[1],1.4,.9,.1,{mat:'lisse',color:'#e5484d'});
    const s=TD_PATH[0];B(s[0],2,s[1]-4,8,4,1,{mat:'basalte'});
    G.spots=[[-46,-24],[-28,-24],[-28,4],[-8,-24],[-2,-48],[24,-20],[2,-6],[-30,10],[-48,16],[-20,40],[8,22],[20,4],[30,22],[48,26],[30,52],[8,40]];
    G.pads=G.spots.map((p,i)=>{const b=B(p[0],.2,p[1],4,.4,4,{mat:'pierre',color:'#9aa4b2'});return{i,pos:[p[0],.4,p[1]],b,t:null,lv:0,cd:0}});
    WORLD.prompts=G.pads.map(P=>({who:{pos:P.pos},label:'Tour',act:()=>G.padMenu(P)}));for(const[x,z]of[[-60,50],[60,-50],[-60,-50],[0,55],[60,0]])TREE(x,z,3,3);
    SPAWN={pos:[-10,.2,-28],size:[4,.2,4]}},
  spawn(){return[-10,.4,-28]},
  hud(el){el.innerHTML=`<div class="ghud center"><div class="gtitle" id="tdT"></div><div class="gsub" id="tdS"></div></div><div class="ghud quest" id="tdQ">E près d'un emplacement : construire / améliorer</div>`},
  padMenu(P){const G=this;if(!P.t){openDialog('🏗️ Construire',`Or : ${G.gold}`,[...Object.entries(TD_T).map(([k,t])=>[`${t.i} ${t.n} · ${t.p} or`,()=>{if(G.gold<t.p)return SFX.error();G.gold-=t.p;P.t=k;P.lv=1;G.towerBlocks(P);SFX.place?.()}]),['Annuler',null]]);return}
    const t=TD_T[P.t],up=Math.round(t.p*P.lv*1.4);openDialog(`${t.i} ${t.n} niv.${P.lv}`,`Dégâts ${Math.round(t.dmg*(1+P.lv*.6))} · portée ${t.range+P.lv} · Or : ${G.gold}`,[P.lv<5?[`⬆️ Améliorer (niv.${P.lv+1}) · ${up} or`,()=>{if(G.gold<up)return SFX.error();G.gold-=up;P.lv++;G.towerBlocks(P);SFX.buy()}]:null,[`💰 Vendre · ${Math.round(t.p*P.lv*.5)} or`,()=>{G.gold+=Math.round(t.p*P.lv*.5);P.t=null;P.lv=0;G.towerBlocks(P)}],['Fermer',null]].filter(Boolean))},
  towerBlocks(P){for(const b of P.parts||[]){const i=blocks.indexOf(b);if(i>=0)blocks.splice(i,1)}P.parts=[];if(P.t){const t=TD_T[P.t],h=2+P.lv*.8;P.parts.push(B(P.pos[0],h/2+.4,P.pos[2],2.4,h,2.4,{mat:'pierre',color:t.c}),B(P.pos[0],h+.9,P.pos[2],1.4,1,1.4,{mat:'neon',color:t.c,nocol:1}));P.top=[P.pos[0],h+1,P.pos[2]]}finalizeWorld()},
  nextWave(){const G=this;G.wave++;const n=G.wave;const q=[];const cnt=6+Math.floor(n*1.8);for(let i=0;i<cnt;i++){const r=Math.random();q.push(n%10===0&&i===0?'boss':r<.18&&n>3?'rapide':r<.3&&n>6?'blinde':r<.42&&n>9?'volant':'slime')}G.queue=q;G.spT=0;scMessage(n%10===0?`👑 VAGUE ${n} : BOSS`:`Vague ${n}`,2.5);if(n===20)giveBlox(50,'Vague 20');if(n>G.sv.best){G.sv.best=n;markDirty()}},
  update(dt,t){const G=this,n=G.wave;
    if(G.queue.length){G.spT-=dt;if(G.spT<=0){G.spT=Math.max(.35,1-n*.015);const k=G.queue.shift();const D={slime:{hp:30,sp:5,c:'#2fbf71',s:.9,g:6},rapide:{hp:22,sp:9,c:'#ffd23f',s:.7,g:7},blinde:{hp:110,sp:3.6,c:'#9aa4b2',s:1.2,g:14,arm:.5},volant:{hp:40,sp:6,c:'#b46bff',s:.8,g:10,fly:1},boss:{hp:1500,sp:2.6,c:'#e5484d',s:2.4,g:250}}[k];
        const hp=D.hp*(1+n*.24)*(n>25?1.5:1);G.en.push({...D,k,hp,max:hp,pos:[TD_PATH[0][0],D.fly?3:D.s*.6,TD_PATH[0][1]],wi:1,slowT:0})}}
    else if(!G.en.length&&n<40){G.break-=dt;if(G.break<=0){G.break=12;if(n){G.gold+=40+n*6;SFX.quest()}G.nextWave()}}
    for(let i=G.en.length-1;i>=0;i--){const e=G.en[i];const w=TD_PATH[e.wi];if(!w){G.en.splice(i,1);G.lives-=e.k==='boss'?10:1;SFX.hurt?.();shake=.3;if(G.lives<=0)G.lose();continue}
      const d=[w[0]-e.pos[0],0,w[1]-e.pos[2]],L=Math.hypot(d[0],d[2]),sp=e.sp*(e.slowT>0?.45:1)*dt;e.slowT-=dt;if(L<sp){e.pos[0]=w[0];e.pos[2]=w[1];e.wi++}else{e.pos[0]+=d[0]/L*sp;e.pos[2]+=d[2]/L*sp}}
    for(const P of G.pads){if(!P.t)continue;const t=TD_T[P.t];P.cd-=dt;if(P.cd>0)continue;const R=t.range+P.lv;let tg=null,bp=-1;for(const e of G.en){const dd=Math.hypot(e.pos[0]-P.pos[0],e.pos[2]-P.pos[2]);if(dd<R&&e.wi>bp){bp=e.wi;tg=e}}
      if(!tg)continue;P.cd=t.rate;const dm=t.dmg*(1+P.lv*.6);G.fx.push({a:[...P.top],b:[...tg.pos],t:.12,c:t.c});
      const hit=e=>{e.hp-=dm*(e.arm&&P.t!=='laser'?1-e.arm:1);if(t.slow)e.slowT=1.5};if(t.splash){for(const e of G.en)if(Math.hypot(e.pos[0]-tg.pos[0],e.pos[2]-tg.pos[2])<t.splash)hit(e);sparks(tg.pos,[3,1.5,.4],8)}else hit(tg)}
    for(let i=G.en.length-1;i>=0;i--)if(G.en[i].hp<=0){const e=G.en[i];G.gold+=e.g;sparks(e.pos,[1,3,1],10);G.en.splice(i,1)}
    for(let i=G.fx.length-1;i>=0;i--)if((G.fx[i].t-=dt)<=0)G.fx.splice(i,1);
    if(n>=40&&!G.queue.length&&!G.en.length&&!G.won){G.won=true;giveBlox(250,'Royaume sauvé !');unlockBadge('stratege');showResult('🏰 Royaume sauvé !',`40 vagues repoussées avec ${G.lives} vies restantes.`,[['Rejouer',()=>restartGame()],['Rester',null]])}
    $('tdT').textContent=`Vague ${n} / 40 · ❤️ ${G.lives}`;$('tdS').textContent=`🪙 ${G.gold} or · ${G.queue.length+G.en.length} monstres${!G.queue.length&&!G.en.length&&n<40?' · prochaine vague '+Math.ceil(G.break)+' s':''} · record ${G.sv.best}`},
  lose(){if(this.lost)return;this.lost=true;showResult('💀 Le château est tombé',`Tu as tenu ${this.wave} vagues.`,[['Rejouer',()=>restartGame()],['Quitter',()=>exitGame()]])},
  extraDraw(L){for(const e of this.en){const y=e.pos[1]+Math.abs(Math.sin(time*6+e.pos[0]))*.25;L.push({mesh:e.fly?MESH.sphere:MESH.rbox,m:M.chain(M.T(e.pos[0],y,e.pos[2]),M.S(e.s,e.s*.8,e.s)),mode:3,color:e.slowT>0?'#bfe9ff':e.c,shin:120,emis:e.k==='boss'?(HDR?.8:.3):0});
      L.push({mesh:MESH.box,m:M.chain(M.T(e.pos[0],y+e.s*.7+.4,e.pos[2]),M.S(1.2*e.hp/e.max,.12,.12)),mode:3,color:'#2fbf71',emis:HDR?1:.4})}
    for(const f of this.fx){const m=V.mul(V.add(f.a,f.b),.5),d=V.sub(f.b,f.a),len=V.len(d);L.push({mesh:MESH.box,m:M.chain(M.T(...m),M.RY(Math.atan2(d[0],d[2])),M.RX(-Math.asin(clamp(d[1]/len,-1,1))),M.S(.12,.12,len)),mode:3,color:f.c,emis:HDR?2.5:.8})}}};

for(const o of MN_ORES)o.hp=Math.ceil(o.hp*1.7);for(const p of MN_PICK)p[2]=Math.round(p[2]*1.6);for(const b of MN_BAG)b[1]=Math.round(b[1]*1.6);
