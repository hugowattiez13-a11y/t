"use strict";
/* ============================================================================
   3 NOUVEAUX JEUX D'HORREUR CO-OP (longs, drôles, en plusieurs étapes) :
   Hôpital Saint-Frisson · Collège Hanté · Fête Foraine Maudite
   ============================================================================ */
NPC_AV.infirmiere={skin:'#d8e2ea',haut:'labcoat',bas:'pyjama',visage:'demon',chapeau:null,cheveux:null,lunettes:null,dos:null,cou:null,epaule:null};
NPC_AV.prof={skin:'#9cc46a',haut:'costume'in IT?'costume':'kimono',bas:'costume_p',visage:'fache',chapeau:null,cheveux:null,lunettes:'moustache',dos:null,cou:'noeud',epaule:null};
NPC_AV.lapinou={skin:'#f2f2f2',haut:'hoodie_gris',bas:'pyjama',visage:'grand_sourire',chapeau:'mp_lapin'in IT?'mp_lapin':null,cheveux:null,lunettes:null,dos:null,cou:'noeud',epaule:null};
// bâtiment en couloir : n salles de chaque côté d'un couloir (axe X)
function hzWing(h,x0,z0,n,w,d,wallC,floorC,hh=5){const rooms=[];const L=n*w;
  B(x0+L/2,.05,z0,L,.1,6,{mat:'planches',color:floorC});B(x0+L/2,hh+.2,z0,L,.4,6,{mat:'beton',color:'#2a2624'});
  for(let i=0;i<n;i++){const x=x0+w/2+i*w;h.room(x,z0+3+d/2,w,d,hh,'beton',wallC,[['s',0]]);h.room(x,z0-3-d/2,w,d,hh,'beton',wallC,[['n',0]]);rooms.push([x,z0+3+d/2],[x,z0-3-d/2])}
  for(let x=x0+6;x<x0+L;x+=12)h.light(x,hh-.6,z0,'#cfe7ff',10,1.2,.5);return rooms}
const furn=(x,z,k)=>{if(k%3===0){B(x-2,.6,z,1.6,.6,3,{mat:'lisse',color:'#d8dee6'});B(x-2,1,z-1.2,1.6,.6,.6,{mat:'lisse',color:'#f2f2f2'})}else if(k%3===1){B(x+2,.9,z,3,.2,1.6,{mat:'bois'});B(x+2,.45,z,.2,.9,.2,{mat:'metal'})}else{B(x,1.2,z+2,4,2.4,.8,{mat:'bois',color:'#5a3a24'})}};

/* ------------------------- HÔPITAL SAINT-FRISSON ------------------------- */
GAMES.hopital=makeHorror({name:'Hôpital Saint-Frisson',icon:'🏥',colors:['#0f2a2a','#7fffd4'],music:'manoir',badges:['S\'échapper : jusqu\'à +100 Blox'],
  desc:"Horreur co-op (1 à 8, environ 25 minutes) : un hôpital abandonné de 16 salles. Récupérez 6 badges d'accès, préparez l'antidote (5 fioles), tenez 2 minutes pendant que l'ascenseur remonte… Attention à l'Infirmière Piqûre, au Patient 13 et au Docteur Gloups. Cache-toi dans les armoires !",
  goal:'',hint:'',itemIcon:'💳',unlock:'',exitGoal:'🛗 L\'ascenseur est là : FONCEZ !',exitHint:'Au bout du couloir, à l\'est',
  monsterSound:v=>{tone('sine',880,.25,.06*v,{f2:1200,vib:[8,30]})},caught:c=>{scMessage(c.name.includes('Patient')?'🧟 Le Patient 13 te fait un câlin… baveux !':'💉 PIQÛRE ! Tu t\'endors… et tu te réveilles à l\'entrée.',2.6);SFX.laugh()},
  drawItem:(L,p)=>L.push({mesh:MESH.rbox,m:M.chain(M.T(...p),M.RY(time*2),M.S(.5,.32,.06)),mode:3,color:'#7fffd4',shin:160,emis:HDR?1:.4}),
  stages:[{goal:'💳 Badges d\'accès',icon:'💳',hint:'6 badges dans les 16 salles · Ctrl = discret · E = armoire',msg:'⚡ Les badges rallument le labo… il faut l\'antidote !'},
    {goal:'🧪 Fioles d\'antidote',icon:'🧪',hint:'5 fioles dans les labos et chambres',msg:'🛗 Antidote prêt ! L\'ascenseur remonte du sous-sol…',spawn:[{name:'Docteur Gloups',av:'monstre',pos:[0,.2,0],speed:6.7,aggro:18,path:[[-45,0,0],[45,0,0]]}],
      draw:(L,p)=>L.push({mesh:MESH.cyl,m:M.chain(M.T(...p),M.S(.25,.6,.25)),mode:9,color:'#39ffb6',shin:220},{mesh:MESH.sphere,m:M.chain(M.T(p[0],p[1]-.1,p[2]),M.S(.2,.35,.2)),mode:3,color:'#39ffb6',emis:HDR?1.4:.5})},
    {survive:120,goal:'⏳ L\'ascenseur arrive dans',hint:'Survivez ensemble, cachez-vous dans les armoires !',msg:'🛗 DING ! L\'ascenseur est ouvert !',spawn:[{name:'Infirmière Piqûre II',av:'infirmiere',pos:[40,.2,15],speed:6.4,aggro:16}],done:G=>{for(const b of G.gates){b.nocol=true;b.alpha=.12}refreshSolids()}}],
  build(G,h){B(0,-.5,0,170,1,120,{mat:'beton',color:'#2a2d30'});G.start=[-62,.3,0];SIGN(-56,4,-4,'HÔPITAL\nSAINT-FRISSON',true,{size:40,yaw:Math.PI/2});
    const R=hzWing(h,-48,0,8,12,24,'#c9d6d2','#7d8a86');R.forEach(([x,z],k)=>furn(x,z,k));
    G.gates=[B(49,2.5,0,.5,5,6,{mat:'metal',color:'#9aa4b2'})];B(53,2.5,-3.2,8,5,.4,{mat:'metal'});B(53,2.5,3.2,8,5,.4,{mat:'metal'});B(57,2.5,0,.4,5,6.4,{mat:'metal'});G.door={pos:[53,2,0],size:[6,4,5]};h.light(53,4.4,0,'#7fffd4',8,2,0);
    [[-42,15],[-18,-15],[6,15],[30,-15],[42,15],[-42,-15]].forEach((p,i)=>G.items.push({id:'b'+i,name:'un badge',pos:[p[0]+3,1.2,p[1]+6],taken:false}));
    [[-6,-15],[-30,15],[42,-15],[18,15],[6,-15]].forEach((p,i)=>G.items.push({id:'v'+i,name:'une fiole',pos:[p[0]-3,1.3,p[1]-7],taken:false,st:1}));
    G.bananas=[{pos:[-55,.4,5]},{pos:[0,.4,2]},{pos:[30,.4,-2]}];G.cushions=[[-30,0],[18,0],[-6,15],[30,15]].map(p=>({pos:[p[0],.3,p[1]],size:[2,.6,2]}));
    G.scares=[{pos:[-18,2,15],size:[6,4,8],kind:'poulet'},{pos:[30,2,15],size:[6,4,8]},{pos:[6,2,-15],size:[6,4,8]},{pos:[-42,2,-15],size:[6,4,8],kind:'poulet'}];
    G.hides=R.filter((r,i)=>i%2===0).map(([x,z])=>[x+4.5,z+(z>0?9:-9)]);
    G.mspawn=[{name:'Infirmière Piqûre',av:'infirmiere',pos:[0,.2,0],speed:6.2,aggro:15,path:[[-45,0,0],[45,0,0]]},{name:'Patient 13',av:'monstre',pos:[30,.2,15],speed:4.7,aggro:22,path:[[30,0,15],[30,0,0],[-18,0,0],[-18,0,-15]]}]}});

/* ------------------------------ COLLÈGE HANTÉ ------------------------------ */
GAMES.college=makeHorror({name:'Collège Hanté',icon:'🏫',colors:['#2a1f0f','#ffd23f'],music:'camp',badges:['S\'échapper : jusqu\'à +100 Blox'],
  desc:"Horreur drôle co-op (environ 25 minutes) : enfermés au collège la nuit ! Retrouvez 7 copies d'examen volées, 4 clés de casier, sonnez la cloche et tenez 90 secondes face au Prof Grincheux (zombie), au fantôme du concierge et à la Cantinière Gluante. Retenue = retour à l'entrée !",
  goal:'',hint:'',itemIcon:'📄',unlock:'',exitGoal:'🔔 Le portail est ouvert : FUYEZ !',exitHint:'Le portail de la cour, au sud',
  monsterSound:v=>{tone('square',220,.2,.06*v,{f2:180});tone('square',165,.2,.05*v,{delay:.15})},caught:c=>{scMessage(c.name.includes('Prof')?'📚 RETENUE ! 100 lignes : « Je ne courrai plus dans les couloirs »':'👻 Le concierge te passe la serpillière dessus…',2.8);SFX.laugh()},
  drawItem:(L,p)=>L.push({mesh:MESH.box,m:M.chain(M.T(...p),M.RY(time*2),M.S(.5,.04,.7)),mode:3,color:'#ffffff',shin:40,emis:HDR?.8:.3}),
  stages:[{goal:'📄 Copies d\'examen',icon:'📄',hint:'7 copies dans les salles de classe',msg:'🗝️ Le Prof a caché les clés du casier du concierge !'},
    {goal:'🗝️ Clés de casier',icon:'🗝️',hint:'4 clés : gymnase, cantine, bibliothèque, salle des profs',msg:'🔔 Vous avez la clé de la cloche… Sonnez-la et tenez bon !',spawn:[{name:'Cantinière Gluante',av:'monstre',pos:[-30,.2,-40],speed:6,aggro:18}],
      draw:(L,p)=>L.push({mesh:MESH.torus,m:M.chain(M.T(p[0],p[1]+.2,p[2]),M.RY(time*2),M.RX(Math.PI/2),M.S(.4,.4,.4)),mode:3,color:'#ffd23f',shin:200,emis:HDR?1:.4})},
    {survive:90,goal:'🔔 DING DONG… tenez encore',hint:'Toute l\'école vous court après !',msg:'🎒 C\'est l\'heure de la sortie : le portail s\'ouvre !',spawn:[{name:'Prof Grincheux (furieux)',av:'prof',pos:[0,.2,-10],speed:7,aggro:20}],done:G=>{for(const b of G.gates){b.nocol=true;b.alpha=.12}refreshSolids()}}],
  build(G,h){B(0,-.5,0,170,1,170,{mat:'beton',color:'#3a3d42'});G.start=[0,.3,40];SIGN(0,4,30,'COLLÈGE\nVICTOR-FRISSON',true,{size:40});
    const A=hzWing(h,-48,0,7,12,22,'#e6d6b5','#8a6a4a'),Bw=hzWing(h,-48,-48,4,12,18,'#d6c6e6','#6a5a7a');[...A,...Bw].forEach(([x,z],k)=>{furn(x,z,k);if(k%2)for(let j=0;j<3;j++)B(x-3+j*3,.8,z,1.4,.1,1,{mat:'bois',color:'#8d5a2b'})});
    h.room(24,-50,26,22,8,'brique','#a0503a',[['n',0]]);SIGN(24,6,-38.6,'GYMNASE',false,{size:40});for(let i=0;i<3;i++)B(14+i*10,.8,-56,3,1.6,1.4,{mat:'lisse',color:'#3d7eff'});
    G.gates=[B(0,2.5,58,10,5,.5,{mat:'metal',color:'#30343d'})];B(-27,2,58,44,4,.5,{mat:'metal',color:'#30343d',alpha:.6});B(27,2,58,44,4,.5,{mat:'metal',color:'#30343d',alpha:.6});G.door={pos:[0,2,63],size:[10,4,6]};h.light(0,3,62,'#ffd23f',10,2,0);
    for(const[x,z]of[[-30,40],[30,40],[-40,25],[40,25]])TREE(x,z,3.4,3.2);
    [[-42,14],[-18,-14],[6,14],[30,-14],[-30,-14],[18,14],[-6,-14]].forEach((p,i)=>G.items.push({id:'c'+i,name:'une copie',pos:[p[0]+3,1.2,p[1]+(p[1]>0?7:-7)],taken:false}));
    [[30,1,-56],[-42,1,-58],[-18,1,-38],[-6,1,-58]].forEach((p,i)=>G.items.push({id:'k'+i,name:'une clé',pos:p,taken:false,st:1}));
    G.bananas=[{pos:[4,.4,36]},{pos:[-24,.4,2]},{pos:[30,.4,-46]}];G.cushions=[[-18,0],[24,-48],[6,0],[-30,-48]].map(p=>({pos:[p[0],.3,p[1]],size:[2,.6,2]}));
    G.scares=[{pos:[-6,2,14],size:[6,4,8],kind:'poulet'},{pos:[30,2,14],size:[6,4,8]},{pos:[-42,2,-58],size:[6,4,8]},{pos:[24,2,-50],size:[8,4,8],kind:'poulet'}];
    G.hides=[...A.filter((r,i)=>i%3===0),...Bw.filter((r,i)=>i%2===1)].map(([x,z])=>[x-4.5,z+(z>-40&&z>0?8:-6)]);
    G.mspawn=[{name:'Prof Grincheux',av:'prof',pos:[0,.2,0],speed:6.3,aggro:16,path:[[-45,0,0],[36,0,0]]},{name:'Fantôme du concierge',av:'fantome',pos:[-20,.2,-48],speed:5.4,aggro:20,path:[[-45,0,-48],[0,0,-48],[0,0,0]]}]}});

/* --------------------------- FÊTE FORAINE MAUDITE --------------------------- */
GAMES.foire=makeHorror({name:'Fête Foraine Maudite',icon:'🎡',colors:['#1a0b2e','#ff4fa3'],music:'manoir',badges:['S\'échapper : jusqu\'à +100 Blox'],
  desc:"Horreur co-op en plein air (environ 25 minutes) : la fête foraine ferme… pour toujours ! Trouvez 8 tickets dorés, 4 ampoules pour rallumer l'enseigne SORTIE, puis tenez 100 secondes dans le chaos. Lapinou la mascotte, le Clown Jongleur et le Train Fantôme rôdent.",
  goal:'',hint:'',itemIcon:'🎟️',unlock:'',exitGoal:'🎡 La SORTIE est allumée : courez !',exitHint:'L\'arche lumineuse au nord',
  monsterSound:v=>SFX.honk(v*.8),caught:c=>{scMessage(c.name.includes('Lapinou')?'🐰 Lapinou t\'offre un câlin… très serré !':'🤡 Le clown te jongle avec ses quilles !',2.6);SFX.laugh()},
  drawItem:(L,p)=>L.push({mesh:MESH.box,m:M.chain(M.T(...p),M.RY(time*2),M.S(.6,.04,.32)),mode:3,color:'#ffd23f',shin:200,emis:HDR?1.4:.5}),
  stages:[{goal:'🎟️ Tickets dorés',icon:'🎟️',hint:'8 tickets entre les stands, le carrousel et le labyrinthe',msg:'💡 Le guichet donne 4 ampoules à retrouver pour l\'enseigne SORTIE !'},
    {goal:'💡 Ampoules',icon:'💡',hint:'4 ampoules : train fantôme, grande roue, tente, labyrinthe',msg:'🎪 L\'enseigne clignote… tenez bon pendant qu\'elle chauffe !',spawn:[{name:'Train Fantôme',av:'fantome',pos:[40,.2,-30],speed:7,aggro:14}],
      draw:(L,p)=>{L.push({mesh:MESH.sphere,m:M.chain(M.T(...p),M.S(.3,.4,.3)),mode:3,color:'#fff6b0',emis:HDR?2:.7});glow(p,[2,2,1],1.2)}},
    {survive:100,goal:'🎪 L\'enseigne chauffe…',hint:'Tout le monde vous poursuit, restez groupés !',msg:'🎉 SORTIE allumée !',spawn:[{name:'Méga Lapinou',av:'lapinou',pos:[0,.2,-50],speed:6.6,aggro:22}],done:G=>{for(const b of G.gates){b.nocol=true;b.alpha=.12}refreshSolids()}}],
  build(G,h){B(0,-.5,0,170,1,170,{mat:'terre',color:'#2a2230'});G.start=[0,.3,60];
    for(let i=0;i<48;i++){const a=i/48*6.283;B(Math.cos(a)*76,1.5,Math.sin(a)*76,10,3,1,{mat:'bois',color:i%2?'#e5484d':'#f2f2f2'})}
    // carrousel
    B(0,.3,0,16,.6,16,{mat:'lisse',color:'#ff4fa3',shape:'cyl'});B(0,6,0,17,.6,17,{mat:'lisse',color:'#ffd23f',shape:'cyl'});B(0,3,0,1,6,1,{mat:'or',shape:'cyl'});for(let i=0;i<8;i++){const a=i/8*6.283;B(Math.cos(a)*6,3,Math.sin(a)*6,.2,5.4,.2,{mat:'or'});B(Math.cos(a)*6,1.6,Math.sin(a)*6,.8,1,1.6,{mat:'lisse',color:pick(['#f2f2f2','#3d7eff','#e5484d'])})}h.light(0,5,0,'#ff8ad8',14,2,.4);
    // grande roue
    for(let i=0;i<16;i++){const a=i/16*6.283;B(45+Math.cos(a)*12,14+Math.sin(a)*12,20,1.2,1.2,1.2,{mat:'metal',color:'#ffd23f'});if(i%2)B(45+Math.cos(a)*12,12.6+Math.sin(a)*12,20,2,1.6,2,{mat:'lisse',color:'#e5484d'})}B(45,7,20,1,14,1,{mat:'metal'});
    // stands
    for(let i=0;i<6;i++){const x=-50+i*14,z=-12;h.room(x,z+i%2*30,8,6,3.6,'planches',pick(['#e5484d','#3d7eff','#2fbf71','#ffd23f']),[['s',0]]);h.light(x,3,z+i%2*30,'#ffcf8a',8,1.3,.6)}
    // train fantôme (tunnel), tente, labyrinthe de bottes de foin
    h.room(40,-30,24,10,5,'basalte','#1a1a22',[['w',0],['e',0]]);h.light(40,4,-30,'#ff3030',8,1,.9);SIGN(27,4,-30,'TRAIN FANTÔME',false,{size:36,yaw:Math.PI/2});
    h.room(-40,-40,16,16,7,'lisse','#7a2a7a',[['n',0]]);SIGN(-40,6,-31.5,'TENTE DE MME IRMA',false,{size:30});
    for(let i=0;i<14;i++)B(-50+(i%7)*5,1,20+Math.floor(i/7)*8+(i%2)*3,4,2,1.6,{mat:'planches',color:'#c8a24a'});
    G.gates=[B(0,3,-70,10,6,.5,{mat:'metal',color:'#30343d'})];B(0,8,-70,14,2,1,{mat:'neon',color:'#ff4fa3'});G.door={pos:[0,2,-74],size:[10,4,6]};
    [[-50,1.2,-12],[-36,1.2,18],[-8,1.2,-12],[6,1.2,18],[20,1.2,-12],[8,1.2,0],[-40,1.2,26],[60,1.2,40]].forEach((p,i)=>G.items.push({id:'t'+i,name:'un ticket doré',pos:p,taken:false}));
    [[48,1.4,-30],[45,1.4,9],[-40,1.4,-44],[-46,1.4,28]].forEach((p,i)=>G.items.push({id:'a'+i,name:'une ampoule',pos:p,taken:false,st:1}));
    G.bananas=[{pos:[6,.4,56]},{pos:[-20,.4,0]},{pos:[30,.4,-10]}];G.cushions=[[-14,6],[14,-6],[30,30],[-30,-20]].map(p=>({pos:[p[0],.3,p[1]],size:[2,.6,2]}));
    G.scares=[{pos:[40,2,-30],size:[20,4,8]},{pos:[-40,2,-40],size:[12,4,12],kind:'poulet'},{pos:[-36,2,24],size:[16,4,10]}];
    G.hides=[[-56,6],[-20,-30],[22,26],[-60,-30],[60,-8],[10,40]];
    G.mspawn=[{name:'Lapinou la mascotte',av:'lapinou',pos:[0,.2,-20],speed:6.2,aggro:17,path:[[-40,0,-20],[40,0,-20],[40,0,30],[-40,0,30]]},{name:'Clown Jongleur',av:'clown',pos:[30,.2,30],speed:5.8,aggro:16}]}});
