"use strict";
/* ============================================================================
   STUDIO : mode Horreur, tutoriel CubeScript, Assistant IA (payé en Blox),
   plugins supplémentaires
   ============================================================================ */

/* ---------- kit Horreur ---------- */
PREFABS.push(
  ['piscine','Piscine (nage)','🏊','decor',()=>{const L=[PO('water',[0,1.5,0],[12,3.6,8],{name:'Bassin profond',swimAt:.55,color:'#2fa8d6'})];for(const[x,z,sx,sz]of[[0,-4.25,13,.5],[0,4.25,13,.5],[-6.25,0,.5,8],[6.25,0,.5,8]])L.push(PO('part',[x,1.75,z],[sx,3.5,sz],{name:'Bord',mat:'marbre',color:'#e8e2d4'}));L.push(PO('part',[0,-.1,0],[12,.2,8],{name:'Fond',mat:'lisse',color:'#9ad7ff'}),PO('part',[7.5,.6,0],[2,1.2,2],{name:'Marche',mat:'marbre',color:'#e8e2d4'}));return L}],
  ['couloir','Couloir hanté','🕯️','horreur',()=>{const L=[];const w='#3b3330';for(let i=0;i<4;i++){const z=i*6;L.push(PO('part',[0,.25,z],[6,.5,6],{name:'Sol',mat:'planches',color:'#4a3426'}),PO('part',[-3.25,3,z],[.5,6,6],{name:'Mur',mat:'brique',color:w}),PO('part',[3.25,3,z],[.5,6,6],{name:'Mur',mat:'brique',color:w}),PO('part',[0,6.25,z],[7,.5,6],{name:'Plafond',mat:'beton',color:'#2a2624'}))}
    L.push(PO('light',[0,5.3,3],null,{name:'Ampoule',color:'#ffcf8a',light:{range:9,bright:2,flicker:.7}}),PO('light',[0,5.3,15],null,{name:'Ampoule',color:'#ffcf8a',light:{range:9,bright:1.6,flicker:.9}}),PO('zone',[0,2,18],[5.5,4,2],{name:'Piège à frissons',action:'jumpscare',once:true}));return L}],
  ['tombes','Cimetière','🪦','horreur',()=>{const L=[PO('emitter',[0,.6,0],[14,1,14],{name:'Brume',fx:'brume',color:'#9aa4b2'})];for(let i=0;i<6;i++){const x=(i%3-1)*4,z=Math.floor(i/3)*5-2.5;L.push(PO('part',[x,1,z],[1.6,2,.4],{name:'Tombe',mat:'pierre',color:'#7d7f84'}),PO('part',[x,.1,z+1.3],[1.4,.2,2.2],{name:'Terre',mat:'terre',color:'#5a4230'}))}
    L.push(PO('soundblock',[0,1,0],[1,1,1],{name:'Chuchotements',sfx:'whisper',mode:'ambiance',hideInGame:true}));return L}],
  ['lampe','Lampe vacillante','💡','horreur',()=>[PO('cyl',[0,1.5,0],[.25,3,.25],{name:'Pied',mat:'metal',color:'#30343d'}),PO('light',[0,3.2,0],null,{name:'Lampe',color:'#ffd7a0',light:{range:12,bright:2.4,flicker:.6}})]],
  ['jumpscare','Piège jumpscare','😱','horreur',()=>[PO('zone',[0,2,0],[4,4,4],{name:'Jumpscare',action:'jumpscare',once:true})]],
  ['monstre','Monstre','👹','horreur',()=>[PO('monster',[0,1.35,0],null,{name:'La Chose',text:'Je t\'ai trouvé…'})]],
  ['fantome','Fantôme','👻','horreur',()=>[PO('monster',[0,1.35,0],null,{name:'Fantôme',av:'fantome',speed:4.5,aggro:14,text:'Bouh !'})]],
  ['coop','Objectifs co-op + sortie','💎','horreur',()=>[...[-6,0,6].map((x,i)=>PO('objectif',[x,1.3,-4],null,{name:'Fusible '+(i+1),text:'Sortie'})),PO('door',[0,3,6],[4,6,.5],{name:'Porte de sortie',text:'Sortie',color:'#30343d',mat:'metal'})]],
  ['cleporte','Clé + porte','🗝️','horreur',()=>[PO('key',[-4,1.2,0],null,{name:'Clé rouillée',text:'Clé rouillée'}),PO('door',[4,3,0],[4,6,.5],{name:'Porte verrouillée',text:'Clé rouillée'})]],
  ['bougies','Bougies','🕯️','horreur',()=>[0,1,2].map(i=>PO('emitter',[i*.6-.6,1.1,0],[.1,.1,.1],{name:'Flamme',fx:'feu',color:'#ff9a3d'})).concat([PO('part',[0,.5,0],[2.2,1,.8],{name:'Table',mat:'bois',color:'#3a2618'}),PO('light',[0,1.6,0],null,{name:'Lueur',color:'#ff9a3d',hideBulb:true,light:{range:7,bright:1.6,flicker:.35}})])]);
function horrorSettings(S){Object.assign(S,{horror:true,clock:0.5,fog:.6,music:'horreur',filter:{preset:'cinema',sat:.55,con:1.15,bri:.8,vig:.85}})}
function toggleHorror(){const S=CUR_GAME.settings;snapshot();if(S.horror){Object.assign(S,{horror:false,clock:14,fog:0,music:'sandbox',filter:{preset:'aucun',sat:1,con:1,bri:1,vig:0}});toast('Mode Horreur désactivé')}
  else{horrorSettings(S);STUDIO.workLight=false;const sol=CUR_GAME.objects.find(o=>o.name==='Sol'&&o.size[0]>=60);if(sol){sol.color='#2d2a26';sol.mat='terre'}TB_CAT='horreur';STUDIO.panels.toolbox=true;
    const sp=CUR_GAME.objects.find(o=>o.type==='spawn');if(sp&&!CUR_GAME.objects.some(o=>o.type==='light')){const l=newObj('light',[sp.pos[0]+2,sp.pos[1]+4,sp.pos[2]]);l.light={range:12,bright:2,flicker:.5};CUR_GAME.objects.push(l)}
    toast('🎃 Mode Horreur : nuit, brouillard, musique angoissante et kit Horreur dans la boîte à outils');SFX.thunder()}
  setClock(S.clock);applyFog(S);applyEditorFilter();rebuildEditor();buildStudioUI()}

/* ---------- nouveaux modèles de jeux ---------- */
TEMPLATES_G.push(
 {id:'manoir',name:'Manoir hanté',icon:'🏚️',color:'#3a2a4a',example:true,desc:'Jeu d\'horreur : trouve la clé et fuis avant que la Chose ne t\'attrape.',settings:{horror:true,clock:.5,fog:.6,music:'horreur',filter:{preset:'cinema',sat:.55,con:1.15,bri:.8,vig:.85}},
  objects:()=>{const o=[O('part',[0,-.5,0],[120,1,120],{name:'Sol',color:'#2d2a26',mat:'terre'}),O('spawn',[0,.2,-14],null,{name:'Apparition',color:'#3d3a46'})];const w='#4a3f3a';
    o.push(O('part',[0,.25,0],[24,.5,20],{name:'Plancher',mat:'planches',color:'#4a3426'}),O('part',[0,4.5,-10],[24,8,.6],{name:'Façade',mat:'brique',color:w}),O('part',[0,4.5,10],[24,8,.6],{name:'Mur du fond',mat:'brique',color:w}),O('part',[-12,4.5,0],[.6,8,20],{name:'Mur',mat:'brique',color:w}),O('part',[12,4.5,0],[.6,8,20],{name:'Mur',mat:'brique',color:w}),
      O('part',[0,8.75,0],[25,.5,21],{name:'Toit',mat:'ardoise',color:'#1e1b22'}),O('door',[0,3,-10],[3.2,5.5,.7],{name:'Porte d\'entrée',text:'Clé rouillée',color:'#3a2618'}),O('part',[0,4.5,0],[.5,8,12],{name:'Cloison',mat:'planches',color:'#3a2a20'}),
      O('key',[-6,1.3,-16],null,{name:'Clé rouillée',text:'Clé rouillée'}),O('light',[-6,3,-16],null,{name:'Lanterne',color:'#ffb35a',light:{range:8,bright:2,flicker:.3}}),
      O('light',[-6,7,0],null,{name:'Lustre',color:'#ffd7a0',light:{range:12,bright:1.8,flicker:.8}}),O('light',[6,7,4],null,{name:'Lustre',color:'#9ad7ff',light:{range:10,bright:1.4,flicker:.9}}),
      O('zone',[-6,2,-5],[6,4,3],{name:'Frisson',action:'jumpscare',once:true}),O('monster',[6,1.35,6],null,{name:'La Chose',speed:5.5,aggro:16,text:'Tu ne sortiras pas…'}),O('finish',[6,.6,-6],[4,.4,4],{name:'Sortie secrète'}),
      O('emitter',[0,.8,-22],[30,1.5,10],{name:'Brume',fx:'brume',color:'#9aa4b2'}),O('soundblock',[0,2,0],[1,1,1],{name:'Ambiance',sfx:'whisper',mode:'ambiance',hideInGame:true}),O('sign',[3,2.2,-10.5],[3.8,1.4,.2],{name:'Panneau',text:'NE PAS ENTRER',yaw:Math.PI}));
    for(let i=0;i<5;i++)o.push(O('part',[-14-i*3,1,-18+i*4],[1.4,2,.4],{name:'Tombe',mat:'pierre',color:'#6d6f74'}));return o},
  script:'local joueur = game.Players.LocalPlayer\nUI.Message("Trouve la clé rouillée… 🗝️", 4)\nwhile true do\n  wait(math.random(12, 25))\n  Effects.Thunder()\nend\n'},
 {id:'laveMonte',name:'La lave monte !',icon:'🌋',color:'#ff5a1f',example:true,desc:'Grimpe la tour pendant que la lave monte. Combien de temps tiendras-tu ?',settings:{music:'boss',clock:18},
  objects:()=>{const o=[O('part',[0,-.5,0],[40,1,40],{name:'Sol',color:'#30343d',mat:'beton'}),O('spawn',[0,.2,0],null,{name:'Apparition'})];let y=0;
    for(let i=0;i<22;i++){y+=1.6;const a=i*1.1,r=5+(i%3);o.push(O(i%6===5?'bounce':'part',[Math.cos(a)*r,y,Math.sin(a)*r],[3.2,.8,3.2],{name:'Marche '+(i+1),color:`hsl(${i*16},70%,60%)`.replace(/hsl.*/,['#e5484d','#ff8a3d','#ffd23f','#2fbf71','#3d8bff','#7a5cff'][i%6]),mat:'lisse'}))}
    o.push(O('finish',[0,y+1.6,0],[5,.4,5],{name:'Sommet'}),O('part',[0,-1.5,0],[40,1,40],{name:'Lave montante',kind:'lava',color:'#ff5a1f',mat:'lisse'}),O('light',[0,y+3,0],null,{name:'Phare',color:'#fff3c4',light:{range:20,bright:2.5,flicker:0}}));return o},
  script:'local lave = workspace:FindFirstChild("Lave montante")\nlocal joueur = game.Players.LocalPlayer\njoueur:SetStat("Hauteur", 0)\nUI.Message("La lave monte ! Grimpe ! 🌋", 3)\nwait(3)\nwhile lave.Position.Y < 40 do\n  lave.Position = lave.Position + Vector3.new(0, 0.05, 0)\n  joueur:SetStat("Hauteur", math.floor(joueur.Position.Y))\n  wait(0.05)\nend\n'});

/* ---------- tutoriel CubeScript ---------- */
const TUTO=[
 {t:'Bienvenue dans le Studio',x:'Clic droit + glisser pour regarder, ZQSD/WASD pour voler, A et E pour descendre/monter. Sur mobile : glisse avec un doigt et utilise les flèches. Bouge la caméra pour continuer.',ok:()=>V.len(V.sub(STUDIO.cam.pos,TUTO.cam0||STUDIO.cam.pos))>3},
 {t:'Insère un bloc',x:'Dans la Boîte à outils (à gauche), clique sur « Bloc ». Il apparaît devant toi. Utilise les flèches colorées pour le déplacer.',ok:()=>CUR_GAME.objects.filter(o=>o.type==='part').length>(TUTO.parts0||0)},
 {t:'Ton premier script',x:'Sélectionne ton bloc, puis « 📜 Ajouter un script » dans les Propriétés. script.Parent désigne le bloc. Écris print("Bonjour !") puis Valide.',code:'local bloc = script.Parent\nprint("Bonjour ! Je suis", bloc.Name)\n',ok:()=>anyScript(/print\s*\(/)},
 {t:'Les variables',x:'local crée une variable. On peut la changer et l\'utiliser plus loin. Les textes se collent avec ..',code:'local bloc = script.Parent\nlocal vies = 3\nvies = vies - 1\nprint("Il reste " .. vies .. " vies")\nbloc.Color = Color3.fromRGB(255, 80, 80)\n',ok:()=>anyScript(/local\s+\w+\s*=\s*\d/)},
 {t:'Les événements',x:'Touched se déclenche quand le joueur touche le bloc. On y branche une fonction avec :Connect(function … end).',code:'local bloc = script.Parent\n\nbloc.Touched:Connect(function(touche, joueur)\n  print(joueur.Name .. " m\'a touché !")\n  bloc.Color = Color3.fromHSV(math.random(), 1, 1)\nend)\n',ok:()=>anyScript(/Touched:Connect/)},
 {t:'Les conditions',x:'if … then … else … end exécute du code seulement si une condition est vraie.',code:'local bloc = script.Parent\nlocal touches = 0\n\nbloc.Touched:Connect(function(t, joueur)\n  touches += 1\n  if touches >= 3 then\n    UI.Message("Trois fois ! 🎉", 2)\n    touches = 0\n  else\n    print("Encore " .. (3 - touches))\n  end\nend)\n',ok:()=>anyScript(/\bif\b[\s\S]*\bthen\b/)},
 {t:'Les boucles et wait()',x:'while true do … end répète sans fin. Mets toujours un wait() dedans, sinon le jeu se bloque !',code:'local bloc = script.Parent\nlocal t = 0\nwhile true do\n  t = t + 0.02\n  bloc.Color = Color3.fromHSV(t % 1, 0.8, 1)\n  wait(0.05)\nend\n',ok:()=>anyScript(/while[\s\S]*wait\s*\(/)},
 {t:'Le joueur et le score',x:'game.Players.LocalPlayer est le joueur. SetStat/AddStat affichent un score dans la liste des joueurs (visible par les autres en multijoueur).',code:'local piece = script.Parent\npiece.Touched:Connect(function(t, joueur)\n  joueur:AddStat("Points", 1)\n  Sound.Play("coin")\n  piece:Destroy()\nend)\n',ok:()=>anyScript(/(Add|Set)Stat/)},
 {t:'Animations et effets',x:'TweenService anime une propriété en douceur. Effects ajoute explosions, confettis, jumpscares…',code:'local p = script.Parent\nlocal depart = p.Position\nwhile true do\n  TweenService:Create(p, TweenInfo.new(1.5, "Sine"), {Position = depart + Vector3.new(0, 4, 0)}):Play()\n  wait(1.6)\n  TweenService:Create(p, TweenInfo.new(1.5, "Bounce"), {Position = depart}):Play()\n  wait(1.6)\nend\n',ok:()=>anyScript(/TweenService|Effects\./)},
 {t:'Teste et publie',x:'Clique sur ▶ Jouer pour tester. Les erreurs s\'affichent dans la Sortie avec le numéro de ligne. Quand tout marche : 🌐 Publier !',ok:()=>!!TUTO.tested}];
const anyScript=re=>re.test(CUR_GAME.script||'')||CUR_GAME.objects.some(o=>re.test(o.script||''));
let TUTO_I=0;
function openTuto(){let box=$('stTuto');if(box){box.remove();return}TUTO.cam0=[...STUDIO.cam.pos];TUTO.parts0=CUR_GAME.objects.filter(o=>o.type==='part').length;TUTO_I=Math.min(ACC.tuto||0,TUTO.length-1);
  box=el('div',{id:'stTuto'});$('studio').append(box);drawTuto();clearInterval(openTuto.t);openTuto.t=setInterval(()=>{if(!$('stTuto')){clearInterval(openTuto.t);return}const L=TUTO[TUTO_I];if(L&&L.ok()&&!L.done){L.done=true;SFX.quest();drawTuto()}},700)}
function drawTuto(){const box=$('stTuto');if(!box)return;const L=TUTO[TUTO_I];box.innerHTML='';
  box.append(el('div',{class:'tth'},el('b',{text:`🎓 Leçon ${TUTO_I+1} / ${TUTO.length}`}),el('button',{class:'mx',text:'✕',onclick:()=>box.remove()})),el('div',{class:'ttbar'},el('i',{style:`width:${(TUTO_I+(L.done?1:0))/TUTO.length*100}%`})),
    el('h3',{text:L.t}),el('p',{text:L.x}));
  if(L.code){const pre=el('pre',{class:'ttcode'});pre.innerHTML=highlight(L.code);box.append(pre,el('button',{class:'btn sm',text:'📋 Mettre ce code dans un script',onclick:()=>{const o=STUDIO.sel&&STUDIO.sel!=='game'?STUDIO.sel:insertAt('part')[0];snapshot();o.script=L.code;refreshPanels();openCode(o)}}))}
  box.append(el('div',{class:'ttst '+(L.done?'ok':''),text:L.done?'✓ Bravo, objectif atteint !':'⏳ Objectif en cours…'}),el('div',{class:'ibtns'},el('button',{class:'btn sm',text:'← Préc.',disabled:TUTO_I?null:'',onclick:()=>{TUTO_I--;drawTuto()}}),
    el('button',{class:'btn sm '+(L.done?'green':''),text:TUTO_I<TUTO.length-1?'Suivant →':'Terminer 🎉',onclick:()=>{if(TUTO_I<TUTO.length-1){TUTO_I++;ACC.tuto=Math.max(ACC.tuto||0,TUTO_I);markDirty();drawTuto()}else{box.remove();toast('🎓 Tutoriel terminé ! +100 Blox');if(!ACC.tutoDone){ACC.tutoDone=true;ACC.blox=(ACC.blox|0)+100;markDirty();buildStudioUI()}}}})))}

/* ---------- Blox du Studio ---------- */
function studioDaily(){const k=new Date().toDateString();if(ACC.studioDay===k)return 0;ACC.studioDay=k;ACC.blox=(ACC.blox|0)+50;markDirty();return 50}
async function redeemBlox(code){const m=String(code||'').trim().match(/^CUBIK-BLOX\.([0-9]{1,6})\.([a-z0-9]{8,16})\.([a-z0-9]{4})$/);if(!m)throw new Error('Code Blox invalide');
  const amt=+m[1],nonce=m[2];if((await bloxSum(amt+'.'+nonce))!==m[3])throw new Error('Code Blox abîmé');ACC.redeemed=ACC.redeemed||[];if(ACC.redeemed.includes(nonce))throw new Error('Ce code a déjà été utilisé');
  ACC.redeemed.push(nonce);ACC.blox=(ACC.blox|0)+amt;markDirty();return amt}
async function bloxSum(s){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode('cubik-blox:'+s));return[...new Uint8Array(b)].slice(0,2).map(x=>x.toString(16).padStart(2,'0')).join('')}
async function makeBloxCode(amt){const nonce=Math.random().toString(36).slice(2,12).padEnd(10,'x');return`CUBIK-BLOX.${amt}.${nonce}.${await bloxSum(amt+'.'+nonce)}`}

/* ---------- Assistant IA (Blocky) ---------- */
function estimatePrice(q){q=q.toLowerCase();const words=q.split(/\s+/).filter(Boolean).length;let p=8+Math.min(40,words*1.2);
  if(/jeu (complet|entier)|tout un jeu|niveau complet|map|carte/.test(q))p+=60;if(/script|code|programm|quand|si |chaque|compte|score|timer|chrono/.test(q))p+=15;if(/horreur|monstre|peur/.test(q))p+=10;
  if(/maison|ch[aâ]teau|ville|tour|labyrinthe|obby|parcours/.test(q))p+=20;const n=(q.match(/\d+/g)||[]).map(Number).filter(x=>x<500).reduce((a,b)=>Math.max(a,b),0);p+=Math.min(60,n*.8);
  if(/couleur|change|renomme|supprime|d[eé]place/.test(q)&&words<12)p-=5;return Math.round(clamp(p,5,200))}
function openAssistant(){let box=$('stBot');if(box){box.remove();return}box=el('div',{id:'stBot'});$('studio').append(box);const log=el('div',{class:'botlog'}),ta=el('textarea',{placeholder:'Ex. : « construis un parcours de 10 plateformes arc-en-ciel avec une arrivée », « ajoute un script qui compte les pièces », « fais une ambiance d\'horreur »…'});ta.onkeydown=e=>e.stopPropagation();
  const price=el('div',{class:'botprice'}),go=el('button',{class:'btn green sm',text:'Demander'});const wallet=el('span',{class:'botw'});
  const upd=()=>{const q=ta.value.trim();const p=q?estimatePrice(q):0;price.innerHTML=q?`Prix estimé : <b>${p}</b> ${BLOX} <small>(ajusté selon le travail réel : il peut baisser ou monter)</small>`:'';go.disabled=!q||(ACC.blox|0)<Math.ceil(p*.5)?'':null;wallet.innerHTML=`${BLOX}<b>${ACC.blox|0}</b>`;if(go.disabled===null)go.removeAttribute('disabled');else go.setAttribute('disabled','')};
  ta.oninput=upd;const say=(who,t,cls='')=>{log.append(el('div',{class:'bm '+who+' '+cls,text:t}));log.scrollTop=log.scrollHeight};
  go.onclick=async()=>{const q=ta.value.trim();if(!q)return;const est=estimatePrice(q);if((ACC.blox|0)<Math.ceil(est*.5)){say('bot','Il te faut au moins '+Math.ceil(est*.5)+' Blox pour cette demande.','err');return}
    say('me',q);ta.value='';upd();go.disabled=true;const wait=el('div',{class:'bm bot',text:'🤖 Je réfléchis…'});log.append(wait);
    try{const r=await runAssistant(q);wait.remove();const work=r.created+r.modified+r.deleted+r.scripts*3+(r.settings?2:0);const final=Math.round(clamp(est*.5+work*1.5,est*.5,est*1.5));
      ACC.blox=Math.max(0,(ACC.blox|0)-final);markDirty();say('bot',`${r.say||'C\'est fait !'}\n\n✔ ${r.created} créé(s) · ${r.modified} modifié(s) · ${r.deleted} supprimé(s) · ${r.scripts} script(s)\n💰 Coût final : ${final} Blox (estimé ${est})`);buildStudioUI();$('studio').append(box)}
    catch(e){wait.remove();say('bot','😕 '+(e.message||'Erreur')+' — aucun Blox débité.','err')}upd()};
  box.append(el('div',{class:'tth'},el('b',{text:'🤖 Blocky, l\'assistant'}),wallet,el('button',{class:'mx',text:'✕',onclick:()=>box.remove()})),log,ta,price,el('div',{class:'ibtns'},el('button',{class:'btn sm',text:'💰 Ajouter des Blox',onclick:openWallet}),go));
  say('bot','Salut ! Dis-moi ce que tu veux construire ou programmer. Chaque demande coûte des Blox selon sa taille. Tu peux tout annuler avec Ctrl+Z.');upd()}
async function runAssistant(q){const sample=await Promise.race([window.claude?.use?.('sample'),new Promise(r=>setTimeout(()=>r(null),8000))]).catch(()=>null);if(!sample)throw new Error('l\'assistant n\'est pas disponible ici (il faut ouvrir le Studio dans Claude)');
  const objs=CUR_GAME.objects.slice(0,120).map(o=>({name:o.name,type:o.type,pos:o.pos.map(v=>+v.toFixed(1)),size:o.size.map(v=>+v.toFixed(1)),color:o.color}));const look=hitPoint({o:STUDIO.cam.pos,d:camDir()}).map(v=>+v.toFixed(1));
  const prompt=`Tu es Blocky, l'assistant du Cubik Studio (jeu de blocs façon Roblox, en français). Réponds UNIQUEMENT par un objet JSON.
Format : {"say":"phrase courte pour le joueur","actions":[...]}
Actions possibles :
- {"op":"insert","type":TYPE,"name":"...","pos":[x,y,z],"size":[sx,sy,sz],"color":"#rrggbb","mat":MAT,"script":"code CubeScript optionnel","light":{"range":16,"bright":2,"flicker":0},"fx":"feu|fumee|etincelles|neige|magie|bulles|brume","text":"pour panneaux/PNJ/zones/clés","action":"message|jumpscare|son|lumieres|tuer","sfx":"bell|scream|whisper|thunder|coin|win"}
- {"op":"modify","name":"nom exact","props":{"color":"#..","pos":[..],"size":[..],"mat":"..","script":"..","name":"..","text":".."}}
- {"op":"delete","name":"nom exact"}
- {"op":"main_script","code":"..."}  (script principal du jeu)
- {"op":"settings","clock":0-24,"fog":0-1,"music":"sandbox|obby|tycoon|rpg|boss|horreur|menu","filter":"aucun|vif|chaud|froid|retro|nb|cinema|reve|nuit|pop"}
TYPE ∈ ${INSERTS.map(i=>i[0]).join(', ')}. MAT ∈ ${Object.keys(MATS).filter(k=>MATS[k].fr&&!k.startsWith('asset:')).join(', ')}.
Repère : y vers le haut, le sol est à y=0 (pos = centre de l'objet, donc y = hauteur/2 pour poser au sol). Le joueur saute ~2 de haut et ~5 de loin.
CubeScript = Lua (local, if/then/end, while/do/end, function…end, wait()). API : script.Parent, part.Touched:Connect(function(touche, joueur) … end), part.Clicked:Connect(function(joueur) … end), part.Position/Size/Color/Transparency/CanCollide, Vector3.new, Color3.fromRGB/fromHSV, TweenService:Create(part, TweenInfo.new(t), {Position=…}):Play(), joueur:AddStat("Points",1), joueur:Kill(), joueur:Teleport(v), UI.Message(txt,s), Sound.Play("coin"), Effects.Explosion(pos,r), Effects.Jumpscare(), game.Players.LocalPlayer, workspace:FindFirstChild("Nom").
Maximum 150 actions. Pas de texte hors du JSON. Pas de contenu violent explicite ni grossier.
Point visé par la caméra : ${JSON.stringify(look)}. Objets existants : ${JSON.stringify(objs)}.
Demande du joueur : ${JSON.stringify(q.slice(0,600))}`;
  let r;try{r=await sample.json(prompt,{modelTier:'default'})}catch(e){if(e&&e.code==='rate_limited')throw new Error('trop de demandes, réessaie dans un instant');if(e&&e.code==='not_granted')throw new Error('autorise l\'assistant pour l\'utiliser');try{const t=await sample(prompt);r=JSON.parse((t.text||'').replace(/^[^{]*/,'').replace(/[^}]*$/,''))}catch(_){throw new Error('réponse illisible')}}
  if(!r||!Array.isArray(r.actions))throw new Error('je n\'ai pas compris la demande');snapshot();const types=new Set(INSERTS.map(i=>i[0]));let created=0,modified=0,deleted=0,scripts=0,settings=false;const made=[];
  const v3=(a,d,lo,hi)=>Array.isArray(a)&&a.length===3&&a.every(x=>isFinite(+x))?a.map(x=>clamp(+x,lo,hi)):d,col=c=>/^#[0-9a-f]{6}$/i.test(c||'')?c:null;
  for(const a of r.actions.slice(0,150)){try{
    if(a.op==='insert'&&types.has(a.type)){const o=newObj(a.type,v3(a.pos,look,-2000,2000));o.size=v3(a.size,o.size,.1,300);if(col(a.color))o.color=a.color;if(a.mat&&MATS[a.mat]&&MATS[a.mat].fr)o.mat=a.mat;if(a.name)o.name=filterText(String(a.name)).slice(0,30);
      if(typeof a.script==='string'){o.script=a.script.slice(0,8000);scripts++}if(a.light&&o.type==='light')o.light={range:clamp(+a.light.range||16,2,60),bright:clamp(+a.light.bright||2,0,8),flicker:clamp(+a.light.flicker||0,0,1)};
      if(FX_KINDS[a.fx])o.fx=a.fx;if(typeof a.text==='string')o.text=filterText(a.text).slice(0,200);if(['message','jumpscare','son','lumieres','tuer'].includes(a.action))o.action=a.action;if(SFX[a.sfx])o.sfx=a.sfx;
      CUR_GAME.objects.push(o);made.push(o);created++}
    else if(a.op==='modify'){const o=CUR_GAME.objects.find(x=>x.name===a.name);if(!o)continue;const P=a.props||{};if(col(P.color))o.color=P.color;if(P.pos)o.pos=v3(P.pos,o.pos,-2000,2000);if(P.size)o.size=v3(P.size,o.size,.1,300);if(P.mat&&MATS[P.mat])o.mat=P.mat;
      if(typeof P.script==='string'){o.script=P.script.slice(0,8000);scripts++}if(P.name)o.name=filterText(String(P.name)).slice(0,30);if(typeof P.text==='string')o.text=filterText(P.text).slice(0,200);modified++}
    else if(a.op==='delete'){const i=CUR_GAME.objects.findIndex(x=>x.name===a.name&&x.type!=='spawn');if(i>=0){CUR_GAME.objects.splice(i,1);deleted++}}
    else if(a.op==='main_script'&&typeof a.code==='string'){CUR_GAME.script=a.code.slice(0,12000);scripts++}
    else if(a.op==='settings'){const S=CUR_GAME.settings;if(isFinite(+a.clock))S.clock=clamp(+a.clock,0,24);if(isFinite(+a.fog))S.fog=clamp(+a.fog,0,1);if(SONGS[a.music])S.music=a.music;if(VFX_PRESETS[a.filter])S.filter={...(S.filter||{}),preset:a.filter};settings=true}}catch(e){}}
  if(made.length>1){const g='g'+Math.random().toString(36).slice(2,7);CUR_GAME.groups=CUR_GAME.groups||{};CUR_GAME.groups[g]={name:'Blocky : '+q.slice(0,20)};made.forEach(o=>o.group=g)}
  setClock(CUR_GAME.settings.clock??14);applyFog(CUR_GAME.settings);applyEditorFilter();rebuildEditor();if(made.length)setSel(made,made[0]);else refreshPanels();
  return{say:filterText(String(r.say||'')).slice(0,300),created,modified,deleted,scripts,settings}}
function openWallet(){const inp=el('input',{type:'text',placeholder:'CUBIK-BLOX.…'});inp.onkeydown=e=>e.stopPropagation();const err=el('div',{class:'aerr'});const can=studioDaily();
  const m=modal(el('div',{class:'cf'},el('h2',{html:`💰 Blox du Studio : ${BLOX}${ACC.blox|0}`}),el('p',{class:'note',text:(can?'+50 Blox de bonus quotidien ajoutés ! ':'')+'Chaque jour tu reçois 50 Blox. Pour en ajouter depuis Cubik : Profil → « Envoyer des Blox au Studio », puis colle le code ici.'}),inp,err,
    el('div',{class:'ibtns'},el('button',{class:'btn',text:'Fermer',onclick:()=>m.remove()}),el('button',{class:'btn green',text:'Utiliser le code',onclick:async()=>{try{const a=await redeemBlox(inp.value);toast(`+${a} Blox ✓`);SFX.kaching();m.remove();if(MODE==='studio')buildStudioUI()}catch(e){err.textContent=e.message}}}))));if(can&&MODE==='studio')buildStudioUI()}

/* ---------- plugins supplémentaires ---------- */
PLUGINS_BUILTIN.push(
 {id:'labyrinthe',name:'Labyrinthe',icon:'🌀',desc:'Génère un labyrinthe aléatoire de 9 × 9 cases devant la caméra.',src:`plugin:Button("Labyrinthe", "🌀", function()
  local N = 9
  local taille = 4
  local p = Studio.CameraPosition + Studio.CameraLook * 20
  local ox, oz = math.floor(p.X), math.floor(p.Z)
  local vu = {}
  local murs = {}
  local function cle(x, z) return x .. "," .. z end
  -- murs horizontaux et verticaux
  for x = 0, N do for z = 0, N do murs["h" .. cle(x, z)] = true murs["v" .. cle(x, z)] = true end end
  local pile = {{1, 1}}
  vu[cle(1, 1)] = true
  while #pile > 0 do
    local c = pile[#pile]
    local x, z = c[1], c[2]
    local voisins = {}
    if x > 1 and not vu[cle(x - 1, z)] then table.insert(voisins, {x - 1, z, "v", x - 1, z}) end
    if x < N and not vu[cle(x + 1, z)] then table.insert(voisins, {x + 1, z, "v", x, z}) end
    if z > 1 and not vu[cle(x, z - 1)] then table.insert(voisins, {x, z - 1, "h", x, z - 1}) end
    if z < N and not vu[cle(x, z + 1)] then table.insert(voisins, {x, z + 1, "h", x, z}) end
    if #voisins == 0 then
      table.remove(pile)
    else
      local v = voisins[math.random(1, #voisins)]
      murs[v[3] .. cle(v[4], v[5])] = false
      vu[cle(v[1], v[2])] = true
      table.insert(pile, {v[1], v[2]})
    end
  end
  local tout = {}
  for x = 0, N do for z = 1, N do
    if murs["v" .. cle(x, z)] and not (x == 0 and z == 1) and not (x == N and z == N) then
      local m = Studio.Insert("part", Vector3.new(ox + x * taille, 2, oz + (z - 0.5) * taille))
      m.Size = Vector3.new(0.6, 4, taille + 0.6)
      m.Material = "Brique"
      table.insert(tout, m)
    end
  end end
  for x = 1, N do for z = 0, N do
    if murs["h" .. cle(x, z)] then
      local m = Studio.Insert("part", Vector3.new(ox + (x - 0.5) * taille, 2, oz + z * taille))
      m.Size = Vector3.new(taille + 0.6, 4, 0.6)
      m.Material = "Brique"
      table.insert(tout, m)
    end
  end end
  Studio.Group(tout, "Labyrinthe")
  print("Labyrinthe : " .. #tout .. " murs")
end)`},
 {id:'symetrie',name:'Symétrie',icon:'🪞',desc:'Crée une copie miroir de la sélection (axe X).',src:`plugin:Button("Miroir X", "🪞", function()
  local sel = Studio.GetSelection()
  if #sel == 0 then warn("Sélectionne des objets") return end
  local cx = 0
  for _, o in ipairs(sel) do cx = cx + o.Position.X end
  cx = cx / #sel
  for _, o in ipairs(sel) do
    local c = o:Clone()
    c.Position = Vector3.new(2 * cx - o.Position.X + 0.01, o.Position.Y, o.Position.Z)
  end
end)`},
 {id:'eclairage',name:'Éclairage auto',icon:'🔆',desc:'Place une lumière au-dessus de chaque objet sélectionné.',src:`plugin:Button("Éclairer", "🔆", function()
  for _, o in ipairs(Studio.GetSelection()) do
    local l = Studio.Insert("light", o.Position + Vector3.new(0, o.Size.Y / 2 + 3, 0))
    l.Name = "Lumière de " .. o.Name
  end
end)`},
 {id:'colimacon',name:'Escalier en colimaçon',icon:'🐚',desc:'Monte un escalier en spirale de 24 marches.',src:`plugin:Button("Colimaçon", "🐚", function()
  local c = Studio.CameraPosition + Studio.CameraLook * 14
  local tout = {}
  for i = 0, 23 do
    local a = i * 0.45
    local m = Studio.Insert("part", Vector3.new(c.X + math.cos(a) * 4, 0.5 + i * 0.7, c.Z + math.sin(a) * 4))
    m.Size = Vector3.new(3, 0.5, 2)
    m.Color = Color3.fromHSV(i / 24, 0.4, 1)
    table.insert(tout, m)
  end
  local axe = Studio.Insert("cyl", Vector3.new(c.X, 8.5, c.Z))
  axe.Size = Vector3.new(1.5, 17, 1.5)
  table.insert(tout, axe)
  Studio.Group(tout, "Colimaçon")
end)`},
 {id:'pluiepieces',name:'Pluie de pièces',icon:'🪙',desc:'Sème 20 pièces au hasard autour de la caméra.',src:`plugin:Button("Pièces ×20", "🪙", function()
  local c = Studio.CameraPosition + Studio.CameraLook * 10
  local tout = {}
  for i = 1, 20 do
    table.insert(tout, Studio.Insert("coin", Vector3.new(c.X + math.random(-15, 15), 1.4, c.Z + math.random(-15, 15))))
  end
  Studio.Group(tout, "Pièces")
end)`},
 {id:'hante',name:'Hanter la sélection',icon:'👻',desc:'Ajoute un script qui fait trembler et clignoter les objets sélectionnés.',src:`plugin:Button("Hanter", "👻", function()
  for _, o in ipairs(Studio.GetSelection()) do
    o.Script = "local p = script.Parent\\nlocal base = p.Position\\nwhile true do\\n  wait(math.random(2, 6))\\n  for i = 1, 6 do\\n    p.Position = base + Vector3.new(math.random() - 0.5, 0, math.random() - 0.5) * 0.3\\n    p.Transparency = math.random() * 0.6\\n    wait(0.05)\\n  end\\n  p.Position = base\\n  p.Transparency = 0\\nend\\n"
  end
  print("Objets hantés 👻")
end)`});
