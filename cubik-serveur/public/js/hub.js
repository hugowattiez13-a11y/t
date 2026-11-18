"use strict";
/* ============================================================================
   BLOCUBIK HUB — textures, sons et meshes publiés par les joueurs
   Chaque création a un ID (hub_xxxxxx) et un code CUBIK-ASSET à coller dans
   Cubik Studio (📦 Ressources) ou dans Cubik (accessoires).
   ============================================================================ */
const HUB={tab:'decouvrir',type:'all',q:'',sort:'recent',items:[],unsub:null,admin:false,nick:'',busy:false};
const HUB_LIMIT={texture:120e3,sound:260e3,mesh:30e3};
const SLOT_AT={chapeau:'head',lunettes:'head',visage:'head',dos:'torso',cou:'torso',epaule:'torso'};
async function hubBoot(){document.body.classList.add('hubapp');document.title='Blocubik Hub';showScreen('hub');MODE='hub';applySettings();
  await Cloud.init();HUB.nick=lsGet('hub_nick')||'';try{const u=await Promise.race([window.claude?.use?.('user'),new Promise(r=>setTimeout(()=>r(null),6000))]);HUB.admin=!!(u&&((await u.isOwner?.())||(await u.canEdit?.())))}catch(e){}
  if(Cloud.mode==='server')HUB.admin=!!lsGet('hub_admin');
  if(Cloud.shared())HUB.unsub=Cloud.watch('hubitems',(ch,first)=>{const map=new Map(HUB.items.map(i=>[i.id,i]));for(const c of ch){if(c.data)map.set(c.id,c.data);else map.delete(c.id)}HUB.items=[...map.values()];hubRender()});
  hubRender()}
function hubVisible(i){return i&&(!i.hidden||HUB.admin||i.by===Cloud.uid)}
function hubRender(){const R=$('hub');if(!R)return;R.innerHTML='';
  const tabs=[['decouvrir','🔎 Découvrir'],['publier','➕ Publier'],['mes','🗂️ Mes créations'],...(HUB.admin?[['moderation','🛡️ Modération']]:[])];
  R.append(el('div',{class:'hubhead'},el('span',{class:'slogo',html:'<svg viewBox="0 0 64 64"><use href="#logo"/></svg>'}),el('div',{},el('h1',{text:'Blocubik Hub'}),el('p',{text:'Textures, sons et meshes créés par les joueurs. Chaque création a un ID à utiliser dans Cubik Studio.'})),el('div',{class:'tsp'}),
      el('a',{class:'btn sm',href:STUDIO_URL,target:'_blank',rel:'noopener',text:'🛠️ Cubik Studio ↗'}),el('div',{class:'hubtabs'},...tabs.map(([k,l])=>el('button',{class:'chip'+(HUB.tab===k?' on':''),text:l,onclick:()=>{HUB.tab=k;hubRender()}})))));
  if(!Cloud.shared())R.append(el('div',{class:'hubwarn',text:'Mode hors ligne : le Hub partagé fonctionne quand il est ouvert dans Claude (et partagé avec tes amis) ou sur un serveur Cubik. Tes publications restent dans ce navigateur.'}));
  const C=el('div',{class:'hubbody'});R.append(C);({decouvrir:hubBrowse,publier:hubPublish,mes:hubMine,moderation:hubModeration})[HUB.tab](C)}
function hubCard(i,extra){const pv=el('div',{class:'hpv'});if(i.type==='texture')pv.append(el('img',{src:i.data,alt:''}));else if(i.type==='sound')pv.append(el('button',{class:'hplay',text:'▶',onclick:e=>{e.stopPropagation();hubPlay(i)}}));else{const im=el('img',{alt:''});pv.append(im);requestAnimationFrame(()=>{im.src=meshThumbOf(i)})}
  return el('div',{class:'hcard'+(i.hidden?' hid':''),onclick:()=>hubItemModal(i)},pv,el('div',{class:'hn',text:filterText(i.name)}),el('div',{class:'hm'},el('span',{text:assetKind[i.type][0]+' '+assetKind[i.type][1]}),el('span',{text:'❤️ '+Object.keys(i.likes||{}).length})),
    el('code',{class:'hid',text:i.id}),i.hidden?el('div',{class:'hflag',text:i.reports>=3?'Masqué (signalé)':'Masqué'}):null,extra||null)}
function hubBrowse(C){const q=el('input',{type:'search',placeholder:'🔍 Rechercher un nom, un tag ou un ID…',value:HUB.q});q.onkeydown=e=>e.stopPropagation();q.oninput=()=>{HUB.q=q.value;draw()};
  const chips=el('div',{class:'chips'});for(const[k,l]of[['all','Tout'],['texture','🖼️ Textures'],['sound','🔊 Sons'],['mesh','🧩 Meshes']])chips.append(el('button',{class:'chip'+(HUB.type===k?' on':''),text:l,onclick:()=>{HUB.type=k;hubRender()}}));
  const sort=el('select',{class:'stsel'});for(const[k,l]of[['recent','Plus récents'],['pop','Plus aimés'],['nom','Nom']])sort.append(el('option',{value:k,text:l}));sort.value=HUB.sort;sort.onchange=()=>{HUB.sort=sort.value;draw()};
  const grid=el('div',{class:'hgrid'});C.append(el('div',{class:'hubbar'},q,sort),chips,grid);
  function draw(){const n=s=>String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');const qq=n(HUB.q.trim());
    let L=HUB.items.filter(i=>hubVisible(i)&&!i.hidden&&(HUB.type==='all'||i.type===HUB.type)&&(!qq||n(i.name).includes(qq)||n((i.tags||[]).join(' ')).includes(qq)||i.id===qq||n(i.author).includes(qq)));
    L.sort(HUB.sort==='pop'?(a,b)=>Object.keys(b.likes||{}).length-Object.keys(a.likes||{}).length:HUB.sort==='nom'?(a,b)=>String(a.name).localeCompare(b.name):(a,b)=>(b.created||0)-(a.created||0));
    grid.innerHTML='';if(!L.length)grid.append(el('div',{class:'empty'},el('div',{class:'big',text:'📭'}),el('p',{text:HUB.items.length?'Aucun résultat.':'Le Hub est vide pour l\'instant : sois le premier à publier !'})));
    for(const i of L.slice(0,200))grid.append(hubCard(i))}draw()}
function hubMine(C){const L=HUB.items.filter(i=>i.by===Cloud.uid).sort((a,b)=>(b.created||0)-(a.created||0));const grid=el('div',{class:'hgrid'});
  C.append(el('h2',{text:`Mes créations (${L.length})`}),grid);if(!L.length)grid.append(el('div',{class:'empty'},el('p',{text:'Tu n\'as encore rien publié.'})));for(const i of L)grid.append(hubCard(i))}
function hubModeration(C){const L=HUB.items.filter(i=>i.hidden||(i.reports||0)>0).sort((a,b)=>(b.reports||0)-(a.reports||0));const grid=el('div',{class:'hgrid'});
  C.append(el('h2',{text:'🛡️ Modération'}),el('p',{class:'note',text:'Les créations signalées 3 fois sont masquées automatiquement. Ici tu peux les rétablir ou les supprimer.'}),grid);if(!L.length)grid.append(el('div',{class:'empty'},el('p',{text:'Rien à modérer 🎉'})));
  for(const i of L)grid.append(hubCard(i,el('div',{class:'crb',onclick:e=>e.stopPropagation()},el('span',{class:'note',text:`🚩 ${i.reports||0}`}),el('button',{class:'btn sm',text:i.hidden?'Rétablir':'Masquer',onclick:()=>hubSave({...i,hidden:!i.hidden,reports:i.hidden?0:i.reports,reporters:i.hidden?{}:i.reporters})}),el('button',{class:'btn sm red',text:'🗑',onclick:()=>hubDelete(i)}))))}
async function hubSave(i){try{await Cloud.doc('hubitems/'+i.id).set(i);if(Cloud.mode==='local'){const k=HUB.items.findIndex(x=>x.id===i.id);if(k>=0)HUB.items[k]=i;else HUB.items.push(i);hubRender()}}catch(e){toast('Refusé : '+(e.message||'il faut un accès « peut modifier » pour publier dans le Hub'))}}
async function hubDelete(i){if(!await confirmDel(i.name))return;try{await Cloud.doc('hubitems/'+i.id).delete();if(Cloud.mode==='local'){HUB.items=HUB.items.filter(x=>x.id!==i.id);hubRender()}document.querySelectorAll('.modal').forEach(m=>m.remove())}catch(e){toast('Refusé')}}
function hubPlay(i){registerAsset(i);playAsset(i.id)}
function hubItemModal(i){registerAsset(i);const liked=!!(i.likes||{})[Cloud.uid],mine=i.by===Cloud.uid;const pv=el('div',{class:'hbig'});
  if(i.type==='texture')pv.append(el('img',{src:i.data,class:'tiled'}),el('div',{class:'tiledemo',style:`background-image:url(${i.data})`}));else if(i.type==='sound')pv.append(el('button',{class:'btn green',text:'▶ Écouter',onclick:()=>hubPlay(i)}));else pv.append(el('img',{src:meshThumbOf(i)}));
  const usage=i.type==='sound'?`Sound.Play("${i.id}")`:i.type==='texture'?`bloc.Texture = "${i.id}"`:'Objet « Mesh (Hub) » dans la boîte à outils';
  const m=modal(el('div',{class:'hitem'},pv,el('div',{},el('h2',{text:filterText(i.name)}),el('div',{class:'gmeta',text:`${assetKind[i.type][1]} · par ${filterText(i.author||'?')} · ${new Date(i.created||Date.now()).toLocaleDateString('fr-FR')}${i.type==='mesh'?' · '+(i.slot==='objet'?'objet':'accessoire ('+i.slot+')'):''}`}),
    i.desc?el('p',{text:filterText(i.desc)}):null,el('div',{class:'htags'},...(i.tags||[]).map(t=>el('span',{class:'bdg',text:'#'+filterText(t)}))),
    el('div',{class:'invcode'},el('code',{text:i.id}),el('button',{class:'btn sm',text:'📋 ID',onclick:()=>copyTxt(i.id)})),el('p',{class:'note',text:'Dans le code : '+usage}),
    el('div',{class:'ibtns'},el('button',{class:'btn green',text:'📋 Copier le code pour le Studio / Cubik',onclick:async()=>copyTxt(await encodeAsset(i),'Code copié : colle-le dans Studio → 📦 Ressources')}),
      el('button',{class:'btn'+(liked?' pri':''),text:(liked?'❤️ ':'🤍 ')+Object.keys(i.likes||{}).length,onclick:()=>{const L={...(i.likes||{})};if(liked)delete L[Cloud.uid];else L[Cloud.uid]=1;hubSave({...i,likes:L});m.remove()}}),
      mine||HUB.admin?el('button',{class:'btn red',text:'🗑 Supprimer',onclick:()=>hubDelete(i)}):el('button',{class:'btn',text:'🚩 Signaler',onclick:()=>hubReport(i,m)})))),'wide')}
async function copyTxt(t,msg){try{await navigator.clipboard.writeText(t);toast(msg||'Copié ✓')}catch(e){const ta=el('textarea',{readonly:'',class:'pubcode'});ta.value=t;modal(el('div',{class:'cf'},el('h2',{text:'Copie ce texte'}),ta));setTimeout(()=>ta.select(),50)}}
function hubReport(i,m0){const rs=el('div',{class:'reasons'});['Contenu choquant ou violent','Contenu sexuel','Insulte / harcèlement','Vol de création','Spam','Autre'].forEach(r=>rs.append(el('label',{},el('input',{type:'radio',name:'hr',value:r}),r)));
  const m=modal(el('div',{class:'cf'},el('h2',{text:'🚩 Signaler'}),rs,el('div',{class:'ibtns'},el('button',{class:'btn',text:'Annuler',onclick:()=>m.remove()}),el('button',{class:'btn red',text:'Envoyer',onclick:()=>{const r=rs.querySelector('input:checked');if(!r)return;
    const rep={...(i.reporters||{})};if(rep[Cloud.uid]){toast('Déjà signalé');m.remove();return}rep[Cloud.uid]=r.value;const n=Object.keys(rep).length;hubSave({...i,reporters:rep,reports:n,hidden:i.hidden||n>=3});m.remove();m0&&m0.remove();toast('Merci, signalement envoyé')}}))))}

/* ---------- publier ---------- */
let PUB={type:'texture',data:null,parts:null,slot:'objet',px:null};
function hubPublish(C){if(!HUB.nick){const n=el('input',{type:'text',maxlength:'20',placeholder:'Ton pseudo de créateur'});n.onkeydown=e=>e.stopPropagation();
    C.append(el('div',{class:'cf',style:'max-width:420px'},el('h2',{text:'Choisis ton pseudo'}),n,el('button',{class:'btn green',style:'margin-top:10px',text:'Continuer',onclick:()=>{const v=n.value.trim();if(!v||textIsFiltered(v)){toast('Pseudo invalide');return}HUB.nick=v;lsSet('hub_nick',v);hubRender()}})));return}
  const tabs=el('div',{class:'chips'});for(const[k,l]of[['texture','🖼️ Texture'],['sound','🔊 Son'],['mesh','🧩 Mesh']])tabs.append(el('button',{class:'chip'+(PUB.type===k?' on':''),text:l,onclick:()=>{PUB={type:k,data:null,parts:k==='mesh'?defaultParts():null,slot:'objet'};hubRender()}}));
  const name=el('input',{type:'text',maxlength:'32',placeholder:'Nom'}),tags=el('input',{type:'text',maxlength:'60',placeholder:'Tags séparés par des espaces (ex : bois sol médiéval)'}),desc=el('textarea',{maxlength:'200',placeholder:'Description (facultatif)'});
  [name,tags,desc].forEach(x=>x.onkeydown=e=>e.stopPropagation());const err=el('div',{class:'aerr'});const editor=el('div',{class:'pubed'});
  C.append(el('h2',{text:'Publier une création'}),tabs,el('div',{class:'pubgrid'},editor,el('div',{},el('div',{class:'fld'},el('span',{text:'Nom'}),name),el('div',{class:'fld'},el('span',{text:'Tags'}),tags),el('div',{class:'fld'},el('span',{text:'Description'}),desc),err,
    el('button',{class:'btn green big',text:'🚀 Publier dans le Hub',onclick:e=>publish(e.target)}),el('p',{class:'note',text:'Filtres : les noms, tags et descriptions passent par le filtre de texte ; les images sont vérifiées par l\'IA quand c\'est possible ; 3 signalements masquent une création.'}))));
  if(PUB.type==='texture')texEditor(editor);else if(PUB.type==='sound')soundEditor(editor);else meshEditor(editor);
  async function publish(btn){err.textContent='';const nm=name.value.trim();if(!nm){err.textContent='Donne un nom à ta création';return}
    for(const t of[nm,tags.value,desc.value])if(textIsFiltered(t)){err.textContent='🛡️ Filtre : retire les mots interdits ('+filterText(t)+')';return}
    const recent=(lsGet('hub_pubs')||[]).filter(t=>Date.now()-t<3600e3);if(recent.length>=12){err.textContent='Limite : 12 publications par heure';return}
    let item={type:PUB.type,name:nm,tags:tags.value.toLowerCase().split(/[\s,#]+/).filter(Boolean).slice(0,8).map(t=>t.slice(0,16)),desc:desc.value.trim(),author:HUB.nick,by:Cloud.uid,created:Date.now(),likes:{},reports:0};
    if(PUB.type==='texture'){const d=PUB.px?pixelData():PUB.data;if(!d){err.textContent='Importe ou dessine une texture';return}item.data=d}
    else if(PUB.type==='sound'){if(!PUB.data){err.textContent='Importe un son';return}item.data=PUB.data}else{item.parts=sanitizeParts(PUB.parts);item.slot=PUB.slot;if(!item.parts.length){err.textContent='Ajoute au moins une pièce';return}}
    const size=JSON.stringify(item).length;if(size>HUB_LIMIT[item.type]){err.textContent=`Trop lourd (${Math.round(size/1024)} Ko, max ${Math.round(HUB_LIMIT[item.type]/1024)} Ko)`;return}
    btn.disabled=true;btn.textContent='⏳ Vérification…';
    if(item.type==='texture'){const v=await aiCheckImage(item.data);if(v&&v.ok===false){err.textContent='🛡️ Refusé par la vérification : '+(v.reason||'image inappropriée');btn.disabled=false;btn.textContent='🚀 Publier dans le Hub';return}item.checked=!!v}
    let id;for(let k=0;k<5;k++){id='hub_'+Math.random().toString(36).slice(2,8);if(!HUB.items.some(x=>x.id===id)&&!(Cloud.shared()&&await Cloud.doc('hubitems/'+id).get().catch(()=>null)))break}item.id=id;
    await hubSave(item);lsSet('hub_pubs',[...recent,Date.now()]);btn.disabled=false;btn.textContent='🚀 Publier dans le Hub';SFX.buy();toast('Publié ! ID : '+id);HUB.tab='mes';hubRender();hubItemModal(item)}}
async function aiCheckImage(dataUrl){try{const s=await Promise.race([window.claude?.use?.('sample'),new Promise(r=>setTimeout(()=>r(null),5000))]);if(!s)return null;const lim=await s.limits?.().catch(()=>null);if(!lim||!lim.images)return null;
    const blob=await(await fetch(dataUrl)).blob();return await s.json('Cette image va être une texture dans un jeu pour enfants et ados. Réponds en JSON {"ok":true|false,"reason":"courte raison en français"}. Refuse : nudité, violence choquante, gore, symboles haineux, insultes écrites, informations personnelles.',{images:[blob],modelTier:'quick'})}catch(e){return null}}
function texEditor(E){const prev=el('div',{class:'texprev'});const draw=()=>{prev.innerHTML='';const d=PUB.px?pixelData():PUB.data;if(d){prev.append(el('img',{src:d}),el('div',{class:'tiledemo',style:`background-image:url(${d})`}))}else prev.append(el('div',{class:'note',text:'Aperçu'}))};
  const file=el('input',{type:'file',accept:'image/*'});file.onchange=async()=>{try{PUB.data=await importTextureFile(file.files[0]);PUB.px=null;draw();px.style.display='none'}catch(e){toast(e.message)}};
  const px=el('div',{class:'pxed'});const pal=['#ffffff','#1f2028','#e5484d','#ff8a3d','#ffd23f','#2fbf71','#39c5bb','#3d8bff','#7a5cff','#ff4fa3','#8d5524','#9aa4b2','#6d4a2a','#4fa046','#30343d','#c9b27a'];let cur='#1f2028',down=false;
  const startPx=()=>{PUB.px=PUB.px||Array(256).fill('#c9b27a');PUB.data=null;px.innerHTML='';px.style.display='';const g=el('div',{class:'pxg'});PUB.px.forEach((c,i)=>{const b=el('i',{style:`background:${c}`});const paint=()=>{PUB.px[i]=cur;b.style.background=cur;clearTimeout(px.t);px.t=setTimeout(draw,150)};b.onpointerdown=e=>{e.preventDefault();down=true;paint()};b.onpointerenter=()=>{if(down)paint()};g.append(b)});
    addEventListener('pointerup',()=>down=false);const p=el('div',{class:'ue-pal'});for(const c of pal)p.append(el('button',{class:'csw',style:`background:${c}`,onclick:ev=>{cur=c;p.querySelectorAll('.csw').forEach(x=>x.classList.remove('on'));ev.target.classList.add('on')}}));
    const ci=el('input',{type:'color',value:cur});ci.oninput=()=>cur=ci.value;p.append(ci);px.append(g,p,el('button',{class:'btn sm',text:'Tout remplir',onclick:()=>{PUB.px.fill(cur);startPx();draw()}}));draw()};
  E.append(el('div',{class:'fld'},el('span',{text:'Importer une image (recadrée en carré 128 px)'}),file),el('div',{class:'note',text:'— ou —'}),el('button',{class:'btn sm',text:'🎨 Dessiner en pixel art (16 × 16)',onclick:startPx}),px,prev);if(PUB.px)startPx();draw()}
function pixelData(){const c=document.createElement('canvas');c.width=c.height=16;const x=c.getContext('2d');PUB.px.forEach((col,i)=>{x.fillStyle=col;x.fillRect(i%16,Math.floor(i/16),1,1)});const b=document.createElement('canvas');b.width=b.height=64;const y=b.getContext('2d');y.imageSmoothingEnabled=false;y.drawImage(c,0,0,64,64);return b.toDataURL('image/png')}
function soundEditor(E){const info=el('div',{class:'note',text:'mp3, wav, ogg… Le son est converti en mono 16 kHz et coupé à 6 secondes.'});const file=el('input',{type:'file',accept:'audio/*'});const prev=el('div');
  file.onchange=async()=>{prev.innerHTML='⏳ Conversion…';try{const r=await importSoundFile(file.files[0]);PUB.data=r.data;prev.innerHTML='';prev.append(el('button',{class:'btn green',text:`▶ Écouter (${r.dur.toFixed(1)} s · ${Math.round(r.data.length/1024)} Ko)`,onclick:()=>{const id='snd_prev00';registerAsset({id,type:'sound',name:'aperçu',data:PUB.data});ASSET_BUF.delete(id);playAsset(id)}}))}catch(e){prev.textContent=e.message}};
  E.append(el('div',{class:'fld'},el('span',{text:'Importer un son'}),file),info,prev)}
function defaultParts(){return[['box',0,0,0,.8,.8,.8,'#3d8bff',0]]}
function meshEditor(E){const prev=el('img',{class:'meshprev'}),list=el('div',{class:'plist3'});const S=['box','rbox','sphere','cyl','cone','torus'];
  const slot=el('select',{});for(const[k,l]of[['objet','Objet (Studio)'],['chapeau','Accessoire : chapeau'],['lunettes','Accessoire : visage'],['dos','Accessoire : dos'],['cou','Accessoire : cou'],['epaule','Accessoire : épaule']])slot.append(el('option',{value:k,text:l}));slot.value=PUB.slot;slot.onchange=()=>{PUB.slot=slot.value;upd()};
  const upd=()=>{prev.src=meshThumbOf({parts:PUB.parts,slot:PUB.slot})};
  const draw=()=>{list.innerHTML='';PUB.parts.forEach((p,i)=>{const sh=el('select',{});for(const s of S)sh.append(el('option',{value:s,text:s}));sh.value=p[0];sh.onchange=()=>{p[0]=sh.value;upd()};
      const n=(k,lbl,min,max,st)=>{const r=el('input',{type:'range',min,max,step:st,value:p[k]});r.oninput=()=>{p[k]=+r.value;upd()};return el('label',{class:'pr'},el('span',{text:lbl}),r)};
      const c=el('input',{type:'color',value:p[7]});c.oninput=()=>{p[7]=c.value;upd()};const em=el('button',{class:'stb'+(p[8]?' on':''),text:'💡',title:'Brillant',onclick:()=>{p[8]=p[8]?0:1.5;draw();upd()}});
      list.append(el('div',{class:'mpart'},el('div',{class:'mph'},el('b',{text:'#'+(i+1)}),sh,c,em,el('button',{class:'stb',text:'⧉',onclick:()=>{PUB.parts.splice(i+1,0,[...p]);draw();upd()}}),el('button',{class:'stb',text:'🗑',onclick:()=>{PUB.parts.splice(i,1);draw();upd()}})),
        el('div',{class:'mpg'},n(1,'X',-1.5,1.5,.02),n(2,'Y',-1.5,1.5,.02),n(3,'Z',-1.5,1.5,.02),n(4,'Larg.',.02,2,.02),n(5,'Haut.',.02,2,.02),n(6,'Prof.',.02,2,.02))))})};
  E.append(el('div',{class:'fld'},el('span',{text:'Type'}),slot),prev,el('button',{class:'btn sm',text:'＋ Ajouter une pièce',onclick:()=>{if(PUB.parts.length>=60)return;PUB.parts.push(['box',0,.3,0,.3,.3,.3,'#ffd23f',0]);draw();upd()}}),list);draw();upd()}
// aperçu 3D d'un mesh (seul, ou porté par un avatar si c'est un accessoire)
function meshThumbOf(i){const parts=sanitizeParts(i.parts);if(i.slot&&i.slot!=='objet'&&SLOT_AT[i.slot]){const it={cat:i.slot==='visage'?'lunettes':i.slot,id:'__hubprev',name:'aperçu',price:0,at:SLOT_AT[i.slot],parts:parts.map(p=>PT(p[0],p[1],p[2],p[3],p[4],p[5],p[6],p[7],{emis:p[8]}))};IT.__hubprev=it;
    const av={...DEFAULT_AV,chapeau:null,lunettes:null,dos:null,cou:null,epaule:null,[it.cat]:'__hubprev'};return renderThumb(av,it.at==='head'?'head':it.cat==='dos'?'back':'torso')}
  thumbInit();const S=THUMB.size;let mn=[9,9,9],mx=[-9,-9,-9];for(const p of parts)for(let k=0;k<3;k++){mn[k]=Math.min(mn[k],p[1+k]-p[4+k]/2);mx[k]=Math.max(mx[k],p[1+k]+p[4+k]/2)}const c=V.mul(V.add(mn,mx),.5),r=Math.max(.3,V.len(V.sub(mx,mn))*.5);
  const L=[],TR=[];meshDraws(parts,M.id(),L,TR);const eye=V.add(c,[Math.sin(.6)*r*3.2,r*1.3,Math.cos(.6)*r*3.2]);const VP=M.mul(M.persp(34*Math.PI/180,1,.05,50),M.lookAt(eye,c,[0,1,0]));
  gl.bindFramebuffer(gl.FRAMEBUFFER,THUMB.fb);gl.viewport(0,0,S,S);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.disable(gl.BLEND);
  beginScene({VP,eye,LVP:M.id(),hdr:0,taps:0,sun:V.norm([.4,.8,.6]),sunCol:[1.25,1.2,1.12],fogOff:true,noLights:true});L.forEach(drawItem);
  const px=new Uint8Array(S*S*4);gl.readPixels(0,0,S,S,gl.RGBA,gl.UNSIGNED_BYTE,px);gl.bindFramebuffer(gl.FRAMEBUFFER,null);const[cv2,x]=cnv(S,S),img=x.createImageData(S,S);for(let y=0;y<S;y++)img.data.set(px.subarray((S-1-y)*S*4,(S-y)*S*4),y*S*4);x.putImageData(img,0,0);return cv2.toDataURL('image/png')}
