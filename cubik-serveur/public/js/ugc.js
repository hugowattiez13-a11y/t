"use strict";
/* ============================================================================
   CRÉER : jeux du Studio + vêtements / visages UGC
   ============================================================================ */
/* ---------- documents de l'utilisateur (jeux, dessins) ---------- */
/* ---------- objets UGC ---------- */
const UGC_KIND={haut:['👕','T-shirt / haut'],bas:['👖','Pantalon / bas'],visage:['🙂','Visage']};
function ugcItemId(m){return m.cat==='visage'?'ugcf_'+m.id:'ugc_'+m.id}
function ugcRegister(m){const id=ugcItemId(m);const base={cat:m.cat,id,name:m.name,price:0,rarity:'Création',ugc:true,by:ACC?.pseudo};
  if(m.cat==='haut')Object.assign(base,{c:m.c,c2:m.c2,pat:'ugc',sleeve:m.sleeve||'short'});if(m.cat==='bas')Object.assign(base,{c:m.c,c2:m.c2,pat:'ugc',shoes:m.shoes||'#f2f2f2'});
  const old=IT[id];if(old){Object.assign(old,base)}else{CATALOG.push(base);IT[id]=base}if(ACC&&!ACC.owned.includes(id))ACC.owned.push(id);ugcInvalidate(id);return IT[id]}
function ugcSetImages(id,front,back){const load=(k,src)=>{if(!src){delete UGC_IMG[k];return}const im=new Image();im.onload=()=>ugcInvalidate(id);im.src=src;UGC_IMG[k]=im};load(id,front);load(id+'_b',back)}
function ugcInvalidate(id){for(const[k,v]of[...AVTEX_CACHE])if(k.includes(id)){for(const t of Object.values(v))gl.deleteTexture(t);AVTEX_CACHE.delete(k)}for(const k of[...THUMB.cache.keys()])if(k.includes(id))THUMB.cache.delete(k)}
async function ugcLoadAll(){ACC.ugc=ACC.ugc||[];ACC.creations=ACC.creations||[];for(const m of ACC.ugc){ugcRegister(m);Store.getDoc('ugc_'+m.id).then(d=>{if(d)ugcSetImages(ugcItemId(m),d.front,d.back)}).catch(()=>{})}}

/* ---------- éditeur de vêtements ---------- */
const UGC_PAL=['#ffffff','#1f2028','#e5484d','#ff8a3d','#ffd23f','#2fbf71','#39c5bb','#3d8bff','#7a5cff','#ff4fa3','#8d5524','#9aa4b2'];
const STICKERS=['⭐','❤️','🔥','⚡','💀','👑','🌈','🎮','🐱','🐶','🦄','🍕','🌸','💎','🚀','😎','😂','👻','🎵','☀️','🌙','🍀','🏆','💯'];
let UE=null;
function openUgcEditor(meta){const isNew=!meta;meta=meta?JSON.parse(JSON.stringify(meta)):null;
  const pick=k=>{const m={id:Date.now().toString(36)+Math.random().toString(36).slice(2,5),cat:k,name:k==='haut'?'Mon T-shirt':k==='bas'?'Mon pantalon':'Mon visage',c:k==='bas'?'#2c4a7a':'#ffffff',c2:'#1f2028',sleeve:'short',shoes:'#f2f2f2'};build(m,null)};
  if(isNew){const m=modal(el('div',{class:'cf'},el('h2',{text:'Que veux-tu créer ?'}),el('div',{class:'ugcpick'},...Object.entries(UGC_KIND).map(([k,[ic,n]])=>el('button',{class:'ugcp',onclick:()=>{m.remove();pick(k)}},el('span',{text:ic}),n)))));return}
  Store.getDoc('ugc_'+meta.id).then(d=>build(meta,d)).catch(()=>build(meta,null));
  function build(m,imgs){const face=m.cat==='visage',W=face?320:256,Hc=face?220:256;
    const root=el('div',{id:'ugcEd'});document.body.append(root);document.body.classList.add('ugcopen');
    const mk=()=>{const c=document.createElement('canvas');c.width=W;c.height=Hc;return c};
    const sides={front:mk(),back:mk()};const load=(c,src)=>{if(!src)return;const im=new Image();im.onload=()=>{c.getContext('2d').drawImage(im,0,0,W,Hc);refresh()};im.src=src};if(imgs){load(sides.front,imgs.front);load(sides.back,imgs.back)}
    UE={m,side:'front',tool:'brush',col:'#1f2028',size:8,sticker:'⭐',text:'CUBIK',hist:[],redo:[],sides,W,Hc,face};
    const stage=el('div',{class:'ue-stage'}),guide=el('canvas',{class:'ue-guide'});guide.width=W;guide.height=Hc;
    const view=el('div',{class:'ue-canvas'+(face?' face':'')},guide);view.append(sides.front,sides.back);stage.append(view);
    const tools=el('div',{class:'ue-tools'}),props=el('div',{class:'ue-props'});
    const tb=(id,ic,label)=>el('button',{class:'ue-t'+(UE.tool===id?' on':''),title:label,onclick:()=>{UE.tool=id;drawTools()}},el('span',{text:ic}),el('small',{text:label}));
    const prev=el('div',{class:'ue-prev'}),pf=el('img',{alt:''}),pb=el('img',{alt:''});prev.append(pf,pb);
    function drawTools(){tools.innerHTML='';tools.append(tb('brush','🖌️','Pinceau'),tb('erase','🧽','Gomme'),tb('fill','🪣','Remplir'),tb('line','📏','Ligne'),tb('rect','⬛','Rectangle'),tb('circle','⚫','Cercle'),tb('text','🔤','Texte'),tb('sticker','⭐','Autocollant'),tb('pick','💧','Pipette'));
      const pal=el('div',{class:'ue-pal'});for(const c of UGC_PAL)pal.append(el('button',{class:'csw'+(UE.col===c?' on':''),style:`background:${c}`,onclick:()=>{UE.col=c;drawTools()}}));const ci=el('input',{type:'color',value:UE.col});ci.oninput=()=>{UE.col=ci.value};pal.append(ci);
      const sz=el('input',{type:'range',min:2,max:60,value:UE.size});sz.oninput=()=>UE.size=+sz.value;tools.append(el('div',{class:'ue-lb',text:'Couleur'}),pal,el('div',{class:'ue-lb',text:'Taille'}),sz);
      if(UE.tool==='text'){const ti=el('input',{type:'text',value:UE.text,maxlength:'20'});ti.oninput=()=>UE.text=ti.value;ti.onkeydown=e=>e.stopPropagation();tools.append(el('div',{class:'ue-lb',text:'Texte (clique pour placer)'}),ti)}
      if(UE.tool==='sticker'){const g=el('div',{class:'ue-stk'});for(const s of STICKERS)g.append(el('button',{class:UE.sticker===s?'on':'',text:s,onclick:()=>{UE.sticker=s;drawTools()}}));tools.append(el('div',{class:'ue-lb',text:'Autocollants'}),g)}
      tools.append(el('div',{class:'ue-row'},el('button',{class:'btn sm',text:'↶',title:'Annuler (Ctrl+Z)',onclick:undo}),el('button',{class:'btn sm',text:'↷',onclick:redo}),el('button',{class:'btn sm red',text:'Effacer',onclick:()=>{push();ctx().clearRect(0,0,W,Hc);refresh()}})))}
    function drawGuide(){const x=guide.getContext('2d');x.clearRect(0,0,W,Hc);
      if(face){x.fillStyle=ACC.avatar.skin||'#f3c9a0';x.fillRect(0,0,W,Hc);x.strokeStyle='rgba(0,0,0,.12)';x.setLineDash([6,6]);x.lineWidth=2;for(const s of[-1,1]){x.beginPath();x.ellipse(W/2+s*46*1.15,Hc/2-14,24,30,0,0,7);x.stroke()}x.beginPath();x.ellipse(W/2,Hc/2+60,50,18,0,0,7);x.stroke();return}
      x.fillStyle=m.c;x.fillRect(0,0,W,Hc);x.strokeStyle='rgba(0,0,0,.18)';x.setLineDash([6,6]);x.lineWidth=2;
      if(m.cat==='haut'&&UE.side==='front'){x.beginPath();x.ellipse(W/2,0,48,30,0,0,Math.PI);x.stroke()}if(m.cat==='bas'){x.fillStyle=m.shoes;x.fillRect(0,Hc*.78,W,Hc*.22);x.beginPath();x.moveTo(0,Hc*.78);x.lineTo(W,Hc*.78);x.stroke()}}
    const ctx=()=>sides[UE.side].getContext('2d');
    function showSide(){sides.front.style.display=UE.side==='front'?'block':'none';sides.back.style.display=UE.side==='back'?'block':'none';drawGuide()}
    function push(){UE.hist.push({side:UE.side,d:ctx().getImageData(0,0,W,Hc)});if(UE.hist.length>30)UE.hist.shift();UE.redo=[]}
    function undo(){const h=UE.hist.pop();if(!h)return;const c=sides[h.side].getContext('2d');UE.redo.push({side:h.side,d:c.getImageData(0,0,W,Hc)});c.putImageData(h.d,0,0);UE.side=h.side;showSide();refresh()}
    function redo(){const h=UE.redo.pop();if(!h)return;const c=sides[h.side].getContext('2d');UE.hist.push({side:h.side,d:c.getImageData(0,0,W,Hc)});c.putImageData(h.d,0,0);refresh()}
    let rt=null;function refresh(){clearTimeout(rt);rt=setTimeout(()=>{const id=m.cat==='visage'?'ugcf___prev':'__ugcprev'+m.cat;ugcRegisterPreview(id,m);ugcSetPrevImages(id,sides);
      const av={...ACC.avatar,[m.cat]:id};pf.src=renderThumb(av,m.cat==='visage'?'head':m.cat==='bas'?'legs':'torso');pb.src=face?renderThumb(av,'full'):renderThumb(av,'back')},120)}
    // peinture
    let drag=null;const pos=e=>{const r=sides[UE.side].getBoundingClientRect();return[(e.clientX-r.left)/r.width*W,(e.clientY-r.top)/r.height*Hc]};
    view.addEventListener('pointerdown',e=>{e.preventDefault();view.setPointerCapture(e.pointerId);const p=pos(e),c=ctx();
      if(UE.tool==='pick'){const d=c.getImageData(p[0]|0,p[1]|0,1,1).data;UE.col=d[3]>10?'#'+[d[0],d[1],d[2]].map(v=>v.toString(16).padStart(2,'0')).join(''):(face?ACC.avatar.skin:m.c);UE.tool='brush';drawTools();return}
      push();if(UE.tool==='fill'){flood(c,p[0]|0,p[1]|0,UE.col);refresh();SFX.paint();return}
      if(UE.tool==='text'){c.fillStyle=UE.col;c.font=`900 ${UE.size*2+10}px system-ui`;c.textAlign='center';c.textBaseline='middle';c.fillText(UE.text,p[0],p[1]);refresh();SFX.paint();return}
      if(UE.tool==='sticker'){c.font=`${UE.size*2+16}px system-ui`;c.textAlign='center';c.textBaseline='middle';c.fillText(UE.sticker,p[0],p[1]);refresh();SFX.place();return}
      drag={p0:p,last:p,snap:c.getImageData(0,0,W,Hc)};if(UE.tool==='brush'||UE.tool==='erase')stroke(c,p,p)});
    view.addEventListener('pointermove',e=>{if(!drag)return;const p=pos(e),c=ctx();
      if(UE.tool==='brush'||UE.tool==='erase'){stroke(c,drag.last,p);drag.last=p;if(Math.random()<.2)SFX.paint();return}
      c.putImageData(drag.snap,0,0);shape(c,drag.p0,p)});
    const end=()=>{if(drag){drag=null;refresh()}};view.addEventListener('pointerup',end);view.addEventListener('pointercancel',end);
    function stroke(c,a,b){c.save();c.globalCompositeOperation=UE.tool==='erase'?'destination-out':'source-over';c.strokeStyle=UE.col;c.lineWidth=UE.size;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0]+.01,b[1]);c.stroke();c.restore()}
    function shape(c,a,b){c.save();c.strokeStyle=c.fillStyle=UE.col;c.lineWidth=UE.size;c.lineCap='round';c.beginPath();
      if(UE.tool==='line'){c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke()}else if(UE.tool==='rect'){c.fillRect(Math.min(a[0],b[0]),Math.min(a[1],b[1]),Math.abs(b[0]-a[0]),Math.abs(b[1]-a[1]))}
      else{c.ellipse((a[0]+b[0])/2,(a[1]+b[1])/2,Math.abs(b[0]-a[0])/2+.5,Math.abs(b[1]-a[1])/2+.5,0,0,7);c.fill()}c.restore()}
    // propriétés
    function drawProps(){props.innerHTML='';const nm=el('input',{type:'text',value:m.name,maxlength:'28'});nm.oninput=()=>m.name=nm.value;nm.onkeydown=e=>e.stopPropagation();
      props.append(el('h3',{text:UGC_KIND[m.cat][0]+' '+UGC_KIND[m.cat][1]}),el('div',{class:'fld'},el('span',{text:'Nom'}),nm));
      if(!face){const c1=el('input',{type:'color',value:m.c});c1.oninput=()=>{m.c=c1.value;drawGuide();refresh()};const c2=el('input',{type:'color',value:m.c2});c2.oninput=()=>{m.c2=c2.value;refresh()};
        props.append(el('div',{class:'fld'},el('span',{text:'Couleur de base · bords'}),el('div',{class:'ue-row'},c1,c2)));
        if(m.cat==='haut'){const s=el('select',{});for(const[v,l]of[['short','Manches courtes'],['long','Manches longues'],['none','Sans manches']])s.append(el('option',{value:v,text:l}));s.value=m.sleeve;s.onchange=()=>{m.sleeve=s.value;refresh()};props.append(el('div',{class:'fld'},el('span',{text:'Manches'}),s))}
        if(m.cat==='bas'){const sh=el('input',{type:'color',value:m.shoes});sh.oninput=()=>{m.shoes=sh.value;drawGuide();refresh()};props.append(el('div',{class:'fld'},el('span',{text:'Chaussures'}),sh))}
        props.append(el('div',{class:'ue-row seg'},el('button',{class:'btn sm'+(UE.side==='front'?' pri':''),text:'Devant',onclick:()=>{UE.side='front';showSide();drawProps()}}),el('button',{class:'btn sm'+(UE.side==='back'?' pri':''),text:'Dos',onclick:()=>{UE.side='back';showSide();drawProps()}}),
          el('button',{class:'btn sm',text:'Copier →',title:'Copier ce côté sur l\'autre',onclick:()=>{const o=UE.side==='front'?'back':'front';sides[o].getContext('2d').clearRect(0,0,W,Hc);sides[o].getContext('2d').drawImage(sides[UE.side],0,0);refresh()}})))}
      props.append(el('div',{class:'ue-lb',text:'Aperçu'}),prev,el('div',{class:'ue-row'},el('button',{class:'btn',text:'Annuler',onclick:close}),el('button',{class:'btn green',text:'💾 Enregistrer et porter',onclick:save})),
        el('p',{class:'note',text:'Ta création est enregistrée avec ton compte et ajoutée à ton inventaire.'}))}
    async function save(){m.name=(m.name||'').trim()||UGC_KIND[m.cat][1];const enc=c=>{const u=c.toDataURL('image/webp',.9);return u.startsWith('data:image/webp')?u:c.toDataURL('image/png')};
      const data={front:enc(sides.front),back:face?null:enc(sides.back)};
      try{await Store.putDoc('ugc_'+m.id,data)}catch(e){toast('Échec : '+(e.message||'enregistrement impossible'));return}
      const i=ACC.ugc.findIndex(x=>x.id===m.id);const meta={id:m.id,cat:m.cat,name:m.name,c:m.c,c2:m.c2,sleeve:m.sleeve,shoes:m.shoes,created:Date.now()};if(i>=0)ACC.ugc[i]=meta;else ACC.ugc.push(meta);
      const it=ugcRegister(meta);ugcSetImages(it.id,data.front,data.back);ACC.avatar[m.cat]=it.id;markDirty();SFX.buy();toast(`« ${m.name} » enregistré et porté ✓`);close();if(PAGE==='create')go('create')}
    function close(){root.remove();document.body.classList.remove('ugcopen');removeEventListener('keydown',keys,true);UE=null}
    const keys=e=>{if((e.ctrlKey||e.metaKey)&&e.key==='z'){e.preventDefault();undo()}if((e.ctrlKey||e.metaKey)&&e.key==='y'){e.preventDefault();redo()}if(e.key==='Escape')close()};addEventListener('keydown',keys,true);
    root.append(el('div',{class:'ue-head'},el('b',{text:'🎨 Atelier de création'}),el('span',{class:'note',text:face?'Dessine le visage sur la peau (yeux, bouche…).':'Dessine le motif : il s\'affiche sur le devant et le dos.'}),el('button',{class:'mx',text:'✕',onclick:close})),
      el('div',{class:'ue-body'},tools,stage,props));drawTools();drawProps();showSide();refresh()}}
function flood(c,x0,y0,hex){const W=c.canvas.width,H_=c.canvas.height,img=c.getImageData(0,0,W,H_),d=img.data,i0=(y0*W+x0)*4,t=[d[i0],d[i0+1],d[i0+2],d[i0+3]];
  const n=parseInt(hex.slice(1),16),f=[n>>16&255,n>>8&255,n&255,255];if(t.every((v,k)=>Math.abs(v-f[k])<4))return;
  const same=i=>Math.abs(d[i]-t[0])+Math.abs(d[i+1]-t[1])+Math.abs(d[i+2]-t[2])+Math.abs(d[i+3]-t[3])<60;const st=[[x0,y0]];
  while(st.length){const[x,y]=st.pop();let xl=x;while(xl>=0&&same((y*W+xl)*4))xl--;xl++;let up=false,dn=false;
    for(let xx=xl;xx<W&&same((y*W+xx)*4);xx++){const i=(y*W+xx)*4;d[i]=f[0];d[i+1]=f[1];d[i+2]=f[2];d[i+3]=255;
      if(y>0){const u=same(((y-1)*W+xx)*4);if(u&&!up)st.push([xx,y-1]);up=u}if(y<H_-1){const v=same(((y+1)*W+xx)*4);if(v&&!dn)st.push([xx,y+1]);dn=v}}}
  c.putImageData(img,0,0)}
function ugcRegisterPreview(id,m){const it={cat:m.cat,id,name:'aperçu',price:0,c:m.c,c2:m.c2,pat:'ugc',sleeve:m.sleeve,shoes:m.shoes};IT[id]=it;ugcInvalidate(id)}
function ugcSetPrevImages(id,sides){if(id.startsWith('ugcf_')){UGC_IMG[id]=sides.front;return}UGC_IMG[id]=sides.front;UGC_IMG[id+'_b']=sides.back}
// un canvas est « complete » pour drawFace / drawShirt
Object.defineProperty(HTMLCanvasElement.prototype,'complete',{get(){return true},configurable:true});

/* ============================================================================
   PAGE « CRÉER »
   ============================================================================ */
let createTab='jeux';
function creationThumb(meta,W=480,Hh=270){const k='cr|'+meta.id+'|'+meta.updated+'|'+meta.name+meta.icon+meta.color;if(GTHUMB[k])return GTHUMB[k];const[c,x]=cnv(W,Hh);const col=meta.color||'#7a5cff';
  const g=x.createLinearGradient(0,0,W,Hh);g.addColorStop(0,col);g.addColorStop(1,dark(col,.45));x.fillStyle=g;x.fillRect(0,0,W,Hh);
  x.globalAlpha=.14;x.fillStyle='#fff';for(let i=0;i<9;i++){const s=30+rh(i*7)*60;x.save();x.translate(rh(i*3)*W,rh(i*5)*Hh);x.rotate(rh(i)*3);x.fillRect(-s/2,-s/2,s,s);x.restore()}x.globalAlpha=1;
  x.font=`${Hh*.42}px system-ui`;x.textAlign='center';x.textBaseline='middle';x.fillText(meta.icon||'🎮',W/2,Hh*.42);
  x.font=`900 ${Hh*.11}px system-ui`;x.fillStyle='#fff';x.shadowColor='rgba(0,0,0,.5)';x.shadowBlur=8;x.fillText(meta.name.slice(0,24),W/2,Hh*.82);return GTHUMB[k]=c.toDataURL('image/jpeg',.85)}
function pgCreate(C){const tabs=el('div',{class:'chips'});for(const[k,l]of[['jeux','🛠️ Mes jeux'],['ugc','🎨 Vêtements & visages']])tabs.append(el('button',{class:'chip'+(createTab===k?' on':''),text:l,onclick:()=>{createTab=k;go('create')}}));C.append(tabs);
  if(createTab==='jeux'){C.append(el('div',{class:'crhero'},el('div',{},el('h2',{text:'🛠️ Cubik Studio'}),el('p',{text:'Crée tes jeux dans Cubik Studio (ruban, boîte à outils, scripts CubeScript, plugins…). Quand tu publies, le Studio te donne un code : colle-le ici et ton jeu apparaît dans Découvrir.'})),
      el('div',{class:'crhb'},STUDIO_URL?el('a',{class:'btn',href:STUDIO_URL,target:'_blank',rel:'noopener',text:'Ouvrir Cubik Studio ↗'}):null,el('button',{class:'btn green',text:'📥 Importer un jeu du Studio',onclick:importGameModal}))));
    const list=(ACC.creations||[]).slice().sort((a,b)=>b.updated-a.updated);const grid=el('div',{class:'ggrid'});
    if(!list.length)C.append(el('div',{class:'empty'},el('div',{class:'big',text:'🧱'}),el('p',{text:'Aucun jeu importé pour l\'instant. Publie un jeu depuis Cubik Studio puis colle son code ici.'})));
    for(const m of list){const im=el('img',{alt:''});im.src=creationThumb(m);
      grid.append(el('div',{class:'crcard'},el('div',{class:'gimg'},im,el('span',{class:'gtag',text:'Dans Découvrir'})),el('div',{class:'gname',text:m.name}),el('div',{class:'gmeta',text:`${m.count||0} objets · importé ${fmtDate(m.updated)}`}),
        el('div',{class:'crb'},el('button',{class:'btn sm green',text:'▶ Jouer',onclick:()=>playCreation(m.id)}),el('button',{class:'btn sm',text:'🔁',title:'Mettre à jour (coller un nouveau code)',onclick:importGameModal}),el('button',{class:'btn sm red',text:'🗑',title:'Retirer',onclick:()=>delCreation(m)}))))}
    C.append(grid);C.append(el('h2',{text:'Exemples faits avec le Studio'}));const ex=el('div',{class:'ggrid'});
    for(const t of TEMPLATES_G.filter(t=>t.example)){const im=el('img',{alt:''});im.src=creationThumb({id:t.id,name:t.name,icon:t.icon,color:t.color,updated:0});
      ex.append(el('div',{class:'crcard'},el('div',{class:'gimg'},im),el('div',{class:'gname',text:t.name}),el('div',{class:'gmeta',text:t.desc}),el('div',{class:'crb'},el('button',{class:'btn sm',text:'▶ Jouer',onclick:()=>playTemplate(t)}))))}
    C.append(ex);return}
  // UGC
  C.append(el('div',{class:'crhero'},el('div',{},el('h2',{text:'🧩 Accessoires du Blocubik Hub'}),el('p',{text:'Les joueurs publient des accessoires 3D (chapeaux, ailes…) dans le Blocubik Hub. Copie le code d\'un accessoire et colle-le ici pour l\'ajouter à ton inventaire.'})),el('div',{class:'crhb'},HUB_URL?el('a',{class:'btn',href:HUB_URL,target:'_blank',rel:'noopener',text:'Ouvrir le Hub ↗'}):null,el('button',{class:'btn green',text:'📥 Importer un accessoire',onclick:importHubAcc}))));
  C.append(el('div',{class:'crhero'},el('div',{},el('h2',{text:'Atelier UGC'}),el('p',{text:'Dessine tes propres T-shirts, pantalons et visages. Ils rejoignent ton inventaire et tu peux les porter tout de suite.'})),el('button',{class:'btn green',text:'+ Nouvelle création',onclick:()=>openUgcEditor(null)})));
  const g=el('div',{class:'igrid'});const L=(ACC.ugc||[]).slice().reverse();if(!L.length)C.append(el('div',{class:'empty'},el('div',{class:'big',text:'🎨'}),el('p',{text:'Aucune création pour l\'instant.'})));
  for(const m of L){const id=ugcItemId(m),img=el('img',{alt:''});img.dataset.id=id;const worn=ACC.avatar[m.cat]===id;
    g.append(el('div',{class:'icard ugc'},el('div',{class:'iimg'},img),el('div',{class:'iname',text:m.name}),el('div',{class:'imeta',text:UGC_KIND[m.cat][1]}),
      el('div',{class:'crb'},el('button',{class:'btn sm'+(worn?'':' green'),text:worn?'Porté':'Porter',onclick:()=>{ACC.avatar[m.cat]=worn?DEFAULT_AV[m.cat]:id;markDirty();go('create')}}),el('button',{class:'btn sm',text:'✏️',onclick:()=>openUgcEditor(m)}),
        el('button',{class:'btn sm red',text:'🗑',onclick:async()=>{if(!await confirmDel(m.name))return;ACC.ugc=ACC.ugc.filter(x=>x.id!==m.id);ACC.owned=ACC.owned.filter(x=>x!==id);if(ACC.avatar[m.cat]===id)ACC.avatar[m.cat]=DEFAULT_AV[m.cat];await Store.delDoc('ugc_'+m.id).catch(()=>{});markDirty();go('create')}}))))}
  C.append(g);queueThumbs(g)}
function confirmDel(n){return new Promise(res=>{const m=modal(el('div',{class:'cf'},el('h2',{text:`Supprimer « ${n} » ?`}),el('p',{class:'note',text:'Cette action est définitive.'}),
  el('div',{class:'ibtns'},el('button',{class:'btn',text:'Annuler',onclick:()=>{m.remove();res(false)}}),el('button',{class:'btn red',text:'Supprimer',onclick:()=>{m.remove();res(true)}}))));m.querySelector('.mx').onclick=()=>{m.remove();res(false)}})}
const fmtDate=t=>{const d=(Date.now()-t)/1000;return d<60?'à l\'instant':d<3600?`il y a ${Math.round(d/60)} min`:d<86400?`il y a ${Math.round(d/3600)} h`:new Date(t).toLocaleDateString('fr-FR')};
function newGameModal(){let tpl=TEMPLATES_G[0];const name=el('input',{type:'text',maxlength:'40',value:'Mon super jeu'});name.onkeydown=e=>e.stopPropagation();const g=el('div',{class:'tplgrid'});
  const draw=()=>{g.innerHTML='';for(const t of TEMPLATES_G)g.append(el('button',{class:'tpl'+(tpl===t?' on':''),onclick:()=>{tpl=t;draw()}},el('span',{text:t.icon}),el('b',{text:t.name}),el('small',{text:t.desc})))};draw();
  const m=modal(el('div',{class:'cf'},el('h2',{text:'Nouveau jeu'}),el('div',{class:'fld'},el('span',{text:'Nom'}),name),el('div',{class:'fld'},el('span',{text:'Modèle de départ'}),g),
    el('div',{class:'ibtns'},el('button',{class:'btn',text:'Annuler',onclick:()=>m.remove()}),el('button',{class:'btn green',text:'Créer et ouvrir le Studio',onclick:()=>{m.remove();createFrom(tpl,name.value.trim()||'Mon jeu')}}))),'wide')}
async function createFrom(t,name){const g=newCreation(name);if(t.objects){g.objects=t.objects();g.script=t.script||'';g.settings={...g.settings,...(t.settings||{})};g.icon=t.icon;g.color=t.color;g.desc=t.desc}
  CUR_GAME=g;await saveCreation(true);if(!ACC.badges.includes('createur'))unlockBadge('createur');openStudio(g)}
async function editCreation(id){const d=await Store.getDoc('game_'+id).catch(()=>null);if(!d){toast('Impossible de charger ce jeu');return}openStudio(d)}
async function delCreation(m){if(!await confirmDel(m.name))return;ACC.creations=ACC.creations.filter(x=>x.id!==m.id);await Store.delDoc('game_'+m.id).catch(()=>{});markDirty();go('create')}
async function playCreation(id,server){const d=await Store.getDoc('game_'+id).catch(()=>null);if(!d){toast('Impossible de charger ce jeu');return}await loadAssetDocs(d.assets);launchCustom(d,server)}
function playTemplate(t){const g=newCreation(t.name);g.id='ex_'+t.id;g.objects=t.objects();g.script=t.script||'';g.settings={...g.settings,...(t.settings||{})};g.icon=t.icon;g.color=t.color;g.desc=t.desc;launchCustom(g)}
function launchCustom(data,server){CUR_GAME=data;STUDIO.testing=false;const G=GAMES.custom;G.name=data.name;G.icon=data.icon||'🎮';G.colors=[data.color||'#7a5cff',dark(data.color||'#7a5cff',.5)];G.desc=data.desc||'';G.genre='Création';
  GTHUMB.custom=creationThumb({id:data.id,name:data.name,icon:data.icon,color:data.color,updated:data.updated||0},640,360);Music.play(data.settings?.music||'sandbox');startGame('custom',server)}

/* ---------- modèles de jeux (faits avec le Studio) ---------- */
const O=(type,pos,size,x={})=>{const o=newObj(type,pos);if(size)o.size=size;return Object.assign(o,x)};
const base=(c='#4fa046')=>[O('part',[0,-.5,0],[120,1,120],{name:'Sol',color:c}),O('spawn',[0,.2,0],null,{name:'Apparition'})];
const TEMPLATES_G=[
  {id:'vide',name:'Terrain vide',icon:'🟩',color:'#2fbf71',desc:'Une grande plaque d\'herbe et un point d\'apparition.'},
  {id:'obby',name:'Obby express',icon:'🌈',color:'#ff4fa3',example:true,desc:'Un parcours avec lave, trampolines, checkpoints et chrono.',settings:{music:'obby',clock:16},
   objects:()=>{const o=[O('part',[0,-.5,0],[16,1,16],{name:'Départ',color:'#9aa4b2',mat:'lisse'}),O('spawn',[0,.2,0],null,{name:'Apparition'})];
     const cols=['#e5484d','#ff8a3d','#ffd23f','#2fbf71','#3d8bff','#7a5cff'];let z=6,y=0;
     for(let i=0;i<6;i++){z+=5;y+=1;o.push(O('part',[i%2?2:-2,y,z],[3,1,3],{name:'Saut '+(i+1),color:cols[i],mat:'lisse'}))}
     z+=8;o.push(O('checkpoint',[0,y,z],[6,.4,6],{name:'Checkpoint 1'}));z+=7;o.push(O('bounce',[0,y,z],[3,.5,3],{name:'Trampoline'}));z+=9;y+=6;o.push(O('part',[0,y,z],[5,1,5],{name:'Perchoir',color:'#39c5bb'}));
     z+=7;o.push(O('mover',[0,y,z],[4,.6,4],{name:'Plateforme mobile',move:{axis:'X',amp:5,speed:1.2}}));z+=7;o.push(O('part',[0,y,z],[4,1,4],{name:'Bloc arc-en-ciel',color:'#ffffff',mat:'lisse',script:'local b = script.Parent\nlocal t = 0\nwhile true do\n  t += 0.03\n  b.Color = Color3.fromHSV(t % 1, 0.8, 1)\n  wait(0.05)\nend\n'}));
     z+=6;o.push(O('truss',[0,y+4,z],[2,10,2],{name:'Treillis'}));o.push(O('part',[0,y+9.5,z+3.5],[6,1,6],{name:'Sommet',color:'#9aa4b2'}));o.push(O('finish',[0,y+10.2,z+3.5],[5,.4,5],{name:'Arrivée'}));o.push(O('coin',[0,y+12,z+3.5],null,{name:'Pièce bonus'}));return o},
   script:'local joueur = game.Players.LocalPlayer\njoueur:SetStat("Temps", 0)\nUI.Message("Atteins le drapeau doré ! 🏁", 3)\nlocal fini = false\n\nworkspace:FindFirstChild("Arrivée").Touched:Connect(function()\n  if not fini then\n    fini = true\n    UI.Message("Bravo ! Temps : " .. joueur:GetStat("Temps") .. " s", 5)\n    Sound.Play("win")\n  end\nend)\n\nwhile not fini do\n  wait(1)\n  joueur:AddStat("Temps", 1)\nend\n'},
  {id:'pieces',name:'Chasse aux pièces',icon:'🪙',color:'#ffb800',example:true,desc:'60 secondes pour ramasser un maximum de pièces dans les ruines.',settings:{music:'tycoon',clock:17.5},
   objects:()=>{const o=base('#c9b27a');o[0].mat='sable';for(let i=0;i<14;i++){const a=i/14*Math.PI*2,r=10+(i%3)*8;o.push(O('coin',[Math.cos(a)*r,1.4+(i%4===0?4:0),Math.sin(a)*r],null,{name:'Pièce'}))}
     for(let i=0;i<8;i++){const a=i/8*Math.PI*2+.3;o.push(O('part',[Math.cos(a)*16,2,Math.sin(a)*16],[2,4+(i%3)*2,2],{name:'Colonne',mat:'marbre',color:'#e8e2d4'}))}
     o.push(O('part',[0,1.5,0],[6,3,6],{name:'Autel',mat:'pierre',color:'#9aa4b2'}),O('bounce',[14,.25,14],[3,.5,3],{name:'Trampoline'}),O('bounce',[-14,.25,-14],[3,.5,3],{name:'Trampoline'}));
     o.push(O('part',[0,4,24],[8,1,8],{name:'Bombe',color:'#22252b',mat:'lisse',shape:'sphere',size:[2,2,2],script:'local bombe = script.Parent\nbombe.Touched:Connect(function()\n  Effects.Explosion(bombe.Position, 6)\n  bombe:Destroy()\nend)\n'}));return o},
   script:'local joueur = game.Players.LocalPlayer\njoueur:SetStat("Pièces", 0)\nUI.Message("60 secondes pour ramasser les pièces ! 🪙", 3)\n\nfor t = 60, 1, -1 do\n  UI.Hint("⏱ " .. t .. " s")\n  wait(1)\nend\nUI.Hint("")\nUI.Message("Temps écoulé ! Tu as " .. joueur:GetStat("Pièces") .. " pièces 🎉", 6)\nEffects.Confetti(joueur.Position)\n'},
  {id:'tour',name:'Tour du chaos',icon:'🗼',color:'#7a5cff',example:true,desc:'Grimpe la tour pendant que des blocs tombent du ciel.',settings:{music:'boss',clock:20},
   objects:()=>{const o=base('#30343d');o[0].mat='beton';let y=0;const cz=16;for(let i=0;i<14;i++){y+=1.8;const a=i*Math.PI/3;o.push(O(i%5===4?'checkpoint':'part',[Math.cos(a)*6,y,cz+Math.sin(a)*6],[4.5,1,4.5],{name:i%5===4?'Checkpoint':'Étage '+(i+1),color:i%2?'#7a5cff':'#ff4fa3',mat:'lisse'}))}
     o.push(O('neon',[0,y/2,cz],[1.2,y,1.2],{name:'Colonne',collide:false,color:'#39ffb6'}),O('part',[0,y+1.8,cz],[8,1,8],{name:'Toit',color:'#ffd23f',mat:'or'}),O('finish',[0,y+2.5,cz],[6,.4,6],{name:'Arrivée'}),O('neon',[10,3,cz+10],[.5,6,.5],{name:'Néon'}),O('neon',[-10,3,cz-10],[.5,6,.5],{name:'Néon',color:'#ff4fa3'}),
       O('part',[10.5,.9,cz],[4.5,.8,4.5],{name:'Marche',color:'#9aa4b2'}));o[1].pos=[0,.2,4];return o},
   script:'UI.Message("Grimpe jusqu\'au sommet ! Attention aux chutes de blocs ⚠️", 4)\nwait(3)\nwhile true do\n  local b = Instance.new("Part", workspace)\n  b.Size = Vector3.new(2, 2, 2)\n  b.Position = Vector3.new(math.random(-8, 8), 50, 16 + math.random(-8, 8))\n  b.Color = Color3.fromHSV(math.random(), 0.7, 1)\n  b.Type = "Lave"\n  TweenService:Create(b, TweenInfo.new(3, "Linear"), {Position = b.Position - Vector3.new(0, 52, 0)}):Play()\n  task.delay(3.2, function() b:Destroy() end)\n  wait(1.2)\nend\n'},
  {id:'arene',name:'Arène des pièges',icon:'💥',color:'#e5484d',example:true,desc:'Survis le plus longtemps possible : le sol devient de la lave !',settings:{music:'boss',clock:19},
   objects:()=>{const o=[O('lava',[0,-.3,0],[30,.4,30],{name:'Lave'}),O('part',[0,-1,0],[30,1,30],{name:'Fond',color:'#2c2f36'}),O('spawn',[0,2.2,0],[4,.4,4],{name:'Apparition'})];for(let x=-3;x<=3;x++)for(let z=-3;z<=3;z++)o.push(O('part',[x*4.2,1.5,z*4.2],[4,1,4],{name:'Dalle',color:(x+z)%2?'#e8e2d4':'#9aa4b2',mat:'lisse'}));return o},
   script:'local joueur = game.Players.LocalPlayer\njoueur:SetStat("Survie", 0)\nlocal dalles = {}\nfor _, p in ipairs(workspace:GetChildren()) do\n  if p.Name == "Dalle" then table.insert(dalles, p) end\nend\nUI.Message("Les dalles vont disparaître… reste en vie ! 🔥", 3)\nwait(3)\n\ntask.spawn(function()\n  while true do\n    wait(1)\n    joueur:AddStat("Survie", 1)\n  end\nend)\n\nwhile #dalles > 1 do\n  local i = math.random(1, #dalles)\n  local d = table.remove(dalles, i)\n  d.Color = Color3.fromRGB(255, 80, 60)\n  wait(0.8)\n  d.Transparency = 0.7\n  d.CanCollide = false\n  wait(math.max(0.25, 1.2 - joueur:GetStat("Survie") * 0.02))\nend\nUI.Message("Dernière dalle ! Champion 🏆", 5)\n'}];

/* ============================================================================
   CODE DE PUBLICATION (Studio → Cubik)
   ============================================================================ */
const HUB_URL=window.CUBIK_SERVER?'/hub':'https://claude.ai/artifact/K19TLy2soTdsxwxusKzezL';
const STUDIO_URL=window.CUBIK_SERVER?'/studio':'https://claude.ai/artifact/G6jovirUsfsJVCSS9adPZU';
const b64u={enc:u=>{let s='';for(let i=0;i<u.length;i+=0x8000)s+=String.fromCharCode.apply(null,u.subarray(i,i+0x8000));return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')},
  dec:t=>{t=t.replace(/-/g,'+').replace(/_/g,'/');while(t.length%4)t+='=';const s=atob(t),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u}};
async function zip(u,dir){const S=dir?CompressionStream:DecompressionStream;const st=new Blob([u]).stream().pipeThrough(new S('deflate-raw'));return new Uint8Array(await new Response(st).arrayBuffer())}
async function encodeGame(g){const data={v:1,id:g.id,name:g.name,desc:g.desc||'',icon:g.icon,color:g.color,objects:g.objects,groups:g.groups||{},script:g.script||'',settings:g.settings||{},author:ACC?.pseudo||'',updated:Date.now(),assets:[...new Set([...(g.assets||[]),...assetsUsedBy(g)])].map(id=>ASSETS.get(id)).filter(Boolean)};
  const raw=new TextEncoder().encode(JSON.stringify(data));if(typeof CompressionStream!=='undefined'){try{return'CUBIK-JEU.1.'+b64u.enc(await zip(raw,true))}catch(e){}}return'CUBIK-JEU.0.'+b64u.enc(raw)}
async function decodeGame(code){code=String(code||'').trim().replace(/\s+/g,'');const m=code.match(/^CUBIK-JEU\.([01])\.([A-Za-z0-9_-]+)$/);if(!m)throw new Error('Ce n\'est pas un code de jeu Cubik valide (il commence par CUBIK-JEU.)');
  let u;try{u=b64u.dec(m[2]);if(m[1]==='1'){if(typeof DecompressionStream==='undefined')throw new Error('Navigateur trop ancien pour lire ce code');u=await zip(u,false)}}catch(e){throw new Error('Code incomplet ou abîmé : vérifie que tu l\'as copié en entier')}
  let d;try{d=JSON.parse(new TextDecoder().decode(u))}catch(e){throw new Error('Code abîmé : impossible de lire le jeu')}return sanitizeGame(d)}
function sanitizeGame(d){const types=new Set(INSERTS.map(i=>i[0])),num=(v,a,b,def)=>{v=+v;return isFinite(v)?clamp(v,a,b):def},str=(v,n,def='')=>typeof v==='string'?v.slice(0,n):def,col=v=>/^#[0-9a-f]{6}$/i.test(v)?v:'#a3a2a5';
  if(!d||!Array.isArray(d.objects))throw new Error('Code invalide : aucun objet');if(d.objects.length>3000)throw new Error('Jeu trop gros (3000 objets maximum)');
  const objs=[];for(const o of d.objects){if(!o||!types.has(o.type))continue;const v3=(a,lo,hi,def)=>Array.isArray(a)&&a.length===3?a.map((x,i)=>num(x,lo,hi,def[i])):def;
    const n={id:str(o.id,40)||newId(),type:o.type,name:str(o.name,30,o.type),pos:v3(o.pos,-3000,3000,[0,0,0]),size:v3(o.size,.05,500,[2,2,2]),color:col(o.color),mat:MATS[o.mat]?o.mat:'plastique',collide:o.collide!==false,transp:num(o.transp,0,1,0),script:str(o.script,20000)};
    if(o.shape==='sphere'||o.shape==='cyl')n.shape=o.shape;if(typeof o.text==='string')n.text=o.text.slice(0,200);if(['+X','-X','+Z','-Z'].includes(o.dir))n.dir=o.dir;if(o.speed!=null)n.speed=num(o.speed,-40,40,6);
    if(NPC_AV[o.av])n.av=o.av;if(['solid','lava','bounce'].includes(o.kind))n.kind=o.kind;if(o.yaw!=null)n.yaw=num(o.yaw,-10,10,0);if(typeof o.group==='string')n.group=o.group.slice(0,20);
    if(typeof o.fx==='string'&&FX_KINDS[o.fx])n.fx=o.fx;if(typeof o.sfx==='string'&&SFX[o.sfx])n.sfx=o.sfx;for(const k of['sound','tex','mesh'])if(typeof o[k]==='string'&&ASSET_ID_RE.test(o[k]))n[k]=o[k];if(['toucher','ambiance'].includes(o.mode))n.mode=o.mode;
    if(['message','jumpscare','son','lumieres','tuer','aucune'].includes(o.action))n.action=o.action;for(const k of['once','hideInGame','hideBulb'])if(o[k])n[k]=true;if(o.aggro!=null)n.aggro=num(o.aggro,3,80,22);
    if(o.light&&typeof o.light==='object')n.light={range:num(o.light.range,2,60,16),bright:num(o.light.bright,0,8,2),flicker:num(o.light.flicker,0,1,0)};
    if(o.swimAt!=null)n.swimAt=num(o.swimAt,.15,.95,.55);if(o.move&&typeof o.move==='object')n.move={axis:['X','Y','Z'].includes(o.move.axis)?o.move.axis:'X',amp:num(o.move.amp,-100,100,4),speed:num(o.move.speed,-10,10,1)};objs.push(n)}
  const S=d.settings||{},F=S.filter||{};const groups={};for(const[k,v]of Object.entries(d.groups||{}))groups[String(k).slice(0,20)]={name:str(v&&v.name,30,'Modèle')};
  return{id:str(d.id,40)||('g'+Date.now().toString(36)),name:str(d.name,40,'Jeu')||'Jeu',desc:str(d.desc,200),icon:str(d.icon,8,'🎮')||'🎮',color:col(d.color),objects:objs,groups,script:str(d.script,30000),author:str(d.author,20),
    assets:(Array.isArray(d.assets)?d.assets.slice(0,60).map(a=>registerAsset(a)).filter(Boolean).map(a=>a.id):[]),
    settings:{passes:(Array.isArray(S.passes)?S.passes.slice(0,12):[]).map(p=>({id:str(p&&p.id,20,'pass').replace(/[^a-z0-9_-]/gi,'')||'pass',name:filterText(str(p.name,24,'Passe')),icon:str(p.icon,8,'🎟️'),price:num(p.price,5,5000,100),perk:PASS_PERKS[p.perk]?p.perk:'none',desc:filterText(str(p.desc,80))})),fog:num(S.fog,0,1,0),clock:num(S.clock,0,24,14),grav:num(S.grav,.1,3,1),music:SONGS[S.music]||S.music==='none'?S.music:'sandbox',filter:{preset:VFX_PRESETS[F.preset]?F.preset:'aucun',sat:num(F.sat,0,3,1),con:num(F.con,.3,2,1),bri:num(F.bri,.3,2,1),vig:num(F.vig,0,1,0)}},created:Date.now(),updated:Date.now(),published:true}}
function importGameModal(){const ta=el('textarea',{placeholder:'Colle ici le code CUBIK-JEU… donné par « Publier » dans Cubik Studio',style:'height:150px;font:12px ui-monospace,monospace'});ta.onkeydown=e=>e.stopPropagation();const err=el('div',{class:'aerr'}),info=el('div',{class:'note'});
  const m=modal(el('div',{class:'cf'},el('h2',{text:'📥 Importer un jeu du Studio'}),ta,info,err,el('div',{class:'ibtns'},el('button',{class:'btn',text:'Annuler',onclick:()=>m.remove()}),el('button',{class:'btn green',text:'Publier dans Cubik',onclick:async()=>{err.textContent='';
      try{const g=await decodeGame(ta.value);g.name=filterText(g.name);g.desc=filterText(g.desc);for(const id of g.assets||[])await saveAssetDoc(ASSETS.get(id));const ex=(ACC.creations=ACC.creations||[]).find(x=>x.id===g.id);await Store.putDoc('game_'+g.id,g);
        const meta={id:g.id,name:g.name,updated:Date.now(),published:true,count:g.objects.length,icon:g.icon,color:g.color,author:g.author};if(ex)Object.assign(ex,meta);else ACC.creations.push(meta);markDirty();m.remove();SFX.buy();
        toast(ex?`« ${g.name} » mis à jour ✓`:`« ${g.name} » publié dans Découvrir ✓`);if(!ACC.badges.includes('createur'))unlockBadge('createur');go(PAGE==='discover'?'discover':'create')}catch(e){err.textContent=e.message;SFX.error()}}}))));
  ta.addEventListener('input',()=>{info.textContent=ta.value.trim()?`${(ta.value.trim().length/1024).toFixed(1)} Ko collés`:''});setTimeout(()=>ta.focus(),60)}

/* ---------- accessoires venus du Hub ---------- */
function hubAccRegister(a){if(!a||a.type!=='mesh'||!a.slot||a.slot==='objet'||!SLOT_AT[a.slot])return null;const cat=a.slot==='visage'?'lunettes':a.slot,id='hacc_'+a.id.slice(4);
  const it={cat,id,name:a.name,price:0,rarity:'Hub',ugc:true,by:a.author,at:SLOT_AT[a.slot],parts:a.parts.map(p=>PT(p[0],p[1],p[2],p[3],p[4],p[5],p[6],p[7],{emis:p[8]}))};if(IT[id])Object.assign(IT[id],it);else{CATALOG.push(it);IT[id]=it}
  if(ACC&&!ACC.owned.includes(id))ACC.owned.push(id);for(const k of[...THUMB.cache.keys()])if(k.includes(id))THUMB.cache.delete(k);return it}
async function hubAccLoad(){ACC.hubAcc=ACC.hubAcc||[];await loadAssetDocs(ACC.hubAcc);for(const id of ACC.hubAcc)hubAccRegister(ASSETS.get(id))}
function importHubAcc(){const ta=el('textarea',{placeholder:'Colle le code CUBIK-ASSET… d\'un accessoire du Hub',style:'height:110px;font:11px ui-monospace,monospace'});ta.onkeydown=e=>e.stopPropagation();const err=el('div',{class:'aerr'});
  const m=modal(el('div',{class:'cf'},el('h2',{text:'📥 Importer un accessoire'}),ta,err,el('div',{class:'ibtns'},el('button',{class:'btn',text:'Annuler',onclick:()=>m.remove()}),el('button',{class:'btn green',text:'Ajouter',onclick:async()=>{try{const L=await decodeAssets(ta.value);let n=0;
    for(const a of L){const it=hubAccRegister(a);if(!it)continue;await saveAssetDoc(a);if(!ACC.hubAcc.includes(a.id))ACC.hubAcc.push(a.id);ACC.avatar[it.cat]=it.id;n++}
    if(!n)throw new Error('Ce code n\'est pas un accessoire (choisis un mesh « accessoire » dans le Hub)');markDirty();m.remove();toast(`${n} accessoire(s) ajouté(s) et porté(s) ✓`);go('create')}catch(e){err.textContent=e.message}}}))))}
