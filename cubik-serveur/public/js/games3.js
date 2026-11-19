"use strict";
/* ============================================================================
   NOUVEAUX JEUX (2/2) : Pêche Paradis, Simulateur d'Animaux, Bataille de
   Neige, Pizzeria Folle, Évasion de Prison
   ============================================================================ */
function dlgReopen(fn){setTimeout(fn,0)}
function dlgGrid(){const b=document.querySelector('#dialog .db');if(b)b.classList.add('grid')}
NPC_AV.client={skin:'#e0ac69',haut:'tee_bleu',bas:'jean_bleu',visage:'sourire',chapeau:null,cheveux:null,lunettes:null,dos:null,cou:null,epaule:null};
NPC_AV.garde={skin:'#c68642',haut:'tee_noir',bas:'jean_noir',visage:'serieux',chapeau:'casquette_bleue',cheveux:null,lunettes:'lunettes_soleil',dos:null,cou:null,epaule:null};
NPC_AV.bleu={skin:'#f1c27d',haut:'tee_bleu',bas:'jean_bleu',visage:'cool',chapeau:'bonnet',cheveux:null,lunettes:null,dos:null,cou:'echarpe',epaule:null};
NPC_AV.rouge={skin:'#e0ac69',haut:'tee_rouge',bas:'jean_noir',visage:'fache',chapeau:'bonnet',cheveux:null,lunettes:null,dos:null,cou:'echarpe',epaule:null};

/* ============================== 6. PÊCHE PARADIS ============================== */
const FISH=[// [nom, zone, rareté 0-4, valeur, couleur]
 ['Sardine',0,0,4,'#9aa4b2'],['Gardon',0,0,5,'#c0c8d0'],['Poisson-clown',0,1,18,'#ff8a3d'],['Bar',0,0,8,'#7d8a9a'],['Daurade',0,1,22,'#ffd23f'],['Poulpe',0,2,60,'#e57373'],['Hippocampe',0,2,75,'#ffb3c8'],['Tortue dorée',0,3,300,'#ffd23f'],
 ['Poisson-perroquet',1,0,30,'#39c5bb'],['Mérou',1,1,70,'#8d6e63'],['Raie',1,1,90,'#5d6d7e'],['Barracuda',1,2,200,'#b0bec5'],['Poisson-lune',1,2,260,'#d7ccc8'],['Requin-marteau',1,3,900,'#78909c'],['Murène néon',1,4,3000,'#39ffb6'],
 ['Poisson-lave',2,0,120,'#ff6a1a'],['Crabe de braise',2,1,260,'#e5484d'],['Anguille volcanique',2,2,700,'#ff8a3d'],['Poisson-obsidienne',2,2,850,'#2b2d33'],['Dragon des mers',2,3,4000,'#c62828'],['Phénix aquatique',2,4,15000,'#ffd23f'],
 ['Morue polaire',3,0,500,'#cfe8ff'],['Poisson-cristal',3,1,1200,'#a8f0ff'],['Calmar géant',3,2,3500,'#ff7a9a'],['Narval',3,3,12000,'#e0f7fa'],['Kraken bébé',3,3,20000,'#7a5cff'],['Léviathan',3,4,90000,'#3d7eff'],['Poisson-galaxie',3,4,150000,'#b46bff']];
const FRAR=[['Commun','#c8cdd6'],['Rare','#4ea8ff'],['Épique','#b46bff'],['Légendaire','#ffd23f'],['Mythique','#ff4fa3']];
const RODS=[['Canne en bambou',0,0],['Canne en carbone',1,600],['Canne pro',2,4000],['Canne de lave',3,25000],['Canne polaire',4,1.2e5],['Canne cosmique',6,8e5]];
const FZONES=[['Lagon',0,[0,0]],['Récif corallien',2500,[0,-120]],['Îles volcaniques',30000,[130,-60]],['Abysses glacées',2.5e5,[-130,-60]]];
GAMES.peche={name:'Pêche Paradis',genre:'Simulateur',icon:'🎣',colors:['#1c6a8a','#ffd23f'],maxPlayers:16,music:'sandbox',
  desc:"28 poissons à collectionner dans 4 zones (lagon, récif, îles volcaniques, abysses glacées). Ferre au bon moment, vends tes prises, achète de meilleures cannes et complète l'Encyclopédie pour gagner des Blox !",
  badges:['Chaque espèce : Blox','Encyclopédie complète : +300 Blox'],
  build(sv){const G=this;G.sv=sv;sv.cash=sv.cash||0;sv.rod=sv.rod||0;sv.zones=sv.zones||[0];sv.dex=sv.dex||{};G.bag=[];G.fish=null;setClock(11);
    B(0,-6,0,600,1,600,{mat:'sable',color:'#c8b28a'});waters.push({pos:[0,-2.7,0],size:[600,6.6,600],swimAt:.55,color:'#1c7aa0'});
    G.isl=FZONES.map((z,i)=>{const[x,zz]=z[2],m=['sable','sable','basalte','neige'in MATS?'neige':'lisse'][i];B(x,.0,zz,i?34:44,1.4,i?34:44,{mat:m,color:i===3?'#eef6ff':undefined});B(x,.8,zz+(i?20:25),6,.3,10,{mat:'planches'});
      for(let k=0;k<5;k++){const a=k/5*6.28+i;if(i===3)B(x+Math.cos(a)*12,2.5,zz+Math.sin(a)*12,2,4,2,{mat:'verre',color:'#bfe9ff'});else if(i===2)B(x+Math.cos(a)*12,2,zz+Math.sin(a)*12,3,3,3,{mat:'basalte'});else{LOG(x+Math.cos(a)*14,3,zz+Math.sin(a)*14,6,.5,'y');B(x+Math.cos(a)*14,6.4,zz+Math.sin(a)*14,4,.6,4,{mat:'feuillage',color:'#2f8a3a'})}}
      SIGN(x,3,zz+4,FZONES[i][0].toUpperCase(),true,{size:42});return{x,z:zz,i}});
    const[ix,iz]=FZONES[0][2];G.sellB=B(ix-8,1.6,iz-6,3,2,2,{mat:'bois',color:'#8d5a2b'});SIGN(ix-8,3.8,iz-6,'💰 POISSONNIER',false,{size:36});B(ix+8,1.6,iz-6,3,2,2,{mat:'bois',color:'#3d7eff'});SIGN(ix+8,3.8,iz-6,'🎣 CANNES',false,{size:36});
    WORLD.prompts=[{who:{pos:[ix-8,.7,iz-6]},label:'Vendre',act:()=>G.sell()},{who:{pos:[ix+8,.7,iz-6]},label:'Cannes',act:()=>G.shop()},{who:{pos:[ix,.7,iz-12]},label:'Encyclopédie',act:()=>G.dex()}];
    B(ix,1.4,iz-12,2,1.4,1,{mat:'lisse',color:'#7a5cff'});SIGN(ix,3,iz-12,'📖 ENCYCLOPÉDIE',false,{size:34});
    for(const I of G.isl){WORLD.prompts.push({who:{pos:[I.x,.9,I.z+(I.i?24:29)]},label:'Pêcher',act:()=>G.cast(I.i)},{who:{pos:[I.x+4,.9,I.z+(I.i?16:21)]},label:'Bateau',act:()=>G.boat()});B(I.x+4,.9,I.z+(I.i?16:21),2,.6,3,{mat:'bois',color:'#e5484d'})}
    SPAWN={pos:[0,.8,8],size:[4,.2,4]};WORLD.voidY=-30},
  spawn(){return[0,1,8]},
  hud(el){el.innerHTML=`<div class="ghud left"><div class="gtitle">💰 <span id="fiC"></span></div><div class="gsub" id="fiS"></div></div><div id="fiG" class="fishg" style="display:none"><div class="fbar"><i id="fiZ"></i><b id="fiM"></b></div><button class="btn gold" id="fiBtn">🎣 FERRER (F)</button><div id="fiT">Un poisson mord !</div></div>`;$('fiBtn').onclick=()=>this.reel()},
  zoneAt(){let best=0,bd=1e9;for(const I of this.isl){const d=Math.hypot(pl.pos[0]-I.x,pl.pos[2]-I.z);if(d<bd){bd=d;best=I.i}}return best},
  cast(zi){const G=this;if(G.fish)return;if(G.bag.length>=20+G.sv.rod*10){toast('🪣 Seau plein : va vendre au poissonnier');return}if(!G.sv.zones.includes(zi)){toast('Zone non débloquée');return}
    G.fish={zi,t:rnd(1.2,3.5),state:'wait'};pl.emote='assis';sys('🎣 Tu lances ta ligne…');SFX.splash?.()},
  roll(zi){const r=RODS[this.sv.rod][1],pool=FISH.filter(f=>f[1]===zi);const w=pool.map(f=>Math.pow(.32,f[2])*(1+r*.18*f[2]));let x=Math.random()*w.reduce((a,b)=>a+b,0);for(let i=0;i<pool.length;i++){x-=w[i];if(x<=0)return pool[i]}return pool[0]},
  reel(){const G=this,F=G.fish;if(!F||F.state!=='bite')return;const ok=Math.abs(F.m-F.z)<F.w/2;if(ok){F.hits++;SFX.coin?.();if(F.hits>=F.need)return G.catch();F.z=rnd(.15,.85);F.sp*=1.1}else{F.miss++;SFX.error();if(F.miss>=3){toast('💨 Le poisson s\'est échappé…');G.stopFish()}}},
  catch(){const G=this,f=G.fish.f;G.bag.push(f);const first=!G.sv.dex[f[0]];G.sv.dex[f[0]]=(G.sv.dex[f[0]]||0)+1;const R=FRAR[f[2]];floatText(V.add(pl.pos,[0,3.4,0]),`${f[0]} (${R[0]})`,R[1]);if(f[2]>=3)confetti(V.add(pl.pos,[0,2,0]));SFX.pickup();
    if(first){giveBlox(3+f[2]*6,'Nouvelle espèce : '+f[0]);if(Object.keys(G.sv.dex).length>=FISH.length&&!G.sv.full){G.sv.full=1;giveBlox(300,'Encyclopédie complète !');unlockBadge('pecheur')}}markDirty();G.stopFish()},
  stopFish(){this.fish=null;pl.emote=null;$('fiG').style.display='none'},
  input(k){if(k==='attack'&&this.fish)this.reel()},
  sell(){const G=this;if(!G.bag.length)return toast('Ton seau est vide');const v=G.bag.reduce((s,f)=>s+f[3],0);G.sv.cash+=v;G.bag=[];SFX.kaching();floatText(V.add(pl.pos,[0,3,0]),'+'+fmtCash(v),'#7dffb0');markDirty()},
  shop(){const G=this,sv=G.sv,b=[];const n=RODS[sv.rod+1];if(n)b.push([`🎣 ${n[0]} · ${fmtCash(n[2])}`,()=>{if(sv.cash<n[2])return SFX.error();sv.cash-=n[2];sv.rod++;SFX.buy();markDirty()}]);
    FZONES.forEach((z,i)=>{if(!sv.zones.includes(i))b.push([`⛵ Débloquer ${z[0]} · ${fmtCash(z[1])}`,()=>{if(sv.cash<z[1])return SFX.error();sv.cash-=z[1];sv.zones.push(i);SFX.levelUp();toast('⛵ '+z[0]+' débloqué ! Prends le bateau rouge.');markDirty()}])});b.push(['Fermer',null]);
    openDialog('🎣 Boutique',`${RODS[sv.rod][0]} · ${fmtCash(sv.cash)}`,b)},
  boat(){const G=this;openDialog('⛵ Bateau','Où veux-tu aller ?',[...FZONES.map((z,i)=>[`${G.sv.zones.includes(i)?'':'🔒 '}${z[0]}`,()=>{if(!G.sv.zones.includes(i))return toast('Débloque cette zone à la boutique des cannes');const[x,zz]=z[2];pl.pos=[x,1.2,zz+8];pl.vel=[0,0,0];SFX.splash?.()}]),['Annuler',null]])},
  dex(){const G=this,have=Object.keys(G.sv.dex).length;openDialog('📖 Encyclopédie',`${have} / ${FISH.length} espèces\n`+FISH.map(f=>`${G.sv.dex[f[0]]?'✅ '+f[0]+' ×'+G.sv.dex[f[0]]:'❔ ???'} · ${FZONES[f[1]][0]} · ${FRAR[f[2]][0]}`).join('\n'),[['Fermer',null]])},
  update(dt){const G=this,F=G.fish;
    if(F){if(V.len(pl.vel)>2&&F.state==='wait'){G.stopFish();return}if(F.state==='wait'){F.t-=dt;if(F.t<=0){const f=G.roll(F.zi);Object.assign(F,{state:'bite',f,m:0,dir:1,sp:.55+f[2]*.25,z:rnd(.2,.8),w:.22-f[2]*.03+G.sv.rod*.012,hits:0,need:3+f[2],miss:0,limit:8+f[2]*2});$('fiG').style.display='';$('fiT').textContent='Un poisson mord ! Ferre quand le curseur est dans la zone verte.';SFX.splash?.()}}
      else{F.m+=F.dir*F.sp*dt;if(F.m>1){F.m=1;F.dir=-1}if(F.m<0){F.m=0;F.dir=1}F.limit-=dt;if(F.limit<=0){toast('💨 Trop lent, il est parti…');G.stopFish();return}
        $('fiZ').style.left=((F.z-F.w/2)*100)+'%';$('fiZ').style.width=(F.w*100)+'%';$('fiM').style.left=(F.m*100)+'%';$('fiT').textContent=`${F.hits}/${F.need} · ratés ${F.miss}/3 · ${Math.ceil(F.limit)} s`}}
    $('fiC').textContent=fmtCash(G.sv.cash);$('fiS').textContent=`${RODS[G.sv.rod][0]} · 🪣 ${G.bag.length}/${20+G.sv.rod*10} · 📖 ${Object.keys(G.sv.dex).length}/${FISH.length} · zone ${FZONES[G.zoneAt()][0]}`}};

/* ============================== 7. SIMULATEUR D'ANIMAUX ============================== */
const PETS=[['Chiot',0,1,'#d7a86e'],['Chaton',0,1,'#ff8a3d'],['Lapin',0,1.5,'#f2f2f2'],['Renard',1,3,'#ff6a1a'],['Hibou',1,3.5,'#8d6e63'],['Panda',2,7,'#f2f2f2'],['Licorne',3,18,'#ff7ad9'],['Dragonnet',3,22,'#e5484d'],['Phénix',4,60,'#ffd23f'],['Chat galactique',4,80,'#b46bff'],
  ['Pingouin',1,4,'#30343d'],['Axolotl',2,9,'#ffb3c8'],['Golem',2,10,'#7d7f84'],['Griffon',3,25,'#c8a24a'],['Kraken',4,95,'#3d7eff']];
const PZONES=[['Prairie',0,1,'#4fa046'],['Forêt',2500,4,'#2f6a3a'],['Désert',40000,15,'#e6c27a'],['Glacier',6e5,60,'#dff1ff'],['Volcan',9e6,250,'#4a2a22'],['Royaume céleste',1.5e8,1200,'#c9d8ff']];
GAMES.animaux={name:'Simulateur d\'Animaux',genre:'Simulateur',icon:'🐾',colors:['#ff7ad9','#ffd23f'],maxPlayers:16,music:'sandbox',
  desc:"Tes animaux cassent les tas de pièces pour toi ! Ouvre des œufs (15 animaux, du Commun au Mythique), équipe les 4 meilleurs, débloque 6 zones et deviens le plus riche. Clique/F sur un tas pour y envoyer tes animaux.",
  badges:['Animal Mythique : +100 Blox','Royaume céleste : +200 Blox'],
  build(sv){const G=this;G.sv=sv;sv.coins=sv.coins||0;sv.pets=sv.pets||[[0,0]];sv.zone=sv.zone||0;G.piles=[];G.pw=[];G.tgt=null;G.spT=0;setClock(12);
    PZONES.forEach((z,i)=>{const zz=-i*60;B(0,-.5,zz,60,1,60,{mat:i===2?'sable':i===3?'lisse':i===4?'basalte':'herbe',color:z[3]});SIGN(-26,3,zz+26,z[0].toUpperCase(),true,{size:40});
      if(i>0){const g=B(0,3,zz+30,60,6,.6,{mat:'verre',color:'#ffd23f',alpha:.5});g.gate=i;if(sv.zone>=i){g.nocol=true;g.alpha=.05}G.pw.push(g);SIGN(0,7,zz+30.5,`🔒 ${z[0]} · ${fmtCash(z[1]).replace(' $',' 🪙')}`,false,{size:40})}
      B(20,1,zz+20,3,2,3,{mat:'lisse',color:'#ff7ad9'});SIGN(20,3.4,zz+20,'🥚 ŒUF · '+fmtCash(Math.round(150*Math.pow(9,i))).replace(' $',' 🪙'),false,{size:34});
      for(const[x,z2]of[[-24,-20],[24,-24],[-20,20]])TREE(x,zz+z2,3,3)});
    WORLD.prompts=[...PZONES.map((z,i)=>({who:{pos:[20,0,-i*60+20]},label:'Ouvrir un œuf',act:()=>G.egg(i)})),...PZONES.slice(1).map((z,i)=>({who:{pos:[0,0,-(i+1)*60+31.5]},label:'Débloquer',act:()=>G.unlock(i+1)})),{who:{pos:[-20,0,20]},label:'Mes animaux',act:()=>G.inv()}];
    B(-20,1,20,2,2,2,{mat:'lisse',color:'#3d7eff'});SIGN(-20,3.4,20,'🐾 MES ANIMAUX',false,{size:34});G.pets=[];G.equip();SPAWN={pos:[0,.2,20],size:[4,.2,4]}},
  spawn(){return[0,.3,20]},
  equip(){const G=this;G.sv.pets.sort((a,b)=>PETS[b[0]][2]*(1+b[1]*.5)-PETS[a[0]][2]*(1+a[1]*.5));G.pets=G.sv.pets.slice(0,4+(hasPass('animaux','vip')?2:0)).map((p,i)=>({d:PETS[p[0]],lv:p[1],pos:V.add(pl?.pos||[0,0,20],[i,0,2]),i}))},
  power(){return this.pets.reduce((s,p)=>s+p.d[2]*(1+p.lv*.5),0)},
  hud(el){el.innerHTML=`<div class="ghud left"><div class="gtitle">🪙 <span id="anC"></span></div><div class="gsub" id="anS"></div></div><div class="ghud quest">F / clic sur un tas : y envoyer tes animaux</div>`},
  zoneOf(z){return clamp(Math.floor((-z+30)/60),0,PZONES.length-1)},
  egg(i){const G=this,c=Math.round(150*Math.pow(9,i));if(G.sv.zone<i)return toast('Débloque d\'abord cette zone');if(G.sv.coins<c){SFX.error();return toast('Il te faut '+fmtCash(c).replace(' $',' 🪙'))}if(G.sv.pets.length>=40)return toast('Inventaire plein (40) : fusionne ou libère des animaux');
    G.sv.coins-=c;const pool=PETS.map((p,k)=>[k,p]).filter(([k,p])=>p[1]<=Math.min(4,i+1));const w=pool.map(([k,p])=>Math.pow(.18,p[1])*(p[1]<=i?1:.3));let x=Math.random()*w.reduce((a,b)=>a+b,0),pk=pool[0][0];for(let j=0;j<pool.length;j++){x-=w[j];if(x<=0){pk=pool[j][0];break}}
    G.sv.pets.push([pk,0]);const P=PETS[pk],R=FRAR[P[1]];SFX.levelUp();confetti(V.add(pl.pos,[0,2,0]));scMessage(`🥚 ${P[0]} (${R[0]}) !`,2.5);if(P[1]===4&&!G.sv.myth){G.sv.myth=1;giveBlox(100,'Animal Mythique !')}
    const same=G.sv.pets.filter(p=>p[0]===pk&&p[1]===0);if(same.length>=3){for(let k=0;k<3;k++)G.sv.pets.splice(G.sv.pets.indexOf(same[k]),1);G.sv.pets.push([pk,1]);toast(`✨ 3 ${P[0]} fusionnés en ${P[0]} doré !`)}G.equip();markDirty()},
  unlock(i){const G=this;if(G.sv.zone>=i)return;if(G.sv.zone<i-1)return toast('Débloque la zone précédente');const c=PZONES[i][1];if(G.sv.coins<c){SFX.error();return toast('Il te faut '+fmtCash(c).replace(' $',' 🪙'))}G.sv.coins-=c;G.sv.zone=i;for(const g of G.pw)if(g.gate===i){g.nocol=true;g.alpha=.05}refreshSolids();SFX.levelUp();scMessage('🔓 '+PZONES[i][0]+' débloqué !',3);if(i===5){giveBlox(200,'Royaume céleste !');unlockBadge('animaux')}markDirty()},
  inv(){const G=this;openDialog('🐾 Mes animaux',`Puissance totale : ${Math.round(G.power())}\n`+G.sv.pets.map((p,i)=>`${i<G.pets.length?'⭐ ':''}${PETS[p[0]][0]}${p[1]?' doré':''} · ${FRAR[PETS[p[0]][1]][0]} · ${Math.round(PETS[p[0]][2]*(1+p[1]*.5))}`).join('\n'),[['Libérer les animaux non équipés (+pièces)',()=>{const ex=G.sv.pets.slice(G.pets.length);const v=ex.reduce((s,p)=>s+PETS[p[0]][2]*30,0);G.sv.pets=G.sv.pets.slice(0,G.pets.length);G.sv.coins+=v;toast('+'+Math.round(v)+' 🪙');markDirty()}],['Fermer',null]])},
  input(k){if(k==='attack'){let b=null,bd=14;for(const p of this.piles){const d=V.len(V.sub(p.pos,pl.pos));if(d<bd){bd=d;b=p}}if(b){this.tgt=b;pl.swing=.3;b.hp-=this.power()*.25;SFX.coin?.();sparks(b.pos,[3,2.4,.6],5)}}},
  click(ray){let best=null,bt=40;for(const p of this.piles){const t=rayAABB(ray.o,ray.d,{mn:V.sub(p.pos,[p.s,0,p.s]),mx:V.add(p.pos,[p.s,p.s*1.4,p.s])});if(t!=null&&t<bt){bt=t;best=p}}if(best){this.tgt=best;best.hp-=this.power()*.25;SFX.coin?.();return true}return false},
  update(dt,t){const G=this,zi=G.zoneOf(pl.pos[2]);G.spT-=dt;
    if(G.spT<=0){G.spT=.5;for(let i=0;i<=G.sv.zone;i++){const n=G.piles.filter(p=>p.z===i).length;if(n<14){const big=Math.random()<.12,v=PZONES[i][2]*(big?12:1)*rnd(4,7);G.piles.push({z:i,pos:[rnd(-25,25),0,-i*60+rnd(-24,24)],hp:v*2,max:v*2,v,s:big?1.6:.8})}}}
    if(G.tgt&&!G.piles.includes(G.tgt))G.tgt=null;
    G.pets.forEach((p,i)=>{const a=i/G.pets.length*6.28+t*.3;let goal=G.tgt?V.add(G.tgt.pos,[Math.cos(a)*1.6,0,Math.sin(a)*1.6]):V.add(pl.pos,[Math.cos(a)*2.4,0,Math.sin(a)*2.4]);const d=V.sub(goal,p.pos);d[1]=0;const L=V.len(d);p.pos=V.add(p.pos,V.mul(d,Math.min(1,dt*(L>20?20:6))));p.pos[1]=.5+Math.abs(Math.sin(t*8+i))*.4;
      if(G.tgt&&L<1.5){G.tgt.hp-=p.d[2]*(1+p.lv*.5)*dt*1.4;if(Math.random()<dt*4)sparks(G.tgt.pos,[3,2.4,.6],3,.5)}});
    for(let i=G.piles.length-1;i>=0;i--){const p=G.piles[i];if(p.hp<=0){G.piles.splice(i,1);const v=Math.round(p.v*(hasPass('animaux','x2')?2:1));G.sv.coins+=v;floatText(V.add(p.pos,[0,2,0]),'+'+v+' 🪙','#ffd23f');SFX.kaching?.();sparks(p.pos,[3,2.4,.5],14);if(Math.random()<.05)markDirty()}}
    if(!G.tgt&&Math.random()<dt*2){let b=null,bd=10;for(const p of G.piles){const d=V.len(V.sub(p.pos,pl.pos));if(d<bd){bd=d;b=p}}if(b)G.tgt=b}
    $('anC').textContent=fmtCash(G.sv.coins).replace(' $','');$('anS').textContent=`${PZONES[zi][0]} · 🐾 ${G.pets.length} équipés · puissance ${Math.round(G.power())} · ${G.sv.pets.length}/40 animaux`},
  extraDraw(L){for(const p of this.piles){if(!inView(p.pos,3))continue;const k=p.hp/p.max;L.push({mesh:MESH.cyl,m:M.chain(M.T(p.pos[0],p.s*.35,p.pos[2]),M.S(p.s*2,p.s*.7,p.s*2)),mode:3,color:'#ffc61a',shin:200,emis:HDR?.5:.15},{mesh:MESH.sphere,m:M.chain(M.T(p.pos[0],p.s*.8,p.pos[2]),M.S(p.s*1.4,p.s*.8,p.s*1.4)),mode:3,color:'#ffd23f',shin:200,emis:HDR?.4:.1});
      if(k<1)L.push({mesh:MESH.box,m:M.chain(M.T(p.pos[0],p.s*1.8+.4,p.pos[2]),M.S(1.6*k,.14,.14)),mode:3,color:'#2fbf71',emis:HDR?1:.4})}
    for(const p of this.pets){const[c]=[p.d[3]],m=M.chain(M.T(...p.pos),M.RY(Math.atan2(pl.pos[0]-p.pos[0],pl.pos[2]-p.pos[2])));const s=.55+p.d[1]*.08;
      L.push({mesh:MESH.sphere,m:M.mul(m,M.S(s,s*.9,s)),mode:3,color:c,shin:80,emis:p.lv?(HDR?.6:.2):0},{mesh:MESH.sphere,m:M.mul(m,M.chain(M.T(s*.25,s*.15,s*.42),M.S(.1,.12,.06))),mode:3,color:'#15161b'},{mesh:MESH.sphere,m:M.mul(m,M.chain(M.T(-s*.25,s*.15,s*.42),M.S(.1,.12,.06))),mode:3,color:'#15161b'},
        {mesh:MESH.cone,m:M.mul(m,M.chain(M.T(s*.3,s*.45,0),M.S(.15,.25,.15))),mode:3,color:c},{mesh:MESH.cone,m:M.mul(m,M.chain(M.T(-s*.3,s*.45,0),M.S(.15,.25,.15))),mode:3,color:c});if(p.lv)glow(p.pos,[2,1.6,.3],.8)}}};

/* ============================== 8. BATAILLE DE NEIGE (capture du drapeau) ============================== */
GAMES.neige={name:'Bataille de Neige',genre:'Combat',icon:'⛄',colors:['#bfe9ff','#e5484d'],maxPlayers:16,music:'boss',
  desc:"Capture du drapeau 4 contre 4 avec des boules de neige ! Vole le drapeau rouge et ramène-le à ta base. Une boule = retour à la base. 3 captures pour gagner la manche, monte en grade de manche en manche.",
  badges:['Manche gagnée : +25 Blox','Grade Général : +150 Blox'],
  build(sv){const G=this;G.sv=sv;sv.xp=sv.xp||0;G.score=[0,0];G.shots=[];G.bots=[];G.flags=[{home:[0,1,58],pos:[0,1,58],car:null,team:0},{home:[0,1,-58],pos:[0,1,-58],car:null,team:1}];G.atkCd=0;setClock(13);G.time=0;
    B(0,-.5,0,90,1,140,{mat:'lisse',color:'#f4f8ff'});for(const[x,z,w,d,h]of[[-14,0,6,2,2.4],[14,0,6,2,2.4],[0,-20,10,2,2],[0,20,10,2,2],[-26,-34,2,10,2.6],[26,34,2,10,2.6],[-26,34,2,10,2.6],[26,-34,2,10,2.6],[-8,-44,6,2,2],[8,44,6,2,2],[30,0,2,14,3],[-30,0,2,14,3]])B(x,h/2,z,w,h,d,{mat:'lisse',color:'#e3efff'});
    for(const[x,z]of[[-40,-60],[40,-60],[-40,60],[40,60],[-42,0],[42,0]])TREE(x,z,3,3,'neige'in MATS?'neige':'feuillage');
    for(const s of[1,-1]){B(0,.1,58*s,12,.2,8,{mat:'lisse',color:s>0?'#3d7eff':'#e5484d'});for(const x of[-8,8])B(x,1.5,52*s,3,3,3,{mat:'lisse',color:'#e3efff'})}
    const mk=(team,i,role)=>{const c=spawnNPC((team?['Rouge','Neige','Glaçon','Blizzard']:['Flocon','Givre','Igloo'])[i]+' (bot)',team?'rouge':'bleu',[rnd(-8,8),.3,(team?-55:55)],{still:true,quiet:true,col:team?'#ff6b6b':'#7fb8ff'});c.bot={team,role,cd:rnd(0,1),frz:0};c.walk=7.2;G.bots.push(c)};
    for(let i=0;i<3;i++)mk(0,i,i===0?'def':'atk');for(let i=0;i<4;i++)mk(1,i,i<2?'def':'atk');WORLD.voidY=-20},
  spawn(){return[rnd(-4,4),.3,57]},
  hud(el){el.innerHTML=`<div class="ghud center"><div class="gtitle" id="snT"></div><div class="gsub" id="snS"></div></div>`},
  input(k){if(k==='attack'&&this.atkCd<=0&&!pl.dead){this.atkCd=.5;const f=[Math.sin(pl.yaw),0,Math.cos(pl.yaw)];this.shots.push({pos:V.add(pl.pos,[f[0],1.6,f[2]]),vel:[f[0]*30,5,f[2]*30],team:0,life:1.4,me:1});SFX.pop?.()}},
  onDeath(c){if(c===pl)this.drop(pl)},
  drop(c){for(const f of this.flags)if(f.car===c){f.car=null;f.pos=[...f.home];sys(`🚩 Drapeau ${f.team?'rouge':'bleu'} renvoyé à sa base`)}},
  rank(){const xp=this.sv.xp;const R=['Recrue','Soldat','Caporal','Sergent','Lieutenant','Capitaine','Commandant','Colonel','Général'];return R[Math.min(R.length-1,Math.floor(Math.sqrt(xp/40)))]},
  update(dt,t){const G=this;G.atkCd-=dt;G.time+=dt;const ents=[{c:pl,team:0},...G.bots.map(c=>({c,team:c.bot.team}))];
    for(const c of G.bots){const b=c.bot;b.cd-=dt;if(b.frz>0){b.frz-=dt;c.forceWish=[0,0,0];if(b.frz<=0){c.pos=[rnd(-8,8),.4,b.team?-55:55];c.vel=[0,0,0]}continue}
      const my=G.flags[b.team],en=G.flags[1-b.team];let goal;const carrying=en.car===c;
      if(carrying)goal=my.home;else if(my.car)goal=my.car.pos;else if(b.role==='atk')goal=en.car?en.car.pos:en.pos;else{let near=null,nd=26;for(const e of ents)if(e.team!==b.team&&!(e.c.dead)){const d=V.len(V.sub(e.c.pos,my.home));if(d<nd){nd=d;near=e.c}}goal=near?near.pos:V.add(my.home,[Math.sin(t*.5+c.pos[0])*6,0,b.team?6:-6])}
      const d=V.sub(goal,c.pos);d[1]=0;c.forceWish=V.len(d)>1?V.norm(d):[0,0,0];
      if(b.cd<=0){let tg=null,td=20;for(const e of ents)if(e.team!==b.team&&!e.c.dead&&!(e.c.bot&&e.c.bot.frz>0)){const dd=V.len(V.sub(e.c.pos,c.pos));if(dd<td){td=dd;tg=e.c}}
        if(tg){b.cd=rnd(1.1,1.9);const aim=V.add(tg.pos,V.mul(tg.vel,td/28)),dir=V.norm([aim[0]-c.pos[0],0,aim[2]-c.pos[2]]);const sp=rnd(.92,1.05);G.shots.push({pos:V.add(c.pos,[dir[0],1.6,dir[2]]),vel:[dir[0]*28*sp+rnd(-1.5,1.5),4+td*.12,dir[2]*28*sp],team:b.team,life:1.4});c.swing=.3}}}
    for(let i=G.shots.length-1;i>=0;i--){const s=G.shots[i];s.life-=dt;s.vel[1]-=14*dt;s.pos=V.add(s.pos,V.mul(s.vel,dt));let hit=null;
      for(const e of ents){if(e.team===s.team||e.c.dead||(e.c.bot&&e.c.bot.frz>0))continue;const c=e.c;if(Math.abs(c.pos[0]-s.pos[0])<.8&&Math.abs(c.pos[2]-s.pos[2])<.8&&s.pos[1]>c.pos[1]&&s.pos[1]<c.pos[1]+H){hit=c;break}}
      if(hit){sparks(s.pos,[2.6,2.8,3],14);SFX.hit?.();G.drop(hit);if(hit===pl){scMessage('❄️ Touché !',1.2);die(pl,false)}else{hit.bot.frz=2.5;floatText(V.add(hit.pos,[0,3,0]),'❄️','#bfe9ff');if(s.me){G.sv.xp+=2}}G.shots.splice(i,1);continue}
      if(s.life<=0||s.pos[1]<0||solids.some(b=>b.kind==='solid'&&Math.abs(b.pos[0]-s.pos[0])<b.size[0]/2&&Math.abs(b.pos[1]-s.pos[1])<b.size[1]/2&&Math.abs(b.pos[2]-s.pos[2])<b.size[2]/2&&b.size[0]<20)){if(s.pos[1]<.3||s.life<=0){}else sparks(s.pos,[2.4,2.6,3],6);G.shots.splice(i,1)}}
    for(const f of G.flags){if(f.car){f.pos=V.add(f.car.pos,[0,3.2,0]);continue}for(const e of ents){if(e.c.dead||(e.c.bot&&e.c.bot.frz>0))continue;const d=V.len(V.sub([e.c.pos[0],0,e.c.pos[2]],[f.pos[0],0,f.pos[2]]));
        if(d<1.8){if(e.team!==f.team){f.car=e.c;if(e.c===pl){scMessage('🚩 Tu as le drapeau ! Ramène-le à ta base !',2);SFX.quest()}else sys(`🚩 ${e.c.name} a pris le drapeau ${f.team?'rouge':'bleu'} !`);break}}}}
    for(const tm of[0,1]){const en=G.flags[1-tm],my=G.flags[tm];if(en.car&&!my.car&&V.len(V.sub([en.car.pos[0],0,en.car.pos[2]],[my.home[0],0,my.home[2]]))<4){const who=en.car;en.car=null;en.pos=[...en.home];G.score[tm]++;SFX[tm?'error':'levelUp']?.();scMessage(`${tm?'🔴 Les rouges':'🔵 Les bleus'} marquent ! ${G.score[0]} - ${G.score[1]}`,2.5);if(who===pl)G.sv.xp+=25;
        if(G.score[tm]>=3)G.endRound(tm===0)}}
    $('snT').textContent=`🔵 ${G.score[0]}  —  ${G.score[1]} 🔴`;$('snS').textContent=`Grade : ${G.rank()} (${G.sv.xp} XP) · ⏱ ${fmtT(G.time)}${G.flags[1].car===pl?' · 🚩 TU PORTES LE DRAPEAU':''}`},
  endRound(win){const G=this;if(G.over)return;G.over=true;const before=G.rank();G.sv.xp+=win?60:15;G.sv.rounds=(G.sv.rounds||0)+1;if(win){G.sv.wins=(G.sv.wins||0)+1;giveBlox(25,'Manche gagnée')}const after=G.rank();if(after!==before){toast('🎖️ Promotion : '+after);if(after==='Général'){giveBlox(150,'Général !');unlockBadge('neige')}}markDirty();
    showResult(win?'⛄ Victoire !':'❄️ Défaite…',`${G.score[0]} - ${G.score[1]} · Grade ${after} · ${G.sv.xp} XP`,[['Manche suivante',()=>restartGame()],['Quitter',()=>exitGame()]])},
  extraDraw(L){for(const s of this.shots)L.push({mesh:MESH.sphere,m:M.chain(M.T(...s.pos),M.S(.32,.32,.32)),mode:3,color:'#ffffff',shin:120});
    for(const f of this.flags){L.push({mesh:MESH.cyl,m:M.chain(M.T(f.pos[0],f.pos[1]+.6,f.pos[2]),M.S(.12,3.2,.12)),mode:3,color:'#d8dee6'},{mesh:MESH.box,m:M.chain(M.T(f.pos[0]+.65,f.pos[1]+1.8,f.pos[2]),M.RY(Math.sin(time*3)*.2),M.S(1.3,.8,.06)),mode:3,color:f.team?'#e5484d':'#3d7eff',emis:HDR?.6:.2})}
    for(const c of this.bots)if(c.bot.frz>0)L.push({mesh:MESH.rbox,m:M.chain(M.T(c.pos[0],c.pos[1]+1.3,c.pos[2]),M.S(1.4,2.8,1)),mode:9,color:'#bfe9ff',shin:200})},
  exit(){for(const c of[...(this.bots||[])])removeRemote(c);this.bots=[]}};

/* ============================== 9. PIZZERIA FOLLE ============================== */
const PZ_TOP=[['sauce','🍅 Sauce tomate','#e5484d'],['fromage','🧀 Fromage','#ffd23f'],['pepperoni','🍕 Pepperoni','#b3282d'],['champi','🍄 Champignons','#c8b28a'],['ananas','🍍 Ananas','#ffe27a'],['olive','🫒 Olives','#30343d']];
GAMES.pizzeria={name:'Pizzeria Folle',genre:'Tycoon',icon:'🍕',colors:['#e5484d','#ffd23f'],maxPlayers:8,music:'tycoon',
  desc:"Gère ta pizzeria pendant 15 jours : prends les commandes, prépare la pâte, ajoute les bons ingrédients, cuis et sers avant que les clients s'impatientent. Améliore le four, la déco et embauche un assistant entre chaque journée !",
  badges:['Jour 15 : +200 Blox','Journée parfaite : +20 Blox'],
  build(sv){const G=this;G.sv=sv;sv.day=sv.day||1;sv.cash=sv.cash||0;sv.up=sv.up||{};G.cust=[];G.hold=null;G.oven=[];G.dayT=180;G.served=0;G.lost=0;G.spT=3;G.open=true;setClock(13);
    B(0,-.5,0,60,1,50,{mat:'herbe'});B(0,.05,0,30,.1,24,{mat:'planches',color:sv.up.deco?'#7a4a2a':'#a0745a'});for(const[x,z,sx,sz]of[[0,-12,30,.4],[-15,0,.4,24],[15,0,.4,24]])B(x,3,z,sx,6,sz,{mat:'brique',color:sv.up.deco?'#c0504d':'#d8cbb5'});
    B(0,1,1,24,2,1.2,{mat:'bois',color:'#6d4a2a'});SIGN(0,7,12.5,'PIZZERIA FOLLE',true,{size:48});
    G.st=[['pate','🫓 Pâte',-11,-9],...PZ_TOP.map((t,i)=>[t[0],t[1],-7+i*3,-9]),['four','🔥 Four',11,-9],['poubelle','🗑️ Poubelle',13,-4]];
    for(const[id,name,x,z]of G.st){B(x,1,z,2.4,2,2,{mat:id==='four'?'brique':'lisse',color:id==='four'?'#7a2a20':PZ_TOP.find(t=>t[0]===id)?.[2]||'#d8dee6'});SIGN(x,2.9,z+1.2,name,false,{size:30,w:256,h:96})}
    WORLD.prompts=G.st.map(([id,name,x,z])=>({who:{pos:[x,0,z+2]},label:name,act:()=>G.station(id)}));
    G.seats=[-9,-4.5,0,4.5,9].map(x=>({x,c:null}));
    if(sv.up.deco)for(const[x,z]of[[-13,10],[13,10]])B(x,1,z,1,2,1,{mat:'lisse',color:'#2f8a3a'});if(sv.up.aide){const a=spawnNPC('Luigi (assistant)','client',[12,.2,-5],{still:true,quiet:true});a.av={...NPC_AV.client,haut:'tee_blanc',chapeau:'mp_chef'in IT?'mp_chef':null};G.aide=a;G.aideT=0}
    SPAWN={pos:[0,.2,-5],size:[4,.2,3]}},
  spawn(){return[0,.3,-5]},
  hud(el){el.innerHTML=`<div class="ghud center"><div class="gtitle" id="pzT"></div><div class="gsub" id="pzS"></div></div><div class="ghud quest" id="pzH"></div>`},
  station(id){const G=this;if(id==='pate'){if(G.hold)return toast('Tu as déjà une pizza en main');G.hold={top:[],cooked:0};SFX.pop?.();return}
    if(id==='poubelle'){G.hold=null;SFX.slip?.();return}
    if(id==='four'){const ready=G.oven.find(o=>o.t<=0);if(ready&&!G.hold){G.oven.splice(G.oven.indexOf(ready),1);G.hold=ready.p;G.hold.cooked=1;SFX.pickup();return}if(!G.hold)return toast('Rien à prendre');if(G.hold.cooked)return toast('Déjà cuite : sers-la !');if(G.oven.length>=(G.sv.up.four2?2:1))return toast('Four plein');
      G.oven.push({p:G.hold,t:G.sv.up.four?3:5.5});G.hold=null;SFX.whoosh?.();return}
    if(!G.hold)return toast('Prends d\'abord une pâte');if(G.hold.cooked)return toast('Trop tard, elle est cuite !');if(G.hold.top.includes(id))return;G.hold.top.push(id);SFX.click()},
  serve(c){const G=this,h=G.hold;if(!h)return;const ok=h.cooked&&h.top.length===c.order.length&&c.order.every(t=>h.top.includes(t));
    if(ok){const tip=Math.round(c.pat/c.max*12*(G.sv.up.pourb?2:1));const v=18+c.order.length*6+tip;G.sv.cash+=v;G.served++;floatText(V.add(c.pos,[0,3.2,0]),'+'+v+' $ 😋','#7dffb0');SFX.kaching();G.leave(c)}
    else{floatText(V.add(c.pos,[0,3.2,0]),'Ce n\'est pas ma commande ! 😠','#ff8a8a');SFX.error();c.pat-=8}G.hold=null},
  leave(c){const s=G_seat(this,c);if(s)s.c=null;removeRemote(c);this.cust.splice(this.cust.indexOf(c),1)},
  update(dt,t){const G=this,sv=G.sv;if(!G.open)return;G.dayT-=dt;
    G.spT-=dt;const free=G.seats.filter(s=>!s.c);if(G.spT<=0&&free.length&&G.dayT>8){G.spT=Math.max(3,12-sv.day*.55);const s=pick(free);const n=Math.min(PZ_TOP.length,2+Math.floor(sv.day/3)+(Math.random()<.4?1:0));
      const order=['sauce','fromage',...PZ_TOP.slice(2).map(t=>t[0]).sort(()=>Math.random()-.5)].slice(0,n);const c=spawnNPC(pick(['Paul','Inès','Hugo','Léa','Sami','Jade','Omar','Lou','Théo','Mia']),'client',[s.x,.2,10],{still:true,quiet:true,col:'#ffd23f'});
      c.av={...NPC_AV.client,haut:pick(['tee_bleu','tee_rouge','maillot','hoodie_gris','carreaux']),skin:pick(['#f1c27d','#e0ac69','#c68642','#8d5524','#ffdbac'])};c.order=order;c.max=c.pat=(sv.up.deco?70:55)-Math.min(25,sv.day*1.4);s.c=c;c.seat=s;G.cust.push(c);
      WORLD.prompts.push({who:c,label:'Servir',act:()=>G.serve(c),cust:1});say(c,order.map(o=>PZ_TOP.find(t=>t[0]===o)[1].split(' ')[0]).join(' '))}
    WORLD.prompts=WORLD.prompts.filter(p=>!p.cust||G.cust.includes(p.who));
    for(const c of[...G.cust]){const d=[c.seat.x-c.pos[0],0,2.7-c.pos[2]];c.forceWish=V.len(d)>.4?V.norm(d):[0,0,0];c.pat-=dt;if(c.pat<=0){G.lost++;floatText(V.add(c.pos,[0,3,0]),'Trop long ! 😤','#ff8a8a');SFX.error();G.leave(c)}}
    for(const o of G.oven)o.t-=dt;
    if(G.aide){G.aideT-=dt;if(G.aideT<=0){G.aideT=9;const c=G.cust.find(c=>c.pat<c.max*.6);if(c){const v=12+c.order.length*5;G.sv.cash+=v;G.served++;floatText(V.add(c.pos,[0,3.2,0]),'Luigi : +'+v+' $','#7dffb0');G.leave(c)}}}
    if(G.dayT<=0&&!G.cust.length){G.open=false;G.endDay()}
    const h=G.hold;$('pzT').textContent=`Jour ${sv.day} / 15 · ⏱ ${Math.max(0,Math.ceil(G.dayT))} s`;$('pzS').textContent=`💵 ${fmtCash(sv.cash)} · servis ${G.served} · partis ${G.lost}${G.oven.length?' · four : '+G.oven.map(o=>o.t>0?Math.ceil(o.t)+' s':'PRÊTE').join(', '):''}`;
    $('pzH').textContent=h?`En main : pâte ${h.top.map(x=>PZ_TOP.find(t=>t[0]===x)[1].split(' ')[0]).join('')}${h.cooked?' (cuite) → sers le client':' → four'}`:'Prends une pâte (E)'},
  endDay(){const G=this,sv=G.sv;const perfect=G.lost===0&&G.served>0;if(perfect)giveBlox(20,'Journée parfaite');giveBlox(5+sv.day,'Fin de journée');
    if(sv.day>=15){giveBlox(200,'15 jours de pizzeria !');unlockBadge('pizza');sv.day=1;sv.up={};sv.cash=0;markDirty();return showResult('🍕 Chef étoilé !','Tu as tenu ta pizzeria 15 jours ! Une nouvelle saison commence.',[['Nouvelle saison',()=>restartGame()]])}
    sv.day++;markDirty();const U=[['four','🔥 Four rapide',300],['four2','🔥 Deuxième four',700],['deco','🌿 Déco (clients plus patients)',500],['pourb','💰 Pourboires ×2',900],['aide','👨‍🍳 Assistant Luigi',1500]];
    const b=U.filter(u=>!sv.up[u[0]]).map(u=>[`${u[1]} · ${u[2]} $`,()=>{if(sv.cash<u[2])return SFX.error();sv.cash-=u[2];sv.up[u[0]]=1;SFX.buy();markDirty();dlgReopen(()=>G.endDayMenu(b0))}]);const b0=b;
    G.endDayMenu=()=>openDialog(`🌙 Fin du jour ${sv.day-1}`,`Servis : ${G.served} · partis : ${G.lost}${perfect?' · ⭐ parfait !':''}\nCaisse : ${fmtCash(sv.cash)}`,[...U.filter(u=>!sv.up[u[0]]).map(u=>[`${u[1]} · ${u[2]} $`,()=>{if(sv.cash<u[2])return SFX.error();sv.cash-=u[2];sv.up[u[0]]=1;SFX.buy();markDirty();dlgReopen(()=>G.endDayMenu())}]),[`☀️ Ouvrir le jour ${sv.day}`,()=>restartGame()]]);G.endDayMenu()},
  extraDraw(L){const G=this;const pz=(p,h)=>{L.push({mesh:MESH.cyl,m:M.chain(M.T(...p),M.S(1.2,.12,1.2)),mode:3,color:h.cooked?'#d9a45a':'#f3dcb0'});h.top.forEach((x,i)=>{const c=PZ_TOP.find(t=>t[0]===x)[2];if(x==='sauce'||x==='fromage')L.push({mesh:MESH.cyl,m:M.chain(M.T(p[0],p[1]+.07+i*.01,p[2]),M.S(x==='sauce'?1.05:.95,.04,x==='sauce'?1.05:.95)),mode:3,color:c});else for(let k=0;k<5;k++)L.push({mesh:MESH.sphere,m:M.chain(M.T(p[0]+Math.cos(k*1.3+i)*.35,p[1]+.12,p[2]+Math.sin(k*1.3+i)*.35),M.S(.14,.06,.14)),mode:3,color:c})})};
    if(G.hold&&pl)pz(V.add(pl.pos,[Math.sin(pl.yaw)*.8,1.5,Math.cos(pl.yaw)*.8]),G.hold);G.oven.forEach((o,i)=>{pz([11,2.2+i*.3,-9],o.p);if(o.t<=0)glow([11,2.6,-9],[3,1.5,.3],1.4)})},
  exit(){for(const c of[...(this.cust||[])])removeRemote(c);this.cust=[];if(this.aide)removeRemote(this.aide);this.aide=null}};
function G_seat(G,c){return G.seats.find(s=>s.c===c)}

/* ============================== 10. ÉVASION DE PRISON ============================== */
GAMES.prison={name:'Évasion de Prison',genre:'Aventure',icon:'🔐',colors:['#30343d','#ff8a3d'],maxPlayers:8,music:'horreur',
  desc:"Aventure d'infiltration en 6 chapitres : trouve des objets, déchiffre des codes, évite les gardiens et les projecteurs, traverse les égouts et fuis la prison de Rocamur ! (Accroupi = moins repéré.)",
  badges:['Évasion : +150 Blox','Sans se faire prendre : +100 Blox'],
  build(sv){const G=this;G.sv=sv;G.ch=sv.ch||0;G.inv=new Set(sv.inv||[]);G.caught=0;G.time=0;G.code=sv.code||String(1000+Math.floor(Math.random()*9000));sv.code=G.code;G.guards=[];G.lights2=[];setClock(21);WORLD.lights=[];
    const W='#5d6168',wall=(x,z,sx,sz,h=5)=>B(x,h/2,z,sx,h,sz,{mat:'beton',color:W});
    B(0,-.5,0,200,1,200,{mat:'herbe',color:'#2a3a26'});B(0,.04,0,80,.08,60,{mat:'beton',color:'#4a4d52'});B(0,5.2,-6,80,.4,48,{mat:'beton',color:'#3a3d42'});
    // cellules (ch0)
    wall(0,-30,80,.5);for(let i=0;i<=5;i++)wall(-34+i*8,-26,.4,8);for(let i=0;i<5;i++){const b=B(-30+i*8,2.5,-22,7.6,5,.3,{mat:'metal',color:'#30343d',alpha:.6});if(i===2)G.bars=b}
    B(-16,.5,-28.5,3,1,1.6,{mat:'lisse',color:'#9aa4b2'});G.vent=B(-10.4,1.2,-26,.3,1.6,1.6,{mat:'metal',color:'#7d7f84'});
    // couloir (ch1), cantine à l'ouest, bureau à l'est (ch2)
    wall(-34,-6,.5,48);wall(34,-6,.5,48);wall(-32,-12,4,.5);wall(-15,-12,22,.5);wall(9,-12,10,.5);wall(26,-12,16,.5);G.doorOffice=B(16,2.5,-12,4,5,.4,{mat:'metal',color:'#b3282d'});
    wall(-12,2,.5,28);wall(12,2,.5,28);wall(-7,16,10,.5);wall(7,16,10,.5);wall(-23,16,22,.5);wall(23,16,22,.5);G.doorYard=B(0,2.5,16,4,5,.4,{mat:'metal',color:'#3d7eff'});
    for(const[x,z]of[[-24,-4],[-24,6],[-28,0]])B(x,.8,z,6,.2,2,{mat:'bois'});SIGN(-24,4,-10.5,'CANTINE',false,{size:40});SIGN(24,4,-10.5,'BUREAU DU DIRECTEUR',false,{size:34});
    B(28,.9,4,4,1.8,2,{mat:'bois',color:'#5a3a24'});G.safe=B(30,1,12,1.6,2,1.6,{mat:'metal',color:'#30343d'});
    // cour (ch3) : projecteurs, clôture, cabane
    B(0,3,62,80,6,.4,{mat:'metal',color:'#7d7f84',alpha:.5});for(const x of[-40,40])B(x,3,40,.4,6,44,{mat:'metal',color:'#7d7f84',alpha:.5});G.fence=B(20,3,62.3,8,6,.5,{mat:'metal',color:'#9aa4b2',alpha:.6});
    B(-28,1.5,48,6,3,5,{mat:'planches'});B(-28,3.2,48,7,.4,6,{mat:'beton'});for(const[x,z]of[[-36,24],[36,24]]){B(x,5,z,1,10,1,{mat:'metal'});B(x,10,z,2,1,2,{mat:'neon',color:'#ffffcc',nocol:1})}
    G.spots=[{c:[-10,0,38],r:4.5,a:0,sp:.7,R:12},{c:[12,0,46],r:4.5,a:2,sp:-.9,R:10},{c:[0,0,30],r:4,a:4,sp:1.1,R:14}];
    // égout (ch4) : canal à traverser à la nage, puis forêt (ch5) et camionnette
    B(0,-.5,130,200,1,60,{mat:'herbe',color:'#2a3a26'});for(const x of[14.6,25.4])B(x,1.4,80,.8,2.8,32,{mat:'beton',color:'#3a3d42'});waters.push({pos:[20,1.1,80],size:[10,2.2,30],swimAt:.5,color:'#4a5a3a'});
    for(let i=0;i<40;i++){const x=rnd(-90,90),z=rnd(100,150);if(Math.abs(x-20)<8)continue;TREE(x,z,3.4,3.2)}B(20,1.2,140,4,2.4,7,{mat:'lisse',color:'#f2f2f2'});G.van={pos:[20,1.5,140],size:[6,4,9]};
    // gardiens
    const gd=(name,path,sp)=>{const c=spawnNPC(name,'garde',[path[0][0],.2,path[0][2]],{still:true,quiet:true,col:'#ff6b6b'});c.walk=sp;c.gp={path,i:1,alert:0};G.guards.push(c)};
    gd('Gardien Marcel',[[-30,0,-19],[30,0,-19]],3.6);gd('Gardienne Josie',[[-30,0,-15],[0,0,-15],[0,0,10],[0,0,-15]],3.4);gd('Gardien Bruno',[[20,0,-8],[30,0,6],[20,0,12]],3);gd('Chef Gaston',[[-30,0,26],[30,0,26],[30,0,54],[-30,0,54]],4.2);gd('Gardien Kévin',[[6,0,40],[-20,0,40]],3.8);
    G.notes=[[-12,1.2,-29,'Gribouillé sur le mur : « Le 1er chiffre est '+G.code[0]+' »'],[-24,1.2,6,'Un ticket de cantine : « 2e chiffre : '+G.code[1]+' »'],[-30,1.2,-6,'Sous un plateau : « 3e : '+G.code[2]+' »'],[8,1.2,-15,'Un post-it tombé : « dernier chiffre '+G.code[3]+' »']];
    for(const n of G.notes)B(n[0],n[1],n[2],.6,.05,.4,{mat:'lisse',color:'#fff6a8',nocol:1});
    WORLD.prompts=[{who:{pos:[-16,0,-28.5]},label:'Fouiller le lit',act:()=>G.give('cuillere','🥄 Une cuillère cachée sous le matelas !')},{who:{pos:[-10.8,0,-26]},label:'Grille d\'aération',act:()=>G.ventAct()},
      ...G.notes.map(n=>({who:{pos:[n[0],0,n[2]]},label:'Lire',act:()=>{openDialog('📝 Note',n[3],[['OK',null]]);G.inv.add('note'+n[0])}})),{who:{pos:[16,0,-13]},label:'Digicode',act:()=>G.keypad('',0)},
      {who:{pos:[28,0,4]},label:'Fouiller le bureau',act:()=>G.give('tournevis','🪛 Un tournevis !')},{who:{pos:[30,0,10.5]},label:'Coffre-fort',act:()=>G.inv.has('tournevis')?G.give('badge','💳 Le badge du directeur ! (le coffre était mal fermé, le tournevis l\'a ouvert)'):toast('Le coffre est vissé… il faudrait un outil')},
      {who:{pos:[0,0,14.6]},label:'Porte de la cour',act:()=>G.door(G.doorYard,'badge',3)},{who:{pos:[-28,0,45]},label:'Cabane à outils',act:()=>G.give('pince','✂️ Une pince coupante !')},{who:{pos:[20,0,61]},label:'Clôture',act:()=>G.door(G.fence,'pince',4)}];
    G.cps=[[-14,.3,-26],[-14,.3,-17],[24,.3,-6],[0,.3,20],[20,.3,66],[20,.3,100]];for(let i=0;i<=G.ch;i++)G.apply(i);WORLD.voidY=-30},
  apply(i){const G=this,op=b=>{b.nocol=true;b.alpha=.1};if(i>=1){op(G.vent);op(G.bars)}if(i>=2)op(G.doorOffice);if(i>=3&&G.inv.has('badge'))op(G.doorYard);if(i>=4)op(G.fence);refreshSolids()},
  setCh(i,msg){const G=this;if(i<=G.ch)return;G.ch=i;G.sv.ch=i;G.sv.inv=[...G.inv];G.apply(i);SFX.quest();scMessage(msg,3.5);markDirty()},
  give(id,msg){if(this.inv.has(id))return toast('Déjà pris');this.inv.add(id);SFX.pickup();toast(msg);this.sv.inv=[...this.inv];markDirty();if(id==='badge')this.setCh(3,'Chapitre 4 : ouvre la porte de la cour avec le badge, puis évite les projecteurs !')},
  ventAct(){const G=this;if(!G.inv.has('cuillere'))return toast('La grille est vissée… il faudrait quelque chose de plat');G.setCh(1,'Chapitre 2 : le couloir (évite les gardiens, trouve les 4 chiffres du code)');SFX.door?.()},
  keypad(cur,k){const G=this;if(G.ch>=2)return;openDialog('🔢 Digicode du bureau',`Code : ${cur.padEnd(4,'•')}\nIndices : des notes sont cachées dans la prison.`,[...'1234567890'.split('').map(d=>[d,()=>{const n=cur+d;if(n.length<4)dlgReopen(()=>{G.keypad(n);dlgGrid()});else if(n===G.code){G.doorOffice.nocol=true;G.doorOffice.alpha=.1;refreshSolids();SFX.door?.();G.setCh(2,'Chapitre 3 : le bureau du directeur');toast('✅ Code correct !')}else{SFX.error();toast('❌ Mauvais code')}}]),['Annuler',null]]);dlgGrid()},
  door(b,item,ch){const G=this;if(!G.inv.has(item))return toast(item==='badge'?'🔒 Il faut le badge du directeur':'La clôture est trop solide… une pince ?');b.nocol=true;b.alpha=.1;refreshSolids();SFX.door?.();if(ch===4)G.setCh(4,'Chapitre 5 : le canal d\'égout, nage jusqu\'à la forêt !')},
  spawn(){const c=this.cps[Math.min(this.ch,this.cps.length-1)];return[...c]},
  hud(el){el.innerHTML=`<div class="ghud center"><div class="gtitle" id="prT"></div><div class="gsub" id="prS"></div></div><div class="ghud quest" id="prI"></div>`},
  los(a,b){for(let k=1;k<8;k++){const p=V.add(V.lerp?V.lerp(a,b,k/8):V.add(a,V.mul(V.sub(b,a),k/8)),[0,1.5,0]);for(const s of solids)if(s.size[1]>1.2&&s.size[1]<20&&Math.abs(s.pos[0]-p[0])<s.size[0]/2&&Math.abs(s.pos[1]-p[1])<s.size[1]/2&&Math.abs(s.pos[2]-p[2])<s.size[2]/2)return false}return true},
  catchMe(who){const G=this;if(G.cool>0)return;G.cool=2;G.caught++;G.sv.caught=(G.sv.caught||0)+1;scMessage(`🚨 ${who} t'a repéré ! Retour en arrière…`,2.4);SFX.scream?.();shake=.4;pl.pos=this.spawn();pl.vel=[0,0,0];markDirty()},
  update(dt,t){const G=this;G.time+=dt;G.cool=Math.max(0,(G.cool||0)-dt);worldFx(dt,t,false);
    for(const c of G.guards){const g=c.gp,w=g.path[g.i%g.path.length],d=V.sub(w,c.pos);d[1]=0;if(V.len(d)<1)g.i++;c.forceWish=V.norm(d);
      const f=[Math.sin(c.yaw),0,Math.cos(c.yaw)],to=V.sub(pl.pos,c.pos);to[1]=0;const L=V.len(to),seeR=pl.crouch?5.5:10;if(!pl.dead&&L<seeR&&Math.abs(pl.pos[1]-c.pos[1])<2&&V.dot(V.mul(to,1/(L||1)),f)>.45&&G.los(c.pos,pl.pos))G.catchMe(c.name)}
    if(G.ch===3)for(const s of G.spots){s.a+=s.sp*dt;const p=[s.c[0]+Math.cos(s.a)*s.R,0,s.c[2]+Math.sin(s.a)*s.R*.6];s.p=p;if(Math.hypot(pl.pos[0]-p[0],pl.pos[2]-p[2])<s.r&&pl.pos[1]<2)G.catchMe('Un projecteur')}
    if(G.ch===4&&pl.pos[2]>97)G.setCh(5,'Chapitre 6 : la forêt ! Rejoins la camionnette blanche');
    if(G.ch>=5&&!G.won&&inBox(V.add(pl.pos,[0,1,0]),G.van)){G.won=true;G.sv.ch=0;G.sv.inv=[];G.sv.code=null;G.sv.wins=(G.sv.wins||0)+1;giveBlox(150,'Évasion réussie !');if(!G.caught){giveBlox(100,'Sans se faire prendre !')}unlockBadge('evasion');markDirty();confetti(V.add(pl.pos,[0,2,0]));
      showResult('🔓 Libre !',`Évadé en ${fmtT(G.time)} · repéré ${G.caught} fois.`,[['Rejouer',()=>restartGame()],['Quitter',()=>exitGame()]])}
    const CH=['Cellule : trouve un moyen de sortir','Couloir : trouve les 4 chiffres du code du bureau','Bureau : trouve le badge du directeur','Cour : ouvre la porte, trouve une pince, coupe la clôture','Égout : nage vers la forêt','Forêt : rejoins la camionnette'];
    $('prT').textContent=`Chapitre ${G.ch+1} / 6`;$('prS').textContent=CH[G.ch]+` · ⏱ ${fmtT(G.time)} · repéré ${G.caught}×`;$('prI').textContent='🎒 '+([...G.inv].filter(x=>!x.startsWith('note')).map(x=>({cuillere:'🥄',tournevis:'🪛',badge:'💳',pince:'✂️'})[x]).join(' ')||'vide')+` · notes lues ${[...G.inv].filter(x=>x.startsWith('note')).length}/4`},
  extraDraw(L){const G=this;if(G.ch===3)for(const s of G.spots)if(s.p){L.push({mesh:MESH.cyl,m:M.chain(M.T(s.p[0],.06,s.p[2]),M.S(s.r*2,.05,s.r*2)),mode:3,color:'#fff6b0',emis:HDR?1.6:.6})}
    for(const c of G.guards){const f=[Math.sin(c.yaw),0,Math.cos(c.yaw)];L.push({mesh:MESH.cone,m:M.chain(M.T(c.pos[0]+f[0]*4,.05,c.pos[2]+f[2]*4),M.RY(c.yaw),M.RX(Math.PI/2),M.S(5,8,.05)),mode:9,color:'#ff4d4d'})}},
  exit(){WORLD.lights=[]}};

for(const r of RODS)r[2]=Math.round(r[2]*2);for(const z of FZONES)z[1]=Math.round(z[1]*2.5);for(const z of PZONES)z[1]=Math.round(z[1]*2);
