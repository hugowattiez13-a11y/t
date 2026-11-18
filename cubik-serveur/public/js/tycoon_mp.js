"use strict";
/* ============================================================================
   TYCOON MULTIJOUEUR : 6 bases sur la carte, chaque joueur prend une base
   libre et voit les usines des autres se construire en direct.
   ============================================================================ */
const TY_PLOTS=[[-38,-28,1],[0,-28,1],[38,-28,1],[-38,44,-1],[0,44,-1],[38,44,-1]];
GAMES.tycoon.maxPlayers=6;
Object.assign(GAMES.tycoon,{
  desc:"Jusqu'à 6 joueurs : chacun prend une base, construit son usine (droppers, améliorateurs, étages…) et voit grandir celles des autres. Renaissance = multiplicateur + 100 Blox.",
  build(sv){const G=this;G.sv=sv;sv.cash=sv.cash??0;sv.owned=sv.owned||[];sv.reb=sv.reb||0;sv.pending=sv.pending||0;G.pop=[];G.mine=null;G.assignT=1.4;
    B(0,-.5,8,140,1,130,{mat:'herbe'});B(0,.06,8,24,.12,10,{mat:'pierre'});SPAWN={pos:[0,.2,8],size:[6,.2,6]};B(0,.15,8,6,.3,6,{color:'#3d7eff',mat:'lisse'});
    SIGN(0,4.2,14,'USINE À BLOCS\nTYCOON',true,{size:46});SIGN(-7,3,8,'Une base libre\nt\'attend !',true,{size:40,yaw:Math.PI/2});
    for(const[x,z]of[[-62,8],[62,8],[-20,8],[20,8],[0,-56],[0,74]])TREE(x,z,3.2,3);
    G.plots=TY_PLOTS.map((p,i)=>tyNewPlot(i,p));for(const P of G.plots)tyBase(P)},
  spawn(c){const P=this.mine;return P?tyW(P,-4,.25,16):[0,.35,8]},
  hud(el){el.innerHTML=`<div class="ghud left"><div class="gtitle">💰 <span id="tyC">0 $</span></div><div class="gsub" id="tyR"></div></div>`},
  mpState(){const P=this.mine;return P?{plot:P.i,ty:[...P.owned].slice(0,30)}:{plot:-1}},
  onRemote(c,pr){const G=this;const i=+pr.plot;if(!(i>=0&&i<G.plots.length)){if(c.plot!=null)tyRelease(G,c);return}
    if(c.plot!==i){if(c.plot!=null)tyRelease(G,c);const P=G.plots[i];if(P.owner&&P.owner!==c&&P.owner!==pl)return;
      if(P===G.mine){if(String(c.name)<String(pl.name)){sys('Base déjà prise : on t\'en donne une autre.');tyReleaseMine(G);P.owner=c;c.plot=i;tyBase(P);G.assignT=.1}return}P.owner=c;c.plot=i;tyBase(P)}
    const P=G.plots[i];for(const id of Array.isArray(pr.ty)?pr.ty:[])if(TY_ITEMS.some(t=>t.id===id)&&!P.owned.has(id))tyConstruct(P,id,false)},
  onRemoteLeave(c){if(c.plot!=null)tyRelease(this,c)},
  update(dt,t){const G=this,sv=G.sv,mult=1+sv.reb*.5;
    if(!G.mine){G.assignT-=dt;if(G.assignT<=0)tyAssign(G)}
    for(const P of G.plots){if(!P.owner)continue;const own=P===G.mine;P.convSpeed=P.owned.has('spd')?5:3;P.conv.speed=P.convSpeed;
      for(const id in P.dT){const dr=TY_DROP[id];P.dT[id]-=dt;if(P.dT[id]<=0){P.dT[id]=dr.rate;P.ores.push({x:dr.x,y:3.1,z:-6+rnd(-.3,.3),vy:0,val:dr.val,col:dr.col,glow:dr.glow,up:0,rot:Math.random()*6})}}
      for(let i=P.ores.length-1;i>=0;i--){const o=P.ores[i];if(o.y>1.25){o.vy-=25*dt;o.y=Math.max(1.22,o.y+o.vy*dt)}else{o.x+=P.convSpeed*dt;o.rot+=dt*2}
        if(P.owned.has('up1')&&!(o.up&1)&&o.x>5){o.up|=1;o.val*=2;sparks(tyW(P,o.x,o.y,o.z),[.5,3,1.6],5,.5)}
        if(P.owned.has('up2')&&!(o.up&2)&&o.x>8){o.up|=2;o.val+=25;sparks(tyW(P,o.x,o.y,o.z),[3,.6,1.6],5,.5)}
        if(o.x>9.8){P.ores.splice(i,1);if(own){const v=Math.round(o.val*mult*(hasPass('tycoon','x2')?2:1));sv.pending+=v;if(P.owned.has('auto')){sv.cash+=sv.pending;sv.earned=(sv.earned||0)+sv.pending;sv.pending=0}}
          emit({pos:tyW(P,9.8,1.6,-6),vel:[0,2,0],life:.5,size:.3,size1:0,col:[4,1.5,.3],add:1,shape:0})}}
      if(P.fount&&Math.random()<dt*20)emit({pos:[...P.fount],vel:[rnd(-1.2,1.2),rnd(4,6),rnd(-1.2,1.2)],life:rnd(.6,1),size:.12,size1:.05,col:[.8,.92,1],alpha:.8,grav:12})}
    const P=G.mine;
    if(P){if(sv.pending>0&&pl.ground===P.collector){sv.cash+=sv.pending;sv.earned=(sv.earned||0)+sv.pending;floatText(V.add(pl.pos,[0,3,0]),'+'+fmtCash(sv.pending),'#7dffb0');sv.pending=0;SFX.kaching();sparks(V.add(P.collector.pos,[0,.3,0]),[1,3,1.4],14);markDirty()}
      for(const p of P.pads){if(p.hidden)continue;const on=Math.abs(pl.pos[0]-p.pos[0])<1.3&&Math.abs(pl.pos[2]-p.pos[2])<1.3&&pl.pos[1]<.6;
        if(on&&!p.touch){const it=p.tyItem;if(sv.cash>=it.price){if(it.rebirth){G.rebirth();return}sv.cash-=it.price;sv.owned.push(it.id);tyConstruct(P,it.id,false);SFX.buy();toast(`${it.name} acheté !`);sparks(V.add(p.pos,[0,.5,0]),[1,3,1.5],24);if(it.price>=1000)giveBlox(Math.round(it.price/200),'Grand achat');markDirty();tyPads(G)}
          else{SFX.error();floatText(V.add(pl.pos,[0,3,0]),'Pas assez d\'argent','#ff8a8a')}}p.touch=on}
      G.padT=(G.padT||0)-dt;if(G.padT<0){G.padT=.4;tyPads(G);setSign(P.cSign,`En attente\n${fmtCash(sv.pending)}`)}}
    for(let i=G.pop.length-1;i>=0;i--){const b=G.pop[i];b.pop=Math.min(1,b.pop+dt*2.6);if(b.pop>=1){G.pop.splice(i,1);delete b.pop}}
    $('tyC').textContent=fmtCash(sv.cash);$('tyR').textContent=(P?`Base ${P.i+1} · `:'Choix d\'une base… · ')+`Renaissances : ${sv.reb} · ×${mult}${hasPass('tycoon','x2')?' · 🎟️ Cash ×2':''}`;
    if(Math.random()<dt*.3)markDirty()},
  extraDraw(L){for(const P of this.plots||[])for(const o of P.ores){const w=tyW(P,o.x,o.y,o.z);L.push({mesh:MESH.cube,m:M.chain(M.T(...w),M.RY(o.rot),M.S(.45,.45,.45)),mode:3,color:o.up&2?'#ff6fd0':o.up&1?'#39ffb6':o.col,shin:o.glow?160:60,emis:o.glow?(HDR?1.6:.4):0})}}});
function tyNewPlot(i,[ox,oz,s]){return{i,ox,oz,s,blocks:[],signs:[],waters:[],owned:new Set(),ores:[],dT:{},pads:[],owner:null,fount:null}}
const tyW=(P,x,y,z)=>[P.ox+P.s*x,y,P.oz+P.s*z];
function tyB(P,x,y,z,sx,sy,sz,o={}){const w=tyW(P,x,y,z);if(o.dir)o={...o,dir:V.mul(o.dir,P.s)};const b=B(w[0],w[1],w[2],sx,sy,sz,o);P.blocks.push(b);return b}
function tySign(P,x,y,z,text,o={}){const w=tyW(P,x,y,z);const s=SIGN(w[0],w[1],w[2],text,false,{...o,yaw:(o.yaw||0)+(P.s<0?Math.PI:0)});P.signs.push(s);return s}
function tyClear(P){const set=new Set(P.blocks);for(let i=blocks.length-1;i>=0;i--)if(set.has(blocks[i]))blocks.splice(i,1);for(const s of P.signs){const k=signs.indexOf(s);if(k>=0)signs.splice(k,1)}
  for(const w of P.waters){const k=waters.indexOf(w);if(k>=0)waters.splice(k,1)}P.blocks=[];P.signs=[];P.waters=[];P.owned=new Set();P.ores=[];P.dT={};P.pads=[];P.fount=null;refreshSolids()}
function tyBase(P){tyClear(P);const G=GAMES.tycoon,mine=P===G.mine;
  P.floor=tyB(P,0,.05,0,32,.1,32,{mat:'beton'});tyB(P,-4,.1,16,4,.2,4,{color:mine?'#3d7eff':P.owner?'#9aa4b2':'#2fbf71',mat:'lisse'});
  P.conv=tyB(P,-2,.5,-6,24,1,2.4,{kind:'conv',dir:[1,0,0],speed:0,mode:6,color:'#30343d'});P.convSpeed=3;
  tyB(P,11.5,1.6,-6,3.4,3.2,3.4,{mat:'basalte'});tyB(P,11.5,3.3,-6,3.6,.3,3.6,{mat:'metal'});tyB(P,9.9,1.6,-6,.2,1.4,2,{kind:'lava'});
  P.collector=tyB(P,11.5,.15,-2,3,.3,2.2,{mat:'lisse',color:'#2fbf71'});P.cSign=tySign(P,11.5,3.2,-.6,mine?'En attente\n0 $':'Collecteur',{size:44,bg1:'#e9fff1',bg2:'#c7f5d8',border:'#1d8a50'});
  tyB(P,4,1.4,16.2,.25,2.8,.25,{mat:'bois'});tySign(P,4,3.2,16.2,P.owner?(mine?'TA BASE':'Base de\n'+filterText(P.owner.name)):'BASE LIBRE',{size:40,bg1:mine?'#e3efff':'#fffaf0',border:mine?'#3d7eff':'#6d4a2a'});
  if(mine){for(const it of TY_ITEMS){const p=tyB(P,it.pad[0],.12,it.pad[1],2.2,.24,2.2,{mat:'lisse',color:'#2fbf71',tyItem:it,nocol:1});p.hidden=true;p.sign=tySign(P,it.pad[0],2.4,it.pad[1],'',{w:384,h:150,size:34,lh:40,bg1:'#1f232b',bg2:'#13161c',border:'#2fbf71',ink:'#ffffff'});p.sign.hidden=true;P.pads.push(p)}}
  finalizeWorld()}
function tyConstruct(P,id,instant){if(P.owned.has(id))return;P.owned.add(id);const G=GAMES.tycoon,b_=(...a)=>{const b=tyB(P,...a);if(!instant){b.pop=0;G.pop.push(b)}return b};
  const dr=TY_DROP[id];if(dr){b_(dr.x,4.2,-6,1.6,1.6,1.6,{mat:id==='gold'?'or':'metal'});b_(dr.x,3.2,-6,.7,.5,.7,{mat:'rouille'});if(dr.glow)b_(dr.x,5.1,-6,.4,.4,.4,{mat:'neon',color:'#ffd23f',nocol:1});P.dT[id]=rnd(0,dr.rate)}
  if(id==='up1'){b_(5,2,-7.4,.4,3,.4,{mat:'neon',color:'#39ffb6'});b_(5,2,-4.6,.4,3,.4,{mat:'neon',color:'#39ffb6'});b_(5,3.6,-6,.4,.4,3.2,{mat:'neon',color:'#39ffb6',nocol:1})}
  if(id==='up2'){b_(8,2,-7.4,.4,3,.4,{mat:'neon',color:'#ff4fa3'});b_(8,2,-4.6,.4,3,.4,{mat:'neon',color:'#ff4fa3'});b_(8,3.6,-6,.4,.4,3.2,{mat:'neon',color:'#ff4fa3',nocol:1})}
  if(id==='walls'){for(const[x,z,sx,sz]of[[0,-16,32,.6],[-16,0,.6,32],[16,-5,.6,22]])b_(x,2,z,sx,4,sz,{mat:'brique'});b_(16,2,13,.6,4,6,{mat:'brique'})}
  if(id==='floor')P.floor.mat='marbre';
  if(id==='lamp')for(const[x,z]of[[-14,-14],[14,-14],[-14,14],[14,14]]){b_(x,2,z,.3,4,.3,{mat:'metal'});b_(x,4.2,z,.7,.5,.7,{mat:'neon',color:'#ffe6a8'})}
  if(id==='garden'){for(const[x,z]of[[-12,-12],[-8,-13],[12,10],[13,3]]){b_(x,1.3,z,.8,2.6,.8,{mat:'buche',shape:'log',axis:'y',len:2.6,d:.8});b_(x,3.6,z,2.4,2,2.4,{mat:'feuillage'})}
    for(let i=0;i<10;i++)b_(rnd(-14,-6),.15,rnd(1,4),.25,.3,.25,{color:pick(['#ff4fa3','#ffd23f','#ffffff','#b46bff']),mat:'lisse',nocol:1})}
  if(id==='fount'){b_(9,.35,10,5,.7,.4,{mat:'marbre'});b_(9,.35,14,5,.7,.4,{mat:'marbre'});b_(6.7,.35,12,.4,.7,4,{mat:'marbre'});b_(11.3,.35,12,.4,.7,4,{mat:'marbre'});b_(9,1.2,12,.6,2.4,.6,{mat:'marbre'});
    const w={pos:tyW(P,9,.35,12),size:[4.2,.6,3.6]};waters.push(w);P.waters.push(w);P.fount=tyW(P,9,2.5,12)}
  if(id==='stairs'){b_(0,4.2,-12.25,30,.4,7.5,{mat:'planches'});for(let i=0;i<9;i++)b_(-14,(.5+i*.5)/2,-i*1.0+.5,2.4,.5+i*.5,1,{mat:'planches'});b_(1.5,4.9,-8.6,27,1,.3,{mat:'verre',color:'#bfe9ff'})}
  if(id==='statue'){b_(-6,5.4,-12,2,2,2,{mat:'or'});b_(-6,7.2,-12,1.2,1.6,1.2,{mat:'or'});b_(-6,8.4,-12,1,.8,1,{mat:'or'})}
  finalizeWorld()}
function tyPads(G){const P=G.mine;if(!P)return;for(const p of P.pads){const it=p.tyItem,owned=P.owned.has(it.id),avail=!owned&&(!it.req||P.owned.has(it.req));
  p.hidden=p.sign.hidden=!avail;if(avail){const ok=G.sv.cash>=it.price;p.color=it.rebirth?'#ffd23f':(ok?'#2fbf71':'#e5484d');setSign(p.sign,`${it.name}\n${it.price?fmtCash(it.price):'GRATUIT'}`)}}}
function tyAssign(G){const taken=new Set([...MP.remote.values()].map(c=>c.plot).filter(x=>x!=null));const i=G.plots.findIndex(P=>!taken.has(P.i)&&!P.owner);
  if(i<0){G.assignT=3;sys('Toutes les bases sont prises : attends qu\'une base se libère ou choisis un autre serveur.');return}
  const P=G.plots[i];G.mine=P;P.owner=pl;tyBase(P);for(const id of G.sv.owned)tyConstruct(P,id,true);tyPads(G);pl.pos=tyW(P,-4,.3,16);pl.vel=[0,0,0];cam.target=V.add(pl.pos,[0,2,0]);
  sys(`🏭 Tu as la base ${i+1} ! Marche sur les boutons verts pour acheter.`);SFX.checkpoint()}
function tyReleaseMine(G){const P=G.mine;if(!P)return;P.owner=null;G.mine=null;tyBase(P);G.assignT=.2}
function tyRelease(G,c){const P=G.plots[c.plot];c.plot=null;if(P&&P.owner===c){P.owner=null;tyBase(P)}}
