"use strict";
/* ============================================================================
   CUBIK STUDIO — éditeur de jeux + API CubeScript
   ============================================================================ */
/* ---------- types de l'API ---------- */
class Vec3{constructor(x=0,y=0,z=0){this.x=+x;this.y=+y;this.z=+z}
  get __type(){return'Vector3'}
  __get(k){switch(k){case'X':case'x':return this.x;case'Y':case'y':return this.y;case'Z':case'z':return this.z;case'Magnitude':return Math.hypot(this.x,this.y,this.z);
    case'Unit':{const l=Math.hypot(this.x,this.y,this.z)||1;return new Vec3(this.x/l,this.y/l,this.z/l)}case'Lerp':return(s,o,t)=>new Vec3(lerp(s.x,o.x,t),lerp(s.y,o.y,t),lerp(s.z,o.z,t));
    case'Dot':return(s,o)=>s.x*o.x+s.y*o.y+s.z*o.z}}
  __set(){return false}
  __arith(op,b,line){if(b instanceof Vec3){if(op==='+')return new Vec3(this.x+b.x,this.y+b.y,this.z+b.z);if(op==='-')return new Vec3(this.x-b.x,this.y-b.y,this.z-b.z);if(op==='*')return new Vec3(this.x*b.x,this.y*b.y,this.z*b.z)}
    if(typeof b==='number'){if(op==='*')return new Vec3(this.x*b,this.y*b,this.z*b);if(op==='/')return new Vec3(this.x/b,this.y/b,this.z/b)}throw CS.err(`opération ${op} impossible sur un Vector3`,line)}
  __neg(){return new Vec3(-this.x,-this.y,-this.z)}__eq(b){return b instanceof Vec3&&b.x===this.x&&b.y===this.y&&b.z===this.z}
  __tostring(){return[this.x,this.y,this.z].map(v=>+v.toFixed(2)).join(', ')}arr(){return[this.x,this.y,this.z]}}
class Col3{constructor(r,g,b){this.r=clamp(+r,0,1);this.g=clamp(+g,0,1);this.b=clamp(+b,0,1)}get __type(){return'Color3'}
  __get(k){if(k==='R')return this.r;if(k==='G')return this.g;if(k==='B')return this.b;if(k==='ToHex')return s=>s.hex().slice(1);if(k==='Lerp')return(s,o,t)=>new Col3(lerp(s.r,o.r,t),lerp(s.g,o.g,t),lerp(s.b,o.b,t))}
  __set(){return false}__tostring(){return this.hex()}__eq(b){return b instanceof Col3&&b.hex()===this.hex()}
  hex(){return'#'+[this.r,this.g,this.b].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('')}}
const toCol=(v,line)=>{if(v instanceof Col3)return v.hex();if(typeof v==='string'&&/^#?[0-9a-f]{6}$/i.test(v))return v[0]==='#'?v:'#'+v;throw CS.err('couleur attendue (Color3.fromRGB(...) ou "#rrggbb")',line)};
const toVec=(v,line)=>{if(v instanceof Vec3)return v.arr();throw CS.err('Vector3 attendu (Vector3.new(x, y, z))',line)};
function hsv2rgb(h,s,v){const f=n=>{const k=(n+h*6)%6;return v-v*s*Math.max(0,Math.min(k,4-k,1))};return new Col3(f(5),f(3),f(1))}
class Signal{constructor(name){this.name=name;this.c=[]}get __type(){return'RBXScriptSignal'}
  __get(k){if(k==='Connect')return(self,fn)=>{if(!(fn instanceof CS.LFunc)&&typeof fn!=='function')throw CS.err(':Connect() attend une fonction');const conn={fn,on:true,get __type(){return'Connection'},__get:kk=>kk==='Disconnect'?()=>{conn.on=false}:kk==='Connected'?conn.on:undefined};self.c.push(conn);return conn}}
  __set(){return false}fire(...args){if(!SC_RT)return;for(const c of this.c.slice())if(c.on)SC_RT.spawn(c.fn,args,`${this.name}`)}get has(){return this.c.some(c=>c.on)}}
const MAT_BY_NAME={};for(const[k,m]of Object.entries(MATS))if(m.fr){MAT_BY_NAME[m.fr.toLowerCase()]=k;MAT_BY_NAME[k]=k}
Object.assign(MAT_BY_NAME,{plastic:'plastique',smoothplastic:'lisse',wood:'bois',brick:'brique',cobblestone:'pierre',metal:'metal',grass:'herbe',sand:'sable',ice:'glace',marble:'marbre',concrete:'beton',neon:'neon',glass:'verre',slate:'ardoise',granite:'granit',fabric:'tissu',snow:'neige',gold:'or'});
const KIND_FR={solid:'Normal',lava:'Lave',bounce:'Trampoline',conv:'Tapis'},KIND_BY={normal:'solid',lave:'lava',lava:'lava',trampoline:'bounce',tapis:'conv'};

/* ---------- références de parties ---------- */
let SC_RT=null,CUR_GAME=null;
const STUDIO={cam:{pos:[18,14,22],yaw:.7,pitch:-.45},sel:null,selSet:new Set(),tool:'move',grid:1,drag:null,hover:null,undo:[],redo:[],testing:false,out:[],dirty:false,keys:new Set(),look:false,clip:null,panels:{toolbox:true,explorer:true,props:true,out:true,cmd:true},filterPreview:true,workLight:true};
// sortie des scripts : messages identiques regroupés, rafraîchissement limité (évite de figer la page)
function studioOut(m,k){k=k==='error'?'err':k||'log';const last=STUDIO.out[STUDIO.out.length-1];if(last&&last.m===m&&last.k===k){last.n=(last.n||1)+1;last.t=new Date().toLocaleTimeString('fr-FR')}
  else{STUDIO.out.push({m:String(m).slice(0,500),k,t:new Date().toLocaleTimeString('fr-FR')});if(STUDIO.out.length>300)STUDIO.out.splice(0,STUDIO.out.length-300)}
  STUDIO.outDirty=true;if(!studioOut.t)studioOut.t=setTimeout(()=>{studioOut.t=null;if(MODE==='studio'&&typeof renderOut==='function')renderOut()},120)}
/* ---------- filtre visuel ---------- */
const VFX_PRESETS={aucun:['Aucun',{}],vif:['Vif',{sat:1.45,con:1.08}],chaud:['Chaud',{sep:.25,sat:1.2,bri:1.03}],froid:['Froid',{hue:-12,sat:.9,bri:1.02,con:1.05}],retro:['Rétro',{sep:.55,con:1.15,sat:.9,vig:.55}],
  nb:['Noir et blanc',{gray:1,con:1.15,vig:.35}],cinema:['Cinéma',{con:1.22,sat:.85,bri:.95,vig:.65}],reve:['Rêve',{bri:1.1,sat:1.25,blur:.6,vig:.25}],nuit:['Vision nocturne',{gray:1,sep:1,hue:70,sat:3,con:1.2,vig:.7}],pop:['Pop',{sat:2,con:1.25,hue:8}]};
function vfxCss(f){if(!f)return'';const p={...(VFX_PRESETS[f.preset]||VFX_PRESETS.aucun)[1]};const sat=(p.sat||1)*(f.sat??1),con=(p.con||1)*(f.con??1),bri=(p.bri||1)*(f.bri??1);let s='';
  if(p.gray)s+=`grayscale(${p.gray}) `;if(p.sep)s+=`sepia(${p.sep}) `;if(p.hue)s+=`hue-rotate(${p.hue}deg) `;if(Math.abs(sat-1)>.01)s+=`saturate(${sat.toFixed(2)}) `;if(Math.abs(con-1)>.01)s+=`contrast(${con.toFixed(2)}) `;if(Math.abs(bri-1)>.01)s+=`brightness(${bri.toFixed(2)}) `;if(p.blur)s+=`blur(${p.blur}px)`;return s.trim()}
function applyVisualFilter(f){cv.style.filter=vfxCss(f);let v=$('vignette');if(!v){v=document.createElement('div');v.id='vignette';document.body.appendChild(v)}const p=f?(VFX_PRESETS[f.preset]||VFX_PRESETS.aucun)[1]:{};const k=f?Math.max(p.vig||0,f.vig||0):0;v.style.opacity=k;v.style.display=k>0?'block':'none'}
function partRef(b){if(!b.ref)b.ref=new PartRef(b);return b.ref}
class PartRef{constructor(b){this.b=b;b.ev=b.ev||{Touched:new Signal('Touched'),Clicked:new Signal('Clicked'),TouchEnded:new Signal('TouchEnded')}}
  get __type(){return'Part'}__tostring(){return this.b.name||'Part'}
  __get(k){const b=this.b;switch(k){
    case'Name':return b.name||'Part';case'ClassName':return'Part';case'Position':return new Vec3(...b.pos);case'Size':return new Vec3(...b.size);case'Color':return new Col3(...hexRGB(b.color||'#ffffff'));
    case'Transparency':return b.hidden?1:1-(b.alpha??1);case'CanCollide':return!b.nocol;case'Anchored':return true;case'Material':return MATS[b.mat]?.fr||b.mat;case'Type':return KIND_FR[b.kind]||'Normal';
    case'Parent':return b.dead?undefined:WS_REF;case'Touched':case'Clicked':case'TouchEnded':return b.ev[k];
    case'Destroy':return s=>{destroyBlock(s.b)};case'Remove':return s=>{destroyBlock(s.b)};
    case'Clone':return s=>{const nb=B(...s.b.pos,...s.b.size,{mat:s.b.mat,color:s.b.color,kind:s.b.kind,name:s.b.name,shape:s.b.shape,nocol:s.b.nocol,alpha:s.b.alpha,mode:s.b.mode,dir:s.b.dir,speed:s.b.speed});nb.dead=true;blocks.pop();return partRef(nb)};
    case'Texture':return b.obj?.tex||'';case'Brightness':return b.light?b.light.base:undefined;case'Range':return b.light?b.light.range:undefined;case'Enabled':return b.light?b.light.base>0:undefined;
    case'IsA':return(s,c)=>['Part','BasePart','Instance'].includes(c);case'FindFirstChild':case'WaitForChild':return()=>undefined;case'GetChildren':return()=>new CS.Tbl();
    case'SetAttribute':return(s,n,v)=>{(s.b.attr=s.b.attr||{})[n]=v};case'GetAttribute':return(s,n)=>(s.b.attr||{})[n]}}
  __set(k,v,line){const b=this.b;switch(k){
    case'Name':b.name=CS.tostr(v);return;case'Position':b.pos=toVec(v,line);b.base=[...b.pos];bmat(b);return;case'Size':b.size=toVec(v,line).map(x=>Math.max(.05,x));bmat(b);return;
    case'Color':b.color=toCol(v,line);return;case'Transparency':{const t=clamp(CS.num(v,line,'Transparency'),0,1);b.alpha=1-t;b.hidden=t>=.999;return}
    case'CanCollide':b.nocol=!CS.truthy(v);refreshSolids();return;case'Anchored':return;
    case'Material':{const m=MAT_BY_NAME[String(v).toLowerCase()];if(!m)throw CS.err(`matériau inconnu « ${v} »`,line);b.mat=m;return}
    case'Type':{const kk=KIND_BY[String(v).toLowerCase()];if(!kk)throw CS.err(`type inconnu « ${v} » (Normal, Lave, Trampoline, Tapis)`,line);b.kind=kk;if(kk==='conv'){b.mode=6;b.dir=b.dir||[1,0,0];b.speed=b.speed||5}else if(b.mode===6)b.mode=undefined;if(kk==='solid'&&b.mat==='lave')b.mat='plastique';return}
    case'Texture':{const id=String(v||'');if(!id){b.mat='plastique';return}if(!ASSETS.has(id))throw CS.err(`ressource inconnue « ${id} » (ajoute-la dans 📦 Ressources)`,line);const mk=assetMaterial(id);if(mk)b.mat=mk;return}
    case'Brightness':if(!b.light)return false;b.light.base=clamp(CS.num(v,line,k),0,8);b.light.bright=b.light.base;return;case'Range':if(!b.light)return false;b.light.range=clamp(CS.num(v,line,k),1,80);return;
    case'Enabled':if(!b.light)return false;b.light.base=CS.truthy(v)?(b.light.saved||2):((b.light.saved=b.light.base),0);b.light.bright=b.light.base;b.hidden=!CS.truthy(v)&&!!b.light;return;
    case'Parent':if(v==null)destroyBlock(b);else if(b.dead){b.dead=false;blocks.push(b);bmat(b);refreshSolids()}return}
    return false}}
function destroyBlock(b){if(b.dead)return;b.dead=true;const i=blocks.indexOf(b);if(i>=0)blocks.splice(i,1);refreshSolids()}
let WS_REF=null,GAME_REF=null,PLAYER_REF=null;
function findPart(name){const b=blocks.find(x=>!x.dead&&x.name===name);return b?partRef(b):undefined}
function makeWorkspace(){return{get __type(){return'Workspace'},__tostring:()=>'Workspace',
  __get(k){if(k==='FindFirstChild'||k==='WaitForChild')return(s,n)=>findPart(CS.tostr(n));if(k==='GetChildren'){return()=>{const t=new CS.Tbl();blocks.filter(b=>b.name&&!b.dead).forEach((b,i)=>t.set(i+1,partRef(b)));return t}}
    if(k==='Gravity')return 196.2*(WORLD.grav||1);if(k==='Name')return'Workspace';return findPart(k)},
  __set(k,v,line){if(k==='Gravity'){WORLD.grav=CS.num(v,line,'Gravity')/196.2;return}return false}}}
function makePlayer(){const hum={get __type(){return'Humanoid'},__get(k){switch(k){case'Health':return WORLD.hp;case'MaxHealth':return WORLD.maxHp;case'WalkSpeed':return(pl.walk||WALK)*2;case'JumpPower':return(pl.jumpV||JUMP)/.26;
    case'TakeDamage':return(s,n)=>damagePlayer(CS.num(n));case'Died':return WORLD.sig.Died;case'Parent':return chr}},
  __set(k,v,line){const n=CS.num(v,line,k);if(k==='Health'){WORLD.hp=clamp(n,0,WORLD.maxHp);if(WORLD.hp<=0)die(pl,false);return}if(k==='MaxHealth'){WORLD.maxHp=Math.max(1,n);WORLD.hp=Math.min(WORLD.hp,WORLD.maxHp);return}
    if(k==='WalkSpeed'){pl.walk=Math.max(0,n)/2;return}if(k==='JumpPower'){pl.jumpV=Math.max(0,n)*.26;return}return false}};
  const chr={get __type(){return'Model'},__get(k){if(k==='Humanoid')return hum;if(k==='FindFirstChild'||k==='WaitForChild')return(s,n)=>n==='Humanoid'?hum:n==='HumanoidRootPart'||n==='Head'?root:undefined;if(k==='Name')return pl.name;
    if(k==='HumanoidRootPart'||k==='Head')return root;if(k==='Position')return new Vec3(...pl.pos);if(k==='MoveTo')return(s,v)=>teleport(toVec(v));if(k==='Parent')return WS_REF},__set(){return false}};
  const root={get __type(){return'Part'},__get(k){if(k==='Position')return new Vec3(pl.pos[0],pl.pos[1]+1.3,pl.pos[2]);if(k==='Parent')return chr;if(k==='Name')return'HumanoidRootPart'},__set(k,v,line){if(k==='Position'){teleport(toVec(v,line));return}return false}};
  const P={get __type(){return'Player'},__tostring:()=>pl.name,hum,chr,root,
    __get(k){switch(k){case'Name':case'DisplayName':return pl.name;case'UserId':return 1;case'Character':return chr;case'Position':return new Vec3(...pl.pos);
      case'SetStat':return(s,n,v)=>{setStat(CS.tostr(n),v)};case'GetStat':return(s,n)=>WORLD.stats[CS.tostr(n)];case'AddStat':return(s,n,v)=>{const key=CS.tostr(n);setStat(key,(WORLD.stats[key]||0)+CS.num(v??1))};
      case'HasPass':return(s,id)=>hasPass(gameKey(),CS.tostr(id));case'Vip':return!!pl.vip;case'Kill':return()=>{die(pl,false)};case'Teleport':case'MoveTo':return(s,v)=>teleport(toVec(v));case'Chat':return(s,m)=>say(pl,CS.tostr(m));case'Emote':return(s,e)=>emoteCmd(pl,CS.tostr(e));
      case'leaderstats':{const t=new CS.Tbl();for(const n in WORLD.stats)t.set(n,WORLD.stats[n]);return t}}},__set(){return false}};
  return P}
function setStat(n,v){WORLD.stats[n]=v;if(!WORLD.statOrder.includes(n))WORLD.statOrder.push(n);WORLD.lbLabel=WORLD.statOrder[0];renderPlist()}
function teleport(p){pl.pos=[p[0],p[1],p[2]];pl.vel=[0,0,0];stopClimb(pl);pl.mantle=null;cam.target=V.add(pl.pos,[0,2,0])}
function damagePlayer(n){if(pl.dead)return;WORLD.hp-=n;floatText(V.add(pl.pos,[0,3,0]),'-'+Math.round(n),'#ff6b6b');SFX.hurt();shake=Math.max(shake,.12);if(WORLD.hp<=0){WORLD.hp=0;die(pl,false)}}
const posOf=(v,line)=>v instanceof PartRef?[...v.b.pos]:v instanceof Vec3?v.arr():toVec(v,line);
function explosion(p,r=6,kill=true){SFX.boom();shake=Math.max(shake,clamp(1-V.len(V.sub(pl.pos,p))/30,0,.5));glow(p,[6,3,1],r*1.4);
  ring(p,[4,2,.8],r*1.6,.5,true);ring(p,[.5,.45,.4],r*1.2,.9);for(let i=0;i<40;i++){const a=Math.random()*6.28,u=rnd(2,10);emit({pos:[...p],vel:[Math.cos(a)*u,rnd(2,10),Math.sin(a)*u],life:rnd(.3,.8),size:rnd(.2,.5),size1:0,col:[5,rnd(1,2.5),.3],add:1,shape:0,grav:6},true)}
  for(let i=0;i<14;i++)emit({pos:V.add(p,[rnd(-1,1),rnd(0,1),rnd(-1,1)]),vel:[rnd(-2,2),rnd(1,4),rnd(-2,2)],life:rnd(1,2),size:.6,size1:2.6,col:[.2,.18,.17],alpha:.6,drag:1},true);
  for(let i=0;i<16;i++)debris.push({pos:[...p],vel:[rnd(-8,8),rnd(4,12),rnd(-8,8)],life:rnd(.8,1.5),color:pick(['#3a3a3a','#ff8a3d','#6b5b4b']),size:rnd(.15,.35),rot:0});
  if(kill&&V.len(V.sub(V.add(pl.pos,[0,1.3,0]),p))<r)die(pl,false)}
function confetti(p){for(let i=0;i<60;i++){const a=Math.random()*6.28,u=rnd(2,7);emit({pos:[...p],vel:[Math.cos(a)*u,rnd(6,12),Math.sin(a)*u],life:rnd(1.2,2.2),size:rnd(.08,.16),size1:.08,col:pick([[3,.5,.6],[.5,3,.8],[.6,1.2,3],[3,2.6,.4],[2.4,.6,3]]),add:1,shape:2,grav:9,drag:.8},true)}SFX.win()}
function makeGlobals(rt){const G=(k,v)=>rt.G.v.set(k,v),T=CS.mkTbl;
  G('Vector3',T({new:(x,y,z)=>new Vec3(x||0,y||0,z||0),zero:new Vec3(0,0,0),one:new Vec3(1,1,1)}));
  G('Color3',T({new:(r,g,b)=>new Col3(r,g,b),fromRGB:(r,g,b)=>new Col3(r/255,g/255,b/255),fromHSV:(h,s,v)=>hsv2rgb(((h%1)+1)%1,clamp(s,0,1),clamp(v,0,1)),fromHex:h=>new Col3(...hexRGB(toCol(h)))}));
  G('BrickColor',T({new:n=>new Col3(...hexRGB(toCol(String(n).startsWith('#')?n:'#888888'))),Random:()=>hsv2rgb(Math.random(),.7,.95)}));
  G('TweenInfo',T({new:(t,style)=>({time:t==null?1:+t,style:style||'Quad',get __type(){return'TweenInfo'},__get(k){return k==='Time'?this.time:undefined}})}));
  G('Enum',T({EasingStyle:T({Linear:'Linear',Quad:'Quad',Bounce:'Bounce',Elastic:'Elastic',Back:'Back',Sine:'Sine'}),Material:T(Object.fromEntries(Object.entries(MATS).filter(e=>e[1].fr).map(([k,m])=>[k[0].toUpperCase()+k.slice(1),m.fr])))}));
  G('Instance',T({new:(cls,parent)=>{if(!['Part','Neon','Sphere'].includes(cls))throw CS.err(`Instance.new("${cls}") : seules les classes "Part", "Sphere" et "Neon" existent`);
    const b=B(0,5,0,4,1,2,{mat:cls==='Neon'?'neon':'plastique',color:cls==='Neon'?'#39ffb6':'#a3a2a5',name:cls,shape:cls==='Sphere'?'sphere':undefined});b.dead=true;blocks.pop();const r=partRef(b);if(parent!=null){b.dead=false;blocks.push(b);refreshSolids()}return r}}));
  WS_REF=makeWorkspace();G('workspace',WS_REF);G('Workspace',WS_REF);PLAYER_REF=makePlayer();
  const tweenSvc={get __type(){return'TweenService'},__get(k){if(k==='Create')return(s,part,info,goals)=>makeTween(part,info,goals)}};
  const runSvc={get __type(){return'RunService'},__get(k){if(k==='Heartbeat'||k==='Stepped'||k==='RenderStepped')return WORLD.sig.Heartbeat}};
  const playersSvc={get __type(){return'Players'},__get(k){if(k==='LocalPlayer')return PLAYER_REF;if(k==='PlayerAdded')return WORLD.sig.PlayerAdded;if(k==='GetPlayers')return()=>{const t=new CS.Tbl();t.set(1,PLAYER_REF);return t};
    if(k==='GetPlayerFromCharacter')return(s,ch)=>ch===PLAYER_REF.chr?PLAYER_REF:undefined}};
  const lighting={get __type(){return'Lighting'},__get(k){if(k==='ClockTime'||k==='TimeOfDay')return WORLD.clock;if(k==='Filter')return WORLD.vfx?.preset||'aucun';if(k==='Saturation')return WORLD.vfx?.sat??1;if(k==='Contrast')return WORLD.vfx?.con??1;if(k==='Brightness')return WORLD.vfx?.bri??1},
    __set(k,v,line){if(k==='ClockTime'){setClock(CS.num(v,line,'ClockTime'));return}const f=WORLD.vfx=WORLD.vfx||{preset:'aucun'};
      if(k==='Filter'){const key=Object.keys(VFX_PRESETS).find(p=>p===String(v).toLowerCase()||VFX_PRESETS[p][0].toLowerCase()===String(v).toLowerCase());if(!key)throw CS.err(`filtre inconnu « ${v} » (${Object.values(VFX_PRESETS).map(p=>p[0]).join(', ')})`,line);f.preset=key;applyVisualFilter(f);return}
      if(k==='Saturation'){f.sat=CS.num(v,line,k);applyVisualFilter(f);return}if(k==='Contrast'){f.con=CS.num(v,line,k);applyVisualFilter(f);return}if(k==='Brightness'){f.bri=CS.num(v,line,k);applyVisualFilter(f);return}return false}};
  const svc={Players:playersSvc,RunService:runSvc,TweenService:tweenSvc,Lighting:lighting,Workspace:WS_REF};
  GAME_REF={get __type(){return'DataModel'},__get(k){if(k==='GetService')return(s,n)=>{const v=svc[n];if(!v)throw CS.err(`service inconnu « ${n} »`);return v};if(k==='Name')return WORLD.data?.name;return svc[k]}};
  G('game',GAME_REF);G('TweenService',tweenSvc);G('Players',playersSvc);G('RunService',runSvc);G('Lighting',lighting);
  G('UI',T({PromptPass:id=>{openPassShop(CS.tostr(id))},Message:(t,d)=>scMessage(filterText(CS.tostr(t)),d==null?3:+d),Hint:(t,d)=>scHint(filterText(CS.tostr(t)),d),Notify:t=>toast(filterText(String(CS.tostr(t))).replace(/[<>&]/g,''))}));
  G('Sound',T({Stop:()=>stopLoops(),Loop:(n,vol)=>{const id=CS.tostr(n);if(!ASSET_ID_RE.test(id))throw CS.err('Sound.Loop attend un ID de son (snd_… ou hub_…)');playAsset(id,{loop:true,key:'loop_'+id,vol:vol==null?1:+vol})},Play:(n,vol)=>{if(ASSET_ID_RE.test(CS.tostr(n))){playAsset(CS.tostr(n),{vol:vol==null?1:+vol});return}const f=SFX[n]||SFX[{piece:'coin',saut:'jump',victoire:'win',achat:'buy',explosion:'boom',clic:'click',erreur:'error',coup:'hit',boing:'boing'}[n]];if(f)f.call(SFX)}}));
  G('Effects',T({Jumpscare:()=>jumpscare(),Flash:()=>jumpscare('flash'),Shake:k=>{shake=Math.max(shake,clamp(k==null?.4:+k,0,1))},Thunder:()=>{SFX.thunder();jumpscare('flash')},Explosion:(p,r,k)=>explosion(posOf(p),r==null?6:+r,k!==false),Confetti:p=>confetti(posOf(p)),Sparkles:p=>sparks(posOf(p),[2.6,2.4,1],18),
    Smoke:p=>{const q=posOf(p);for(let i=0;i<10;i++)emit({pos:V.add(q,[rnd(-.5,.5),0,rnd(-.5,.5)]),vel:[0,rnd(1,2),0],life:2,size:.4,size1:1.8,col:[.5,.5,.5],alpha:.5,drag:.5},true)},
    Ring:(p,c)=>ring(posOf(p),c?hexRGB(toCol(c)).map(x=>x*2):[2,2,2],3,.6,true)}));
  G('script',undefined)}
function setClock(h){h=((h%24)+24)%24;WORLD.clock=h;const el=Math.sin((h-6)/12*Math.PI),day=clamp(el*2+.3,0,1),dusk=clamp(1-Math.abs(el)*3,0,1)*(el>-.2?1:0);
  const az=.8;SKY.sun=V.norm([Math.cos(az)*Math.cos(Math.asin(clamp(el,-1,1))),Math.max(.08,Math.abs(el)),Math.sin(az)*.6]);
  const mix3=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];
  SKY.zen=mix3([.01,.02,.07],[.1,.3,.85],day);SKY.hor=mix3(mix3([.05,.07,.16],[.62,.78,1],day),[1.1,.55,.35],dusk*.8);SKY.gnd=mix3([.03,.04,.06],[.24,.28,.2],day);
  SKY.sunCol=mix3(mix3([.25,.3,.55],[2.3,2.12,1.86],day),[2.4,1.1,.5],dusk*.7)}
function resetSky(){Object.assign(SKY,{sun:V.norm([.45,.78,.38]),sunCol:[2.3,2.12,1.86],zen:[.1,.3,.85],hor:[.62,.78,1],gnd:[.24,.28,.2]})}
const EASE={Linear:t=>t,Quad:t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,Sine:t=>-(Math.cos(Math.PI*t)-1)/2,Back:t=>{const c=1.70158,c2=c*1.525;return t<.5?(Math.pow(2*t,2)*((c2+1)*2*t-c2))/2:(Math.pow(2*t-2,2)*((c2+1)*(t*2-2)+c2)+2)/2},
  Bounce:t=>{const n=7.5625,d=2.75;return t<1/d?n*t*t:t<2/d?n*(t-=1.5/d)*t+.75:t<2.5/d?n*(t-=2.25/d)*t+.9375:n*(t-=2.625/d)*t+.984375},Elastic:t=>t===0||t===1?t:Math.pow(2,-10*t)*Math.sin((t*10-.75)*(2*Math.PI)/3)+1};
function makeTween(part,info,goals){if(!(part instanceof PartRef))throw CS.err('TweenService:Create attend une partie');const tw={part,time:info?.time??1,ease:EASE[info?.style]||EASE.Quad,goals,t:0,playing:false,done:new Signal('Completed'),
  get __type(){return'Tween'},__get(k){if(k==='Play')return s=>{s.from={};for(const[gk,gv]of s.goals.h){s.from[gk]=part.__get(gk)}s.t=0;s.playing=true;if(!WORLD.tweens.includes(s))WORLD.tweens.push(s)};if(k==='Cancel'||k==='Pause')return s=>{s.playing=false};if(k==='Completed')return tw.done}};return tw}
function stepTweens(dt){for(const tw of WORLD.tweens){if(!tw.playing)continue;tw.t+=dt;const k=Math.min(1,tw.t/Math.max(.001,tw.time)),e=tw.ease(k);
    for(const[gk,gv]of tw.goals.h){const a=tw.from[gk];let v;if(typeof gv==='number')v=lerp(a,gv,e);else if(gv instanceof Vec3)v=new Vec3(lerp(a.x,gv.x,e),lerp(a.y,gv.y,e),lerp(a.z,gv.z,e));else if(gv instanceof Col3)v=new Col3(lerp(a.r,gv.r,e),lerp(a.g,gv.g,e),lerp(a.b,gv.b,e));else v=gv;
      try{tw.part.__set(gk,v)}catch(e){}}if(k>=1){tw.playing=false;tw.done.fire()}}WORLD.tweens=WORLD.tweens.filter(t=>t.playing)}
let scMsgT=null;function scMessage(t,d){if(!$('scMsg'))return;const m=$('scMsg');m.textContent=t;m.classList.add('on');clearTimeout(scMsgT);scMsgT=setTimeout(()=>m.classList.remove('on'),d*1000)}
function scHint(t,d){if(!$('scHint'))return;const m=$('scHint');m.textContent=t;m.classList.toggle('on',!!t);if(d)setTimeout(()=>m.classList.remove('on'),d*1000)}

/* ============================================================================
   CRÉATIONS : modèle de données et construction du monde
   ============================================================================ */
const INSERTS=[
  ['part','Bloc','🧱',{size:[4,1,4],color:'#a3a2a5',mat:'plastique'}],['sphere','Boule','⚪',{size:[3,3,3],color:'#3d8bff',mat:'lisse',shape:'sphere'}],['cyl','Cylindre','🛢️',{size:[2,3,2],color:'#ffd23f',mat:'lisse',shape:'cyl'}],
  ['spawn','Apparition','🔵',{size:[6,.4,6],color:'#3d8bff'}],['checkpoint','Checkpoint','🚩',{size:[5,.4,5],color:'#9aa4b2'}],['finish','Arrivée','🏁',{size:[6,.4,6],color:'#ffd23f'}],
  ['lava','Lave','🌋',{size:[4,.4,4]}],['bounce','Trampoline','🤸',{size:[3,.5,3],color:'#ff4fa3'}],['conv','Tapis roulant','➡️',{size:[3,.4,8],color:'#30343d',dir:'+Z',speed:6}],
  ['ladder','Échelle','🪜',{size:[2,8,.3]}],['truss','Treillis','🗼',{size:[2,10,2]}],['water','Eau','💧',{size:[8,1,8]}],['neon','Néon','💡',{size:[.5,4,.5],color:'#39ffb6'}],
  ['glass','Verre','🪟',{size:[4,4,.3],color:'#bfe9ff'}],['log','Bûche','🪵',{size:[4,.9,.9]}],['tree','Arbre','🌳',{size:[3,5,3]}],['sign','Panneau','🪧',{size:[3.8,1.4,.2],text:'Mon panneau'}],
  ['coin','Pièce','🪙',{size:[1,1,.3]}],['npc','PNJ','🧑',{size:[2,2.65,1],text:'Bonjour !',av:'guide'}],['mover','Plateforme mobile','↔️',{size:[4,.6,4],color:'#4cc9f0',move:{axis:'X',amp:4,speed:1}}],
  ['light','Lumière','🔆',{size:[.8,.8,.8],color:'#ffd9a0',light:{range:16,bright:2.2,flicker:0}}],['emitter','Émetteur de particules','✨',{size:[1,1,1],color:'#ff8a3d',fx:'feu'}],
  ['soundblock','Bloc sonore','🔊',{size:[2,2,2],color:'#7a5cff',sfx:'bell',mode:'toucher'}],['zone','Zone déclencheur','🟪',{size:[6,4,6],color:'#b46bff',action:'message',text:'Tu es entré dans la zone !'}],
  ['mesh','Mesh (Hub)','🧩',{size:[2,2,2],color:'#a3a2a5'}],['monster','Monstre','👹',{size:[2,2.65,1],text:'',av:'monstre',speed:7,aggro:22}],['key','Clé','🗝️',{size:[1,1,.3],color:'#ffd23f',text:'Clé'}],['door','Porte à clé','🚪',{size:[4,6,.5],color:'#5a3a24',text:'Clé'}]];
let OBJ_ID=1;
function newObj(type,pos){const d=INSERTS.find(i=>i[0]===type);const o={id:'o'+(OBJ_ID++)+Math.random().toString(36).slice(2,5),type,name:d[1],pos:[...pos],size:[...d[3].size],color:d[3].color||'#a3a2a5',mat:d[3].mat||'plastique',collide:true,transp:0,script:''};
  for(const k of['shape','text','dir','speed','av','fx','sfx','mode','action','aggro'])if(d[3][k]!=null)o[k]=d[3][k];if(d[3].move)o.move={...d[3].move};if(d[3].light)o.light={...d[3].light};return o}
function newCreation(name){const objs=[];const base=newObj('part',[0,-.5,0]);Object.assign(base,{name:'Sol',size:[100,1,100],color:'#4fa046'});objs.push(base);
  const sp=newObj('spawn',[0,.2,0]);sp.name='Apparition';objs.push(sp);
  return{id:'g'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),name:name||'Mon jeu',desc:'',created:Date.now(),updated:Date.now(),objects:objs,script:'-- Script du jeu : s\'exécute au lancement\nlocal joueur = game.Players.LocalPlayer\nUI.Message("Bienvenue " .. joueur.Name .. " !", 3)\n',settings:{clock:14,grav:1,music:'sandbox'},published:false,plays:0,icon:'🎮',color:'#7a5cff'}}
function buildObjects(objs,play){let spawn=null;WORLD.lights=[];WORLD.emitters=[];WORLD.sounds=[];WORLD.monsters=[];WORLD.meshes=[];WORLD.zones=[];WORLD.keys=[];
  for(const o of objs){const[x,y,z]=o.pos,[sx,sy,sz]=o.size;let b=null;
    switch(o.type){
      case'part':case'sphere':case'cyl':case'neon':case'glass':b=B(x,y,z,sx,sy,sz,{mat:o.type==='neon'?'neon':o.type==='glass'?'verre':o.mat,color:o.color,shape:o.shape});break;
      case'spawn':b=B(x,y,z,sx,sy,sz,{mat:'lisse',color:o.color});spawn=b;break;
      case'checkpoint':b=B(x,y,z,sx,sy,sz,{mat:'lisse',color:o.color,cp:1});break;
      case'finish':b=B(x,y,z,sx,sy,sz,{mat:'or',finish:1});break;
      case'lava':b=B(x,y,z,sx,sy,sz,{kind:'lava'});break;
      case'bounce':b=B(x,y,z,sx,sy,sz,{kind:'bounce',color:o.color});break;
      case'conv':{const D={'+X':[1,0,0],'-X':[-1,0,0],'+Z':[0,0,1],'-Z':[0,0,-1]}[o.dir||'+Z'];b=B(x,y,z,sx,sy,sz,{kind:'conv',dir:D,speed:o.speed||6,mode:6,color:o.color});break}
      case'ladder':b=B(x,y,z,sx,sy,sz,{mat:'bois',mode:4,climb:'wood'});break;
      case'truss':b=B(x,y,z,sx,sy,sz,{mat:'metal',mode:5,climb:'metal',wrap:true,color:'#cfd6de'});break;
      case'water':{const D={'+X':[1,0,0],'-X':[-1,0,0],'+Z':[0,0,1],'-Z':[0,0,-1]}[o.dir];waters.push({pos:[x,y,z],size:[sx,sy,sz],obj:o,swimAt:clamp(o.swimAt??.55,.15,.95),color:o.color&&o.color!=='#a3a2a5'?o.color:'#3fb6c9',current:D&&o.speed?V.mul(D,clamp(o.speed,0,15)):null});break}
      case'log':{const ax=sx>=sy&&sx>=sz?'x':sz>=sy?'z':'y';const len=Math.max(sx,sy,sz),d=ax==='x'?Math.min(sy,sz):ax==='z'?Math.min(sx,sy):Math.min(sx,sz);b=LOG(x,y,z,len,d,ax);break}
      case'tree':{const h=sy*.6,s=Math.max(sx,sz);const by=y-sy/2;LOG(x,by+h/2,z,h,.8,'y');B(x,by+h+s*.4,z,s,s*.8,s,{mat:'feuillage'});B(x,by+h+s*.9,z,s*.6,s*.5,s*.6,{mat:'feuillage'});trees.push([x,by+h,z]);break}
      case'sign':{const s=SIGN(x,y,z,filterText(o.text||''),false,{yaw:o.yaw||0,cache:true});s.obj=o;break}
      case'coin':extras.push({type:'coin',pos:[x,y,z],obj:o,taken:0,base:[x,y,z]});break;
      case'npc':if(play){const c=spawnNPC(o.name||'PNJ',o.av||'guide',[x,y-sy/2+.05,z],{still:true,quiet:true,col:'#9ad7ff'});c.obj=o;c.yaw=o.yaw||0;WORLD.prompts.push({who:c,label:'Parler',act:()=>{openDialog(filterText(o.name||'PNJ'),filterText(o.text||'…'),[['Au revoir',null]]);if(c.obj.ev)c.obj.ev.fire(PLAYER_REF)}})}
        else{const c=addChar(makeChar({name:o.name,av:NPC_AV[o.av||'guide'],pos:[x,y-sy/2+.05,z],canClimb:false,ai:{home:[x,0,z],t:99,r:0,still:true,quiet:true}}));c.yaw=o.yaw||0;c.obj=o}break;
      case'light':{const L={pos:[x,y,z],color:o.color||'#ffd9a0',range:clamp(o.light?.range??16,2,60),bright:clamp(o.light?.bright??2,0,8),base:clamp(o.light?.bright??2,0,8),flicker:o.light?.flicker||0,obj:o};WORLD.lights.push(L);
        b=B(x,y,z,sx,sy,sz,{mat:'neon',color:o.color||'#ffd9a0',shape:'sphere',nocol:true});b.light=L;if(o.hideBulb)b.hidden=true;break}
      case'emitter':WORLD.emitters.push({pos:[x,y,z],size:[sx,sy,sz],fx:o.fx||'feu',color:o.color,obj:o,on:true,acc:0});if(!play){b=B(x,y,z,sx*.4,sy*.4,sz*.4,{mat:'neon',color:o.color||'#ff8a3d',nocol:true});b.alpha=.35}break;
      case'soundblock':WORLD.sounds.push({pos:[x,y,z],size:[sx,sy,sz],obj:o,inside:false});if(!play||!o.hideInGame){b=B(x,y,z,sx,sy,sz,{mat:'lisse',color:o.color||'#7a5cff',nocol:play?o.collide===false:true});if(play)b.nocol=o.collide===false}break;
      case'zone':WORLD.zones.push({pos:[x,y,z],size:[sx,sy,sz],obj:o,inside:false,done:false});if(!play){b=B(x,y,z,sx,sy,sz,{mat:'lisse',color:o.color||'#b46bff',nocol:true});b.alpha=.18}break;
      case'mesh':{const a=ASSETS.get(o.mesh);WORLD.meshes.push({pos:[x,y,z],size:[sx,sy,sz],obj:o,asset:a});b=B(x,y,z,sx,sy,sz,{mat:'lisse',color:o.color});b.hidden=!!a;if(o.collide===false)b.nocol=true;break}
      case'monster':if(play){const c=spawnNPC(o.name||'Monstre',o.av||'monstre',[x,y-sy/2+.05,z],{still:true,quiet:true,col:'#ff4d4d'});c.obj=o;c.monster={home:[x,y-sy/2+.05,z],speed:clamp(o.speed||7,1,20),aggro:clamp(o.aggro||22,3,80),cd:0};c.walk=c.monster.speed;WORLD.monsters.push(c)}
        else{const c=addChar(makeChar({name:o.name,av:NPC_AV[o.av||'monstre'],pos:[x,y-sy/2+.05,z],canClimb:false,ai:{home:[x,0,z],t:99,r:0,still:true,quiet:true}}));c.obj=o}break;
      case'key':extras.push({type:'key',pos:[x,y,z],obj:o,taken:0,base:[x,y,z],color:o.color||'#ffd23f'});break;
      case'door':b=B(x,y,z,sx,sy,sz,{mat:o.mat||'planches',color:o.color||'#5a3a24'});b.door=o.text||'Clé';WORLD.keys.push(b);break;
      case'mover':{const ax={X:[1,0,0],Y:[0,1,0],Z:[0,0,1]}[o.move?.axis||'X'];b=B(x,y,z,sx,sy,sz,{mat:o.mat||'lisse',color:o.color,move:play?{axis:ax,amp:o.move?.amp??4,speed:o.move?.speed??1}:null});break}}
    if(b){b.obj=o;b.name=o.name;if(o.tex&&['part','sphere','cyl','mover','door'].includes(o.type)){const mk=assetMaterial(o.tex);if(mk)b.mat=mk}if(o.transp>0){b.alpha=1-o.transp;if(o.transp>=.999)b.hidden=true}if(o.collide===false)b.nocol=true;
      if(['part','sphere','cyl','glass','neon','mover'].includes(o.type)&&o.kind&&o.kind!=='solid'){b.kind=o.kind;if(o.kind==='lava')b.mat='lave'}}}
  return spawn}

/* ---------- jeu « création » (exécution) ---------- */
GAMES.custom={name:'Création',get music(){return CUR_GAME?.settings?.music||'sandbox'},genre:'Création',icon:'🛠️',colors:['#7a5cff','#3d8bff'],desc:'',badges:[],
  build(sv){const G=this,data=CUR_GAME;G.data=data;G.sv=sv;G.stats={};G.statOrder=[];G.lbLabel='';G.lbValue=c=>c.isPlayer&&G.lbLabel?(G.stats[G.lbLabel]??''):'';G.hp=G.maxHp=100;G.tweens=[];G.touching=new Set();G.won=false;
    G.sig={Heartbeat:new Signal('Heartbeat'),PlayerAdded:new Signal('PlayerAdded'),Died:new Signal('Died')};G.grav=data.settings?.grav??1;
    const sp=buildObjects(data.objects,true);if(sp)SPAWN=sp;
    {let c=[0,0,0],n=0;for(const o of data.objects){if(o.size[0]>=60||o.type==='spawn')continue;c=V.add(c,o.pos);n++}const s0=sp?sp.pos:[0,0,0];if(n){c=V.mul(c,1/n);const d=V.sub(c,s0);G.camYaw=Math.hypot(d[0],d[2])>2?Math.atan2(-d[0],-d[2]):0}else G.camYaw=0}setClock(data.settings?.clock??14);G.vfx=data.settings?.filter?{...data.settings.filter}:null;applyVisualFilter(G.vfx);applyFog(data.settings);G.inv=new Set();
    // scripts
    const rt=new CS.Runtime((m,k)=>studioOut(m,k));SC_RT=rt;G.rt=rt;makeGlobals(rt);
    if(data.script&&data.script.trim())rt.runScript(data.script,'Script du jeu',{script:CS.mkTbl({Name:'Script du jeu'})});
    for(const b of blocks)if(b.obj&&b.obj.script&&b.obj.script.trim())rt.runScript(b.obj.script,`Script de « ${b.obj.name} »`,{script:CS.mkTbl({Parent:partRef(b),Name:'Script'})});
    for(const c of npcs)if(c.obj&&c.obj.script&&c.obj.script.trim()){c.obj.ev=new Signal('Parlé');const ref={get __type(){return'Model'},__get:k=>k==='Name'?c.name:k==='Talked'?c.obj.ev:k==='Say'||k==='Chat'?(s,m)=>say(c,CS.tostr(m)):k==='Position'?new Vec3(...c.pos):undefined,__set:()=>false};rt.runScript(c.obj.script,`Script de « ${c.name} »`,{script:CS.mkTbl({Parent:ref,Name:'Script'})})}
    setTimeout(()=>G.sig&&G.sig.PlayerAdded.fire(PLAYER_REF),50)},
  spawn(c){const cp=this.cp;const p=cp||SPAWN;return[p.pos[0],p.pos[1]+p.size[1]/2+.05,p.pos[2]]},
  hud(el){el.innerHTML=`<div class="ghud chp" id="cuH"><div class="bar hp"><i id="cuHb"></i><span id="cuHt"></span></div></div>`+(STUDIO.testing?'<button class="btn red stopbtn" id="stStop">■ Arrêter le test</button><div id="tOut" class="tout"></div>':'');
    if(STUDIO.testing)$('stStop').onclick=()=>stopTest()},
  onDeath(c){if(c===pl)this.sig.Died.fire()},onRespawn(c){if(c===pl)this.hp=this.maxHp},
  update(dt,t){const G=this;if(!G.rt)return;worldFx(dt,t,true);
    G.sig.Heartbeat.fire(dt);G.rt.tick(dt);stepTweens(dt);
    // touchers
    const now=new Set();if(!pl.dead)for(const b of blocks){if(!b.ev||b.dead)continue;if(!b.ev.Touched.has&&!b.ev.TouchEnded.has)continue;const bb=bnd(b);const e={mn:V.sub(bb.mn,[.08,.08,.08]),mx:V.add(bb.mx,[.08,.08,.08])};
      if(pl.pos[1]<e.mx[1]&&pl.pos[1]+H>e.mn[1]&&sat(pl,e)){now.add(b);if(!G.touching.has(b))b.ev.Touched.fire(PLAYER_REF.root,PLAYER_REF)}}
    for(const b of G.touching)if(!now.has(b)&&b.ev)b.ev.TouchEnded.fire(PLAYER_REF.root,PLAYER_REF);G.touching=now;
    // checkpoints, arrivée, pièces
    const g=pl.ground;if(g&&g.cp&&G.cp!==g){G.cp=g;g.color='#2fbf71';SFX.checkpoint();toast('Checkpoint !');sparks(V.add(g.pos,[0,.4,0]),[1,3,1.5],16)}
    if(g&&g.finish&&!G.won){G.won=true;confetti(V.add(g.pos,[0,1,0]));scMessage('🏁 Arrivée !',3);if(!STUDIO.testing){G.sv.wins=(G.sv.wins||0)+1;markDirty()}}
    for(const x of extras){if(x.type!=='coin')continue;if(x.taken>0){x.taken-=dt;continue}if(V.len(V.sub(V.add(pl.pos,[0,1.2,0]),x.pos))<1.4){x.taken=12;setStat('Pièces',(G.stats['Pièces']||0)+1);SFX.coin();sparks(x.pos,[3,2.4,.6],12);floatText(V.add(x.pos,[0,1,0]),'+1','#ffd23f')}}
    $('cuHb').style.width=(G.hp/G.maxHp*100)+'%';$('cuHt').textContent=`${Math.ceil(G.hp)} / ${G.maxHp}`;$('cuH').style.display=G.hp<G.maxHp||G.showHp?'block':'none';
    if(STUDIO.testing)renderTestOut()},
  click(ray){let best=null,bt=1e9;for(const b of blocks){if(!b.ev||!b.ev.Clicked.has||b.dead||b.hidden)continue;const t=rayAABB(ray.o,ray.d,bnd(b));if(t!=null&&t<bt&&t<60){bt=t;best=b}}if(best){best.ev.Clicked.fire(PLAYER_REF);return true}return false},
  extraDraw(L,TR){drawWorldExtras(L,TR);for(const x of extras)if(x.type==='coin'&&x.taken<=0){const m=M.chain(M.T(x.pos[0],x.pos[1]+Math.sin(time*2.5+x.pos[0])*.15,x.pos[2]),M.RY(time*2.6),M.RX(Math.PI/2),M.S(.85,.16,.85));L.push({mesh:MESH.cyl,m,mode:3,color:'#ffc61a',shin:200,emis:HDR?.5:.15});glow(x.pos,[.5,.4,.05],.9)}},
  exit(){$('scMsg').classList.remove('on');$('scHint').classList.remove('on');$('scHint').textContent='';if(this.rt)this.rt.stop();SC_RT=null;this.rt=null;resetSky();applyVisualFilter(null);stopLoops();WORLD.fog=0}};
function rayAABB(o,d,b){let t0=0,t1=1e9;for(let k=0;k<3;k++){if(Math.abs(d[k])<1e-9){if(o[k]<b.mn[k]||o[k]>b.mx[k])return null;continue}let a=(b.mn[k]-o[k])/d[k],c=(b.mx[k]-o[k])/d[k];if(a>c)[a,c]=[c,a];t0=Math.max(t0,a);t1=Math.min(t1,c);if(t0>t1)return null}return t0}
function screenRay(cx,cy){const r=cv.getBoundingClientRect(),x=(cx-r.left)/r.width*2-1,y=1-(cy-r.top)/r.height*2,I=M.inv(lastVP);
  const a=M.xf(I,[x,y,-1]),b=M.xf(I,[x,y,1]),A=[a[0]/a[3],a[1]/a[3],a[2]/a[3]],Bq=[b[0]/b[3],b[1]/b[3],b[2]/b[3]];return{o:A,d:V.norm(V.sub(Bq,A))}}


/* ---------- effets du monde (lumières, particules, sons, zones, monstres, clés) ---------- */
function applyFog(S){const f=clamp(+(S?.fog||0),0,1);WORLD.fog=f>0?.003+f*f*.09:0;WORLD.fogCol=f>0?V.mul(SKY.hor,1-f*.55):null}
const FX_KINDS={feu:'🔥 Feu',fumee:'💨 Fumée',etincelles:'✨ Étincelles',neige:'❄️ Neige',magie:'🔮 Magie',bulles:'🫧 Bulles',brume:'🌫️ Brume'};
function emitFx(e,dt){const p=e.pos,s=e.size,R=()=>[p[0]+rnd(-.5,.5)*s[0],p[1]+rnd(-.5,.5)*s[1],p[2]+rnd(-.5,.5)*s[2]],c=hexRGB(e.color||'#ff8a3d');e.acc+=dt*(QC.parts||1);
  const rate={feu:40,fumee:10,etincelles:14,neige:25,magie:18,bulles:8,brume:5}[e.fx]||12;while(e.acc>1/rate){e.acc-=1/rate;
    switch(e.fx){case'feu':emit({pos:R(),vel:[rnd(-.3,.3),rnd(1.5,3),rnd(-.3,.3)],life:rnd(.4,.8),size:rnd(.3,.6),size1:0,col:[4,rnd(1,2),.3],add:1,shape:0});break;
      case'fumee':emit({pos:R(),vel:[rnd(-.3,.3),rnd(.8,1.6),rnd(-.3,.3)],life:rnd(2,3),size:.5,size1:2.2,col:[.35,.35,.36],alpha:.4,drag:.3});break;
      case'etincelles':emit({pos:R(),vel:[rnd(-3,3),rnd(2,6),rnd(-3,3)],life:rnd(.4,.9),size:.08,size1:0,col:V.mul(c,3),add:1,shape:2,grav:9});break;
      case'neige':emit({pos:[p[0]+rnd(-.5,.5)*s[0],p[1]+s[1]/2,p[2]+rnd(-.5,.5)*s[2]],vel:[rnd(-.4,.4),-rnd(1,2),rnd(-.4,.4)],life:s[1]/1.5+.5,size:.09,size1:.09,col:[1.6,1.7,1.9],add:1,shape:2});break;
      case'magie':emit({pos:R(),vel:[rnd(-.6,.6),rnd(.3,1.2),rnd(-.6,.6)],life:rnd(.8,1.5),size:.14,size1:0,col:V.mul(c,3.5),add:1,shape:2});break;
      case'bulles':emit({pos:R(),vel:[rnd(-.2,.2),rnd(.8,1.5),rnd(-.2,.2)],life:rnd(1.5,2.5),size:.18,size1:.25,col:[1,1.4,1.8],alpha:.5,shape:1});break;
      case'brume':emit({pos:R(),vel:[rnd(-.4,.4),rnd(0,.1),rnd(-.4,.4)],life:rnd(3,5),size:1.5,size1:3.5,col:[.6,.62,.66],alpha:.18,drag:.2});break}}}
function inBox(pt,o,pad=0){return Math.abs(pt[0]-o.pos[0])<=o.size[0]/2+pad&&Math.abs(pt[1]-o.pos[1])<=o.size[1]/2+pad&&Math.abs(pt[2]-o.pos[2])<=o.size[2]/2+pad}
function playSfxOrAsset(id,vol=1,loopKey){if(!id)return;if(ASSET_ID_RE.test(id))playAsset(id,{vol,loop:!!loopKey,key:loopKey});else if(SFX[id])SFX[id](vol)}
function worldFx(dt,t,play){const W=WORLD;
  for(const L of W.lights||[])if(L.flicker>0){const f=L.flicker;L.bright=L.base*(Math.random()<f*.08?rnd(0,.25):1-f*.25+Math.sin(t*23+L.pos[0])*f*.1)}
  for(const e of W.emitters||[])if(e.on&&inView(e.pos,Math.max(...e.size)+3))emitFx(e,dt);
  if(!play||!pl||pl.dead)return;const P=V.add(pl.pos,[0,1.2,0]);
  for(const s of W.sounds||[]){const o=s.obj,inside=inBox(P,s,.4);
    if(o.mode==='ambiance'){const d=V.len(V.sub(P,s.pos)),r=Math.max(...s.size)*2+8;if(d<r&&!s.loop){s.loop=true;if(ASSET_ID_RE.test(o.sound||''))playAsset(o.sound,{vol:.8,loop:true,key:'amb_'+o.id}).then(h=>s.h=h);else s.timer=0}
      if(s.loop&&s.h)s.h.g.gain.value=clamp(1-d/r,0,1)*.8;if(s.loop&&!ASSET_ID_RE.test(o.sound||'')){s.timer-=dt;if(s.timer<=0&&d<r){s.timer=rnd(3,7);playSfxOrAsset(o.sfx,clamp(1-d/r,.1,1))}}}
    else if(inside&&!s.inside)playSfxOrAsset(o.sound||o.sfx);s.inside=inside}
  for(const z of W.zones||[]){const inside=inBox(P,z,.2),o=z.obj;if(inside&&!z.inside&&!(o.once&&z.done)){z.done=true;
      if(o.action==='jumpscare')jumpscare();else if(o.action==='message')scMessage(filterText(o.text||''),3);else if(o.action==='son')playSfxOrAsset(o.sound||o.sfx||'whisper');else if(o.action==='tuer')die(pl,false);
      else if(o.action==='lumieres')for(const L of W.lights)L.base=L.base>0?0:2;if(z.obj.ev)z.obj.ev.fire(PLAYER_REF)}z.inside=inside}
  for(const x of extras)if(x.type==='key'&&!x.taken&&V.len(V.sub(P,x.pos))<1.5){x.taken=1;WORLD.inv=WORLD.inv||new Set();WORLD.inv.add(x.obj.text||'Clé');SFX.pickup();toast('🗝️ '+filterText(x.obj.text||'Clé')+' ramassée');sparks(x.pos,[3,2.4,.6],12)}
  for(const d of W.keys||[])if(!d.opened&&WORLD.inv?.has(d.door)&&V.len(V.sub(P,d.pos))<Math.max(d.size[0],d.size[2])/2+2){d.opened=true;d.nocol=true;d.alpha=.15;refreshSolids();SFX.door();toast('🚪 Porte ouverte')}
  for(const c of W.monsters||[]){if(c.dead)continue;const m=c.monster;m.cd-=dt;const d=V.sub(pl.pos,c.pos);d[1]=0;const L=V.len(d);
    if(L<m.aggro&&!pl.dead){c.ai.target=null;c.forceWish=L>.8?V.mul(d,1/L):[0,0,0];if(L<1.3&&m.cd<=0){m.cd=1.2;if(c.obj.text)scMessage(filterText(c.obj.text),2);SFX.scream();die(pl,false)}if(Math.random()<dt*.3)SFX.heartbeat()}
    else c.forceWish=V.len(V.sub(m.home,c.pos))>1.5?V.norm(V.mul(V.sub(m.home,c.pos),1)):[0,0,0]}}
function drawWorldExtras(L,TR){for(const m of WORLD.meshes||[])if(m.asset&&m.asset.parts)meshDraws(m.asset.parts,M.mul(M.T(...m.pos),M.S(...m.size)),L,TR);
  for(const x of extras)if(x.type==='key'&&!x.taken){const mm=M.chain(M.T(x.pos[0],x.pos[1]+Math.sin(time*2.5)*.12,x.pos[2]),M.RY(time*2));L.push({mesh:MESH.torus,m:M.mul(mm,M.chain(M.T(0,.25,0),M.RX(Math.PI/2),M.S(.45,.45,.45))),mode:3,color:x.color,shin:200,emis:HDR?.6:.2},{mesh:MESH.box,m:M.mul(mm,M.chain(M.T(0,-.2,0),M.S(.12,.7,.12))),mode:3,color:x.color,shin:200})}}
