"use strict";
/* ============================================================================
   ÉMOJIS, RÉACTIONS ET EMOTES
   ============================================================================ */
const EMOJI_SETS=[
  ['😀','Visages',['😀','😃','😄','😁','😆','😅','🤣','😂','🙂','😉','😊','😇','🥰','😍','🤩','😘','😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔','🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','😮‍💨','😌','😔','😪','😴','😷','🤒','🤕','🤢','🤮','🥵','🥶','🥴','😵','🤯','🤠','🥳','🥸','😎','🤓','🧐','😕','😟','🙁','😮','😯','😲','😳','🥺','😦','😧','😨','😰','😥','😢','😭','😱','😖','😣','😞','😓','😩','😫','🥱','😤','😡','😠','🤬','😈','👿','💀','☠️','💩','🤡','👹','👺','👻','👽','👾','🤖']],
  ['👍','Gestes',['👋','🤚','✋','🖖','👌','🤌','✌️','🤞','🤟','🤘','🤙','👈','👉','👆','👇','☝️','👍','👎','✊','👊','🤛','🤜','👏','🙌','👐','🤲','🙏','✍️','💪','🦾','🫶','🫡','🤝']],
  ['❤️','Cœurs',['❤️','🧡','💛','💚','💙','💜','🖤','🤍','🤎','💔','❣️','💕','💞','💓','💗','💖','💘','💝','💯','💢','💥','💫','💦','💨','🕳️','💬','💭','💤']],
  ['🎮','Jeux',['🎮','🕹️','🎲','🧩','🏆','🥇','🥈','🥉','🏅','🎯','⚔️','🛡️','🏹','🪓','🔨','⛏️','🧱','🪵','💎','🪙','💰','🔑','🗝️','🧭','🗺️','🏁','🚩','🎁','🎉','🎊','🎈','✨','⭐','🌟','🔥','⚡','❄️','🌈','☀️','🌙','💣','🧨','🚀','🛸','👑','🎩','🕶️']],
  ['🐶','Nature',['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🦆','🦅','🦉','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐢','🐍','🦖','🐙','🦑','🦀','🐠','🐬','🐳','🦈','🌵','🌲','🌳','🌴','🍀','🍁','🍄','🌸','🌻','🌹']],
  ['🍕','Miam',['🍎','🍌','🍉','🍇','🍓','🍒','🍑','🥭','🍍','🥥','🥑','🍔','🍟','🍕','🌭','🥪','🌮','🌯','🍿','🧂','🥚','🍳','🥞','🧇','🥓','🍗','🍖','🍝','🍜','🍣','🍱','🍩','🍪','🎂','🍰','🧁','🍫','🍬','🍭','🍦','☕','🧃','🥤','🧋']]];
const REACTIONS=['😂','😍','😎','🔥','👍','❤️','🎉','😭','😡','🤔','👋','💀','⭐','💯','😱','🥳'];
// raccourcis texte → émoji dans le chat
const EMO_SHORT=[[/(^|\s):\)(?=\s|$)/g,'$1🙂'],[/(^|\s):D(?=\s|$)/g,'$1😄'],[/(^|\s):\((?=\s|$)/g,'$1🙁'],[/(^|\s);\)(?=\s|$)/g,'$1😉'],[/(^|\s):P(?=\s|$)/gi,'$1😛'],[/(^|\s)<3(?=\s|$)/g,'$1❤️'],[/(^|\s):o(?=\s|$)/gi,'$1😮'],[/(^|\s)xD(?=\s|$)/g,'$1😆'],[/:feu:/g,'🔥'],[/:gg:/g,'🏆'],[/:cool:/g,'😎'],[/:mdr:/g,'😂']];
function emojify(t){for(const[re,r]of EMO_SHORT)t=t.replace(re,r);return t}
// grosse réaction au-dessus de la tête
const reacts=[];
function react(c,emo){if(!c||c.dead)return;if(c.isPlayer)MP.sendReact(emo);const e=document.createElement('div');e.className='react';e.textContent=emo;$('floats').appendChild(e);reacts.push({c,el:e,t:2.2});SFX.emoji();}
function updReacts(dt,VP){const w=cv.clientWidth,h=cv.clientHeight;for(let i=reacts.length-1;i>=0;i--){const r=reacts[i];r.t-=dt;if(r.t<=0||r.c.dead){r.el.remove();reacts.splice(i,1);continue}
  const age=2.2-r.t,p=project(VP,V.add(r.c.pos,[0,3.4+age*.5,0]),w,h);if(!p){r.el.style.display='none';continue}r.el.style.display='block';
  const pop=age<.25?.4+age/.25*.8:age<.4?1.2-(age-.25)/.15*.2:1;r.el.style.opacity=Math.min(1,r.t*1.5);r.el.style.transform=`translate(${p[0]}px,${p[1]}px) translate(-50%,-50%) scale(${pop*clamp(14/p[2],.55,1.5)}) rotate(${Math.sin(age*6)*8}deg)`}}
// panneau émojis (chat)
function buildEmojiPicker(target,onPick){const box=el('div',{class:'emopick'});const tabs=el('div',{class:'emotabs'}),grid=el('div',{class:'emogrid'});
  const show=i=>{tabs.querySelectorAll('button').forEach((b,k)=>b.classList.toggle('on',k===i));grid.innerHTML='';for(const e of EMOJI_SETS[i][2])grid.append(el('button',{type:'button',text:e,onclick:ev=>{ev.preventDefault();onPick(e)}}))};
  EMOJI_SETS.forEach(([ic,n],i)=>tabs.append(el('button',{type:'button',title:n,text:ic,onclick:ev=>{ev.preventDefault();show(i)}})));show(0);box.append(tabs,grid);return box}
function initChatEmoji(){const f=$('chatForm');const b=el('button',{type:'button',class:'emobtn',title:'Émojis',text:'😊'});const pk=buildEmojiPicker(null,e=>{const i=$('chatIn');const s=i.selectionStart??i.value.length;i.setRangeText(e,s,i.selectionEnd??s,'end');i.focus()});pk.classList.add('chatpick');
  b.onpointerdown=e=>e.preventDefault();b.onclick=e=>{e.preventDefault();e.stopPropagation();$('emotes').classList.remove('open');pk.classList.toggle('open');$('chatIn').focus()};f.append(b);$('chatWin').append(pk);
  $('chatForm').addEventListener('submit',()=>pk.classList.remove('open'),true)}
// roue des emotes : réactions + emotes
renderEmotes=function(){const box=$('emotes');box.innerHTML='';const rx=el('div',{class:'rxrow'});for(const e of REACTIONS)rx.append(el('button',{class:'rx',text:e,onclick:()=>{react(pl,e);$('emotes').classList.remove('open')}}));
  box.append(el('div',{class:'emh',text:'Réactions'}),rx,el('div',{class:'emh',text:'Emotes · /e nom'}));const g=el('div',{class:'emgrid'});
  for(const it of CATALOG.filter(i=>i.cat==='emote')){const own=ownsEmote(it.emote);g.append(el('button',{class:'em'+(own?'':' lock'),disabled:own?null:'',text:(own?EMOTE_IC[it.emote]||'💃':'🔒')+' '+it.name,
    onclick:()=>{if(it.emote==='danse'){pl.emote=null;pl.dance=!pl.dance}else emoteCmd(pl,it.emote);$('emotes').classList.remove('open')}}))}box.append(g)};
const EMOTE_IC={salut:'👋',danse:'🕺',applaudir:'👏',pointe:'👉',robot:'🤖',disco:'🪩',toupie:'🌀',flexion:'💪',dab:'😎',rire:'😂',pleurer:'😭',hourra:'🙌',courbette:'🙇',assis:'🪑',salto:'🤸',zombie:'🧟',guitare:'🎸',moonwalk:'🕴️',meditation:'🧘',muscles:'💪'};

/* ============================================================================
   FILTRE DE TEXTE (comme sur Roblox : les gros mots deviennent ####)
   ============================================================================ */
const BAD_WORDS=['merde','merdique','putain','pute','putes','connard','connards','connasse','salope','salopes','salaud','encule','enculer','enculé','batard','batards','nique','niquer','niquez','nik','ntm','fdp','tg','pd','pede','tapette','couille','couilles','bite','bites','chier','enfoire','enfoiree','abruti','debile','gogol','mongol','trouduc','pouffiasse','petasse','grognasse','zizi','teub','chatte','branleur','branler','foutre','bordel','emmerde','emmerder','cretin','negre','bougnoule','youpin','gouine',
  'fuck','fucking','fucker','shit','bitch','bitches','asshole','ass','dick','dicks','cunt','bastard','slut','whore','wtf','stfu','porn','sex','sexe','nazi','hitler','retard','retarded','kys'];
const BAD_ROOTS=['fuck','encul','salop','connar','nigg','fagg','putai','pornog','niquetamer','tagueule','fdp','ntm'];
const BAD_ROOTS_N=BAD_ROOTS.map(r=>r.replace(/(.)\1+/g,'$1'));
const BAD_SET=new Set(BAD_WORDS.map(w=>w.normalize('NFD').replace(/[̀-ͯ]/g,'')));
const LEET={'0':'o','1':'i','3':'e','4':'a','5':'s','7':'t','@':'a','$':'s','€':'e','!':'i','|':'i'};
function normWord(w){return w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[013457@$€!|]/g,c=>LEET[c]).replace(/[^a-z]/g,'').replace(/(.)\1+/g,'$1')}
function isBad(w){const n=normWord(w);if(!n)return false;if(BAD_SET.has(n)||BAD_SET.has(w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z]/g,'')))return true;return n.length>3&&BAD_ROOTS_N.some(r=>n.includes(r))}
function filterText(s){s=String(s??'');if(!s)return s;
  let out=s.replace(/[\p{L}\p{N}@$€!|]+/gu,w=>isBad(w)?'#'.repeat([...w].length):w);
  // mots coupés par des espaces ou des points : « p u t e », « f.d.p »
  out=out.replace(/(?:\b\p{L}[\s.\-_*]){2,}\p{L}\b/gu,m=>isBad(m.replace(/[\s.\-_*]/g,''))?'#'.repeat(m.length):m);
  // expressions
  out=out.replace(/ta\s*g+u+e+u+l+e/gi,m=>'#'.repeat(m.length)).replace(/nique\s*ta\s*m[eè]re/gi,m=>'#'.repeat(m.length));
  return out}
const textIsFiltered=s=>filterText(s)!==String(s??'');
