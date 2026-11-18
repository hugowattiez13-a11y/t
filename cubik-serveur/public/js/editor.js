"use strict";
/* ============================================================================
   CUBIK STUDIO — éditeur (interface façon Roblox Studio)
   ============================================================================ */
const TB_CATS=[['parts','Parties'],['gameplay','Gameplay'],['effets','Lumières & effets'],['decor','Décor'],['models','Modèles'],['scripts','Objets scriptés'],['horreur','🎃 Horreur'],['ressources','📦 Ressources']];
const TB_CAT_OF={part:'parts',sphere:'parts',cyl:'parts',neon:'parts',glass:'parts',spawn:'gameplay',checkpoint:'gameplay',finish:'gameplay',lava:'gameplay',bounce:'gameplay',conv:'gameplay',ladder:'gameplay',truss:'gameplay',coin:'gameplay',mover:'gameplay',water:'decor',log:'decor',tree:'decor',sign:'decor',npc:'decor',light:'effets',emitter:'effets',soundblock:'effets',zone:'gameplay',mesh:'ressources',monster:'horreur',key:'gameplay',door:'gameplay'};
const PO=(type,pos,size,x={})=>{const o=newObj(type,pos);if(size)o.size=[...size];return Object.assign(o,x)};
const PREFABS=[
  ['maison','Maison','🏠','models',()=>{const w='#e8dcc4',r='#b5483a',L=[PO('part',[0,.25,0],[10,.5,10],{name:'Plancher',mat:'planches',color:'#a0703c'})];
    L.push(PO('part',[0,2.75,-4.75],[10,4.5,.5],{name:'Mur',color:w,mat:'brique'}),PO('part',[-4.75,2.75,0],[.5,4.5,9],{name:'Mur',color:w,mat:'brique'}),PO('part',[4.75,2.75,0],[.5,4.5,9],{name:'Mur',color:w,mat:'brique'}),
      PO('part',[-3.25,2.75,4.75],[3.5,4.5,.5],{name:'Mur',color:w,mat:'brique'}),PO('part',[3.25,2.75,4.75],[3.5,4.5,.5],{name:'Mur',color:w,mat:'brique'}),PO('part',[0,4.25,4.75],[3,1.5,.5],{name:'Linteau',color:w,mat:'brique'}),
      PO('glass',[-4.75,3,0],[.6,1.6,2.4],{name:'Fenêtre'}),PO('part',[0,5.25,0],[11,.5,11],{name:'Toit',color:r,mat:'ardoise'}),PO('part',[0,5.85,0],[8,.7,8],{name:'Toit',color:r,mat:'ardoise'}),PO('part',[0,6.45,0],[5,.5,5],{name:'Toit',color:r,mat:'ardoise'}));return L}],
  ['tour','Tour de guet','🗼','models',()=>{const L=[];for(const[x,z]of[[-1.8,-1.8],[1.8,-1.8],[-1.8,1.8],[1.8,1.8]])L.push(PO('log',[x,4,z],[.7,8,.7],{name:'Poteau'}));
    L.push(PO('part',[0,8.25,0],[5,.5,5],{name:'Plateforme',mat:'planches',color:'#9a6a3a'}),PO('ladder',[0,4.1,2.6],[1.6,8.2,.25],{name:'Échelle'}),PO('part',[0,10.6,0],[5.6,.4,5.6],{name:'Toit',color:'#7a3b2e',mat:'ardoise'}));
    for(const[x,z]of[[-2.3,-2.3],[2.3,-2.3],[-2.3,2.3],[2.3,2.3]])L.push(PO('part',[x,9.5,z],[.3,2.2,.3],{name:'Pilier',mat:'bois',color:'#6d4a2a'}));return L}],
  ['pont','Pont','🌉','models',()=>{const L=[];for(let i=0;i<8;i++)L.push(PO('part',[0,1,-7+i*2],[4,.3,1.8],{name:'Planche',mat:'planches',color:i%2?'#9a6a3a':'#8a5a2f'}));L.push(PO('log',[-2.1,1.7,0],[16,.35,.35],{name:'Rambarde'}),PO('log',[2.1,1.7,0],[16,.35,.35],{name:'Rambarde'}));return L}],
  ['escalier','Escalier','🪜','models',()=>Array.from({length:8},(_,i)=>PO('part',[0,.25+i*.5,i*1.2],[4,.5,1.2],{name:'Marche',color:'#9aa4b2',mat:'beton'}))],
  ['porte','Porte cliquable','🚪','scripts',()=>[PO('part',[-2,2.5,0],[1,5,1],{name:'Cadre',color:'#6d4a2a',mat:'bois'}),PO('part',[2,2.5,0],[1,5,1],{name:'Cadre',color:'#6d4a2a',mat:'bois'}),PO('part',[0,5.25,0],[5,.5,1],{name:'Cadre',color:'#6d4a2a',mat:'bois'}),
    PO('part',[0,2.5,0],[3,5,.4],{name:'Porte',color:'#c98b4a',mat:'planches',script:TEMPLATES.find(t=>t[0].startsWith('Porte'))[1]})]],
  ['telep','Téléporteurs','🌀','scripts',()=>[PO('neon',[-6,.2,0],[3,.4,3],{name:'Téléporteur A',color:'#39ffb6',script:'local pad = script.Parent\nlocal cible = workspace:FindFirstChild("Téléporteur B")\nlocal pret = true\n\npad.Touched:Connect(function(t, joueur)\n  if pret and cible then\n    pret = false\n    joueur:Teleport(cible.Position + Vector3.new(0, 3, 0))\n    Effects.Ring(cible.Position, "#39ffb6")\n    Sound.Play("boing")\n    wait(1)\n    pret = true\n  end\nend)\n'}),
    PO('neon',[6,.2,0],[3,.4,3],{name:'Téléporteur B',color:'#ff4fa3',script:'local pad = script.Parent\nlocal cible = workspace:FindFirstChild("Téléporteur A")\nlocal pret = true\n\npad.Touched:Connect(function(t, joueur)\n  if pret and cible then\n    pret = false\n    joueur:Teleport(cible.Position + Vector3.new(0, 3, 0))\n    Effects.Ring(cible.Position, "#ff4fa3")\n    Sound.Play("boing")\n    wait(1)\n    pret = true\n  end\nend)\n'})]],
  ['lampadaire','Lampadaire','💡','decor',()=>[PO('cyl',[0,3,0],[.4,6,.4],{name:'Poteau',color:'#30343d',mat:'metal'}),PO('neon',[0,6.2,0],[1,.5,1],{name:'Lampe',color:'#ffe9a8'})]],
  ['ascenseur','Ascenseur','🛗','gameplay',()=>[PO('mover',[0,.5,0],[4,.6,4],{name:'Ascenseur',color:'#ffd23f',move:{axis:'Y',amp:5,speed:.7}})]],
  ['sauts','Parcours de sauts','🏃','gameplay',()=>{const c=['#e5484d','#ff8a3d','#ffd23f','#2fbf71','#3d8bff','#7a5cff'];return c.map((col,i)=>PO('part',[i%2?1.5:-1.5,.5+i*.9,i*4.5],[3,1,3],{name:'Saut',color:col,mat:'lisse'}))}],
  ['tueur','Bloc tueur arc-en-ciel','☠️','scripts',()=>[PO('part',[0,.5,0],[4,1,4],{name:'Bloc tueur',color:'#ff3030',mat:'neon',script:'local b = script.Parent\n\nb.Touched:Connect(function(t, joueur)\n  joueur:Kill()\nend)\n\nlocal h = 0\nwhile true do\n  h += 0.01\n  b.Color = Color3.fromHSV(h % 1, 1, 1)\n  wait(0.03)\nend\n'})]],
  ['pieces','Chemin de pièces','🪙','gameplay',()=>Array.from({length:8},(_,i)=>PO('coin',[0,1.4,i*2.5],null,{name:'Pièce'}))],
  ['cloture','Clôture','🚧','decor',()=>{const L=[];for(let i=0;i<5;i++)L.push(PO('part',[i*2.5-5,.9,0],[.3,1.8,.3],{name:'Piquet',mat:'bois',color:'#e8dcc4'}));L.push(PO('part',[0,1.3,0],[10.3,.2,.15],{name:'Traverse',mat:'bois',color:'#e8dcc4'}),PO('part',[0,.7,0],[10.3,.2,.15],{name:'Traverse',mat:'bois',color:'#e8dcc4'}));return L}],
  ['fontaine','Fontaine','⛲','decor',()=>[PO('cyl',[0,.5,0],[7,1,7],{name:'Bassin',color:'#cfc7b8',mat:'marbre'}),PO('water',[0,1.05,0],[5.6,.3,5.6],{name:'Eau'}),PO('cyl',[0,1.8,0],[.9,2.6,.9],{name:'Colonne',color:'#cfc7b8',mat:'marbre'}),PO('neon',[0,3.3,0],[.6,.6,.6],{name:'Jet',color:'#9ad7ff'})]],
  ['bombe','Bombe','💣','scripts',()=>[PO('sphere',[0,1,0],[2,2,2],{name:'Bombe',color:'#22252b',mat:'lisse',script:TEMPLATES.find(t=>t[0].startsWith('Bombe'))[1]})]],
  ['vitesse','Pad de vitesse','⚡','scripts',()=>[PO('neon',[0,.15,0],[3,.3,3],{name:'Pad de vitesse',color:'#ffd23f',script:TEMPLATES.find(t=>t[0].startsWith('Super'))[1]})]],
  ['foret','Petite forêt','🌲','decor',()=>[PO('tree',[0,2.5,0],[3,5,3]),PO('tree',[4,3,2],[3.5,6,3.5]),PO('tree',[-3,2,3],[2.6,4,2.6]),PO('tree',[2,2.5,-3.5],[3,5,3])]]];

/* ---------- sélection ---------- */
const selList=()=>[...STUDIO.selSet].filter(o=>CUR_GAME.objects.includes(o));
function setSel(list,primary){STUDIO.selSet=new Set(list);STUDIO.sel=primary!==undefined?primary:(list[0]||null);refreshPanels()}
function selObj(o,add){if(o==='game'||o==null){STUDIO.selSet=new Set();STUDIO.sel=o;refreshPanels();return}
  const grp=o.group&&!add?CUR_GAME.objects.filter(x=>x.group===o.group):[o];
  if(add){if(STUDIO.selSet.has(o)){STUDIO.selSet.delete(o);STUDIO.sel=selList()[0]||null}else{STUDIO.selSet.add(o);STUDIO.sel=o}refreshPanels();return}
  setSel(grp,o)}
function refreshPanels(){buildExplorer();buildProps();updRibbonState()}
function fixSel(){const ids=new Set(selList().map(o=>o.id));const pid=STUDIO.sel&&STUDIO.sel!=='game'?STUDIO.sel.id:null;STUDIO.selSet=new Set(CUR_GAME.objects.filter(o=>ids.has(o.id)));
  if(pid)STUDIO.sel=CUR_GAME.objects.find(o=>o.id===pid)||null}

/* ---------- monde de l'éditeur ---------- */
function rebuildEditor(){const keep={...STUDIO.cam};resetWorld();WORLD={motes:false,prompts:[]};const sp=buildObjects(CUR_GAME.objects,false);if(sp)SPAWN=sp;finalizeWorld();editorAtmos();STUDIO.cam=keep;STUDIO.rebuildAt=performance.now();STUDIO.needRebuild=false}
// mise à jour légère pendant un glisser (évite de reconstruire tout le monde à chaque mouvement)
const LIVE_TYPES=new Set(['part','sphere','cyl','neon','glass','spawn','checkpoint','finish','lava','bounce','conv','ladder','truss','mover']);
function liveSync(list){let heavy=false;for(const o of list){if(LIVE_TYPES.has(o.type)){const b=blocks.find(b=>b.obj===o);if(!b){heavy=true;continue}b.pos=[...o.pos];b.base=[...o.pos];b.size=[...o.size];b.color=o.color;bmat(b)}
    else if(o.type==='coin'){const x=extras.find(x=>x.obj===o);if(x){x.pos=[...o.pos];x.base=[...o.pos]}}else if(o.type==='water'){const w=waters.find(w=>w.obj===o);if(w){w.pos=[...o.pos];w.size=[...o.size]}}else heavy=true}
  if(heavy)requestRebuild();else refreshSolids()}
function requestRebuild(){STUDIO.needRebuild=true}
function snapshot(){STUDIO.undo.push(JSON.stringify({o:CUR_GAME.objects,s:CUR_GAME.script,g:CUR_GAME.settings}));if(STUDIO.undo.length>80)STUDIO.undo.shift();STUDIO.redo=[];STUDIO.dirty=true;updTitle()}
function restore(j){const d=JSON.parse(j);CUR_GAME.objects=d.o;CUR_GAME.script=d.s;CUR_GAME.settings=d.g;fixSel();rebuildEditor();refreshPanels();applyEditorFilter()}
const curState=()=>JSON.stringify({o:CUR_GAME.objects,s:CUR_GAME.script,g:CUR_GAME.settings});
function undo(){if(!STUDIO.undo.length)return;STUDIO.redo.push(curState());restore(STUDIO.undo.pop());SFX.click()}
function redo(){if(!STUDIO.redo.length)return;STUDIO.undo.push(curState());restore(STUDIO.redo.pop());SFX.click()}
function commit(fn){snapshot();fn();rebuildEditor();refreshPanels()}
function camDir(){const c=STUDIO.cam,cp=Math.cos(c.pitch);return[-Math.sin(c.yaw)*cp,Math.sin(c.pitch),-Math.cos(c.yaw)*cp]}
function objBox(o){return{mn:V.sub(o.pos,V.mul(o.size,.5)),mx:V.add(o.pos,V.mul(o.size,.5))}}
function hitPoint(ray,skip){let best=null,bt=200;for(const o of CUR_GAME.objects){if(skip&&skip.has(o))continue;const t=rayAABB(ray.o,ray.d,objBox(o));if(t!=null&&t<bt){bt=t;best=o}}
  if(ray.d[1]<-1e-4){const t=-ray.o[1]/ray.d[1];if(t>0&&t<bt){bt=t;best=null}}if(bt>=200)bt=14;return V.add(ray.o,V.mul(ray.d,bt))}
const snapV=v=>{const g=STUDIO.grid;return g?v.map(x=>Math.round(x/g)*g):v};
function newId(){return'o'+(OBJ_ID++)+Math.random().toString(36).slice(2,6)}
function insertAt(kind,p){p=p||hitPoint({o:STUDIO.cam.pos,d:camDir()});snapshot();let list;
  if(kind.startsWith('asset:')){const a=ASSETS.get(kind.slice(6));if(!a)return[];const t=a.type==='sound'?'soundblock':a.type==='mesh'?'mesh':'part';const o=newObj(t,[0,0,0]);if(a.type==='texture'){o.tex=a.id;o.color='#ffffff';o.name=a.name}if(a.type==='sound'){o.sound=a.id;o.sfx='';o.name=a.name}if(a.type==='mesh'){o.mesh=a.id;o.name=a.name}
    o.pos=snapV([p[0],p[1]+o.size[1]/2,p[2]]);CUR_GAME.objects.push(o);rebuildEditor();setSel([o],o);SFX.place();return[o]}
  const pf=PREFABS.find(x=>x[0]===kind);
  if(pf){list=pf[4]();const g='g'+Math.random().toString(36).slice(2,7);CUR_GAME.groups=CUR_GAME.groups||{};CUR_GAME.groups[g]={name:pf[1]};
    const base=snapV([p[0],0,p[2]]);for(const o of list){o.pos=V.add(o.pos,[base[0],p[1],base[2]]);o.group=g}}
  else{const o=newObj(kind,[0,0,0]);o.pos=snapV([p[0],p[1]+o.size[1]/2,p[2]]);if(kind==='npc')o.name='PNJ '+(CUR_GAME.objects.filter(x=>x.type==='npc').length+1);list=[o]}
  CUR_GAME.objects.push(...list);rebuildEditor();setSel(list,list[0]);SFX.place();return list}
function delSel(){const L=selList();if(!L.length)return;const sp=CUR_GAME.objects.filter(x=>x.type==='spawn');if(sp.length&&sp.every(s=>L.includes(s))){studioOut('Il faut garder au moins une apparition.','warn');L.splice(L.indexOf(sp[0]),1);if(!L.length)return}
  snapshot();CUR_GAME.objects=CUR_GAME.objects.filter(x=>!L.includes(x));setSel([],null);rebuildEditor();SFX.click()}
function cloneObjs(L,off){const gmap={};return L.map(o=>{const c=JSON.parse(JSON.stringify(o));c.id=newId();c.pos=V.add(o.pos,off);if(o.group){gmap[o.group]=gmap[o.group]||('g'+Math.random().toString(36).slice(2,7));c.group=gmap[o.group];CUR_GAME.groups=CUR_GAME.groups||{};CUR_GAME.groups[c.group]={name:CUR_GAME.groups?.[o.group]?.name||'Modèle'}}return c})}
function selBounds(L){let mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];for(const o of L){const b=objBox(o);mn=mn.map((v,i)=>Math.min(v,b.mn[i]));mx=mx.map((v,i)=>Math.max(v,b.mx[i]))}return{mn,mx,c:V.mul(V.add(mn,mx),.5),s:V.sub(mx,mn)}}
function dupSel(){const L=selList();if(!L.length)return;snapshot();const b=selBounds(L);const c=cloneObjs(L,[Math.max(STUDIO.grid||.5,b.s[0]+(STUDIO.grid||.5)),0,0]);CUR_GAME.objects.push(...c);rebuildEditor();setSel(c,c[0]);SFX.place()}
function copySel(){const L=selList();if(!L.length)return;STUDIO.clip=JSON.stringify(L);toast(`${L.length} objet(s) copié(s)`)}
function pasteClip(){if(!STUDIO.clip)return;const L=JSON.parse(STUDIO.clip);const b=selBounds(L);const p=hitPoint({o:STUDIO.cam.pos,d:camDir()});const off=snapV(V.sub([p[0],p[1]+b.s[1]/2,p[2]],b.c));snapshot();const c=cloneObjs(L,off);CUR_GAME.objects.push(...c);rebuildEditor();setSel(c,c[0]);SFX.place()}
function rotSel(){const L=selList();if(!L.length)return;const c=selBounds(L).c;commit(()=>{for(const o of L){const d=V.sub(o.pos,c);o.pos=snapV([c[0]-d[2],o.pos[1],c[2]+d[0]]);[o.size[0],o.size[2]]=[o.size[2],o.size[0]];o.yaw=((o.yaw||0)+Math.PI/2)%(Math.PI*2);if(o.dir)o.dir={'+X':'+Z','+Z':'-X','-X':'-Z','-Z':'+X'}[o.dir];if(o.move&&o.move.axis!=='Y')o.move.axis=o.move.axis==='X'?'Z':'X'}})}
function groupSel(){const L=selList();if(L.length<2){toast('Sélectionne au moins 2 objets (Ctrl + clic)');return}commit(()=>{const g='g'+Math.random().toString(36).slice(2,7);CUR_GAME.groups=CUR_GAME.groups||{};CUR_GAME.groups[g]={name:'Modèle'};for(const o of L)o.group=g})}
function ungroupSel(){const L=selList();commit(()=>{for(const o of L)delete o.group})}
function dropToGround(){const L=selList();if(!L.length)return;commit(()=>{const b=selBounds(L);const dy=-b.mn[1];for(const o of L)o.pos[1]+=dy})}
function alignSel(ax){const L=selList();if(L.length<2)return;const p=STUDIO.sel;commit(()=>{for(const o of L)o.pos[ax]=p.pos[ax]})}
function focusSel(){const L=selList();if(!L.length)return;const b=selBounds(L),d=camDir(),r=Math.max(...b.s)*1.4+6;STUDIO.cam.pos=V.sub(b.c,V.mul(d,r))}
async function saveCreation(silent){CUR_GAME.updated=Date.now();if(CUR_GAME.team){const e=(ACC.creations||[]).find(x=>x.id===CUR_GAME.id);if(e)Object.assign(e,{name:CUR_GAME.name,updated:CUR_GAME.updated,count:CUR_GAME.objects.length,icon:CUR_GAME.icon,color:CUR_GAME.color});Team.t=0;Team.tick(0);for(const id of CUR_GAME.assets||[]){const a=ASSETS.get(id);if(a)saveAssetDoc(a).catch(()=>{})}STUDIO.dirty=false;updTitle();markDirty();if(!silent)toast('Projet d\'équipe synchronisé ✓');return}
  for(const id of CUR_GAME.assets||[]){const a=ASSETS.get(id);if(a)saveAssetDoc(a).catch(()=>{})}const idx=ACC.creations=ACC.creations||[];const e=idx.find(x=>x.id===CUR_GAME.id);const meta={id:CUR_GAME.id,name:CUR_GAME.name,updated:CUR_GAME.updated,published:CUR_GAME.published,count:CUR_GAME.objects.length,icon:CUR_GAME.icon,color:CUR_GAME.color};
  if(e)Object.assign(e,meta);else idx.push(meta);try{await Store.putDoc('game_'+CUR_GAME.id,CUR_GAME);STUDIO.dirty=false;updTitle();markDirty();if(!silent){toast('Jeu enregistré ✓');SFX.click()}}catch(err){toast('Échec de l\'enregistrement : '+(err.message||err.code||'erreur'))}}
function updTitle(){const t=$('stDirty');if(t)t.textContent=STUDIO.dirty?'● non enregistré':'✓ enregistré'}
function applyEditorFilter(){applyVisualFilter(STUDIO.filterPreview?CUR_GAME?.settings?.filter:null)}

/* ---------- ouvrir / fermer ---------- */
function openStudio(game){CUR_GAME=game;game.groups=game.groups||{};game.settings=game.settings||{};STUDIO.sel=null;STUDIO.selSet=new Set();STUDIO.undo=[];STUDIO.redo=[];STUDIO.out=[];STUDIO.testing=false;STUDIO.dirty=false;
  MODE='studio';showScreen('studio');$('stHome')&&$('stHome').classList.remove('on');
  resetWorld();WORLD={motes:false,prompts:[]};resetSky();setClock(game.settings.clock??14);rebuildEditor();
  const sp=CUR_GAME.objects.find(o=>o.type==='spawn');if(sp){STUDIO.cam={pos:V.add(sp.pos,[14,11,16]),yaw:.72,pitch:-.45}}
  buildStudioUI();applyEditorFilter();loadAssetDocs(game.assets).then(()=>{if(CUR_GAME===game){rebuildEditor();refreshPanels()}});studioOut('Studio prêt. ▶ Jouer pour tester ton jeu.','log');Music.play('studio');if(typeof reloadPlugins==='function')reloadPlugins()}
async function quitStudio(){if(STUDIO.dirty)await saveCreation(true);Team.stop();applyVisualFilter(null);MODE='home';resetWorld();resetSky();CUR_GAME=null;
  if(window.CUBIK_MODE==='studio')showStudioHome();else openLauncher('create')}

/* ---------- interface : barre de titre + ruban ---------- */
let RIB='accueil';
const RIBBONS=[['accueil','Accueil'],['modele','Modèle'],['tester','Tester'],['affichage','Affichage'],['plugins','Plugins']];
function rbtn(ic,label,fn,o={}){return el('button',{class:'rb'+(o.on?' on':'')+(o.big?' big':''),title:o.title||label,onclick:fn,...(o.id?{id:o.id}:{})},el('span',{class:'ri',text:ic}),el('span',{class:'rl',text:label}))}
const rgrp=(name,...kids)=>el('div',{class:'rg'},el('div',{class:'rgb'},...kids.filter(Boolean)),el('div',{class:'rgn',text:name}));
function buildStudioUI(){const top=$('stTop');top.innerHTML='';
  const name=el('input',{type:'text',value:CUR_GAME.name,maxlength:'40',class:'stname'});name.onkeydown=e=>e.stopPropagation();name.onchange=()=>{snapshot();CUR_GAME.name=name.value.trim()||'Mon jeu'};
  const tabs=el('div',{class:'rtabs'},el('button',{class:'rfile',text:'← Mes jeux',onclick:quitStudio}),...RIBBONS.map(([k,l])=>el('button',{class:'rtab'+(RIB===k?' on':''),text:l,onclick:()=>{RIB=k;buildStudioUI()}})),
    el('div',{class:'tsp'}),teamBadge(),el('span',{class:'stblox',title:'Blox du Studio (pour l\'Assistant)',html:`${BLOX}<b>${ACC.blox|0}</b>`}),name,el('span',{id:'stDirty',class:'stdirty'}),el('button',{class:'stb',title:'Annuler (Ctrl+Z)',text:'↶',onclick:undo}),el('button',{class:'stb',title:'Rétablir (Ctrl+Y)',text:'↷',onclick:redo}),
    el('button',{class:'stb',title:'Enregistrer (Ctrl+S)',text:'💾',onclick:()=>saveCreation()}),el('button',{class:'btn sm',text:'👥 Inviter',onclick:openInvite}),el('button',{class:'btn sm gold',text:'🌐 Publier',onclick:openPublish}));
  const rib=el('div',{class:'ribbon'});
  if(RIB==='accueil'){const grid=el('select',{class:'stsel',title:'Pas de déplacement'});for(const[v,l]of[[0,'Libre'],[.25,'0,25'],[.5,'0,5'],[1,'1'],[2,'2'],[4,'4']])grid.append(el('option',{value:v,text:'Pas : '+l}));grid.value=STUDIO.grid;grid.onchange=()=>STUDIO.grid=+grid.value;
    const col=el('input',{type:'color',class:'rcol',title:'Couleur de la sélection',value:STUDIO.sel?.color||'#a3a2a5'});col.onchange=()=>{const L=selList();if(L.length)commit(()=>L.forEach(o=>o.color=col.value))};
    const mat=el('select',{class:'stsel',title:'Matériau de la sélection'});mat.append(el('option',{value:'',text:'Matériau…'}));for(const[k,m]of Object.entries(MATS))if(m.fr&&!['lave','trampoline','tapis','buche'].includes(k))mat.append(el('option',{value:k,text:m.fr}));
    mat.onchange=()=>{const L=selList().filter(o=>['part','sphere','cyl','mover'].includes(o.type));if(L.length&&mat.value)commit(()=>L.forEach(o=>o.mat=mat.value));mat.value=''};
    const ins=el('select',{class:'stsel'});ins.append(el('option',{value:'',text:'＋ Insérer…'}));for(const[id,l,ic]of INSERTS)ins.append(el('option',{value:id,text:ic+' '+l}));ins.onchange=()=>{if(ins.value)insertAt(ins.value);ins.value=''};
    rib.append(rgrp('Presse-papiers',rbtn('📋','Coller',pasteClip,{big:1}),el('div',{class:'rcolm'},rbtn('⧉','Copier',copySel),rbtn('✂️','Dupliquer',dupSel))),
      rgrp('Outils',rbtn('🖱️','Sélection',()=>{STUDIO.tool='select';buildStudioUI()},{on:STUDIO.tool==='select',big:1}),rbtn('✥','Déplacer',()=>{STUDIO.tool='move';buildStudioUI()},{on:STUDIO.tool==='move',big:1}),rbtn('⤡','Taille',()=>{STUDIO.tool='scale';buildStudioUI()},{on:STUDIO.tool==='scale',big:1}),rbtn('⟳','Pivoter 90°',rotSel,{big:1}),el('div',{class:'rcolm'},grid)),
      rgrp('Insérer',el('div',{class:'rcolm'},ins,rbtn('🧰','Boîte à outils',()=>togglePanel('toolbox')))),
      rgrp('Modifier',el('div',{class:'rcolm'},el('label',{class:'rlab'},col,'Couleur'),mat),rbtn('📦','Grouper',groupSel),rbtn('🗃️','Dégrouper',ungroupSel),rbtn('🗑️','Supprimer',delSel)),
      rgrp('Aide',rbtn('🤖','Assistant',openAssistant,{big:1}),rbtn('🎓','Tutoriel code',openTuto,{big:1})),
      rgrp('Tester',rbtn('▶','Jouer',()=>startTest(),{big:1})))}
  else if(RIB==='modele'){rib.append(rgrp('Parties',...['part','sphere','cyl','neon','glass'].map(t=>{const d=INSERTS.find(i=>i[0]===t);return rbtn(d[2],d[1],()=>insertAt(t))})),
      rgrp('Gameplay',...['spawn','checkpoint','finish','lava','bounce','coin','mover'].map(t=>{const d=INSERTS.find(i=>i[0]===t);return rbtn(d[2],d[1],()=>insertAt(t))})),
      rgrp('Aligner',rbtn('⇔','Aligner X',()=>alignSel(0)),rbtn('⇕','Aligner Y',()=>alignSel(1)),rbtn('⤢','Aligner Z',()=>alignSel(2)),rbtn('⬇️','Poser au sol',dropToGround)),
      rgrp('Script',rbtn('📜','Script objet',()=>{const o=STUDIO.sel;if(o&&o!=='game')openCode(o);else toast('Sélectionne un objet')}),rbtn('🧠','Script principal',()=>openCode('game')),rbtn('📘','Aide',openDocs)),
      rgrp('Ressources',rbtn('📦','Ressources',openAssets,{big:1})),rgrp('Ambiance',rbtn('🎃','Mode Horreur',toggleHorror,{big:1,on:!!CUR_GAME.settings.horror}),rbtn('🔆','Lumière',()=>insertAt('light')),rbtn('✨','Particules',()=>insertAt('emitter')),rbtn('🔊','Son',()=>insertAt('soundblock'))),
      rgrp('Lumière',rbtn('🎨','Filtre visuel',()=>selObj('game')),rbtn('🌗','Jour/nuit',()=>{snapshot();CUR_GAME.settings.clock=((CUR_GAME.settings.clock??14)+6)%24;setClock(CUR_GAME.settings.clock);buildProps()})))}
  else if(RIB==='tester'){rib.append(rgrp('Tester',rbtn('▶','Jouer',()=>startTest(),{big:1}),rbtn('📍','Jouer ici',()=>startTest(true),{big:1,title:'Apparaître devant la caméra'})),
      rgrp('Vérifier',rbtn('🔎','Vérifier les scripts',checkAllScripts,{big:1}),rbtn('🛡️','Filtre de texte',checkTextFilter,{big:1})))}
  else if(RIB==='affichage'){const P=STUDIO.panels;rib.append(rgrp('Fenêtres',rbtn('🧰','Boîte à outils',()=>togglePanel('toolbox'),{on:P.toolbox}),rbtn('🌳','Explorateur',()=>togglePanel('explorer'),{on:P.explorer}),rbtn('🧾','Propriétés',()=>togglePanel('props'),{on:P.props}),rbtn('📟','Sortie',()=>togglePanel('out'),{on:P.out}),rbtn('⌨️','Commande',()=>togglePanel('cmd'),{on:P.cmd})),
      rgrp('Affichage',rbtn('💡','Éclairage de travail',()=>{STUDIO.workLight=!STUDIO.workLight;editorAtmos();buildStudioUI()},{on:STUDIO.workLight,title:'Éclaire la scène pour construire (le jeu garde sa vraie ambiance)'}),rbtn('🎨','Aperçu du filtre',()=>{STUDIO.filterPreview=!STUDIO.filterPreview;applyEditorFilter();buildStudioUI()},{on:STUDIO.filterPreview}),rbtn('🎯','Centrer (F)',focusSel),rbtn('🏠','Vue d\'ensemble',()=>{STUDIO.cam={pos:[30,26,34],yaw:.72,pitch:-.55}})))}
  else if(RIB==='plugins'){rib.append(rgrp('Gérer',rbtn('🧩','Plugins',openPluginManager,{big:1}),rbtn('✨','Nouveau plugin',newPlugin,{big:1})));
    for(const p of (typeof PLUGINS!=='undefined'?PLUGINS:[]))if(p.on&&p.buttons&&p.buttons.length)rib.append(rgrp(p.name,...p.buttons.map(b=>rbtn(b.icon||'🔧',b.name,()=>runPluginButton(p,b)))));
    if(!rib.querySelector('.rg+.rg'))rib.append(el('div',{class:'note',style:'align-self:center;margin:0 12px',text:'Active des plugins avec « Plugins » : leurs boutons apparaissent ici.'}))}
  top.append(tabs,rib);updTitle();updTeamBadge();applyPanels();buildToolbox();refreshPanels();renderOut()}
function updRibbonState(){const c=document.querySelector('.rcol');if(c&&STUDIO.sel&&STUDIO.sel!=='game'&&STUDIO.sel.color)c.value=STUDIO.sel.color}
function togglePanel(k){STUDIO.panels[k]=!STUDIO.panels[k];applyPanels();if(RIB==='affichage')buildStudioUI()}
function applyPanels(){const P=STUDIO.panels,st=$('studio');st.classList.toggle('noTb',!P.toolbox);st.classList.toggle('noEx',!P.explorer);st.classList.toggle('noPr',!P.props);st.classList.toggle('noOut',!P.out&&!P.cmd);st.classList.toggle('noSide',!P.explorer&&!P.props);
  $('stOutBox').style.display=P.out?'':'none';$('stCmd').style.display=P.cmd?'':'none'}

/* ---------- boîte à outils ---------- */
let TB_CAT='all',TB_Q='';
function buildToolbox(){const T=$('stToolbox');T.innerHTML='';const q=el('input',{type:'search',placeholder:'🔍 Rechercher…',value:TB_Q,class:'tbq'});q.onkeydown=e=>e.stopPropagation();q.oninput=()=>{TB_Q=q.value;drawList()};
  const cats=el('div',{class:'tbcats'});for(const[k,l]of[['all','Tout'],...TB_CATS])cats.append(el('button',{class:'tbc'+(TB_CAT===k?' on':''),text:l,onclick:()=>{TB_CAT=k;buildToolbox()}}));
  const list=el('div',{class:'tblist'});T.append(el('h5',{text:'Boîte à outils'}),q,cats,list);
  function drawList(){list.innerHTML='';const n=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');const qq=n(TB_Q.trim());
    const items=[...INSERTS.map(([id,l,ic])=>({id,l,ic,cat:TB_CAT_OF[id]})),...PREFABS.map(([id,l,ic,cat])=>({id,l,ic,cat,pf:true})),...(CUR_GAME.assets||[]).map(id=>ASSETS.get(id)).filter(Boolean).map(a=>({id:'asset:'+a.id,l:a.name,ic:assetKind[a.type][0],cat:'ressources',pf:false}))].filter(i=>(TB_CAT==='all'||i.cat===TB_CAT)&&(!qq||n(i.l).includes(qq)));
    if(TB_CAT==='ressources')list.append(el('button',{class:'tbi',onclick:openAssets},el('span',{text:'➕'}),el('small',{text:'Gérer les ressources'})));
    if(!items.length)list.append(el('div',{class:'note',text:'Aucun résultat.'}));
    for(const i of items){const b=el('button',{class:'tbi',title:i.l+(i.pf?' (modèle)':''),draggable:'true',onclick:()=>insertAt(i.id)},el('span',{text:i.ic}),el('small',{text:i.l}),i.pf?el('em',{text:'modèle'}):null);
      b.addEventListener('dragstart',e=>{e.dataTransfer.setData('text/cubik',i.id);e.dataTransfer.effectAllowed='copy'});list.append(b)}}
  drawList();setTimeout(()=>{if(TB_Q)q.focus()},0)}

/* ---------- explorateur ---------- */
let EX_Q='',EX_OPEN=new Set(['ws']);
function buildExplorer(){const ex=$('stExplorer');if(!ex||!CUR_GAME)return;ex.innerHTML='';
  const q=el('input',{type:'search',placeholder:'🔍 Filtrer l\'espace de travail',value:EX_Q,class:'exq'});q.onkeydown=e=>e.stopPropagation();q.oninput=()=>{EX_Q=q.value;drawTree();};
  const tree=el('div',{class:'extree'});ex.append(q,tree);
  function drawTree(){tree.innerHTML='';const n=s=>String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');const qq=n(EX_Q.trim());
    const node=(depth,ic,label,opts={})=>{const d=el('div',{class:'exi'+(opts.on?' on':'')+(opts.multi?' multi':''),style:`padding-left:${6+depth*14}px`,onclick:opts.click,ondblclick:opts.dbl,oncontextmenu:opts.ctx},
        opts.tog!=null?el('b',{class:'tog',text:opts.tog?'▾':'▸',onclick:e=>{e.stopPropagation();opts.toggle()}}):el('b',{class:'tog'}),el('span',{class:'eic',text:ic}),el('span',{class:'enm',text:label}),opts.badge?el('em',{text:opts.badge}):null);tree.append(d);return d};
    const objNode=(o,depth)=>{const ic=INSERTS.find(i=>i[0]===o.type)?.[2]||'▫️';const bad=textIsFiltered(o.name)||(o.text&&textIsFiltered(o.text));
      node(depth,ic,o.name,{on:STUDIO.selSet.has(o),multi:STUDIO.selSet.has(o)&&STUDIO.sel!==o,click:e=>selObj(o,e.ctrlKey||e.metaKey||e.shiftKey),dbl:()=>{selObj(o);focusSel()},ctx:e=>{e.preventDefault();if(!STUDIO.selSet.has(o))selObj(o);ctxMenu(e.clientX,e.clientY)},badge:(o.script&&o.script.trim()?'📜':'')+(bad?'⚠️':'')})};
    if(qq){const m=CUR_GAME.objects.filter(o=>n(o.name).includes(qq)||n(INSERTS.find(i=>i[0]===o.type)?.[1]||'').includes(qq));tree.append(el('div',{class:'note',style:'margin:4px 8px',text:`${m.length} résultat(s)`}));m.forEach(o=>objNode(o,0));return}
    node(0,'🌐','Workspace',{tog:EX_OPEN.has('ws'),toggle:()=>{EX_OPEN.has('ws')?EX_OPEN.delete('ws'):EX_OPEN.add('ws');drawTree()},click:()=>{EX_OPEN.add('ws');drawTree()},badge:String(CUR_GAME.objects.length)});
    if(EX_OPEN.has('ws')){const seen=new Set();for(const o of CUR_GAME.objects){if(o.group){if(seen.has(o.group))continue;seen.add(o.group);const g=o.group,mem=CUR_GAME.objects.filter(x=>x.group===g),open=EX_OPEN.has(g),allSel=mem.every(x=>STUDIO.selSet.has(x));
          node(1,'📦',CUR_GAME.groups?.[g]?.name||'Modèle',{on:allSel,tog:open,toggle:()=>{open?EX_OPEN.delete(g):EX_OPEN.add(g);drawTree()},click:()=>setSel(mem,mem[0]),dbl:()=>{setSel(mem,mem[0]);focusSel()},ctx:e=>{e.preventDefault();setSel(mem,mem[0]);ctxMenu(e.clientX,e.clientY)},badge:String(mem.length)});
          if(open)mem.forEach(x=>objNode(x,2))}else objNode(o,1)}}
    node(0,'💡','Lighting',{on:STUDIO.sel==='game',click:()=>selObj('game'),badge:fmtClock(CUR_GAME.settings.clock??14)});
    node(0,'🖥️','ServerScriptService',{tog:true,toggle:()=>{}});node(1,'📜','Script principal',{click:()=>selObj('game'),dbl:()=>openCode('game'),badge:CUR_GAME.script&&CUR_GAME.script.trim()?'✓':''});
    node(0,'👥','Players',{});node(1,'🧑',(ACC?.pseudo||'Joueur')+' (test)',{});
    node(0,'🧩','Plugins',{click:openPluginManager,badge:String((typeof PLUGINS!=='undefined'?PLUGINS:[]).filter(p=>p.on).length)});
    const on=tree.querySelector('.exi.on');if(on)on.scrollIntoView({block:'nearest'})}
  drawTree()}
function ctxMenu(x,y){document.querySelectorAll('.ctxm').forEach(m=>m.remove());const L=selList();const it=(ic,l,fn,k)=>el('button',{onclick:()=>{m.remove();fn()}},el('span',{text:ic}),l,k?el('kbd',{text:k}):null);
  const m=el('div',{class:'ctxm',style:`left:${Math.min(x,innerWidth-210)}px;top:${Math.min(y,innerHeight-330)}px`},it('✏️','Renommer',renameSel,'F2'),it('⧉','Copier',copySel,'Ctrl+C'),it('📋','Coller',pasteClip,'Ctrl+V'),it('✂️','Dupliquer',dupSel,'Ctrl+D'),
    it('📜','Ajouter / éditer le script',()=>{if(STUDIO.sel&&STUDIO.sel!=='game')openCode(STUDIO.sel)}),it('📦','Grouper',groupSel,'Ctrl+G'),it('🗃️','Dégrouper',ungroupSel),it('🎯','Centrer la caméra',focusSel,'F'),it('⬇️','Poser au sol',dropToGround),it('🗑️','Supprimer',delSel,'Suppr'));
  if(!L.length)return;document.body.append(m);setTimeout(()=>addEventListener('pointerdown',function f(e){if(!m.contains(e.target)){m.remove();removeEventListener('pointerdown',f,true)}},true),0)}
function renameSel(){const o=STUDIO.sel;if(!o||o==='game')return;const inp=el('input',{type:'text',value:o.name,maxlength:'30'});const m=modal(el('div',{class:'cf'},el('h2',{text:'Renommer'}),inp,el('div',{class:'ibtns'},el('button',{class:'btn',text:'Annuler',onclick:()=>m.remove()}),el('button',{class:'btn green',text:'OK',onclick:ok}))));
  inp.onkeydown=e=>{e.stopPropagation();if(e.key==='Enter')ok()};setTimeout(()=>{inp.focus();inp.select()},50);function ok(){const v=inp.value.trim();if(v)commit(()=>o.name=v);m.remove()}}

/* ---------- propriétés ---------- */
let PR_Q='',PR_SHUT=new Set();
function buildProps(){const P_=$('stProps');if(!P_||!CUR_GAME)return;P_.innerHTML='';const o=STUDIO.sel,L=selList();
  const q=el('input',{type:'search',placeholder:'🔍 Filtrer les propriétés',value:PR_Q,class:'exq'});q.onkeydown=e=>e.stopPropagation();q.oninput=()=>{PR_Q=q.value;filterRows()};P_.append(q);
  const body=el('div',{class:'prbody'});P_.append(body);
  let sec=null;const section=t=>{const shut=PR_SHUT.has(t);const h=el('div',{class:'prsec'+(shut?' shut':''),onclick:()=>{shut?PR_SHUT.delete(t):PR_SHUT.add(t);buildProps()}},el('b',{text:shut?'▸':'▾'}),t);sec=el('div',{class:'prgrp'});if(shut)sec.style.display='none';body.append(h,sec)};
  const row=(label,...inputs)=>{const r=el('div',{class:'prop','data-k':label.toLowerCase()},el('label',{text:label}),el('div',{class:'pin'},...inputs));sec.append(r);return r};
  function filterRows(){const qq=PR_Q.trim().toLowerCase();body.querySelectorAll('.prop').forEach(r=>r.style.display=!qq||r.dataset.k.includes(qq)?'':'none')}
  if(!o){body.append(el('div',{class:'note',style:'padding:10px',text:'Clique sur un objet (Ctrl + clic pour en sélectionner plusieurs). Fais glisser des éléments depuis la boîte à outils.'}));return}
  if(o==='game'){const g=CUR_GAME,S=g.settings;const live=fn=>{STUDIO.dirty=true;updTitle();fn()};
    section('Jeu');const desc=el('textarea',{maxlength:'200',placeholder:'Description du jeu'});desc.value=g.desc||'';desc.onkeydown=e=>e.stopPropagation();desc.onchange=()=>{snapshot();g.desc=desc.value};row('Description',desc);
    const icon=el('input',{type:'text',maxlength:'4',value:g.icon||'🎮',class:'iconin'});icon.onkeydown=e=>e.stopPropagation();icon.onchange=()=>{snapshot();g.icon=icon.value||'🎮'};const col=el('input',{type:'color',value:g.color||'#7a5cff'});col.onchange=()=>{snapshot();g.color=col.value};row('Icône · couleur',icon,col);
    const mus=el('select',{});for(const[k,l]of[['sandbox','Détente'],['obby','Énergique'],['tycoon','Funky'],['rpg','Aventure'],['boss','Combat'],['horreur','Horreur'],['menu','Calme'],['victoire','Fête'],['none','Aucune']])mus.append(el('option',{value:k,text:l}));mus.value=S.music||'sandbox';mus.onchange=()=>{snapshot();S.music=mus.value};row('Musique',mus);
    section('Lighting');const clock=el('input',{type:'range',min:0,max:24,step:.25,value:S.clock??14});const clo=el('output',{text:fmtClock(S.clock??14)});clock.oninput=()=>{STUDIO.workLight=false;S.clock=+clock.value;clo.textContent=fmtClock(+clock.value);setClock(+clock.value);live(()=>{})};clock.onpointerdown=()=>snapshot();row('ClockTime',clock,clo);
    const fog=el('input',{type:'range',min:0,max:1,step:.05,value:S.fog||0}),fgo=el('output',{text:Math.round((S.fog||0)*100)+' %'});fog.onpointerdown=()=>snapshot();fog.oninput=()=>{STUDIO.workLight=false;S.fog=+fog.value;fgo.textContent=Math.round(S.fog*100)+' %';applyFog(S);STUDIO.dirty=true;updTitle()};row('Brouillard',fog,fgo);
    const grav=el('input',{type:'range',min:.2,max:2,step:.1,value:S.grav??1});const gro=el('output',{text:'×'+(S.grav??1)});grav.onpointerdown=()=>snapshot();grav.oninput=()=>{S.grav=+grav.value;gro.textContent='×'+grav.value;live(()=>{})};row('Gravité',grav,gro);
    section('Filtre visuel');const F=S.filter=S.filter||{preset:'aucun',sat:1,con:1,bri:1,vig:0};
    const pre=el('select',{});for(const[k,[l]]of Object.entries(VFX_PRESETS))pre.append(el('option',{value:k,text:l}));pre.value=F.preset;pre.onchange=()=>{snapshot();F.preset=pre.value;applyEditorFilter()};row('Préréglage',pre);
    const sl=(k,label,min,max,step)=>{const r=el('input',{type:'range',min,max,step,value:F[k]??(k==='vig'?0:1)}),out=el('output',{text:(+r.value).toFixed(2)});r.onpointerdown=()=>snapshot();r.oninput=()=>{F[k]=+r.value;out.textContent=(+r.value).toFixed(2);applyEditorFilter();STUDIO.dirty=true;updTitle()};row(label,r,out)};
    sl('sat','Saturation',0,2.5,.05);sl('con','Contraste',.5,1.8,.05);sl('bri','Luminosité',.5,1.6,.05);sl('vig','Vignette',0,1,.05);
    body.append(el('div',{class:'filtprev'},...Object.entries(VFX_PRESETS).map(([k,[l]])=>el('button',{class:'fp'+(F.preset===k?' on':''),onclick:()=>{snapshot();F.preset=k;applyEditorFilter();buildProps()}},el('i',{style:`filter:${vfxCss({preset:k})}`}),l))));
    section('🎟️ Passes de jeu');passesEditor(sec,f=>{snapshot();f();buildProps()});
    section('Scripts');sec.append(el('button',{class:'btn green sm wide',text:'📜 Éditer le script principal',onclick:()=>openCode('game')}),el('div',{class:'note',text:`${g.objects.length} objets · le script principal s'exécute au lancement du jeu.`}));filterRows();return}
  // objets (un ou plusieurs)
  const all=fn=>L.every(fn),apply=(fn,keepUI)=>{snapshot();L.forEach(fn);rebuildEditor();if(!keepUI)refreshPanels()};
  const kindName=INSERTS.find(i=>i[0]===o.type)?.[1]||o.type;
  body.prepend(el('div',{class:'prhead'},el('span',{text:INSERTS.find(i=>i[0]===o.type)?.[2]||''}),L.length>1?`${L.length} objets sélectionnés`:`${o.name}`,el('small',{text:L.length>1?'les modifications s\'appliquent à tous':kindName})));
  const num=(arr,i,step=.5,min)=>{const inp=el('input',{type:'number',step,value:+o[arr][i].toFixed(3)});inp.onkeydown=e=>e.stopPropagation();inp.onchange=()=>{let v=+inp.value;if(!isFinite(v))return;if(min!=null)v=Math.max(min,v);
      if(arr==='pos'){const d=v-o.pos[i];apply(x=>x.pos[i]+=d)}else apply(x=>x.size[i]=v)};return inp};
  section('Données');if(L.length===1){const nm=el('input',{type:'text',value:o.name,maxlength:'30'});nm.onkeydown=e=>e.stopPropagation();nm.onchange=()=>apply(x=>x.name=nm.value.trim()||kindName);row('Name',nm);
    if(textIsFiltered(o.name))sec.append(el('div',{class:'warnf',text:'⚠️ Ce nom contient un mot filtré : il s\'affichera ###.'}))}
  row('ClassName',el('span',{class:'ro',text:kindName}));if(o.group)row('Modèle',el('span',{class:'ro',text:CUR_GAME.groups?.[o.group]?.name||'Modèle'}));
  section('Transformation');row('Position',num('pos',0),num('pos',1),num('pos',2));if(L.length===1)row('Size',num('size',0,.5,.1),num('size',1,.5,.1),num('size',2,.5,.1));
  section('Apparence');
  if(all(x=>['part','sphere','cyl','neon','glass','mover','bounce','conv','spawn','checkpoint','light','emitter','soundblock','zone','key','door','mesh'].includes(x.type))){const c=el('input',{type:'color',value:o.color||'#a3a2a5'});c.onpointerdown=()=>{};c.onchange=()=>apply(x=>x.color=c.value,true);
    c.oninput=()=>{for(const x of L){x.color=c.value;const b=blocks.find(b=>b.obj===x);if(b)b.color=c.value}};row('Color',c);
    const sw=el('div',{class:'qcol'});for(const h of['#ffffff','#a3a2a5','#1f2028','#e5484d','#ff8a3d','#ffd23f','#2fbf71','#39c5bb','#3d8bff','#7a5cff','#ff4fa3','#8d5524'])sw.append(el('button',{style:`background:${h}`,onclick:()=>apply(x=>x.color=h,true)}));row('',sw)}
  if(all(x=>['part','sphere','cyl','mover'].includes(x.type))){const m=el('select',{});for(const[k,mm]of Object.entries(MATS))if(mm.fr&&!['lave','trampoline','tapis','buche'].includes(k))m.append(el('option',{value:k,text:mm.fr}));m.value=o.mat;m.onchange=()=>apply(x=>x.mat=m.value);row('Material',m);
    const sh=el('select',{});for(const[v,l]of[['','Bloc'],['sphere','Boule'],['cyl','Cylindre']])sh.append(el('option',{value:v,text:l}));sh.value=o.shape||'';sh.onchange=()=>apply(x=>{x.shape=sh.value||undefined});row('Shape',sh)}
  if(all(x=>['part','sphere','cyl','mover','glass','neon'].includes(x.type))){const tr=el('input',{type:'range',min:0,max:1,step:.05,value:o.transp||0});tr.onchange=()=>apply(x=>x.transp=+tr.value,true);row('Transparency',tr)}
  if(all(x=>x.type==='sign'||x.type==='npc')){const t=el('textarea',{maxlength:'200'});t.value=o.text||'';t.onkeydown=e=>e.stopPropagation();t.onchange=()=>apply(x=>x.text=t.value);row(o.type==='sign'?'Text':'Réplique',t);
    if(textIsFiltered(o.text||''))sec.append(el('div',{class:'warnf',text:'⚠️ Texte filtré dans le jeu : '+filterText(o.text)}))}
  if(all(x=>x.type==='npc')){const a=el('select',{});for(const k of Object.keys(NPC_AV))a.append(el('option',{value:k,text:k}));a.value=o.av||'guide';a.onchange=()=>apply(x=>x.av=a.value);row('Tenue',a)}
  typeProps(o,L,all,apply,section,row,()=>sec);
  section('Comportement');
  if(all(x=>['part','sphere','cyl','mover','glass','neon'].includes(x.type))){const co=el('button',{class:'sw'+(o.collide!==false?' on':'')});co.onclick=()=>apply(x=>x.collide=o.collide===false);row('CanCollide',co);
    if(all(x=>x.type!=='glass'&&x.type!=='neon')){const kd=el('select',{});for(const[k,l]of[['solid','Normal'],['lava','Lave (tue)'],['bounce','Trampoline']])kd.append(el('option',{value:k,text:l}));kd.value=o.kind||'solid';kd.onchange=()=>apply(x=>x.kind=kd.value);row('Type',kd)}}
  if(all(x=>x.type==='conv')){const d=el('select',{});for(const v of['+X','-X','+Z','-Z'])d.append(el('option',{value:v,text:v}));d.value=o.dir||'+Z';d.onchange=()=>apply(x=>x.dir=d.value);const s=el('input',{type:'number',step:1,value:o.speed||6});s.onkeydown=e=>e.stopPropagation();s.onchange=()=>apply(x=>x.speed=+s.value);row('Direction',d);row('Vitesse',s)}
  if(all(x=>x.type==='mover')){const a=el('select',{});for(const v of['X','Y','Z'])a.append(el('option',{value:v,text:'Axe '+v}));a.value=o.move.axis;a.onchange=()=>apply(x=>x.move.axis=a.value);
    const am=el('input',{type:'number',step:.5,value:o.move.amp});am.onkeydown=e=>e.stopPropagation();am.onchange=()=>apply(x=>x.move.amp=+am.value);const sp=el('input',{type:'number',step:.1,value:o.move.speed});sp.onkeydown=e=>e.stopPropagation();sp.onchange=()=>apply(x=>x.move.speed=+sp.value);row('Mouvement',a);row('Amplitude',am);row('Vitesse',sp)}
  if(all(x=>x.type==='sign'||x.type==='npc')){const y=el('select',{});for(const[v,l]of[[0,'0°'],[Math.PI/2,'90°'],[Math.PI,'180°'],[Math.PI*1.5,'270°']])y.append(el('option',{value:v,text:l}));y.value=String(o.yaw||0);y.onchange=()=>apply(x=>x.yaw=+y.value);row('Orientation',y)}
  if(L.length===1&&!['water','tree','coin','sign'].includes(o.type)){section('Script');sec.append(el('button',{class:'btn green sm wide',text:o.script&&o.script.trim()?'📜 Éditer le script':'📜 Ajouter un script',onclick:()=>openCode(o)}))}
  body.append(el('div',{class:'pbtns'},el('button',{class:'btn sm',text:'⧉ Dupliquer',onclick:dupSel}),el('button',{class:'btn sm',text:'⟳ 90°',onclick:rotSel}),el('button',{class:'btn sm red',text:'🗑 Supprimer',onclick:delSel})));filterRows()}
const fmtClock=h=>`${Math.floor(h)}h${String(Math.round((h%1)*60)).padStart(2,'0')}`;

/* ---------- sortie + barre de commande ---------- */
let OUT_F='all';
function renderOut(){const o=$('stOut');if(!o)return;STUDIO.outDirty=false;o.innerHTML='';const L=STUDIO.out.filter(l=>OUT_F==='all'||l.k===OUT_F).slice(-120);
  for(const l of L)o.append(el('div',{class:'ol '+l.k},el('span',{class:'ot',text:l.t}),' '+l.m,l.n>1?el('b',{class:'oc',text:'×'+l.n}):null));o.scrollTop=o.scrollHeight;
  document.querySelectorAll('#stOutF button').forEach(b=>b.classList.toggle('on',b.dataset.f===OUT_F))}
function renderTestOut(){const o=$('tOut');if(!o||!STUDIO.outDirty)return;STUDIO.outDirty=false;o.innerHTML='';for(const l of STUDIO.out.slice(-6))o.append(el('div',{class:'ol '+l.k,text:l.m+(l.n>1?' ×'+l.n:'')}))}
function initOutputBar(){document.querySelectorAll('#stOutF button').forEach(b=>b.onclick=()=>{OUT_F=b.dataset.f;renderOut()});
  const c=$('stCmdIn'),hist=[];let hi=0;c.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'&&c.value.trim()){const src=c.value;hist.push(src);hi=hist.length;studioOut('> '+src,'cmd');c.value='';runCommand(src)}
    if(e.key==='ArrowUp'&&hi>0){hi--;c.value=hist[hi]}if(e.key==='ArrowDown'){hi=Math.min(hist.length,hi+1);c.value=hist[hi]||''}})}

/* ---------- vérifications ---------- */
function checkAllScripts(){let n=0,bad=0;const chk=(src,name)=>{if(!src||!src.trim())return;n++;try{CS.parse(src)}catch(e){bad++;studioOut(`${name} (ligne ${e.line||'?'}) : ${e.message}`,'err')}};
  chk(CUR_GAME.script,'Script principal');for(const o of CUR_GAME.objects)chk(o.script,`Script de « ${o.name} »`);studioOut(`Vérification : ${n} script(s), ${bad} erreur(s) de syntaxe.`,bad?'warn':'log');togglePanelOn('out')}
function textProblems(g){const P=[];const t=(s,where)=>{if(s&&textIsFiltered(s))P.push([where,s,filterText(s)])};t(g.name,'Nom du jeu');t(g.desc,'Description');for(const o of g.objects){t(o.name,`Nom de « ${o.name} »`);t(o.text,`Texte de « ${o.name} »`)}
  const strs=src=>(src||'').match(/"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'/g)||[];for(const s of strs(g.script))t(s.slice(1,-1),'Script principal');for(const o of g.objects)for(const s of strs(o.script))t(s.slice(1,-1),`Script de « ${o.name} »`);return P}
function checkTextFilter(){const P=textProblems(CUR_GAME);if(!P.length)studioOut('🛡️ Filtre de texte : aucun mot interdit trouvé.','log');else for(const[w,s,f]of P)studioOut(`🛡️ ${w} : « ${s} » → « ${f} »`,'warn');togglePanelOn('out')}
function togglePanelOn(k){if(!STUDIO.panels[k]){STUDIO.panels[k]=true;applyPanels()}}

/* ---------- tests ---------- */
let STUDIO_SAVE=null;
function startTest(here){if(STUDIO.testing)return;if(typeof TUTO!=='undefined')TUTO.tested=true;if(STUDIO.needRebuild)rebuildEditor();STUDIO.testing=true;STUDIO_SAVE={cam:{...STUDIO.cam}};studioOut('▶ Test lancé','log');
  GAME_ID='custom';const G=GAMES.custom;G.name=CUR_GAME.name;try{buildGameWith(G,{},true)}catch(e){console.error(e);studioOut('Erreur au lancement : '+e.message,'err');STUDIO.testing=false;rebuildEditor();return}
  if(here){const p=hitPoint({o:STUDIO_SAVE.cam.pos,d:camDir()});pl.pos=[p[0],p[1]+.1,p[2]];pl.vel=[0,0,0];cam.target=V.add(pl.pos,[0,2,0]);cam.yaw=STUDIO_SAVE.cam.yaw}
  showScreen('gameUI');MODE='game'}
function stopTest(){if(!STUDIO.testing)return;try{GAMES.custom.exit()}catch(e){}STUDIO.testing=false;studioOut('■ Test arrêté','log');$('gmenu').classList.remove('open');$('dialog').classList.remove('open');$('result').classList.remove('open');
  pl=null;MODE='studio';showScreen('studio');setClock(CUR_GAME.settings?.clock??14);rebuildEditor();STUDIO.cam=STUDIO_SAVE.cam;editorAtmos();buildStudioUI();applyEditorFilter();Music.play('studio')}

/* ---------- rendu & contrôles ---------- */
function studioCamUpdate(dt){const c=STUDIO.cam,k=STUDIO.keys;if(document.activeElement&&/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))return;
  const sp=(k.has('ShiftLeft')||k.has('ShiftRight')?40:16)*dt,f=camDir(),r=[Math.cos(c.yaw),0,-Math.sin(c.yaw)];let m=[0,0,0];
  if(k.has('KeyW'))m=V.add(m,f);if(k.has('KeyS'))m=V.sub(m,f);if(k.has('KeyD'))m=V.add(m,r);if(k.has('KeyA'))m=V.sub(m,r);if(k.has('KeyE')||k.has('Space'))m[1]+=1;if(k.has('KeyQ'))m[1]-=1;
  const t=STUDIO.touchMove;if(t)m=V.add(V.add(m,V.mul(f,t[1])),V.add(V.mul(r,t[0]),[0,t[2]||0,0]));
  if(V.len(m)>0)c.pos=V.add(c.pos,V.mul(V.norm(m),sp))}
function handleSize(o){return clamp(V.len(V.sub(o.pos,STUDIO.cam.pos))*.11,.6,8)}
const AXES=[[1,0,0],[0,1,0],[0,0,1]],AXC=['#ff4d4d','#43e660','#4d8bff'];
function renderStudio(dt){if(STUDIO.needRebuild&&performance.now()-(STUDIO.rebuildAt||0)>90)rebuildEditor();
  if(PLUG_RT)try{PLUG_RT.tick(dt)}catch(e){}
  studioCamUpdate(dt);const c=STUDIO.cam,eye=c.pos,target=V.add(eye,camDir());worldFx(dt,time,false);
  setCull(eye,target,65);const L=[],TR=[];for(const p of blocks)if(inView(p.pos,bRad(p)))blockDraw(p,L,TR);
  for(const d of decos)L.push({mesh:MESH.cube,m:M.mul(M.T(...d.pos),M.S(...d.size)),mode:3,color:d.color,shin:50});
  for(const s of signs){const w_=(s.o.w||512)/134.7,h_=(s.o.h||170)/121.4,R=M.mul(M.T(...s.pos),M.RY(s.yaw));L.push({mesh:MESH.box,m:M.mul(R,M.S(w_,h_,.2)),mode:3,color:'#6d4a2a',shin:10},{mesh:MESH.quad1,m:M.mul(R,M.chain(M.T(0,0,.11),M.S(w_,h_,1))),mode:0,tex:s.tex,shin:4})}
  for(const ch of chars){ch.a.armL=ch.a.armR=0;charDraws(ch,L,TR,time)}
  for(const x of extras)if(x.type==='coin')L.push({mesh:MESH.cyl,m:M.chain(M.T(...x.pos),M.RY(time*2),M.RX(Math.PI/2),M.S(.85,.16,.85)),mode:3,color:'#ffc61a',shin:200,emis:HDR?.4:.1});
  drawWorldExtras(L,TR);
  for(const w_ of waters){const mn=V.sub(w_.pos,V.mul(w_.size,.5));TR.push({mesh:MESH.box,m:M.mul(M.T(...w_.pos),M.S(...w_.size)),mode:9,color:w_.color||'#3fb6c9',shin:200,bmin:mn,bsize:w_.size})}
  const VP=renderFrame(dt,{eye,target,L,TR,shadowCenter:V.add(eye,V.mul(camDir(),20)),fov:65,noFlare:true});
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,cv.width,cv.height);gl.disable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  beginScene({VP,eye,LVP:M.id(),hdr:0,taps:0,noLights:true});const o=STUDIO.sel,box=(x,col,a,pad)=>drawItem({mesh:MESH.box,m:M.mul(M.T(...x.pos),M.S(...V.add(x.size,[pad,pad,pad]))),mode:7,color:col,alpha:a});
  if(STUDIO.hoverObj&&!STUDIO.selSet.has(STUDIO.hoverObj))box(STUDIO.hoverObj,'#9ad7ff',.05,.06);
  for(const x of STUDIO.selSet)if(x!==o)box(x,'#7fb2ff',.08,.08);
  Team.draw();
  if(o&&o!=='game'&&CUR_GAME.objects.includes(o)){box(o,'#3d8bff',.12,.1);const s=handleSize(o);
    if(STUDIO.tool!=='select')AXES.forEach((a,i)=>{const hot=STUDIO.hover===i||(STUDIO.drag&&STUDIO.drag.axis===i);const col=hot?'#ffe14d':AXC[i];
      if(STUDIO.tool==='move')for(const sg of[1,-1]){const rot=i===0?M.RZ(-Math.PI/2*sg):i===2?M.RX(Math.PI/2*sg):(sg<0?M.RX(Math.PI):M.id());const L_=s*1.1;const dir=V.mul(a,sg),hh=STUDIO.hover===i+(sg<0?3:0)||(STUDIO.drag&&STUDIO.drag.h===i+(sg<0?3:0));const cc=hh?'#ffe14d':AXC[i];
        const base=V.add(o.pos,V.mul(dir,o.size[i]/2));drawItem({mesh:MESH.cyl,m:M.chain(M.T(...V.add(base,V.mul(dir,L_/2))),rot,M.S(s*.07,L_,s*.07)),mode:3,color:cc,emis:.9,shin:10});
        drawItem({mesh:MESH.cone,m:M.chain(M.T(...V.add(base,V.mul(dir,L_+s*.12))),rot,M.S(s*.22,s*.3,s*.22)),mode:3,color:cc,emis:.9,shin:10})}
      else for(const sg of[1,-1]){const p=V.add(o.pos,V.mul(a,sg*(o.size[i]/2+s*.35)));drawItem({mesh:MESH.sphere,m:M.mul(M.T(...p),M.S(s*.26,s*.26,s*.26)),mode:3,color:(STUDIO.hover===i+(sg<0?3:0)||(STUDIO.drag&&STUDIO.drag.h===i+(sg<0?3:0)))?'#ffe14d':AXC[i],emis:.9,shin:10})}})}
  gl.disable(gl.BLEND);gl.enable(gl.DEPTH_TEST)}
function pickHandle(ray){const o=STUDIO.sel;if(!o||o==='game'||STUDIO.tool==='select'||!CUR_GAME.objects.includes(o))return null;const s=handleSize(o);let best=null,bd=1e9;
  AXES.forEach((a,i)=>{for(const sg of[1,-1]){const dir=V.mul(a,sg);if(STUDIO.tool==='move'){const base=V.add(o.pos,V.mul(dir,o.size[i]/2)),L_=s*1.45,d=segDist(ray,base,V.add(base,V.mul(dir,L_)));if(d<s*.2&&d<bd){bd=d;best={axis:i,h:i+(sg<0?3:0),sg}}}
    else{const p=V.add(o.pos,V.mul(dir,o.size[i]/2+s*.35)),t=V.dot(V.sub(p,ray.o),ray.d),q=V.add(ray.o,V.mul(ray.d,t)),d=V.len(V.sub(q,p));if(t>0&&d<s*.28&&d<bd){bd=d;best={axis:i,h:i+(sg<0?3:0),sg}}}}});return best}
function segDist(ray,a,b){const u=V.sub(b,a),Lu=V.len(u),ud=V.mul(u,1/Lu),w0=V.sub(ray.o,a),bb=V.dot(ray.d,ud),dd=V.dot(ray.d,w0),e=V.dot(ud,w0),den=1-bb*bb;let sc=den<1e-6?0:(bb*e-dd)/den,tc=den<1e-6?e:(e-bb*dd)/den;
  tc=clamp(tc,0,Lu);if(sc<0)sc=0;const p1=V.add(ray.o,V.mul(ray.d,sc)),p2=V.add(a,V.mul(ud,tc));return V.len(V.sub(p1,p2))}
function axisParam(ray,origin,axis){const w0=V.sub(origin,ray.o),b=V.dot(axis,ray.d),d=V.dot(axis,w0),e=V.dot(ray.d,w0),den=1-b*b;if(Math.abs(den)<1e-5)return null;return(b*e-d)/den}
function pickObj(ray){let best=null,bt=1e9;for(const o of CUR_GAME.objects){if(o.size[0]>=60&&o.size[2]>=60)continue;const t=rayAABB(ray.o,ray.d,objBox(o));if(t!=null&&t<bt){bt=t;best=o}}
  if(!best){for(const o of CUR_GAME.objects)if(o.size[0]>=60&&o.size[2]>=60){const t=rayAABB(ray.o,ray.d,objBox(o));if(t!=null&&t<bt){bt=t;best=o}}}return best}
function initStudioInput(){const view=$('stView');let ptrs=new Map(),down=null,pinch=0;
  view.addEventListener('contextmenu',e=>e.preventDefault());
  view.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='copy'});
  view.addEventListener('drop',e=>{e.preventDefault();const k=e.dataTransfer.getData('text/cubik');if(!k)return;insertAt(k,hitPoint(screenRay(e.clientX,e.clientY)))});
  view.addEventListener('pointerdown',e=>{audioInit();view.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,[e.clientX,e.clientY]);document.activeElement?.blur?.();document.querySelectorAll('.ctxm').forEach(m=>m.remove());
    if(ptrs.size===2){const[a,b]=[...ptrs.values()];pinch=Math.hypot(a[0]-b[0],a[1]-b[1]);if(STUDIO.drag){STUDIO.drag=null}down=null;return}
    const ray=screenRay(e.clientX,e.clientY);down={x:e.clientX,y:e.clientY,btn:e.button,moved:0,touch:e.pointerType==='touch',add:e.ctrlKey||e.metaKey||e.shiftKey};
    if(e.button===0){const h=pickHandle(ray);if(h){const o=STUDIO.sel;snapshot();const L=selList();STUDIO.drag={...h,o,start:axisParam(ray,o.pos,AXES[h.axis]),pos0:[...o.pos],size0:[...o.size],others:L.map(x=>[x,[...x.pos]])};return}}
    if(e.button===2||e.button===1)STUDIO.look=true});
  view.addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId);const ray=screenRay(e.clientX,e.clientY);
    if(!p){if(!STUDIO.drag&&CUR_GAME){const h=pickHandle(ray);STUDIO.hover=h?h.h:null;STUDIO.hoverObj=h?null:pickObj(ray);view.style.cursor=h?'grab':STUDIO.hoverObj?'pointer':''}return}
    const dx=e.clientX-p[0],dy=e.clientY-p[1];p[0]=e.clientX;p[1]=e.clientY;if(down)down.moved+=Math.abs(dx)+Math.abs(dy);
    if(ptrs.size===2){const[a,b]=[...ptrs.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1]);STUDIO.cam.pos=V.add(STUDIO.cam.pos,V.mul(camDir(),(d-pinch)*.08));pinch=d;return}
    const dr=STUDIO.drag;if(dr){const t=axisParam(ray,dr.pos0,AXES[dr.axis]);if(t==null||dr.start==null)return;let dl=t-dr.start;const g=STUDIO.grid;if(g)dl=Math.round(dl/g)*g;const o=dr.o;
      if(STUDIO.tool==='move'){for(const[x,p0]of dr.others){x.pos=[...p0];x.pos[dr.axis]=p0[dr.axis]+dl}liveSync(dr.others.map(z=>z[0]))}
      else{const sg=dr.sg;let ns=dr.size0[dr.axis]+dl*sg;ns=Math.max(g||.2,ns);const real=(ns-dr.size0[dr.axis])*sg;o.size=[...dr.size0];o.size[dr.axis]=ns;o.pos=[...dr.pos0];o.pos[dr.axis]=dr.pos0[dr.axis]+real/2;liveSync([o])}
      return}
    if(STUDIO.look||(down&&down.touch&&down.moved>4)){STUDIO.cam.yaw-=dx*.005;STUDIO.cam.pitch=clamp(STUDIO.cam.pitch-dy*.005,-1.5,1.5)}});
  const up=e=>{const was=ptrs.has(e.pointerId);ptrs.delete(e.pointerId);if(!was)return;
    if(STUDIO.drag){STUDIO.drag=null;rebuildEditor();buildProps();return}
    if(down&&down.btn===0&&down.moved<6){const ray=screenRay(e.clientX,e.clientY);const o=pickObj(ray);if(o)selObj(o,down.add);else if(!down.add)selObj(null)}
    if(down&&down.btn===2&&down.moved<6){const o=pickObj(screenRay(e.clientX,e.clientY));if(o){if(!STUDIO.selSet.has(o))selObj(o);ctxMenu(e.clientX,e.clientY)}}
    STUDIO.look=false;down=null};
  view.addEventListener('pointerup',up);view.addEventListener('pointercancel',up);
  view.addEventListener('wheel',e=>{e.preventDefault();STUDIO.cam.pos=V.add(STUDIO.cam.pos,V.mul(camDir(),-e.deltaY*.03))},{passive:false});
  addEventListener('keydown',e=>{if(MODE!=='studio'||!CUR_GAME)return;if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if($('stCode').classList.contains('open')||document.querySelector('.modal'))return;const k=e.code,C=e.ctrlKey||e.metaKey;
    if(C&&k==='KeyZ'){e.preventDefault();undo();return}if(C&&k==='KeyY'){e.preventDefault();redo();return}if(C&&k==='KeyD'){e.preventDefault();dupSel();return}if(C&&k==='KeyS'){e.preventDefault();saveCreation();return}
    if(C&&k==='KeyC'){e.preventDefault();copySel();return}if(C&&k==='KeyV'){e.preventDefault();pasteClip();return}if(C&&k==='KeyG'){e.preventDefault();e.shiftKey?ungroupSel():groupSel();return}if(C&&k==='KeyA'){e.preventDefault();setSel(CUR_GAME.objects.filter(o=>!(o.size[0]>=60&&o.size[2]>=60)));return}
    if(k==='Delete'||k==='Backspace'){delSel();return}if(k==='KeyF'){focusSel();return}if(k==='F2'){e.preventDefault();renameSel();return}if(k==='KeyR'&&C){e.preventDefault();rotSel();return}
    if(k==='Digit1'){STUDIO.tool='select';buildStudioUI();return}if(k==='Digit2'){STUDIO.tool='move';buildStudioUI();return}if(k==='Digit3'){STUDIO.tool='scale';buildStudioUI();return}
    if(k==='F5'){e.preventDefault();startTest();return}if(k==='Escape'){selObj(null);return}if(!C)STUDIO.keys.add(k)});
  addEventListener('keyup',e=>STUDIO.keys.delete(e.code));addEventListener('blur',()=>STUDIO.keys.clear());
  document.querySelectorAll('#stPad [data-m]').forEach(b=>{const v=b.dataset.m.split(',').map(Number);b.addEventListener('pointerdown',e=>{e.preventDefault();STUDIO.touchMove=v});['pointerup','pointerleave','pointercancel'].forEach(ev=>b.addEventListener(ev,()=>STUDIO.touchMove=null))});
  initOutputBar()}
/* ---------- éditeur de script ---------- */
const TEMPLATES=[
 ['Bloc qui tue','local bloc = script.Parent\n\nbloc.Touched:Connect(function(touche, joueur)\n  joueur:Kill()\nend)\n'],
 ['Bloc qui tue (style Roblox)','local bloc = script.Parent\n\nbloc.Touched:Connect(function(touche)\n  local humanoid = touche.Parent:FindFirstChild("Humanoid")\n  if humanoid then\n    humanoid.Health = 0\n  end\nend)\n'],
 ['Pièce à ramasser','local piece = script.Parent\nlocal prise = false\n\npiece.Touched:Connect(function(touche, joueur)\n  if prise then return end\n  prise = true\n  joueur:AddStat("Pièces", 1)\n  Sound.Play("coin")\n  Effects.Sparkles(piece.Position)\n  piece.Transparency = 1\n  wait(5)\n  piece.Transparency = 0\n  prise = false\nend)\n'],
 ['Porte qui s\'ouvre au clic','local porte = script.Parent\nlocal ouverte = false\n\nporte.Clicked:Connect(function(joueur)\n  ouverte = not ouverte\n  porte.CanCollide = not ouverte\n  local cible = 0\n  if ouverte then cible = 0.8 end\n  TweenService:Create(porte, TweenInfo.new(0.4), {Transparency = cible}):Play()\n  Sound.Play("click")\nend)\n'],
 ['Couleurs arc-en-ciel','local bloc = script.Parent\nlocal t = 0\n\nwhile true do\n  t = t + 0.02\n  bloc.Color = Color3.fromHSV(t % 1, 0.8, 1)\n  wait(0.05)\nend\n'],
 ['Plateforme qui va et vient','local p = script.Parent\nlocal depart = p.Position\nlocal arrivee = depart + Vector3.new(0, 0, 12)\n\nwhile true do\n  TweenService:Create(p, TweenInfo.new(2, "Sine"), {Position = arrivee}):Play()\n  wait(2.5)\n  TweenService:Create(p, TweenInfo.new(2, "Sine"), {Position = depart}):Play()\n  wait(2.5)\nend\n'],
 ['Téléporteur','local pad = script.Parent\nlocal cible = workspace:FindFirstChild("Arrivée")\n\npad.Touched:Connect(function(touche, joueur)\n  if cible then\n    joueur:Teleport(cible.Position + Vector3.new(0, 3, 0))\n    Effects.Ring(cible.Position, "#39ffb6")\n  else\n    warn("Ajoute un objet nommé « Arrivée » !")\n  end\nend)\n'],
 ['Bombe (explosion)','local bombe = script.Parent\n\nbombe.Touched:Connect(function()\n  Effects.Explosion(bombe.Position, 8)\n  bombe:Destroy()\nend)\n'],
 ['Super saut / vitesse','local pad = script.Parent\n\npad.Touched:Connect(function(touche, joueur)\n  local h = joueur.Character.Humanoid\n  h.WalkSpeed = 32\n  h.JumpPower = 90\n  UI.Hint("Super pouvoirs pendant 5 s !", 5)\n  wait(5)\n  h.WalkSpeed = 16\n  h.JumpPower = 50\nend)\n'],
 ['Minuteur (script du jeu)','local joueur = game.Players.LocalPlayer\njoueur:SetStat("Temps", 0)\n\nwhile true do\n  wait(1)\n  joueur:AddStat("Temps", 1)\nend\n'],
 ['Jour et nuit (script du jeu)','local Lighting = game:GetService("Lighting")\n\nwhile true do\n  Lighting.ClockTime = (Lighting.ClockTime + 0.05) % 24\n  wait(0.1)\nend\n'],
 ['Pluie de blocs','for i = 1, 20 do\n  local b = Instance.new("Part", workspace)\n  b.Position = Vector3.new(math.random(-20, 20), 30, math.random(-20, 20))\n  b.Size = Vector3.new(2, 2, 2)\n  b.Color = Color3.fromHSV(math.random(), 0.8, 1)\n  TweenService:Create(b, TweenInfo.new(1.5, "Bounce"), {Position = b.Position - Vector3.new(0, 28, 0)}):Play()\n  wait(0.2)\nend\n'],
 ['PNJ qui parle (sur un PNJ)','local pnj = script.Parent\n\npnj.Talked:Connect(function(joueur)\n  pnj:Say("Salut " .. joueur.Name .. " ! Trouve les 3 pièces cachées 😉")\nend)\n']];
const HL_KW=/\b(and|break|do|else|elseif|end|false|for|function|if|in|local|nil|not|or|repeat|return|then|true|until|while)\b/g;
function highlight(src){const esc=s=>s.replace(/&/g,'&amp;').replace(/</g,'&lt;');let out='';const re=/(--\[\[[\s\S]*?\]\]|--[^\n]*)|("(?:\\.|[^"\\\n])*"?|'(?:\\.|[^'\\\n])*'?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_À-ÿ][\wÀ-ÿ]*)|([\s\S])/g;let m;
  while((m=re.exec(src))){if(m[1])out+=`<span class="hc">${esc(m[1])}</span>`;else if(m[2])out+=`<span class="hs">${esc(m[2])}</span>`;else if(m[3])out+=`<span class="hn">${m[3]}</span>`;
    else if(m[4]){const w=m[4];out+=/^(and|break|do|else|elseif|end|false|for|function|if|in|local|nil|not|or|repeat|return|then|true|until|while)$/.test(w)?`<span class="hk">${w}</span>`:/^(game|workspace|script|wait|print|warn|Vector3|Color3|Instance|TweenService|TweenInfo|UI|Sound|Effects|math|string|table|task|pairs|ipairs|tostring|tonumber|Lighting|Players)$/.test(w)?`<span class="hb">${w}</span>`:esc(w)}
    else out+=esc(m[5])}return out+'\n'}
let codeTarget=null;
function openCode(target){codeTarget=target;const isPl=target&&target.plugin;const src=target==='game'?CUR_GAME.script:isPl?target.plugin.src:(target.script||'');const box=$('stCode');box.classList.add('open');
  $('ceTitle').textContent=target==='game'?'📜 Script principal du jeu':isPl?`🧩 Plugin « ${target.plugin.name} »`:`📜 Script de « ${target.name} »`;const ta=$('ceText');ta.value=src||(target==='game'||isPl?'':'local objet = script.Parent\n\n');$('ceTpl').style.display=isPl?'none':'';acHide();syncCode();checkCode();ta.focus()}
function syncCode(){const ta=$('ceText');$('ceHl').innerHTML=highlight(ta.value);const n=ta.value.split('\n').length;$('ceLines').textContent=Array.from({length:n},(_,i)=>i+1).join('\n');$('ceHl').scrollTop=ta.scrollTop;$('ceLines').scrollTop=ta.scrollTop;$('ceHl').scrollLeft=ta.scrollLeft}
function checkCode(){const ta=$('ceText');try{CS.parse(ta.value);$('ceErr').textContent='✓ Aucune erreur de syntaxe';$('ceErr').className='ceok'}catch(e){$('ceErr').textContent=`Ligne ${e.line||'?'} : ${e.message}`;$('ceErr').className='ceerr'}}
function closeCode(save){const ta=$('ceText');acHide();if(save&&codeTarget){if(codeTarget.plugin){codeTarget.plugin.src=ta.value;savePlugins();reloadPlugins();toast('Plugin enregistré et rechargé')}else{snapshot();if(codeTarget==='game')CUR_GAME.script=ta.value;else codeTarget.script=ta.value;buildExplorer();buildProps()}}$('stCode').classList.remove('open');codeTarget=null}
function initCodeEditor(){const ta=$('ceText');ta.addEventListener('input',()=>{syncCode();acUpdate();clearTimeout(ta.t);ta.t=setTimeout(checkCode,400)});ta.addEventListener('scroll',()=>{syncCode();acHide()});ta.addEventListener('blur',()=>setTimeout(acHide,150));ta.addEventListener('click',acHide);
  ta.addEventListener('keydown',e=>{e.stopPropagation();if(acKey(e))return;if(e.key==='Tab'){e.preventDefault();const s=ta.selectionStart;ta.setRangeText('  ',s,ta.selectionEnd,'end');syncCode()}
    if(e.key==='Enter'){e.preventDefault();const s=ta.selectionStart,line=ta.value.slice(0,s).split('\n').pop(),ind=line.match(/^\s*/)[0]+(/\b(then|do|function\b.*\)|repeat|else)\s*$/.test(line)?'  ':'');ta.setRangeText('\n'+ind,s,ta.selectionEnd,'end');syncCode()}
    if((e.ctrlKey||e.metaKey)&&e.key==='s'){e.preventDefault();const p=codeTarget&&codeTarget.plugin;closeCode(true);if(!p)saveCreation()}if(e.key==='Escape')closeCode(true)});
  const tp=$('ceTpl');tp.append(el('option',{value:'',text:'📋 Modèles de scripts…'}));TEMPLATES.forEach(([n],i)=>tp.append(el('option',{value:i,text:n})));
  tp.onchange=()=>{if(tp.value==='')return;const t=TEMPLATES[+tp.value][1];if(!ta.value.trim()||confirmReplace())ta.value=t;tp.value='';syncCode();checkCode()};
  $('ceOk').onclick=()=>closeCode(true);$('ceCancel').onclick=()=>closeCode(false);$('ceDocs').onclick=()=>openDocs()}
const confirmReplace=()=>true;
function openDocs(){const sec=(t,rows)=>el('div',{},el('h3',{text:t}),el('table',{class:'doc'},...rows.map(([a,b])=>el('tr',{},el('td',{},el('code',{text:a})),el('td',{text:b})))));
  modal(el('div',{class:'docs'},el('h2',{text:'📘 Aide CubeScript'}),el('p',{class:'note',text:'CubeScript est le langage de Cubik, inspiré de Lua (comme sur Roblox). Chaque objet peut avoir son script : script.Parent désigne l\'objet. Le script principal s\'exécute au lancement.'}),
    sec('Bases du langage',[['local x = 10','variable locale'],['if a > b then … elseif … else … end','condition'],['for i = 1, 10 do … end','boucle numérique'],['for k, v in pairs(t) do … end','parcourir une table'],['while cond do … end','boucle (mets un wait() dedans !)'],['function nom(a, b) … return a + b end','fonction'],['local t = {1, 2, nom = "Léo"}','table'],['"a" .. "b"','coller du texte'],['x += 1','raccourci'],['-- commentaire','commentaire']]),
    sec('Temps & événements',[['wait(1)','attend 1 seconde'],['task.spawn(f) · task.delay(2, f)','lancer en parallèle'],['part.Touched:Connect(function(touche, joueur) … end)','quand le joueur touche'],['part.TouchEnded:Connect(f)','quand il ne touche plus'],['part.Clicked:Connect(function(joueur) … end)','clic / tap sur la partie'],['game:GetService("RunService").Heartbeat:Connect(function(dt) … end)','chaque image']]),
    sec('Parties (Part)',[['part.Position = Vector3.new(0, 5, 0)','position'],['part.Size','taille'],['part.Color = Color3.fromRGB(255, 0, 0)','couleur (ou "#ff0000")'],['part.Transparency = 0.5','transparence 0 → 1'],['part.CanCollide = false','traversable'],['part.Material = "Néon"','matériau (nom de la galerie)'],['part.Type = "Lave"','Normal, Lave, Trampoline, Tapis'],['part:Destroy() · part:Clone()','supprimer / copier'],['Instance.new("Part", workspace)','créer une partie'],['workspace:FindFirstChild("Nom")','trouver une partie']]),
    sec('Joueur',[['game.Players.LocalPlayer','le joueur'],['joueur:SetStat("Pièces", 0) · :AddStat · :GetStat','classement'],['joueur:Kill() · joueur:Teleport(Vector3)','tuer / téléporter'],['joueur.Character.Humanoid.Health','vie (0–100)'],['Humanoid.WalkSpeed · JumpPower','vitesse (16) · saut (50)'],['joueur:Chat("…") · joueur:Emote("danse")','parler / emote']]),
    sec('Lumière & filtre visuel',[['local L = game:GetService("Lighting")','service de lumière'],['L.ClockTime = 20','heure du jour'],['L.Filter = "Rétro"','Aucun, Vif, Chaud, Froid, Rétro, Noir et blanc, Cinéma, Rêve, Vision nocturne, Pop'],['L.Saturation · L.Contrast · L.Brightness','réglages (1 = normal)']]),
    sec('Plugins (API Studio)',[['plugin:Button("Nom", "🔧", function() … end)','ajoute un bouton dans l\'onglet Plugins'],['Studio.GetSelection()','table des objets sélectionnés'],['Studio.Insert("part", Vector3.new(0, 5, 0))','insère un objet (part, sphere, lava, coin…)'],['Studio.GetObjects() · Studio.Find("Nom")','tous les objets / chercher'],['Studio.Select(obj ou table) · Studio.Delete(obj)','sélectionner / supprimer'],['Studio.Group(table, "Nom")','grouper en modèle'],['Studio.CameraPosition · Studio.CameraLook','caméra de l\'éditeur'],['obj.Name · Position · Size · Color · Material · Type · Text · Script','propriétés modifiables']]),
    sec('Effets, sons, interface',[['TweenService:Create(part, TweenInfo.new(1, "Bounce"), {Position = v}):Play()','animation fluide'],['Effects.Explosion(pos, rayon) · Confetti · Sparkles · Smoke · Ring','effets'],['Sound.Play("coin")','coin, jump, win, buy, boom, click, error, hit, boing, checkpoint…'],['UI.Message("Texte", 3) · UI.Hint("…") · UI.Notify("…")','messages à l\'écran (filtrés : les gros mots deviennent ###)'],['game:GetService("Lighting").ClockTime = 20','heure du jour'],['workspace.Gravity = 100','gravité (196 par défaut)'],['print(…) · warn(…)','écrit dans la Sortie']])),'wide')}


/* ---------- autocomplétion ---------- */
const AC_WORDS=[...new Set(('and break do else elseif end false for function if in local nil not or repeat return then true until while '+
 'game workspace script wait print warn tick time pairs ipairs tostring tonumber type select unpack error assert spawn delay task.wait task.spawn task.delay '+
 'Vector3.new Vector3.zero Color3.new Color3.fromRGB Color3.fromHSV Color3.fromHex Instance.new TweenService TweenInfo.new UI.Message UI.Hint UI.Notify Sound.Play '+
 'Effects.Explosion Effects.Confetti Effects.Sparkles Effects.Smoke Effects.Ring math.random math.floor math.ceil math.abs math.sqrt math.sin math.cos math.max math.min math.clamp math.pi '+
 'string.format string.sub string.upper string.lower string.len string.rep string.split table.insert table.remove table.concat table.find table.sort '+
 'Players LocalPlayer GetService GetPlayers RunService Heartbeat Lighting ClockTime Filter Saturation Contrast Brightness Gravity '+
 'Position Size Color Transparency CanCollide Material Name Parent Type Touched TouchEnded Clicked Talked Connect Disconnect Destroy Clone FindFirstChild WaitForChild GetChildren IsA SetAttribute GetAttribute '+
 'Character Humanoid HumanoidRootPart Health MaxHealth WalkSpeed JumpPower TakeDamage SetStat AddStat GetStat Teleport Kill Chat Emote Say Play Cancel Completed Create Magnitude Unit Lerp '+
 'Studio Studio.GetSelection Studio.Insert Studio.GetObjects Studio.Find Studio.Select Studio.Delete Studio.Group Studio.CameraPosition Studio.CameraLook plugin Button Text Script').split(' '))];
let AC={on:false,items:[],i:0,start:0};
function acWordAt(ta){const s=ta.selectionStart,before=ta.value.slice(0,s),m=before.match(/[A-Za-z_][\w.]*$/);return m?{w:m[0],start:s-m[0].length}:null}
function acUpdate(){const ta=$('ceText'),r=acWordAt(ta);if(!r||r.w.length<2){acHide();return}const lw=r.w.toLowerCase();
  const items=AC_WORDS.filter(x=>x.toLowerCase().startsWith(lw)&&x!==r.w).slice(0,8);if(!items.length){acHide();return}
  AC={on:true,items,i:0,start:r.start};let box=$('acBox');if(!box){box=el('div',{id:'acBox'});$('stCode').querySelector('.cew').append(box)}
  box.innerHTML='';items.forEach((x,i)=>box.append(el('div',{class:'aci'+(i===0?' on':''),text:x,onmousedown:e=>{e.preventDefault();AC.i=i;acAccept()}})));
  const before=ta.value.slice(0,ta.selectionStart).split('\n'),line=before.length-1,col=before[before.length-1].length;const cs=getComputedStyle(ta),lh=parseFloat(cs.lineHeight)||20,cw=acCharW(cs.font);
  box.style.left=Math.min(ta.clientWidth-180,12+col*cw-ta.scrollLeft)+'px';box.style.top=(12+(line+1)*lh-ta.scrollTop+2)+'px';box.style.display='block'}
let _acw=null;function acCharW(font){if(_acw)return _acw;const c=document.createElement('canvas').getContext('2d');c.font=font;return _acw=c.measureText('MMMMMMMMMM').width/10}
function acHide(){AC.on=false;const b=$('acBox');if(b)b.style.display='none'}
function acAccept(){const ta=$('ceText'),w=AC.items[AC.i];ta.setRangeText(w,AC.start,ta.selectionStart,'end');acHide();syncCode();checkCode();ta.focus()}
function acKey(e){if(!AC.on)return false;if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();AC.i=(AC.i+(e.key==='ArrowDown'?1:-1)+AC.items.length)%AC.items.length;$('acBox').querySelectorAll('.aci').forEach((d,i)=>d.classList.toggle('on',i===AC.i));return true}
  if(e.key==='Tab'||e.key==='Enter'){e.preventDefault();acAccept();return true}if(e.key==='Escape'){e.preventDefault();acHide();return true}return false}

/* ============================================================================
   ACCUEIL DU STUDIO (artefact séparé) + PUBLICATION
   ============================================================================ */
async function studioBoot(){document.body.classList.add('studioapp');document.title='Cubik Studio';
  let acc=await Store.get('createur').catch(()=>null);if(!acc){acc=newAccount('Créateur','','');acc.studio=true;await Store.put(acc).catch(()=>{})}
  ACC=acc;ACC.settings=Object.assign({...SET_DEFAULT},ACC.settings);SET={...ACC.settings};applySettings();ACC.creations=ACC.creations||[];loadPluginsState();showStudioHome()}
function showStudioHome(){MODE='home';showScreen('studio');Music.play('menu');let h=$('stHome');h.classList.add('on');h.innerHTML='';
  const list=(ACC.creations||[]).slice().sort((a,b)=>b.updated-a.updated);
  const grid=el('div',{class:'ggrid'});for(const m of list){const im=el('img',{alt:''});im.src=creationThumb(m);
    grid.append(el('div',{class:'crcard'},el('div',{class:'gimg',onclick:()=>openProject(m.id)},im,m.team?el('span',{class:'gtag',text:'👥 Équipe'}):m.published?el('span',{class:'gtag',text:'Publié'}):null),el('div',{class:'gname',text:m.name}),el('div',{class:'gmeta',text:`${m.count||0} objets · modifié ${fmtDate(m.updated)}`}),
      el('div',{class:'crb'},el('button',{class:'btn sm green',text:'✏️ Ouvrir',onclick:()=>openProject(m.id)}),el('button',{class:'btn sm',text:'🌐',title:'Code de publication',onclick:async()=>{const d=m.team?await Team.load(m.id).catch(()=>null):await Store.getDoc('game_'+m.id);if(d){await loadAssetDocs(d.assets);CUR_GAME=d;openPublish()}}}),
        el('button',{class:'btn sm red',text:'🗑',title:'Supprimer',onclick:async()=>{if(!await confirmDel(m.name))return;ACC.creations=ACC.creations.filter(x=>x.id!==m.id);await Store.delDoc('game_'+m.id).catch(()=>{});markDirty();showStudioHome()}}))))}
  const tpl=el('div',{class:'tplrow'});for(const t of TEMPLATES_G){const im=el('img',{alt:''});im.src=creationThumb({id:t.id,name:t.name,icon:t.icon,color:t.color,updated:0},320,180);
    tpl.append(el('button',{class:'tplc',onclick:()=>newFromTemplate(t)},im,el('b',{text:t.name}),el('small',{text:t.desc})))}
  h.append(el('div',{class:'shead'},el('span',{class:'slogo',html:'<svg viewBox="0 0 64 64"><use href="#logo"/></svg>'}),el('div',{},el('h1',{text:'Cubik Studio'}),el('p',{text:'Construis, programme en CubeScript, teste, puis publie ton jeu dans Cubik.'})),el('div',{class:'tsp'}),
      el('button',{class:'btn gold',html:`${BLOX} ${ACC.blox|0}`,title:'Blox du Studio',onclick:()=>{openWallet();setTimeout(showStudioHome,50)}}),el('button',{class:'btn',text:'👥 Rejoindre un projet',onclick:joinTeamModal}),el('a',{class:'btn',href:HUB_URL,target:'_blank',rel:'noopener',text:'🧱 Hub ↗'}),el('button',{class:'btn',text:'🧩 Plugins',onclick:openPluginManager}),el('button',{class:'btn',text:'📥 Importer un code',onclick:importIntoStudio}),el('button',{class:'btn',text:'⚙️',title:'Paramètres',onclick:()=>{const B=el('div',{class:'setwrap'});settingsPanel(B,()=>{saveSettings()});modal(el('div',{},el('h2',{text:'Paramètres'}),B),'wide')}})),
    el('h2',{text:'Nouveau jeu'}),tpl,el('h2',{text:`Mes jeux (${list.length})`}),list.length?grid:el('div',{class:'empty'},el('div',{class:'big',text:'🧱'}),el('p',{text:'Choisis un modèle ci-dessus pour commencer.'})),
    el('p',{class:'note',text:'Tes projets sont enregistrés dans le Studio. Pour les jouer dans Cubik : 🌐 Publier → copie le code → dans Cubik, Créer → Importer.'}))}
async function openProject(id){const e=(ACC.creations||[]).find(x=>x.id===id);if(e&&e.team){try{const g=await Team.load(id);openStudio(g);Team.start(g)}catch(err){toast(err.message)}return}
  const d=await Store.getDoc('game_'+id).catch(()=>null);if(!d){toast('Impossible de charger ce projet');return}openStudio(d)}
async function newFromTemplate(t){const name=filterText(t.objects?t.name:'Mon jeu');const g=newCreation(name);if(t.objects){g.objects=t.objects();g.script=t.script||'';g.settings={...g.settings,...(t.settings||{})};g.icon=t.icon;g.color=t.color;g.desc=t.desc}
  CUR_GAME=g;await saveCreation(true);openStudio(g)}
function importIntoStudio(){const ta=el('textarea',{placeholder:'Colle ici un code CUBIK-JEU…',style:'height:140px;font:12px ui-monospace,monospace'});ta.onkeydown=e=>e.stopPropagation();const err=el('div',{class:'aerr'});
  const m=modal(el('div',{class:'cf'},el('h2',{text:'📥 Importer un jeu'}),el('p',{class:'note',text:'Ouvre un jeu à partir de son code de publication pour le modifier (il est ajouté à tes projets).'}),ta,err,
    el('div',{class:'ibtns'},el('button',{class:'btn',text:'Annuler',onclick:()=>m.remove()}),el('button',{class:'btn green',text:'Importer',onclick:async()=>{try{const g=await decodeGame(ta.value);g.id='g'+Date.now().toString(36);CUR_GAME=g;await saveCreation(true);m.remove();openStudio(g)}catch(e){err.textContent=e.message}}}))))}
async function openPublish(){if(MODE==='studio'&&STUDIO.dirty)await saveCreation(true);const g=CUR_GAME,P=textProblems(g);const sp=g.objects.some(o=>o.type==='spawn');
  let bad=0;try{CS.parse(g.script||'')}catch(e){bad++}for(const o of g.objects)if(o.script&&o.script.trim())try{CS.parse(o.script)}catch(e){bad++}
  const checks=el('div',{class:'pubchk'},el('div',{class:sp?'pk-ok':'pk-ko',text:sp?'✓ Point d\'apparition présent':'✗ Ajoute une Apparition'}),el('div',{class:bad?'pk-ko':'pk-ok',text:bad?`✗ ${bad} script(s) avec une erreur de syntaxe (Tester → Vérifier les scripts)`:'✓ Scripts sans erreur de syntaxe'}),
    el('div',{class:P.length?'pk-warn':'pk-ok',text:P.length?`⚠️ Filtre de texte : ${P.length} texte(s) seront affichés avec ### dans le jeu`:'✓ Filtre de texte : rien à masquer'}),el('div',{class:'pk-ok',text:`✓ ${g.objects.length} objets · ${g.objects.filter(o=>o.script&&o.script.trim()).length+(g.script&&g.script.trim()?1:0)} script(s)`}));
  if(P.length)checks.append(el('div',{class:'pubwords'},...P.slice(0,6).map(([w,s,f])=>el('div',{text:`${w} : ${f}`}))));
  const box=el('textarea',{readonly:'',class:'pubcode',text:'Génération…'});const size=el('span',{class:'note'});const copy=el('button',{class:'btn green',text:'📋 Copier le code',onclick:async()=>{box.select();let ok=false;try{await navigator.clipboard.writeText(box.value);ok=true}catch(e){try{ok=document.execCommand('copy')}catch(_){}}toast(ok?'Code copié ✓':'Sélectionne le code et copie-le (Ctrl+C)');}});
  const m=modal(el('div',{class:'cf pub'},el('h2',{text:'🌐 Publier dans Cubik'}),checks,el('div',{class:'fld'},el('span',{text:'Code de publication'}),box,size),
    el('ol',{class:'pubsteps'},el('li',{text:'Copie le code.'}),el('li',{text:'Ouvre Cubik → onglet Créer → « 📥 Importer un jeu du Studio ».'}),el('li',{text:'Colle le code : ton jeu apparaît dans Découvrir. Republier avec le même projet met le jeu à jour.'})),
    el('div',{class:'ibtns'},el('button',{class:'btn',text:'Fermer',onclick:()=>m.remove()}),copy)),'wide');
  g.published=true;const code=await encodeGame(g);box.value=code;size.textContent=` ${(code.length/1024).toFixed(1)} Ko`;if(MODE==='studio')await saveCreation(true);else{const e=ACC.creations.find(x=>x.id===g.id);if(e){e.published=true;markDirty()}}}

/* ---------- robustesse : sauvegarde auto + perte du contexte graphique ---------- */
setInterval(()=>{if(MODE==='studio'&&CUR_GAME&&STUDIO.dirty&&!STUDIO.testing&&!STUDIO.drag)saveCreation(true)},45000);
cv.addEventListener('webglcontextlost',e=>{e.preventDefault();const box=$('err');box.innerHTML='';box.append(el('div',{class:'errc'},el('b',{text:'Le moteur graphique a été coupé par le navigateur'}),
  el('p',{text:'Ça arrive quand la carte graphique manque de mémoire. Ton jeu est enregistré automatiquement : recharge pour reprendre.'}),el('button',{class:'btn green',text:'Enregistrer et recharger',onclick:async()=>{try{if(CUR_GAME&&ACC)await saveCreation(true);await flushSave()}catch(_){}location.reload()}})));box.classList.add('on')});

/* ---------- propriétés des objets spéciaux ---------- */
const SFX_NAMES=[['bell','Cloche'],['coin','Pièce'],['win','Victoire'],['boing','Boing'],['boom','Explosion'],['scream','Cri'],['heartbeat','Battements'],['creak','Grincement'],['whisper','Chuchotement'],['door','Porte'],['thunder','Tonnerre'],['checkpoint','Checkpoint'],['levelUp','Niveau'],['click','Clic']];
function assetSelect(type,val,onch){const sel=el('select',{});sel.append(el('option',{value:'',text:type==='texture'?'(matériau normal)':type==='mesh'?'(aucun)':'(aucun)'}));
  for(const id of CUR_GAME.assets||[]){const a=ASSETS.get(id);if(a&&a.type===type)sel.append(el('option',{value:id,text:`${a.name} · ${id}`}))}sel.value=val||'';sel.onchange=()=>onch(sel.value);return sel}
function typeProps(o,L,all,apply,section,row,sec){const ty=o.type,num=(k,sub,step,min,max)=>{const cur=sub?o[sub]?.[k]:o[k];const i=el('input',{type:'number',step,value:cur??''});i.onkeydown=e=>e.stopPropagation();i.onchange=()=>apply(x=>{let v=clamp(+i.value,min,max);if(sub){x[sub]=x[sub]||{};x[sub][k]=v}else x[k]=v});return i};
  const sel=(opts,cur,fn)=>{const s=el('select',{});for(const[v,l]of opts)s.append(el('option',{value:v,text:l}));s.value=cur??opts[0][0];s.onchange=()=>apply(x=>fn(x,s.value));return s};
  const sw=(cur,fn)=>{const b=el('button',{class:'sw'+(cur?' on':'')});b.onclick=()=>apply(x=>fn(x,!cur));return b};
  const txt=(k)=>{const t=el('input',{type:'text',value:o[k]||'',maxlength:'120'});t.onkeydown=e=>e.stopPropagation();t.onchange=()=>apply(x=>x[k]=t.value);return t};
  const sound=()=>{const wrap=el('div',{class:'pin'});wrap.append(sel([['','—'],...SFX_NAMES],o.sfx||'',(x,v)=>x.sfx=v),assetSelect('sound',o.sound,v=>apply(x=>x.sound=v)),el('button',{class:'stb',text:'▶',title:'Écouter',onclick:()=>playSfxOrAsset(o.sound||o.sfx)}));return wrap};
  if(all(x=>['part','sphere','cyl','mover','door'].includes(x.type))){section('Texture (ressource)');row('Texture',assetSelect('texture',o.tex,v=>apply(x=>{if(v)x.tex=v;else delete x.tex})),el('button',{class:'stb',text:'📦',title:'Ressources',onclick:openAssets}))}
  if(all(x=>x.type===ty)){
    if(ty==='water'){section('Eau & nage');const r=el('input',{type:'range',min:.15,max:.95,step:.05,value:o.swimAt??.55}),out=el('output',{text:Math.round((o.swimAt??.55)*100)+' %'});r.oninput=()=>out.textContent=Math.round(r.value*100)+' %';r.onchange=()=>apply(x=>x.swimAt=+r.value);
      row('Nage à partir de',r,out);sec().append(el('div',{class:'note',text:'Le joueur se met à nager quand l\'eau atteint ce pourcentage de sa hauteur (55 % = poitrine). Espace pour remonter, C pour plonger.'}));
      const c=el('input',{type:'color',value:o.color&&o.color!=='#a3a2a5'?o.color:'#3fb6c9'});c.onchange=()=>apply(x=>x.color=c.value);row('Couleur',c);
      row('Courant',sel([['','Aucun'],['+X','+X'],['-X','-X'],['+Z','+Z'],['-Z','-Z']],o.dir||'',(x,v)=>x.dir=v||undefined),num('speed',null,.5,0,15))}
    if(ty==='light'){section('Lumière');row('Portée',num('range','light',1,2,60));row('Luminosité',num('bright','light',.1,0,8));row('Clignotement',num('flicker','light',.1,0,1));row('Cacher l\'ampoule',sw(o.hideBulb,(x,v)=>x.hideBulb=v))}
    if(ty==='emitter'){section('Particules');row('Effet',sel(Object.entries(FX_KINDS),o.fx,(x,v)=>x.fx=v))}
    if(ty==='soundblock'){section('Son');row('Son',sound());row('Déclenchement',sel([['toucher','Quand on le touche'],['ambiance','Ambiance (en boucle autour)']],o.mode,(x,v)=>x.mode=v));row('Invisible en jeu',sw(o.hideInGame,(x,v)=>x.hideInGame=v))}
    if(ty==='zone'){section('Zone');row('Action',sel([['message','Afficher un message'],['jumpscare','Jumpscare 😱'],['son','Jouer un son'],['lumieres','Éteindre/allumer les lumières'],['tuer','Tuer le joueur'],['aucune','Rien (script)']],o.action,(x,v)=>x.action=v));
      if(o.action==='message')row('Message',txt('text'));if(o.action==='son')row('Son',sound());row('Une seule fois',sw(o.once,(x,v)=>x.once=v))}
    if(ty==='mesh'){section('Mesh');row('Mesh',assetSelect('mesh',o.mesh,v=>apply(x=>x.mesh=v)),el('button',{class:'stb',text:'📦',onclick:openAssets}))}
    if(ty==='monster'){section('Monstre');row('Vitesse',num('speed',null,.5,1,20));row('Détection (m)',num('aggro',null,1,3,80));row('Phrase quand il attrape',txt('text'));row('Apparence',sel([['monstre','Monstre'],['fantome','Fantôme'],...Object.keys(NPC_AV).filter(k=>!['monstre','fantome'].includes(k)).map(k=>[k,k])],o.av,(x,v)=>x.av=v))}
    if(ty==='key'||ty==='door'){section(ty==='key'?'Clé':'Porte');row(ty==='key'?'Nom de la clé':'Clé nécessaire',txt('text'))}}}

/* ---------- gestionnaire de ressources du projet ---------- */
function openAssets(){CUR_GAME.assets=CUR_GAME.assets||[];const list=el('div',{class:'alist'}),err=el('div',{class:'aerr'});
  const add=async a=>{a=registerAsset(a);if(!a)throw new Error('ressource invalide');await saveAssetDoc(a);if(!CUR_GAME.assets.includes(a.id))CUR_GAME.assets.push(a.id);STUDIO.dirty=true;updTitle();draw();buildProps()};
  const file=(accept,fn)=>{const i=el('input',{type:'file',accept,style:'display:none'});i.onchange=async()=>{const f=i.files[0];if(!f)return;err.textContent='⏳ Import…';try{await fn(f);err.textContent=''}catch(e){err.textContent=e.message}};document.body.append(i);i.click();setTimeout(()=>i.remove(),60000)};
  function draw(){list.innerHTML='';if(!CUR_GAME.assets.length)list.append(el('div',{class:'note',text:'Aucune ressource. Importe un son ou une image, ou colle un code du Blocubik Hub.'}));
    for(const id of CUR_GAME.assets){const a=ASSETS.get(id);if(!a)continue;const pv=a.type==='texture'?el('img',{src:a.data,class:'apv'}):a.type==='mesh'?el('span',{class:'apv',text:'🧩'}):el('button',{class:'apv',text:'▶',onclick:()=>playAsset(id)});
      list.append(el('div',{class:'arow'},pv,el('div',{class:'ainf'},el('b',{text:a.name}),el('code',{text:id}),el('small',{text:assetKind[a.type][1]+(a.author?' · par '+a.author:'')})),
        el('button',{class:'btn sm',text:'Copier l\'ID',onclick:async()=>{try{await navigator.clipboard.writeText(id);toast('ID copié : '+id)}catch(e){toast(id)}}}),
        el('button',{class:'btn sm red',text:'🗑',onclick:()=>{CUR_GAME.assets=CUR_GAME.assets.filter(x=>x!==id);STUDIO.dirty=true;draw()}})))}}
  draw();const code=el('textarea',{placeholder:'Colle un ou plusieurs codes CUBIK-ASSET… copiés depuis le Blocubik Hub',style:'height:70px;font:11px ui-monospace,monospace'});code.onkeydown=e=>e.stopPropagation();
  modal(el('div',{class:'cf'},el('h2',{text:'📦 Ressources du projet'}),el('p',{class:'note',text:'Utilise une ressource sur un bloc (propriété Texture, Bloc sonore, Mesh) ou dans le code avec son ID, par ex. Sound.Play("snd_ab12cd") ou bloc.Texture = "hub_x7k2p9".'}),list,err,
    el('div',{class:'ibtns'},el('button',{class:'btn',text:'🔊 Importer un son',onclick:()=>file('audio/*',async f=>{const r=await importSoundFile(f);await add({id:newAssetId('sound'),type:'sound',name:f.name.replace(/\.[^.]+$/,'').slice(0,30),data:r.data,author:ACC.pseudo})})}),
      el('button',{class:'btn',text:'🖼️ Importer une image',onclick:()=>file('image/*',async f=>{const d=await importTextureFile(f);await add({id:newAssetId('texture'),type:'texture',name:f.name.replace(/\.[^.]+$/,'').slice(0,30),data:d,author:ACC.pseudo})})})),
    el('div',{class:'fld',style:'margin-top:12px'},el('span',{},'Depuis le Blocubik Hub ',el('a',{href:HUB_URL,target:'_blank',rel:'noopener',text:'(ouvrir le Hub ↗)'})),code),el('button',{class:'btn green',text:'Ajouter depuis le code',onclick:async()=>{try{const L=await decodeAssets(code.value);for(const a of L)await add(a);code.value='';toast(`${L.length} ressource(s) ajoutée(s)`)}catch(e){err.textContent=e.message}}})),'wide')}

// en édition, une lumière « de travail » évite de construire dans le noir (jeux d'horreur)
function editorAtmos(){const S=CUR_GAME.settings||{};if(STUDIO.workLight&&((S.clock??14)<7||(S.clock??14)>19||(S.fog||0)>.3)){setClock(11);WORLD.fog=S.fog?.006:0;WORLD.fogCol=null}else{setClock(S.clock??14);applyFog(S)}}
