"use strict";
/* ============================================================================
   SOCIAL MULTIJOUEUR : amis, messages privés, serveurs privés, passes de jeu,
   bonus de groupe et chat vocal de proximité
   ============================================================================ */

/* ---------- passes de jeu ---------- */
const PASS_PERKS={speed:'⚡ Vitesse ×1,35',jump:'🚀 Saut ×1,3',doublejump:'🦘 Double saut',vip:'👑 VIP (nom doré + couronne)',x2:'💰 Gains ×2 (selon le jeu)',none:'🧩 Aucun (à utiliser dans un script)'};
GAMES.obby.passes=[{id:'dj',name:'Double saut',icon:'🦘',price:150,perk:'doublejump',desc:'Saute une deuxième fois en l\'air.'},{id:'vip',name:'VIP',icon:'👑',price:100,perk:'vip',desc:'Nom doré et couronne visibles par tous.'}];
GAMES.tycoon.passes=[{id:'x2',name:'Cash ×2',icon:'💵',price:250,perk:'x2',desc:'Ton usine rapporte deux fois plus.'},{id:'vit',name:'Bottes rapides',icon:'👟',price:90,perk:'speed',desc:'Cours plus vite dans ta base.'}];
GAMES.rpg.passes=[{id:'xp2',name:'XP ×2',icon:'⭐',price:200,perk:'x2',desc:'Double l\'expérience gagnée.'},{id:'vit',name:'Bottes de vitesse',icon:'👟',price:120,perk:'speed',desc:'Fuis les golems plus vite.'}];
GAMES.sandbox.passes=[{id:'vip',name:'VIP',icon:'👑',price:100,perk:'vip',desc:'Nom doré et couronne.'},{id:'saut',name:'Super saut',icon:'🚀',price:80,perk:'jump',desc:'Saute beaucoup plus haut.'}];
const gameKey=()=>GAME_ID==='custom'?'c:'+(CUR_GAME?.id||''):GAME_ID;
function passesOf(key){if(String(key).startsWith('c:'))return(CUR_GAME?.settings?.passes||[]);return GAMES[key]?.passes||[]}
function hasPass(key,idOrPerk){if(STUDIO.testing)return passesOf(key).some(p=>p.id===idOrPerk||p.perk===idOrPerk);const own=(ACC?.passes||{})[key]||[];return passesOf(key).some(p=>own.includes(p.id)&&(p.id===idOrPerk||p.perk===idOrPerk))}
function applyPasses(){if(!pl)return;const k=gameKey();pl.walk=hasPass(k,'speed')?WALK*1.35:pl.walk;pl.jumpV=hasPass(k,'jump')?JUMP*1.3:pl.jumpV;pl.doubleJump=hasPass(k,'doublejump');pl.vip=hasPass(k,'vip');
  if(pl.vip){pl.nameCol='#ffd23f';if(!pl.name.startsWith('👑'))pl.name='👑 '+pl.name;if(pl.bw)pl.bw.querySelector('.nm')&&(pl.bw.querySelector('.nm').textContent=pl.name)}const b=$('bPass');if(b)b.style.display=passesOf(k).length?'':'none'}
function openPassShop(only){const k=gameKey(),L=passesOf(k).filter(p=>!only||p.id===only);if(!L.length){toast('Ce jeu n\'a pas de passe');return}const own=(ACC.passes||{})[k]||[];
  const m=modal(el('div',{class:'cf'},el('h2',{text:'🎟️ Passes de jeu'}),el('p',{class:'note',html:`Achète avec tes Blox (tu en as ${BLOX}<b>${ACC.blox}</b>). Les passes sont permanents pour ce jeu.`}),
    el('div',{class:'passes'},...L.map(p=>{const has=own.includes(p.id)||STUDIO.testing;return el('div',{class:'pass'+(has?' own':'')},el('span',{class:'pic',text:p.icon||'🎟️'}),el('div',{class:'pinf'},el('b',{text:filterText(p.name)}),el('small',{text:filterText(p.desc||PASS_PERKS[p.perk]||'')}),el('em',{text:PASS_PERKS[p.perk]||''})),
      has?el('span',{class:'bdg',text:STUDIO.testing?'Test : actif':'✓ Possédé'}):el('button',{class:'btn gold',html:`${BLOX}${p.price}`,onclick:async()=>{if(ACC.blox<p.price){SFX.error();toast('Pas assez de Blox');return}
        ACC.blox-=p.price;ACC.stats.spent+=p.price;(ACC.passes=ACC.passes||{})[k]=[...own,p.id];markDirty();updBlox();SFX.buy();toast(`🎟️ ${p.name} acheté !`);applyPasses();m.remove();payCreator(p.price)}}))}))),'wide')}
// version serveur : 70 % du prix vont au créateur du jeu
async function payCreator(price){try{if(Cloud.mode!=='server'||GAME_ID!=='custom'||!CUR_GAME?.author||CUR_GAME.author===ACC.pseudo)return;const k='priv/acc_'+CUR_GAME.author.toLowerCase().replace(/[^a-z0-9_-]/g,'_');const a=await Cloud.doc(k).get();if(!a)return;a.blox=(a.blox|0)+Math.floor(price*.7);await Cloud.doc(k).set(a)}catch(e){}}
// éditeur de passes dans le Studio
function passesEditor(sec,commitFn){const S=CUR_GAME.settings,list=S.passes=S.passes||[];const box=el('div',{class:'pedit'});
  const draw=()=>{box.innerHTML='';list.forEach((p,i)=>{const nm=el('input',{type:'text',value:p.name,maxlength:'24'}),ic=el('input',{type:'text',value:p.icon,maxlength:'4',class:'iconin'}),pr=el('input',{type:'number',min:5,max:5000,step:5,value:p.price});
      [nm,ic,pr].forEach(x=>{x.onkeydown=e=>e.stopPropagation();x.onchange=()=>{commitFn(()=>{p.name=filterText(nm.value.trim()||'Passe');p.icon=ic.value||'🎟️';p.price=clamp(Math.round(+pr.value||50),5,5000)})}});
      const pk=el('select',{});for(const[k,l]of Object.entries(PASS_PERKS))pk.append(el('option',{value:k,text:l}));pk.value=p.perk;pk.onchange=()=>commitFn(()=>p.perk=pk.value);
      box.append(el('div',{class:'prow2'},el('div',{class:'pin'},ic,nm,pr),el('div',{class:'pin'},pk,el('code',{text:p.id,title:'ID pour joueur:HasPass("…")'}),el('button',{class:'stb',text:'🗑',onclick:()=>commitFn(()=>list.splice(i,1))}))))});
    box.append(el('button',{class:'btn sm wide',text:'＋ Ajouter un passe',onclick:()=>commitFn(()=>list.push({id:'pass'+(list.length+1)+Math.random().toString(36).slice(2,4),name:'Mon passe',icon:'🎟️',price:100,perk:'speed'}))}),
      el('div',{class:'note',text:'Les joueurs les achètent en Blox avec le bouton 🎟️ en jeu. Dans un script : if joueur:HasPass("ID") then … end · UI.PromptPass("ID") ouvre l\'achat. En test, tous les passes sont actifs.'}))};draw();sec.append(box)}

/* ---------- bonus de groupe (RPG) ---------- */
function partyMult(){let n=0;for(const c of MP.remote.values())if(!c.dead&&V.len(V.sub(c.pos,pl.pos))<25)n++;return n?Math.min(2,1+n*.25):1}

/* ---------- identité, amis, messages privés ---------- */
const myFid=()=>((Cloud.mode==='server'?'s_':'c_'+String(Cloud.uid||'x').replace(/[^A-Za-z0-9]/g,'').slice(0,20)+'_')+String(ACC?.pseudo||'').toLowerCase()).replace(/[^a-z0-9_-]/gi,'_').slice(0,60);
const FR={unread:0,inboxUnsub:null};
function frLists(){ACC.friends=ACC.friends||[];ACC.friendOut=ACC.friendOut||[];ACC.dms=ACC.dms||{};return ACC}
function lobbyPeerOf(id){return Lobby.peers.find(p=>!p.isMe&&p.presence?.id===id)}
function friendState(f){const p=lobbyPeerOf(f.id);if(!p)return{on:false,txt:'Hors ligne'};const w=String(p.presence.where||'menu');if(w==='menu')return{on:true,txt:'Dans le menu',p};const[,g,s]=w.split(':');
  const name=g.startsWith('c-')?'une création':(GAMES[g]?.name||g);return{on:true,txt:`Joue à ${name}${s?.startsWith('p')?' (serveur privé)':' · serveur '+s}`,p,g,s}}
function lobbyExtra(){frLists();publishWornItems();const fr=[...ACC.friends,...ACC.friendOut].map(f=>f.id).slice(0,80);return{id:myFid(),fr,av:compactAv(ACC.avatar),priv:MP.priv||null,dm:FR.dmOut||null}}
function socialTick(){if(!ACC||!Lobby.room)return;frLists();let ch=false;
  for(const p of Lobby.peers){if(p.isMe)continue;const pr=p.presence||{},id=pr.id;if(!id)continue;const theirs=Array.isArray(pr.fr)?pr.fr:[];
    // demande acceptée de l'autre côté → ami
    const out=ACC.friendOut.find(f=>f.id===id);if(out&&theirs.includes(myFid())){ACC.friendOut=ACC.friendOut.filter(f=>f!==out);if(!ACC.friends.some(f=>f.id===id))ACC.friends.push({id,n:String(pr.n||out.n)});toast(`🤝 ${filterText(pr.n)} a accepté ta demande d'ami !`);SFX.quest();ch=true}
    // message privé reçu
    const dm=pr.dm;if(dm&&dm.to===myFid()&&dm.i&&FR['seen_'+id]!==dm.i){const first=FR['seen_'+id]===undefined;FR['seen_'+id]=dm.i;if(!first||Date.now()-(dm.t||0)<20000)receiveDm(id,String(pr.n||'?'),String(dm.x||''),dm.t)}}
  // notifications : ami connecté / lance un jeu
  const now=new Map();for(const f of ACC.friends){const st=friendState(f);if(st.on)now.set(f.id,st.g||'menu')}
  if(FR.onl){for(const[id,w]of now){const f=ACC.friends.find(x=>x.id===id),was=FR.onl.get(id);if(was===undefined){toast(`🟢 ${filterText(f.n)} vient de se connecter`);SFX.emoji()}else if(w!==was&&w!=='menu'&&GAMES[w]&&SET.frNotif!==false)toast(`🎮 ${filterText(f.n)} joue à ${GAMES[w].name}`)}}FR.onl=now;
  if(ch){markDirty();Lobby.set(Lobby.where)}updFriendBadge()}
function incomingRequests(){frLists();return Lobby.peers.filter(p=>!p.isMe&&p.presence?.id&&(p.presence.fr||[]).includes(myFid())&&!ACC.friends.some(f=>f.id===p.presence.id)&&!(ACC.blockedF||[]).includes(p.presence.id))}
function addFriend(id,n){frLists();if(!id||id===myFid()||ACC.friends.some(f=>f.id===id))return;const inc=incomingRequests().some(p=>p.presence.id===id);if(inc){ACC.friends.push({id,n});toast(`🤝 ${filterText(n)} est maintenant ton ami !`)}
  else if(!ACC.friendOut.some(f=>f.id===id)){if(ACC.friendOut.length>=50){toast('Trop de demandes en attente');return}ACC.friendOut.push({id,n});toast(`Demande d'ami envoyée à ${filterText(n)}`)}markDirty();Lobby.set(Lobby.where);SFX.click()}
function removeFriend(id){frLists();ACC.friends=ACC.friends.filter(f=>f.id!==id);ACC.friendOut=ACC.friendOut.filter(f=>f.id!==id);markDirty();Lobby.set(Lobby.where)}
function declineFriend(id){(ACC.blockedF=ACC.blockedF||[]).push(id);markDirty()}
const dmQueue=[];let dmT=null;
function sendDm(id,text){text=filterText(String(text).trim()).slice(0,200);if(!text)return;frLists();(ACC.dms[id]=ACC.dms[id]||[]).push({me:1,x:text,t:Date.now()});ACC.dms[id]=ACC.dms[id].slice(-60);markDirty();
  dmQueue.push({to:id,x:text});pumpDm();if(Cloud.shared()){const mid=Date.now().toString(36)+Math.random().toString(36).slice(2,6);Cloud.doc(`inbox/${id}/m/${mid}`).set({from:myFid(),n:ACC.pseudo,x:text,t:Date.now()}).catch(()=>{})}}
function pumpDm(){if(dmT||!dmQueue.length)return;const m=dmQueue.shift();FR.dmOut={to:m.to,x:m.x,i:Date.now().toString(36)+Math.random().toString(36).slice(2,4),t:Date.now()};Lobby.set(Lobby.where);dmT=setTimeout(()=>{dmT=null;pumpDm()},1600)}
const INV_RE=/^⟦inv:([a-z0-9_-]{1,24}):([a-z0-9]{1,16})⟧$/i;
function inviteFriend(f){if(MODE!=='game'||!MP.game||!GAMES[MP.game]){toast('Lance un jeu pour inviter tes amis');return}
  if(MP.priv&&MP.priv.o===myFid()&&!MP.priv.a.includes(f.id)){MP.priv.a.push(f.id);Lobby.set(Lobby.where)}
  sendDm(f.id,`⟦inv:${MP.game}:${MP.server}⟧`);toast(`📨 Invitation envoyée à ${filterText(f.n)}`);if(DMW.id===f.id)drawDm()}
function joinInvite(g,s){if(!GAMES[g]){toast('Jeu introuvable');return}if(String(s).startsWith('p')&&!privAllowed(g,s)){toast('Ce serveur privé n\'est plus ouvert');return}
  if(MODE==='game'){if(MP.game===g&&MP.server===s){toast('Tu es déjà sur ce serveur');return}exitGame()}document.querySelectorAll('.modal').forEach(m=>m.remove());$('dmWin')&&($('dmWin').style.display='none');startGame(g,s)}
function dmText(x){const m=INV_RE.exec(x);return m?`🎮 Invitation : ${GAMES[m[1]]?.name||m[1]}`:x}
function receiveDm(id,n,x,t){frLists();if(!ACC.friends.some(f=>f.id===id))return;const L=ACC.dms[id]=ACC.dms[id]||[];if(L.some(m=>!m.me&&m.x===x&&Math.abs((m.t||0)-(t||0))<3000))return;
  L.push({me:0,x:filterText(x).slice(0,200),t:t||Date.now()});ACC.dms[id]=L.slice(-60);markDirty();if(DMW.id===id)drawDm();else{FR.unread++;const iv=INV_RE.exec(x);toast(iv?`🎮 ${filterText(n)} t'invite à jouer à ${GAMES[iv[1]]?.name||'un jeu'} ! (ouvre ses messages)`:`💬 ${filterText(n)} : ${filterText(x).slice(0,60)}`);SFX.emoji()}updFriendBadge()}
async function startInbox(){if(!Cloud.shared()||FR.inboxUnsub)return;const me=myFid();FR.inboxUnsub=Cloud.watch(`inbox/${me}/m`,ch=>{for(const c of ch){if(!c.data)continue;const d=c.data;receiveDm(String(d.from),String(d.n||'?'),String(d.x||''),d.t);Cloud.doc(`inbox/${me}/m/${c.id}`).delete().catch(()=>{})}})}
function updFriendBadge(){const n=incomingRequests().length+FR.unread;document.querySelectorAll('.nb[data-p=friends] .nbadge,.bb[data-p=friends] .nbadge').forEach(b=>{b.textContent=n||'';b.style.display=n?'':'none'})}
// fenêtre de discussion privée (menu et jeu)
const DMW={id:null};
function openDm(f){DMW.id=f.id;DMW.n=f.n;FR.unread=0;updFriendBadge();let w=$('dmWin');if(!w){w=el('div',{id:'dmWin'});document.body.append(w)}w.style.display='flex';drawDm()}
function drawDm(){const w=$('dmWin');if(!w||!DMW.id)return;frLists();const L=ACC.dms[DMW.id]||[],st=friendState({id:DMW.id});w.innerHTML='';const log=el('div',{class:'dmlog'});
  for(const m of L){const iv=INV_RE.exec(m.x);if(iv){const g=GAMES[iv[1]];log.append(el('div',{class:'dmm inv '+(m.me?'me':'them')},el('b',{text:`🎮 ${m.me?'Tu as invité ton ami':'Invitation'} : ${g?.icon||''} ${g?.name||iv[1]}`}),el('small',{text:` serveur ${iv[2].startsWith('p')?'privé':iv[2]}`}),!m.me&&Date.now()-(m.t||0)<36e5?el('button',{class:'btn sm green',text:'Rejoindre',onclick:()=>joinInvite(iv[1],iv[2])}):null))}else log.append(el('div',{class:'dmm '+(m.me?'me':'them'),text:m.x}))}if(!L.length)log.append(el('div',{class:'note',text:'Écris ton premier message ! (les messages sont filtrés)'}));
  const inp=el('input',{type:'text',maxlength:'200',placeholder:'Message privé…'});inp.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter'){sendDm(DMW.id,inp.value);inp.value='';drawDm();setTimeout(()=>$('dmWin')?.querySelector('input')?.focus(),0)}if(e.key==='Escape')w.style.display='none'};
  w.append(el('div',{class:'dmh'},el('span',{class:'dot'+(st.on?' on':'')}),el('b',{text:filterText(DMW.n)}),el('small',{text:st.txt}),MODE==='game'&&MP.game?el('button',{class:'btn sm gold',text:'📨 Inviter',title:'Inviter dans mon serveur',onclick:()=>inviteFriend({id:DMW.id,n:DMW.n})}):null,st.g?el('button',{class:'btn sm green',text:'Rejoindre',onclick:()=>joinFriend({id:DMW.id,n:DMW.n})}):null,el('button',{class:'mx',text:'✕',onclick:()=>{w.style.display='none';DMW.id=null}})),log,el('div',{class:'dmf'},inp,el('button',{class:'btn sm green',text:'➤',onclick:()=>{sendDm(DMW.id,inp.value);inp.value='';drawDm()}})));
  log.scrollTop=log.scrollHeight;setTimeout(()=>inp.focus(),30)}
function joinFriend(f){const st=friendState(f);if(!st.g){toast('Ton ami n\'est pas en jeu');return}if(st.s.startsWith('p')&&!privAllowed(st.g,st.s)){toast('Serveur privé : tu n\'es pas sur sa liste');return}
  if(st.g.startsWith('c-')){const c=(ACC.creations||[]).find(x=>('c-'+x.id.slice(-12))===st.g);if(!c){toast('Ton ami joue à une création que tu n\'as pas');return}document.querySelectorAll('.modal').forEach(m=>m.remove());playCreation(c.id,st.s);return}
  if(MODE==='game')exitGame();document.querySelectorAll('.modal').forEach(m=>m.remove());startGame(st.g,st.s)}
function privOwner(g,s){return Lobby.peers.find(p=>p.presence?.where===`game:${g}:${s}`&&p.presence?.priv?.o)}
function privAllowed(g,s){const o=privOwner(g,s);if(!o)return false;const pv=o.presence.priv;return pv.o===myFid()||(Array.isArray(pv.a)&&pv.a.includes(myFid()))}

/* ---------- page « Amis » ---------- */
function pgFriends(C){frLists();FR.unread=0;const inc=incomingRequests();
  if(!Cloud.online())C.append(el('div',{class:'hubwarn',text:'Les amis fonctionnent quand Cubik est partagé avec d\'autres joueurs (version Claude) ou sur un serveur Cubik.'}));
  if(inc.length){C.append(el('h2',{text:`📨 Demandes reçues (${inc.length})`}));const g=el('div',{class:'frl'});for(const p of inc)g.append(frRow(p.presence.n,p.presence.av,'Veut être ton ami',el('button',{class:'btn sm green',text:'Accepter',onclick:()=>{addFriend(p.presence.id,String(p.presence.n));go('friends')}}),el('button',{class:'btn sm',text:'Refuser',onclick:()=>{declineFriend(p.presence.id);go('friends')}})));C.append(g)}
  const fl=ACC.friends.map(f=>({f,st:friendState(f)})).sort((a,b)=>b.st.on-a.st.on);C.append(el('h2',{text:`👥 Mes amis (${fl.length})`}));const g2=el('div',{class:'frl'});
  if(!fl.length)g2.append(el('div',{class:'note',text:'Pas encore d\'amis. Ajoute des joueurs en ligne ci-dessous, ou depuis la liste des joueurs en jeu (Échap → Joueurs).'}));
  for(const{f,st}of fl)g2.append(frRow(f.n,st.p?.presence?.av,st.txt,st.g?el('button',{class:'btn sm green',text:'Rejoindre',onclick:()=>joinFriend(f)}):null,el('button',{class:'btn sm',text:'💬',title:'Message privé',onclick:()=>openDm(f)}),el('button',{class:'btn sm red',text:'✕',title:'Retirer',onclick:async()=>{if(await confirmDel(f.n+' de tes amis')){removeFriend(f.id);go('friends')}}}),st.on));C.append(g2);
  const others=Lobby.peers.filter(p=>!p.isMe&&p.presence?.id&&p.presence.id!==myFid()&&!ACC.friends.some(f=>f.id===p.presence.id));C.append(el('h2',{text:`🌐 Joueurs en ligne (${others.length})`}));const g3=el('div',{class:'frl'});
  if(!others.length)g3.append(el('div',{class:'note',text:'Personne d\'autre en ligne pour l\'instant.'}));
  for(const p of others){const sent=ACC.friendOut.some(f=>f.id===p.presence.id);g3.append(frRow(p.presence.n,p.presence.av,friendState({id:p.presence.id}).txt,el('button',{class:'btn sm'+(sent?'':' green'),text:sent?'Demande envoyée':'＋ Ajouter',disabled:sent?'':null,onclick:()=>{addFriend(p.presence.id,String(p.presence.n));go('friends')}}),null,null,true))}C.append(g3);
  if(Cloud.mode==='server'){const inp=el('input',{type:'text',maxlength:'20',placeholder:'Pseudo exact'});inp.onkeydown=e=>e.stopPropagation();C.append(el('h2',{text:'🔎 Ajouter par pseudo'}),el('div',{class:'hubbar'},inp,el('button',{class:'btn green',text:'Envoyer la demande',onclick:()=>{const n=inp.value.trim();if(n){addFriend('s_'+n.toLowerCase().replace(/[^a-z0-9_-]/g,'_'),n);go('friends')}}})))}
  if(ACC.friendOut.length)C.append(el('p',{class:'note',text:'Demandes envoyées : '+ACC.friendOut.map(f=>filterText(f.n)).join(', ')}));updFriendBadge()}
function frRow(n,av,sub,b1,b2,b3,on){const im=el('img',{alt:''});im.src=headThumb(expandAv(av));return el('div',{class:'frr'},el('div',{class:'frav'},im,on!==undefined?el('i',{class:'dot'+(on?' on':'')}):null),el('div',{class:'frn'},el('b',{text:filterText(String(n||'?'))}),el('small',{text:sub})),el('div',{class:'frb'},b1,b2,b3))}

/* ---------- serveurs publics et privés ---------- */
function serverList(id,close){if(!Cloud.online())return el('div',{class:'note',text:'Mode solo : le multijoueur fonctionne quand Cubik est partagé avec tes amis (ou sur un serveur Cubik).'});
  const box=el('div',{class:'srvs'}),max=maxFor(id);const draw=()=>{box.innerHTML='';const m=Lobby.servers(id);const pub=[...new Set(['1',...[...m.keys()].filter(s=>!s.startsWith('p'))])].sort((a,b)=>a-b),priv=[...m.keys()].filter(s=>s.startsWith('p'));
    box.append(el('div',{class:'srvh',text:`Serveurs publics · ${Lobby.count('game:'+id+':')} joueur(s) en ligne`}));
    for(const s of pub){const n=m.get(s)||0;box.append(el('div',{class:'srv'},el('span',{text:`🌐 Serveur ${s}`}),el('span',{class:'srvn',text:`${n}/${max}`+(n>=softFor(id)&&n<max?' · presque plein':'')}),el('button',{class:'btn sm',text:n>=max?'Plein':'Rejoindre',disabled:n>=max?'':null,onclick:()=>{close();startGame(id,s)}})))}
    const vis=priv.filter(s=>privAllowed(id,s));if(vis.length){box.append(el('div',{class:'srvh',text:'Serveurs privés où tu es invité'}));for(const s of vis){const o=privOwner(id,s);box.append(el('div',{class:'srv'},el('span',{text:`🔒 Serveur de ${filterText(o.presence.n)}`}),el('span',{class:'srvn',text:`${m.get(s)||0}/${max}`}),el('button',{class:'btn sm',text:'Rejoindre',onclick:()=>{close();startGame(id,s)}})))}}
    const nx=String(Math.max(0,...pub.map(Number))+1);box.append(el('div',{class:'ibtns'},el('button',{class:'btn sm',text:'＋ Nouveau serveur public',onclick:()=>{close();startGame(id,nx)}}),el('button',{class:'btn sm gold',text:'🔒 Serveur privé',onclick:()=>{close();privateServerModal(id)}})))};
  draw();Lobby.fns.add(draw);setTimeout(()=>{const o=new MutationObserver(()=>{if(!box.isConnected){Lobby.fns.delete(draw);o.disconnect()}});o.observe(document.body,{childList:true})},0);return box}
function privateServerModal(id){frLists();const chk=ACC.friends.map(f=>{const c=el('input',{type:'checkbox'});c.checked=true;c.dataset.id=f.id;return el('label',{class:'pchk'},c,filterText(f.n))});
  const m=modal(el('div',{class:'cf'},el('h2',{text:'🔒 Serveur privé'}),el('p',{class:'note',text:'Seuls les amis cochés le voient et peuvent le rejoindre (depuis la liste des serveurs ou ta page d\'ami).'}),
    ACC.friends.length?el('div',{class:'pchks'},...chk):el('div',{class:'note',text:'Tu n\'as pas encore d\'amis : tu seras seul sur ce serveur.'}),
    el('div',{class:'ibtns'},el('button',{class:'btn',text:'Annuler',onclick:()=>m.remove()}),el('button',{class:'btn gold',text:'Créer et jouer',onclick:()=>{const a=chk.map(l=>l.querySelector('input')).filter(c=>c.checked).map(c=>c.dataset.id);
      m.remove();START_PRIV={o:myFid(),a};startGame(id,'p'+Math.random().toString(36).slice(2,8))}}))))}
let START_PRIV=null;

/* ---------- chat vocal de proximité (version serveur, micro autorisé) ---------- */
const VOICE={on:false,ptt:false,stream:null,proc:null,src:null,buf:[],seq:0,spk:new Map(),rate:12000,level:0};
const voiceAvailable=()=>Cloud.mode==='server'&&window.isSecureContext&&!!navigator.mediaDevices?.getUserMedia;
function voiceInfo(){modal(el('div',{class:'cf'},el('h2',{text:'🎙️ Chat vocal de proximité'}),el('p',{text:voiceAvailable()?'Active ton micro : les joueurs proches t\'entendent, plus fort quand ils sont près de toi. Maintiens V pour parler (ou active le micro ouvert).':
  Cloud.mode==='server'?'Le navigateur bloque le micro sur une adresse non sécurisée. Ouvre le jeu en https:// (hébergement en ligne) ou sur http://localhost.':'Le chat vocal n\'est pas possible dans la version Claude : le micro y est bloqué par sécurité. Il marche dans la version serveur (fichier cubik-serveur), en https ou sur localhost.'})))}
async function voiceToggle(){if(!voiceAvailable()){voiceInfo();return}if(VOICE.on){voiceStop();return}
  try{audioInit();VOICE.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});const C=AU.ctx;VOICE.src=C.createMediaStreamSource(VOICE.stream);
    VOICE.proc=C.createScriptProcessor(2048,1,1);const ratio=C.sampleRate/VOICE.rate;let acc=0;
    VOICE.proc.onaudioprocess=e=>{const d=e.inputBuffer.getChannelData(0);let r=0;for(let i=0;i<d.length;i++)r+=d[i]*d[i];VOICE.level=Math.sqrt(r/d.length);
      for(let i=0;i<d.length;i++){acc+=1;if(acc>=ratio){acc-=ratio;VOICE.buf.push(d[i])}}if(VOICE.buf.length>=1200){const chunk=VOICE.buf.splice(0,1200);if((VOICE.ptt||VOICE.open&&VOICE.level>.015)&&MP.room)voiceSend(chunk)}};
    const z=C.createGain();z.gain.value=0;VOICE.src.connect(VOICE.proc);VOICE.proc.connect(z);z.connect(C.destination);VOICE.on=true;VOICE.open=true;VOICE.muteMe=false;MP.room&&voiceListen();updMic();toast('🎙️ Micro activé : les joueurs proches t\'entendent')}
  catch(e){toast('Micro refusé ou indisponible')}}
function voiceStop(){VOICE.on=false;try{VOICE.proc.disconnect();VOICE.src.disconnect();VOICE.stream.getTracks().forEach(t=>t.stop())}catch(e){}updMic()}
function updMic(){const b=$('bMic');if(!b)return;b.classList.toggle('on',VOICE.on);b.textContent=VOICE.on?(VOICE.open?'🎙️':'🔇'):'🎤';b.title=VOICE.on?'Micro actif (V : parler, clic : couper)':'Chat vocal de proximité'}
const MU=(()=>{const enc=new Uint8Array(65536),dec=new Float32Array(256);for(let i=0;i<256;i++){let u=~i&255,s=u&128,e=(u>>4)&7,m=u&15,x=((m<<3)+132)<<e;x-=132;dec[i]=(s?-x:x)/32768}
  return{enc(f){let v=Math.max(-1,Math.min(1,f))*32635|0,s=v<0?128:0;if(v<0)v=-v;v+=132;let e=7;for(let k=16384;e>0&&!(v&k);k>>=1)e--;const m=(v>>(e+3))&15;return~(s|(e<<4)|m)&255},dec}})();
function voiceSend(chunk){const u=new Uint8Array(chunk.length);for(let i=0;i<chunk.length;i++)u[i]=MU.enc(chunk[i]);let s='';for(let i=0;i<u.length;i++)s+=String.fromCharCode(u[i]);MP.room.emit('v',{s:++VOICE.seq,a:btoa(s)}).catch(()=>{})}
function voiceListen(){if(!MP.room||VOICE.listening===MP.room)return;VOICE.listening=MP.room;MP.room.on('v',msg=>{if(msg.isMe||!msg.data?.a)return;const c=MP.remote.get(msg.peer);if(!c)return;voicePlay(c,msg.data.a)})}
function voicePlay(c,b64){audioInit();const C=AU.ctx;if(!C)return;let sp=VOICE.spk.get(c);if(!sp){const g=C.createGain(),pan=C.createStereoPanner();g.connect(pan);pan.connect(AU.master);sp={g,pan,t:0};VOICE.spk.set(c,sp)}
  const raw=atob(b64),n=raw.length,buf=C.createBuffer(1,n,VOICE.rate),d=buf.getChannelData(0);for(let i=0;i<n;i++)d[i]=MU.dec[raw.charCodeAt(i)];
  const s=C.createBufferSource();s.buffer=buf;s.connect(sp.g);const now=C.currentTime;if(sp.t<now+.05)sp.t=now+.12;s.start(sp.t);sp.t+=buf.duration;c.talkT=.4;
  if(!c.talkShown||c.talkShown<performance.now()-1800){c.talkShown=performance.now();react(c,'🔊')}}
function voiceStep(dt){if(!VOICE.spk.size||!pl)return;const f=[Math.sin(cam.yaw+Math.PI),0,Math.cos(cam.yaw+Math.PI)],r=[f[2],0,-f[0]];
  for(const[c,sp]of VOICE.spk){if(c.left){VOICE.spk.delete(c);continue}const d=V.sub(c.pos,pl.pos),L=V.len(d);const vol=clamp(1-L/35,0,1);sp.g.gain.setTargetAtTime(vol*vol*1.4*(SET.vol/100),AU.ctx.currentTime,.08);
    sp.pan.pan.setTargetAtTime(L>.1?clamp(V.dot(V.mul(d,1/L),r),-1,1)*.8:0,AU.ctx.currentTime,.08)}}
addEventListener('keydown',e=>{if(e.code==='KeyV'&&MODE==='game'&&VOICE.on&&!/INPUT|TEXTAREA/.test(e.target.tagName)){VOICE.ptt=true;VOICE.open=false;updMic()}});
addEventListener('keyup',e=>{if(e.code==='KeyV')VOICE.ptt=false});

/* ---------- onglet « Amis » dans le menu en jeu ---------- */
function gFriendsTab(B){frLists();const fl=ACC.friends.map(f=>({f,st:friendState(f)})).sort((a,b)=>b.st.on-a.st.on);const on=fl.filter(x=>x.st.on).length;
  B.append(el('h3',{text:`Mes amis · ${on} en ligne sur ${fl.length}`}));if(!Cloud.online())B.append(el('div',{class:'note',text:'Les amis fonctionnent en ligne (version partagée ou serveur Cubik).'}));
  if(!fl.length)B.append(el('div',{class:'note',text:'Pas encore d\'amis : ajoute les joueurs de ce serveur depuis l\'onglet Joueurs.'}));
  for(const{f,st}of fl){const img=el('img',{class:'ava',alt:''});img.src=headThumb(expandAv(st.p?.presence?.av));const here=st.g===MP.game&&st.s===MP.server;
    B.append(el('div',{class:'prow'},img,el('div',{class:'nm'},filterText(f.n),el('small',{text:(st.on?'🟢 ':'⚫ ')+(here?'Sur ton serveur':st.txt)})),
      st.on&&!here?el('button',{class:'btn sm gold',text:'📨 Inviter',onclick:()=>inviteFriend(f)}):null,st.g&&!here?el('button',{class:'btn sm green',text:'Rejoindre',onclick:()=>{toggleGMenu(false);joinFriend(f)}}):null,
      el('button',{class:'btn sm',text:'💬',onclick:()=>{toggleGMenu(false);openDm(f)}})))}
  const inc=incomingRequests();if(inc.length){B.append(el('h3',{text:`Demandes reçues (${inc.length})`}));for(const p of inc)B.append(el('div',{class:'prow'},el('div',{class:'nm'},filterText(String(p.presence.n))),el('button',{class:'btn sm green',text:'Accepter',onclick:()=>{addFriend(p.presence.id,String(p.presence.n));renderGMenu()}})))}}
