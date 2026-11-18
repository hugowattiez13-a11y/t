"use strict";
/* ============================================================================
   JEUX D'HORREUR CO-OP (drôles) : Manoir des Farces & Camp Nounours
   Objectifs partagés entre tous les joueurs du serveur, monstres qui
   poursuivent, peaux de banane, coussins péteurs, lampe torche…
   ============================================================================ */
NPC_AV.clown={skin:'#fff4e8',haut:'maillot',bas:'pyjama',visage:'mdr',chapeau:'sorcier',cheveux:null,lunettes:null,dos:null,cou:'noeud',epaule:null};
NPC_AV.nounours={skin:'#8d5524',haut:'hoodie_gris',bas:'cargo',visage:'demon',chapeau:null,cheveux:null,lunettes:null,dos:null,cou:null,epaule:null};
Object.assign(SFX,{
  honk(v=1){tone('square',330,.18,.12*v,{f2:300});tone('square',440,.18,.08*v,{f2:400,delay:.02})},
  prout(v=1){noise(.45,.22*v,{type:'lowpass',f:220,f2:90,q:4,rev:.1});tone('sawtooth',70,.4,.12*v,{f2:52,vib:[24,12]})},
  slip(){tone('sine',600,.35,.1,{f2:180});noise(.15,.08,{type:'highpass',f:2500})},
  chicken(){for(let i=0;i<3;i++)tone('square',900-i*120,.12,.07,{f2:600,delay:i*.12,vib:[30,40]})},
  dizzy(){for(let i=0;i<4;i++)tone('sine',1200+i*200,.08,.04,{delay:i*.07})}});
SONGS.manoir={...SONGS.horreur,bpm:70,key:44};SONGS.camp={...SONGS.horreur,bpm:58,key:48,pad:'triangle'};

function makeHorror(cfg){return{name:cfg.name,genre:'Horreur',icon:cfg.icon,colors:cfg.colors,desc:cfg.desc,badges:cfg.badges,maxPlayers:8,music:cfg.music,
  passes:[{id:'lampe',name:'Super lampe',icon:'🔦',price:120,perk:'none',desc:'Lampe torche deux fois plus puissante.'},{id:'vit',name:'Baskets de fuite',icon:'👟',price:150,perk:'speed',desc:'Cours plus vite que les monstres.'}],
  build(sv){const G=this;G.sv=sv;G.items=[];G.got=new Set();G.teamGot=new Set();G.monsters=[];G.bananas=[];G.traps=[];G.won=false;G.phase=0;G.held=0;G.timer=0;
    WORLD.lights=[];WORLD.emitters=[];WORLD.meshes=[];WORLD.fog=.035;WORLD.fogCol=[.02,.025,.04];setClock(.5);resetSkyNight();
    G.torch={pos:[0,0,0],color:'#fff2cc',range:16,bright:2.6,base:2.6};WORLD.lights.push(G.torch);
    cfg.build(G,HB_);G.total=G.items.length;
    for(const m of G.mspawn){const c=spawnNPC(m.name,m.av,m.pos,{still:true,quiet:true,col:'#ff4d4d'});c.monster={home:[...m.pos],speed:m.speed,aggro:m.aggro,cd:0,stun:0,honkT:2,path:m.path||null,pi:0};c.walk=m.speed;G.monsters.push(c)}
    WORLD.prompts=[];for(const b of G.bananas)WORLD.prompts.push({who:{pos:b.pos,name:'banane'},label:'Prendre des bananes',act:()=>{G.held=Math.min(5,G.held+3);SFX.pickup();toast('🍌 ×'+G.held+' — appuie sur F pour en lancer une')},range:2.5})},
  spawn(){return this.start||[0,.3,0]},
  hud(el){el.innerHTML=`<div class="ghud center"><div class="gtitle" id="hoT">${cfg.goal} 0 / 0</div><div class="gsub" id="hoS">${cfg.hint}</div></div><div class="ghud quest" id="hoB">🍌 0 · F pour lancer</div>`},
  mpState(){return{got:[...this.got].slice(0,40),hw:this.won?1:0}},
  onRemote(c,pr){for(const id of Array.isArray(pr.got)?pr.got:[])if(!this.teamGot.has(id)){this.teamGot.add(id);const it=this.items.find(i=>i.id===id);if(it&&!it.taken){it.taken=true;sys(`${cfg.itemIcon} ${c.name} a trouvé ${it.name} !`)}}
    if(pr.hw&&!c.hw){c.hw=true;sys(`🎉 ${c.name} s'est échappé !`)}},
  input(k){if(k==='attack')this.throwBanana()},
  throwBanana(){const G=this;if(G.held<=0){floatText(V.add(pl.pos,[0,3,0]),'Pas de banane','#ffd23f');return}G.held--;const f=[Math.sin(pl.yaw),0,Math.cos(pl.yaw)];const p=V.add(pl.pos,V.mul(f,-1.4));G.traps.push({pos:[p[0],.12,p[2]],t:60,kind:'banane'});SFX.slip()},
  update(dt,t){const G=this;G.timer+=dt;const P=V.add(pl.pos,[0,1.2,0]);
    // lampe torche devant le joueur
    const f=[Math.sin(pl.yaw),0,Math.cos(pl.yaw)];G.torch.pos=V.add(pl.pos,[f[0]*2.2,2.1,f[2]*2.2]);G.torch.range=hasPass(gameKey(),'lampe')?24:15;G.torch.bright=pl.dead?0:G.torch.base*(Math.random()<.01?.3:1);
    worldFx(dt,t,false);
    // objets à trouver
    for(const it of G.items){if(it.taken)continue;if(V.len(V.sub(P,it.pos))<1.6){it.taken=true;G.got.add(it.id);G.teamGot.add(it.id);SFX.pickup();sparks(it.pos,[3,2.4,.6],16);toast(`${cfg.itemIcon} ${it.name} trouvé !`);MP.sendT=0}}
    const n=G.teamGot.size;$('hoT').textContent=`${cfg.goal} ${n} / ${G.total}`;$('hoB').textContent=`🍌 ${G.held} · F/clic pour lancer · ⏱ ${fmtT(G.timer)}`;
    if(n>=G.total&&!G.phase){G.phase=1;SFX.levelUp();scMessage(cfg.unlock,4);cfg.onUnlock(G);finalizeWorld()}
    if(G.phase&&!G.won&&G.door&&inBox(P,G.door,.3)){G.won=true;MP.sendT=0;confetti(V.add(pl.pos,[0,2,0]));const blox=40+Math.max(0,Math.round(60-G.timer/30));giveBlox(blox,'Évasion réussie');unlockBadge('horreur');G.sv.wins=(G.sv.wins||0)+1;markDirty();
      showResult('Évadé ! 🎉',`Temps : ${fmtT(G.timer)} · +${blox} Blox. Aide tes amis encore coincés !`,[['Continuer',null],['Rejouer',()=>restartGame()]])}
    // pièges drôles
    for(const tr of G.cushions)if(inBox(P,tr,.1)&&!tr.cool){tr.cool=3;SFX.prout();floatText(V.add(pl.pos,[0,3,0]),'PROUT 💨','#9be36b');for(let i=0;i<12;i++)emit({pos:V.add(pl.pos,[rnd(-.4,.4),.3,rnd(-.4,.4)]),vel:[rnd(-1,1),rnd(.5,1.5),rnd(-1,1)],life:1.4,size:.4,size1:1.2,col:[.6,.8,.3],alpha:.35});for(const c of G.monsters)if(V.len(V.sub(c.pos,pl.pos))<30)c.monster.alert=4}else if(tr.cool>0)tr.cool-=dt;
    for(const z of G.scares)if(!z.done&&inBox(P,z,.2)){z.done=true;if(z.kind==='poulet'){SFX.chicken();scMessage('🐔 BWAAAK !',1.5);shake=.4}else{jumpscare();setTimeout(()=>{SFX.honk();scMessage('Haha, je t\'ai eu ! 🤡',2)},700)}}
    for(let i=G.traps.length-1;i>=0;i--){const tr=G.traps[i];tr.t-=dt;if(tr.t<=0){G.traps.splice(i,1);continue}for(const c of G.monsters)if(!c.monster.stun&&V.len(V.sub(c.pos,tr.pos))<1.1){c.monster.stun=4;SFX.slip();SFX.dizzy();floatText(V.add(c.pos,[0,3.3,0]),'GLISSADE ! 🍌','#ffd23f');c.a.lean=-1.2;G.traps.splice(i,1);break}}
    // monstres
    for(const c of G.monsters){const m=c.monster;m.cd-=dt;m.honkT-=dt;if(m.alert>0)m.alert-=dt;
      if(m.stun>0){m.stun-=dt;c.forceWish=[0,0,0];c.emote='toupie';if(Math.random()<dt*8)emit({pos:V.add(c.pos,[Math.cos(t*6)*.6,3,Math.sin(t*6)*.6]),vel:[0,0,0],life:.3,size:.15,size1:0,col:[3,3,.5],add:1,shape:2});continue}c.emote=null;
      const d=V.sub(pl.pos,c.pos);d[1]=0;const L=V.len(d),aggro=m.aggro*(m.alert>0?2:1)*(pl.crouch?.6:1);
      if(!pl.dead&&!G.won&&L<aggro){c.forceWish=L>.8?V.mul(d,1/L):[0,0,0];c.walk=m.speed*(G.phase?1.15:1);if(m.honkT<=0){m.honkT=rnd(2,4);cfg.monsterSound(V.len(d)<12?1:.5)}
        if(L<1.4&&m.cd<=0){m.cd=2;cfg.caught(c);die(pl,false)}}
      else if(m.path){const w=m.path[m.pi%m.path.length],dd=V.sub(w,c.pos);dd[1]=0;if(V.len(dd)<1.5)m.pi++;c.forceWish=V.norm(dd);c.walk=m.speed*.55}
      else{const h=V.sub(m.home,c.pos);h[1]=0;c.forceWish=V.len(h)>1.5?V.norm(h):[0,0,0]}}
    if(Math.random()<dt*.05)SFX[pick(['creak','whisper','door'])]()},
  extraDraw(L,TR){const G=this;drawWorldExtras(L,TR);for(const it of G.items)if(!it.taken){const y=it.pos[1]+Math.sin(time*2.4+it.pos[0])*.15;cfg.drawItem(L,[it.pos[0],y,it.pos[2]]);if(Math.random()<.03)glow(it.pos,[1.2,1,.3],1.2)}
    for(const tr of G.traps)L.push({mesh:MESH.torus,m:M.chain(M.T(...tr.pos),M.RX(Math.PI/2),M.S(.45,.45,.25)),mode:3,color:'#ffd23f',shin:80});
    for(const b of G.bananas)for(let k=0;k<3;k++)L.push({mesh:MESH.torus,m:M.chain(M.T(b.pos[0]+k*.3-.3,b.pos[1]+k*.1,b.pos[2]),M.RX(Math.PI/2),M.RZ(k),M.S(.45,.45,.25)),mode:3,color:'#ffd23f',shin:80})
    for(const tr of G.cushions)L.push({mesh:MESH.sphere,m:M.chain(M.T(tr.pos[0],.18,tr.pos[2]),M.S(1,.3,1)),mode:3,color:'#ff4fa3',shin:60})},
  exit(){WORLD.fog=0;WORLD.lights=[];resetSky()}}}
function resetSkyNight(){setClock(.5)}
// petites aides de construction
const HB_={room(x,z,w,d,h,mat,col,doors=[]){const t=.5;const wall=(cx,cz,sx,sz)=>B(cx,h/2,cz,sx,h,sz,{mat,color:col});
    B(x,.05,z,w,.1,d,{mat:'planches',color:'#4a3426'});B(x,h+.2,z,w+.5,.4,d+.5,{mat:'beton',color:'#2a2624'});
    const side=(n,cx,cz,len,horiz)=>{const ds=doors.filter(o=>o[0]===n).map(o=>o[1]).sort((a,b)=>a-b);let a=-len/2;for(const dp of[...ds,len/2+2]){const b=Math.min(dp-1.4,len/2);if(b>a+.05){const m=(a+b)/2,l=b-a;horiz?wall(cx+m,cz,l,t):wall(cx,cz+m,t,l)}a=dp+1.4}
      for(const dp of ds){horiz?B(cx+dp,h-.7,cz,2.8,1.4,t,{mat,color:col}):B(cx,h-.7,cz+dp,t,1.4,2.8,{mat,color:col})}};
    side('n',x,z-d/2,w,true);side('s',x,z+d/2,w,true);side('w',x-w/2,z,d,false);side('e',x+w/2,z,d,false)},
  light(x,y,z,col,range,bright,flicker){const L={pos:[x,y,z],color:col,range,bright,base:bright,flicker};WORLD.lights.push(L);B(x,y,z,.35,.35,.35,{mat:'neon',color:col,shape:'sphere',nocol:true});return L}};

GAMES.manoir=makeHorror({name:'Manoir des Farces',icon:'🤡',colors:['#3a1f4a','#ff4fa3'],music:'manoir',badges:['S\'échapper : jusqu\'à +100 Blox'],
  desc:"Horreur drôle en équipe (1 à 8) : trouvez les 8 fusibles cachés dans l'immense manoir pour rallumer le courant et fuir… pendant que Bobo le clown vous course en klaxonnant. Peaux de banane, coussins péteurs et poulets en caoutchouc inclus.",
  goal:'🔌 Fusibles',hint:'Fouillez le manoir ensemble · F : lancer une banane',itemIcon:'🔌',unlock:'⚡ Le courant revient ! La grille du jardin est ouverte !',
  monsterSound:v=>SFX.honk(v),caught:c=>{scMessage('🤡 PWEEET ! Bobo t\'a attrapé !',2.5);SFX.laugh()},
  drawItem:(L,p)=>{L.push({mesh:MESH.rbox,m:M.chain(M.T(...p),M.RY(time*2),M.S(.35,.6,.35)),mode:3,color:'#ffd23f',shin:200,emis:HDR?1.2:.4},{mesh:MESH.cyl,m:M.chain(M.T(p[0],p[1]+.38,p[2]),M.S(.2,.15,.2)),mode:3,color:'#9aa4b2',shin:120})},
  onUnlock:G=>{for(const b of G.gates){b.nocol=true;b.alpha=.12}for(const L of WORLD.lights)L.base=Math.max(L.base,1.6);refreshSolids()},
  build(G,h){B(0,-.5,0,170,1,170,{mat:'terre',color:'#2d2a26'});G.start=[0,.3,58];B(0,.05,58,6,.1,6,{color:'#3d3a46',mat:'lisse'});
    // jardin + grille
    for(let i=0;i<30;i++){const a=i/30*Math.PI*2,r=70+rh(i)*8;if(Math.abs(Math.cos(a)*r)<14&&Math.sin(a)<0)continue;LOG(Math.cos(a)*r,2,Math.sin(a)*r,4,.6,'y');B(Math.cos(a)*r,4.4,Math.sin(a)*r,2.6,2,2.6,{mat:'feuillage',color:'#2b3a2b'})}
    for(let i=0;i<9;i++)B(-24+i*6,1,40,1.6,2,.4,{mat:'pierre',color:'#6d6f74'});SIGN(0,3,52,'MANOIR DES FARCES\nTrouvez les 8 fusibles !',true,{size:38});
    G.gates=[B(0,2.5,-66,8,5,.4,{mat:'metal',color:'#30343d'})];B(-8,3,-66,8,6,.6,{mat:'brique',color:'#3b3330'});B(8,3,-66,8,6,.6,{mat:'brique',color:'#3b3330'});B(-41,2,-66,58,4,.6,{mat:'metal',color:'#30343d'});B(41,2,-66,58,4,.6,{mat:'metal',color:'#30343d'});G.door={pos:[0,2,-72],size:[10,4,6]};B(0,.1,-74,10,.2,10,{mat:'or'});
    // manoir : 3 ailes, 2 étages
    const wall='#4a3f3a';h.room(0,0,40,30,6,'brique',wall,[['s',0],['n',-10],['n',10],['w',0],['e',0]]);h.room(-34,0,28,24,6,'brique',wall,[['e',0],['n',0]]);h.room(34,0,28,24,6,'brique',wall,[['w',0],['s',4]]);
    h.room(0,-30,30,26,6,'brique',wall,[['s',-10],['s',10],['w',6],['e',-6]]);h.room(-30,-32,20,20,6,'planches','#3a2a20',[['e',4],['s',0]]);h.room(30,-32,20,20,6,'planches','#3a2a20',[['w',-4]]);
    // placard secret + cave
    h.room(8,-9,8,6,3.2,'planches','#3a2a20',[['w',0]]);h.room(0,-56,16,12,4,'pierre','#3d3f44',[['s',0]]);
    // meubles
    for(const[x,z,w,d,hh,c]of[[-6,6,6,2,1,'#5a3a24'],[10,8,3,6,1.4,'#3a2618'],[-38,4,8,2,1.2,'#5a3a24'],[36,-4,2,8,2.4,'#2a1a12'],[0,-36,10,3,1,'#5a3a24'],[-30,-36,3,6,2.6,'#2a1a12'],[30,-30,6,6,.8,'#7a2a2a']])B(x,hh/2,z,w,hh,d,{mat:'bois',color:c});
    for(const[x,z]of[[-15,-12],[15,12],[-40,-8],[40,8],[0,-42]])B(x,1.2,z,1.2,2.4,1.2,{mat:'pierre',color:'#6d6a64'});
    // lumières vacillantes
    for(const[x,z]of[[0,0],[-34,0],[34,0],[0,-30],[-30,-32],[30,-32],[0,-56]])h.light(x,5.2,z,'#ffcf8a',10,1.4,.6);h.light(0,3,-72,'#9ad7ff',12,2,0);B(0,.05,-46,4,.1,6,{mat:'planches',color:'#4a3426'});
    // fusibles
    const spots=[[-44,1,8],[44,1,-8],[-30,1,-40],[34,1,-36],[9,1,-9],[-12,1.2,12],[18,1.2,-34],[2,1,-58]];spots.forEach((p,i)=>G.items.push({id:'f'+i,name:'un fusible',pos:p,taken:false}));
    G.bananas=[{pos:[-4,1,50]},{pos:[30,1,10]},{pos:[-20,1,-40]}];G.cushions=[{pos:[0,.3,-2],size:[2,.6,2]},{pos:[-34,.3,8],size:[2,.6,2]},{pos:[30,.3,-30],size:[2,.6,2]},{pos:[0,.3,-20],size:[2,.6,2]}];
    G.scares=[{pos:[-34,2,-8],size:[4,4,3],kind:'poulet'},{pos:[34,2,8],size:[4,4,3]},{pos:[30,2,-40],size:[4,4,4],kind:'poulet'},{pos:[8,1.5,-9],size:[3,3,3]}];
    G.mspawn=[{name:'Bobo le clown',av:'clown',pos:[0,.2,-30],speed:6.4,aggro:18,path:[[0,0,-30],[-30,0,-32],[-34,0,0],[0,0,0],[34,0,0],[30,0,-32]]},{name:'P\'tit Bobo',av:'clown',pos:[34,.2,0],speed:5.6,aggro:13}]}});

GAMES.camp=makeHorror({name:'Camp Nounours',icon:'🧸',colors:['#1d3b2a','#ff8a3d'],music:'camp',badges:['S\'échapper : jusqu\'à +100 Blox'],
  desc:"Une colonie de vacances, la nuit… les nounours géants se sont réveillés ! En équipe, retrouvez les 6 pièces de la radio dans la forêt, appelez les secours puis nagez jusqu'au bateau sur le lac. Câlins mortels garantis.",
  goal:'📻 Pièces de radio',hint:'Explorez la forêt ensemble · F : lancer une banane',itemIcon:'📻',unlock:'📡 Les secours arrivent : nagez jusqu\'au bateau sur le lac !',
  monsterSound:v=>{tone('sine',140,.5,.1*v,{f2:90,vib:[5,20]})},caught:c=>{scMessage('🧸 CÂLIN GÉANT ! Tu es tout écrasé…',2.5);SFX.laugh()},
  drawItem:(L,p)=>{L.push({mesh:MESH.rbox,m:M.chain(M.T(...p),M.RY(time*2),M.S(.6,.4,.3)),mode:3,color:'#3d8bff',shin:120,emis:HDR?.8:.3},{mesh:MESH.cyl,m:M.chain(M.T(p[0]+.2,p[1]+.45,p[2]),M.S(.05,.5,.05)),mode:3,color:'#d8dee6',shin:200})},
  onUnlock:G=>{G.boat.color='#e5484d';G.boat.mat='planches';const L=WORLD.lights.find(l=>l.boat);if(L)L.base=3},
  build(G,h){B(0,-.5,20,190,1,150,{mat:'herbe',color:'#24361f'});B(-67.5,-.5,-75,55,1,40,{mat:'herbe',color:'#24361f'});B(67.5,-.5,-75,55,1,40,{mat:'herbe',color:'#24361f'});B(0,-3.6,-75,80,1,40,{mat:'sable'});G.start=[0,.3,30];
    // camp : cabanes, feu de camp, réfectoire
    for(const[x,z]of[[-14,20],[14,20],[-14,36],[14,36]])h.room(x,z,8,8,4,'planches','#5a3a24',[[x<0?'e':'w',0]]);h.room(0,52,22,12,5,'planches','#5a3a24',[['s',0]]);
    B(0,.4,28,2.4,.8,2.4,{mat:'pierre'});const fire={pos:[0,1.4,28],size:[1,1,1],fx:'feu',color:'#ff8a3d',obj:{},on:true,acc:0};(WORLD.emitters=WORLD.emitters||[]).push(fire);h.light(0,2,28,'#ff9a3d',14,2.6,.25);
    SIGN(0,3,22,'CAMP NOUNOURS\nTrouvez les 6 pièces de radio',true,{size:36});
    // forêt dense
    for(let i=0;i<120;i++){const a=rh(i*3)*Math.PI*2,r=26+rh(i*7)*62,x=Math.cos(a)*r,z=Math.sin(a)*r-10;if(z<-50&&Math.abs(x)<46)continue;if(Math.abs(x)<26&&z>12&&z<62)continue;if(Math.hypot(x+30,z-30)<11||Math.hypot(x-46,z+22)<6||Math.hypot(x+48,z+20)<8)continue;LOG(x,2.4,z,4.8,.7,'y');B(x,5.4,z,3.4,2.6,3.4,{mat:'feuillage',color:'#1f3320'});B(x,7.2,z,2,1.6,2,{mat:'feuillage',color:'#1f3320'})}
    // ruines, tour de guet, grotte
    h.room(-48,-20,10,10,4,'pierre','#5d5f63',[['e',0]]);for(const[x,z]of[[44,-24],[48,-24],[44,-20],[48,-20]])LOG(x,4,z,8,.6,'y');B(46,8.2,-22,6,.4,6,{mat:'planches'});B(46,4.2,-19,1.6,8.4,.25,{mat:'bois',mode:4,climb:'wood'});
    B(-30,4,30,14,8,10,{mat:'basalte'});B(-30,1.6,24.9,4,3.2,.4,{mat:'lisse',color:'#0a0a0c',nocol:1});
    // lac + bateau (on nage !)
    waters.push({pos:[0,-1.6,-75],size:[80,3,40],swimAt:.55,color:'#1c4a6a'});B(0,-.1,-57,6,.4,6,{mat:'planches'});
    G.boat=B(0,.2,-88,5,.8,9,{mat:'bois',color:'#6d4a2a'});const bl={pos:[0,3,-88],color:'#ff3030',range:18,bright:0,base:0,boat:true};WORLD.lights.push(bl);G.door={pos:[0,1.4,-88],size:[5,2.4,9]};
    const spots=[[-48,1,-20],[46,9.6,-22],[-30,1.2,22],[60,1,20],[-62,1,-40],[0,1.2,54]];spots.forEach((p,i)=>G.items.push({id:'r'+i,name:'une pièce de radio',pos:p,taken:false}));
    G.bananas=[{pos:[6,1,52]},{pos:[-14,1,20]}];G.cushions=[{pos:[14,.3,36],size:[2,.6,2]},{pos:[-14,.3,36],size:[2,.6,2]},{pos:[0,.3,48],size:[2,.6,2]}];
    G.scares=[{pos:[-30,2,26],size:[4,4,3]},{pos:[46,8,-22],size:[3,3,3],kind:'poulet'},{pos:[-48,2,-20],size:[4,4,4],kind:'poulet'}];
    G.mspawn=[{name:'Gros Nounours',av:'nounours',pos:[30,.2,-10],speed:6,aggro:20,path:[[30,0,-10],[-30,0,-10],[-40,0,30],[40,0,30]]},{name:'Nounours Câlin',av:'nounours',pos:[-40,.2,-30],speed:5.4,aggro:15},{name:'Mini Nounours',av:'nounours',pos:[50,.2,30],speed:7,aggro:11}]}});
