"use strict";
/* ============================================================================
   AVATAR 2.0 : morphologies, proportions (taille, carrure, tête), hitbox qui
   suit le modèle, couleur de peau libre, tenues enregistrées, aléatoire,
   recherche dans l'inventaire.
   ============================================================================ */
const BODY_PRESETS={classique:{n:'Classique',ic:'🧍',h:1,w:1,hd:1},fin:{n:'Fin',ic:'🕴️',h:1.04,w:.86,hd:.96},costaud:{n:'Costaud',ic:'🏋️',h:1.02,w:1.2,hd:1},mini:{n:'Mini',ic:'🧒',h:.82,w:.94,hd:1.16},grand:{n:'Grand',ic:'🦒',h:1.13,w:.98,hd:.97},cartoon:{n:'Cartoon',ic:'🤪',h:.9,w:1.04,hd:1.32}};
function bodyOf(av){const b=av&&av.body;if(!b)return BODY_PRESETS.classique;const P=BODY_PRESETS[b.t]||BODY_PRESETS.classique;const cl=(v,a,z,d)=>typeof v==='number'&&isFinite(v)?Math.min(z,Math.max(a,v)):d;return{h:cl(b.h,.8,1.18,P.h),w:cl(b.w,.82,1.25,P.w),hd:cl(b.hd,.85,1.35,P.hd)}}
function bodyHitbox(c){const b=bodyOf(c.av),cr=c.crouch&&!c.swimming&&!c.climb?.7:1,k=b.h+'|'+b.w+'|'+b.hd+'|'+cr;if(c._bk===k)return;c._bk=k;
  const legT=1*b.h*cr,torT=2.02*b.h*cr,headT=torT+.62*b.hd*(cr<1?.92:1);c.hb=[[0,legT,.47*b.w,.25*b.w],[legT,torT,.96*b.w,.26*b.w],[torT,headT,.35*b.hd,.35*b.hd]];c.H=headT;c.bodyS=b}
function charDraws(c,L,TR,time){if(c.dead||c.left||c.hidden)return;bodyHitbox(c);const b=c.bodyS,a=c.a,p=c.pos,av=c.av,tx=avatarTex(av);
  const fl=(a.flip||0)+(a.pitch||0);const piv=1.3*b.h;
  const root0=fl?M.chain(M.T(p[0],p[1]+a.bob,p[2]),M.RY(c.yaw+a.twist),M.RX(a.lean),M.T(0,piv,0),M.RX(fl),M.T(0,-piv,0)):M.chain(M.T(p[0],p[1]+a.bob,p[2]),M.RY(c.yaw+a.twist),M.RX(a.lean));
  const root=M.mul(root0,M.S(b.w,b.h,b.w));const D=(mesh,m,tex)=>L.push({mesh,m,mode:0,tex,rim:.3,shin:30});
  const torso=M.mul(root,M.T(0,1.5,0)),head=M.chain(root,M.T(0,2.0,0),M.RX(a.head),M.RY(a.headY||0),M.S(b.hd/b.w,b.hd/b.h,b.hd/b.w),M.T(0,.33,0));
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

/* ---------- éditeur d'avatar ---------- */
let avQ='';
const SKIN_PAL=['#ffe9d6','#ffe0c4','#f6cfa9','#f3c9a0','#e8b48a','#e0ac7e','#d29a6a','#c68642','#a0673c','#8d5524','#6e4424','#5e3a1f','#3d2614','#ffd23f','#7fd1ff','#9be37a','#c9a7ff','#ff9db5','#d9dde3','#2b2d33'];
function pgAvatar(C){const stage=el('div',{class:'stage'},el('div',{class:'stagehint',text:'Glisse pour tourner'}));const panel=el('div',{class:'avpanel'});C.append(el('div',{class:'avwrap'},stage,panel));
  SHOW.el=stage;SHOW.char=makeChar({av:ACC.avatar,isPlayer:false});SHOW.char.pos=[0,0,0];SHOW.char.bubbles=[];ACC.outfits=ACC.outfits||[];
  const cats=[['corps','Corps','🧬'],['tenues','Tenues','👔'],...CATS];const tabs=el('div',{class:'chips scroll'}),tools=el('div',{class:'avtools'}),grid=el('div',{class:'igrid'});
  const draw=()=>{tabs.innerHTML='';for(const[id,l,ic]of cats)tabs.append(el('button',{class:'chip'+(avCat===id?' on':''),text:ic+' '+l,onclick:()=>{avCat=id;avQ='';SFX.click();draw()}}));grid.innerHTML='';tools.innerHTML='';grid.className='igrid';
    if(avCat==='corps'){grid.className='avbody';const av=ACC.avatar,b=bodyOf(av);
      grid.append(el('h3',{text:'Teint'}));const sk=el('div',{class:'skins'});for(const s of SKIN_PAL)sk.append(el('button',{class:'skin'+(av.skin===s?' on':''),style:`background:${s}`,'aria-label':s,onclick:()=>{av.skin=s;avChanged();draw()}}));
      const ci=el('input',{type:'color',value:av.skin,class:'skinpick'});ci.oninput=()=>{av.skin=ci.value;avChanged()};sk.append(ci);grid.append(sk);
      grid.append(el('h3',{text:'Morphologie'}));const pg=el('div',{class:'bodyp'});for(const[k,P]of Object.entries(BODY_PRESETS))pg.append(el('button',{class:'bodyc'+((av.body?.t||'classique')===k?' on':''),onclick:()=>{av.body={t:k,h:P.h,w:P.w,hd:P.hd};avChanged();draw()}},el('span',{text:P.ic}),el('b',{text:P.n})));grid.append(pg);
      grid.append(el('h3',{text:'Proportions'}));const sl=(lab,key,mn,mx)=>{const r=el('input',{type:'range',min:mn*100,max:mx*100,value:Math.round(b[key]*100)});const v=el('span',{class:'slv',text:Math.round(b[key]*100)+' %'});
        r.oninput=()=>{av.body={...(av.body||{t:'classique'}),...bodyOf(av),[key]:r.value/100};v.textContent=r.value+' %';SHOW.char.av=av;SHOW.char._bk=null};r.onchange=()=>avChanged();return el('label',{class:'slrow'},el('span',{text:lab}),r,v)};
      grid.append(sl('📏 Taille','h',.8,1.18),sl('↔️ Carrure','w',.82,1.25),sl('🙂 Tête','hd',.85,1.35));
      grid.append(el('div',{class:'note',text:'La hitbox suit exactement ton modèle : un avatar mini passe dans des trous plus petits, un grand saute de plus haut… à toi de choisir !'}));
      grid.append(el('div',{class:'ibtns'},el('button',{class:'btn',text:'🎲 Avatar aléatoire',onclick:()=>{avRandom();draw()}}),el('button',{class:'btn',text:'↺ Réinitialiser le corps',onclick:()=>{delete av.body;avChanged();draw()}})));return}
    if(avCat==='tenues'){grid.className='outfits';grid.append(el('button',{class:'icard more',onclick:()=>{if(ACC.outfits.length>=12)return toast('12 tenues maximum');ACC.outfits.unshift({n:'Tenue '+(ACC.outfits.length+1),av:JSON.parse(JSON.stringify(ACC.avatar))});markDirty();draw()}},el('div',{class:'ith none',text:'💾'}),el('div',{class:'iname',text:'Enregistrer ma tenue'})));
      ACC.outfits.forEach((o,i)=>{const im=el('img',{class:'ith',alt:''});im.src=renderThumb(o.av,'full');grid.append(el('div',{class:'icard'},im,el('div',{class:'iname',text:o.n}),el('div',{class:'ibtns'},el('button',{class:'btn sm green',text:'Porter',onclick:()=>{const keep={...o.av};for(const k of AV_KEYS)if(keep[k]&&k!=='skin'&&!ACC.owned.includes(keep[k]))keep[k]=null;Object.assign(ACC.avatar,keep);if(!ACC.avatar.haut)ACC.avatar.haut=DEFAULT_AV.haut;if(!ACC.avatar.bas)ACC.avatar.bas=DEFAULT_AV.bas;if(!ACC.avatar.visage)ACC.avatar.visage=DEFAULT_AV.visage;avChanged();toast('👔 '+o.n)}}),el('button',{class:'btn sm',text:'🗑',onclick:()=>{ACC.outfits.splice(i,1);markDirty();draw()}}))))});return}
    if(avCat==='emote'){for(const it of CATALOG.filter(i=>i.cat==='emote')){const o=ACC.owned.includes(it.id);grid.append(el('button',{class:'icard'+(o?'':' lock'),onclick:()=>{if(!o){go('shop');return}const c=SHOW.char;c.emote=null;c.dance=false;if(it.emote==='danse')c.dance=true;else if(it.emote==='salut')c.wave=1.6;else if(it.emote==='applaudir')c.clap=2;else if(it.emote==='pointe')c.point=2;else c.emote=it.emote;clearTimeout(c.et);c.et=setTimeout(()=>{c.emote=null;c.dance=false},3500)}},el('div',{class:'ith emo',text:'💃'}),el('div',{class:'iname',text:it.name}),el('div',{class:'iprice',text:o?'▶ Essayer':'🔒 Boutique'})))}return}
    const q=el('input',{type:'search',placeholder:'🔍 Rechercher…',value:avQ,class:'avsearch'});q.oninput=()=>{avQ=q.value;fill()};q.onkeydown=e=>e.stopPropagation();tools.append(q);
    const slotOpt=!['haut','bas','visage'].includes(avCat);
    const fill=()=>{grid.innerHTML='';const own=CATALOG.concat(Object.values(IT).filter(i=>i.ugc&&!i.foreign&&!CATALOG.includes(i))).filter(i=>i.cat===avCat&&ACC.owned.includes(i.id)&&(!avQ||i.name.toLowerCase().includes(avQ.toLowerCase())));
      if(slotOpt)grid.append(el('button',{class:'icard'+(!ACC.avatar[avCat]?' on':''),onclick:()=>{ACC.avatar[avCat]=null;avChanged();draw()}},el('div',{class:'ith none',text:'∅'}),el('div',{class:'iname',text:'Aucun'})));
      for(const it of own){const c=itemCard(it,true);if(ACC.avatar[avCat]===it.id)c.classList.add('on');c.onclick=()=>{SFX.click();ACC.avatar[avCat]=slotOpt&&ACC.avatar[avCat]===it.id?null:it.id;avChanged();fill()};grid.append(c)}
      grid.append(el('button',{class:'icard more',onclick:()=>{shopCat=avCat;go('shop')}},el('div',{class:'ith none',text:'+'}),el('div',{class:'iname',text:'Boutique'})));queueThumbs(grid)};fill()};
  panel.append(tabs,tools,grid);draw()}
function avRandom(){const av=ACC.avatar;av.skin=pick(SKIN_PAL.slice(0,13));const ks=Object.keys(BODY_PRESETS),k=pick(ks),P=BODY_PRESETS[k];av.body={t:k,h:P.h,w:P.w,hd:P.hd};
  for(const[cat]of CATS){if(cat==='emote')continue;const own=CATALOG.filter(i=>i.cat===cat&&ACC.owned.includes(i.id));if(['haut','bas','visage'].includes(cat)){if(own.length)av[cat]=pick(own).id}else av[cat]=own.length&&Math.random()<.55?pick(own).id:null}avChanged();SFX.pop?.()}
(()=>{const st=document.createElement('style');st.textContent=`.avtools{margin:8px 0}.avsearch{width:100%;padding:10px 14px;border-radius:12px;border:1px solid var(--bd);background:#0003;color:inherit}
.avbody h3{margin:16px 0 8px;font-size:14px;opacity:.8;text-transform:uppercase;letter-spacing:.06em}.skinpick{width:54px;height:54px;border-radius:50%;border:3px dashed #fff6;padding:0;background:none}
.bodyp{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.bodyc{display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px 6px;border-radius:14px;border:2px solid var(--bd);background:#ffffff08;color:inherit}.bodyc span{font-size:28px}.bodyc.on{border-color:var(--green);background:#2fbf7122}
.slrow{display:grid;grid-template-columns:110px 1fr 54px;align-items:center;gap:10px;margin:8px 0}.slrow input{width:100%}.slv{text-align:right;font-weight:700;opacity:.8}
.outfits{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px}.outfits .ibtns{display:flex;gap:4px;justify-content:center;padding:6px}`;document.head.appendChild(st)})();
