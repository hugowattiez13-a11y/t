"use strict";
/* ============================== AVATAR : CATALOGUE UGC ============================== */
MESH.frustum=upload(gCylUV(28,.36,.5));
const SKINS=['#ffe0c4','#f6cfa9','#f3c9a0','#e0ac7e','#c68642','#a0673c','#8d5524','#5e3a1f','#ffd23f','#7fd1ff','#9be37a','#c9a7ff','#ff9db5','#d9dde3'];
const RARITY=p=>p===0?'Gratuit':p<80?'Commun':p<200?'Rare':p<500?'Épique':'Légendaire';
const RCOL={Gratuit:'#9aa4b2',Commun:'#b9c2cf',Rare:'#4ea8ff',Épique:'#b46bff',Légendaire:'#ffb52e'};
const CATS=[['haut','Hauts','👕'],['bas','Bas','👖'],['visage','Visages','🙂'],['chapeau','Chapeaux','🎩'],['cheveux','Cheveux','💇'],['lunettes','Visage (acc.)','🕶️'],['dos','Dos','🪽'],['cou','Cou','🧣'],['epaule','Épaule','🦜'],['emote','Emotes','💃']];
const CATALOG=[];const IT={};const UGC_IMG={};
function add(cat,id,name,price,data){const it={cat,id,name,price,rarity:RARITY(price),...data};CATALOG.push(it);IT[id]=it;return it}

/* ---------- Hauts ---------- */
[['tee_blanc','T-shirt blanc',0,{c:'#f2f2f2',pat:'plain'}],['tee_rouge','T-shirt rouge',0,{c:'#e5484d',pat:'plain'}],['tee_bleu','T-shirt bleu',0,{c:'#3d7eff',pat:'plain'}],['tee_noir','T-shirt noir',25,{c:'#22252b',pat:'plain'}],
 ['tee_corail','T-shirt corail',0,{c:'#ff7a59',pat:'plain'}],['mariniere','Marinière',60,{c:'#f4f1ea',c2:'#1f3a7a',pat:'stripes'}],['logo','T-shirt Cubik',45,{c:'#1b1e27',c2:'#ffd23f',pat:'logo'}],
 ['hoodie_gris','Sweat à capuche gris',90,{c:'#8a919c',c2:'#5b616b',pat:'hoodie',sleeve:'long'}],['hoodie_violet','Sweat violet néon',140,{c:'#7b3cff',c2:'#39ffb6',pat:'hoodie',sleeve:'long'}],
 ['veste_jean','Veste en jean',160,{c:'#4c6fa8',c2:'#f2f2f2',pat:'jacket',sleeve:'long'}],['costume','Costume chic',320,{c:'#23262f',c2:'#c0202a',pat:'suit',sleeve:'long'}],
 ['maillot','Maillot de foot',120,{c:'#1d9a5b',c2:'#ffffff',pat:'jersey',text:'10'}],['carreaux','Chemise à carreaux',110,{c:'#b3282d',c2:'#1a1a1a',pat:'flannel',sleeve:'long'}],
 ['armure','Armure de chevalier',650,{c:'#9aa3ad',c2:'#e3b341',pat:'armor',sleeve:'long'}],['debardeur','Débardeur',30,{c:'#ffd23f',pat:'plain',sleeve:'none'}],
 ['doudoune','Doudoune',240,{c:'#ff8a3d',c2:'#d9662a',pat:'puffer',sleeve:'long'}],['noel','Pull de Noël',180,{c:'#c62b2b',c2:'#ffffff',pat:'xmas',sleeve:'long'}],
 ['blouse','Blouse de labo',150,{c:'#f4f6f8',c2:'#3d7eff',pat:'labcoat',sleeve:'long'}],['kimono','Kimono',380,{c:'#2a3f8f',c2:'#e5484d',pat:'kimono',sleeve:'long'}],
 ['galaxie','Haut Galaxie',900,{c:'#160f3a',c2:'#b46bff',pat:'galaxy',sleeve:'long'}]
].forEach(([id,n,p,d])=>add('haut',id,n,p,d));
/* ---------- Bas ---------- */
[['jean_bleu','Jean bleu',0,{c:'#33415c',pat:'jeans',shoes:'#f2f2f2'}],['jean_noir','Jean noir',30,{c:'#1c1d22',pat:'jeans',shoes:'#e5484d'}],['short','Short beige',0,{c:'#c8b28a',pat:'shorts',shoes:'#3d7eff'}],
 ['cargo','Cargo kaki',70,{c:'#5f6b3a',pat:'cargo',shoes:'#3b2f25'}],['costume_p','Pantalon de costume',150,{c:'#23262f',pat:'suit',shoes:'#111111'}],['jogging','Jogging sport',90,{c:'#1d2433',c2:'#ffffff',pat:'sport',shoes:'#f2f2f2'}],
 ['armure_p','Jambières d\'armure',450,{c:'#9aa3ad',c2:'#e3b341',pat:'armor',shoes:'#6c737d'}],['jupe','Jupe plissée',80,{c:'#e5484d',pat:'skirt',shoes:'#22252b'}],
 ['pyjama','Pyjama à pois',60,{c:'#a7c7ff',c2:'#ffffff',pat:'dots',shoes:'#ffd6e0'}],['ninja','Tenue de ninja',260,{c:'#15161b',c2:'#c0202a',pat:'ninja',shoes:'#15161b'}],['galaxie_p','Bas Galaxie',700,{c:'#160f3a',c2:'#b46bff',pat:'galaxy',shoes:'#b46bff'}]
].forEach(([id,n,p,d])=>add('bas',id,n,p,d));
/* ---------- Visages ---------- */
[['sourire','Sourire',0],['grand_sourire','Grand sourire',0],['clin','Clin d\'œil',35],['cool','Lunettes cool',120],['surpris','Surpris',25],['fache','Fâché',40],['endormi','Endormi',40],['kawaii','Kawaii',90],
 ['robot','Visage robot',260],['etoiles','Yeux étoiles',180],['coeurs','Yeux cœurs',150],['langue','Langue tirée',55],['coin','Sourire en coin',60],['mdr','Mort de rire',110],['serieux','Sérieux',20],['timide','Timide',75],['demon','Démoniaque',500],
 ['pirate','Pirate',140],['intello','Intello',85],['bisou','Bisou',70],['zen','Zen',60],['choque','Choqué',45],['vampire','Vampire',320],['chaton','Chaton :3',130],['pixel','Pixel',220],['joie','Larmes de joie',95],['heros','Héros masqué',380],['fatigue','Fatigué',30],['malicieux','Malicieux',150]
].forEach(([id,n,p])=>add('visage',id,n,p,{}));
/* ---------- Accessoires (parties 3D) : [forme, x,y,z, sx,sy,sz, couleur, options] ---------- */
const PT=(s,x,y,z,sx,sy,sz,c,o={})=>({s,x,y,z,sx,sy,sz,c,...o});
const GOLD={shin:160,metal:1},MET={shin:120};
function hat(id,n,p,parts,o={}){return add('chapeau',id,n,p,{at:'head',parts,...o})}
hat('casquette_rouge','Casquette rouge',0,[PT('sphere',0,.19,-.01,.74,.44,.74,'#e5484d'),PT('cyl',0,.2,.3,.56,.03,.4,'#c23a3e')]);
hat('casquette_bleue','Casquette bleue',20,[PT('sphere',0,.19,-.01,.74,.44,.74,'#3d7eff'),PT('cyl',0,.2,.3,.56,.03,.4,'#2c62d1')]);
hat('casquette_envers','Casquette à l\'envers',45,[PT('sphere',0,.19,.01,.74,.44,.74,'#22252b'),PT('cyl',0,.2,-.3,.56,.03,.4,'#ffd23f')]);
hat('bonnet','Bonnet à pompon',50,[PT('sphere',0,.16,0,.75,.62,.75,'#2fbf71'),PT('torus',0,.12,0,1.0,.75,1.0,'#f2f2f2'),PT('sphere',0,.48,0,.2,.2,.2,'#f2f2f2')]);
hat('bonnet_noir','Bonnet noir',35,[PT('sphere',0,.16,0,.75,.62,.75,'#1c1d22'),PT('torus',0,.12,0,1.0,.75,1.0,'#2b2d33')]);
hat('haut_forme','Haut-de-forme',150,[PT('cyl',0,.5,0,.5,.52,.5,'#16171b',{shin:60}),PT('cyl',0,.26,0,.86,.04,.86,'#16171b'),PT('cyl',0,.33,0,.51,.1,.51,'#c0202a')]);
hat('couronne','Couronne royale',800,[PT('cyl',0,.36,0,.58,.18,.58,'#f2c14e',GOLD),...[0,1,2,3,4].map(i=>PT('cone',Math.sin(i*1.2566)*.24,.52,Math.cos(i*1.2566)*.24,.12,.18,.12,'#f2c14e',GOLD)),
  PT('sphere',0,.37,.29,.09,.09,.06,'#e5484d',{shin:200,emis:.4}),PT('sphere',.24,.37,.17,.07,.07,.05,'#3d7eff',{shin:200,emis:.4}),PT('sphere',-.24,.37,.17,.07,.07,.05,'#2fbf71',{shin:200,emis:.4})]);
hat('cowboy','Chapeau de cowboy',130,[PT('cyl',0,.24,0,1.05,.04,1.0,'#8a5a32'),PT('cyl',0,.42,0,.52,.34,.48,'#8a5a32'),PT('cyl',0,.3,0,.53,.07,.49,'#3b2617')]);
hat('viking','Casque viking',260,[PT('sphere',0,.14,0,.78,.62,.78,'#8f98a3',MET),PT('torus',0,.1,0,1.02,.5,1.02,'#b38b4d',MET),PT('cone',.42,.36,0,.12,.4,.12,'#efe6d2',{rz:-1}),PT('cone',-.42,.36,0,.12,.4,.12,'#efe6d2',{rz:1})]);
hat('sorcier','Chapeau de sorcier',220,[PT('cone',0,.66,-.02,.68,.95,.68,'#4b2a8a'),PT('cyl',0,.23,0,1.05,.03,1.05,'#4b2a8a'),PT('sphere',.12,.62,.24,.1,.1,.04,'#ffd23f',{emis:.6})]);
hat('chantier','Casque de chantier',40,[PT('sphere',0,.2,0,.74,.5,.74,'#ffcc00',{shin:90}),PT('cyl',0,.2,0,.88,.03,.88,'#ffcc00',{shin:90})]);
hat('aureole','Auréole',500,[PT('torusThin',0,.62,0,.62,.62,.62,'#fff2a8',{emis:2.5,anim:'spin'})]);
hat('cornes','Cornes de démon',180,[PT('cone',.18,.38,0,.12,.32,.12,'#c0202a',{rz:-.4,shin:90}),PT('cone',-.18,.38,0,.12,.32,.12,'#c0202a',{rz:.4,shin:90})]);
hat('chat','Oreilles de chat',70,[PT('cone',.2,.37,0,.22,.26,.12,'#2b2d33',{rz:-.25}),PT('cone',-.2,.37,0,.22,.26,.12,'#2b2d33',{rz:.25}),PT('cone',.2,.36,.04,.12,.16,.06,'#ff9db5',{rz:-.25}),PT('cone',-.2,.36,.04,.12,.16,.06,'#ff9db5',{rz:.25})]);
hat('casque_audio','Casque audio',160,[PT('torus',0,.04,0,.95,.95,.7,'#22252b',{rz:0,rx:Math.PI/2,shin:80}),PT('cyl',.37,0,0,.26,.1,.26,'#e5484d',{rz:Math.PI/2,shin:80}),PT('cyl',-.37,0,0,.26,.1,.26,'#e5484d',{rz:Math.PI/2,shin:80})]);
hat('bob','Bob',55,[PT('frustum',0,.3,0,.8,.24,.8,'#c8b28a'),PT('cyl',0,.2,0,.98,.03,.98,'#c8b28a')]);
hat('pirate','Chapeau de pirate',240,[PT('cyl',0,.26,0,1.0,.05,.7,'#15161b'),PT('cyl',0,.4,0,.6,.3,.5,'#15161b'),PT('sphere',0,.42,.24,.12,.12,.04,'#f2f2f2')]);
hat('toque','Toque de chef',90,[PT('cyl',0,.38,0,.6,.28,.6,'#f7f7f7'),PT('sphere',0,.6,0,.78,.42,.78,'#f7f7f7')]);
hat('helice','Casquette à hélice',110,[PT('sphere',0,.19,-.01,.74,.44,.74,'#ffd23f'),PT('cyl',0,.2,.3,.56,.03,.4,'#3d7eff'),PT('cyl',0,.44,0,.04,.12,.04,'#888'),PT('box',0,.5,0,.7,.02,.08,'#e5484d',{anim:'spinFast'})]);
hat('astronaute','Casque d\'astronaute',700,[PT('sphere',0,.02,0,.96,.96,.96,'#bfe9ff',{glass:1}),PT('torus',0,-.3,0,1.1,.6,1.1,'#e8ecf2',MET)]);
/* ---------- Cheveux ---------- */
const HAIRC={brun:'#4a2e1c',noir:'#1a1a1d',blond:'#e8c46a',roux:'#c4562a',rose:'#ff8ac7',bleu:'#4aa8ff'};
function hairShort(c){return[PT('rbox',0,.21,-.02,.74,.26,.72,c),PT('rbox',0,.02,-.22,.72,.48,.3,c),PT('rbox',.31,.07,-.02,.12,.32,.5,c),PT('rbox',-.31,.07,-.02,.12,.32,.5,c)]}
const hairStyles={courts:['Cheveux courts',c=>hairShort(c)],meche:['Mèche stylée',c=>[...hairShort(c),PT('rbox',.1,.2,.28,.5,.16,.16,c,{rz:-.3})]],
  queue:['Queue de cheval',c=>[...hairShort(c),PT('rbox',0,-.1,-.42,.2,.5,.2,c,{rx:.45})]],afro:['Afro',c=>[PT('sphere',0,.16,-.05,1.02,.92,1.0,c)]],
  longs:['Cheveux longs',c=>[...hairShort(c),PT('rbox',0,-.28,-.25,.76,.85,.22,c),PT('rbox',.33,-.14,0,.1,.62,.4,c),PT('rbox',-.33,-.14,0,.1,.62,.4,c)]],
  crete:['Crête punk',c=>[PT('rbox',0,.2,-.02,.5,.08,.7,'#2a2a2a'),...[-.27,-.13,0,.13,.27].map((z,i)=>PT('cone',0,.42-Math.abs(z)*.4,z,.14,.34,.18,c,{rx:z*.8}))]],
  couettes:['Couettes',c=>[...hairShort(c),PT('sphere',.44,-.06,-.08,.32,.38,.32,c),PT('sphere',-.44,-.06,-.08,.32,.38,.32,c)]],
  chignon:['Chignon',c=>[...hairShort(c),PT('sphere',0,.5,-.12,.36,.32,.36,c)]]};
[['courts','brun',0],['courts','noir',0],['courts','blond',15],['meche','noir',60],['meche','bleu',90],['queue','brun',50],['queue','blond',50],['afro','noir',80],['longs','roux',90],['longs','blond',90],['longs','noir',90],
 ['crete','rose',140],['couettes','rose',110],['couettes','brun',90],['chignon','brun',70]].forEach(([st,col,p])=>add('cheveux',`ch_${st}_${col}`,`${hairStyles[st][0]} (${col})`,p,{at:'head',parts:hairStyles[st][1](HAIRC[col])}));
/* ---------- Visage (accessoires) ---------- */
function acc(cat,id,n,p,at,parts,o={}){return add(cat,id,n,p,{at,parts,...o})}
acc('lunettes','lunettes_rondes','Lunettes rondes',40,'head',[PT('torusThin',.13,.03,.34,.24,.24,.24,'#2b2d33',{rx:Math.PI/2}),PT('torusThin',-.13,.03,.34,.24,.24,.24,'#2b2d33',{rx:Math.PI/2}),PT('box',0,.04,.35,.06,.02,.02,'#2b2d33')]);
acc('lunettes','lunettes_soleil','Lunettes de soleil',80,'head',[PT('rbox',.13,.03,.35,.2,.12,.04,'#101114',{shin:220}),PT('rbox',-.13,.03,.35,.2,.12,.04,'#101114',{shin:220}),PT('box',0,.06,.35,.1,.025,.02,'#101114')]);
acc('lunettes','lunettes_3d','Lunettes 3D',60,'head',[PT('box',0,.03,.35,.5,.16,.03,'#f2f2f2'),PT('box',.12,.03,.37,.17,.1,.01,'#e5484d',{emis:.4}),PT('box',-.12,.03,.37,.17,.1,.01,'#3d7eff',{emis:.4})]);
acc('lunettes','lunettes_coeur','Lunettes cœur',120,'head',[PT('sphere',.13,.04,.35,.2,.16,.04,'#ff4f9a',{shin:200}),PT('sphere',-.13,.04,.35,.2,.16,.04,'#ff4f9a',{shin:200})]);
acc('lunettes','moustache','Moustache',30,'head',[PT('rbox',.06,-.09,.34,.14,.05,.05,'#3b2617',{rz:.25}),PT('rbox',-.06,-.09,.34,.14,.05,.05,'#3b2617',{rz:-.25})]);
acc('lunettes','monocle','Monocle',150,'head',[PT('torusThin',.13,.03,.35,.24,.24,.24,'#f2c14e',{rx:Math.PI/2,...GOLD}),PT('box',.2,-.18,.32,.01,.36,.01,'#f2c14e',GOLD)]);
acc('lunettes','bandeau','Bandeau',35,'head',[PT('torus',0,.13,0,1.0,.35,1.0,'#e5484d')]);
acc('lunettes','masque_ninja','Masque de ninja',110,'head',[PT('rbox',0,-.08,.04,.74,.24,.7,'#15161b')]);
/* ---------- Dos ---------- */
const wing=(c,o={})=>[PT('sphere',.5,.32,-.44,.62,1.15,.07,c,{ry:-.5,rz:-.55,anim:'flapR',...o}),PT('sphere',.38,-.12,-.42,.42,.7,.06,c,{ry:-.5,rz:-1.0,anim:'flapR',...o}),PT('sphere',-.5,.32,-.44,.62,1.15,.07,c,{ry:.5,rz:.55,anim:'flapL',...o}),PT('sphere',-.38,-.12,-.42,.42,.7,.06,c,{ry:.5,rz:1.0,anim:'flapL',...o})];
acc('dos','ailes_ange','Ailes d\'ange',600,'torso',wing('#f7f7f7',{emis:.25}));
acc('dos','ailes_demon','Ailes de démon',600,'torso',wing('#7a1018',{shin:80}));
acc('dos','ailes_papillon','Ailes de papillon',420,'torso',[...wing('#ff7ad9',{emis:.3}),PT('sphere',.32,-.15,-.38,.5,.6,.08,'#7a5cff',{ry:-.55,anim:'flapR',emis:.3}),PT('sphere',-.32,-.15,-.38,.5,.6,.08,'#7a5cff',{ry:.55,anim:'flapL',emis:.3})]);
acc('dos','cape','Cape de héros',180,'torso',[PT('box',0,-.12,-.3,.98,1.25,.04,'#c0202a',{rx:.12,anim:'cape'})]);
acc('dos','sac','Sac à dos',70,'torso',[PT('rbox',0,0,-.44,.72,.8,.36,'#3d7eff'),PT('rbox',0,-.15,-.64,.5,.36,.08,'#2c62d1')]);
acc('dos','jetpack','Jetpack',750,'torso',[PT('cyl',.18,0,-.44,.26,.72,.26,'#9aa3ad',MET),PT('cyl',-.18,0,-.44,.26,.72,.26,'#9aa3ad',MET),PT('cone',.18,-.43,-.44,.2,.14,.2,'#3b3f47',{rx:Math.PI}),PT('cone',-.18,-.43,-.44,.2,.14,.2,'#3b3f47',{rx:Math.PI})],{fx:'jet'});
acc('dos','epee_dos','Épée dans le dos',300,'torso',[PT('box',0,.1,-.32,.12,1.35,.04,'#d8dee6',{rz:.6,shin:200}),PT('box',-.34,-.42,-.32,.36,.07,.08,'#8a5a32',{rz:.6}),PT('cyl',-.42,-.54,-.32,.08,.22,.08,'#3b2617',{rz:.6})]);
acc('dos','bouclier','Bouclier',220,'torso',[PT('cyl',0,0,-.32,.82,.06,.82,'#8a5a32',{rx:Math.PI/2}),PT('torus',0,0,-.36,.96,.96,.3,'#9aa3ad',{rx:Math.PI/2,...MET}),PT('sphere',0,0,-.37,.2,.2,.08,'#f2c14e',GOLD)]);
/* ---------- Cou ---------- */
acc('cou','echarpe','Écharpe',45,'torso',[PT('torus',0,.5,0,1.15,.8,.85,'#e5484d'),PT('rbox',.2,.15,.28,.18,.5,.06,'#e5484d')]);
acc('cou','chaine','Chaîne en or',300,'torso',[PT('torusThin',0,.33,.14,.95,.95,.95,'#f2c14e',{rx:.7,...GOLD}),PT('sphere',0,.06,.3,.12,.12,.04,'#f2c14e',GOLD)]);
acc('cou','noeud','Nœud papillon',50,'torso',[PT('cone',.09,.44,.28,.14,.16,.06,'#c0202a',{rz:Math.PI/2}),PT('cone',-.09,.44,.28,.14,.16,.06,'#c0202a',{rz:-Math.PI/2}),PT('sphere',0,.44,.29,.06,.06,.05,'#8f1520')]);
acc('cou','collier_fleurs','Collier de fleurs',80,'torso',[PT('torus',0,.42,.04,1.1,.7,.9,'#ff7ad9',{rx:.35})]);
acc('cou','cravate','Cravate',40,'torso',[PT('box',0,.18,.27,.12,.56,.02,'#3d7eff'),PT('box',0,.44,.27,.16,.08,.03,'#2c62d1')]);
/* ---------- Épaule (compagnons) ---------- */
acc('epaule','perroquet','Perroquet',350,'torso',[PT('sphere',-.56,.66,0,.24,.32,.24,'#e5484d',{anim:'bob'}),PT('sphere',-.56,.88,.04,.2,.2,.2,'#e5484d',{anim:'bob'}),PT('cone',-.56,.86,.16,.06,.1,.06,'#ffd23f',{rx:Math.PI/2,anim:'bob'}),PT('sphere',-.56,.62,-.1,.1,.26,.16,'#3d7eff',{anim:'bob'})]);
acc('epaule','chaton','Chaton',280,'torso',[PT('rbox',-.58,.66,0,.24,.2,.32,'#ff9a3d',{anim:'bob'}),PT('rbox',-.58,.82,.12,.2,.18,.18,'#ff9a3d',{anim:'bob'}),PT('cone',-.52,.94,.12,.06,.08,.04,'#ff9a3d',{anim:'bob'}),PT('cone',-.64,.94,.12,.06,.08,.04,'#ff9a3d',{anim:'bob'})]);
acc('epaule','drone','Mini-drone',520,'torso',[PT('sphere',-.85,1.0,0,.22,.14,.22,'#22252b',{anim:'orbit',shin:120}),PT('sphere',-.85,1.0,.09,.06,.06,.06,'#39ffb6',{anim:'orbit',emis:3})]);
/* ---------- Collection « Mégapack » : 100 nouveaux objets ---------- */
(()=>{const COL=[['rouge','#e5484d'],['bleu','#3d7eff'],['vert','#2fbf71'],['jaune','#ffd23f'],['violet','#7a5cff'],['rose','#ff4fa3'],['orange','#ff8a3d'],['noir','#22252b'],['blanc','#f2f2f2'],['turquoise','#39c5bb'],['bordeaux','#7a1f2b'],['kaki','#5f6b3a']];
  const dk=(h,k=.6)=>{const n=parseInt(h.slice(1),16);return'#'+[(n>>16&255)*k,(n>>8&255)*k,(n&255)*k].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('')};
  const pr=i=>[0,25,40,60,80,110,150,200,260,350][i%10];
  // 36 hauts
  const TOPS=[['plain','T-shirt',{}],['stripes','Marinière',{}],['dots','Chemise à pois',{}],['hoodie','Sweat',{sleeve:'long'}],['jacket','Veste',{sleeve:'long'}],['jersey','Maillot',{text:'7'}],['flannel','Chemise',{sleeve:'long'}],['sport','Haut de sport',{}],['puffer','Doudoune',{sleeve:'long'}]];
  let k=0;for(let t=0;t<TOPS.length;t++)for(let c=0;c<4;c++){const[pat,n,o]=TOPS[t],[cn,cc]=COL[(t*5+c*3)%COL.length],c2=COL[(t*5+c*3+5)%COL.length][1];add('haut',`mp_h${t}_${c}`,`${n} ${cn}`,pr(k++),{c:cc,c2,pat,...o})}
  // 24 bas
  const BOTS=[['jeans','Jean'],['cargo','Cargo'],['sport','Jogging'],['shorts','Short'],['suit','Pantalon chic'],['skirt','Jupe'],['dots','Pyjama']];
  k=0;for(let t=0;t<BOTS.length;t++)for(let c=0;c<(t<3?4:3);c++){const[pat,n]=BOTS[t],[cn,cc]=COL[(t*7+c*4+1)%COL.length];add('bas',`mp_b${t}_${c}`,`${n} ${cn}`,pr(k++),{c:cc,c2:'#ffffff',pat,shoes:COL[(t+c*5)%COL.length][1]})}
  // 20 chapeaux
  COL.slice(0,6).forEach(([cn,cc],i)=>hat('mp_casq_'+i,'Casquette '+cn,20+i*10,[PT('sphere',0,.19,-.01,.74,.44,.74,cc),PT('cyl',0,.2,.3,.56,.03,.4,dk(cc))]));
  COL.slice(6,11).forEach(([cn,cc],i)=>hat('mp_bon_'+i,'Bonnet '+cn,40+i*10,[PT('sphere',0,.16,0,.75,.62,.75,cc),PT('torus',0,.12,0,1.0,.75,1.0,dk(cc,.8)),PT('sphere',0,.48,0,.2,.2,.2,'#f2f2f2')]));
  hat('mp_beret','Béret',90,[PT('sphere',.05,.32,0,.8,.22,.8,'#1f2028'),PT('sphere',.05,.45,0,.06,.08,.06,'#1f2028')]);
  hat('mp_cowboy','Chapeau de cowboy',180,[PT('cyl',0,.28,0,1.2,.04,1.2,'#8d5a2b'),PT('cyl',0,.46,0,.56,.36,.56,'#8d5a2b'),PT('cyl',0,.33,0,.58,.06,.58,'#3b2617')]);
  hat('mp_chef','Toque de chef',120,[PT('cyl',0,.36,0,.62,.3,.62,'#f2f2f2'),PT('sphere',0,.62,0,.78,.38,.78,'#ffffff')]);
  hat('mp_aureole','Auréole',500,[PT('torusThin',0,.62,0,.7,.7,.7,'#ffe27a',{emis:1})]);
  hat('mp_cornes','Cornes de diable',260,[PT('cone',.22,.42,.05,.12,.3,.12,'#c0202a',{rz:-.4}),PT('cone',-.22,.42,.05,.12,.3,.12,'#c0202a',{rz:.4})]);
  hat('mp_lapin','Oreilles de lapin',150,[PT('sphere',.14,.62,0,.14,.5,.08,'#f2f2f2'),PT('sphere',-.14,.62,0,.14,.5,.08,'#f2f2f2'),PT('sphere',.14,.62,.02,.07,.36,.06,'#ffb3c8'),PT('sphere',-.14,.62,.02,.07,.36,.06,'#ffb3c8')]);
  hat('mp_casque_moto','Casque de moto',300,[PT('sphere',0,.08,0,.86,.86,.86,'#e5484d',{shin:200}),PT('rbox',0,.04,.34,.6,.26,.1,'#101114',{shin:240})]);
  hat('mp_citrouille','Tête citrouille',350,[PT('sphere',0,.05,0,.95,.85,.95,'#ff8a3d'),PT('cyl',0,.5,0,.08,.14,.08,'#2f6a2a')]);
  hat('mp_pirate','Chapeau de pirate',200,[PT('rbox',0,.38,0,1.05,.26,.5,'#1a1a1a'),PT('sphere',0,.44,.25,.12,.12,.03,'#f2f2f2')]);
  // 20 accessoires
  COL.slice(0,5).forEach(([cn,cc],i)=>acc('lunettes','mp_lun_'+i,'Lunettes '+cn,40+i*15,'head',[PT('rbox',.13,.03,.35,.2,.12,.04,cc,{shin:220}),PT('rbox',-.13,.03,.35,.2,.12,.04,cc,{shin:220}),PT('box',0,.06,.35,.1,.025,.02,dk(cc))]));
  acc('lunettes','mp_masque','Masque de super-héros',90,'head',[PT('box',0,.05,.34,.6,.14,.03,'#1f2028'),PT('box',.13,.05,.355,.12,.06,.01,'#ffffff',{emis:.4}),PT('box',-.13,.05,.355,.12,.06,.01,'#ffffff',{emis:.4})]);
  acc('lunettes','mp_nez_clown','Nez de clown',35,'head',[PT('sphere',0,-.02,.38,.12,.12,.12,'#e5484d',{shin:200})]);
  COL.slice(4,9).forEach(([cn,cc],i)=>acc('cou','mp_ech_'+i,'Écharpe '+cn,40+i*10,'torso',[PT('torus',0,.5,0,1.15,.8,.85,cc),PT('rbox',.2,.15,.28,.18,.5,.06,cc)]));
  acc('cou','mp_medaille','Médaille d\'or',220,'torso',[PT('torusThin',0,.33,.14,.95,.95,.95,'#3d7eff',{rx:.7}),PT('cyl',0,.02,.31,.2,.04,.2,'#f2c14e',{rx:Math.PI/2,...GOLD})]);
  acc('cou','mp_cravate','Cravate',60,'torso',[PT('box',0,.22,.27,.12,.42,.03,'#c0202a'),PT('box',0,.44,.27,.14,.08,.04,'#8f1520')]);
  acc('dos','mp_cape_v','Cape violette',180,'torso',[PT('box',0,-.12,-.3,.98,1.25,.04,'#7a5cff',{rx:.12,anim:'cape'})]);
  acc('dos','mp_cape_n','Cape nuit étoilée',320,'torso',[PT('box',0,-.12,-.3,.98,1.25,.04,'#160f3a',{rx:.12,anim:'cape',emis:.15})]);
  acc('dos','mp_guitare','Guitare dans le dos',240,'torso',[PT('sphere',.12,-.2,-.36,.42,.5,.12,'#b5651d',{rz:.5}),PT('box',-.12,.25,-.36,.08,.6,.06,'#3b2617',{rz:.5})]);
  acc('dos','mp_carquois','Carquois',130,'torso',[PT('cyl',.1,.05,-.38,.22,.8,.22,'#6d4a2a',{rz:.35}),PT('cone',0,.5,-.38,.06,.14,.06,'#e5484d',{rz:.35})]);
  acc('epaule','mp_perroquet','Perroquet',260,'torso',[PT('sphere',.42,.62,0,.2,.26,.2,'#2fbf71'),PT('sphere',.42,.82,.04,.15,.15,.15,'#e5484d'),PT('cone',.42,.8,.16,.05,.08,.05,'#ffd23f',{rx:Math.PI/2})]);
  acc('epaule','mp_chaton','Chaton sur l\'épaule',240,'torso',[PT('sphere',.42,.62,0,.24,.2,.22,'#ff8a3d'),PT('sphere',.42,.8,.05,.18,.17,.17,'#ff8a3d'),PT('cone',.36,.92,.05,.05,.07,.05,'#ff8a3d'),PT('cone',.48,.92,.05,.05,.07,.05,'#ff8a3d')]);
  acc('epaule','mp_robot','Mini-robot',300,'torso',[PT('rbox',.42,.68,0,.24,.24,.24,'#9aa4b2',MET),PT('box',.42,.7,.13,.14,.05,.01,'#39ffb6',{emis:1})]);
})();

/* ---------- Collection « Mégapack 2 » : ~95 objets de plus ---------- */
(()=>{const C2=[['corail','#ff7a59'],['menthe','#6ee7b7'],['lavande','#b8a1ff'],['ciel','#7cc4ff'],['sable','#e6c27a'],['cerise','#c0202a'],['nuit','#160f3a'],['citron','#e8ff5a'],['chocolat','#5a3a24'],['glace','#d8f3ff'],['flamme','#ff5a1a'],['jade','#00a86b']];
  const dk=(h,k=.6)=>{const n=parseInt(h.slice(1),16);return'#'+[(n>>16&255)*k,(n>>8&255)*k,(n&255)*k].map(v=>Math.round(v).toString(16).padStart(2,'0')).join('')};const pr=i=>[30,45,60,90,120,160,220,300,420,600][i%10];
  const TOPS=[['galaxy','Haut galaxie',{}],['ninja','Tenue ninja',{sleeve:'long'}],['labcoat','Blouse',{sleeve:'long'}],['kimono','Kimono',{sleeve:'long'}],['armor','Armure',{}],['logo','T-shirt logo',{}]];
  let k=0;TOPS.forEach(([pat,n,o],t)=>{for(let c=0;c<5;c++){const[cn,cc]=C2[(t*3+c*2)%C2.length],c2=C2[(t*3+c*2+6)%C2.length][1];add('haut',`m2_h${t}_${c}`,`${n} ${cn}`,pr(k++)+t*40,{c:cc,c2,pat,...o})}});
  const BOTS=[['galaxy','Bas galaxie'],['ninja','Pantalon ninja'],['jeans','Jean'],['sport','Survêt'],['skirt','Jupe'],['cargo','Cargo']];
  k=0;BOTS.forEach(([pat,n],t)=>{for(let c=0;c<4;c++){const[cn,cc]=C2[(t*5+c*3+2)%C2.length];add('bas',`m2_b${t}_${c}`,`${n} ${cn}`,pr(k++)+t*20,{c:cc,c2:C2[(t+c+4)%C2.length][1],pat,shoes:C2[(t*2+c)%C2.length][1]})}});
  C2.slice(0,6).forEach(([cn,cc],i)=>hat('m2_hf_'+i,'Haut-de-forme '+cn,160+i*20,[PT('cyl',0,.5,0,.5,.52,.5,cc,{shin:60}),PT('cyl',0,.26,0,.86,.04,.86,cc),PT('cyl',0,.33,0,.51,.1,.51,dk(cc,.5))]));
  C2.slice(6,11).forEach(([cn,cc],i)=>hat('m2_cour_'+i,'Couronne '+cn,600+i*150,[PT('cyl',0,.36,0,.58,.18,.58,cc,{shin:200,metal:1}),...[0,1,2,3,4].map(j=>PT('cone',Math.sin(j*1.2566)*.24,.52,Math.cos(j*1.2566)*.24,.12,.18,.12,cc,{shin:200,metal:1})),PT('sphere',0,.38,.29,.08,.08,.04,'#ffffff',{emis:.8})]));
  hat('m2_casque_chev','Casque de chevalier',480,[PT('sphere',0,.1,0,.9,.9,.9,'#9aa4b2',{shin:200,metal:1}),PT('box',0,.06,.4,.5,.08,.04,'#15161b'),PT('cone',0,.6,-.05,.08,.4,.25,'#c0202a')]);
  hat('m2_viking','Casque viking',360,[PT('sphere',0,.22,0,.82,.6,.82,'#8a8f98',{shin:160,metal:1}),PT('cone',.42,.42,0,.12,.4,.12,'#f2ead8',{rz:-.9}),PT('cone',-.42,.42,0,.12,.4,.12,'#f2ead8',{rz:.9})]);
  hat('m2_astronaute','Casque d\'astronaute',900,[PT('sphere',0,.05,0,1.05,1.05,1.05,'#f2f2f2',{shin:120}),PT('sphere',0,.05,.25,.7,.55,.6,'#2a5d8a',{shin:255,emis:.15})]);
  hat('m2_sombrero','Sombrero',220,[PT('cyl',0,.26,0,1.6,.05,1.6,'#e6c27a'),PT('cone',0,.55,0,.6,.55,.6,'#e6c27a'),PT('cyl',0,.32,0,.62,.08,.62,'#e5484d')]);
  hat('m2_bandana','Bandana',70,[PT('sphere',0,.22,-.02,.76,.4,.76,'#e5484d'),PT('cone',0,.12,-.42,.12,.22,.08,'#e5484d',{rx:-1})]);
  hat('m2_antennes','Antennes d\'alien',150,[PT('cyl',.18,.55,0,.04,.45,.04,'#2fbf71'),PT('cyl',-.18,.55,0,.04,.45,.04,'#2fbf71'),PT('sphere',.18,.8,0,.12,.12,.12,'#39ffb6',{emis:1}),PT('sphere',-.18,.8,0,.12,.12,.12,'#39ffb6',{emis:1})]);
  hat('m2_chat','Oreilles de chat',120,[PT('cone',.24,.45,0,.18,.26,.1,'#22252b',{rz:-.25}),PT('cone',-.24,.45,0,.18,.26,.1,'#22252b',{rz:.25}),PT('cone',.24,.43,.02,.1,.16,.05,'#ffb3c8',{rz:-.25}),PT('cone',-.24,.43,.02,.1,.16,.05,'#ffb3c8',{rz:.25})]);
  hat('m2_feu','Couronne de flammes',1500,[0,1,2,3,4,5].map(j=>PT('cone',Math.sin(j*1.047)*.3,.48,Math.cos(j*1.047)*.3,.14,.38,.14,j%2?'#ffd23f':'#ff5a1a',{emis:1.4})));
  C2.slice(0,8).forEach(([cn,cc],i)=>acc('dos','m2_ailes_'+i,'Ailes '+cn,350+i*60,'torso',wing(cc,{emis:i>4?.4:.15})));
  C2.slice(8,12).forEach(([cn,cc],i)=>acc('dos','m2_cape_'+i,'Cape '+cn,150+i*40,'torso',[PT('box',0,-.12,-.3,.98,1.25,.04,cc,{rx:.12,anim:'cape'})]));
  acc('dos','m2_epee','Épée dans le dos',320,'torso',[PT('box',0,.1,-.38,.12,1.3,.06,'#d8dee6',{rz:.6,shin:240,metal:1}),PT('box',-.28,-.36,-.38,.4,.08,.08,'#8d5a2b',{rz:.6})]);
  acc('dos','m2_bouclier','Bouclier',260,'torso',[PT('cyl',0,0,-.42,.8,.08,.8,'#3d7eff',{rx:Math.PI/2}),PT('sphere',0,0,-.48,.18,.18,.06,'#ffd23f',{metal:1,shin:200})]);
  acc('dos','m2_planche','Planche de surf',280,'torso',[PT('sphere',0,0,-.4,.38,1.5,.06,'#39c5bb'),PT('box',0,0,-.44,.05,1.3,.01,'#ffffff')]);
  acc('cou','m2_collier_perles','Collier de perles',120,'torso',[PT('torusThin',0,.4,.08,1.05,1.05,1.05,'#f8f4ea',{rx:.5,shin:240})]);
  acc('cou','m2_foulard','Foulard',60,'torso',[PT('cone',0,.32,.28,.3,.3,.06,'#e5484d',{rx:Math.PI})]);
  acc('cou','m2_casque_audio','Casque audio au cou',190,'torso',[PT('torusThin',0,.46,0,.95,.6,.95,'#22252b'),PT('cyl',.36,.44,.15,.2,.08,.2,'#e5484d',{rz:Math.PI/2}),PT('cyl',-.36,.44,.15,.2,.08,.2,'#e5484d',{rz:Math.PI/2})]);
  acc('epaule','m2_hibou','Hibou',280,'torso',[PT('sphere',.42,.64,0,.22,.28,.2,'#8d6e63'),PT('sphere',.36,.74,.14,.07,.07,.03,'#ffd23f',{emis:.6}),PT('sphere',.48,.74,.14,.07,.07,.03,'#ffd23f',{emis:.6})]);
  acc('epaule','m2_dragonnet','Dragonnet',650,'torso',[PT('sphere',.42,.64,0,.22,.2,.3,'#e5484d'),PT('sphere',.42,.8,.16,.15,.14,.16,'#e5484d'),PT('cone',.36,.92,.12,.04,.1,.04,'#ffd23f'),PT('cone',.48,.92,.12,.04,.1,.04,'#ffd23f'),PT('sphere',.56,.66,-.05,.2,.1,.14,'#ff8a8a',{rz:-.6})]);
  acc('epaule','m2_fantome','Mini fantôme',340,'torso',[PT('sphere',.44,.7,0,.24,.3,.24,'#f2f2f2',{emis:.3}),PT('sphere',.38,.76,.18,.05,.07,.02,'#15161b'),PT('sphere',.5,.76,.18,.05,.07,.02,'#15161b')]);
  acc('lunettes','m2_monocle','Monocle',140,'head',[PT('torusThin',.13,.03,.35,.24,.24,.24,'#f2c14e',{rx:Math.PI/2,metal:1,shin:200})]);
  acc('lunettes','m2_visiere','Visière cyber',380,'head',[PT('box',0,.04,.36,.62,.12,.04,'#22e3ff',{emis:1.2,shin:240})]);
  acc('lunettes','m2_barbe','Barbe de pirate',90,'head',[PT('sphere',0,-.2,.3,.44,.3,.16,'#3b2617')]);
})();

/* ---------- Emotes ---------- */
[['salut','Saluer',0],['danse','Danser',0],['applaudir','Applaudir',0],['pointe','Pointer',0],['robot','Danse robot',120],['disco','Disco',150],['toupie','Toupie',90],['flexion','Pompes',75],['dab','Dab',60],['rire','Fou rire',0],['pleurer','Pleurer',40],['hourra','Hourra !',0],['courbette','Courbette',50],['assis','S\'asseoir',0],['salto','Salto arrière',200],['zombie','Zombie',110],['guitare','Air guitare',160],['moonwalk','Glissé',180],['meditation','Méditation',90],['muscles','Muscles',70]].forEach(([id,n,p])=>add('emote','e_'+id,n,p,{emote:id}));

const GUITAR=[PT('rbox',0,-.1,.42,.62,.5,.14,'#e5484d',{rz:.5}),PT('rbox',0,-.1,.5,.18,.18,.02,'#22252b',{rz:.5}),PT('box',-.42,.32,.44,.1,.75,.06,'#6d4a2a',{rz:.5}),PT('box',-.62,.62,.44,.14,.18,.08,'#2c2f36',{rz:.5})];
const DEFAULT_AV={skin:'#f3c9a0',haut:'tee_corail',bas:'jean_bleu',visage:'sourire',chapeau:null,cheveux:'ch_courts_brun',lunettes:null,dos:null,cou:null,epaule:null};
const FREE_IDS=CATALOG.filter(i=>i.price===0).map(i=>i.id);

/* ============================== TEXTURES D'AVATAR ============================== */
function drawCollar(x,c,skin){x.fillStyle=skin;x.beginPath();x.ellipse(64,0,22,14,0,0,7);x.fill();x.strokeStyle=dark(c,.72);x.lineWidth=5;x.beginPath();x.ellipse(64,0,24,16,0,0,Math.PI);x.stroke()}
function noiseOver(x,a=.05){for(let i=0;i<220;i++){x.fillStyle=Math.random()<.5?`rgba(255,255,255,${a})`:`rgba(0,0,0,${a})`;x.fillRect(Math.random()*128,Math.random()*128,2,2)}}
function drawShirt(x,fi,S,skin){const c=S.c,c2=S.c2||'#ffffff';
  if(fi===5){fill(x,'#2a2d34');return}fill(x,c);
  switch(S.pat){
    case'ugc':{const im=UGC_IMG[S.id+(fi===1?'_b':'')];if(im&&im.complete&&(fi===0||fi===1))x.drawImage(im,0,0,128,128);else if(fi>1&&S.c2){x.fillStyle=S.c2;x.fillRect(0,0,128,10)}}break;
    case'stripes':x.fillStyle=c2;for(let y=8;y<128;y+=20)x.fillRect(0,y,128,8);break;
    case'logo':if(fi===0){x.fillStyle=c2;x.save();x.translate(64,58);x.rotate(.12);x.fillRect(-20,-20,40,40);x.fillStyle=c;x.fillRect(-9,-9,18,18);x.restore();x.font='800 15px system-ui';x.textAlign='center';x.fillStyle=c2;x.fillText('CUBIK',64,100)}break;
    case'hoodie':if(fi===0){x.fillStyle=dark(c,.85);x.fillRect(30,74,68,34);x.strokeStyle=dark(c,.7);x.lineWidth=3;x.strokeRect(30,74,68,34);x.fillStyle=c2;x.fillRect(52,14,4,34);x.fillRect(72,14,4,34)}
      if(fi===1){x.strokeStyle=dark(c,.7);x.lineWidth=5;x.beginPath();x.arc(64,-4,46,0,Math.PI);x.stroke();x.fillStyle=dark(c,.88);x.beginPath();x.arc(64,-4,44,0,Math.PI);x.fill()}
      x.fillStyle=dark(c,.8);x.fillRect(0,114,128,14);break;
    case'jacket':noiseOver(x,.06);if(fi===0){x.fillStyle=c2;x.beginPath();x.moveTo(44,0);x.lineTo(84,0);x.lineTo(74,128);x.lineTo(54,128);x.fill();x.strokeStyle=dark(c,.6);x.lineWidth=3;x.strokeRect(14,46,26,20);x.strokeRect(88,46,26,20);
      x.fillStyle=dark(c,.8);x.beginPath();x.moveTo(44,0);x.lineTo(30,0);x.lineTo(50,40);x.fill();x.beginPath();x.moveTo(84,0);x.lineTo(98,0);x.lineTo(78,40);x.fill()}
      x.strokeStyle='#e8c46a';x.setLineDash([4,4]);x.lineWidth=2;x.strokeRect(4,4,120,120);x.setLineDash([]);break;
    case'suit':if(fi===0){x.fillStyle='#f4f4f4';x.beginPath();x.moveTo(42,0);x.lineTo(86,0);x.lineTo(64,70);x.fill();x.fillStyle=c2;x.beginPath();x.moveTo(60,8);x.lineTo(68,8);x.lineTo(72,58);x.lineTo(64,70);x.lineTo(56,58);x.fill();
      x.fillStyle='#d8d8d8';for(const y of[80,98])x.beginPath(),x.arc(64,y,3.5,0,7),x.fill();x.strokeStyle=dark(c,.6);x.lineWidth=3;x.beginPath();x.moveTo(42,0);x.lineTo(64,70);x.lineTo(86,0);x.stroke()}break;
    case'jersey':x.fillStyle=c2;if(fi===2||fi===3)x.fillRect(48,0,32,128);if(fi<2){x.font='900 54px system-ui';x.textAlign='center';x.textBaseline='middle';x.fillText(S.text||'10',64,fi?64:72);
      if(fi===0){x.fillStyle=c2;x.beginPath();x.moveTo(44,0);x.lineTo(84,0);x.lineTo(64,22);x.fill()}}break;
    case'flannel':x.globalAlpha=.55;x.fillStyle=c2;for(let k=0;k<128;k+=32){x.fillRect(k,0,10,128);x.fillRect(0,k,128,10)}x.globalAlpha=.25;for(let k=16;k<128;k+=32){x.fillRect(k,0,3,128);x.fillRect(0,k,128,3)}x.globalAlpha=1;
      if(fi===0){x.fillStyle='#f2f2f2';for(let y=20;y<128;y+=24){x.beginPath();x.arc(64,y,3,0,7);x.fill()}}break;
    case'armor':{const g=x.createLinearGradient(0,0,128,128);g.addColorStop(0,'#c9d0d8');g.addColorStop(.5,c);g.addColorStop(1,'#6c737d');x.fillStyle=g;x.fillRect(0,0,128,128);
      x.strokeStyle='#5a6069';x.lineWidth=3;for(let y=32;y<128;y+=32){x.beginPath();x.moveTo(0,y);x.lineTo(128,y);x.stroke()}x.fillStyle='#4d535b';for(let y=16;y<128;y+=32)for(const xx of[8,120])x.beginPath(),x.arc(xx,y,3,0,7),x.fill();
      if(fi===0){x.fillStyle=c2;x.beginPath();x.moveTo(64,30);x.lineTo(84,44);x.lineTo(78,78);x.lineTo(64,90);x.lineTo(50,78);x.lineTo(44,44);x.fill();x.strokeStyle='#8a6a1f';x.stroke()}}break;
    case'puffer':for(let y=0;y<128;y+=22){const g=x.createLinearGradient(0,y,0,y+22);g.addColorStop(0,c);g.addColorStop(.75,c);g.addColorStop(1,c2);x.fillStyle=g;x.fillRect(0,y,128,22)}
      if(fi===0){x.fillStyle='#d0d0d0';x.fillRect(62,0,4,128)}break;
    case'xmas':x.fillStyle=c2;x.fillRect(0,44,128,26);x.fillStyle='#2f8f3b';for(let k=0;k<128;k+=16){x.beginPath();x.moveTo(k,70);x.lineTo(k+8,48);x.lineTo(k+16,70);x.fill()}
      x.fillStyle=c2;for(const[a,b]of[[20,20],[90,24],[50,96],[110,100],[16,104]]){x.font='16px system-ui';x.fillText('❄',a,b)}break;
    case'labcoat':noiseOver(x,.03);if(fi===0){x.fillStyle=c2;x.beginPath();x.moveTo(46,0);x.lineTo(82,0);x.lineTo(70,128);x.lineTo(58,128);x.fill();x.strokeStyle='#c4c8ce';x.lineWidth=3;x.strokeRect(16,74,28,22);x.strokeRect(84,74,28,22);x.fillStyle='#3d7eff';x.fillRect(90,70,3,14)}break;
    case'kimono':if(fi===0){x.fillStyle=c2;x.beginPath();x.moveTo(36,0);x.lineTo(50,0);x.lineTo(86,80);x.lineTo(72,80);x.fill();x.fillStyle='#f4f1ea';x.beginPath();x.moveTo(78,0);x.lineTo(92,0);x.lineTo(60,70);x.lineTo(52,60);x.fill()}
      x.fillStyle=c2;x.fillRect(0,82,128,20);x.fillStyle='rgba(255,255,255,.3)';for(let k=0;k<6;k++){x.beginPath();x.arc(rh(k)*128,rh(k+9)*70,6,0,7);x.fill()}break;
    case'galaxy':{const g=x.createRadialGradient(64,64,10,64,64,90);g.addColorStop(0,c2);g.addColorStop(1,c);x.fillStyle=g;x.fillRect(0,0,128,128);for(let k=0;k<40;k++){x.fillStyle=`rgba(255,255,255,${.4+rh(k+fi*50)*.6})`;x.fillRect(rh(k*3+fi)*128,rh(k*7+fi)*128,rh(k)*2.5+1,rh(k)*2.5+1)}}break;
  }
  if(S.pat!=='kimono'&&S.pat!=='suit'&&S.pat!=='jacket'&&S.pat!=='labcoat'&&S.pat!=='armor'&&fi===0)drawCollar(x,c,skin);
  if(S.sleeve==='none'&&(fi===2||fi===3)){} }
function drawSleeve(x,fi,S,skin){const c=S.c,c2=S.c2||'#ffffff',sl=S.sleeve||'short';
  if(fi===5){fill(x,skin);return}if(fi===4){fill(x,sl==='none'?skin:c);return}
  fill(x,skin,.04);if(sl==='none')return;const h=sl==='long'?100:48;
  x.save();x.beginPath();x.rect(0,0,128,h);x.clip();drawShirt(x,2,{...S,pat:['stripes','flannel','armor','puffer','galaxy','jersey'].includes(S.pat)?S.pat:'plain'},skin);x.restore();
  x.fillStyle=dark(c,.75);x.fillRect(0,h-6,128,6);if(sl==='long'&&S.pat==='suit'){x.fillStyle='#f4f4f4';x.fillRect(0,h,128,8)}}
function drawPants(x,fi,Pn,skin){const c=Pn.c,c2=Pn.c2||'#ffffff',sh=Pn.shoes||'#f2f2f2';
  if(fi===5){fill(x,'#2c2f36');return}if(fi===4){fill(x,c);return}
  const top=Pn.pat==='shorts'?60:(Pn.pat==='skirt'?52:128);fill(x,skin,.04);x.fillStyle=c;x.fillRect(0,0,128,top);
  switch(Pn.pat){
    case'ugc':{const im=UGC_IMG[Pn.id+(fi===1?'_b':'')];if(im&&im.complete&&(fi===0||fi===1))x.drawImage(im,0,0,128,128)}break;
    case'jeans':noiseOver(x,.07);x.strokeStyle='#d9b45a';x.setLineDash([4,3]);x.lineWidth=2;if(fi===2||fi===3){x.beginPath();x.moveTo(64,0);x.lineTo(64,128);x.stroke()}x.setLineDash([]);break;
    case'cargo':if(fi===2||fi===3){x.fillStyle=dark(c,.8);x.fillRect(36,40,56,36);x.strokeStyle=dark(c,.6);x.lineWidth=2;x.strokeRect(36,40,56,36)}break;
    case'suit':if(fi===0||fi===1){x.strokeStyle=dark(c,1.3);x.lineWidth=2;x.beginPath();x.moveTo(64,0);x.lineTo(64,128);x.stroke()}break;
    case'sport':if(fi===2||fi===3){x.fillStyle=c2;for(const k of[44,60,76])x.fillRect(k,0,8,128)}break;
    case'armor':{const g=x.createLinearGradient(0,0,128,0);g.addColorStop(0,'#c9d0d8');g.addColorStop(.5,c);g.addColorStop(1,'#6c737d');x.fillStyle=g;x.fillRect(0,0,128,128);x.strokeStyle='#5a6069';x.lineWidth=3;for(let y=26;y<128;y+=26){x.beginPath();x.moveTo(0,y);x.lineTo(128,y);x.stroke()}
      if(fi===0){x.fillStyle=c2;x.beginPath();x.arc(64,52,10,0,7);x.fill()}}break;
    case'skirt':x.strokeStyle=dark(c,.75);x.lineWidth=3;for(let k=8;k<128;k+=16){x.beginPath();x.moveTo(k,0);x.lineTo(k,top);x.stroke()}x.fillStyle='#f2f2f2';x.fillRect(0,92,128,10);break;
    case'dots':x.fillStyle=c2;for(let k=0;k<14;k++){x.beginPath();x.arc(rh(k*3+fi)*128,rh(k*5+fi*2)*128,6,0,7);x.fill()}break;
    case'ninja':x.fillStyle=c2;x.fillRect(0,0,128,10);x.strokeStyle='#2c2d33';x.lineWidth=4;for(let y=74;y<110;y+=9){x.beginPath();x.moveTo(0,y);x.lineTo(128,y+5);x.stroke()}break;
    case'galaxy':{const g=x.createLinearGradient(0,0,0,128);g.addColorStop(0,c);g.addColorStop(1,c2);x.fillStyle=g;x.fillRect(0,0,128,top);for(let k=0;k<30;k++){x.fillStyle='rgba(255,255,255,.8)';x.fillRect(rh(k*3+fi)*128,rh(k*7+fi)*128,1.6,1.6)}}break;
  }
  if(fi===0&&Pn.pat!=='skirt'&&Pn.pat!=='armor'){x.fillStyle=dark(c,.6);x.fillRect(0,0,128,5)}
  // chaussures
  x.fillStyle=sh;x.fillRect(0,100,128,28);x.fillStyle=Pn.pat==='suit'?'#1a1a1a':'#f4f4f4';x.fillRect(0,118,128,10);x.fillStyle='rgba(0,0,0,.25)';x.fillRect(0,116,128,2);
  if(fi===0&&Pn.pat!=='suit'&&Pn.pat!=='armor'){x.fillStyle='rgba(255,255,255,.85)';for(let i=0;i<3;i++)x.fillRect(46,104+i*4,36,2)}}
function drawTorsoBottom(x,Pn){fill(x,Pn.c)}
// visage sur la tête cylindrique : espace « visage » centré, compressé horizontalement
function drawFace(x,id,blink){const ink='#1f2028';x.save();x.translate(256,124);x.scale(.6,1);x.lineCap='round';x.lineJoin='round';
  const eye=(ex,ey,rx,ry)=>{x.fillStyle=ink;x.beginPath();x.ellipse(ex,ey,rx,ry,0,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(ex-rx*.3,ey-ry*.4,Math.max(3,rx*.38),0,7);x.fill()};
  const closed=(ex,ey,w=14,up=1)=>{x.strokeStyle=ink;x.lineWidth=7;x.beginPath();x.moveTo(ex-w,ey);x.quadraticCurveTo(ex,ey+8*up,ex+w,ey);x.stroke()};
  const smile=(w=26,d=16,y=40)=>{x.strokeStyle=ink;x.lineWidth=7;x.beginPath();x.moveTo(-w,y);x.quadraticCurveTo(0,y+d,w,y);x.stroke()};
  const blush=()=>{x.fillStyle='rgba(255,100,110,.28)';for(const s of[-1,1]){x.beginPath();x.ellipse(s*78,30,20,10,0,0,7);x.fill()}};
  const E=(rx=11,ry=19)=>{if(blink){closed(-46,-8);closed(46,-8)}else{eye(-46,-10,rx,ry);eye(46,-10,rx,ry)}};
  switch(id){
    case'grand_sourire':E();x.fillStyle=ink;x.beginPath();x.moveTo(-36,30);x.quadraticCurveTo(0,80,36,30);x.closePath();x.fill();x.fillStyle='#fff';x.fillRect(-26,31,52,8);break;
    case'clin':if(blink)closed(-46,-8);else eye(-46,-10,11,19);closed(46,-6);smile(22,14);break;
    case'cool':x.fillStyle=ink;x.beginPath();x.roundRect(-82,-30,164,36,10);x.fill();x.fillStyle='rgba(255,255,255,.5)';x.fillRect(-66,-24,14,22);x.fillRect(26,-24,14,22);x.strokeStyle=ink;x.lineWidth=7;x.beginPath();x.moveTo(-10,46);x.quadraticCurveTo(14,54,30,38);x.stroke();break;
    case'surpris':E(14,16);x.lineWidth=6;x.strokeStyle=ink;x.beginPath();x.moveTo(-64,-42);x.lineTo(-30,-48);x.moveTo(30,-48);x.lineTo(64,-42);x.stroke();x.fillStyle=ink;x.beginPath();x.ellipse(0,48,13,17,0,0,7);x.fill();break;
    case'fache':E(11,15);x.lineWidth=8;x.strokeStyle=ink;x.beginPath();x.moveTo(-66,-40);x.lineTo(-28,-26);x.moveTo(28,-26);x.lineTo(66,-40);x.stroke();x.beginPath();x.moveTo(-24,52);x.quadraticCurveTo(0,38,24,52);x.stroke();break;
    case'endormi':closed(-46,-4,16,-1);closed(46,-4,16,-1);x.fillStyle=ink;x.beginPath();x.ellipse(0,44,8,9,0,0,7);x.fill();x.font='bold 26px system-ui';x.fillText('z',70,-50);x.font='bold 18px system-ui';x.fillText('z',92,-72);break;
    case'kawaii':x.strokeStyle=ink;x.lineWidth=8;for(const s of[-1,1]){x.beginPath();x.moveTo(s*46-16,-2);x.lineTo(s*46,-16);x.lineTo(s*46+16,-2);x.stroke()}blush();x.beginPath();x.moveTo(-14,36);x.quadraticCurveTo(-7,46,0,36);x.quadraticCurveTo(7,46,14,36);x.stroke();break;
    case'robot':x.fillStyle='#22262e';x.beginPath();x.roundRect(-90,-40,180,110,14);x.fill();x.fillStyle=blink?'#145a5a':'#39ffd9';x.fillRect(-64,-20,40,22);x.fillRect(24,-20,40,22);x.fillStyle='#39ffd9';for(let i=0;i<5;i++)x.fillRect(-40+i*17,40,10,10);break;
    case'etoiles':for(const s of[-1,1]){x.fillStyle='#ffc61a';x.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,r=k%2?9:22;x.lineTo(s*46+Math.cos(a)*r,-10+Math.sin(a)*r)}x.closePath();x.fill();x.strokeStyle=ink;x.lineWidth=3;x.stroke()}smile(24,18);break;
    case'coeurs':for(const s of[-1,1]){x.fillStyle='#ff2d6f';x.save();x.translate(s*46,-12);x.beginPath();x.moveTo(0,16);x.bezierCurveTo(-26,-2,-14,-24,0,-8);x.bezierCurveTo(14,-24,26,-2,0,16);x.fill();x.restore()}smile(24,18);blush();break;
    case'langue':E();x.strokeStyle=ink;x.lineWidth=7;x.beginPath();x.moveTo(-26,36);x.quadraticCurveTo(0,50,26,36);x.stroke();x.fillStyle='#ff6f86';x.beginPath();x.ellipse(8,52,12,14,0,0,Math.PI);x.fill();break;
    case'coin':E(10,16);x.strokeStyle=ink;x.lineWidth=7;x.beginPath();x.moveTo(-18,44);x.quadraticCurveTo(12,52,32,32);x.stroke();break;
    case'mdr':closed(-46,-6,16,-1.3);closed(46,-6,16,-1.3);x.fillStyle=ink;x.beginPath();x.moveTo(-40,28);x.quadraticCurveTo(0,90,40,28);x.closePath();x.fill();x.fillStyle='#62c6ff';x.beginPath();x.ellipse(-74,18,7,12,0,0,7);x.ellipse(74,18,7,12,0,0,7);x.fill();break;
    case'serieux':E(10,14);x.strokeStyle=ink;x.lineWidth=7;x.beginPath();x.moveTo(-20,44);x.lineTo(20,44);x.stroke();break;
    case'timide':E(10,16);blush();x.strokeStyle=ink;x.lineWidth=6;x.beginPath();x.moveTo(-12,42);x.quadraticCurveTo(0,48,12,42);x.stroke();break;
    case'demon':x.fillStyle=blink?'#5a0a0a':'#ff2020';for(const s of[-1,1]){x.beginPath();x.moveTo(s*24,-2);x.lineTo(s*72,-28);x.lineTo(s*64,4);x.closePath();x.fill()}
      x.fillStyle=ink;x.beginPath();x.moveTo(-44,30);x.quadraticCurveTo(0,72,44,30);x.quadraticCurveTo(0,48,-44,30);x.fill();x.fillStyle='#fff';for(const s of[-1,1]){x.beginPath();x.moveTo(s*24,36);x.lineTo(s*18,50);x.lineTo(s*12,38);x.fill()}break;
    case'pirate':eye(-46,-10,11,19);x.fillStyle=ink;x.beginPath();x.ellipse(46,-8,24,22,0,0,7);x.fill();x.lineWidth=5;x.strokeStyle=ink;x.beginPath();x.moveTo(-100,-60);x.lineTo(100,30);x.stroke();x.lineWidth=7;x.beginPath();x.moveTo(-22,42);x.quadraticCurveTo(6,54,30,36);x.stroke();break;
    case'intello':x.strokeStyle=ink;x.lineWidth=6;for(const s_ of[-1,1]){x.beginPath();x.arc(s_*46,-10,28,0,7);x.stroke()}x.beginPath();x.moveTo(-18,-12);x.lineTo(18,-12);x.stroke();E(9,13);x.fillStyle=ink;x.beginPath();x.moveTo(-26,36);x.quadraticCurveTo(0,62,26,36);x.closePath();x.fill();x.fillStyle='#fff';x.fillRect(-10,36,9,11);x.fillRect(1,36,9,11);break;
    case'bisou':closed(-46,-6,15,-1);if(blink)closed(46,-6,15,-1);else eye(46,-10,11,19);blush();x.strokeStyle=ink;x.lineWidth=7;x.beginPath();x.moveTo(-6,30);x.quadraticCurveTo(10,38,-4,44);x.quadraticCurveTo(10,50,-6,58);x.stroke();x.fillStyle='#ff2d6f';x.font='bold 30px system-ui';x.fillText('♥',36,58);break;
    case'zen':closed(-46,-6,16,1);closed(46,-6,16,1);smile(18,8,42);x.fillStyle='rgba(255,210,63,.25)';x.beginPath();x.arc(0,-62,9,0,7);x.fill();break;
    case'choque':x.fillStyle='#fff';for(const s_ of[-1,1]){x.beginPath();x.arc(s_*46,-10,22,0,7);x.fill();x.strokeStyle=ink;x.lineWidth=5;x.stroke();x.fillStyle=ink;x.beginPath();x.arc(s_*46,-10,6,0,7);x.fill();x.fillStyle='#fff'}x.fillStyle=ink;x.beginPath();x.ellipse(0,52,18,24,0,0,7);x.fill();x.fillStyle='#62c6ff';x.beginPath();x.ellipse(84,-40,7,12,0,0,7);x.fill();break;
    case'vampire':x.fillStyle=blink?'#4a0a0a':'#c0141e';for(const s_ of[-1,1]){x.beginPath();x.ellipse(s_*46,-10,13,15,0,0,7);x.fill()}x.fillStyle='#fff';for(const s_ of[-1,1]){x.beginPath();x.arc(s_*46-4,-15,4,0,7);x.fill()}
      x.strokeStyle=ink;x.lineWidth=6;x.beginPath();x.moveTo(-30,36);x.quadraticCurveTo(0,48,30,36);x.stroke();x.fillStyle='#fff';for(const s_ of[-1,1]){x.beginPath();x.moveTo(s_*16,40);x.lineTo(s_*11,58);x.lineTo(s_*6,41);x.fill()}break;
    case'chaton':E(10,17);x.strokeStyle=ink;x.lineWidth=6;x.beginPath();x.moveTo(-18,36);x.quadraticCurveTo(-9,48,0,38);x.quadraticCurveTo(9,48,18,36);x.stroke();x.fillStyle='#ff8fa3';x.beginPath();x.moveTo(-7,26);x.lineTo(7,26);x.lineTo(0,33);x.fill();
      x.lineWidth=3;for(const s_ of[-1,1])for(const k of[-6,6]){x.beginPath();x.moveTo(s_*40,30+k*.4);x.lineTo(s_*92,24+k*1.6);x.stroke()}blush();break;
    case'pixel':x.fillStyle=ink;for(const s_ of[-1,1]){x.fillRect(s_*46-12,-28,24,34);if(!blink){x.fillStyle='#fff';x.fillRect(s_*46-12,-28,10,10);x.fillStyle=ink}}for(const[a,b]of[[-36,30],[-24,42],[-12,42],[0,42],[12,42],[24,30]])x.fillRect(a,b,13,12);break;
    case'joie':closed(-46,-6,16,-1.3);closed(46,-6,16,-1.3);x.fillStyle='#62c6ff';for(const s_ of[-1,1]){x.beginPath();x.moveTo(s_*58,4);x.quadraticCurveTo(s_*96,40,s_*70,64);x.quadraticCurveTo(s_*58,40,s_*58,4);x.fill()}
      x.fillStyle=ink;x.beginPath();x.moveTo(-40,26);x.quadraticCurveTo(0,86,40,26);x.closePath();x.fill();x.fillStyle='#ff6f86';x.beginPath();x.ellipse(0,52,16,8,0,0,7);x.fill();break;
    case'heros':x.fillStyle='#e5484d';x.beginPath();x.moveTo(-100,-34);x.quadraticCurveTo(0,-50,100,-34);x.lineTo(96,10);x.quadraticCurveTo(0,0,-96,10);x.closePath();x.fill();x.fillStyle='#fff';for(const s_ of[-1,1]){x.beginPath();x.ellipse(s_*44,-14,20,10,s_*.25,0,7);x.fill()}
      x.strokeStyle=ink;x.lineWidth=7;x.beginPath();x.moveTo(-20,42);x.quadraticCurveTo(4,52,26,38);x.stroke();break;
    case'fatigue':x.fillStyle='rgba(120,80,140,.25)';for(const s_ of[-1,1]){x.beginPath();x.ellipse(s_*46,8,20,10,0,0,7);x.fill()}x.fillStyle=ink;for(const s_ of[-1,1]){x.beginPath();x.ellipse(s_*46,-4,12,blink?2:7,0,0,7);x.fill()}x.strokeStyle=ink;x.lineWidth=6;x.beginPath();x.moveTo(-16,44);x.lineTo(16,42);x.stroke();break;
    case'malicieux':x.strokeStyle=ink;x.lineWidth=7;x.beginPath();x.moveTo(-68,-36);x.lineTo(-26,-24);x.moveTo(26,-30);x.lineTo(68,-44);x.stroke();E(10,13);x.beginPath();x.moveTo(-34,32);x.quadraticCurveTo(0,58,36,26);x.stroke();break;
    default:if(id&&id.startsWith('ugcf_')&&UGC_IMG[id]?.complete){x.drawImage(UGC_IMG[id],-160,-110,320,220)}else{E();smile();blush()}
  }x.restore()}
const AVTEX_CACHE=new Map();
function avatarTex(av){const key=[av.skin,av.haut,av.bas,av.visage].join('|');if(AVTEX_CACHE.has(key))return AVTEX_CACHE.get(key);
  const S=IT[av.haut]||IT.tee_corail,Pn=IT[av.bas]||IT.jean_bleu,skin=av.skin;
  const head=b=>{const[c,x]=cnv(512,256);x.fillStyle=skin;x.fillRect(0,0,512,256);const g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'rgba(255,255,255,.06)');g.addColorStop(1,'rgba(0,0,0,.08)');x.fillStyle=g;x.fillRect(0,0,512,256);drawFace(x,av.visage,b);return glTex(c)};
  const t={head:head(false),blink:head(true),torso:glTex(atlas((x,fi)=>fi===5?drawTorsoBottom(x,Pn):drawShirt(x,fi,S,skin))),arm:glTex(atlas((x,fi)=>drawSleeve(x,fi,S,skin))),leg:glTex(atlas((x,fi)=>drawPants(x,fi,Pn,skin)))};
  if(AVTEX_CACHE.size>40){const[k,v]=AVTEX_CACHE.entries().next().value;for(const tt of Object.values(v))gl.deleteTexture(tt);AVTEX_CACHE.delete(k)}
  AVTEX_CACHE.set(key,t);return t}

/* ============================== DESSIN DU PERSONNAGE ============================== */
// rig : tête sur pivot de cou (2.0), torse centré 1.5, épaules ±.74 à 1.9, hanches ±.24 à 1.0
function charDraws(c,L,TR,time){if(c.dead||c.left||c.hidden)return;const a=c.a,p=c.pos,av=c.av,tx=avatarTex(av);
  const fl=(a.flip||0)+(a.pitch||0);const root=fl?M.chain(M.T(p[0],p[1]+a.bob,p[2]),M.RY(c.yaw+a.twist),M.RX(a.lean),M.T(0,1.3,0),M.RX(fl),M.T(0,-1.3,0)):M.chain(M.T(p[0],p[1]+a.bob,p[2]),M.RY(c.yaw+a.twist),M.RX(a.lean));
  const D=(mesh,m,tex)=>L.push({mesh,m,mode:0,tex,rim:.3,shin:30});
  const torso=M.mul(root,M.T(0,1.5,0)),head=M.chain(root,M.T(0,2.0,0),M.RX(a.head),M.RY(a.headY||0),M.T(0,.33,0));
  D(MESH.torso,torso,tx.torso);D(MESH.head,head,c.blink>0?tx.blink:tx.head);
  const arm=(x,rx,rz)=>M.chain(root,M.T(x,1.9,0),M.RX(rx),M.RZ(rz)),leg=(x,rx)=>M.chain(root,M.T(x,1,0),M.RX(rx));
  const aL=arm(.74,a.armL,a.sideL),aR=arm(-.74,a.armR,a.sideR);
  D(MESH.arm,M.mul(aL,M.T(0,-.4,0)),tx.arm);D(MESH.arm,M.mul(aR,M.T(0,-.4,0)),tx.arm);
  D(MESH.leg,M.mul(leg(.24,a.legL),M.T(0,-.5,0)),tx.leg);D(MESH.leg,M.mul(leg(-.24,a.legR),M.T(0,-.5,0)),tx.leg);
  for(const slot of['chapeau','cheveux','lunettes','dos','cou','epaule']){const it=IT[av[slot]];if(!it||!it.parts)continue;if(slot==='cheveux'&&IT[av.chapeau]?.hideHair)continue;
    const base=it.at==='head'?head:torso;for(const pt of it.parts)pushPart(base,pt,L,TR,time,c)}
  if(c.held)for(const pt of c.held)pushPart(aR,pt,L,TR,time,c);
  if(c.emote==='guitare'&&c.state==='emote')for(const pt of GUITAR)pushPart(torso,pt,L,TR,time,c);
  if(IT[av.dos]?.fx==='jet'&&!c.grounded&&!c.climb&&Math.random()<.6){const w=M.xf(torso,[0,-.55,-.44]);emit({pos:[w[0],w[1],w[2]],vel:[rnd(-.3,.3),-rnd(2,4),rnd(-.3,.3)],life:rnd(.2,.4),size:.18,size1:.02,col:[4,1.6,.4],add:1,shape:0})}}
function pushPart(base,pt,L,TR,time,c){let m=M.T(pt.x,pt.y,pt.z);
  if(pt.anim==='spin')m=M.mul(m,M.RY(time*1.6));else if(pt.anim==='spinFast')m=M.mul(m,M.RY(time*18));
  else if(pt.anim==='bob')m=M.mul(M.T(0,Math.sin(time*3)*.025,0),m);
  else if(pt.anim==='orbit'){const k=time*1.4;m=M.T(Math.cos(k)*.85,1.0+Math.sin(time*2.3)*.08,Math.sin(k)*.85)}
  if(pt.ry)m=M.mul(m,M.RY(pt.ry));if(pt.rx)m=M.mul(m,M.RX(pt.rx));if(pt.rz)m=M.mul(m,M.RZ(pt.rz));
  if(pt.anim==='flapR'||pt.anim==='flapL'){const f=Math.sin(time*(c&&!c.grounded?14:3))*(c&&!c.grounded?.45:.12);m=M.mul(m,M.RY(pt.anim==='flapR'?-f:f))}
  if(pt.anim==='cape'){const sp=c?Math.min(1,Math.hypot(c.vel[0],c.vel[2])/8):0;m=M.mul(M.mul(M.T(0,.5,0),M.RX(sp*.5+Math.sin(time*3)*.05)),M.mul(M.T(0,-.5,0),m))}
  m=M.mul(base,M.mul(m,M.S(pt.sx,pt.sy,pt.sz)));
  const d={mesh:MESH[pt.s]||MESH.rbox,m,mode:3,color:pt.c,shin:pt.shin||30,emis:pt.emis?(HDR?pt.emis*2:pt.emis*.5):0,rim:.2};
  if(pt.glass){d.mode=8;d.shin=200;TR.push(d)}else L.push(d)}

/* ============================== VIGNETTES (rendu 3D → image) ============================== */
const THUMB={size:240,fb:null,tex:null,rb:null,cache:new Map(),queue:[]};
function thumbInit(){if(THUMB.fb)return;const S=THUMB.size;THUMB.tex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,THUMB.tex);gl.texStorage2D(gl.TEXTURE_2D,1,gl.RGBA8,S,S);
  THUMB.rb=gl.createRenderbuffer();gl.bindRenderbuffer(gl.RENDERBUFFER,THUMB.rb);gl.renderbufferStorage(gl.RENDERBUFFER,gl.DEPTH_COMPONENT24,S,S);
  THUMB.fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,THUMB.fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,THUMB.tex,0);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,THUMB.rb);gl.bindFramebuffer(gl.FRAMEBUFFER,null)}
const FOCUS={head:{y:2.38,d:2.3,yaw:.45},torso:{y:1.5,d:3.2,yaw:.35},legs:{y:.7,d:3.2,yaw:.35},full:{y:1.4,d:6.4,yaw:.4},back:{y:1.7,d:5.4,yaw:Math.PI-.5},shoulder:{y:2.2,d:3.4,yaw:-.6}};
function thumbFocus(it){if(!it)return'full';return{haut:'torso',bas:'legs',visage:'head',chapeau:'head',cheveux:'head',lunettes:'head',dos:'back',cou:'torso',epaule:'shoulder'}[it.cat]||'full'}
function renderThumb(av,focus,emote){thumbInit();const S=THUMB.size,F=FOCUS[focus]||FOCUS.full;
  const c={pos:[0,0,0],vel:[0,0,0],yaw:0,a:{armL:0,armR:0,legL:0,legR:0,sideL:.08,sideR:-.08,head:0,bob:0,lean:0,twist:0},av,grounded:true,blink:0};
  if(focus==='full'){c.a.armR=-.2;c.a.armL=.15;c.a.legL=.12;c.a.legR=-.1}
  const L=[],TR=[];charDraws(c,L,TR,1.3);
  const eye=[Math.sin(F.yaw)*F.d,F.y+F.d*.12,Math.cos(F.yaw)*F.d],tgt=[0,F.y,0];
  const VP=M.mul(M.persp(32*Math.PI/180,1,.1,50),M.lookAt(eye,tgt,[0,1,0]));
  gl.bindFramebuffer(gl.FRAMEBUFFER,THUMB.fb);gl.viewport(0,0,S,S);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.disable(gl.BLEND);
  beginScene({VP,eye,LVP:M.id(),hdr:0,taps:0,sun:V.norm([.4,.8,.6]),sunCol:[1.25,1.2,1.12],fogOff:true,noLights:true});L.forEach(drawItem);
  if(TR.length){gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);TR.forEach(drawItem);gl.disable(gl.BLEND)}
  const px=new Uint8Array(S*S*4);gl.readPixels(0,0,S,S,gl.RGBA,gl.UNSIGNED_BYTE,px);gl.bindFramebuffer(gl.FRAMEBUFFER,null);
  const[cv2,x]=cnv(S,S),img=x.createImageData(S,S);for(let y=0;y<S;y++)img.data.set(px.subarray((S-1-y)*S*4,(S-y)*S*4),y*S*4);x.putImageData(img,0,0);return cv2.toDataURL('image/png')}
// vignette d'un objet : l'objet porté par un avatar neutre
function itemThumb(id,base){const it=IT[id];if(!it)return'';if(it.cat==='emote')return'';const key=id+'|'+(base?.skin||'');if(THUMB.cache.has(key))return THUMB.cache.get(key);
  const av={...DEFAULT_AV,skin:base?.skin||'#f3c9a0',chapeau:null,cheveux:it.cat==='chapeau'||it.cat==='lunettes'?null:DEFAULT_AV.cheveux,lunettes:null,dos:null,cou:null,epaule:null,[it.cat]:id};
  const url=renderThumb(av,thumbFocus(it));THUMB.cache.set(key,url);return url}
function avatarThumb(av){const key='av|'+JSON.stringify(av);if(THUMB.cache.has(key))return THUMB.cache.get(key);const u=renderThumb(av,'full');THUMB.cache.set(key,u);return u}
function headThumb(av){const key='hd|'+JSON.stringify(av);if(THUMB.cache.has(key))return THUMB.cache.get(key);const u=renderThumb(av,'head');THUMB.cache.set(key,u);return u}
