"use strict";
/* ============================================================================
   PROJETS D'ÉQUIPE : plusieurs créateurs éditent le même jeu en direct
   Chaque objet est un document partagé (team/<projet>/o/<objet>), les
   réglages et le script principal sont dans team/<projet>/m/meta.
   La présence montre qui est là et ce que chacun a sélectionné.
   ============================================================================ */
const TEAM_COLORS=['#ff4fa3','#ffd23f','#2fbf71','#39c5bb','#ff8a3d','#b46bff','#4cc9f0'];
const Team={pid:null,last:new Map(),lastMeta:'',unsubs:[],room:null,peers:[],t:0,writing:new Map(),color:TEAM_COLORS[Math.floor(Math.random()*TEAM_COLORS.length)],
  metaOf(g){return{name:g.name,desc:g.desc||'',icon:g.icon,color:g.color,script:g.script||'',settings:g.settings||{},groups:g.groups||{},assets:g.assets||[],members:g.members||[],updated:Date.now()}},
  async create(g){if(!Cloud.shared())throw new Error('Le travail d\'équipe a besoin que le Studio soit ouvert dans Claude (ou sur un serveur Cubik).');
    const pid=('t'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)).slice(0,16);g.members=[ACC.pseudo];
    await Cloud.doc(`team/${pid}/m/meta`).set(this.metaOf(g));for(const o of g.objects)await Cloud.doc(`team/${pid}/o/${o.id}`).set(o);
    for(const id of g.assets||[]){const a=ASSETS.get(id);if(a)await Cloud.doc(`team/${pid}/a/${id}`).set(a)}
    const old=g.id;g.id=pid;g.team=true;ACC.creations=(ACC.creations||[]).filter(x=>x.id!==old);ACC.creations.push({id:pid,team:true,name:g.name,updated:Date.now(),count:g.objects.length,icon:g.icon,color:g.color});markDirty();return pid},
  async load(pid){const meta=await Cloud.doc(`team/${pid}/m/meta`).get();if(!meta)throw new Error('Projet introuvable : vérifie le code (et que le Studio t\'a bien été partagé).');
    const objs=(await Cloud.list(`team/${pid}/o`,3000)).map(d=>d.data).filter(o=>o&&o.type);for(const a of await Cloud.list(`team/${pid}/a`,100))registerAsset(a.data);
    return{id:pid,team:true,...meta,objects:objs,created:meta.updated}},
  start(g){this.stop();this.pid=g.id;this.last=new Map(g.objects.map(o=>[o.id,JSON.stringify(o)]));this.lastMeta=JSON.stringify(this.metaOf(g)).replace(/"updated":\d+/,'');
    if(!g.members?.includes(ACC.pseudo)){g.members=[...(g.members||[]),ACC.pseudo].slice(-30);this.pushMeta(true)}
    this.unsubs.push(Cloud.watch(`team/${this.pid}/o`,(ch,first)=>this.onObjs(ch,first)),Cloud.watch(`team/${this.pid}/m`,ch=>this.onMeta(ch)),Cloud.watch(`team/${this.pid}/a`,ch=>{for(const c of ch)if(c.data){registerAsset(c.data);if(CUR_GAME&&!CUR_GAME.assets?.includes(c.id))(CUR_GAME.assets=CUR_GAME.assets||[]).push(c.id)}}));
    Cloud.room('st-'+this.pid.toLowerCase()).then(r=>{if(!r||this.pid!==g.id)return;this.room=r;this.unsubs.push(r.onPeers(ch=>{this.peers=ch.peers.filter(p=>!p.isMe&&p.presence?.n);updTeamBadge()},()=>{}))})},
  stop(){for(const u of this.unsubs)try{u()}catch(e){}this.unsubs=[];if(this.room&&this.room.leave)this.room.leave().catch(()=>{});this.room=null;this.pid=null;this.peers=[];this.last.clear()},
  onObjs(ch,first){if(!CUR_GAME||!this.pid)return;let changed=false;
    for(const c of ch){const id=c.id,cur=CUR_GAME.objects.find(o=>o.id===id);
      if(!c.data){if(cur&&!(STUDIO.drag&&STUDIO.selSet.has(cur))){CUR_GAME.objects=CUR_GAME.objects.filter(o=>o!==cur);STUDIO.selSet.delete(cur);if(STUDIO.sel===cur)STUDIO.sel=null;changed=true}this.last.delete(id);continue}
      const js=JSON.stringify(c.data);if(this.last.get(id)===js)continue;this.last.set(id,js);if(cur&&STUDIO.drag&&STUDIO.selSet.has(cur))continue;
      if(cur){for(const k of Object.keys(cur))if(!(k in c.data))delete cur[k];Object.assign(cur,c.data)}else CUR_GAME.objects.push(c.data);changed=true}
    if(changed){requestRebuild();clearTimeout(this.pt);this.pt=setTimeout(()=>{if(MODE==='studio')refreshPanels()},150)}},
  onMeta(ch){for(const c of ch){if(c.id!=='meta'||!c.data||!CUR_GAME)continue;const m=c.data,js=JSON.stringify(m).replace(/"updated":\d+/,'');if(js===this.lastMeta)continue;this.lastMeta=js;
      Object.assign(CUR_GAME,{name:m.name,desc:m.desc,icon:m.icon,color:m.color,script:m.script,settings:m.settings||{},groups:m.groups||{},assets:m.assets||[],members:m.members||[]});
      setClock(CUR_GAME.settings.clock??14);applyFog(CUR_GAME.settings);applyEditorFilter();requestRebuild();if(MODE==='studio'&&!$('stCode').classList.contains('open'))buildStudioUI()}},
  // envoi des changements locaux (comparaison toutes les 0,3 s)
  tick(dt){if(!this.pid||!CUR_GAME||STUDIO.testing)return;this.t-=dt;if(this.t>0)return;this.t=.3;
    if(this.room){const sel=selList().slice(0,24).map(o=>o.id);this.room.presence({n:ACC.pseudo.slice(0,20),c:this.color,sel,cam:STUDIO.cam.pos.map(v=>Math.round(v)),t:Math.round(Date.now()/1000)}).catch(()=>{})}
    if(STUDIO.drag)return;const ids=new Set();
    for(const o of CUR_GAME.objects){ids.add(o.id);const js=JSON.stringify(o);if(this.last.get(o.id)!==js){this.last.set(o.id,js);this.write(`team/${this.pid}/o/${o.id}`,o)}}
    for(const id of[...this.last.keys()])if(!ids.has(id)){this.last.delete(id);Cloud.doc(`team/${this.pid}/o/${id}`).delete().catch(()=>{})}
    this.pushMeta()},
  pushMeta(force){const m=this.metaOf(CUR_GAME),js=JSON.stringify(m).replace(/"updated":\d+/,'');if(!force&&js===this.lastMeta)return;this.lastMeta=js;this.write(`team/${this.pid}/m/meta`,m)
    for(const id of CUR_GAME.assets||[]){const a=ASSETS.get(id);if(a&&!this.sentAssets?.has(id)){(this.sentAssets=this.sentAssets||new Set()).add(id);Cloud.doc(`team/${this.pid}/a/${id}`).set(a).catch(()=>{})}}},
  // une écriture à la fois par document
  write(path,v){const w=this.writing.get(path);if(w){w.next=v;return}const go=val=>{this.writing.set(path,{});Cloud.doc(path).set(val).catch(e=>{if(!this.warned){this.warned=true;studioOut('Écriture refusée : il faut un accès « peut modifier » au Studio pour éditer en équipe.','err')}}).finally(()=>{const ww=this.writing.get(path);this.writing.delete(path);if(ww&&ww.next)go(ww.next)})};go(v)},
  draw(){if(!this.pid)return;for(const p of this.peers){const pr=p.presence||{};for(const id of(Array.isArray(pr.sel)?pr.sel:[])){const o=CUR_GAME.objects.find(x=>x.id===id);if(o)drawItem({mesh:MESH.box,m:M.mul(M.T(...o.pos),M.S(...V.add(o.size,[.14,.14,.14]))),mode:7,color:/^#[0-9a-f]{6}$/i.test(pr.c)?pr.c:'#ff4fa3',alpha:.1})}}}};
function teamBadge(){return el('span',{id:'teamBadge',class:'teamb',title:'Créateurs connectés',onclick:openInvite})}
function updTeamBadge(){const b=$('teamBadge');if(!b)return;if(!Team.pid){b.textContent='';b.style.display='none';return}b.style.display='';b.innerHTML='';
  b.append(el('span',{text:'👥'}),...[{presence:{n:ACC.pseudo,c:Team.color}},...Team.peers].slice(0,6).map(p=>el('i',{style:`background:${/^#[0-9a-f]{6}$/i.test(p.presence.c)?p.presence.c:'#888'}`,title:filterText(String(p.presence.n||'?')),text:String(p.presence.n||'?').slice(0,1).toUpperCase()})))}
function openInvite(){const g=CUR_GAME;const body=el('div',{class:'cf'},el('h2',{text:'👥 Travailler à plusieurs'}));
  if(!Cloud.shared()){body.append(el('p',{text:'Le travail d\'équipe a besoin d\'un espace partagé : ouvre Cubik Studio dans Claude (et partage-le), ou utilise la version serveur de Cubik.'}));modal(body);return}
  if(!g.team){body.append(el('p',{text:'Transforme ce projet en projet d\'équipe : tes amis pourront le modifier en même temps que toi, et vous verrez ce que chacun sélectionne.'}),
      el('div',{class:'ibtns'},el('button',{class:'btn green',text:'Créer le projet d\'équipe',onclick:async e=>{e.target.disabled=true;try{await Team.create(g);await saveCreation(true);Team.start(g);m.remove();openInvite();buildStudioUI()}catch(err){toast(err.message);e.target.disabled=false}}})));const m=modal(body);return}
  const code='EQUIPE-'+g.id;body.append(el('p',{text:'Pour inviter quelqu\'un :'}),el('ol',{class:'pubsteps'},el('li',{text:Cloud.mode==='server'?'Donne-lui l\'adresse de ton serveur Cubik.':'Sur claude.ai, partage l\'artefact « Cubik Studio » avec ton ami avec l\'accès « peut modifier » (sinon il pourra regarder mais pas éditer).'}),
      el('li',{text:'Il ouvre le Studio → « 👥 Rejoindre un projet » et colle ce code :'})),el('div',{class:'invcode'},el('code',{text:code}),el('button',{class:'btn sm',text:'📋 Copier',onclick:async()=>{try{await navigator.clipboard.writeText(code);toast('Code copié')}catch(e){toast(code)}}})),
    el('h3',{text:'Membres'}),el('div',{class:'mems'},...(g.members||[]).map(n=>{const on=n===ACC.pseudo||Team.peers.some(p=>p.presence.n===n);return el('span',{class:'mem'+(on?' on':''),text:(on?'🟢 ':'⚪ ')+filterText(n)})})));modal(body)}
function joinTeamModal(){const inp=el('input',{type:'text',placeholder:'EQUIPE-…'});inp.onkeydown=e=>e.stopPropagation();const err=el('div',{class:'aerr'});
  const m=modal(el('div',{class:'cf'},el('h2',{text:'👥 Rejoindre un projet'}),el('p',{class:'note',text:'Colle le code donné par le créateur du projet.'}),inp,err,el('div',{class:'ibtns'},el('button',{class:'btn',text:'Annuler',onclick:()=>m.remove()}),
    el('button',{class:'btn green',text:'Rejoindre',onclick:async()=>{const mm=inp.value.trim().match(/^EQUIPE-(t[a-z0-9]{6,20})$/i);if(!mm){err.textContent='Code invalide (il commence par EQUIPE-)';return}
      try{const g=await Team.load(mm[1]);if(!ACC.creations.some(x=>x.id===g.id))ACC.creations.push({id:g.id,team:true,name:g.name,updated:Date.now(),count:g.objects.length,icon:g.icon,color:g.color});markDirty();m.remove();openStudio(g);Team.start(g)}catch(e){err.textContent=e.message}}}))))}
setInterval(()=>{if(MODE==='studio')Team.tick(.35)},350);
