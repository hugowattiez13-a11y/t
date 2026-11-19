"use strict";
/* ============================== STOCKAGE DES COMPTES ============================== */
// Espace privé de l'utilisateur Claude (base de données de l'artefact) ; à défaut, ce navigateur.
// Comptes : espace privé Claude (db de l'artefact), serveur Cubik auto-hébergé, ou ce navigateur.
const Store={mode:'local',
  async init(){await Cloud.init();this.mode=Cloud.mode==='claude'&&Cloud.uid?'cloud':Cloud.mode==='server'?'server':'local'},
  path(k){return this.mode==='cloud'?`data/users/${Cloud.uid}/${k}`:`priv/${k}`},
  k:p=>'acc_'+p.toLowerCase().replace(/[^a-z0-9_-]/g,'_'),
  async get(p){if(this.mode==='local')return lsGet('cubik_acc_'+this.k(p))||(lsGet('cubik_comptes')||{})[this.k(p)]||null;return Cloud.doc(this.path(this.k(p))).get()},
  async put(acc){if(this.mode==='local'){lsSet('cubik_acc_'+this.k(acc.pseudo),acc);return}await Cloud.doc(this.path(this.k(acc.pseudo))).set(acc)},
  async list(){if(this.mode==='cloud'){const L=await Cloud.list(`data/users/${Cloud.uid}`);return L.filter(d=>d.id.startsWith('acc_')).map(d=>d.data)}
    if(this.mode==='server')return[];const out=[];try{for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k.startsWith('cubik_acc_'))out.push(lsGet(k))}}catch(e){}return out.filter(Boolean)},
  async del(p){if(this.mode==='local'){lsDel('cubik_acc_'+this.k(p));return}await Cloud.doc(this.path(this.k(p))).delete()},
  async getSession(){if(this.mode==='cloud')return Cloud.doc(this.path('session')).get();return lsGet('cubik_session')},
  async setSession(s){if(this.mode==='cloud'){await Cloud.doc(this.path('session')).set(s||{});return}try{lsSet('cubik_session',s)}catch(e){}},
  dk(key){return`${ACC.pseudo.toLowerCase().replace(/[^a-z0-9_-]/g,'_')}__${key}`},
  async putDoc(key,data){if(this.mode==='local'){lsSet('cubik_doc_'+this.dk(key),data);return}await Cloud.doc(this.path(this.dk(key))).set(data)},
  async getDoc(key){if(this.mode==='local')return lsGet('cubik_doc_'+this.dk(key));return Cloud.doc(this.path(this.dk(key))).get()},
  async delDoc(key){if(this.mode==='local'){lsDel('cubik_doc_'+this.dk(key));return}await Cloud.doc(this.path(this.dk(key))).delete()}};

async function hashPw(salt,pw){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+':'+pw));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')}
let ACC=null,dirty=false,saving=false;
function newAccount(pseudo,salt,hash){return{v:1,pseudo,salt,hash,created:Date.now(),blox:300,owned:[...FREE_IDS],avatar:{...DEFAULT_AV},games:{},stats:{plays:{},earned:0,spent:0,time:0},badges:[],daily:{last:'',streak:0},settings:{...SET_DEFAULT},reports:[]}}
function markDirty(){dirty=true;clearTimeout(markDirty.t);markDirty.t=setTimeout(flushSave,1500)}
async function flushSave(){if(!ACC||!dirty)return;if(saving){markDirty();return}saving=true;dirty=false;setSaveState('…');
  try{await Store.put(ACC);setSaveState('✓')}catch(e){dirty=true;setSaveState('!');if(String(e?.code||e).includes('quota'))toast('Sauvegarde impossible : espace plein');setTimeout(flushSave,5000)}saving=false}
function setSaveState(s){const e=$('saveState');if(e){e.textContent=s==='✓'?'Sauvegardé':s==='…'?'Sauvegarde…':'Hors ligne';e.dataset.s=s}}
function saveSettings(){if(ACC){ACC.settings={...SET};markDirty()}}
addEventListener('beforeunload',()=>{if(ACC&&dirty){persistGame();try{Store.put(ACC)}catch(e){}}});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&ACC){persistGame();flushSave()}});

/* ============================== OUTILS UI ============================== */
const BLOX='<svg class="bx" viewBox="0 0 24 24" aria-hidden="true"><use href="#blox"/></svg>';
function toast(msg,kind){const t=el('div',{class:'toast'+(kind?' '+kind:'')});t.innerHTML=msg.replace(/\{B\}/g,BLOX);$('toasts').append(t);setTimeout(()=>t.classList.add('out'),2600);setTimeout(()=>t.remove(),3100)}
function updBlox(){document.querySelectorAll('.bloxAmt').forEach(e=>e.textContent=(ACC?.blox||0).toLocaleString('fr-FR'))}
function giveBlox(n,reason){if(!ACC||n<=0)return;ACC.blox+=n;ACC.stats.earned+=n;updBlox();SFX.daily();toast(`+${n} {B} ${reason?'· '+reason:''}`,'gold');markDirty()}
function unlockBadge(id){if(!ACC||ACC.badges.includes(id))return;ACC.badges.push(id);const b=BADGES[id];if(b){setTimeout(()=>toast(`🏅 Badge débloqué : ${b[1]}`),900)}markDirty()}
const BADGES={obby:['🌈','Maître de l\'Obby','Terminer l\'Obby Arc-en-ciel'],tycoon:['🏭','Magnat','Faire une renaissance dans le Tycoon'],golem:['🗿','Tueur de Golem','Vaincre le Golem de pierre'],collect:['🎒','Collectionneur','Posséder 40 objets'],welcome:['👋','Bienvenue','Créer son compte'],daily7:['📅','Assidu','7 jours de récompense d\'affilée'],createur:['🛠️','Créateur','Créer son premier jeu dans le Studio'],horreur:['🎃','Courageux','S\'échapper d\'un jeu d\'horreur'],zombie:['🧟','Survivant','Survivre aux 30 vagues'],pilote:['🏆','Champion','Gagner la coupe du Grand Prix'],tour:['🗼','Grimpeur','Atteindre le sommet de la Tour Infernale'],mineur:['⛏️','Mineur','Trouver le Cœur de magma'],stratege:['🏰','Stratège','Sauver le royaume'],pecheur:['🎣','Pêcheur','Compléter l\'encyclopédie'],animaux:['🐾','Dresseur','Atteindre le Royaume céleste'],neige:['⛄','Général','Devenir Général'],pizza:['🍕','Chef étoilé','Finir 15 jours de pizzeria'],evasion:['🔓','Évadé','S\'évader de Rocamur'],royale:['🪂','Dernier debout','Gagner un battle royale'],fermier:['🚜','Fermier','Ferme complète'],donjon:['🗝️','Explorateur','Étage 25 du donjon'],naufrage:['⛵','Naufragé','Quitter l\'île'],foot:['⚽','Champion','10 victoires au foot'],cache:['🙈','Insaisissable','10 manches de cache-cache']};
const ownsEmote=em=>IT['e_'+em]?.price===0||!!ACC?.owned.includes('e_'+em);
function modal(content,cls=''){const m=el('div',{class:'modal '+cls},el('div',{class:'mcard'},el('button',{class:'mx',text:'✕',onclick:()=>m.remove()}),content));m.addEventListener('pointerdown',e=>{if(e.target===m)m.remove()});document.body.append(m);return m}

/* ============================== IMAGES DES JEUX ============================== */
const GTHUMB={};
function gameThumb(id){if(GTHUMB[id])return GTHUMB[id];const W=640,Hh=360,[c,x]=cnv(W,Hh);const g=GAMES[id];
  const sky=(a,b)=>{const gr=x.createLinearGradient(0,0,0,Hh);gr.addColorStop(0,a);gr.addColorStop(1,b);x.fillStyle=gr;x.fillRect(0,0,W,Hh)};
  const cube=(cx,cy,s,top,left,right)=>{x.fillStyle=top;x.beginPath();x.moveTo(cx,cy-s*.5);x.lineTo(cx+s*.87,cy);x.lineTo(cx,cy+s*.5);x.lineTo(cx-s*.87,cy);x.fill();
    x.fillStyle=left;x.beginPath();x.moveTo(cx-s*.87,cy);x.lineTo(cx,cy+s*.5);x.lineTo(cx,cy+s*1.5);x.lineTo(cx-s*.87,cy+s);x.fill();x.fillStyle=right;x.beginPath();x.moveTo(cx+s*.87,cy);x.lineTo(cx,cy+s*.5);x.lineTo(cx,cy+s*1.5);x.lineTo(cx+s*.87,cy+s);x.fill()};
  const shade=(h,k)=>{const n=parseInt(h.slice(1),16);return`rgb(${[(n>>16&255)*k|0,(n>>8&255)*k|0,(n&255)*k|0]})`};
  const cb=(cx,cy,s,col)=>cube(cx,cy,s,col,shade(col,.72),shade(col,.55));
  if(id==='sandbox'){sky('#7cc4ff','#cfeaff');for(let i=0;i<6;i++){x.fillStyle='rgba(255,255,255,.8)';x.beginPath();x.ellipse(60+i*120,60+(i%2)*30,50,16,0,0,7);x.fill()}
    x.fillStyle='#4fa046';x.fillRect(0,250,W,110);for(let i=0;i<40;i++){x.fillStyle='rgba(255,255,255,.18)';x.beginPath();x.arc((i*53)%W,262+(i*37)%90,6,0,7);x.fill()}
    cb(200,190,60,'#e5484d');cb(300,215,50,'#3d7eff');cb(255,130,50,'#ffd23f');cb(470,200,70,'#2fbf71');x.fillStyle='#22e3ff';x.fillRect(560,110,16,150);x.fillStyle='#ff3ea5';x.fillRect(90,120,16,140);
    x.strokeStyle='#a87444';x.lineWidth=8;x.beginPath();x.moveTo(380,80);x.lineTo(380,250);x.moveTo(420,80);x.lineTo(420,250);x.stroke();for(let y=95;y<250;y+=24){x.beginPath();x.moveTo(380,y);x.lineTo(420,y);x.stroke()}}
  else if(id==='obby'){sky('#1a1240','#6a3dbf');for(let i=0;i<60;i++){x.fillStyle=`rgba(255,255,255,${rh(i)})`;x.fillRect(rh(i*3)*W,rh(i*7)*200,2,2)}
    for(let i=0;i<8;i++)cb(70+i*72,300-i*30,34,hsl(i*40,80,58));x.fillStyle='#ffd23f';x.beginPath();x.arc(600,50,22,0,7);x.fill();x.font='40px system-ui';x.fillText('🏆',575,62)}
  else if(id==='tycoon'){sky('#ffcf7a','#ff8f5a');x.fillStyle='#4a4f5c';x.fillRect(0,250,W,110);x.fillStyle='#30343d';x.fillRect(60,220,440,30);
    for(let i=0;i<4;i++){x.fillStyle='#9aa3ad';x.fillRect(90+i*100,120,60,60);x.fillStyle='#6c737d';x.fillRect(110+i*100,180,20,20);cb(120+i*100,205,10,['#9aa4b2','#4ea8ff','#2fbf71','#b46bff'][i])}
    x.fillStyle='#2a2d33';x.fillRect(500,150,90,100);x.fillStyle='#ff6a1a';x.fillRect(500,190,14,40);x.font='bold 54px system-ui';x.fillStyle='#ffd23f';x.fillText('$',540,120);x.fillText('$',30,90)}
  else if(id==='manoir'){sky('#0b0614','#3a1f4a');x.fillStyle='#f4f1e0';x.beginPath();x.arc(560,70,34,0,7);x.fill();x.fillStyle='#120b18';x.fillRect(0,280,W,80);x.fillRect(150,120,340,170);x.beginPath();x.moveTo(130,125);x.lineTo(320,40);x.lineTo(510,125);x.fill();for(const tx of[140,440])x.fillRect(tx,80,50,70);
    for(let i=0;i<8;i++){x.fillStyle=i%3?'#ffcf8a':'#2a1d10';x.fillRect(180+(i%4)*75,150+Math.floor(i/4)*60,30,36)}x.font='110px system-ui';x.fillText('🤡',40,330);x.font='60px system-ui';x.fillText('🍌',520,330)}
  else if(id==='camp'){sky('#04101a','#1d3b2a');for(let i=0;i<70;i++){x.fillStyle=`rgba(255,255,255,${rh(i)*.8})`;x.fillRect(rh(i*3)*W,rh(i*7)*180,2,2)}x.fillStyle='#0b1a10';for(let i=0;i<12;i++){const tx=i*58;x.beginPath();x.moveTo(tx,300);x.lineTo(tx+30,120+rh(i)*60);x.lineTo(tx+60,300);x.fill()}
    x.fillStyle='#14281a';x.fillRect(0,290,W,70);x.fillStyle='#ff8a3d';x.beginPath();x.moveTo(300,300);x.quadraticCurveTo(320,220,340,300);x.fill();x.fillStyle='#ffd23f';x.beginPath();x.moveTo(310,300);x.quadraticCurveTo(320,250,330,300);x.fill();x.font='120px system-ui';x.fillText('🧸',430,330)}
  else if(id!=='rpg'&&g){sky(g.colors[0],g.colors[1]);for(let i=0;i<18;i++){x.fillStyle=`rgba(255,255,255,${.05+rh(i+id.length)*.12})`;const s_=20+rh(i*3+id.length)*60;x.fillRect(rh(i*7+id.length*3)*W,rh(i*5+id.length)*Hh*.8,s_,s_)}
    x.fillStyle='rgba(0,0,0,.25)';x.fillRect(0,250,W,110);x.font='150px system-ui';x.textAlign='center';x.fillText(g.icon,W/2+120,230);x.textAlign='left'}
  else{sky('#2b1d5a','#ff7a59');x.fillStyle='#1b1430';x.beginPath();x.moveTo(0,270);for(let i=0;i<=W;i+=40)x.lineTo(i,250-((i/40)%3)*20);x.lineTo(W,360);x.lineTo(0,360);x.fill();
    x.fillStyle='#120d22';x.fillRect(420,120,120,150);for(const tx of[410,470,530])x.fillRect(tx,90,26,60);x.fillStyle='#ffd23f';x.fillRect(470,180,14,20);
    x.fillStyle='#5ee04a';x.beginPath();x.ellipse(170,290,60,40,0,Math.PI,0);x.fill();x.fillStyle='#15161b';x.fillRect(150,270,10,14);x.fillRect(185,270,10,14);
    x.save();x.translate(300,200);x.rotate(-.6);x.fillStyle='#d8dee6';x.fillRect(-6,-110,12,150);x.fillStyle='#8a6a2a';x.fillRect(-26,40,52,10);x.fillStyle='#3b2617';x.fillRect(-5,50,10,30);x.restore()}
  const vg=x.createLinearGradient(0,Hh*.55,0,Hh);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.55)');x.fillStyle=vg;x.fillRect(0,0,W,Hh);
  x.font='900 40px system-ui';x.fillStyle='#fff';x.shadowColor='rgba(0,0,0,.5)';x.shadowBlur=10;x.fillText(g.name,24,Hh-28);return GTHUMB[id]=c.toDataURL('image/jpeg',.88)}

/* ============================== ÉCRAN DE CONNEXION ============================== */
function showScreen(id){if(id!=='launcher'){document.body.classList.remove('showroom');SHOW.el=null}for(const s of['splash','auth','launcher','loading','gameUI','studio','hub'])$(s).classList.toggle('on',s===id);document.body.dataset.screen=id}
async function boot(){showScreen('splash');applySettings();requestAnimationFrame(t=>{lastT=t;frame(t)});
  await Store.init();
  if(window.CUBIK_MODE==='studio'){await studioBoot();return}
  if(window.CUBIK_MODE==='hub'){await hubBoot();return}
  const ses=await Store.getSession().catch(()=>null);
  if(ses&&ses.remember&&ses.pseudo){const acc=await Store.get(ses.pseudo).catch(()=>null);if(acc){await login(acc,true);return}}
  showAuth()}
async function showAuth(tab='login'){showScreen('auth');const box=$('authBox');box.innerHTML='';
  const tabs=el('div',{class:'atabs'},el('button',{class:tab==='login'?'on':'',text:'Se connecter',onclick:()=>showAuth('login')}),el('button',{class:tab==='signup'?'on':'',text:'Créer un compte',onclick:()=>showAuth('signup')}));
  const err=el('div',{class:'aerr'}),ps=el('input',{type:'text',maxlength:'20',placeholder:'Pseudo',autocomplete:'username',autocapitalize:'off',spellcheck:'false'}),pw=el('input',{type:'password',placeholder:'Mot de passe',autocomplete:tab==='login'?'current-password':'new-password'});
  const rem=el('input',{type:'checkbox'});rem.checked=true;
  const where=Store.mode==='cloud'?'Ton compte est enregistré dans ton espace Claude : tu le retrouves sur tous tes appareils.':'Ton compte est enregistré dans ce navigateur.';
  box.append(tabs);
  if(tab==='login'){const list=await Store.list().catch(()=>[]);
    if(list.length){const q=el('div',{class:'quick'},el('div',{class:'ql',text:'Comptes enregistrés'}));for(const a of list.slice(0,6)){const im=el('img',{alt:''});im.src=headThumb(a.avatar||DEFAULT_AV);q.append(el('button',{class:'qa',onclick:()=>{ps.value=a.pseudo;pw.focus()}},im,el('span',{text:a.pseudo})))}box.append(q)}
    const go=async()=>{err.textContent='';const acc=await Store.get(ps.value.trim()).catch(()=>null);if(!acc){err.textContent='Ce pseudo n\'existe pas.';SFX.error();return}
      if(await hashPw(acc.salt,pw.value)!==acc.hash){err.textContent='Mot de passe incorrect.';SFX.error();return}await Store.setSession({pseudo:acc.pseudo,remember:rem.checked});login(acc)};
    box.append(el('label',{class:'af'},el('span',{text:'Pseudo'}),ps),el('label',{class:'af'},el('span',{text:'Mot de passe'}),pw),el('label',{class:'chk'},rem,'Rester connecté'),err,el('button',{class:'btn green big',text:'Se connecter',onclick:go}),
      el('div',{class:'anote'},'Pas encore de compte ? ',el('a',{href:'#',text:'Inscris-toi',onclick:e=>{e.preventDefault();showAuth('signup')}})));
    pw.onkeydown=e=>{if(e.key==='Enter')go()}}
  else{const pw2=el('input',{type:'password',placeholder:'Confirme le mot de passe',autocomplete:'new-password'});
    const go=async()=>{err.textContent='';const p=ps.value.trim();if(!/^[A-Za-z0-9_]{3,20}$/.test(p)){err.textContent='Pseudo : 3 à 20 caractères (lettres, chiffres, _).';SFX.error();return}
      if(pw.value.length<6){err.textContent='Mot de passe : 6 caractères minimum.';SFX.error();return}if(pw.value!==pw2.value){err.textContent='Les mots de passe ne correspondent pas.';SFX.error();return}
      if(await Store.get(p).catch(()=>null)){err.textContent='Ce pseudo est déjà utilisé ici.';SFX.error();return}
      const salt=crypto.getRandomValues(new Uint8Array(12)).reduce((s,b)=>s+b.toString(16).padStart(2,'0'),'');const acc=newAccount(p,salt,await hashPw(salt,pw.value));acc.badges.push('welcome');
      try{await Store.put(acc)}catch(e){err.textContent='Impossible d\'enregistrer le compte ('+(e.message||e.code||'erreur')+').';return}
      await Store.setSession({pseudo:p,remember:rem.checked});await login(acc);setTimeout(()=>toast('Bienvenue ! Voici 300 {B} pour commencer 🎉','gold'),600)};
    box.append(el('label',{class:'af'},el('span',{text:'Pseudo'}),ps),el('label',{class:'af'},el('span',{text:'Mot de passe'}),pw),el('label',{class:'af'},el('span',{text:'Confirmation'}),pw2),el('label',{class:'chk'},rem,'Rester connecté'),err,
      el('button',{class:'btn green big',text:'Créer mon compte',onclick:go}),el('div',{class:'anote',text:where+' N\'utilise pas un mot de passe que tu utilises ailleurs : c\'est une démo.'}));
    pw2.onkeydown=e=>{if(e.key==='Enter')go()}}
  setTimeout(()=>ps.focus(),50)}
async function login(acc,auto){ACC=acc;ACC.settings=Object.assign({...SET_DEFAULT},ACC.settings);SET={...ACC.settings};applySettings();for(const id of FREE_IDS)if(!ACC.owned.includes(id))ACC.owned.push(id);
  ugcLoadAll();hubAccLoad();Lobby.start().then(()=>{startInbox();Lobby.fns.add(socialTick);Lobby.fns.add(()=>{if(MODE==='launcher'&&(PAGE==='home'||PAGE==='discover'))document.querySelectorAll('.gcard[data-g]').forEach(c=>{const b=c.querySelector('.onl');const n=Lobby.count('game:'+c.dataset.g+':');if(b)b.textContent=n?` · 🟢 ${n} en ligne`:'';else if(n)c.querySelector('.gmeta').append(onlineBadge(c.dataset.g))})})});if(ACC.owned.length>=40)unlockBadge('collect');openLauncher('home');if(auto)toast(`Content de te revoir, ${ACC.pseudo} !`)}
async function logout(){persistGame();await flushSave();await Store.setSession({pseudo:'',remember:false});ACC=null;SHOW.el=null;showAuth()}

/* ============================== LANCEUR ============================== */
const NAV=[['home','Accueil','🏠'],['discover','Découvrir','🧭'],['friends','Amis','👥'],['create','Créer','🛠️'],['avatar','Avatar','🧍'],['shop','Boutique','🛍️'],['profile','Profil','🏅'],['settings','Paramètres','⚙️']];
let PAGE='home';
function openLauncher(page){MODE='launcher';showScreen('launcher');go(page)}
function buildNav(){const s=$('sideNav'),b=$('bottomNav');s.innerHTML='';b.innerHTML='';
  for(const[id,label,ic]of NAV){const mk=cls=>el('button',{class:cls+(PAGE===id?' on':''),'data-p':id,onclick:()=>{SFX.click();go(id)}},el('span',{class:'ni',text:ic}),el('span',{class:'nl',text:label}),id==='friends'?el('span',{class:'nbadge',style:'display:none'}):null);s.append(mk('nb'));if(id!=='settings')b.append(mk('bb'))}
  $('sideUser').innerHTML='';const im=el('img',{alt:''});im.src=headThumb(ACC.avatar);$('sideUser').append(im,el('div',{},el('b',{text:ACC.pseudo}),el('small',{},el('span',{html:BLOX}),el('span',{class:'bloxAmt'}))))}
function go(page){PAGE=page;buildNav();updBlox();SHOW.el=null;document.body.classList.toggle('showroom',page==='avatar');$('launcher').classList.toggle('av',page==='avatar');const C=$('content');C.innerHTML='';C.scrollTop=0;$('pageTitle').textContent=NAV.find(n=>n[0]===page)[1];
  ({home:pgHome,discover:pgDiscover,friends:pgFriends,create:pgCreate,avatar:pgAvatar,shop:pgShop,profile:pgProfile,settings:pgSettings})[page](C);Music.play('menu')}
function todayKey(){const d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function gameCard(id,big){const g=GAMES[id];const im=el('img',{alt:'',loading:'lazy'});im.src=gameThumb(id);
  return el('button',{class:'gcard'+(big?' big':''),'data-g':id,onclick:()=>{SFX.click();gameModal(id)}},el('div',{class:'gimg'},im,el('span',{class:'gtag',text:g.genre})),el('div',{class:'gname',text:g.icon+' '+g.name}),el('div',{class:'gmeta'},progressText(id),onlineBadge(id)))}
function onlineBadge(id){const n=Lobby.count('game:'+id+':');return n?el('span',{class:'onl',text:` · 🟢 ${n} en ligne`}):null}
function progressText(id){const s=ACC.games[id]||{};if(id==='obby')return s.done?`Terminé ${s.done}× · record ${fmtT(s.best)}`:s.stage?`Étape ${s.stage}/30`:'Nouveau';if(id==='tycoon')return s.owned?`${(s.owned||[]).length} achats · ${s.reb||0} renaissance(s) · quête ${(s.q||0)+1}`:'Nouveau';
  if(GAMES[id]?.genre==='Horreur')return s.wins?`Évadé ${s.wins}×`:'Nouveau';if(id==='rpg')return s.lvl?`Niveau ${s.lvl} · ${s.gold} or`:'Nouveau';return(ACC.stats.plays[id]?`Joué ${ACC.stats.plays[id]}×`:'Nouveau')}
function pgHome(C){const hero=el('div',{class:'hero'});const av=el('img',{class:'heroav',alt:''});av.src=avatarThumb(ACC.avatar);
  const d=ACC.daily,can=d.last!==todayKey();
  hero.append(av,el('div',{class:'herot'},el('h1',{text:`Salut, ${ACC.pseudo} !`}),el('p',{html:`Tu as <b class="bloxAmt"></b> ${BLOX} · ${ACC.owned.length} objets · ${ACC.badges.length} badges`}),
    el('div',{class:'herob'},el('button',{class:'btn green',text:'▶ Jouer',onclick:()=>gameModal(lastGame())}),el('button',{class:'btn',text:'Modifier mon avatar',onclick:()=>go('avatar')}))),
    el('div',{class:'daily'+(can?' ready':'')},el('div',{class:'dt',text:'🎁 Récompense du jour'}),el('div',{class:'ds',text:can?`Série : ${d.streak} jour(s)`:`Reviens demain ! Série : ${d.streak} jour(s)`}),
      el('button',{class:'btn '+(can?'gold':''),disabled:can?null:'',html:can?`Récupérer ${dailyAmount()} ${BLOX}`:'Déjà récupérée',onclick:claimDaily})));
  C.append(hero,el('h2',{text:'Jeux'}),el('div',{class:'ggrid'},...['hopital','college','foire','royale','donjon','survie','ferme','maree','foot','cache','manoir','camp','zombies','tycoon','course','mine','animaux','prison','obby','tour','rpg','defense','peche','neige','pizzeria','sandbox'].map(id=>gameCard(id))));
  const news=CATALOG.filter(i=>i.price>0&&i.cat!=='emote'&&!ACC.owned.includes(i.id)).sort((a,b)=>b.price-a.price).slice(0,8);
  C.append(el('h2',{},'Nouveautés en boutique ',el('a',{href:'#',text:'Tout voir →',onclick:e=>{e.preventDefault();go('shop')}})),itemRow(news));updBlox()}
function lastGame(){let best='obby',n=-1;for(const id in GAMES){if(id==='custom')continue;const p=ACC.stats.plays[id]||0;if(p>n){n=p;best=id}}return best}
function dailyAmount(){const s=ACC.daily.last===yesterday()?ACC.daily.streak+1:1;return 40+Math.min(s,7)*10}
function yesterday(){const d=new Date(Date.now()-864e5);return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
function claimDaily(){const d=ACC.daily;if(d.last===todayKey())return;const amt=dailyAmount();d.streak=d.last===yesterday()?d.streak+1:1;d.last=todayKey();giveBlox(amt,'Récompense du jour');if(d.streak>=7)unlockBadge('daily7');go('home')}
function itemRow(items){const r=el('div',{class:'irow'});for(const it of items)r.append(itemCard(it));queueThumbs(r);return r}
function pgDiscover(C){let f='Tous';const chips=el('div',{class:'chips'}),grid=el('div',{class:'ggrid'});
  const draw=()=>{chips.innerHTML='';for(const g of['Tous','Horreur','Survie','Combat','Course','Simulateur','Obby','Tycoon','Aventure','Sport','Party','Stratégie','Détente'])chips.append(el('button',{class:'chip'+(f===g?' on':''),text:g,onclick:()=>{f=g;draw()}}));
    grid.innerHTML='';for(const id in GAMES)if(id!=='custom')if(f==='Tous'||GAMES[id].genre===f)grid.append(el('div',{class:'dcard'},gameCard(id,true),el('p',{text:GAMES[id].desc})))};draw();C.append(chips,grid);
  const pub=(ACC.creations||[]).filter(c=>c.published);C.append(el('h2',{text:'🛠️ Créations Cubik Studio'}),el('p',{class:'note',text:'Les jeux d\'exemple et ceux que tu as publiés depuis le Studio.'}));const cg=el('div',{class:'ggrid'});
  for(const t of TEMPLATES_G.filter(t=>t.example)){const im=el('img',{alt:''});im.src=creationThumb({id:t.id,name:t.name,icon:t.icon,color:t.color,updated:0});cg.append(el('button',{class:'gcard',onclick:()=>playTemplate(t)},el('div',{class:'gimg'},im,el('span',{class:'gtag',text:'Exemple'})),el('div',{class:'gname',text:t.icon+' '+t.name}),el('div',{class:'gmeta',text:t.desc})))}
  for(const m of pub){const im=el('img',{alt:''});im.src=creationThumb(m);cg.append(el('button',{class:'gcard',onclick:()=>playCreation(m.id)},el('div',{class:'gimg'},im,el('span',{class:'gtag',text:'Par toi'})),el('div',{class:'gname',text:(m.icon||'🎮')+' '+m.name}),el('div',{class:'gmeta',text:`${m.count||0} objets`})))}
  C.append(cg)}
function gameModal(id){const g=GAMES[id];const im=el('img',{class:'mimg',alt:''});im.src=gameThumb(id);
  const m=modal(el('div',{class:'gm'},im,el('div',{class:'gmb'},el('h2',{text:g.icon+' '+g.name}),el('div',{class:'gmeta',text:`${g.genre} · Cubik Studio · ${progressText(id)}`}),el('p',{text:g.desc}),
    el('div',{class:'badges'},...g.badges.map(b=>el('span',{class:'bdg',text:'🏅 '+b}))),el('button',{class:'btn green play',text:'▶  Jouer',onclick:()=>{m.remove();startGame(id)}}),serverList(id,()=>m.remove()))),'wide')}

/* ---------- avatar ---------- */
let avCat='corps';
function pgAvatar(C){const stage=el('div',{class:'stage'},el('div',{class:'stagehint',text:'Glisse pour tourner'}));const panel=el('div',{class:'avpanel'});C.append(el('div',{class:'avwrap'},stage,panel));
  SHOW.el=stage;SHOW.char=makeChar({av:ACC.avatar,isPlayer:false});SHOW.char.pos=[0,0,0];SHOW.char.bubbles=[];
  const cats=[['corps','Corps','🎨'],...CATS];const tabs=el('div',{class:'chips scroll'}),grid=el('div',{class:'igrid'});
  const draw=()=>{tabs.innerHTML='';for(const[id,l,ic]of cats)tabs.append(el('button',{class:'chip'+(avCat===id?' on':''),text:ic+' '+l,onclick:()=>{avCat=id;SFX.click();draw()}}));grid.innerHTML='';
    if(avCat==='corps'){grid.className='skins';for(const s of SKINS)grid.append(el('button',{class:'skin'+(ACC.avatar.skin===s?' on':''),style:`background:${s}`,'aria-label':s,onclick:()=>{ACC.avatar.skin=s;avChanged();draw()}}));return}
    grid.className='igrid';const own=CATALOG.filter(i=>i.cat===avCat&&ACC.owned.includes(i.id));
    if(avCat==='emote'){for(const it of CATALOG.filter(i=>i.cat==='emote')){const o=ACC.owned.includes(it.id);grid.append(el('button',{class:'icard'+(o?'':' lock'),onclick:()=>{if(!o){go('shop');return}const c=SHOW.char;c.emote=null;c.dance=false;if(it.emote==='danse')c.dance=true;else if(it.emote==='salut')c.wave=1.6;else if(it.emote==='applaudir')c.clap=2;else if(it.emote==='pointe')c.point=2;else c.emote=it.emote;clearTimeout(c.et);c.et=setTimeout(()=>{c.emote=null;c.dance=false},3500)}},el('div',{class:'ith emo',text:'💃'}),el('div',{class:'iname',text:it.name}),el('div',{class:'iprice',text:o?'▶ Essayer':'🔒 Boutique'})))}return}
    const slotOpt=!['haut','bas','visage'].includes(avCat);
    if(slotOpt)grid.append(el('button',{class:'icard'+(!ACC.avatar[avCat]?' on':''),onclick:()=>{ACC.avatar[avCat]=null;avChanged();draw()}},el('div',{class:'ith none',text:'∅'}),el('div',{class:'iname',text:'Aucun'})));
    for(const it of own){const c=itemCard(it,true);if(ACC.avatar[avCat]===it.id)c.classList.add('on');c.onclick=()=>{SFX.click();ACC.avatar[avCat]=slotOpt&&ACC.avatar[avCat]===it.id?null:it.id;avChanged();draw()};grid.append(c)}
    grid.append(el('button',{class:'icard more',onclick:()=>{shopCat=avCat;go('shop')}},el('div',{class:'ith none',text:'+'}),el('div',{class:'iname',text:'Boutique'})));queueThumbs(grid)};
  panel.append(tabs,grid);draw()}
function avChanged(){SHOW.char.av=ACC.avatar;SFX.click();markDirty()}
function itemCard(it,inv){const im=el('img',{class:'ith','data-id':it.id,alt:''});const own=ACC.owned.includes(it.id);
  return el('button',{class:'icard',onclick:()=>itemModal(it)},it.cat==='emote'?el('div',{class:'ith emo',text:'💃'}):im,el('div',{class:'iname',text:it.name}),
    inv?null:el('div',{class:'iprice',html:own?'<span class="owned">✓ Possédé</span>':it.price?`${BLOX}${it.price}`:'Gratuit'}),inv?null:el('span',{class:'rar',text:it.rarity,style:`color:${RCOL[it.rarity]}`}))}
// génère les vignettes 3D petit à petit pour ne pas bloquer l'interface
function queueThumbs(root){const imgs=[...root.querySelectorAll('img[data-id]')].filter(i=>!i.src);let i=0;const step=()=>{const t0=performance.now();while(i<imgs.length&&performance.now()-t0<14){const im=imgs[i++];im.src=itemThumb(im.dataset.id,ACC.avatar)}if(i<imgs.length)setTimeout(step,16)};step()}

/* ---------- boutique ---------- */
let shopCat='all',shopSort='pop',shopQ='';
function pgShop(C){const head=el('div',{class:'shophead'},el('div',{class:'earn'},el('b',{text:'Gagner des Blox : '}),'récompense du jour · terminer l\'Obby · renaissances Tycoon · quêtes RPG'));
  const tabs=el('div',{class:'chips scroll'}),tools=el('div',{class:'tools'}),grid=el('div',{class:'igrid shop'});
  const q=el('input',{type:'search',placeholder:'Rechercher…',value:shopQ}),srt=el('select',{});for(const[v,l]of[['pop','Recommandés'],['asc','Prix croissant'],['desc','Prix décroissant'],['name','Nom']])srt.append(el('option',{value:v,text:l}));srt.value=shopSort;
  q.oninput=()=>{shopQ=q.value;draw()};srt.onchange=()=>{shopSort=srt.value;draw()};tools.append(q,srt);
  const draw=()=>{tabs.innerHTML='';for(const[id,l,ic]of[['all','Tout','✨'],...CATS])tabs.append(el('button',{class:'chip'+(shopCat===id?' on':''),text:ic+' '+l,onclick:()=>{shopCat=id;draw()}}));
    let items=CATALOG.filter(i=>i.price>0&&(shopCat==='all'||i.cat===shopCat)&&i.name.toLowerCase().includes(shopQ.toLowerCase()));
    if(shopSort==='asc')items.sort((a,b)=>a.price-b.price);else if(shopSort==='desc')items.sort((a,b)=>b.price-a.price);else if(shopSort==='name')items.sort((a,b)=>a.name.localeCompare(b.name));else items.sort((a,b)=>(ACC.owned.includes(a.id)-ACC.owned.includes(b.id))||b.price-a.price);
    grid.innerHTML='';if(!items.length)grid.append(el('div',{class:'empty',text:'Aucun objet trouvé.'}));for(const it of items)grid.append(itemCard(it));queueThumbs(grid)};
  C.append(head,tabs,tools,grid);draw()}
function itemModal(it){const own=ACC.owned.includes(it.id);let tryOn=false;const prev=el('img',{class:'mprev',alt:''}),body=el('div',{class:'imb'});
  const refresh=()=>{prev.src=it.cat==='emote'?'':tryOn?avatarThumb({...ACC.avatar,[it.cat]:it.id}):itemThumb(it.id,ACC.avatar)};refresh();
  const btns=el('div',{class:'ibtns'});
  const render=()=>{btns.innerHTML='';const o=ACC.owned.includes(it.id);
    if(it.cat!=='emote')btns.append(el('button',{class:'btn',text:tryOn?'Voir l\'objet':'Essayer sur moi',onclick:()=>{tryOn=!tryOn;refresh();render()}}));
    if(o){if(it.cat!=='emote')btns.append(el('button',{class:'btn green',text:ACC.avatar[it.cat]===it.id?'Porté ✓':'Porter',onclick:()=>{ACC.avatar[it.cat]=it.id;markDirty();SFX.click();render();toast(`${it.name} équipé !`)}}))}
    else btns.append(el('button',{class:'btn gold',html:`Acheter ${BLOX} ${it.price}`,onclick:()=>confirmBuy(it,()=>{render();m.querySelector('.iprice2').innerHTML='<span class="owned">✓ Possédé</span>'})}))};render();
  const m=modal(el('div',{class:'im'},el('div',{class:'imp'},it.cat==='emote'?el('div',{class:'ith emo big',text:'💃'}):prev),el('div',{class:'imb'},el('span',{class:'rar',text:it.rarity,style:`color:${RCOL[it.rarity]}`}),el('h2',{text:it.name}),
    el('div',{class:'gmeta',text:(CATS.find(c=>c[0]===it.cat)||['','Objet'])[1]+' · par Cubik Studio'}),el('div',{class:'iprice2',html:own?'<span class="owned">✓ Possédé</span>':`${BLOX} ${it.price}`}),btns)),'wide')}
function confirmBuy(it,done){if(ACC.blox<it.price){SFX.error();modal(el('div',{class:'cf'},el('h2',{text:'Pas assez de Blox'}),el('p',{html:`Il te manque ${BLOX} ${it.price-ACC.blox}. Gagne-en en jouant : récompense du jour, Obby, Tycoon, quêtes RPG.`})));return}
  const m=modal(el('div',{class:'cf'},el('h2',{text:'Confirmer l\'achat'}),el('p',{html:`Acheter <b>${it.name.replace(/</g,'&lt;')}</b> pour ${BLOX} ${it.price} ?<br><small>Solde après achat : ${ACC.blox-it.price}</small>`}),
    el('div',{class:'ibtns'},el('button',{class:'btn',text:'Annuler',onclick:()=>m.remove()}),el('button',{class:'btn gold',text:'Acheter',onclick:()=>{ACC.blox-=it.price;ACC.stats.spent+=it.price;ACC.owned.push(it.id);SFX.buy();updBlox();markDirty();
      if(ACC.owned.length>=40)unlockBadge('collect');m.remove();toast(`${it.name} ajouté à ton inventaire !`);done&&done();if(PAGE==='shop')go('shop')}}))))}

/* ---------- profil & paramètres ---------- */
function pgProfile(C){const av=el('img',{class:'pav',alt:''});av.src=avatarThumb(ACC.avatar);const s=ACC.stats,g=ACC.games;
  const stat=(v,l)=>el('div',{class:'stat'},el('b',{text:String(v)}),el('span',{text:l}));
  C.append(el('div',{class:'prof'},av,el('div',{},el('h1',{text:ACC.pseudo}),el('div',{class:'gmeta',text:`Membre depuis le ${new Date(ACC.created).toLocaleDateString('fr-FR')} · compte ${Store.mode==='cloud'?'synchronisé (espace Claude)':'local (ce navigateur)'}`}),
    el('div',{class:'stats'},stat(ACC.blox,'Blox'),stat(ACC.owned.length,'Objets'),stat(s.earned,'Blox gagnés'),stat(Math.round(s.time/60)+' min','Temps de jeu'),stat(g.rpg?.lvl||1,'Niveau RPG'),stat(g.obby?.best?fmtT(g.obby.best):'—','Record Obby')))),
    el('h2',{text:'Badges'}),el('div',{class:'bgrid'},...Object.entries(BADGES).map(([id,[ic,n,d]])=>el('div',{class:'badge'+(ACC.badges.includes(id)?' got':'')},el('div',{class:'bi',text:ic}),el('b',{text:n}),el('small',{text:d})))))}
function pgSettings(C){const B=el('div',{class:'setwrap'});settingsPanel(B,()=>go('settings'));
  B.append(el('h3',{text:'Compte'}),el('div',{class:'set'},el('div',{},'Sauvegarde',el('small',{text:Store.mode==='cloud'?'Dans ton espace Claude (privé, sur tous tes appareils)':Store.mode==='server'?'Sur le serveur Cubik':'Dans ce navigateur uniquement'})),el('span',{id:'saveState',class:'savest',text:'Sauvegardé'})),
    el('div',{class:'set'},el('div',{},'Se déconnecter'),el('button',{class:'btn',text:'Déconnexion',onclick:logout})),
    el('div',{class:'set'},el('div',{},'Envoyer des Blox au Studio',el('small',{text:'Pour payer l\'assistant Blocky dans Cubik Studio'})),el('button',{class:'btn gold',text:'Envoyer',onclick:sendBloxModal})),
    el('div',{class:'set'},el('div',{},'Supprimer le compte',el('small',{text:'Efface définitivement ton avatar, tes objets et ta progression.'})),el('button',{class:'btn red',text:'Supprimer',onclick:()=>{
      const inp=el('input',{type:'text',placeholder:ACC.pseudo});const m=modal(el('div',{class:'cf'},el('h2',{text:'Supprimer le compte ?'}),el('p',{text:`Tape « ${ACC.pseudo} » pour confirmer.`}),inp,
        el('div',{class:'ibtns'},el('button',{class:'btn',text:'Annuler',onclick:()=>m.remove()}),el('button',{class:'btn red',text:'Supprimer définitivement',onclick:async()=>{if(inp.value!==ACC.pseudo){SFX.error();return}const p=ACC.pseudo;ACC=null;dirty=false;await Store.del(p);await Store.setSession({pseudo:'',remember:false});m.remove();showAuth('signup')}}))))}})));
  C.append(B)}

/* ============================== LANCER / QUITTER UN JEU ============================== */
let GAME_ID=null,playStart=0,START_SERVER=null;
function startGame(id,server){GAME_ID=id;START_SERVER=server||null;showScreen('loading');const g=GAMES[id];$('ldImg').src=gameThumb(id);$('ldName').textContent=g.icon+' '+g.name;$('ldTip').textContent=pick(['Astuce : appuie sur « / » pour discuter.','Astuce : Échap ouvre le menu.','Astuce : avance contre une échelle pour grimper.','Astuce : la récompense du jour augmente avec ta série.','Astuce : E pour parler aux personnages.']);
  const bar=$('ldBar');bar.style.width='0%';let k=0;const iv=setInterval(()=>{k=Math.min(90,k+12);bar.style.width=k+'%'},80);MODE='loading';
  setTimeout(()=>{try{buildGame(id)}catch(e){console.error(e);clearInterval(iv);toast('Erreur au chargement du jeu','');openLauncher('home');return}
    clearInterval(iv);bar.style.width='100%';setTimeout(()=>{showScreen('gameUI');MODE='game';$('hint').style.opacity=1;setTimeout(()=>$('hint').style.opacity=0,14000)},250)},450)}
function buildGame(id){buildGameWith(GAMES[id],(ACC.games[id]=ACC.games[id]||{}),false,id)}
function buildGameWith(G,sv,testing,id='custom'){resetWorld();$('chatlog').innerHTML='';$('ebars').innerHTML='';$('floats').innerHTML='';$('gameHud').innerHTML='';reacts.length=0;
  WORLD=G;WORLD.motes=false;WORLD.prompts=[];WORLD.voidY=-25;WORLD.grav=1;
  pl=addChar(makeChar({name:ACC.pseudo,isPlayer:true,av:ACC.avatar,nameCol:'#ffd23f'}));pl.autoJump=!!SET.autoJump;pl.held=null;
  G.build(sv);finalizeWorld();respawn(pl);
  cam={yaw:G.camYaw||0,pitch:.3,dist:12,target:V.add(pl.pos,[0,2,0])};camDistS=12;pl.yaw=(G.camYaw||0)+Math.PI;
  setTouch(isTouch);if(isTouch){$('chatWin').classList.add('hidden');$('plist').classList.add('hidden')}
  G.hud&&G.hud($('gameHud'));document.body.classList.toggle('rpg',!!G.attack);
  if(!testing){ACC.stats.plays[id]=(ACC.stats.plays[id]||0)+1;playStart=performance.now();markDirty()}renderPlist();Music.play(G.music||id);
  sys(testing?'Mode test : ■ pour revenir au Studio. La sortie des scripts s\'affiche en bas.':`Bienvenue dans ${G.name} ! Appuie sur « / » pour discuter, Échap pour le menu.`);
  if(!testing)MP.start(id==='custom'?'c-'+(CUR_GAME?.id||'x').slice(-12):id,START_SERVER);applyPasses()}
function persistGame(){if(!ACC||!GAME_ID||MODE!=='game')return;ACC.stats.time+=Math.round((performance.now()-playStart)/1000);playStart=performance.now();markDirty()}
function exitGame(){if(STUDIO.testing){stopTest();return}MP.stop();if(WORLD.exit)WORLD.exit();persistGame();flushSave();MODE='launcher';resetWorld();pl=null;WORLD={};GAME_ID=null;$('gmenu').classList.remove('open');$('dialog').classList.remove('open');openLauncher('home')}
function restartGame(){if(STUDIO.testing){stopTest();startTest();return}const sv=MP.server;MP.stop();if(WORLD.exit)WORLD.exit();const id=GAME_ID;persistGame();startGame(id,sv)}

boot();

function sendBloxModal(){const inp=el('input',{type:'number',min:10,max:Math.max(10,ACC.blox),step:10,value:Math.min(100,ACC.blox)});inp.onkeydown=e=>e.stopPropagation();const out=el('div');
  const m=modal(el('div',{class:'cf'},el('h2',{html:`Envoyer des ${BLOX} au Studio`}),el('p',{class:'note',text:`Tu as ${ACC.blox} Blox. Les Blox envoyés sont retirés de ton compte Cubik et donnés sous forme de code à coller dans Cubik Studio (💰).`}),inp,out,
    el('div',{class:'ibtns'},el('button',{class:'btn',text:'Fermer',onclick:()=>m.remove()}),el('button',{class:'btn gold',text:'Créer le code',onclick:async e=>{const a=Math.floor(+inp.value);if(!(a>=10)||a>ACC.blox){toast('Montant invalide');return}
      e.target.disabled=true;ACC.blox-=a;ACC.stats.spent+=a;markDirty();updBlox();const code=await makeBloxCode(a);out.innerHTML='';out.append(el('div',{class:'invcode'},el('code',{text:code}),el('button',{class:'btn sm',text:'📋 Copier',onclick:async()=>{try{await navigator.clipboard.writeText(code);toast('Code copié')}catch(_){toast(code)}}})),el('p',{class:'note',text:'Garde ce code : il ne fonctionne qu\'une fois.'}))}}))))}
