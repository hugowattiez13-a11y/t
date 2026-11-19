"use strict";
/* ============================================================================
   MARCHÉ DES CRÉATEURS : les joueurs mettent en vente leurs vêtements/visages
   au prix qu'ils choisissent. Le créateur touche 70 % du prix en Blox.
   ============================================================================ */
const MKT={items:[],loaded:0,q:'',cat:'all',sort:'new'};
const MKT_SHARE=.7;
async function mktLoad(force){if(!Cloud.shared())return[];if(!force&&Date.now()-MKT.loaded<20000)return MKT.items;try{const L=await Cloud.list('market');MKT.items=L.map(x=>x.data).filter(d=>d&&d.id&&d.m&&!d.hidden);MKT.loaded=Date.now()}catch(e){console.warn(e)}return MKT.items}
function mktRegister(d){if(IT[d.id]&&!IT[d.id].foreign)return IT[d.id];const okImg=v=>typeof v==='string'&&v.startsWith('data:image/')&&v.length<400000?v:null;
  if(!['haut','bas','visage'].includes(d.m.cat)||ugcItemId(d.m)!==d.id)return null;const it=ugcRegister({...d.m,name:filterText(String(d.m.name||'Création'))},String(d.by||'?'));ugcSetImages(d.id,okImg(d.front),okImg(d.back));return it}
// ---------- vendre une création ----------
function sellModal(m){if(!Cloud.shared())return toast('Le marché fonctionne en ligne (version partagée ou serveur Cubik).');const id=ugcItemId(m);
  const pr=el('input',{type:'number',min:'0',max:'5000',step:'5',value:String(m.sale??25)});pr.onkeydown=e=>e.stopPropagation();const gain=el('b');const upd=()=>{const v=Math.max(0,Math.min(5000,Math.round(+pr.value||0)));gain.textContent=`Tu toucheras ${Math.floor(v*MKT_SHARE)} Blox par vente (70 %).`};pr.oninput=upd;upd();
  const img=el('img',{class:'mprev',alt:''});img.src=itemThumb(id,{...ACC.avatar,[m.cat]:id});
  const mm=modal(el('div',{class:'cf'},el('h2',{text:`💰 Vendre « ${m.name} »`}),img,el('label',{class:'fld'},el('span',{text:'Prix en Blox (0 = gratuit, max 5000)'}),pr),el('p',{class:'note'},gain),
    el('p',{class:'note',text:'Ta création apparaîtra dans la Boutique › Créations des joueurs. Les noms sont filtrés, et une création signalée 3 fois est masquée.'}),
    el('div',{class:'ibtns'},m.sale!=null?el('button',{class:'btn red',text:'Retirer de la vente',onclick:async()=>{await Cloud.doc('market/'+id).delete().catch(()=>{});delete m.sale;markDirty();mm.remove();toast('Retiré de la vente');go('create')}}):null,
      el('button',{class:'btn',text:'Annuler',onclick:()=>mm.remove()}),el('button',{class:'btn green',text:m.sale!=null?'Mettre à jour':'Mettre en vente',onclick:async()=>{
        const price=Math.max(0,Math.min(5000,Math.round(+pr.value||0)));if(textIsFiltered(m.name))return toast('Ce nom n\'est pas autorisé');
        const imgs=await Store.getDoc('ugc_'+m.id).catch(()=>null);const old=await Cloud.doc('market/'+id).get().catch(()=>null);
        const d={id,k:'ugc',m:{id:m.id,cat:m.cat,name:String(m.name).slice(0,40),c:m.c,c2:m.c2,sleeve:m.sleeve,shoes:m.shoes},front:imgs?.front||null,back:imgs?.back||null,price,by:ACC.pseudo,fid:myFid(),t:old?.t||Date.now(),up:Date.now(),sales:old?.sales||0,reports:old?.reports||0,rep:old?.rep||[]};
        try{await Cloud.doc('market/'+id).set(d);await Cloud.doc('pitems/'+id).set({k:'ugc',m:d.m,front:d.front,back:d.back,by:ACC.pseudo,t:Date.now()});m.sale=price;markDirty();mm.remove();SFX.kaching();toast('🛍️ En vente pour '+price+' Blox !');MKT.loaded=0;go('create')}catch(e){toast('Publication impossible : '+(e.message||e))}}}))))}
// ---------- acheter ----------
async function mktBuy(d){if(ACC.owned.includes(d.id))return toast('Tu l\'as déjà');if(d.fid===myFid())return toast('C\'est ta création !');if(ACC.blox<d.price){SFX.error();return toast('Pas assez de Blox')}
  ACC.blox-=d.price;updBlox();const it=mktRegister(d);if(!it)return;it.foreign=false;it.bought=true;it.by=d.by;ACC.owned.push(d.id);ACC.bought=ACC.bought||[];if(!ACC.bought.includes(d.id))ACC.bought.push(d.id);
  await Store.putDoc('achat_'+d.id,{k:'ugc',m:d.m,front:d.front,back:d.back,by:d.by}).catch(()=>{});markDirty();SFX.buy();confetti?.([0,2,0]);toast(`🛍️ ${d.m.name} acheté !`);
  if(d.price>0){const amt=Math.floor(d.price*MKT_SHARE);Cloud.doc(`ventes/${d.fid}/v/${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`).set({amt,item:d.m.name,buyer:ACC.pseudo,t:Date.now()}).catch(()=>{})}
  Cloud.doc('market/'+d.id).get().then(x=>{if(x){x.sales=(x.sales||0)+1;return Cloud.doc('market/'+d.id).set(x)}}).catch(()=>{})}
async function mktLoadBought(){for(const id of ACC.bought||[]){const d=await Store.getDoc('achat_'+id).catch(()=>null);if(!d||!d.m)continue;const okImg=v=>typeof v==='string'&&v.startsWith('data:image/')?v:null;const it=ugcRegister(d.m,String(d.by||'?'));it.foreign=false;it.bought=true;ugcSetImages(id,okImg(d.front),okImg(d.back));if(!ACC.owned.includes(id))ACC.owned.push(id)}}
async function mktClaim(){if(!Cloud.shared()||!ACC)return;try{const L=await Cloud.list(`ventes/${myFid()}/v`);if(!L.length)return;let tot=0,n=0;const names=new Set();for(const x of L){const v=x.data;if(!v||!(v.amt>0)||v.amt>3500)continue;tot+=v.amt;n++;names.add(v.item);await Cloud.doc(`ventes/${myFid()}/v/${x.id}`).delete().catch(()=>{})}
  if(tot>0){ACC.blox+=tot;ACC.stats.sales=(ACC.stats.sales||0)+n;ACC.stats.earned+=tot;updBlox();markDirty();SFX.kaching();toast(`💰 ${n} vente(s) de tes créations (${[...names].slice(0,3).join(', ')}) : +${tot} Blox !`,'gold')}}catch(e){}}
async function mktReport(d){const me=myFid();const x=await Cloud.doc('market/'+d.id).get().catch(()=>null);if(!x)return;x.rep=Array.isArray(x.rep)?x.rep:[];if(x.rep.includes(me))return toast('Déjà signalé');x.rep.push(me);x.reports=x.rep.length;if(x.reports>=3)x.hidden=true;await Cloud.doc('market/'+d.id).set(x).catch(()=>{});toast('🚩 Signalement envoyé');MKT.loaded=0}
// ---------- vitrine dans la boutique ----------
function mktView(C){const tools=el('div',{class:'tools'}),grid=el('div',{class:'igrid shop'}),info=el('div',{class:'note'});
  const q=el('input',{type:'search',placeholder:'Rechercher une création…',value:MKT.q});q.oninput=()=>{MKT.q=q.value;fill()};q.onkeydown=e=>e.stopPropagation();
  const cs=el('select',{});for(const[v,l]of[['all','Tout'],['haut','Hauts'],['bas','Bas'],['visage','Visages']])cs.append(el('option',{value:v,text:l}));cs.value=MKT.cat;cs.onchange=()=>{MKT.cat=cs.value;fill()};
  const so=el('select',{});for(const[v,l]of[['new','Nouveautés'],['pop','Meilleures ventes'],['asc','Prix croissant'],['desc','Prix décroissant']])so.append(el('option',{value:v,text:l}));so.value=MKT.sort;so.onchange=()=>{MKT.sort=so.value;fill()};
  tools.append(q,cs,so);C.append(el('div',{class:'crhero'},el('div',{},el('h2',{text:'🧑‍🎨 Créations des joueurs'}),el('p',{text:'Vêtements et visages dessinés par la communauté. Le créateur touche 70 % du prix. Pour vendre les tiens : Créer › Vêtements & visages › 💰 Vendre.'}))),tools,info,grid);
  const fill=()=>{grid.innerHTML='';let L=MKT.items.filter(d=>(MKT.cat==='all'||d.m.cat===MKT.cat)&&(!MKT.q||(d.m.name+' '+d.by).toLowerCase().includes(MKT.q.toLowerCase())));
    L.sort(MKT.sort==='pop'?(a,b)=>(b.sales||0)-(a.sales||0):MKT.sort==='asc'?(a,b)=>a.price-b.price:MKT.sort==='desc'?(a,b)=>b.price-a.price:(a,b)=>(b.up||b.t)-(a.up||a.t));
    info.textContent=Cloud.shared()?`${L.length} création(s)`:'Le marché fonctionne en ligne (version partagée ou serveur Cubik).';
    for(const d of L.slice(0,120)){if(!mktRegister(d))continue;const own=ACC.owned.includes(d.id),im=el('img',{class:'ith',alt:'','data-id':d.id});
      grid.append(el('button',{class:'icard',onclick:()=>mktModal(d)},im,el('div',{class:'iname',text:filterText(d.m.name)}),el('div',{class:'imeta',text:'par '+filterText(String(d.by))+(d.sales?` · ${d.sales} vente(s)`:'')}),
        el('div',{class:'iprice',html:own?'<span class="owned">✓ Possédé</span>':d.price?`${BLOX}${d.price}`:'Gratuit'})))}queueThumbs(grid)};
  fill();mktLoad().then(fill)}
function mktModal(d){const own=ACC.owned.includes(d.id),prev=el('img',{class:'mprev',alt:''});prev.src=renderThumb({...ACC.avatar,[d.m.cat]:d.id},d.m.cat==='visage'?'head':'full');
  const m=modal(el('div',{class:'cf'},el('h2',{text:filterText(d.m.name)}),prev,el('p',{class:'note',text:`Créé par ${filterText(String(d.by))} · ${d.sales||0} vente(s) · ${UGC_KIND[d.m.cat]?.[1]||''}`}),
    el('div',{class:'ibtns'},el('button',{class:'btn',text:'🚩',title:'Signaler',onclick:()=>{mktReport(d);m.remove()}}),own?el('button',{class:'btn green',text:'Porter',onclick:()=>{ACC.avatar[d.m.cat]=d.id;markDirty();m.remove();toast('Équipé !')}}):
      el('button',{class:'btn green',html:d.price?`Acheter · ${BLOX}${d.price}`:'Obtenir gratuitement',onclick:async()=>{await mktBuy(d);m.remove();if(PAGE==='shop')go('shop')}}))))}
// ---------- branchements ----------
(()=>{const shop0=pgShop;pgShop=function(C){if(shopCat==='market'){const tabs=el('div',{class:'chips scroll'});for(const[id,l,ic]of[['all','Tout','✨'],['market','Créations des joueurs','🧑‍🎨'],...CATS])tabs.append(el('button',{class:'chip'+(shopCat===id?' on':''),text:ic+' '+l,onclick:()=>{shopCat=id;go('shop')}}));C.append(tabs);mktView(C);return}
    shop0(C);const tabs=C.querySelector('.chips');if(tabs){const b=el('button',{class:'chip',text:'🧑‍🎨 Créations des joueurs',onclick:()=>{shopCat='market';go('shop')}});tabs.insertBefore(b,tabs.children[1]||null)}};
  const cr0=pgCreate;pgCreate=function(C){cr0(C);if(createTab!=='ugc')return;C.querySelectorAll('.icard.ugc').forEach((card,i)=>{const L=(ACC.ugc||[]).slice().reverse(),m=L[i];if(!m)return;const row=card.querySelector('.crb');if(row)row.append(el('button',{class:'btn sm gold',text:m.sale!=null?`💰 ${m.sale}`:'💰 Vendre',title:'Mettre en vente',onclick:()=>sellModal(m)}))})};
  const ul0=ugcLoadAll;ugcLoadAll=async function(){await ul0();await mktLoadBought().catch(()=>{});setTimeout(mktClaim,4000);setInterval(mktClaim,120000)}})();
