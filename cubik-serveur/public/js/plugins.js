"use strict";
/* ============================================================================
   PLUGINS DU STUDIO — écrits en CubeScript, avec l'API « Studio »
   ============================================================================ */
let PLUG_RT=null,PLUGINS=[];
const PLUGINS_BUILTIN=[
 {id:'escalier',name:'Escalier',icon:'🪜',desc:'Construit un escalier de 10 marches devant la caméra.',src:`plugin:Button("Escalier", "🪜", function()
  local depart = Studio.CameraPosition + Studio.CameraLook * 10
  for i = 0, 9 do
    local m = Studio.Insert("part", Vector3.new(depart.X, i * 0.5 + 0.25, depart.Z + i * 1.2))
    m.Size = Vector3.new(4, 0.5, 1.2)
    m.Name = "Marche " .. (i + 1)
    m.Color = Color3.fromHSV(i / 10, 0.5, 0.95)
  end
  print("Escalier construit !")
end)`},
 {id:'arcenciel',name:'Arc-en-ciel',icon:'🌈',desc:'Colore la sélection en dégradé arc-en-ciel.',src:`plugin:Button("Arc-en-ciel", "🌈", function()
  local sel = Studio.GetSelection()
  if #sel == 0 then
    warn("Sélectionne d'abord des objets")
    return
  end
  for i, obj in ipairs(sel) do
    obj.Color = Color3.fromHSV((i - 1) / #sel, 0.75, 1)
  end
end)`},
 {id:'tableau',name:'Copies en ligne',icon:'🧱',desc:'Duplique la sélection 5 fois à la suite (comme l\'outil Array).',src:`local nombre = 5

plugin:Button("Copier ×5", "🧱", function()
  local sel = Studio.GetSelection()
  for _, obj in ipairs(sel) do
    for i = 1, nombre do
      local c = obj:Clone()
      c.Position = obj.Position + Vector3.new(obj.Size.X * i + 0.5 * i, 0, 0)
    end
  end
end)`},
 {id:'sol',name:'Poser au sol',icon:'⬇️',desc:'Fait tomber chaque objet sélectionné jusqu\'au sol.',src:`plugin:Button("Au sol", "⬇️", function()
  for _, obj in ipairs(Studio.GetSelection()) do
    obj.Position = Vector3.new(obj.Position.X, obj.Size.Y / 2, obj.Position.Z)
  end
end)`},
 {id:'obbygen',name:'Générateur d\'obby',icon:'🎲',desc:'Crée un parcours aléatoire de 12 plateformes avec une arrivée.',src:`plugin:Button("Obby aléatoire", "🎲", function()
  local p = Studio.CameraPosition + Studio.CameraLook * 8
  local x, y, z = p.X, 1, p.Z
  local tout = {}
  for i = 1, 12 do
    x = x + math.random(-2, 2)
    y = y + math.random(0, 1)
    z = z + math.random(4, 6)
    local b = Studio.Insert("part", Vector3.new(x, y, z))
    b.Size = Vector3.new(3, 1, 3)
    b.Color = Color3.fromHSV(i / 12, 0.7, 1)
    b.Material = "Plastique lisse"
    b.Name = "Saut " .. i
    if i % 4 == 0 then b.Type = "Trampoline" end
    table.insert(tout, b)
  end
  local fin = Studio.Insert("finish", Vector3.new(x, y + 0.6, z + 6))
  table.insert(tout, fin)
  Studio.Group(tout, "Obby aléatoire")
  Studio.Select(tout)
end)`},
 {id:'mur',name:'Mur de briques',icon:'🧱',desc:'Monte un mur de 8 × 4 briques décalées.',src:`plugin:Button("Mur", "🧱", function()
  local p = Studio.CameraPosition + Studio.CameraLook * 12
  local briques = {}
  for rang = 0, 3 do
    for i = 0, 7 do
      local decal = (rang % 2) * 1
      local b = Studio.Insert("part", Vector3.new(p.X + i * 2 + decal, rang + 0.5, p.Z))
      b.Size = Vector3.new(2, 1, 1)
      b.Material = "Brique"
      b.Color = Color3.fromRGB(170 + math.random(0, 40), 70, 50)
      table.insert(briques, b)
    end
  end
  Studio.Group(briques, "Mur")
end)`},
 {id:'lave',name:'Transformer en lave',icon:'🌋',desc:'Change la sélection en blocs de lave (et inversement).',src:`plugin:Button("Lave", "🌋", function()
  for _, obj in ipairs(Studio.GetSelection()) do
    if obj.Type == "Lave" then
      obj.Type = "Normal"
    else
      obj.Type = "Lave"
    end
  end
end)`},
 {id:'nettoyeur',name:'Nettoyeur',icon:'🧹',desc:'Supprime les objets tombés sous la carte (Y < -20).',src:`plugin:Button("Nettoyer", "🧹", function()
  local n = 0
  for _, obj in ipairs(Studio.GetObjects()) do
    if obj.Position.Y < -20 then
      obj:Destroy()
      n += 1
    end
  end
  UI.Notify(n .. " objet(s) supprimé(s)")
end)`}];
const PLUGIN_TEMPLATE=`-- Mon plugin : un bouton apparaît dans l'onglet Plugins
plugin:Button("Mon bouton", "⭐", function()
  local sel = Studio.GetSelection()
  print("Objets sélectionnés :", #sel)
  for _, obj in ipairs(sel) do
    obj.Size = obj.Size * 2
  end
end)
`;
function loadPluginsState(){const st=ACC.plugins=ACC.plugins||{on:{escalier:true,arcenciel:true,obbygen:true},custom:[]};
  PLUGINS=[...PLUGINS_BUILTIN.map(p=>({...p,builtin:true,on:!!st.on[p.id]})),...st.custom.map(p=>({...p,on:!!st.on[p.id]}))]}
function savePlugins(){const st=ACC.plugins;st.on={};for(const p of PLUGINS)if(p.on)st.on[p.id]=true;st.custom=PLUGINS.filter(p=>!p.builtin).map(p=>({id:p.id,name:p.name,icon:p.icon,desc:p.desc,src:p.src}));markDirty()}

/* ---------- références d'objets de l'éditeur ---------- */
const TYPE_BY_NAME={};for(const[id,l]of INSERTS){TYPE_BY_NAME[id]=id;TYPE_BY_NAME[l.toLowerCase()]=id}Object.assign(TYPE_BY_NAME,{bloc:'part',boule:'sphere',cylindre:'cyl',piece:'coin',pièce:'coin',arrivee:'finish',arrivée:'finish'});
const objRefs=new WeakMap();
function objRef(o){let r=objRefs.get(o);if(r)return r;r=new ObjRef(o);objRefs.set(o,r);return r}
class ObjRef{constructor(o){this.o=o}get __type(){return'StudioObject'}__tostring(){return this.o.name}
  __get(k){const o=this.o;switch(k){case'Name':return o.name;case'ClassName':return o.type;case'Position':return new Vec3(...o.pos);case'Size':return new Vec3(...o.size);case'Color':return new Col3(...hexRGB(o.color||'#ffffff'));
    case'Material':return MATS[o.mat]?.fr||o.mat;case'Transparency':return o.transp||0;case'CanCollide':return o.collide!==false;case'Type':return KIND_FR[o.kind||({lava:'lava',bounce:'bounce',conv:'conv'}[o.type])||'solid']||'Normal';
    case'Text':return o.text||'';case'Script':return o.script||'';case'Model':return o.group?CUR_GAME.groups?.[o.group]?.name:undefined;case'Exists':return CUR_GAME.objects.includes(o);
    case'Destroy':return s=>{CUR_GAME.objects=CUR_GAME.objects.filter(x=>x!==s.o);STUDIO.selSet.delete(s.o);if(STUDIO.sel===s.o)STUDIO.sel=null;plugChanged()};
    case'Clone':return s=>{const c=JSON.parse(JSON.stringify(s.o));c.id=newId();delete c.group;CUR_GAME.objects.push(c);plugChanged();return objRef(c)};
    case'IsA':return(s,c)=>c===s.o.type||c==='Part'}}
  __set(k,v,line){const o=this.o;plugChanged();switch(k){case'Name':o.name=String(CS.tostr(v)).slice(0,30);return;case'Position':o.pos=toVec(v,line);return;case'Size':o.size=toVec(v,line).map(x=>clamp(x,.05,500));return;
    case'Color':o.color=toCol(v,line);return;case'Transparency':o.transp=clamp(CS.num(v,line,k),0,1);return;case'CanCollide':o.collide=CS.truthy(v);return;
    case'Material':{const m=MAT_BY_NAME[String(v).toLowerCase()];if(!m)throw CS.err(`matériau inconnu « ${v} »`,line);o.mat=m;return}
    case'Type':{const kk=KIND_BY[String(v).toLowerCase()];if(!kk)throw CS.err(`type inconnu « ${v} » (Normal, Lave, Trampoline)`,line);if(['part','sphere','cyl','mover'].includes(o.type))o.kind=kk==='conv'?'solid':kk;return}
    case'Text':o.text=String(CS.tostr(v)).slice(0,200);return;case'Script':o.script=String(CS.tostr(v));return}return false}}
let plugT=null;function plugChanged(){STUDIO.dirty=true;clearTimeout(plugT);plugT=setTimeout(()=>{if(MODE==='studio'&&CUR_GAME){rebuildEditor();refreshPanels();updTitle()}},30)}
function makeStudioGlobals(rt){const G=(k,v)=>rt.G.v.set(k,v),T=CS.mkTbl;
  G('Vector3',T({new:(x,y,z)=>new Vec3(x||0,y||0,z||0),zero:new Vec3(0,0,0),one:new Vec3(1,1,1)}));
  G('Color3',T({new:(r,g,b)=>new Col3(r,g,b),fromRGB:(r,g,b)=>new Col3(r/255,g/255,b/255),fromHSV:(h,s,v)=>hsv2rgb(((h%1)+1)%1,clamp(s,0,1),clamp(v,0,1)),fromHex:h=>new Col3(...hexRGB(toCol(h)))}));
  const arr=L=>{const t=new CS.Tbl();L.forEach((o,i)=>t.set(i+1,objRef(o)));return t};const list=v=>v instanceof ObjRef?[v.o]:v instanceof CS.Tbl?[...Array(v.len())].map((_,i)=>v.get(i+1)).filter(x=>x instanceof ObjRef).map(x=>x.o):[];
  const studio={get __type(){return'Studio'},__get(k){switch(k){
      case'GetSelection':return()=>arr(selList());case'GetObjects':return()=>arr(CUR_GAME.objects);case'Find':return n=>{const o=CUR_GAME.objects.find(x=>x.name===CS.tostr(n));return o?objRef(o):undefined};
      case'Insert':return(type,pos)=>{const t=TYPE_BY_NAME[String(type).toLowerCase()];if(!t)throw CS.err(`type d'objet inconnu « ${type} » (${INSERTS.map(i=>i[0]).join(', ')})`);if(CUR_GAME.objects.length>3000)throw CS.err('trop d\'objets (3000 max)');
        const o=newObj(t,pos instanceof Vec3?pos.arr():hitPoint({o:STUDIO.cam.pos,d:camDir()}));CUR_GAME.objects.push(o);plugChanged();return objRef(o)};
      case'Select':return v=>{const L=list(v);STUDIO.selSet=new Set(L);STUDIO.sel=L[0]||null;plugChanged()};case'Delete':return v=>{const L=list(v);CUR_GAME.objects=CUR_GAME.objects.filter(x=>!L.includes(x));plugChanged()};
      case'Group':return(v,name)=>{const L=list(v);if(L.length<1)return;const g='g'+Math.random().toString(36).slice(2,7);CUR_GAME.groups=CUR_GAME.groups||{};CUR_GAME.groups[g]={name:name?String(name).slice(0,30):'Modèle'};L.forEach(o=>o.group=g);plugChanged()};
      case'CameraPosition':return new Vec3(...STUDIO.cam.pos);case'CameraLook':return new Vec3(...camDir());case'GameName':return CUR_GAME.name;case'Grid':return STUDIO.grid}},__set(){return false}};
  G('Studio',studio);G('UI',T({Notify:t=>toast(String(CS.tostr(t)).replace(/[<>&]/g,'')),Message:t=>toast(String(CS.tostr(t)).replace(/[<>&]/g,''))}));G('workspace',undefined)}
function makePluginRef(p){return{get __type(){return'Plugin'},__get(k){if(k==='Name')return p.name;if(k==='Button'||k==='CreateButton')return(s,name,icon,fn)=>{if(typeof fn!=='function'&&!(fn instanceof CS.LFunc))throw CS.err('plugin:Button("Nom", "🔧", fonction)');p.buttons.push({name:String(CS.tostr(name)).slice(0,24),icon:icon?String(icon).slice(0,4):'🔧',fn});if(MODE==='studio'&&RIB==='plugins')buildStudioUI()}},__set(){return false}}}
function reloadPlugins(){if(!ACC)return;if(!PLUGINS.length||!ACC.plugins)loadPluginsState();PLUG_RT=new CS.Runtime((m,k)=>studioOut('[plugin] '+m,k));makeStudioGlobals(PLUG_RT);
  for(const p of PLUGINS){p.buttons=[];if(!p.on)continue;PLUG_RT.runScript(p.src,`Plugin « ${p.name} »`,{plugin:makePluginRef(p)})}if(MODE==='studio'&&RIB==='plugins')buildStudioUI()}
function runPluginButton(p,b){snapshot();try{PLUG_RT.spawn(b.fn,[],`Plugin « ${p.name} »`)}catch(e){studioOut(e.message,'err')}SFX.click()}
function runCommand(src){if(!PLUG_RT)reloadPlugins();snapshot();PLUG_RT.runScript(src,'Commande',{plugin:makePluginRef({name:'Commande',buttons:[]})})}
function openPluginManager(){const list=el('div',{class:'plist2'});const draw=()=>{list.innerHTML='';for(const p of PLUGINS){const tg=el('button',{class:'sw'+(p.on?' on':''),title:p.on?'Désactiver':'Activer',onclick:()=>{p.on=!p.on;savePlugins();reloadPlugins();draw()}});
    list.append(el('div',{class:'plg'},el('span',{class:'pic',text:p.icon||'🧩'}),el('div',{class:'pinf'},el('b',{text:p.name}),el('small',{text:p.desc||(p.builtin?'':'Plugin perso')}),p.builtin?el('em',{text:'Intégré'}):null),
      el('div',{class:'pact'},el('button',{class:'btn sm',text:p.builtin?'👁 Code':'✏️ Éditer',onclick:()=>{if(p.builtin){const c=newPlugin(true,{name:p.name+' (copie)',icon:p.icon,desc:p.desc,src:p.src});m.remove();openCode({plugin:c})}else{m.remove();openCode({plugin:p})}}}),
        p.builtin?null:el('button',{class:'btn sm red',text:'🗑',onclick:()=>{PLUGINS=PLUGINS.filter(x=>x!==p);savePlugins();reloadPlugins();draw()}}),tg)))}};draw();
  const m=modal(el('div',{class:'pmgr'},el('h2',{text:'🧩 Plugins'}),el('p',{class:'note',text:'Les plugins sont des scripts CubeScript qui ajoutent des boutons à l\'onglet Plugins du ruban. Ils peuvent créer, modifier et sélectionner des objets avec l\'API Studio. « Code » sur un plugin intégré en fait une copie modifiable.'}),list,
    el('div',{class:'ibtns'},el('button',{class:'btn',text:'📘 API des plugins',onclick:openDocs}),el('button',{class:'btn green',text:'✨ Nouveau plugin',onclick:()=>{m.remove();newPlugin()}}))),'wide')}
function newPlugin(silent,base){const p={id:'u'+Date.now().toString(36),name:base?.name||'Mon plugin',icon:base?.icon||'⭐',desc:base?.desc||'Plugin perso',src:base?.src||PLUGIN_TEMPLATE,on:true,buttons:[]};
  if(!base&&!silent){const nm=el('input',{type:'text',value:p.name,maxlength:'24'}),ic=el('input',{type:'text',value:p.icon,maxlength:'4',class:'iconin'});nm.onkeydown=ic.onkeydown=e=>e.stopPropagation();
    const m=modal(el('div',{class:'cf'},el('h2',{text:'✨ Nouveau plugin'}),el('div',{class:'fld'},el('span',{text:'Nom'}),nm),el('div',{class:'fld'},el('span',{text:'Icône'}),ic),el('div',{class:'ibtns'},el('button',{class:'btn',text:'Annuler',onclick:()=>m.remove()}),
      el('button',{class:'btn green',text:'Créer et écrire le code',onclick:()=>{p.name=filterText(nm.value.trim()||'Mon plugin');p.icon=ic.value||'⭐';PLUGINS.push(p);savePlugins();m.remove();openCode({plugin:p})}}))));return p}
  PLUGINS.push(p);savePlugins();return p}
