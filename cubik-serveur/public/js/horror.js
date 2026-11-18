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
  build(sv){const G=this;G.sv=sv;G.items=[];G.got=new Set();G.teamGot=new Set();G.monsters=[];G.bananas=[];G.traps=[];G.won=false;G.phase=0;G.held=0;G.timer=0;G.st=0;G.surv=0;
    WORLD.lights=[];WORLD.emitters=[];WORLD.meshes=[];WORLD.fog=.035;WORLD.fogCol=[.02,.025,.04];setClock(.5);resetSkyNight();
    G.torch={pos:[0,0,0],color:'#fff2cc',range:16,bright:2.6,base:2.6};WORLD.lights.push(G.torch);
    cfg.build(G,HB_);for(const it of G.items)it.st=it.st||0;G.stages=cfg.stages||[{goal:cfg.goal,hint:cfg.hint,icon:cfg.itemIcon,msg:cfg.unlock,done:cfg.onUnlock}];G.total=G.items.filter(i=>i.st===0).length;
    G.addMonster=m=>{const c=spawnNPC(m.name,m.av,m.pos,{still:true,quiet:true,col:'#ff4d4d'});c.monster={home:[...m.pos],speed:m.speed,aggro:m.aggro,cd:0,stun:0,honkT:2,path:m.path||null,pi:0};c.walk=m.speed;G.monsters.push(c);return c};
    for(const m of G.mspawn)G.addMonster(m);
    WORLD.prompts=[];for(const b of G.bananas)WORLD.prompts.push({who:{pos:b.pos,name:'banane'},label:'Prendre des bananes',act:()=>{G.held=Math.min(5,G.held+3);SFX.pickup();toast('🍌 ×'+G.held+' — appuie sur F pour en lancer une')},range:2.5})},
  spawn(){return this.start||[0,.3,0]},
  hud(el){el.innerHTML=`<div class="ghud center"><div class="gtitle" id="hoT">${cfg.goal} 0 / 0</div><div class="gsub" id="hoS">${cfg.hint}</div></div><div class="ghud quest" id="hoB">🍌 0 · F pour lancer</div>`},
  mpState(){return{got:[...this.got].slice(0,60),hw:this.won?1:0,hs:this.st}},
  onRemote(c,pr){if(this.surv>0&&+pr.hs>this.st)this.surv=.01;for(const id of Array.isArray(pr.got)?pr.got:[])if(!this.teamGot.has(id)){this.teamGot.add(id);const it=this.items.find(i=>i.id===id);if(it&&!it.taken){it.taken=true;sys(`${(G_ST(this,it.st).icon)||'⭐'} ${c.name} a trouvé ${it.name} !`)}}
    if(pr.hw&&!c.hw){c.hw=true;sys(`🎉 ${c.name} s'est échappé !`)}},
  input(k){if(k==='attack')this.throwBanana()},
  nextStage(){const G=this,S=G.stages[G.st];SFX.levelUp();if(S.msg)scMessage(S.msg,4);S.done&&S.done(G);finalizeWorld();G.st++;G.surv=0;const N=G.stages[G.st];
    if(N&&N.spawn)for(const m of N.spawn)G.addMonster(m);if(N&&N.survive){shake=.5;SFX.scream?.()}if(!N){G.phase=1}markDirty()},
  throwBanana(){const G=this;if(G.held<=0){floatText(V.add(pl.pos,[0,3,0]),'Pas de banane','#ffd23f');return}G.held--;const f=[Math.sin(pl.yaw),0,Math.cos(pl.yaw)];const p=V.add(pl.pos,V.mul(f,-1.4));G.traps.push({pos:[p[0],.12,p[2]],t:60,kind:'banane'});SFX.slip()},
  update(dt,t){const G=this;G.timer+=dt;const P=V.add(pl.pos,[0,1.2,0]);
    // lampe torche devant le joueur
    const f=[Math.sin(pl.yaw),0,Math.cos(pl.yaw)];G.torch.pos=V.add(pl.pos,[f[0]*2.2,2.1,f[2]*2.2]);G.torch.range=hasPass(gameKey(),'lampe')?24:15;G.torch.bright=pl.dead?0:G.torch.base*(Math.random()<.01?.3:1);
    worldFx(dt,t,false);
    // objets à trouver
    const S=G.stages[G.st];
    for(const it of G.items){if(it.taken||it.st>G.st)continue;if(V.len(V.sub(P,it.pos))<1.6){it.taken=true;G.got.add(it.id);G.teamGot.add(it.id);SFX.pickup();sparks(it.pos,[3,2.4,.6],16);toast(`${G_ST(G,it.st).icon} ${it.name} trouvé !`);MP.sendT=0}}
    if(S&&!S.survive){const cur=G.items.filter(i=>i.st===G.st),n=cur.filter(i=>i.taken).length;$('hoT').textContent=`${S.goal} ${n} / ${cur.length}`;$('hoS').textContent=`Étape ${G.st+1}/${G.stages.length} · ${S.hint}`;if(n>=cur.length)G.nextStage()}
    else if(S&&S.survive){if(!G.surv)G.surv=S.survive;G.surv-=dt;$('hoT').textContent=`${S.goal} ${Math.max(0,Math.ceil(G.surv))} s`;$('hoS').textContent=`Étape ${G.st+1}/${G.stages.length} · ${S.hint}`;if(G.surv<=0){G.surv=0;G.nextStage()}}
    else{$('hoT').textContent=cfg.exitGoal||'🚪 Fuyez !';$('hoS').textContent=cfg.exitHint||'La sortie est ouverte !'}
    $('hoB').textContent=`🍌 ${G.held} · F/clic pour lancer · ⏱ ${fmtT(G.timer)}`;
    if(G.phase&&!G.won&&G.door&&inBox(P,G.door,.3)){G.won=true;MP.sendT=0;confetti(V.add(pl.pos,[0,2,0]));const blox=40+Math.max(0,Math.round(60-G.timer/30));giveBlox(blox,'Évasion réussie');unlockBadge('horreur');G.sv.wins=(G.sv.wins||0)+1;markDirty();
      showResult('Évadé ! 🎉',`Temps : ${fmtT(G.timer)} · +${blox} Blox. Aide tes amis encore coincés !`,[['Continuer',null],['Rejouer',()=>restartGame()]])}
    // pièges drôles
    for(const tr of G.cushions)if(inBox(P,tr,.1)&&!tr.cool){tr.cool=3;SFX.prout();floatText(V.add(pl.pos,[0,3,0]),'PROUT 💨','#9be36b');for(let i=0;i<12;i++)emit({pos:V.add(pl.pos,[rnd(-.4,.4),.3,rnd(-.4,.4)]),vel:[rnd(-1,1),rnd(.5,1.5),rnd(-1,1)],life:1.4,size:.4,size1:1.2,col:[.6,.8,.3],alpha:.35});for(const c of G.monsters)if(V.len(V.sub(c.pos,pl.pos))<30)c.monster.alert=4}else if(tr.cool>0)tr.cool-=dt;
    for(const z of G.scares)if(!z.done&&inBox(P,z,.2)){z.done=true;if(z.kind==='poulet'){SFX.chicken();scMessage('🐔 BWAAAK !',1.5);shake=.4}else{jumpscare();setTimeout(()=>{SFX.honk();scMessage('Haha, je t\'ai eu ! 🤡',2)},700)}}
    for(let i=G.traps.length-1;i>=0;i--){const tr=G.traps[i];tr.t-=dt;if(tr.t<=0){G.traps.splice(i,1);continue}for(const c of G.monsters)if(!c.monster.stun&&V.len(V.sub(c.pos,tr.pos))<1.1){c.monster.stun=4;SFX.slip();SFX.dizzy();floatText(V.add(c.pos,[0,3.3,0]),'GLISSADE ! 🍌','#ffd23f');c.a.lean=-1.2;G.traps.splice(i,1);break}}
    // monstres
    for(const c of G.monsters){const m=c.monster;m.cd-=dt;m.honkT-=dt;if(m.alert>0)m.alert-=dt;
      if(m.stun>0){m.stun-=dt;c.forceWish=[0,0,0];c.emote='toupie';if(Math.random()<dt*8)emit({pos:V.add(c.pos,[Math.cos(t*6)*.6,3,Math.sin(t*6)*.6]),vel:[0,0,0],life:.3,size:.15,size1:0,col:[3,3,.5],add:1,shape:2});continue}c.emote=null;
      const d=V.sub(pl.pos,c.pos);d[1]=0;const L=V.len(d),frantic=G.surv>0,aggro=m.aggro*(m.alert>0||frantic?2:1)*(pl.crouch?.6:1);
      if(!pl.dead&&!G.won&&L<aggro){c.forceWish=L>.8?V.mul(d,1/L):[0,0,0];c.walk=m.speed*(G.phase?1.15:1)*(frantic?1.12:1)*(1+G.st*.04);if(m.honkT<=0){m.honkT=rnd(2,4);cfg.monsterSound(V.len(d)<12?1:.5)}
        if(L<1.4&&m.cd<=0){m.cd=2;cfg.caught(c);die(pl,false)}}
      else if(m.path){const w=m.path[m.pi%m.path.length],dd=V.sub(w,c.pos);dd[1]=0;if(V.len(dd)<1.5)m.pi++;c.forceWish=V.norm(dd);c.walk=m.speed*.55}
      else{const h=V.sub(m.home,c.pos);h[1]=0;c.forceWish=V.len(h)>1.5?V.norm(h):[0,0,0]}}
    if(Math.random()<dt*.05)SFX[pick(['creak','whisper','door'])]()},
  extraDraw(L,TR){const G=this;drawWorldExtras(L,TR);for(const it of G.items)if(!it.taken&&it.st<=G.st){const dI=G_ST(G,it.st).draw||cfg.drawItem;const y=it.pos[1]+Math.sin(time*2.4+it.pos[0])*.15;dI(L,[it.pos[0],y,it.pos[2]]);if(Math.random()<.03)glow(it.pos,[1.2,1,.3],1.2)}
    for(const tr of G.traps)L.push({mesh:MESH.torus,m:M.chain(M.T(...tr.pos),M.RX(Math.PI/2),M.S(.45,.45,.25)),mode:3,color:'#ffd23f',shin:80});
    for(const b of G.bananas)for(let k=0;k<3;k++)L.push({mesh:MESH.torus,m:M.chain(M.T(b.pos[0]+k*.3-.3,b.pos[1]+k*.1,b.pos[2]),M.RX(Math.PI/2),M.RZ(k),M.S(.45,.45,.25)),mode:3,color:'#ffd23f',shin:80})
    for(const tr of G.cushions)L.push({mesh:MESH.sphere,m:M.chain(M.T(tr.pos[0],.18,tr.pos[2]),M.S(1,.3,1)),mode:3,color:'#ff4fa3',shin:60})},
  exit(){WORLD.fog=0;WORLD.lights=[];resetSky()}}}
function resetSkyNight(){setClock(.5)}
function G_ST(G,i){return(G.stages&&G.stages[i])||{}}
// petites aides de construction
const HB_={room(x,z,w,d,h,mat,col,doors=[]){const t=.5;const wall=(cx,cz,sx,sz)=>B(cx,h/2,cz,sx,h,sz,{mat,color:col});
    B(x,.05,z,w,.1,d,{mat:'planches',color:'#4a3426'});B(x,h+.2,z,w+.5,.4,d+.5,{mat:'beton',color:'#2a2624'});
    const side=(n,cx,cz,len,horiz)=>{const ds=doors.filter(o=>o[0]===n).map(o=>o[1]).sort((a,b)=>a-b);let a=-len/2;for(const dp of[...ds,len/2+2]){const b=Math.min(dp-1.4,len/2);if(b>a+.05){const m=(a+b)/2,l=b-a;horiz?wall(cx+m,cz,l,t):wall(cx,cz+m,t,l)}a=dp+1.4}
      for(const dp of ds){horiz?B(cx+dp,h-.7,cz,2.8,1.4,t,{mat,color:col}):B(cx,h-.7,cz+dp,t,1.4,2.8,{mat,color:col})}};
    side('n',x,z-d/2,w,true);side('s',x,z+d/2,w,true);side('w',x-w/2,z,d,false);side('e',x+w/2,z,d,false)},
  light(x,y,z,col,range,bright,flicker){const L={pos:[x,y,z],color:col,range,bright,base:bright,flicker};WORLD.lights.push(L);B(x,y,z,.35,.35,.35,{mat:'neon',color:col,shape:'sphere',nocol:true});return L}};

GAMES.manoir=makeHorror({name:'Manoir des Farces',icon:'🤡',colors:['#3a1f4a','#ff4fa3'],music:'manoir',badges:['S\'échapper : jusqu\'à +100 Blox'],
  desc:"Horreur drôle en équipe (1 à 8), environ 20 à 30 minutes : 8 fusibles, 5 clés de crypte, le Klaxon Géant à assembler, puis 90 secondes de survie avant de fuir… pendant que toute la famille Bobo vous course en klaxonnant. Serre, labyrinthe, chapelle, crypte, peaux de banane et coussins péteurs inclus.",
  goal:'🔌 Fusibles',hint:'Fouillez le manoir ensemble · F : lancer une banane',itemIcon:'🔌',unlock:'⚡ Le courant revient ! La grille du jardin est ouverte !',
  monsterSound:v=>SFX.honk(v),caught:c=>{scMessage('🤡 PWEEET ! Bobo t\'a attrapé !',2.5);SFX.laugh()},
  drawItem:(L,p)=>{L.push({mesh:MESH.rbox,m:M.chain(M.T(...p),M.RY(time*2),M.S(.35,.6,.35)),mode:3,color:'#ffd23f',shin:200,emis:HDR?1.2:.4},{mesh:MESH.cyl,m:M.chain(M.T(p[0],p[1]+.38,p[2]),M.S(.2,.15,.2)),mode:3,color:'#9aa4b2',shin:120})},
  onUnlock:G=>{for(const b of G.gates){b.nocol=true;b.alpha=.12}for(const L of WORLD.lights)L.base=Math.max(L.base,1.6);refreshSolids()},
  exitGoal:'🚪 La grille est ouverte : FUYEZ !',exitHint:'Courez jusqu\'au portail au bout du jardin',
  stages:[{goal:'🔌 Fusibles',icon:'🔌',hint:'8 fusibles cachés dans le manoir · F : lancer une banane',msg:'⚡ Le courant revient ! La serre est ouverte…',done:G=>{for(const b of G.lock1){b.nocol=true;b.alpha=.12}for(const L of WORLD.lights)L.base=Math.max(L.base,1.3);refreshSolids()}},
    {goal:'🗝️ Clés de la crypte',icon:'🗝️',hint:'5 clés : serre, cave, labyrinthe du jardin, cuisine, bibliothèque',msg:'⛪ La crypte de la chapelle s\'ouvre…',spawn:[{name:'Bobo Géant',av:'clown',pos:[0,.2,28],speed:6.6,aggro:20,path:[[0,0,28],[-20,0,40],[20,0,40]]}],done:G=>{for(const b of G.lock2){b.nocol=true;b.alpha=.12}refreshSolids()},
      draw:(L,p)=>L.push({mesh:MESH.torus,m:M.chain(M.T(p[0],p[1]+.25,p[2]),M.RY(time*2),M.RX(Math.PI/2),M.S(.45,.45,.45)),mode:3,color:'#ffd23f',shin:200,emis:HDR?1:.4},{mesh:MESH.box,m:M.chain(M.T(p[0],p[1]-.2,p[2]),M.RY(time*2),M.S(.12,.7,.12)),mode:3,color:'#ffd23f',shin:200})},
    {goal:'📯 Pièces du Klaxon Géant',icon:'📯',hint:'Elles sont dans la crypte, la chapelle et la serre',msg:'📯 TUUUUT ! Le Klaxon Géant réveille tout le manoir…',spawn:[{name:'Mama Bobo',av:'clown',pos:[56,.2,24],speed:6.2,aggro:18}],
      draw:(L,p)=>L.push({mesh:MESH.cone,m:M.chain(M.T(...p),M.RY(time*2),M.RZ(Math.PI/2),M.S(.5,.8,.5)),mode:3,color:'#ff4fa3',shin:160,emis:HDR?1:.4})},
    {survive:90,goal:'⏳ Tenez bon :',hint:'Survivez pendant que le Klaxon force la grille du jardin !',msg:'⚡ La grille du jardin est ouverte : FUYEZ !',done:G=>{for(const b of G.gates){b.nocol=true;b.alpha=.12}refreshSolids();SFX.honk()}}],
  build(G,h){B(0,-.5,0,170,1,170,{mat:'terre',color:'#2d2a26'});G.start=[0,.3,58];B(0,.05,58,6,.1,6,{color:'#3d3a46',mat:'lisse'});
    // jardin + grille
    for(let i=0;i<30;i++){const a=i/30*Math.PI*2,r=70+rh(i)*8;if(Math.abs(Math.cos(a)*r)<14&&Math.sin(a)<0)continue;if(Math.abs(Math.cos(a)*r)>40&&Math.sin(a)*r>10&&Math.sin(a)*r<50)continue;LOG(Math.cos(a)*r,2,Math.sin(a)*r,4,.6,'y');B(Math.cos(a)*r,4.4,Math.sin(a)*r,2.6,2,2.6,{mat:'feuillage',color:'#2b3a2b'})}
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
    // extension : serre, labyrinthe, chapelle + crypte
    h.room(-58,30,18,14,5,'verre','#bfe9ff',[['e',0]]);G.lock1=[B(-49,2.2,30,.7,4.4,2.8,{mat:'metal',color:'#30343d'})];for(let i=0;i<8;i++)B(-64+i*1.7,.6,26+(i%2)*6,1,1.2,1,{mat:'feuillage',color:'#2f6a3a'});h.light(-58,4.2,30,'#b4ffb0',10,1.2,.5);
    for(const[x,z,w,d]of[[-14,24,12,1],[14,24,12,1],[-20,34,1,20],[20,34,1,20],[-8,30,1,8],[8,38,1,8],[0,44,16,1],[-4,34,8,1],[6,30,6,1],[-12,40,8,1]])B(x,1.4,z,w,2.8,d,{mat:'feuillage',color:'#1f3a22'});
    h.room(56,30,16,22,7,'pierre','#5d5f63',[['w',0]]);B(51,3.5,36,6,7,.5,{mat:'pierre',color:'#4d4f53'});B(61,3.5,36,6,7,.5,{mat:'pierre',color:'#4d4f53'});G.lock2=[B(56,2.5,36,4,5,.4,{mat:'metal',color:'#30343d'})];
    for(let i=0;i<4;i++)B(52+(i%2)*8,.6,22+Math.floor(i/2)*6,3,1.2,1,{mat:'bois',color:'#3a2618'});h.light(56,6,26,'#c8b0ff',12,1.2,.7);h.light(56,4,39,'#ff6060',8,1,.9);SIGN(48,4,30,'CHAPELLE',false,{size:40,yaw:Math.PI/2});
    [[-58,1,33],[-2,1,-60],[0,1,34],[38,1,6],[-38,1,-6]].forEach((p,i)=>G.items.push({id:'k'+i,name:'une clé de crypte',pos:p,taken:false,st:1}));
    [[52,1,39],[60,1,39],[56,1,40],[-63,1,25]].forEach((p,i)=>G.items.push({id:'h'+i,name:'une pièce du Klaxon',pos:p,taken:false,st:2}));
    G.mspawn=[{name:'Bobo le clown',av:'clown',pos:[0,.2,-30],speed:6.4,aggro:18,path:[[0,0,-30],[-30,0,-32],[-34,0,0],[0,0,0],[34,0,0],[30,0,-32]]},{name:'P\'tit Bobo',av:'clown',pos:[34,.2,0],speed:5.6,aggro:13}]}});

GAMES.camp=makeHorror({name:'Camp Nounours',icon:'🧸',colors:['#1d3b2a','#ff8a3d'],music:'camp',badges:['S\'échapper : jusqu\'à +100 Blox'],
  desc:"Une colonie de vacances, la nuit… les nounours géants se sont réveillés ! En équipe (environ 20 minutes) : réparez la radio (6 pièces), trouvez 5 bidons d'essence, survivez 100 secondes en attendant les secours, puis nagez jusqu'au bateau. Câlins mortels garantis.",
  goal:'📻 Pièces de radio',hint:'Explorez la forêt ensemble · F : lancer une banane',itemIcon:'📻',unlock:'📡 Les secours arrivent : nagez jusqu\'au bateau sur le lac !',
  monsterSound:v=>{tone('sine',140,.5,.1*v,{f2:90,vib:[5,20]})},caught:c=>{scMessage('🧸 CÂLIN GÉANT ! Tu es tout écrasé…',2.5);SFX.laugh()},
  drawItem:(L,p)=>{L.push({mesh:MESH.rbox,m:M.chain(M.T(...p),M.RY(time*2),M.S(.6,.4,.3)),mode:3,color:'#3d8bff',shin:120,emis:HDR?.8:.3},{mesh:MESH.cyl,m:M.chain(M.T(p[0]+.2,p[1]+.45,p[2]),M.S(.05,.5,.05)),mode:3,color:'#d8dee6',shin:200})},
  onUnlock:G=>{G.boat.color='#e5484d';G.boat.mat='planches';const L=WORLD.lights.find(l=>l.boat);if(L)L.base=3},
  exitGoal:'🚤 Nagez jusqu\'au bateau !',exitHint:'Le bateau rouge vous attend au milieu du lac',
  stages:[{goal:'📻 Pièces de radio',icon:'📻',hint:'6 pièces dans la forêt · F : lancer une banane',msg:'📡 La radio marche ! Les secours demandent de l\'essence pour le bateau.'},
    {goal:'⛽ Bidons d\'essence',icon:'⛽',hint:'5 bidons : hangar à bateaux, cabane du bûcheron, cabanes, réfectoire, tour de guet',msg:'🔥 Le moteur est plein ! Vous lancez une fusée de détresse…',spawn:[{name:'Papa Nounours',av:'nounours',pos:[0,.2,-40],speed:6.4,aggro:22,path:[[0,0,-40],[50,0,-40],[0,0,10],[-50,0,-30]]}],
      draw:(L,p)=>L.push({mesh:MESH.rbox,m:M.chain(M.T(...p),M.RY(time*2),M.S(.5,.7,.3)),mode:3,color:'#e5484d',shin:120,emis:HDR?.8:.3},{mesh:MESH.cyl,m:M.chain(M.T(p[0],p[1]+.45,p[2]),M.S(.15,.15,.15)),mode:3,color:'#ffd23f'})},
    {survive:100,goal:'⏳ Les secours arrivent dans',hint:'Restez en vie ! Les nounours sont déchaînés',msg:'🚤 Les secours sont là : nagez jusqu\'au bateau !',spawn:[{name:'Nounours Furax',av:'nounours',pos:[-40,.2,40],speed:6.8,aggro:16}],done:G=>{G.boat.color='#e5484d';G.boat.mat='planches';const L=WORLD.lights.find(l=>l.boat);if(L)L.base=3}}],
  build(G,h){B(0,-.5,20,190,1,150,{mat:'herbe',color:'#24361f'});B(-67.5,-.5,-75,55,1,40,{mat:'herbe',color:'#24361f'});B(67.5,-.5,-75,55,1,40,{mat:'herbe',color:'#24361f'});B(0,-3.6,-75,80,1,40,{mat:'sable'});G.start=[0,.3,30];
    // camp : cabanes, feu de camp, réfectoire
    for(const[x,z]of[[-14,20],[14,20],[-14,36],[14,36]])h.room(x,z,8,8,4,'planches','#5a3a24',[[x<0?'e':'w',0]]);h.room(0,52,22,12,5,'planches','#5a3a24',[['s',0]]);
    B(0,.4,28,2.4,.8,2.4,{mat:'pierre'});const fire={pos:[0,1.4,28],size:[1,1,1],fx:'feu',color:'#ff8a3d',obj:{},on:true,acc:0};(WORLD.emitters=WORLD.emitters||[]).push(fire);h.light(0,2,28,'#ff9a3d',14,2.6,.25);
    SIGN(0,3,22,'CAMP NOUNOURS\nTrouvez les 6 pièces de radio',true,{size:36});
    // forêt dense
    for(let i=0;i<120;i++){const a=rh(i*3)*Math.PI*2,r=26+rh(i*7)*62,x=Math.cos(a)*r,z=Math.sin(a)*r-10;if(z<-50&&Math.abs(x)<46)continue;if(Math.abs(x)<26&&z>12&&z<62)continue;if(Math.hypot(x-55,z+45)<10||Math.hypot(x+65,z-10)<9||Math.hypot(x+30,z-30)<11||Math.hypot(x-46,z+22)<6||Math.hypot(x+48,z+20)<8)continue;LOG(x,2.4,z,4.8,.7,'y');B(x,5.4,z,3.4,2.6,3.4,{mat:'feuillage',color:'#1f3320'});B(x,7.2,z,2,1.6,2,{mat:'feuillage',color:'#1f3320'})}
    // ruines, tour de guet, grotte
    h.room(-48,-20,10,10,4,'pierre','#5d5f63',[['e',0]]);for(const[x,z]of[[44,-24],[48,-24],[44,-20],[48,-20]])LOG(x,4,z,8,.6,'y');B(46,8.2,-22,6,.4,6,{mat:'planches'});B(46,4.2,-19,1.6,8.4,.25,{mat:'bois',mode:4,climb:'wood'});
    B(-30,4,30,14,8,10,{mat:'basalte'});B(-30,1.6,24.9,4,3.2,.4,{mat:'lisse',color:'#0a0a0c',nocol:1});
    // lac + bateau (on nage !)
    waters.push({pos:[0,-1.6,-75],size:[80,3,40],swimAt:.55,color:'#1c4a6a'});B(0,-.1,-57,6,.4,6,{mat:'planches'});
    G.boat=B(0,.2,-88,5,.8,9,{mat:'bois',color:'#6d4a2a'});const bl={pos:[0,3,-88],color:'#ff3030',range:18,bright:0,base:0,boat:true};WORLD.lights.push(bl);G.door={pos:[0,1.4,-88],size:[5,2.4,9]};G.boat.color='#6d4a2a';
    const spots=[[-48,1,-20],[46,9.6,-22],[-30,1.2,22],[60,1,20],[-62,1,-40],[0,1.2,54]];spots.forEach((p,i)=>G.items.push({id:'r'+i,name:'une pièce de radio',pos:p,taken:false}));
    G.bananas=[{pos:[6,1,52]},{pos:[-14,1,20]}];G.cushions=[{pos:[14,.3,36],size:[2,.6,2]},{pos:[-14,.3,36],size:[2,.6,2]},{pos:[0,.3,48],size:[2,.6,2]}];
    G.scares=[{pos:[-30,2,26],size:[4,4,3]},{pos:[46,8,-22],size:[3,3,3],kind:'poulet'},{pos:[-48,2,-20],size:[4,4,4],kind:'poulet'}];
    // extension : hangar à bateaux, cabane du bûcheron
    h.room(55,-45,12,10,4,'planches','#4a3426',[['w',0]]);h.room(-65,10,10,10,4,'planches','#5a3a24',[['e',0]]);h.light(55,3.4,-45,'#ffb35a',8,1.2,.6);h.light(-65,3.4,10,'#ffb35a',8,1.2,.6);
    [[56,1,-46],[-66,1,11],[14,1,36],[3,1.2,50],[46,9.6,-24]].forEach((p,i)=>G.items.push({id:'e'+i,name:'un bidon d\'essence',pos:p,taken:false,st:1}));
    G.mspawn=[{name:'Gros Nounours',av:'nounours',pos:[30,.2,-10],speed:6,aggro:20,path:[[30,0,-10],[-30,0,-10],[-40,0,30],[40,0,30]]},{name:'Nounours Câlin',av:'nounours',pos:[-40,.2,-30],speed:5.4,aggro:15},{name:'Mini Nounours',av:'nounours',pos:[50,.2,30],speed:7,aggro:11}]}});
