"use strict";
/* ============================================================================
   CHAT 2.0 : onglets (Tout / Joueurs / Système), heure des messages,
   mentions @pseudo (surlignées + son), historique ↑/↓, messages rapides
   traduits dans la langue de chaque joueur, commandes (/aide, /w, /me,
   /des, /muet, /clear, /e), chuchotements privés en jeu, bouton s'accroupir
   sur mobile.
   ============================================================================ */
const QUICK=[['Salut !','Hi!','¡Hola!','Hallo!','Oi!','Ciao!'],['Suis-moi !','Follow me!','¡Sígueme!','Folge mir!','Me siga!','Seguimi!'],['Attention, derrière toi !','Watch out, behind you!','¡Cuidado, detrás de ti!','Achtung, hinter dir!','Cuidado, atrás de você!','Attento, dietro di te!'],
  ['Au secours !','Help!','¡Socorro!','Hilfe!','Socorro!','Aiuto!'],['Bien joué !','Well played!','¡Bien jugado!','Gut gespielt!','Mandou bem!','Ben fatto!'],['Merci !','Thanks!','¡Gracias!','Danke!','Valeu!','Grazie!'],['Cours !','Run!','¡Corre!','Lauf!','Corre!','Corri!'],
  ['J\'ai trouvé un objet !','I found an item!','¡Encontré un objeto!','Ich habe etwas gefunden!','Achei um item!','Ho trovato un oggetto!'],['On se regroupe ici','Let\'s regroup here','Reagrupémonos aquí','Sammeln wir uns hier','Vamos nos reagrupar aqui','Raggruppiamoci qui'],['Cache-toi !','Hide!','¡Escóndete!','Versteck dich!','Se esconde!','Nasconditi!'],['GG !','GG!','¡GG!','GG!','GG!','GG!'],['Ami ?','Friends?','¿Amigos?','Freunde?','Amigos?','Amici?']];
const CH2={tab:'all',hist:[],hi:-1};
const myName=()=>(ACC?.pseudo||'').toLowerCase();
function quickText(i){const q=QUICK[i];if(!q)return'';const k=Math.max(0,(typeof LK!=='undefined'?LK:['fr']).indexOf(typeof LANG!=='undefined'?LANG:'fr'));return q[k]||q[0]}
(()=>{const st=document.createElement('style');st.textContent=`#chatTabs{display:flex;gap:4px;padding:6px 8px 0}#chatTabs button{font-size:11px;font-weight:800;padding:3px 9px;border-radius:999px;background:#0006;color:#fff;border:1px solid #ffffff22}#chatTabs button.on{background:#3d7eff}
#chatWin.faded #chatTabs{opacity:0}#chatlog .ts{opacity:.55;font-size:11px;margin-right:4px}#chatlog .m.ment{background:#ffd23f33;border-left:3px solid #ffd23f;padding-left:4px;border-radius:4px}#chatlog .m.wh{color:#e0b3ff}#chatlog .m.me{font-style:italic;color:#ffd9a0}
#chatlog.f-pl .m.sys{display:none}#chatlog.f-sys .m:not(.sys){display:none}#quickBtn{margin-left:4px;border-radius:10px;background:#0008;border:1px solid #ffffff22;color:#fff;font-size:16px;padding:0 8px}
#quickPick{position:absolute;bottom:100%;left:0;display:none;grid-template-columns:repeat(2,1fr);gap:4px;background:#11141bf0;padding:8px;border-radius:14px;border:1px solid #ffffff22;width:min(320px,90vw);z-index:40}#quickPick.open{display:grid}#quickPick button{padding:8px;border-radius:10px;background:#ffffff12;color:#fff;border:0;font-weight:700;text-align:left;font-size:13px}
#crouchBtn{position:fixed;right:calc(18px + env(safe-area-inset-right));bottom:calc(150px + env(safe-area-inset-bottom));width:58px;height:58px;border-radius:50%;background:#0008;border:2px solid #ffffff44;color:#fff;font-size:26px;z-index:8;display:none}body.touch.ingame #crouchBtn{display:block}#crouchBtn.on{background:#3d7effcc}`;document.head.appendChild(st)})();
function chat2Init(){const W=$('chatWin'),log=$('chatlog'),F=$('chatForm'),I=$('chatIn');if(!W||W.dataset.c2)return;W.dataset.c2=1;
  const tabs=el('div',{id:'chatTabs'});for(const[k,l]of[['all','Tout'],['pl','Joueurs'],['sys','Système']])tabs.append(el('button',{class:k===CH2.tab?'on':'',text:l,onclick:e=>{e.preventDefault();CH2.tab=k;log.classList.toggle('f-pl',k==='pl');log.classList.toggle('f-sys',k==='sys');tabs.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===e.target))}}));W.prepend(tabs);
  const qp=el('div',{id:'quickPick'});const qb=el('button',{type:'button',id:'quickBtn',title:'Messages rapides (traduits pour chaque joueur)',text:'⚡'});F.style.position='relative';F.append(qb,qp);
  const fillQ=()=>{qp.innerHTML='';QUICK.forEach((q,i)=>qp.append(el('button',{type:'button',text:quickText(i),onclick:e=>{e.preventDefault();qp.classList.remove('open');say(pl,`⟦q:${i}⟧`);closeChat()}})))};
  qb.onpointerdown=e=>e.preventDefault();qb.onclick=e=>{e.preventDefault();e.stopPropagation();fillQ();qp.classList.toggle('open')};
  I.addEventListener('keydown',e=>{if(e.key==='ArrowUp'&&CH2.hist.length){CH2.hi=Math.min(CH2.hist.length-1,CH2.hi+1);I.value=CH2.hist[CH2.hist.length-1-CH2.hi];e.preventDefault()}else if(e.key==='ArrowDown'){CH2.hi=Math.max(-1,CH2.hi-1);I.value=CH2.hi<0?'':CH2.hist[CH2.hist.length-1-CH2.hi];e.preventDefault()}else if(e.key==='Tab'){const m=/@(\w*)$/.exec(I.value);if(m){const n=[...chars].map(c=>c.name.replace(/^👑 /,'')).find(n=>n.toLowerCase().startsWith(m[1].toLowerCase()));if(n){I.value=I.value.slice(0,-m[1].length)+n+' ';e.preventDefault()}}}});
  const cb=el('button',{id:'crouchBtn',text:'🧎',title:'S\'accroupir'});cb.onpointerdown=e=>{e.preventDefault();e.stopPropagation();window.touchCrouch=!window.touchCrouch;cb.classList.toggle('on',window.touchCrouch)};document.body.append(cb)}
// ---------- affichage enrichi ----------
(()=>{const ll0=logLine;logLine=function(name,col,text,sys){const t=String(text??'');let cls='',shown=t;
    const q=/^\s*⟦q:(\d+)⟧\s*$/.exec(t);if(q)shown=' '+quickText(+q[1]);
    const w=/^\s*⟦w:([^⟧]{1,24})⟧(.*)$/.exec(t);if(w){const to=w[1].toLowerCase(),fromMe=name&&name.replace(/^👑 /,'')===ACC?.pseudo;if(!fromMe&&to!==myName())return;shown=` 🤫 ${fromMe?'→ '+w[1]+' : ':'(privé) '}${w[2]}`;cls='wh'}
    const me=/^\s*⟦me⟧(.*)$/.exec(t);if(me){shown=` * ${name} ${me[1]}`;name='';cls='me'}
    if(!sys&&name&&myName()&&name.replace(/^👑 /,'')!==ACC?.pseudo&&new RegExp('@?'+myName().replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i').test(shown)){cls='ment';SFX.coin?.()}
    ll0(name,col,shown,sys);const d=$('chatlog')?.lastElementChild;if(d){if(cls)d.classList.add(cls);const now=new Date();d.prepend(el('span',{class:'ts',text:`${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`}))}};
  const say0=say;say=function(c,text){let t=String(text??'').trim();if(!t)return;
    if(c===pl&&!t.startsWith('⟦')){CH2.hist.push(t);if(CH2.hist.length>30)CH2.hist.shift();CH2.hi=-1;
      const cmd=/^\/(\w+)\s*(.*)$/.exec(t);if(cmd&&!/^e$/i.test(cmd[1])){const[,k,a]=cmd,K=k.toLowerCase();
        if(['aide','help','?'].includes(K)){sys('Commandes : /w pseudo message (privé) · /me action · /des (lancer un dé) · /muet pseudo · /demuet pseudo · /clear · /e danse · ⚡ messages rapides traduits · @pseudo pour mentionner');return}
        if(K==='clear'){const l=$('chatlog');if(l)l.innerHTML='';return}
        if(K==='me'){if(a)return say(c,`⟦me⟧${a.slice(0,100)}`);return}
        if(['des','dé','roll','de'].includes(K)){const n=1+Math.floor(Math.random()*6);return say(c,`⟦me⟧🎲 lance un dé : ${n}`)}
        if(['w','msg','chuchote','whisper'].includes(K)){const m=/^(\S+)\s+(.+)$/.exec(a);if(!m)return sys('Utilisation : /w pseudo message');return say(c,`⟦w:${m[1].slice(0,24)}⟧${m[2]}`)}
        if(['muet','mute'].includes(K)){if(!a)return sys('Utilisation : /muet pseudo');const n=[...chars].find(x=>x.name.replace(/^👑 /,'').toLowerCase()===a.toLowerCase());if(n){blocked.add(n.name);sys(`🔇 ${n.name} est masqué`)}else sys('Joueur introuvable');return}
        if(['demuet','unmute'].includes(K)){for(const n of[...blocked])if(n.replace(/^👑 /,'').toLowerCase()===a.toLowerCase())blocked.delete(n);sys('🔊 OK');return}
        sys('Commande inconnue · tape /aide');return}}
    const w=/^\s*⟦w:([^⟧]{1,24})⟧/.exec(t);if(w&&c!==pl&&w[1].toLowerCase()!==myName()){return}
    const q=/^\s*⟦q:(\d+)⟧\s*$/.exec(t);if(q&&c.bstack){const r=say0(c,t);const last=c.bubbles?.[c.bubbles.length-1];if(last)last.el.textContent=quickText(+q[1]);return r}
    if(w){const r=say0(c,t);const last=c.bubbles?.[c.bubbles.length-1];if(last)last.el.textContent='🤫 '+t.replace(/^\s*⟦w:[^⟧]*⟧/,'');return r}
    const me=/^\s*⟦me⟧(.*)$/.exec(t);if(me){const r=say0(c,t);const last=c.bubbles?.[c.bubbles.length-1];if(last)last.el.textContent='* '+me[1];return r}
    return say0(c,t)}})();
document.addEventListener('DOMContentLoaded',()=>setTimeout(chat2Init,300));setTimeout(chat2Init,1500);
setInterval(()=>document.body.classList.toggle('ingame',MODE==='game'),500);
