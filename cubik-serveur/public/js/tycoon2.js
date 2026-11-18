"use strict";
/* ============================================================================
   USINE À BLOCS TYCOON 2.0 — 6 bases, 3 étages de production (18 droppers,
   9 améliorateurs), ascenseurs, quêtes, météores de cash, heure dorée,
   gains hors-ligne, renaissances. Multijoueur : on voit les usines des autres.
   ============================================================================ */
function fmtCash(n){n=Math.floor(n||0);const u=[[1e15,' Qa'],[1e12,' T'],[1e9,' Md'],[1e6,' M'],[1e4,' k']];for(const[v,s]of u)if(n>=v)return(n/v).toFixed(n/v<100?2:1)+s+' $';return n.toLocaleString('fr-FR')+' $'}
const T2_PLOTS=[[-52,-36,1],[0,-36,1],[52,-36,1],[-52,52,-1],[0,52,-1],[52,52,-1]];
const T2_DX=[-14,-10,-6,-2,2,6],T2_UX=[7.6,9.6,11.6],T2_UM=[1.5,2,2.5],T2_LCOL=['#3d7eff','#b46bff','#ffd23f'];
const T2_DV=[[1,3,8,20,45,100],[300,700,1600,3600,8e3,1.8e4],[6e4,1.4e5,3.2e5,7e5,1.6e6,3.5e6]];
const T2_OCOL=[['#9aa4b2','#4ea8ff','#2fbf71','#b46bff','#ff8a3d','#ffd23f'],['#39c5bb','#ff4fa3','#7a5cff','#e5484d','#39ffb6','#fff1a8'],['#c0f0ff','#ffb3f0','#b9ff7a','#ff6b6b','#8af7ff','#ffffff']];
const T2_ITEMS=[],T2_IT={};
(()=>{const add=it=>{T2_ITEMS.push(it);T2_IT[it.id]=it};
  for(let k=0;k<3;k++){const row=k===0?4:-.5;
    T2_DV[k].forEach((v,i)=>add({id:`d${k}${i}`,kind:'drop',k,i,name:`Dropper ${k+1}-${i+1}`,price:k===0&&i===0?0:Math.round(v*32*(1+i*.15)),req:i?`d${k}${i-1}`:(k?'f'+k:null),pad:[-15+i*3,row],floor:k}));
    T2_UX.forEach((x,j)=>add({id:`u${k}${j}`,kind:'up',k,j,name:`Améliorateur ×${T2_UM[j]} (ét.${k+1})`,price:Math.round(T2_DV[k][j*2+1]*[90,160,260][j]),req:`d${k}${j*2+1}`,pad:[3+j*3,row],floor:k}));
    add({id:'s'+k,kind:'spd',k,name:`Tapis turbo (ét.${k+1})`,price:Math.round(T2_DV[k][2]*70),req:`d${k}2`,pad:[12,row],floor:k})}
  const U=(id,name,price,req,pad,o={})=>add({id,kind:'util',name,price,req,pad,floor:0,...o});
  U('walls','Murs',150,'d01',[-15,9]);U('lamp','Lampadaires néon',450,'walls',[-12,9]);U('marble','Sol en marbre',1200,'walls',[-9,9]);U('garden','Jardin fleuri',3000,'marble',[-6,9]);
  U('auto','Collecte automatique',9000,'d04',[-3,9]);U('fount','Fontaine',15000,'garden',[0,9]);U('f1','ÉTAGE 2 (ascenseur)',45000,'d05',[3,9],{big:1});U('coffre','Coffre hors-ligne',1.2e5,'f1',[6,9]);
  U('aimant','Aimant à météores',4e5,'f1',[9,9]);U('neon','Enseigne géante',1.5e6,'f1',[12,9]);U('f2','ÉTAGE 3 (toit)',8e6,'d15',[-15,12],{big:1});U('robot','Robots ouvriers ×1.5',3e7,'f2',[-12,12]);
  U('statue','Statue en or',2e8,'f2',[-9,12]);U('fusee','Fusée de luxe',1.5e9,'statue',[-6,12]);U('rebirth','RENAISSANCE',3e7,'d22',[-3,12],{rebirth:true})})();
const T2_QUESTS=[['Gagne 500 $',s=>s.earned>=500,100,5],['Possède 4 droppers',(s,G)=>G.mine&&[...G.mine.owned].filter(i=>i[0]==='d').length>=4,400,5],['Achète les murs et le sol en marbre',(s,G)=>G.mine?.owned.has('marble'),1000,10],
  ['Gagne 25 k $',s=>s.earned>=25e3,5e3,10],['Débloque l\'étage 2',(s,G)=>G.mine?.owned.has('f1'),2e4,20],['Gagne 1 M $',s=>s.earned>=1e6,2e5,20],['Attrape 5 météores',s=>(s.met||0)>=5,5e5,25],
  ['Débloque l\'étage 3',(s,G)=>G.mine?.owned.has('f2'),2e6,30],['Gagne 100 M $',s=>s.earned>=1e8,2e7,40],['Fais une renaissance',s=>s.reb>=1,0,100],['Gagne 1 Md $',s=>s.earned>=1e9,2e8,50],
  ['3 renaissances',s=>s.reb>=3,0,150],['Statue en or',(s,G)=>G.mine?.owned.has('statue'),5e8,60],['Fusée de luxe',(s,G)=>G.mine?.owned.has('fusee'),0,120],['10 renaissances',s=>s.reb>=10,0,500]];
GAMES.tycoon.maxPlayers=6;
Object.assign(GAMES.tycoon,{name:'Usine à Blocs Tycoon',
  desc:"Version 2.0 · jusqu'à 6 joueurs : construis une usine sur 3 étages (18 droppers, améliorateurs, tapis turbo), utilise l'ascenseur, attrape les météores de cash, profite de l'heure dorée, termine 15 quêtes et enchaîne les renaissances. Ton usine continue de produire quand tu n'es pas là (coffre).",
  badges:['15 quêtes avec Blox','Renaissance : +100 Blox et plus','Gains hors-ligne'],
  rebirthPrice(){return 3e7*Math.pow(3,this.sv.reb||0)},
  build(sv){const G=this;G.sv=sv;sv.cash=sv.cash??0;sv.owned=(sv.owned||[]).filter(id=>T2_IT[id]);sv.reb=sv.reb||0;sv.pending=sv.pending||0;sv.earned=sv.earned||0;sv.q=sv.q||0;
    G.pop=[];G.mine=null;G.assignT=1.2;G.met=null;G.metT=rnd(50,80);G.gold=0;G.goldT=rnd(120,200);G.rateT=0;
    B(0,-.5,8,180,1,170,{mat:'herbe'});B(0,.06,8,30,.12,36,{mat:'pierre'});SPAWN={pos:[0,.2,8],size:[6,.2,6]};B(0,.15,8,6,.3,6,{color:'#3d7eff',mat:'lisse'});
    SIGN(0,4.6,18,'USINE À BLOCS\nTYCOON 2.0',true,{size:46});for(const[x,z]of[[-80,8],[80,8],[-26,8],[26,8],[-26,-6],[26,22]])TREE(x,z,3.4,3.2);
    for(let i=0;i<8;i++){const a=i/8*Math.PI*2;B(Math.cos(a)*9,.5,8+Math.sin(a)*9,1,1,1,{mat:'neon',color:T2_LCOL[i%3],nocol:1})}
    G.plots=T2_PLOTS.map((p,i)=>({i,ox:p[0],oz:p[1],s:p[2],blocks:[],signs:[],waters:[],owned:new Set(),ores:[],dT:{},pads:[],owner:null,fount:null,conv:[],lifts:[]}));for(const P of G.plots)t2Base(P);
    // gains hors-ligne
    if(sv.owned.includes('coffre')&&sv.lastT){const away=Math.min(4*3600,(Date.now()-sv.lastT)/1000);const g=Math.round(away*(sv.rate||0)*.35);if(g>0&&away>60){sv.cash+=g;sv.earned+=g;setTimeout(()=>{toast(`💰 Pendant ton absence ton usine a produit ${fmtCash(g)} !`);SFX.kaching()},2500)}}},
  spawn(){const P=this.mine;return P?tyW(P,-4,.3,17):[0,.35,8]},
  hud(el){el.innerHTML=`<div class="ghud left"><div class="gtitle">💰 <span id="tyC">0 $</span></div><div class="gsub" id="tyR"></div><div class="gsub" id="tyQ" style="color:#ffd23f"></div></div><div class="ghud center" id="tyE" style="display:none"><div class="gtitle" id="tyEt"></div></div>`},
  mpState(){const P=this.mine;return P?{plot:P.i,ty:[...P.owned].slice(0,60)}:{plot:-1}},
  onRemote(c,pr){const G=this,i=+pr.plot;if(!(i>=0&&i<G.plots.length)){if(c.plot!=null)t2Release(G,c);return}
    if(c.plot!==i){if(c.plot!=null)t2Release(G,c);const P=G.plots[i];if(P.owner&&P.owner!==c&&P.owner!==pl)return;
      if(P===G.mine){if(String(c.name)<String(pl.name)){sys('Base déjà prise : on t\'en donne une autre.');t2ReleaseMine(G);P.owner=c;c.plot=i;t2Base(P);G.assignT=.1}return}P.owner=c;c.plot=i;t2Base(P)}
    const P=G.plots[i];for(const id of Array.isArray(pr.ty)?pr.ty:[])if(T2_IT[id]&&!P.owned.has(id))t2Construct(P,id,false)},
  onRemoteLeave(c){if(c.plot!=null)t2Release(this,c)},
  mult(){const sv=this.sv;return(1+sv.reb*.75)*(hasPass('tycoon','x2')?2:1)*(this.gold>0?2:1)*(this.mine?.owned.has('robot')?1.5:1)},
  rebirth(){const G=this,sv=G.sv;sv.reb++;giveBlox(100+50*(sv.reb-1),'Renaissance !');sv.cash=0;sv.pending=0;sv.owned=[];SFX.levelUp();unlockBadge('tycoon');confetti(V.add(pl.pos,[0,2,0]));
    scMessage(`🔁 Renaissance ${sv.reb} ! Multiplicateur ×${(1+sv.reb*.75).toFixed(2)}`,4);const P=G.mine;t2Base(P);t2Construct(P,'d00',true);sv.owned.push('d00');t2Pads(G);pl.pos=tyW(P,-4,.3,17);pl.vel=[0,0,0];markDirty()},
  update(dt,t){const G=this,sv=G.sv,mult=G.mult();
    if(!G.mine){G.assignT-=dt;if(G.assignT<=0)t2Assign(G)}
    for(const P of G.plots){if(!P.owner)continue;const own=P===G.mine;
      for(let k=0;k<3;k++)if(P.conv[k])P.conv[k].speed=P.owned.has('s'+k)?6:3;
      for(const id in P.dT){const it=T2_IT[id];P.dT[id]-=dt;if(P.dT[id]<=0){P.dT[id]=1.6;if(P.ores.length<260)P.ores.push({k:it.k,x:T2_DX[it.i],y:it.k*6+3.1,vy:0,val:T2_DV[it.k][it.i],col:T2_OCOL[it.k][it.i],glow:it.i>=4,up:0,rot:Math.random()*6})}}
      for(let i=P.ores.length-1;i>=0;i--){const o=P.ores[i],y0=o.k*6+1.22,sp=P.owned.has('s'+o.k)?6:3;if(o.y>y0){o.vy-=25*dt;o.y=Math.max(y0,o.y+o.vy*dt)}else{o.x+=sp*dt;o.rot+=dt*2}
        for(let j=0;j<3;j++)if(!(o.up>>j&1)&&o.x>T2_UX[j]&&P.owned.has(`u${o.k}${j}`)){o.up|=1<<j;o.val*=T2_UM[j];if(Math.random()<.5)sparks(tyW(P,o.x,o.y,-8),[.5+j,3-j,1.6],4,.4)}
        if(o.x>12.8){P.ores.splice(i,1);if(own){const v=o.val*mult;sv.pending+=v;if(P.owned.has('auto')){sv.cash+=sv.pending;sv.earned+=sv.pending;sv.pending=0}}if(Math.random()<.4)emit({pos:tyW(P,12.8,o.k*6+1.6,-8),vel:[0,2,0],life:.5,size:.3,size1:0,col:[4,1.5,.3],add:1,shape:0})}}
      if(P.fount&&Math.random()<dt*20)emit({pos:[...P.fount],vel:[rnd(-1.2,1.2),rnd(4,6),rnd(-1.2,1.2)],life:rnd(.6,1),size:.12,size1:.05,col:[.8,.92,1],alpha:.8,grav:12})}
    const P=G.mine;
    if(P){const g=pl.ground;
      if(sv.pending>0&&g===P.collector){sv.cash+=sv.pending;sv.earned+=sv.pending;floatText(V.add(pl.pos,[0,3,0]),'+'+fmtCash(sv.pending),'#7dffb0');sv.pending=0;SFX.kaching();sparks(V.add(P.collector.pos,[0,.3,0]),[1,3,1.4],14);markDirty()}
      for(const L of P.lifts)if(g===L.b&&!L.cd){const fl=[0,...[1,2].filter(k=>P.owned.has('f'+k))];const nx=fl[(fl.indexOf(L.k)+1)%fl.length];pl.pos=tyW(P,-18,nx*6+.4,-4);pl.vel=[0,0,0];cam.target=V.add(pl.pos,[0,2,0]);SFX.whoosh?.();toast(nx?`🛗 Étage ${nx+1}`:'🛗 Rez-de-chaussée');for(const l of P.lifts)l.cd=1.2}
      for(const L of P.lifts)if(L.cd)L.cd=Math.max(0,L.cd-dt);
      for(const p of P.pads){if(p.hidden)continue;const on=Math.abs(pl.pos[0]-p.pos[0])<1.3&&Math.abs(pl.pos[2]-p.pos[2])<1.3&&Math.abs(pl.pos[1]-p.pos[1])<.7;
        if(on&&!p.touch){const it=p.tyItem,price=it.rebirth?G.rebirthPrice():it.price;if(sv.cash>=price){if(it.rebirth){G.rebirth();return}sv.cash-=price;sv.owned.push(it.id);t2Construct(P,it.id,false);SFX.buy();toast(`${it.name} acheté !`);sparks(V.add(p.pos,[0,.5,0]),[1,3,1.5],24);if(price>=5000)giveBlox(Math.min(60,Math.round(Math.log10(price)*3)),'Grand achat');markDirty();t2Pads(G)}
          else{SFX.error();floatText(V.add(pl.pos,[0,3,0]),'Il manque '+fmtCash(price-sv.cash),'#ff8a8a')}}p.touch=on}
      G.padT=(G.padT||0)-dt;if(G.padT<0){G.padT=.4;t2Pads(G);setSign(P.cSign,`En attente\n${fmtCash(sv.pending)}`)}
      // quêtes
      const q=T2_QUESTS[sv.q];if(q&&q[1](sv,G)){sv.q++;if(q[2])sv.cash+=q[2];giveBlox(q[3],'Quête Tycoon');SFX.quest();scMessage(`✅ Quête : ${q[0]}${q[2]?' · +'+fmtCash(q[2]):''}`,3);markDirty()}
      // météores
      G.metT-=dt;if(G.metT<=0&&!G.met){G.metT=rnd(70,110);const lx=rnd(-14,14),lz=rnd(6,16);G.met={x:lx,z:lz,y:45,landed:false,life:30};sys('☄️ Un météore de cash tombe sur ta base ! Va le toucher !');SFX.thunder?.()}
      if(G.met){const m=G.met,w=tyW(P,m.x,m.y,m.z);if(!m.landed){m.y-=dt*30;emit({pos:w,vel:[rnd(-1,1),3,rnd(-1,1)],life:.8,size:.8,size1:.1,col:[4,2.2,.4],add:1});if(m.y<=1){m.y=1;m.landed=true;shake=.5;sparks(w,[4,2,.5],40);SFX.explode?.()}}
        else{m.life-=dt;if(Math.random()<dt*15)emit({pos:V.add(w,[rnd(-.6,.6),.5,rnd(-.6,.6)]),vel:[0,2.5,0],life:.7,size:.25,size1:0,col:[3,2.4,.4],add:1});
          if(V.len(V.sub(pl.pos,[w[0],pl.pos[1],w[2]]))<2.2&&Math.abs(pl.pos[1]-w[1])<3){const v=Math.max(200,(sv.rate||1)*40)*(P.owned.has('aimant')?2.5:1);sv.cash+=v;sv.earned+=v;sv.met=(sv.met||0)+1;G.met=null;SFX.kaching();confetti(w);floatText(V.add(pl.pos,[0,3,0]),'☄️ +'+fmtCash(v),'#ffd23f');markDirty()}
          else if(m.life<=0)G.met=null}}
      // heure dorée
      G.goldT-=dt;if(G.goldT<=0){G.goldT=rnd(200,320);G.gold=45;SFX.levelUp();scMessage('🌟 HEURE DORÉE : tout rapporte ×2 pendant 45 s !',3)}if(G.gold>0)G.gold-=dt;
      // revenu estimé
      G.rateT-=dt;if(G.rateT<=0){G.rateT=1;let r=0;for(const id of P.owned){const it=T2_IT[id];if(it?.kind!=='drop')continue;let v=T2_DV[it.k][it.i]/1.6;for(let j=0;j<3;j++)if(P.owned.has(`u${it.k}${j}`))v*=T2_UM[j];r+=v}sv.rate=r*G.mult()/(G.gold>0?2:1);sv.lastT=Date.now()}}
    for(let i=G.pop.length-1;i>=0;i--){const b=G.pop[i];b.pop=Math.min(1,b.pop+dt*2.6);if(b.pop>=1){G.pop.splice(i,1);delete b.pop}}
    const q=T2_QUESTS[sv.q];$('tyC').textContent=fmtCash(sv.cash);
    $('tyR').textContent=(P?`Base ${P.i+1} · `:'Choix d\'une base… · ')+`≈ ${fmtCash(sv.rate||0)}/s · Renaissances ${sv.reb} (×${(1+sv.reb*.75).toFixed(2)})${hasPass('tycoon','x2')?' · 🎟️ ×2':''}`;
    $('tyQ').textContent=q?`📜 Quête ${sv.q+1}/${T2_QUESTS.length} : ${q[0]}`:'🏆 Toutes les quêtes terminées !';
    const e=$('tyE');if(G.gold>0||G.met){e.style.display='';$('tyEt').textContent=G.gold>0?`🌟 Heure dorée ×2 · ${Math.ceil(G.gold)} s`:'☄️ Météore sur ta base !'}else e.style.display='none';
    if(Math.random()<dt*.3)markDirty()},
  extraDraw(L){for(const P of this.plots||[])for(const o of P.ores){if(!inView(tyW(P,o.x,o.y,-8),2))continue;L.push({mesh:MESH.cube,m:M.chain(M.T(...tyW(P,o.x,o.y,-8)),M.RY(o.rot),M.S(.45,.45,.45)),mode:3,color:o.up&4?'#ff6fd0':o.up&2?'#ffd23f':o.up&1?'#39ffb6':o.col,shin:o.glow?160:60,emis:o.glow?(HDR?1.6:.4):0})}
    const G=this;if(G.met&&G.mine){const w=tyW(G.mine,G.met.x,G.met.y,G.met.z);L.push({mesh:MESH.sphere,m:M.chain(M.T(...w),M.RY(time*3),M.S(1.6,1.6,1.6)),mode:3,color:'#ffb12a',shin:200,emis:HDR?2.2:.6});glow(w,[3,2,.4],3)}}});
function t2Base(P){tyClear(P);P.conv=[];P.lifts=[];const G=GAMES.tycoon,mine=P===G.mine;
  P.floor=tyB(P,0,.05,0,40,.1,40,{mat:'beton'});tyB(P,-4,.1,17,4,.2,4,{color:mine?'#3d7eff':P.owner?'#9aa4b2':'#2fbf71',mat:'lisse'});
  t2Line(P,0);P.collector=tyB(P,15,.15,-3.5,4,.3,3,{mat:'lisse',color:'#2fbf71'});P.cSign=tySign(P,15,3.4,-2,mine?'En attente\n0 $':'Collecteur',{size:44,bg1:'#e9fff1',bg2:'#c7f5d8',border:'#1d8a50'});
  t2Lift(P,0);tyB(P,4,1.4,20,.25,2.8,.25,{mat:'bois'});tySign(P,4,3.2,20,P.owner?(mine?'TA BASE':'Base de\n'+filterText(P.owner.name)):'BASE LIBRE',{size:40,bg1:mine?'#e3efff':'#fffaf0',border:mine?'#3d7eff':'#6d4a2a'});
  if(mine)for(const it of T2_ITEMS){const y=it.floor*6+.12;const p=tyB(P,it.pad[0],y,it.pad[1],2.2,.24,2.2,{mat:'lisse',color:'#2fbf71',tyItem:it,nocol:1});p.hidden=true;p.sign=tySign(P,it.pad[0],y+2.3,it.pad[1],'',{w:384,h:150,size:32,lh:38,bg1:'#1f232b',bg2:'#13161c',border:it.big||it.rebirth?'#ffd23f':'#2fbf71',ink:'#ffffff'});p.sign.hidden=true;P.pads.push(p)}
  finalizeWorld()}
function t2Line(P,k){const y=k*6;P.conv[k]=tyB(P,-2,y+.5,-8,30,1,2.4,{kind:'conv',dir:[1,0,0],speed:0,mode:6,color:'#30343d'});
  tyB(P,15,y+1.6,-8,3.6,3.2,3.6,{mat:'basalte'});tyB(P,15,y+3.3,-8,3.8,.3,3.8,{mat:'metal'});tyB(P,13.1,y+1.6,-8,.2,1.4,2,{kind:'lava'});
  tyB(P,-17.5,y+1,-8,1,2,3,{mat:'metal',color:T2_LCOL[k]});tySign(P,-17,y+3.2,-5.8,`LIGNE ${k+1}`,{size:40,bg1:'#1f232b',ink:'#ffffff',border:T2_LCOL[k]})}
function t2Lift(P,k){const y=k*6;const b=tyB(P,-18,y+.15,-4,2.6,.3,2.6,{mat:'neon',color:'#39c5bb'});tyB(P,-19.4,y+2,-4,.2,4,2.6,{mat:'verre',color:'#bfe9ff',nocol:1});P.lifts.push({b,k,cd:0});tySign(P,-18,y+3.4,-2.6,'🛗 ASCENSEUR',{size:36})}
function t2Construct(P,id,instant){if(P.owned.has(id))return;P.owned.add(id);const G=GAMES.tycoon,it=T2_IT[id];if(!it){return}const b_=(...a)=>{const b=tyB(P,...a);if(!instant){b.pop=0;G.pop.push(b)}return b};
  if(it.kind==='drop'){const x=T2_DX[it.i],y=it.k*6;b_(x,y+4.2,-8,1.6,1.6,1.6,{mat:it.i>=4?'or':'metal',color:it.i>=4?undefined:T2_LCOL[it.k]});b_(x,y+3.2,-8,.7,.5,.7,{mat:'rouille'});if(it.i>=4)b_(x,y+5.1,-8,.4,.4,.4,{mat:'neon',color:T2_OCOL[it.k][it.i],nocol:1});P.dT[id]=rnd(0,1.6)}
  else if(it.kind==='up'){const x=T2_UX[it.j],y=it.k*6,c=['#39ffb6','#ffd23f','#ff4fa3'][it.j];b_(x,y+2,-9.4,.4,3,.4,{mat:'neon',color:c});b_(x,y+2,-6.6,.4,3,.4,{mat:'neon',color:c});b_(x,y+3.6,-8,.4,.4,3.2,{mat:'neon',color:c,nocol:1})}
  else if(it.kind==='spd'){const y=it.k*6;for(let i=0;i<5;i++)b_(-14+i*6,y+1.05,-8,.6,.08,2.2,{mat:'neon',color:'#22e3ff',nocol:1})}
  else if(id==='walls'){for(const[x,z,sx,sz]of[[0,-20,40,.6],[-20,0,.6,40],[20,-6,.6,28]])b_(x,2.5,z,sx,5,sz,{mat:'brique'});b_(20,2.5,16,.6,5,8,{mat:'brique'})}
  else if(id==='marble')P.floor.mat='marbre';
  else if(id==='lamp')for(const[x,z]of[[-18,-18],[18,-18],[-18,18],[18,18],[0,18]]){b_(x,2.5,z,.3,5,.3,{mat:'metal'});b_(x,5.2,z,.8,.5,.8,{mat:'neon',color:'#ffe6a8'})}
  else if(id==='garden'){for(const[x,z]of[[-16,15],[-12,17],[16,12],[17,5]]){b_(x,1.3,z,.8,2.6,.8,{mat:'buche',shape:'log',axis:'y',len:2.6,d:.8});b_(x,3.6,z,2.4,2,2.4,{mat:'feuillage'})}
    for(let i=0;i<14;i++)b_(-17+rh(i+P.i*20)*10,.15,13+rh(i*3+P.i)*5,.25,.3,.25,{color:pick(['#ff4fa3','#ffd23f','#ffffff','#b46bff']),mat:'lisse',nocol:1})}
  else if(id==='fount'){b_(11,.35,13,5,.7,.4,{mat:'marbre'});b_(11,.35,17,5,.7,.4,{mat:'marbre'});b_(8.7,.35,15,.4,.7,4,{mat:'marbre'});b_(13.3,.35,15,.4,.7,4,{mat:'marbre'});b_(11,1.2,15,.6,2.4,.6,{mat:'marbre'});
    const w={pos:tyW(P,11,.35,15),size:[4.2,.6,3.6]};waters.push(w);P.waters.push(w);P.fount=tyW(P,11,2.5,15)}
  else if(id==='f1'||id==='f2'){const k=+id[1],y=k*6;b_(0,y-.2,-9,40,.4,22,{mat:k===2?'metal':'planches'});b_(0,y+.6,2,40,1.2,.25,{mat:'verre',color:'#bfe9ff'});t2Line(P,k);t2Lift(P,k);
    if(!instant)for(const p of P.pads)if(p.tyItem.floor===k){}}
  else if(id==='coffre'){b_(-16,.6,1,1.8,1.2,1.2,{mat:'bois',color:'#8d5a2b'});b_(-16,1.3,1,1.9,.3,1.3,{mat:'or'})}
  else if(id==='aimant'){b_(16,3,12,.5,6,.5,{mat:'metal'});b_(16,6.4,12,2,1,.6,{mat:'neon',color:'#e5484d'})}
  else if(id==='neon'){b_(0,9,19.5,14,3,.3,{mat:'neon',color:'#ff4fa3',nocol:1});tySign(P,0,9,19.2,'USINE DE '+(P.owner?filterText(P.owner.name).toUpperCase():'?'),{size:44,yaw:Math.PI})}
  else if(id==='robot'){for(let i=0;i<4;i++){b_(-12+i*7,.9,-4.5,.9,1.4,.9,{mat:'metal',color:'#9aa4b2'});b_(-12+i*7,1.9,-4.5,.7,.6,.7,{mat:'neon',color:'#39ffb6',nocol:1})}}
  else if(id==='statue'){b_(-10,13.4,-12,2.4,2.4,2.4,{mat:'or'});b_(-10,15.6,-12,1.4,2,1.4,{mat:'or'});b_(-10,17,-12,1.1,.9,1.1,{mat:'or'})}
  else if(id==='fusee'){b_(10,16,-14,2.4,8,2.4,{mat:'metal',color:'#f2f2f2',shape:'cyl'});b_(10,21,-14,2.4,2,2.4,{mat:'lisse',color:'#e5484d',shape:'sphere'});for(const[dx,dz]of[[1.4,0],[-1.4,0],[0,1.4]])b_(10+dx,13,-14+dz,.4,2.4,.8,{mat:'lisse',color:'#e5484d'})}
  finalizeWorld()}
function t2Pads(G){const P=G.mine;if(!P)return;for(const p of P.pads){const it=p.tyItem,owned=P.owned.has(it.id),avail=!owned&&(!it.req||P.owned.has(it.req))&&(it.floor===0||P.owned.has('f'+it.floor));
  p.hidden=p.sign.hidden=!avail;if(avail){const price=it.rebirth?G.rebirthPrice():it.price,ok=G.sv.cash>=price;p.color=it.rebirth||it.big?'#ffd23f':(ok?'#2fbf71':'#e5484d');setSign(p.sign,`${it.name}\n${price?fmtCash(price):'GRATUIT'}`)}}}
function t2Assign(G){const taken=new Set([...MP.remote.values()].map(c=>c.plot).filter(x=>x!=null));const i=G.plots.findIndex(P=>!taken.has(P.i)&&!P.owner);
  if(i<0){G.assignT=3;sys('Toutes les bases sont prises : attends qu\'une base se libère ou choisis un autre serveur.');return}
  const P=G.plots[i];G.mine=P;P.owner=pl;t2Base(P);if(!G.sv.owned.includes('d00'))G.sv.owned.unshift('d00');
  const ord=[...G.sv.owned].sort((a,b)=>(a[0]==='f'?0:1)-(b[0]==='f'?0:1));for(const id of ord)t2Construct(P,id,true);t2Pads(G);pl.pos=tyW(P,-4,.3,17);pl.vel=[0,0,0];cam.target=V.add(pl.pos,[0,2,0]);
  sys(`🏭 Tu as la base ${i+1} ! Marche sur les boutons pour acheter · ascenseur à gauche pour les étages.`);SFX.checkpoint()}
function t2ReleaseMine(G){const P=G.mine;if(!P)return;P.owner=null;G.mine=null;t2Base(P);G.assignT=.2}
function t2Release(G,c){const P=G.plots[c.plot];c.plot=null;if(P&&P.owner===c){P.owner=null;t2Base(P)}}
GAMES.tycoon.lbValue=function(c){return c.isPlayer?fmtCash(this.sv?.cash||0):''};
