"use strict";
/* ============================================================================
   NOUVEAUX JEUX (3/3) : Dernier Cube Debout (battle royale), Ferme Paradis,
   Donjon Infini, Naufragés (survie), Fuis la Marée, Foot Cube, Cache-Cache Géant
   ============================================================================ */
NPC_AV.soldat={skin:'#e0ac69',haut:'ninja',bas:'cargo',visage:'serieux',chapeau:'casquette_envers',cheveux:null,lunettes:null,dos:null,cou:null,epaule:null};
NPC_AV.crabe={skin:'#e5484d',haut:'tee_rouge',bas:'short',visage:'fache',chapeau:null,cheveux:null,lunettes:null,dos:null,cou:null,epaule:null};
const BRW={batte:{n:'Batte',ic:'🏏',melee:30,range:2.6,cd:.45},pistolet:{n:'Pistolet',ic:'🔫',dmg:18,cd:.35,sp:50,r:.04},pompe:{n:'Pompe',ic:'💥',dmg:12,cd:.85,sp:42,n:7,r:.2,life:.45},mitra:{n:'Mitraillette',ic:'🔥',dmg:9,cd:.09,sp:55,r:.07},sniper:{n:'Sniper',ic:'🎯',dmg:80,cd:1.4,sp:120,r:0,life:1.2}};
function brShot(G,from,o,dir){const W=BRW[o];for(let i=0;i<(W.n||1);i++){const a=Math.atan2(dir[0],dir[2])+rnd(-W.r,W.r);G.shots.push({pos:V.add(from.pos,[Math.sin(a)*1,1.5,Math.cos(a)*1]),vel:[Math.sin(a)*W.sp,0,Math.cos(a)*W.sp],life:W.life||.9,dmg:W.dmg,from})}}

/* ============================== 11. DERNIER CUBE DEBOUT ============================== */
GAMES.royale={name:'Dernier Cube Debout',genre:'Combat',icon:'🪂',colors:['#2f6a3a','#ff8a3d'],maxPlayers:12,music:'boss',
  desc:"Battle royale contre 19 combattants : fouille les coffres (5 armes, soins, armure), reste dans la zone qui rétrécit et sois le dernier debout ! Chaque élimination et chaque place comptent.",
  badges:['Top 1 : +80 Blox','Élimination : +3 Blox'],
  build(sv){const G=this;G.sv=sv;sv.wins=sv.wins||0;sv.kills=sv.kills||0;G.hp=100;G.arm=0;G.inv=['batte'];G.wi=0;G.cd=0;G.shots=[];G.bots=[];G.kills=0;G.t=0;G.alive=20;G.over=false;setClock(16);
    B(0,-.5,0,220,1,220,{mat:'herbe'});for(let i=0;i<40;i++){const x=rnd(-95,95),z=rnd(-95,95);TREE(x,z,3+rnd(0,2),3+rnd(0,1.5))}
    G.chests=[];for(const[x,z,c]of[[-50,-50,'#7a4a3a'],[50,-50,'#4a5a7a'],[-50,50,'#6a6a4a'],[50,50,'#5a3a5a'],[0,0,'#3a5a4a'],[0,-70,'#7a3a3a'],[-75,0,'#4a4a6a'],[75,10,'#6a4a3a'],[20,70,'#3a4a5a']]){KIT.house(x,z,14,12,5,c);G.chests.push({pos:[x,.6,z-2],open:false},{pos:[x+4,.6,z+3],open:false})}
    for(let i=0;i<14;i++)G.chests.push({pos:[rnd(-90,90),.6,rnd(-90,90)],open:false});for(const ch of G.chests)ch.b=B(ch.pos[0],ch.pos[1],ch.pos[2],1.4,1.2,1,{mat:'bois',color:'#c8a24a'});
    WORLD.prompts=G.chests.map(ch=>({who:{pos:ch.pos},label:'Ouvrir',act:()=>G.loot(ch)}));
    G.zone={c:[rnd(-30,30),0,rnd(-30,30)],r:130,tr:130,phase:0,t:40};
    for(let i=0;i<19;i++){const a=i/19*6.283,c=spawnNPC(pick(['Rex','Mila','Tom','Zoé','Kai','Lina','Max','Nora','Sam','Iris','Léon','Ava','Noé','Jade','Ugo','Eva','Tim','Lou','Ben'])+' (bot)','soldat',[Math.cos(a)*70,.3,Math.sin(a)*70],{still:true,quiet:true,col:'#ffb36b'});
      c.av={...NPC_AV.soldat,haut:pick(['ninja','hoodie_gris','tee_rouge','carreaux','maillot']),skin:pick(['#f1c27d','#e0ac69','#c68642','#8d5524'])};c.br={hp:100,w:pick(['batte','pistolet','pistolet','pompe']),cd:rnd(0,1),wan:[rnd(-60,60),0,rnd(-60,60)],aim:.5+rnd(0,.35)};c.walk=6.4;G.bots.push(c)}
    WORLD.voidY=-30},
  spawn(){return[rnd(-80,80),.4,rnd(-80,80)]},
  hud(el){el.innerHTML=KIT.hud(`<div class="ghud center"><div class="gtitle" id="brT"></div><div class="gsub" id="brS"></div></div><div class="ghud quest" id="brW"></div>`)},
  loot(ch){const G=this;if(ch.open)return;ch.open=true;ch.b.color='#6d4a2a';const r=Math.random();if(r<.55){const w=pick(['pistolet','pompe','mitra','sniper','pompe','mitra']);if(!G.inv.includes(w))G.inv.push(w);G.wi=G.inv.indexOf(w);toast(`${BRW[w].ic} ${BRW[w].n} (Q pour changer)`)}else if(r<.8){G.hp=Math.min(100,G.hp+50);toast('❤️ Soin +50')}else{G.arm=Math.min(100,G.arm+50);toast('🛡️ Armure +50')}SFX.pickup();sparks(ch.pos,[3,2.4,.5],14)},
  hurtMe(d,by){const G=this;if(pl.dead||G.over)return;const a=Math.min(G.arm,d*.6);G.arm-=a;G.hp-=d-a;SFX.hurt?.();shake=.2;floatText(V.add(pl.pos,[0,3,0]),'-'+Math.round(d),'#ff6b6b');if(G.hp<=0){G.hp=0;G.end(false,by)}},
  hurtBot(c,d,by){const G=this,b=c.br;if(!b||b.hp<=0)return;b.hp-=d;floatText(V.add(c.pos,[0,3.1,0]),String(Math.round(d)),by===pl?'#ffffff':'#bbbbbb');if(by===pl)SFX.hit?.();if(b.hp<=0){sparks(V.add(c.pos,[0,1.2,0]),[3,1,1],18);removeRemote(c);G.bots.splice(G.bots.indexOf(c),1);G.alive--;if(by===pl){G.kills++;giveBlox(3,'Élimination');sys(`💀 Tu as éliminé ${c.name}`)}else if(by)sys(`💀 ${by.name} a éliminé ${c.name}`)}},
  input(k){const G=this;if(k==='potion'){G.wi=(G.wi+1)%G.inv.length;toast(BRW[G.inv[G.wi]].ic+' '+BRW[G.inv[G.wi]].n);return}if(k!=='attack'||G.cd>0||pl.dead||G.over)return;const W=BRW[G.inv[G.wi]];G.cd=W.cd;
    if(W.melee){pl.swing=.38;SFX.sword?.();const f=[Math.sin(pl.yaw),0,Math.cos(pl.yaw)];for(const c of[...G.bots]){const d=V.sub(c.pos,pl.pos);d[1]=0;if(V.len(d)<W.range&&V.dot(V.norm(d),f)>.2)G.hurtBot(c,W.melee,pl)}}else{brShot(G,pl,G.inv[G.wi],[Math.sin(pl.yaw),0,Math.cos(pl.yaw)]);SFX.pop?.()}},
  end(win,by){const G=this;if(G.over)return;G.over=true;const place=win?1:G.alive;const bl=win?80:Math.max(2,Math.round(30-place*1.5));G.sv.kills+=G.kills;if(win){G.sv.wins++;unlockBadge('royale');confetti(V.add(pl.pos,[0,2,0]))}else die(pl,false);giveBlox(bl,`Top ${place}`);markDirty();
    showResult(win?'🏆 DERNIER CUBE DEBOUT !':`💀 Éliminé${by?' par '+by.name:''}`,`Place : ${place}/20 · ${G.kills} élimination(s) · +${bl} Blox`,[['Nouvelle partie',()=>restartGame()],['Quitter',()=>exitGame()]])},
  update(dt,t){const G=this;G.t+=dt;G.cd-=dt;const Z=G.zone;Z.t-=dt;if(Z.t<=0&&Z.phase<6){Z.phase++;Z.tr=[95,70,48,30,16,4][Z.phase-1];Z.t=50;Z.c=V.add(Z.c,[rnd(-1,1)*Z.tr*.25,0,rnd(-1,1)*Z.tr*.25]);scMessage(`⚠️ La zone rétrécit ! (${Z.phase}/6)`,2.5);SFX.thunder?.()}Z.r=lerp(Z.r,Z.tr,dt*.12);
    const out=c=>Math.hypot(c.pos[0]-Z.c[0],c.pos[2]-Z.c[2])>Z.r;if(!pl.dead&&!G.over&&out(pl))G.hurtMe(dt*(2+Z.phase*1.5),null);
    for(const c of[...G.bots]){const b=c.br;b.cd-=dt;if(out(c))G.hurtBot(c,dt*(2+Z.phase*1.5),null);if(!G.bots.includes(c))continue;
      let tg=null,td=22;const cand=[...(pl.dead||G.over?[]:[pl]),...G.bots.filter(x=>x!==c)];for(const e of cand){const d=V.len(V.sub(e.pos,c.pos));if(d<td){td=d;tg=e}}
      let goal=out(c)?Z.c:b.wan;if(V.len(V.sub([goal[0],0,goal[2]],[c.pos[0],0,c.pos[2]]))<4)b.wan=V.add(Z.c,[rnd(-1,1)*Z.r*.6,0,rnd(-1,1)*Z.r*.6]);
      if(tg){const W=BRW[b.w],d=V.sub(tg.pos,c.pos);d[1]=0;const L=V.len(d);goal=W.melee?tg.pos:(L<8?V.sub(c.pos,d):L>16?tg.pos:V.add(c.pos,[d[2],0,-d[0]]));c.yaw=Math.atan2(d[0],d[2]);
        if(b.cd<=0){b.cd=W.cd*(1.6+rnd(0,1));if(W.melee){if(L<2.2){c.swing=.3;tg===pl?G.hurtMe(W.melee*.7,c):G.hurtBot(tg,W.melee,c)}}else{const ad=V.norm(V.add(d,[rnd(-1,1)*(1-b.aim)*L*.15,0,rnd(-1,1)*(1-b.aim)*L*.15]));brShot(G,c,b.w,ad);c.swing=.2}}}
      const dd=V.sub(goal,c.pos);dd[1]=0;c.forceWish=V.len(dd)>1?V.norm(dd):[0,0,0]}
    for(let i=G.shots.length-1;i>=0;i--){const s=G.shots[i];s.life-=dt;const p0=s.pos;s.pos=V.add(s.pos,V.mul(s.vel,dt));let hit=false;
      for(const e of[pl,...G.bots]){if(e===s.from||e.dead)continue;const q=V.sub(e.pos,s.pos);if(Math.abs(q[0])<.7&&Math.abs(q[2])<.7&&s.pos[1]>e.pos[1]&&s.pos[1]<e.pos[1]+2.7){e===pl?G.hurtMe(s.dmg,s.from):G.hurtBot(e,s.dmg,s.from);hit=true;break}}
      if(hit||s.life<=0||solids.some(b=>b.kind==='solid'&&b.size[1]<20&&Math.abs(b.pos[0]-s.pos[0])<b.size[0]/2&&Math.abs(b.pos[1]-s.pos[1])<b.size[1]/2&&Math.abs(b.pos[2]-s.pos[2])<b.size[2]/2)){sparks(s.pos,[2,1.6,.6],3,.3);G.shots.splice(i,1)}}
    if(!G.over&&G.alive<=1&&!pl.dead)G.end(true);
    $('kHb').style.width=G.hp+'%';$('kHt').textContent=`❤️ ${Math.ceil(G.hp)}${G.arm>0?' · 🛡️ '+Math.ceil(G.arm):''}`;$('brT').textContent=`🧍 ${G.alive} en vie · 💀 ${G.kills}`;
    $('brS').textContent=`Zone ${G.zone.phase}/6 · rétrécit dans ${Math.ceil(G.zone.t)} s${out(pl)?' · ⚠️ HORS ZONE !':''}`;$('brW').textContent=`${G.inv.map((w,i)=>(i===G.wi?'▶':'')+BRW[w].ic).join(' ')} · Q : changer · E : coffres · victoires ${G.sv.wins}`},
  extraDraw(L){const G=this;for(const s of G.shots)L.push({mesh:MESH.box,m:M.chain(M.T(...s.pos),M.RY(Math.atan2(s.vel[0],s.vel[2])),M.S(.08,.08,.7)),mode:3,color:'#ffd23f',emis:HDR?3:1});
    const Z=G.zone;for(let i=0;i<64;i++){const a=i/64*6.283,p=[Z.c[0]+Math.cos(a)*Z.r,0,Z.c[2]+Math.sin(a)*Z.r];if(inView([p[0],10,p[2]],12))L.push({mesh:MESH.box,m:M.chain(M.T(p[0],10,p[2]),M.RY(-a),M.S(.3,20,Z.r*6.283/64)),mode:9,color:'#7a5cff'})}},
  exit(){for(const c of[...(this.bots||[])])removeRemote(c);this.bots=[]}};

/* ============================== 12. FERME PARADIS ============================== */
const CROPS=[['ble','🌾 Blé',0,25,6,'#e6c27a'],['carotte','🥕 Carotte',20,50,16,'#ff8a3d'],['tomate','🍅 Tomate',60,90,40,'#e5484d'],['mais','🌽 Maïs',150,140,90,'#ffd23f'],['fraise','🍓 Fraise',400,200,220,'#ff4f6a'],['citrouille','🎃 Citrouille',900,320,520,'#ff7a1a'],['melon','🍈 Melon d\'or',2500,480,1500,'#f2d24a'],['etoile','🌟 Fruit étoile',8000,720,5200,'#b46bff']];
GAMES.ferme={name:'Ferme Paradis',genre:'Simulateur',icon:'🚜',colors:['#4fa046','#ffd23f'],maxPlayers:12,music:'sandbox',
  desc:"Ta ferme pousse même quand tu n'es pas là ! Plante 8 cultures (du blé au fruit étoile), arrose pour doubler la vitesse, récolte, vends au marché, élève poules et vaches, agrandis tes champs et achète l'arroseur automatique et le tracteur.",
  badges:['Fruit étoile : +100 Blox','Ferme complète : +200 Blox'],
  build(sv){const G=this;G.sv=sv;sv.cash=sv.cash??30;sv.plots=sv.plots||8;sv.f=sv.f||{};sv.inv=sv.inv||{};sv.an=sv.an||{poule:0,vache:0};sv.up=sv.up||{};sv.anT=sv.anT||Date.now();setClock(10);
    B(0,-.5,0,140,1,140,{mat:'herbe'});for(let i=0;i<8;i++)TREE(-60+i*17,-58,3,3);B(-30,2.5,-40,14,5,10,{mat:'planches',color:'#a0302a'});B(-30,5.6,-40,15,1.2,11,{mat:'planches',color:'#5a2a20'});SIGN(-30,4,-34.9,'GRANGE',false,{size:40});
    B(26,1.2,-36,6,2.4,4,{mat:'bois',color:'#8d5a2b'});SIGN(26,3.6,-33.9,'💰 MARCHÉ',false,{size:40});B(40,1.2,-36,6,2.4,4,{mat:'bois',color:'#3d7eff'});SIGN(40,3.6,-33.9,'🛒 MAGASIN',false,{size:40});
    for(let x=-60;x<=60;x+=4)B(x,.6,-62,.3,1.2,.3,{mat:'bois'});G.plotB=[];
    for(let i=0;i<32;i++){const x=-21+(i%8)*6,z=-14+Math.floor(i/8)*6;const b=B(x,.1,z,4.6,.2,4.6,{mat:'terre',color:i<sv.plots?'#5a3a24':'#3a5a2a',nocol:1});G.plotB.push({i,x,z,b})}
    G.anim=[];for(let k=0;k<Math.min(10,sv.an.poule);k++)G.anim.push({t:'p',pos:[rnd(-40,-20),0,rnd(-25,-15)],yaw:0,tg:null});for(let k=0;k<Math.min(6,sv.an.vache);k++)G.anim.push({t:'v',pos:[rnd(-45,-15),0,rnd(-34,-28)],yaw:0,tg:null});for(let x=-48;x<=-12;x+=3)B(x,.5,-12,.2,1,.2,{mat:'bois'});
    WORLD.prompts=[...G.plotB.map(P=>({who:{pos:[P.x,0,P.z]},label:'Champ',act:()=>G.plot(P)})),{who:{pos:[26,0,-34]},label:'Vendre',act:()=>G.sell()},{who:{pos:[40,0,-34]},label:'Magasin',act:()=>G.shop()},{who:{pos:[-30,0,-34]},label:'Ramasser',act:()=>G.collect()}];
    SPAWN={pos:[0,.2,14],size:[4,.2,4]};const away=(Date.now()-(sv.anT||Date.now()))/1000;if(away>120)setTimeout(()=>toast('🌱 Tes cultures ont poussé pendant ton absence !'),2500)},
  spawn(){return[0,.3,14]},
  hud(el){el.innerHTML=`<div class="ghud left"><div class="gtitle">💰 <span id="fmC"></span></div><div class="gsub" id="fmS"></div></div><div class="ghud quest" id="fmQ">E près d'un champ : planter / récolter · arroser = ×2</div>`},
  grow(P){const f=this.sv.f[P.i];if(!f)return 0;const C=CROPS.find(c=>c[0]===f.c),sp=(f.w||this.sv.up.arroseur?2:1);return Math.min(1,(Date.now()-f.t)/1000*sp/C[3])},
  plot(P){const G=this,sv=G.sv;if(P.i>=sv.plots)return toast('🔒 Champ à acheter au magasin');const f=sv.f[P.i];
    if(!f){openDialog('🌱 Planter',`${fmtCash(sv.cash)}`,[...CROPS.map(C=>[`${C[1]} · graine ${C[2]} $ · ${Math.round(C[3]/60*10)/10} min → ${C[4]} $`,()=>{if(sv.cash<C[2])return SFX.error();sv.cash-=C[2];sv.f[P.i]={c:C[0],t:Date.now(),w:0};SFX.place?.();markDirty();if(sv.up.tracteur)G.plantAll(C)}]),['Annuler',null]]);dlgGrid?.();return}
    const g=G.grow(P);if(g>=1){G.harvest(P);if(sv.up.tracteur)for(const Q of G.plotB)if(Q.i<sv.plots&&G.grow(Q)>=1)G.harvest(Q);return}
    if(!f.w&&!sv.up.arroseur){f.t=Date.now()-(Date.now()-f.t);f.w=1;const el_=Date.now()-f.t;f.t=Date.now()-el_/2;SFX.splash?.();toast('💧 Arrosé : pousse 2× plus vite');markDirty();return}toast(`⏳ ${Math.round(g*100)} %`)},
  plantAll(C){const sv=this.sv;for(const Q of this.plotB)if(Q.i<sv.plots&&!sv.f[Q.i]&&sv.cash>=C[2]){sv.cash-=C[2];sv.f[Q.i]={c:C[0],t:Date.now(),w:0}}},
  harvest(P){const sv=this.sv,f=sv.f[P.i];if(!f)return;sv.inv[f.c]=(sv.inv[f.c]||0)+1+(sv.up.engrais?1:0);delete sv.f[P.i];sparks([P.x,1,P.z],[1.5,3,.8],10);SFX.pickup();if(f.c==='etoile'&&!sv.star){sv.star=1;giveBlox(100,'Fruit étoile !')}markDirty()},
  collect(){const sv=this.sv,now=Date.now(),dt=Math.min(6*3600,(now-sv.anT)/1000);const e=Math.floor(dt/45*sv.an.poule),l=Math.floor(dt/90*sv.an.vache);if(e+l<=0)return toast('Rien à ramasser pour l\'instant');sv.anT=now;sv.inv.oeuf=(sv.inv.oeuf||0)+e;sv.inv.lait=(sv.inv.lait||0)+l;SFX.pickup();toast(`🥚 ${e} œufs · 🥛 ${l} laits`);markDirty()},
  sell(){const sv=this.sv;let v=0;for(const[k,n]of Object.entries(sv.inv)){const C=CROPS.find(c=>c[0]===k);v+=n*(C?C[4]:k==='oeuf'?30:k==='lait'?90:0)}if(!v)return toast('Rien à vendre');v=Math.round(v*(1+(sv.reb||0)*.5));sv.cash+=v;sv.inv={};SFX.kaching();floatText(V.add(pl.pos,[0,3,0]),'+'+fmtCash(v),'#7dffb0');markDirty()},
  shop(){const G=this,sv=G.sv,b=[];const pp=Math.round(80*Math.pow(1.45,sv.plots-8));if(sv.plots<32)b.push([`🟫 Nouveau champ (${sv.plots}/32) · ${fmtCash(pp)}`,()=>{if(sv.cash<pp)return SFX.error();sv.cash-=pp;sv.plots++;SFX.buy();markDirty();restartGame()}]);
    const pou=200*Math.pow(1.6,sv.an.poule),vac=1500*Math.pow(1.7,sv.an.vache);if(sv.an.poule<10)b.push([`🐔 Poule (${sv.an.poule}/10) · ${fmtCash(pou)}`,()=>{if(sv.cash<pou)return SFX.error();sv.cash-=pou;sv.an.poule++;SFX.buy();markDirty();restartGame()}]);if(sv.an.vache<6)b.push([`🐄 Vache (${sv.an.vache}/6) · ${fmtCash(vac)}`,()=>{if(sv.cash<vac)return SFX.error();sv.cash-=vac;sv.an.vache++;SFX.buy();markDirty();restartGame()}]);
    for(const[k,n,p]of[['arroseur','💦 Arroseur automatique',6000],['engrais','🧪 Engrais (+1 récolte)',15000],['tracteur','🚜 Tracteur (plante/récolte tout)',40000]])if(!sv.up[k])b.push([`${n} · ${fmtCash(p)}`,()=>{if(sv.cash<p)return SFX.error();sv.cash-=p;sv.up[k]=1;SFX.levelUp();markDirty();if(sv.up.arroseur&&sv.up.engrais&&sv.up.tracteur&&sv.plots>=32&&!sv.full){sv.full=1;giveBlox(200,'Ferme complète !');unlockBadge('fermier')}}]);
    const rp=2e6*Math.pow(3,sv.reb||0);b.push([`🔁 Renaissance (+50 % ventes) · ${fmtCash(rp)}`,()=>{if(sv.cash<rp)return SFX.error();sv.reb=(sv.reb||0)+1;Object.assign(sv,{cash:30,plots:8,f:{},inv:{},an:{poule:0,vache:0},up:{}});giveBlox(100,'Renaissance fermière');markDirty();restartGame()}],['Fermer',null]);openDialog('🛒 Magasin',fmtCash(sv.cash),b)},
  update(dt,t){const G=this,sv=G.sv;for(const a of G.anim){if(!a.tg||V.len(V.sub(a.tg,a.pos))<.5)a.tg=a.t==='p'?[rnd(-46,-14),0,rnd(-26,-14)]:[rnd(-46,-14),0,rnd(-34,-27)];const d=V.sub(a.tg,a.pos);a.yaw=Math.atan2(d[0],d[2]);a.pos=V.add(a.pos,V.mul(V.norm(d),dt*(a.t==='p'?1.4:.6)))}
    $('fmC').textContent=fmtCash(sv.cash);const ready=G.plotB.filter(P=>P.i<sv.plots&&sv.f[P.i]&&G.grow(P)>=1).length;$('fmS').textContent=`🟫 ${sv.plots} champs · ✅ ${ready} prêts · 🐔 ${sv.an.poule} · 🐄 ${sv.an.vache} · 🧺 ${Object.values(sv.inv).reduce((a,b)=>a+b,0)} produits`;if(Math.random()<dt*.2)markDirty()},
  extraDraw(L){const G=this,sv=G.sv;for(const a of G.anim){const m=M.chain(M.T(a.pos[0],a.pos[1]+(a.t==='p'?.45+Math.abs(Math.sin(time*8+a.pos[0]))*.1:1.1),a.pos[2]),M.RY(a.yaw));
      if(a.t==='p')L.push({mesh:MESH.sphere,m:M.mul(m,M.S(.6,.55,.75)),mode:3,color:'#f8f4ea'},{mesh:MESH.sphere,m:M.mul(m,M.chain(M.T(0,.4,.35),M.S(.35,.35,.35))),mode:3,color:'#f8f4ea'},{mesh:MESH.box,m:M.mul(m,M.chain(M.T(0,.62,.35),M.S(.08,.15,.2))),mode:3,color:'#e5484d'},{mesh:MESH.cone,m:M.mul(m,M.chain(M.T(0,.38,.56),M.RX(Math.PI/2),M.S(.08,.14,.08))),mode:3,color:'#ffb12a'});
      else L.push({mesh:MESH.rbox,m:M.mul(m,M.S(1.3,1,2.2)),mode:3,color:'#f2f2f2'},{mesh:MESH.rbox,m:M.mul(m,M.chain(M.T(.3,.3,-.3),M.S(.6,.5,.7))),mode:3,color:'#22252b'},{mesh:MESH.rbox,m:M.mul(m,M.chain(M.T(0,.4,1.3),M.S(.8,.7,.7))),mode:3,color:'#f2f2f2'},{mesh:MESH.rbox,m:M.mul(m,M.chain(M.T(0,.2,1.65),M.S(.6,.35,.15))),mode:3,color:'#ffb3c8'},...[[-.45,-.8],[.45,-.8],[-.45,.8],[.45,.8]].map(([x,z])=>({mesh:MESH.box,m:M.mul(m,M.chain(M.T(x,-.8,z),M.S(.25,.8,.25))),mode:3,color:'#e8e2d6'})))}
    for(const P of G.plotB){const f=sv.f[P.i];if(!f)continue;const C=CROPS.find(c=>c[0]===f.c),g=G.grow(P);
    for(let k=0;k<4;k++){const x=P.x+(k%2?1.1:-1.1),z=P.z+(k<2?1.1:-1.1),h=.2+g*1.1;L.push({mesh:MESH.cyl,m:M.chain(M.T(x,.2+h/2,z),M.S(.15,h,.15)),mode:3,color:'#2f8a3a'});if(g>.35)L.push({mesh:MESH.sphere,m:M.chain(M.T(x,.2+h,z),M.S(.25+g*.35,.25+g*.35,.25+g*.35)),mode:3,color:g>=1?C[5]:'#6fbf5a',shin:80,emis:g>=1&&HDR?.3:0})}
    if(f.w&&g<1&&Math.random()<.02)emit({pos:[P.x,.4,P.z],vel:[0,.5,0],life:.6,size:.08,size1:0,col:[.6,.8,1.6],shape:2});if(g>=1&&Math.random()<.04)sparks([P.x,1.4,P.z],[2,2,.6],1,.3)}}};

/* ============================== 13. DONJON INFINI ============================== */
GAMES.donjon={name:'Donjon Infini',genre:'Aventure',icon:'🗝️',colors:['#2b1d3a','#c8a24a'],maxPlayers:8,music:'rpg',
  desc:"Roguelike : chaque étage est généré au hasard (salles, coffres, monstres, pièges). Trouve l'escalier, bats un boss tous les 5 étages, ramasse de l'or et achète des améliorations permanentes au camp. Jusqu'où iras-tu ?",
  badges:['Étage 10 : +60 Blox','Étage 25 : +200 Blox'],
  build(sv){const G=this;kitBase(G,sv,100+(sv.hpUp||0)*20);sv.best=sv.best||0;sv.gold=sv.gold||0;G.fl=sv.run||0;G.dmg=18+(sv.dmgUp||0)*6;G.inCamp=G.fl===0;setClock(G.inCamp?14:.5);WORLD.lights=[];WORLD.fog=G.inCamp?0:.03;WORLD.fogCol=[.03,.02,.04];
    if(G.inCamp){B(0,-.5,0,60,1,60,{mat:'herbe'});B(0,.2,-10,6,.4,6,{mat:'basalte'});B(0,3,-13,6,6,.6,{mat:'pierre'});SIGN(0,6.5,-12.5,'ENTRÉE DU DONJON',false,{size:40});G.stairs={pos:[0,1,-10],size:[4,2,4]};
      B(-10,1,0,3,2,2,{mat:'bois',color:'#3d7eff'});SIGN(-10,3.4,0,'🛡️ FORGERON',false,{size:36});WORLD.prompts=[{who:{pos:[-10,0,1]},label:'Forgeron',act:()=>G.forge()}];for(const[x,z]of[[-20,10],[20,10],[18,-18]])TREE(x,z,3,3);SPAWN={pos:[0,.2,6],size:[4,.2,4]};return}
    const R=k=>rh(k*9.17+G.fl*31.3+(sv.seed||1));const N=5,S=22;B(0,-.5,0,N*S+20,1,N*S+20,{mat:'pierre',color:'#2a2628'});G.rooms=[];
    for(let i=0;i<N;i++)for(let j=0;j<N;j++){const x=(i-2)*S,z=(j-2)*S;G.rooms.push([x,z]);const w=S-6;for(const[sx,sz,dx,dz]of[[w,1,0,-w/2],[w,1,0,w/2],[1,w,-w/2,0],[1,w,w/2,0]]){const door=R(i*7+j*3+dx+dz)<.75||(i===2&&j===2);if(door){const half=(Math.max(sx,sz)-3)/2;if(sx>1){B(x+dx-half/2-1.5-half/2+half/2,2,z+dz,half,4,1,{mat:'brique',color:'#4a4048'});B(x+dx+1.5+half/2,2,z+dz,half,4,1,{mat:'brique',color:'#4a4048'})}else{B(x+dx,2,z+dz-1.5-half/2,1,4,half,{mat:'brique',color:'#4a4048'});B(x+dx,2,z+dz+1.5+half/2,1,4,half,{mat:'brique',color:'#4a4048'})}}else B(x+dx,2,z+dz,sx,4,sz,{mat:'brique',color:'#4a4048'})}
      if(R(i*5+j)<.35&&!(i===2&&j===2)){B(x-5,.06,z+5,3,.12,3,{kind:'lava'})}if(R(i*11+j*2)<.5)WORLD.lights.push({pos:[x,3.4,z],color:'#ffb35a',range:12,bright:1.6,base:1.6,flicker:.3})}
    const boss=G.fl%5===0;const far=G.rooms.slice().sort((a,b)=>Math.hypot(b[0],b[1])-Math.hypot(a[0],a[1]))[Math.floor(R(99)*4)];G.stairsR=far;G.locked=true;G.stairs={pos:[far[0],1,far[1]+4],size:[3,2,3]};B(far[0],.2,far[1]+4,3,.4,3,{mat:'neon',color:'#7a5cff',nocol:1});
    G.chests=[];G.rooms.forEach(([x,z],k)=>{if(k===12)return;const n=Math.floor(R(k)*3+(G.fl>8?1:0));for(let q=0;q<n;q++)KIT.mob(G,pick([{name:'Squelette',av:'fantome',hp:30+G.fl*12,speed:4.6+G.fl*.05,dmg:7+G.fl*1.6,rate:1,pts:4},{name:'Gobelin',av:'zcourt',hp:22+G.fl*9,speed:6.5,dmg:5+G.fl*1.2,rate:.7,pts:5},{name:'Orc',av:'zbrute',hp:70+G.fl*20,speed:3.8,dmg:12+G.fl*2.2,rate:1.3,reach:2,pts:9}]),[x+rnd(-5,5),.3,z+rnd(-5,5)]);
      if(R(k*3)<.3){G.chests.push({pos:[x+5,.6,z-5],open:false});B(x+5,.6,z-5,1.4,1.2,1,{mat:'or',nocol:1})}});
    if(boss){G.boss=KIT.mob(G,{name:`👑 Roi des Ombres (ét. ${G.fl})`,av:'monstre',hp:500+G.fl*140,speed:5.4,dmg:18+G.fl*2.5,rate:1.1,reach:2.4,pts:60,boss:1},[far[0],.3,far[1]-3])}
    WORLD.prompts=G.chests.map(ch=>({who:{pos:ch.pos},label:'Coffre',act:()=>G.chest(ch)}));SPAWN={pos:[0,.2,0],size:[3,.2,3]};WORLD.voidY=-20},
  spawn(){return[0,.4,this.inCamp?6:0]},
  hud(el){el.innerHTML=KIT.hud(`<div class="ghud center"><div class="gtitle" id="djT"></div><div class="gsub" id="djS"></div></div>`)},
  forge(){const G=this,sv=G.sv,hp=Math.round(150*Math.pow(1.5,sv.hpUp||0)),dm=Math.round(200*Math.pow(1.55,sv.dmgUp||0));openDialog('🛡️ Forgeron',`Or : ${sv.gold} · record étage ${sv.best}`,[[`❤️ +20 PV max (niv.${sv.hpUp||0}) · ${hp} or`,()=>{if(sv.gold<hp)return SFX.error();sv.gold-=hp;sv.hpUp=(sv.hpUp||0)+1;SFX.buy();markDirty();restartGame()}],[`⚔️ +6 dégâts (niv.${sv.dmgUp||0}) · ${dm} or`,()=>{if(sv.gold<dm)return SFX.error();sv.gold-=dm;sv.dmgUp=(sv.dmgUp||0)+1;SFX.buy();markDirty();restartGame()}],['Fermer',null]])},
  chest(ch){if(ch.open)return;ch.open=true;const G=this,r=Math.random();if(r<.4){const g=20+G.fl*8;G.sv.gold+=g;toast(`🪙 +${g} or`)}else if(r<.7){G.hp=Math.min(G.maxHp,G.hp+40);toast('❤️ +40 PV')}else{G.dmg+=3;toast('⚔️ Arme aiguisée : +3 dégâts (pour cette descente)')}SFX.pickup();sparks(ch.pos,[3,2.4,.5],14);markDirty()},
  input(k){const G=this;if(k==='attack'&&!G.inCamp)KIT.swing(G,G.dmg,2.8,(c,m)=>{G.sv.gold+=m.pts+G.fl;if(m.boss){G.boss=null;scMessage('👑 Boss vaincu ! L\'escalier s\'ouvre.',3);giveBlox(15+G.fl,'Boss')}})},
  onDeath(c){if(c===pl)this.diedX=1},
  onRespawn(c){if(c!==pl||!this.diedX)return;const G=this;G.diedX=0;if(!G.inCamp){const fl=G.fl;G.sv.run=0;markDirty();showResult('💀 Mort au donjon',`Étage ${fl} atteint · ton or est gardé pour le forgeron.`,[['Retour au camp',()=>restartGame()]])}},
  update(dt,t){const G=this;kitTick(G,dt);worldFx(dt,t,false);if(!G.inCamp){KIT.mobsStep(G,dt);if(G.hp<=0&&!pl.dead)die(pl,false)}
    const atStairs=inBox(V.add(pl.pos,[0,1,0]),G.stairs);if(atStairs&&!G.going&&!(G.boss)){G.going=true;G.sv.run=(G.fl||0)+1;if(G.sv.run>G.sv.best){G.sv.best=G.sv.run;if(G.sv.best===10)giveBlox(60,'Étage 10 !');if(G.sv.best===25){giveBlox(200,'Étage 25 !');unlockBadge('donjon')}}G.sv.seed=Math.floor(Math.random()*1e5);markDirty();SFX.levelUp();restartGame();return}
    $('djT').textContent=G.inCamp?'🏕️ Camp':`Étage ${G.fl}${G.fl%5===0?' · 👑 BOSS':''}`;$('djS').textContent=G.inCamp?`🪙 ${G.sv.gold} or · record étage ${G.sv.best} · entre dans le donjon (au nord)`:`👹 ${G.mobs.length} monstres · ⚔️ ${G.dmg} · 🪙 ${G.sv.gold}${G.boss?' · bats le boss pour ouvrir l\'escalier':' · trouve l\'escalier violet'}`},
  extraDraw(L){if(this.stairs&&!this.inCamp&&!this.boss)glow(this.stairs.pos,[1.4,.8,3],2)},
  exit(){KIT.clearMobs(this);WORLD.fog=0;WORLD.lights=[]}};

/* ============================== 14. NAUFRAGÉS (survie) ============================== */
GAMES.survie={name:'Naufragés',genre:'Survie',icon:'🏝️',colors:['#1c7aa0','#e6c27a'],maxPlayers:8,music:'sandbox',
  desc:"Survie sur une île : coupe des arbres, casse des rochers, cueille des baies, garde un œil sur la faim et la soif, fabrique outils, feu de camp et cabane. Les nuits, les crabes géants attaquent ! Construis le radeau (40 bois, 20 pierres, 12 cordes) pour t'échapper.",
  badges:['Radeau : +150 Blox','Survivre 5 nuits : +60 Blox'],
  build(sv){const G=this;kitBase(G,sv,100);G.bag={bois:0,pierre:0,fibre:0,corde:0,baie:0};G.tools={};G.food=100;G.water=100;G.day=0;G.clock=8;G.nightWave=false;G.built=[];
    B(0,-6,0,400,1,400,{mat:'sable'});waters.push({pos:[0,-2.7,0],size:[400,6.6,400],swimAt:.55,color:'#1c7aa0'});B(0,-.2,0,110,1.2,110,{mat:'sable'});B(0,.1,0,90,1.2,90,{mat:'herbe'});
    G.res=[];for(let i=0;i<45;i++){const x=rnd(-40,40),z=rnd(-40,40);if(Math.hypot(x,z)<8)continue;const k=Math.random();if(k<.5){TREE(x,z,3.2,3);G.res.push({t:'arbre',pos:[x,.7,z],hp:5})}else if(k<.75){const b=B(x,1.2,z,2,1.4,2,{mat:'pierre'});G.res.push({t:'roche',pos:[x,.7,z],hp:6,b})}else if(k<.9){const b=B(x,1.1,z,1.4,1,1.4,{mat:'feuillage',color:'#2f6a3a'});G.res.push({t:'buisson',pos:[x,.7,z],hp:2,b})}else G.res.push({t:'herbe',pos:[x,.7,z],hp:1})}
    G.source={pos:[10,.7,-12]};B(10,.75,-12,4,.1,4,{mat:'verre',color:'#7fd3ff',nocol:1});WORLD.prompts=[{who:{pos:[10,.7,-12]},label:'Boire',act:()=>{G.water=100;SFX.splash?.();toast('💧 Tu as bu à la source')}},{who:{pos:[0,.7,4]},label:'Fabriquer',act:()=>G.craft()}];
    B(0,1.1,4,2,1,1.4,{mat:'bois',color:'#6d4a2a'});SIGN(0,2.6,4,'🔨 ÉTABLI',false,{size:36});SPAWN={pos:[0,.8,0],size:[3,.2,3]};WORLD.voidY=-30},
  spawn(){return[0,1,0]},
  hud(el){el.innerHTML=KIT.hud(`<div class="ghud left"><div class="gtitle" id="svT"></div><div class="gsub" id="svS"></div></div><div class="ghud quest" id="svI"></div>`)},
  input(k){const G=this;if(k!=='attack'||G.atkCd>0||pl.dead)return;const f=[Math.sin(pl.yaw),0,Math.cos(pl.yaw)];
    KIT.swing(G,10+(G.tools.lance?18:0),2.6,(c,m)=>{G.bag.baie+=2;toast('🦀 Crabe vaincu : +2 nourriture')});G.atkCd=.35;
    let best=null,bd=3;for(const r of G.res){const d=V.len(V.sub([r.pos[0],0,r.pos[2]],[pl.pos[0]+f[0],0,pl.pos[2]+f[2]]));if(d<bd){bd=d;best=r}}if(!best)return;
    const pw=best.t==='arbre'?(G.tools.hache?3:1):best.t==='roche'?(G.tools.pioche?3:1):1;best.hp-=pw;SFX.hit?.();sparks(V.add(best.pos,[0,1,0]),best.t==='roche'?[1.2,1.2,1.2]:[.6,1.4,.4],5,.5);
    if(best.hp<=0){const g={arbre:['bois',3],roche:['pierre',2],buisson:['baie',3],herbe:['fibre',2]}[best.t];G.bag[g[0]]+=g[1];floatText(V.add(pl.pos,[0,3,0]),`+${g[1]} ${g[0]}`,'#ffd23f');best.hp=best.t==='arbre'?5:best.t==='roche'?6:2;best.cd=40;if(best.b){best.b.alpha=.2;best.b.nocol=true;refreshSolids()}G.res.splice(G.res.indexOf(best),1);setTimeout(()=>{G.res.push(best);if(best.b){best.b.alpha=1;best.b.nocol=false;refreshSolids()}},45000)}},
  craft(){const G=this,I=G.bag,R=[['corde','🪢 Corde',{fibre:3}],['hache','🪓 Hache (bois ×3)',{bois:5,pierre:3}],['pioche','⛏️ Pioche (pierre ×3)',{bois:5,pierre:5}],['lance','🔱 Lance (+18 dégâts)',{bois:6,pierre:4,corde:2}],['feu','🔥 Feu de camp (soigne la nuit)',{bois:8,pierre:4}],['cabane','🛖 Cabane (abri)',{bois:25,corde:4}],['radeau','⛵ RADEAU (victoire)',{bois:40,pierre:20,corde:12}]];
    const ok=c=>Object.entries(c).every(([k,n])=>I[k]>=n);openDialog('🔨 Établi',`Bois ${I.bois} · Pierre ${I.pierre} · Fibre ${I.fibre} · Corde ${I.corde} · Baies ${I.baie}`,[...R.filter(r=>r[0]==='corde'||!G.tools[r[0]]).map(([id,n,c])=>[`${ok(c)?'✅':'❌'} ${n} · ${Object.entries(c).map(([k,v])=>v+' '+k).join(', ')}`,()=>{if(!ok(c))return SFX.error();for(const[k,v]of Object.entries(c))I[k]-=v;if(id==='corde')I.corde++;else{G.tools[id]=1;G.place(id)}SFX.buy();toast(n+' fabriqué !')}]),['Fermer',null]])},
  place(id){const G=this,p=V.add(pl.pos,[Math.sin(pl.yaw)*3,0,Math.cos(pl.yaw)*3]);if(id==='feu'){B(p[0],.9,p[2],1.6,.4,1.6,{mat:'pierre'});(WORLD.emitters=WORLD.emitters||[]).push({pos:[p[0],1.6,p[2]],size:[1,1,1],fx:'feu',color:'#ff8a3d',obj:{},on:true,acc:0});WORLD.lights=WORLD.lights||[];WORLD.lights.push({pos:[p[0],2.4,p[2]],color:'#ff9a3d',range:14,bright:2.4,base:2.4,flicker:.2});G.fire=[...p]}
    else if(id==='cabane'){for(const[dx,dz,sx,sz]of[[0,-2.5,5,.3],[-2.5,0,.3,5],[2.5,0,.3,5]])B(p[0]+dx,1.8,p[2]+dz,sx,2.4,sz,{mat:'planches'});B(p[0],3.2,p[2],5.6,.4,5.6,{mat:'feuillage',color:'#8a7a3a'});G.hut=[...p]}
    else if(id==='radeau'){G.won=true;giveBlox(150,'Évadé de l\'île !');unlockBadge('naufrage');showResult('⛵ Sauvé !',`Tu as quitté l'île après ${G.day} jour(s).`,[['Rejouer',()=>restartGame()],['Quitter',()=>exitGame()]])}finalizeWorld()},
  update(dt,t){const G=this;kitTick(G,dt);worldFx(dt,t,false);G.clock+=dt/12;if(G.clock>=24){G.clock-=24;G.day++;if(G.day===5){giveBlox(60,'5 nuits survécues')}}setClock(G.clock);const night=G.clock>20||G.clock<5.5;
    G.food-=dt*.35*(night?1.2:1);G.water-=dt*.5;if(G.food<30&&G.bag.baie>0){G.bag.baie--;G.food=Math.min(100,G.food+25);toast('🫐 Tu manges des baies')}if(G.food<=0||G.water<=0)KIT.hurt(G,dt*6);
    if(G.fire&&V.len(V.sub(pl.pos,G.fire))<6)G.hp=Math.min(G.maxHp,G.hp+dt*2);
    if(night&&!G.nightWave){G.nightWave=true;scMessage('🌙 La nuit tombe… les crabes géants arrivent !',3);const n=3+G.day*2;for(let i=0;i<n;i++){const a=rnd(0,6.28);KIT.mob(G,{name:'Crabe géant',av:'crabe',hp:30+G.day*10,speed:4.6+G.day*.15,dmg:7+G.day*1.5,rate:1,pts:3},[Math.cos(a)*44,.8,Math.sin(a)*44])}}
    if(!night&&G.nightWave){G.nightWave=false;for(const c of[...G.mobs])KIT.kill(G,c)}KIT.mobsStep(G,dt);if(G.hut&&V.len(V.sub(pl.pos,G.hut))<2.6)for(const c of G.mobs)c.mob.cd=Math.max(c.mob.cd,.5);
    const I=G.bag;$('svT').textContent=`Jour ${G.day+1} · ${String(Math.floor(G.clock)).padStart(2,'0')}h${night?' 🌙':' ☀️'}`;$('svS').textContent=`🍗 ${Math.ceil(G.food)} % · 💧 ${Math.ceil(G.water)} %${G.mobs.length?' · 🦀 '+G.mobs.length:''}`;
    $('svI').textContent=`🪵 ${I.bois} · 🪨 ${I.pierre} · 🌾 ${I.fibre} · 🪢 ${I.corde} · 🫐 ${I.baie} · F : récolter/frapper · E : établi/source`},
  exit(){KIT.clearMobs(this);WORLD.lights=[]}};

/* ============================== 15. FUIS LA MARÉE ============================== */
const FL_MAPS=[{n:'Tour de l\'Horloge',c:'#c8a24a'},{n:'Ville Engloutie',c:'#7d8a9a'},{n:'Jungle Temple',c:'#2f8a3a'},{n:'Laboratoire',c:'#39c5bb'},{n:'Volcan Glacé',c:'#a8f0ff'}];
GAMES.maree={name:'Fuis la Marée',genre:'Obby',icon:'🌊',colors:['#1c4a8a','#7fd3ff'],maxPlayers:16,music:'obby',
  desc:"Survie en parcours : l'eau monte ! Grimpe le plus haut possible avant de te noyer. 5 cartes générées qui tournent pour tout le serveur en même temps (manches de 100 s), de plus en plus difficiles. Combien de manches enchaîneras-tu ?",
  badges:['Survivre à une manche : +8 Blox','5 d\'affilée : +50 Blox'],
  build(sv){const G=this;G.sv=sv;sv.best=sv.best||0;const R=100,now=Date.now()/1000;G.round=Math.floor(now/R);G.t0=G.round*R;G.mi=G.round%FL_MAPS.length;G.lvl=1+Math.floor((G.round/FL_MAPS.length)%4);G.alive=true;G.streak=sv.streak||0;
    G.plat=[];const M_=FL_MAPS[G.mi],rr=k=>rh(k*3.71+G.round*13.1);setClock(G.mi===4?20:13);B(0,-.5,0,80,1,80,{mat:'pierre',color:'#4a4d52'});
    for(const[x,z,sx,sz]of[[0,-30,60,1],[0,30,60,1],[-30,0,1,60],[30,0,1,60]])B(x,30,z,sx,60,sz,{mat:'verre',color:'#bfe9ff',alpha:.15});
    for(let i=0;i<70;i++){const a=i*(.5+G.mi*.05)*(G.mi%2?-1:1),r=(18-G.mi)-i*.12*(1+G.mi*.08);const q=[Math.cos(a)*Math.max(5,r),1+i*1.15,Math.sin(a)*Math.max(5,r)];const s=Math.max(1.4,3.4-i*.02-G.lvl*.2);
      const o={mat:'lisse',color:hsl((G.mi*70+i*5)%360,55,52)};if(i%9===5&&G.lvl>1)o.move={axis:[Math.cos(a+1.57),0,Math.sin(a+1.57)],amp:2,speed:.8+G.lvl*.2};if(i%13===8)o.kind='bounce';if(i%7===3&&G.lvl>2)o.kind='conv',o.dir=[Math.cos(a),0,Math.sin(a)],o.speed=3;
      B(q[0],q[1],q[2],s,.5,s,o);G.plat.push(q);if(i%10===0)B(q[0],q[1]+.6,q[2],.6,1,.6,{mat:'neon',color:M_.c,nocol:1});if(rr(i)<.25)B(q[0]*.6,q[1]+2,q[2]*.6,1.4,.4,1.4,{mat:'lisse',color:'#9aa4b2'})}
    B(0,82,0,10,.6,10,{mat:'or'});G.water={pos:[0,-10,0],size:[60,10,60],swimAt:.55,color:'#1c6aa8'};waters.push(G.water);SPAWN={pos:[0,.2,0],size:[6,.2,6]};WORLD.voidY=-30},
  spawn(){const e=Date.now()/1000-this.t0,top=-.6+(e<12?0:(e-12)*.82*(.92+this.lvl*.04));const q=(this.plat||[]).find(p=>p[1]>top+2);return q?[q[0],q[1]+.5,q[2]]:[rnd(-3,3),.4,rnd(-3,3)]},
  hud(el){el.innerHTML=`<div class="ghud center"><div class="gtitle" id="flT"></div><div class="gsub" id="flS"></div></div>`},
  lbLabel:'Série',lbValue(c){return c.isPlayer?this.streak:''},
  update(dt){const G=this,now=Date.now()/1000,e=now-G.t0,M_=FL_MAPS[G.mi];if(e>100){G.sv.streak=G.alive?G.streak+1:0;if(G.alive){giveBlox(8,'Manche survécue');if(G.sv.streak%5===0)giveBlox(50,`${G.sv.streak} manches d'affilée !`);if(G.sv.streak>G.sv.best)G.sv.best=G.sv.streak}markDirty();restartGame();return}
    const rise=e<12?0:(e-12)*.82*(.92+G.lvl*.04);const top=-.6+rise;G.water.pos[1]=top-G.water.size[1]/2;G.water.size[1]=Math.max(10,top+11);G.water.pos[1]=top-G.water.size[1]/2;
    if(pl.pos[1]+1.6<top&&G.alive&&!pl.dead){G.under=(G.under||0)+dt;if(G.under>3){G.alive=false;die(pl,false);scMessage('🌊 Noyé ! Attends la prochaine manche…',3)}}else G.under=0;
    if(!G.alive&&!pl.dead&&pl.pos[1]<top){pl.pos=[0,top+.5,0]}
    $('flT').textContent=`🌊 ${M_.n} · niveau ${G.lvl}`;$('flS').textContent=e<12?`L'eau monte dans ${Math.ceil(12-e)} s : grimpe !`:`${G.alive?'⏱ tiens encore '+Math.ceil(100-e)+' s':'💀 noyé · prochaine manche dans '+Math.ceil(100-e)+' s'} · eau à ${Math.max(0,Math.round(top))} m · série ${G.streak} (record ${G.sv.best})${G.under>0?' · 🫧 '+(3-G.under).toFixed(1):''}`}};

/* ============================== 16. FOOT CUBE ============================== */
GAMES.foot={name:'Foot Cube',genre:'Sport',icon:'⚽',colors:['#2f8a3a','#f2f2f2'],maxPlayers:10,music:'obby',
  desc:"Match de foot 4 contre 4 avec de la vraie physique du ballon : dribble en courant dans la balle, F pour frapper fort, espace pour une tête ! Matchs de 3 minutes, championnat à points et grades.",
  badges:['Victoire : +20 Blox','Champion (10 victoires) : +150 Blox'],
  build(sv){const G=this;G.sv=sv;sv.w=sv.w||0;G.sc=[0,0];G.t=180;G.ball={p:[0,1,0],v:[0,0,0]};G.kick=0;G.bots=[];G.pause=2;setClock(15);
    B(0,-.5,0,110,1,80,{mat:'herbe',color:'#3a9a46'});B(0,.03,0,.3,.06,60,{mat:'lisse',color:'#ffffff',nocol:1});for(const[x,z,sx,sz]of[[0,-31,96,1],[0,31,96,1],[-48.5,-20,1,22],[-48.5,20,1,22],[48.5,-20,1,22],[48.5,20,1,22]])B(x,1.5,z,sx,3,sz,{mat:'lisse',color:'#f2f2f2',alpha:.5});
    for(const s of[-1,1]){B(s*52,2,0,.5,4,18,{mat:'metal',color:'#f2f2f2',alpha:.3});B(s*50,4,0,4,.3,18,{mat:'metal',color:'#f2f2f2'});B(s*50,2,-9,4,4,.3,{mat:'metal',color:'#f2f2f2',alpha:.3});B(s*50,2,9,4,4,.3,{mat:'metal',color:'#f2f2f2',alpha:.3})}
    const mk=(team,i,role)=>{const c=spawnNPC((team?['Rouge','Rapido','Tonnerre','Gardien R']:['Bleuet','Éclair','Gardien B'])[i]+' (bot)',team?'rouge':'bleu',[team?20:-20,.3,(i-1)*10],{still:true,quiet:true,col:team?'#ff6b6b':'#7fb8ff'});c.fb={team,role,home:[(team?1:-1)*(role==='gk'?46:role==='def'?24:8),0,(i-1)*10]};c.walk=role==='gk'?6:7.4;G.bots.push(c)};
    mk(0,0,'att');mk(0,1,'def');mk(0,2,'gk');mk(1,0,'att');mk(1,1,'att');mk(1,2,'def');mk(1,3,'gk');WORLD.voidY=-20},
  spawn(){return[-10,.4,0]},
  hud(el){el.innerHTML=`<div class="ghud center"><div class="gtitle" id="fbT"></div><div class="gsub" id="fbS"></div></div><div class="ghud quest">Cours dans la balle pour dribbler · F : frappe · Espace : tête</div>`},
  input(k){if(k==='attack')this.kick=.25},
  touch(c,power,team){const B_=this.ball,d=V.sub(B_.p,c.pos);d[1]=0;const L=V.len(d);if(L>1.6||B_.p[1]>c.pos[1]+3)return false;const tgt=team===0?[52,0,rnd(-5,5)]:[-52,0,rnd(-5,5)];
    const dir=power>1?V.norm(V.add(V.mul(V.norm(V.sub(tgt,c.pos)),.6),V.mul([Math.sin(c.yaw),0,Math.cos(c.yaw)],.4))):V.norm(L>.01?d:[1,0,0]);B_.v=V.add(V.mul(dir,power>1?24:Math.max(8,Math.hypot(c.vel[0],c.vel[2])*1.4)),[0,power>1?5:(B_.p[1]>c.pos[1]+1.8?6:1.5),0]);if(power>1){SFX.hit?.();shake=.1}return true},
  update(dt,t){const G=this,B_=G.ball;if(G.over)return;G.pause-=dt;if(G.pause<=0)G.t-=dt;G.kick-=dt;
    B_.v[1]-=22*dt;B_.p=V.add(B_.p,V.mul(B_.v,dt));if(B_.p[1]<.5){B_.p[1]=.5;B_.v[1]=Math.abs(B_.v[1])*.45;B_.v[0]*=.985;B_.v[2]*=.985}B_.v[0]*=1-dt*.4;B_.v[2]*=1-dt*.4;
    if(Math.abs(B_.p[2])>30){B_.p[2]=Math.sign(B_.p[2])*30;B_.v[2]*=-.7}if(Math.abs(B_.p[0])>48&&Math.abs(B_.p[2])>9){B_.p[0]=Math.sign(B_.p[0])*48;B_.v[0]*=-.7}
    if(Math.abs(B_.p[0])>49&&Math.abs(B_.p[2])<9&&B_.p[1]<4){const team=B_.p[0]>0?0:1;G.sc[team]++;SFX[team===0?'levelUp':'error']?.();scMessage(`⚽ BUUUT ! ${team===0?'🔵 Bleus':'🔴 Rouges'} · ${G.sc[0]} - ${G.sc[1]}`,2.5);if(team===0)confetti([50,3,0]);G.ball={p:[0,1,0],v:[0,0,0]};G.pause=2.5;pl.pos=[-10,.4,0];for(const c of G.bots){c.pos=[...c.fb.home];c.pos[1]=.4}return}
    if(G.pause<=0){if(pl.ground||pl.grounded)G.touch(pl,G.kick>0?2:1,0)&&(G.kick=0);else if(B_.p[1]>pl.pos[1]+1.8)G.touch(pl,1,0);
      for(const c of G.bots){const f=c.fb,d=V.sub(B_.p,c.pos);d[1]=0;const L=V.len(d);let goal;const myGoalX=f.team?50:-50;
        if(f.role==='gk')goal=[myGoalX*.94,0,clamp(B_.p[2],-7,7)];else if(f.role==='def'&&Math.sign(B_.p[0])!==(f.team?1:-1))goal=f.home;else goal=V.add(B_.p,V.mul(V.norm([B_.p[0]-(f.team?-52:52),0,B_.p[2]]),1.2));
        if(f.role==='gk'&&L<10)goal=B_.p;const dd=V.sub(goal,c.pos);dd[1]=0;c.forceWish=V.len(dd)>.6?V.norm(dd):[0,0,0];if(L<1.6){c.yaw=Math.atan2(-(c.pos[0]-(f.team?-52:52)),-(c.pos[2]));G.touch(c,Math.abs(c.pos[0]-(f.team?-50:50))<26||f.role!=='att'?2:1,f.team)}}}
    if(G.t<=0&&!G.over){G.over=true;const win=G.sc[0]>G.sc[1],draw=G.sc[0]===G.sc[1];G.sv.pts=(G.sv.pts||0)+(win?3:draw?1:0);if(win){G.sv.w++;giveBlox(20,'Victoire !');if(G.sv.w===10){giveBlox(150,'Champion !');unlockBadge('foot')}}else giveBlox(draw?8:4,'Match joué');markDirty();
      showResult(win?'🏆 Victoire !':draw?'🤝 Match nul':'😢 Défaite',`${G.sc[0]} - ${G.sc[1]} · ${G.sv.pts} points au championnat · ${G.sv.w} victoire(s)`,[['Rejouer',()=>restartGame()],['Quitter',()=>exitGame()]])}
    $('fbT').textContent=`🔵 ${G.sc[0]}  —  ${G.sc[1]} 🔴`;$('fbS').textContent=`⏱ ${Math.floor(Math.max(0,G.t)/60)}:${String(Math.floor(Math.max(0,G.t)%60)).padStart(2,'0')} · ${G.sv.pts||0} pts`},
  extraDraw(L){const B_=this.ball;L.push({mesh:MESH.sphere,m:M.chain(M.T(...B_.p),M.RY(B_.p[0]),M.RX(B_.p[2]),M.S(1,1,1)),mode:3,color:'#f2f2f2',shin:120},{mesh:MESH.sphere,m:M.chain(M.T(...B_.p),M.RY(B_.p[0]+1),M.RX(B_.p[2]),M.S(1.01,.3,1.01)),mode:3,color:'#15161b'})},
  exit(){for(const c of[...(this.bots||[])])removeRemote(c);this.bots=[]}};

/* ============================== 17. CACHE-CACHE GÉANT ============================== */
GAMES.cache={name:'Cache-Cache Géant',genre:'Party',icon:'🙈',colors:['#ff8a3d','#7a5cff'],maxPlayers:12,music:'sandbox',
  desc:"Dans une maison GÉANTE où tu es tout petit : une manche tu te caches (survis 90 s face au chercheur), la manche suivante c'est toi qui cherches les 6 cachés en 75 s. Accroupis-toi derrière les meubles géants !",
  badges:['Manche réussie : +10 Blox','10 manches : +80 Blox'],
  build(sv){const G=this;G.sv=sv;sv.r=sv.r||0;G.seek=sv.r%2===1;G.t=G.seek?75:90;G.found=0;G.bots=[];G.over=false;setClock(14);
    B(0,-.5,0,120,1,120,{mat:'planches',color:'#c8a27a'});for(const[x,z,sx,sz]of[[0,-50,100,1],[0,50,100,1],[-50,0,1,100],[50,0,1,100],[0,0,1,60],[0,-10,60,1]])B(x,12,z,sx,24,sz,{mat:'lisse',color:'#efe3cf'});
    const F=[[-30,-30,18,8,14,'#7a4a2a'],[-36,20,10,22,6,'#3d7eff'],[30,-30,20,12,2.2,'#e5484d'],[30,30,14,14,9,'#2fbf71'],[-18,38,8,8,16,'#8d5a2b'],[18,6,6,30,4,'#7a5cff'],[-26,-6,12,6,3,'#ffd23f'],[38,-6,6,6,20,'#30343d']];
    for(const[x,z,sx,sz,h,c]of F){B(x,h/2,z,sx,h,sz,{mat:'lisse',color:c});if(h>6)for(const[dx,dz]of[[-sx/2+1,-sz/2+1],[sx/2-1,sz/2-1]])B(x+dx,1.5,z+dz,1.4,3,1.4,{mat:'bois',color:c})}
    for(let i=0;i<12;i++)B(rnd(-44,44),1,rnd(-44,44),rnd(2,5),2,rnd(2,5),{mat:'lisse',color:pick(['#ff4fa3','#ffd23f','#39c5bb','#f2f2f2'])});
    G.spots=[[-30,-25],[-30,-36],[-36,8],[-36,32],[28,-38],[32,-22],[22,30],[38,38],[-18,30],[20,-6],[-26,-2],[44,-12],[-44,44],[44,44],[-44,-44],[2,-44]];
    if(G.seek){const S=[...G.spots].sort(()=>Math.random()-.5).slice(0,6);S.forEach((p,i)=>{const c=spawnNPC(['Lili','Tom','Nina','Hugo','Zoé','Malo'][i],pick(['bleu','rouge','client']),[p[0],.3,p[1]],{still:true,quiet:true,col:'#ffd23f'});c.crouch=true;c.hidden2=true;G.bots.push(c)})}
    else{const c=spawnNPC('Le Chercheur','monstre',[0,.3,-45],{still:true,quiet:true,col:'#ff6b6b'});c.walk=6.4;c.sk={wp:pick(G.spots),look:0};G.seeker=c;G.bots.push(c)}
    SPAWN={pos:[0,.2,20],size:[4,.2,4]};WORLD.voidY=-20},
  spawn(){return[0,.4,20]},
  hud(el){el.innerHTML=`<div class="ghud center"><div class="gtitle" id="ccT"></div><div class="gsub" id="ccS"></div></div>`},
  end(win){const G=this;if(G.over)return;G.over=true;G.sv.r++;if(win){G.sv.wins=(G.sv.wins||0)+1;giveBlox(10,'Manche réussie');if(G.sv.wins===10){giveBlox(80,'10 manches !');unlockBadge('cache')}}markDirty();
    showResult(win?'🎉 Réussi !':'😅 Raté…',G.seek?`${G.found}/6 trouvés`:(win?'Personne ne t\'a trouvé !':'Le chercheur t\'a trouvé !'),[['Manche suivante',()=>restartGame()],['Quitter',()=>exitGame()]])},
  update(dt,t){const G=this;if(G.over)return;G.t-=dt;
    if(G.seek){for(const c of[...G.bots])if(V.len(V.sub(c.pos,pl.pos))<2.4){G.found++;SFX.pickup();floatText(V.add(c.pos,[0,3,0]),'Trouvé ! '+c.name,'#ffd23f');removeRemote(c);G.bots.splice(G.bots.indexOf(c),1);if(G.found>=6)G.end(true)}if(G.t<=0)G.end(false);
      $('ccT').textContent=`🔍 Cherche ! ${G.found}/6`;$('ccS').textContent=`⏱ ${Math.ceil(G.t)} s · ils sont accroupis derrière ou sous les meubles`}
    else{const c=G.seeker,s=c.sk;if(G.t<80){const d=V.sub(s.wp,[c.pos[0],c.pos[2]]),L=Math.hypot(d[0],d[1]);if(L<2){s.look-=dt;c.forceWish=[0,0,0];c.yaw+=dt*1.6;if(s.look<=0){s.wp=Math.random()<.35?[pl.pos[0]+rnd(-12,12),pl.pos[2]+rnd(-12,12)]:pick(G.spots);s.look=2.5}}else c.forceWish=V.norm([d[0],0,d[1]]);
        const to=V.sub(pl.pos,c.pos);to[1]=0;const D=V.len(to),f=[Math.sin(c.yaw),0,Math.cos(c.yaw)],vis=D<(pl.crouch?6:13)&&V.dot(V.mul(to,1/(D||1)),f)>.4;if(vis||D<2.2){c.forceWish=V.norm(to);c.walk=8;if(D<1.8)G.end(false)}else c.walk=6.4}else c.forceWish=[0,0,0];
      if(G.t<=0)G.end(true);$('ccT').textContent=G.t>80?`🙈 Cache-toi ! ${Math.ceil(G.t-80)} s`:`🫣 Ne te fais pas voir · ${Math.ceil(G.t)} s`;$('ccS').textContent='Ctrl : s\'accroupir (moins visible) · le chercheur fouille la maison'}},
  extraDraw(L){if(this.seeker){const c=this.seeker,f=[Math.sin(c.yaw),0,Math.cos(c.yaw)];L.push({mesh:MESH.cone,m:M.chain(M.T(c.pos[0]+f[0]*6,.05,c.pos[2]+f[2]*6),M.RY(c.yaw),M.RX(Math.PI/2),M.S(7,12,.05)),mode:9,color:'#ff4d4d'})}},
  exit(){for(const c of[...(this.bots||[])])removeRemote(c);this.bots=[];this.seeker=null}};
