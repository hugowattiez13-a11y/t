"use strict";
/* ============================================================================
   CubeScript — le langage de script de Cubik (syntaxe inspirée de Lua)
   local, function, if/elseif/else, while, for, repeat, tables, closures,
   wait() coopératif, événements :Connect(), API façon Roblox.
   ============================================================================ */
const CS=(()=>{
const KW=new Set(['and','break','do','else','elseif','end','false','for','function','if','in','local','nil','not','or','repeat','return','then','true','until','while']);
const err=(msg,line)=>{const e=new Error(msg);e.line=line;e.cs=true;return e};
const tokStr=t=>t.t==='name'?t.v:t.t==='str'?'"'+t.v+'"':t.t==='num'?String(t.v):t.t==='eof'?'fin du script':t.t;
function lex(src){const T=[];let i=0,line=1;const n=src.length;
  while(i<n){const c=src[i];
    if(c==='\n'){line++;i++;continue}if(c===' '||c==='\t'||c==='\r'){i++;continue}
    if(c==='-'&&src[i+1]==='-'){if(src.startsWith('[[',i+2)){const e=src.indexOf(']]',i+4),end=e<0?n:e+2;for(let k=i;k<end;k++)if(src[k]==='\n')line++;i=end;continue}while(i<n&&src[i]!=='\n')i++;continue}
    if(/[0-9]/.test(c)||(c==='.'&&/[0-9]/.test(src[i+1]||''))){let j=i;if(c==='0'&&/[xX]/.test(src[i+1])){j=i+2;while(/[0-9a-fA-F]/.test(src[j]||''))j++}else{while(/[0-9.]/.test(src[j]||''))j++;if(/[eE]/.test(src[j]||'')){j++;if(/[+-]/.test(src[j]))j++;while(/[0-9]/.test(src[j]||''))j++}}
      const v=Number(src.slice(i,j));if(isNaN(v))throw err(`nombre invalide « ${src.slice(i,j)} »`,line);T.push({t:'num',v,line});i=j;continue}
    if(/[A-Za-z_À-ÿ]/.test(c)){let j=i;while(j<n&&/[A-Za-z0-9_À-ÿ]/.test(src[j]))j++;const w=src.slice(i,j);T.push(KW.has(w)?{t:w,line}:{t:'name',v:w,line});i=j;continue}
    if(c==='"'||c==="'"){let j=i+1,s='';while(j<n&&src[j]!==c){if(src[j]==='\n')throw err('texte non terminé (guillemet manquant)',line);if(src[j]==='\\'){j++;const e=src[j];s+=e==='n'?'\n':e==='t'?'\t':e;j++;continue}s+=src[j++]}
      if(j>=n)throw err('texte non terminé (guillemet manquant)',line);T.push({t:'str',v:s,line});i=j+1;continue}
    if(c==='['&&src[i+1]==='['){const e=src.indexOf(']]',i+2);if(e<0)throw err('texte long non terminé',line);const s=src.slice(i+2,e);for(const ch of s)if(ch==='\n')line++;T.push({t:'str',v:s,line});i=e+2;continue}
    if(src.startsWith('...',i)){T.push({t:'...',line});i+=3;continue}
    const two=src.substr(i,2);if(['==','~=','<=','>=','..','!=','+=','-=','*=','/='].includes(two)){T.push({t:two==='!='?'~=':two,line});i+=2;continue}
    if('+-*/%^#<>=(){}[];:,.'.includes(c)){T.push({t:c,line});i++;continue}
    throw err(`caractère inattendu « ${c} »`,line)}
  T.push({t:'eof',line});return T}

/* ---------- analyseur syntaxique ---------- */
function parse(src){const T=lex(src);let p=0;
  const peek=()=>T[p],next=()=>T[p++],check=t=>T[p].t===t,accept=t=>T[p].t===t?T[p++]:null;
  const expect=(t,what)=>{if(T[p].t!==t)throw err(`« ${what||t} » attendu près de « ${tokStr(T[p])} »`,T[p].line);return T[p++]};
  const ENDS=['end','else','elseif','until','eof'];
  function block(){const body=[];while(!ENDS.includes(peek().t)){if(check('return')){const line=next().line;let exprs=[];if(!ENDS.includes(peek().t)&&!check(';'))exprs=exprlist();accept(';');body.push({k:'return',exprs,line});break}const s=stat();if(s)body.push(s)}return body}
  function stat(){const t=peek(),line=t.line;
    switch(t.t){
      case';':next();return null;
      case'if':{next();const conds=[];let c=expr();expect('then');conds.push([c,block()]);let els=null;
        for(;;){if(accept('elseif')){c=expr();expect('then');conds.push([c,block()])}else if(accept('else')){els=block();expect('end','end (pour fermer le if)');break}else{expect('end','end (pour fermer le if)');break}}return{k:'if',conds,els,line}}
      case'while':{next();const c=expr();expect('do');const b=block();expect('end','end (pour fermer le while)');return{k:'while',c,b,line}}
      case'do':{next();const b=block();expect('end');return{k:'do',b,line}}
      case'repeat':{next();const b=block();expect('until');const c=expr();return{k:'repeat',b,c,line}}
      case'for':{next();const n1=expect('name','nom de variable').v;
        if(accept('=')){const a=expr();expect(',');const b=expr();let s=null;if(accept(','))s=expr();expect('do');const bd=block();expect('end','end (pour fermer le for)');return{k:'fornum',v:n1,a,b,s,bd,line}}
        const names=[n1];while(accept(','))names.push(expect('name').v);expect('in');const ex=exprlist();expect('do');const bd=block();expect('end','end (pour fermer le for)');return{k:'forin',names,ex,bd,line}}
      case'function':{next();let target={k:'name',n:expect('name','nom de fonction').v,line},method=false,fname=target.n;
        while(check('.')||check(':')){const sep=next().t,nm=expect('name').v;fname+=sep+nm;target={k:'index',o:target,key:{k:'str',v:nm},line};if(sep===':'){method=true;break}}
        const f=funcbody(line,method);f.name=fname;return{k:'assign',targets:[target],exprs:[f],line}}
      case'local':{next();if(accept('function')){const nm=expect('name').v,f=funcbody(line);f.name=nm;return{k:'localfunc',n:nm,f,line}}
        const names=[expect('name','nom de variable').v];while(accept(','))names.push(expect('name').v);let exprs=[];if(accept('='))exprs=exprlist();return{k:'local',names,exprs,line}}
      case'break':next();return{k:'break',line}}
    const e=suffixed();
    if(['+=','-=','*=','/='].includes(peek().t)){const op=next().t[0];const v=expr();return{k:'assign',targets:[e],exprs:[{k:'bin',op,a:e,b:v,line}],line}}
    if(check('=')||check(',')){const targets=[e];while(accept(','))targets.push(suffixed());expect('=');const exprs=exprlist();
      for(const tg of targets)if(tg.k!=='name'&&tg.k!=='index')throw err('on ne peut pas affecter une valeur ici',line);return{k:'assign',targets,exprs,line}}
    if(e.k!=='call'&&e.k!=='mcall')throw err(`instruction incomplète près de « ${tokStr(peek())} »`,line);return{k:'expr',e,line}}
  function funcbody(line,method){expect('(');const params=method?['self']:[];let vararg=false;
    if(!check(')')){do{if(accept('...')){vararg=true;break}params.push(expect('name','paramètre').v)}while(accept(','))}expect(')');const body=block();expect('end','end (pour fermer la fonction)');return{k:'func',params,vararg,body,line}}
  function exprlist(){const l=[expr()];while(accept(','))l.push(expr());return l}
  const BIN={or:[1,1],and:[2,2],'<':[3,3],'>':[3,3],'<=':[3,3],'>=':[3,3],'~=':[3,3],'==':[3,3],'..':[5,4],'+':[6,6],'-':[6,6],'*':[7,7],'/':[7,7],'%':[7,7],'^':[10,9]};
  function expr(lim=0){let left;const t=peek();
    if(t.t==='not'||t.t==='-'||t.t==='#'){next();left={k:'un',op:t.t,o:expr(8),line:t.line}}else left=simple();
    for(;;){const op=peek().t,pr=BIN[op];if(!pr||pr[0]<=lim)break;const line=next().line;left={k:'bin',op,a:left,b:expr(pr[1]),line}}return left}
  function simple(){const t=peek();
    switch(t.t){case'num':next();return{k:'num',v:t.v};case'str':next();return{k:'str',v:t.v};case'nil':next();return{k:'nil'};case'true':next();return{k:'true'};case'false':next();return{k:'false'};
      case'...':next();return{k:'vararg',line:t.line};case'function':next();return funcbody(t.line);case'{':return table()}return suffixed()}
  function primary(){const t=peek();if(t.t==='name'){next();return{k:'name',n:t.v,line:t.line}}if(accept('(')){const e=expr();expect(')');return{k:'paren',e,line:t.line}}
    throw err(`expression attendue près de « ${tokStr(t)} »`,t.line)}
  function suffixed(){let e=primary();
    for(;;){const t=peek();
      if(t.t==='.'){next();e={k:'index',o:e,key:{k:'str',v:expect('name','nom de champ').v},line:t.line}}
      else if(t.t==='['){next();const k=expr();expect(']');e={k:'index',o:e,key:k,line:t.line}}
      else if(t.t===':'){next();const m=expect('name','nom de méthode').v;e={k:'mcall',o:e,m,args:args(),line:t.line}}
      else if(t.t==='('||t.t==='str'||t.t==='{'){e={k:'call',f:e,args:args(),line:t.line}}
      else return e}}
  function args(){const t=peek();if(t.t==='str'){next();return[{k:'str',v:t.v}]}if(t.t==='{')return[table()];expect('(');if(accept(')'))return[];const l=exprlist();expect(')');return l}
  function table(){const line=expect('{').line;const items=[];
    while(!check('}')){if(check('[')){next();const k=expr();expect(']');expect('=');items.push({key:k,val:expr()})}
      else if(peek().t==='name'&&T[p+1].t==='='){const k=next().v;next();items.push({key:{k:'str',v:k},val:expr()})}
      else items.push({val:expr()});if(!accept(',')&&!accept(';'))break}
    expect('}');return{k:'table',items,line}}
  const body=block();if(!check('eof'))throw err(`« ${tokStr(peek())} » inattendu (un end en trop ?)`,peek().line);return body}

/* ---------- valeurs ---------- */
class Tbl{constructor(){this.h=new Map()}get(k){return this.h.get(nk(k))}set(k,v){k=nk(k);if(v==null)this.h.delete(k);else this.h.set(k,v)}len(){let n=0;while(this.h.has(n+1))n++;return n}}
const nk=k=>typeof k==='number'&&Number.isInteger(k)?k:k;
class LFunc{constructor(f,scope,name){this.f=f;this.scope=scope;this.name=name||f.name||'fonction'}}
class Scope{constructor(p){this.p=p;this.v=new Map()}find(n){let s=this;while(s){if(s.v.has(n))return s;s=s.p}return null}}
class Wait{constructor(t,after){this.t=t;this.after=after}}
class Multi{constructor(a){this.a=a}}
const truthy=v=>v!==undefined&&v!==null&&v!==false;
const typeOf=v=>v==null?'nil':typeof v==='number'?'number':typeof v==='string'?'string':typeof v==='boolean'?'boolean':v instanceof Tbl?'table':(v instanceof LFunc||typeof v==='function')?'function':v.__type||'userdata';
function fmtNum(n){if(Number.isInteger(n))return String(n);if(!isFinite(n))return n>0?'inf':n<0?'-inf':'nan';return String(+n.toFixed(6))}
function tostr(v){if(v==null)return'nil';if(typeof v==='number')return fmtNum(v);if(typeof v==='string')return v;if(typeof v==='boolean')return String(v);if(v instanceof Tbl)return'table';if(v instanceof LFunc||typeof v==='function')return'function';if(v.__tostring)return v.__tostring();return v.__type||'objet'}
const LIMIT=250000;

/* ---------- interpréteur (générateurs : wait() suspend le fil) ---------- */
function* exec(block,sc,th){for(const s of block){th.line=s.line||th.line;if(++th.steps>LIMIT)throw err('le script tourne trop longtemps sans wait() (boucle infinie ?)',th.line);const r=yield* stat(s,sc,th);if(r)return r}return null}
function* stat(s,sc,th){switch(s.k){
  case'local':{const vals=yield* evlist(s.exprs,sc,th);s.names.forEach((n,i)=>sc.v.set(n,vals[i]));return null}
  case'localfunc':{const f=new LFunc(s.f,sc,s.n);sc.v.set(s.n,f);return null}
  case'assign':{const vals=yield* evlist(s.exprs,sc,th);for(let i=0;i<s.targets.length;i++)yield* assign(s.targets[i],vals[i],sc,th);return null}
  case'expr':yield* evmulti(s.e,sc,th);return null;
  case'if':for(const[c,b]of s.conds)if(truthy(yield* ev(c,sc,th)))return yield* exec(b,new Scope(sc),th);return s.els?yield* exec(s.els,new Scope(sc),th):null;
  case'while':while(truthy(yield* ev(s.c,sc,th))){const r=yield* exec(s.b,new Scope(sc),th);if(r){if(r.k==='break')break;return r}if(++th.steps>LIMIT)throw err('boucle while sans wait() (boucle infinie ?)',s.line)}return null;
  case'repeat':for(;;){const sc2=new Scope(sc),r=yield* exec(s.b,sc2,th);if(r){if(r.k==='break')break;return r}if(truthy(yield* ev(s.c,sc2,th)))break}return null;
  case'fornum':{const a=num(yield* ev(s.a,sc,th),s.line,'début du for'),b=num(yield* ev(s.b,sc,th),s.line,'fin du for'),st=s.s?num(yield* ev(s.s,sc,th),s.line,'pas du for'):1;if(st===0)throw err('le pas du for ne peut pas être 0',s.line);
    for(let i=a;st>0?i<=b:i>=b;i+=st){const sc2=new Scope(sc);sc2.v.set(s.v,i);const r=yield* exec(s.bd,sc2,th);if(r){if(r.k==='break')break;return r}}return null}
  case'forin':{const vals=yield* evlist(s.ex,sc,th);const f=vals[0],st=vals[1];let ctl=vals[2];
    for(;;){const rs=yield* call(f,[st,ctl],th,s.line);if(rs[0]==null)break;ctl=rs[0];const sc2=new Scope(sc);s.names.forEach((n,i)=>sc2.v.set(n,rs[i]));const r=yield* exec(s.bd,sc2,th);if(r){if(r.k==='break')break;return r}}return null}
  case'do':return yield* exec(s.b,new Scope(sc),th);
  case'return':return{k:'return',vals:yield* evlist(s.exprs,sc,th)};
  case'break':return{k:'break'}}}
function* assign(t,v,sc,th){if(t.k==='name'){const s=sc.find(t.n);(s||th.G).v.set(t.n,v);return}
  const o=yield* ev(t.o,sc,th),k=yield* ev(t.key,sc,th);setIndex(o,k,v,t.line,t)}
function* evlist(list,sc,th){const out=[];for(let i=0;i<list.length;i++){const e=list[i];if(i===list.length-1&&(e.k==='call'||e.k==='mcall'||e.k==='vararg'))out.push(...(yield* evmulti(e,sc,th)));else out.push(yield* ev(e,sc,th))}return out}
function* evmulti(e,sc,th){if(e.k==='call'){const f=yield* ev(e.f,sc,th);if(!(f instanceof LFunc)&&typeof f!=='function')throw err(`impossible d'appeler ${desc(e.f)} (${typeOf(f)})`,e.line);const a=yield* evlist(e.args,sc,th);return yield* call(f,a,th,e.line)}
  if(e.k==='mcall'){const o=yield* ev(e.o,sc,th);if(o==null)throw err(`impossible d'appeler :${e.m}() sur ${desc(e.o)} qui vaut nil`,e.line);const f=getIndex(o,e.m,e.line,e.o);
    if(!(f instanceof LFunc)&&typeof f!=='function')throw err(`la méthode « ${e.m} » n'existe pas sur ${desc(e.o)}`,e.line);const a=yield* evlist(e.args,sc,th);return yield* call(f,[o,...a],th,e.line)}
  if(e.k==='vararg'){const s=sc.find('...');return s?s.v.get('...').slice():[]}return[yield* ev(e,sc,th)]}
function desc(e){if(!e)return'la valeur';if(e.k==='name')return`« ${e.n} »`;if(e.k==='index'&&e.key.k==='str')return`« ${e.key.v} »`;return'la valeur'}
function* ev(e,sc,th){switch(e.k){
  case'num':case'str':return e.v;case'nil':return undefined;case'true':return true;case'false':return false;
  case'paren':return yield* ev(e.e,sc,th);
  case'vararg':{const s=sc.find('...');return s?s.v.get('...')[0]:undefined}
  case'func':return new LFunc(e,sc);
  case'name':{const s=sc.find(e.n);return s?s.v.get(e.n):th.G.v.get(e.n)}
  case'index':{const o=yield* ev(e.o,sc,th),k=yield* ev(e.key,sc,th);return getIndex(o,k,e.line,e.o)}
  case'call':case'mcall':return(yield* evmulti(e,sc,th))[0];
  case'table':{const t=new Tbl();let i=1;for(let j=0;j<e.items.length;j++){const it=e.items[j];
      if(it.key){t.set(yield* ev(it.key,sc,th),yield* ev(it.val,sc,th))}
      else if(j===e.items.length-1&&(it.val.k==='call'||it.val.k==='mcall'||it.val.k==='vararg')){for(const v of yield* evmulti(it.val,sc,th))t.set(i++,v)}else t.set(i++,yield* ev(it.val,sc,th))}return t}
  case'un':{const v=yield* ev(e.o,sc,th);if(e.op==='not')return!truthy(v);if(e.op==='-'){if(v&&v.__neg)return v.__neg();return-num(v,e.line,'opérande de -')}
    if(typeof v==='string')return v.length;if(v instanceof Tbl)return v.len();throw err(`impossible de mesurer la longueur de ${typeOf(v)}`,e.line)}
  case'bin':{if(e.op==='and'){const a=yield* ev(e.a,sc,th);return truthy(a)?yield* ev(e.b,sc,th):a}if(e.op==='or'){const a=yield* ev(e.a,sc,th);return truthy(a)?a:yield* ev(e.b,sc,th)}
    const a=yield* ev(e.a,sc,th),b=yield* ev(e.b,sc,th);return binop(e.op,a,b,e.line)}}}
function num(v,line,what){if(typeof v==='number')return v;if(typeof v==='string'&&v.trim()!==''&&!isNaN(+v))return+v;throw err(`nombre attendu pour ${what||'le calcul'} (reçu ${typeOf(v)})`,line)}
function binop(op,a,b,line){
  if(op==='=='){return a===b||(a!=null&&a.__eq&&a.__eq(b))||(a==null&&b==null)}if(op==='~=')return!binop('==',a,b,line);
  if(op==='..'){const ok=v=>typeof v==='string'||typeof v==='number';if(!ok(a)||!ok(b))throw err(`impossible de coller (..) ${typeOf(ok(a)?b:a)} avec du texte — utilise tostring()`,line);return tostr(a)+tostr(b)}
  if(op==='<'||op==='>'||op==='<='||op==='>='){if(typeof a!==typeof b||(typeof a!=='number'&&typeof a!=='string'))throw err(`impossible de comparer ${typeOf(a)} et ${typeOf(b)}`,line);
    return op==='<'?a<b:op==='>'?a>b:op==='<='?a<=b:a>=b}
  if(a&&a.__arith)return a.__arith(op,b,line);if(b&&b.__arith&&(op==='*'))return b.__arith(op,a,line);
  const x=num(a,line,`l'opération ${op}`),y=num(b,line,`l'opération ${op}`);
  switch(op){case'+':return x+y;case'-':return x-y;case'*':return x*y;case'/':return x/y;case'%':return x-Math.floor(x/y)*y;case'^':return Math.pow(x,y)}}
function getIndex(o,k,line,e){if(o instanceof Tbl)return o.get(k);if(typeof o==='string'){return STRLIB.get(k)}
  if(o&&o.__get){const v=o.__get(k);return v}if(o==null)throw err(`impossible de lire « ${tostr(k)} » : ${desc(e)} vaut nil`,line);throw err(`impossible de lire « ${tostr(k)} » dans ${typeOf(o)}`,line)}
function setIndex(o,k,v,line,t){if(o instanceof Tbl){if(k==null)throw err('clé de table nil',line);o.set(k,v);return}if(o&&o.__set){if(o.__set(k,v,line)===false)throw err(`la propriété « ${tostr(k)} » ne peut pas être modifiée`,line);return}
  if(o==null)throw err(`impossible de modifier « ${tostr(k)} » : ${desc(t&&t.o)} vaut nil`,line);throw err(`impossible de modifier un champ de ${typeOf(o)}`,line)}
function* call(f,args,th,line){if(++th.depth>180){th.depth=0;throw err('trop d\'appels imbriqués (récursion infinie ?)',line)}
  try{
    if(f instanceof LFunc){const sc=new Scope(f.scope),P=f.f.params;for(let i=0;i<P.length;i++)sc.v.set(P[i],args[i]);if(f.f.vararg)sc.v.set('...',args.slice(P.length));
      const r=yield* exec(f.f.body,sc,th);return r&&r.k==='return'?r.vals:[]}
    if(typeof f==='function'){let r;try{r=f(...args)}catch(e){if(e.cs){if(!e.line)e.line=line;throw e}throw err(e.message,line)}
      if(r instanceof Wait){const t0=th.rt.time;yield r;r=r.after?r.after(th.rt.time-t0):th.rt.time-t0}
      if(r instanceof Multi)return r.a;return r===undefined?[]:[r]}
    throw err(`impossible d'appeler une valeur de type ${typeOf(f)}`,line)}finally{th.depth--}}

/* ---------- bibliothèques standard ---------- */
const STRLIB=new Tbl();
function mkTbl(o){const t=new Tbl();for(const k in o)t.set(k,o[k]);return t}
const strArg=(s,line)=>{if(typeof s==='number')return tostr(s);if(typeof s!=='string')throw err('texte attendu',line);return s};
function sformat(f,...a){let i=0;return strArg(f).replace(/%([-0-9.]*)([dsfiq%x])/g,(m,mod,c)=>{if(c==='%')return'%';const v=a[i++];
  if(c==='d'||c==='i')return String(Math.trunc(num(v)));if(c==='f'){const pr=/\.(\d+)/.exec(mod);return num(v).toFixed(pr?+pr[1]:6)}if(c==='x')return Math.trunc(num(v)).toString(16);if(c==='q')return JSON.stringify(tostr(v));return tostr(v)})}
Object.entries({len:s=>strArg(s).length,upper:s=>strArg(s).toUpperCase(),lower:s=>strArg(s).toLowerCase(),rep:(s,n)=>strArg(s).repeat(Math.max(0,num(n))),reverse:s=>[...strArg(s)].reverse().join(''),
  sub:(s,i,j)=>{s=strArg(s);const L=s.length;i=i==null?1:num(i);j=j==null?-1:num(j);if(i<0)i=L+i+1;if(j<0)j=L+j+1;return s.slice(Math.max(1,i)-1,Math.min(L,j))},
  format:sformat,find:(s,p)=>{const i=strArg(s).indexOf(strArg(p));return i<0?undefined:new Multi([i+1,i+p.length])},split:(s,sep)=>{const t=new Tbl();strArg(s).split(sep==null?',':strArg(sep)).forEach((x,i)=>t.set(i+1,x));return t},
  byte:(s,i)=>strArg(s).charCodeAt((i||1)-1),char:(...c)=>String.fromCharCode(...c.map(Number)),trim:s=>strArg(s).trim()}).forEach(([k,v])=>STRLIB.set(k,v));
function baseLib(G,rt){const set=(k,v)=>G.v.set(k,v);
  set('print',(...a)=>{rt.out(a.map(tostr).join(' '),'log')});set('warn',(...a)=>{rt.out(a.map(tostr).join(' '),'warn')});
  set('error',(m)=>{throw err(tostr(m))});set('assert',(v,m)=>{if(!truthy(v))throw err(m?tostr(m):'assertion échouée');return v});
  set('tostring',v=>tostr(v));set('tonumber',v=>{const n=typeof v==='number'?v:Number(v);return isNaN(n)||v===''||v==null?undefined:n});set('type',v=>typeOf(v));set('typeof',v=>typeOf(v));
  set('pairs',t=>{if(!(t instanceof Tbl))throw err('pairs() attend une table');const ks=[...t.h.keys()];let i=0;return new Multi([()=>{while(i<ks.length){const k=ks[i++];if(t.h.has(k))return new Multi([k,t.h.get(k)])}return undefined},t,undefined])});
  set('ipairs',t=>{if(!(t instanceof Tbl))throw err('ipairs() attend une table');let i=0;return new Multi([()=>{i++;const v=t.get(i);return v==null?undefined:new Multi([i,v])},t,0])});
  set('select',(n,...a)=>n==='#'?a.length:new Multi(a.slice(num(n)-1)));set('unpack',t=>{const a=[];for(let i=1;i<=t.len();i++)a.push(t.get(i));return new Multi(a)});
  set('wait',t=>new Wait(Math.max(0,t==null?.03:num(t))));
  set('task',mkTbl({wait:t=>new Wait(Math.max(0,t==null?.03:num(t))),spawn:(f,...a)=>{rt.spawn(f,a,'task.spawn')},delay:(t,f,...a)=>{rt.spawn(f,a,'task.delay',num(t))}}));
  set('spawn',f=>{rt.spawn(f,[],'spawn')});set('delay',(t,f)=>{rt.spawn(f,[],'delay',num(t))});set('tick',()=>performance.now()/1000);set('time',()=>rt.time);
  const R=()=>Math.random();
  set('math',mkTbl({floor:Math.floor,ceil:Math.ceil,abs:Math.abs,sqrt:Math.sqrt,sin:Math.sin,cos:Math.cos,tan:Math.tan,atan2:Math.atan2,exp:Math.exp,log:Math.log,pi:Math.PI,huge:Infinity,
    min:(...a)=>Math.min(...a.map(Number)),max:(...a)=>Math.max(...a.map(Number)),clamp:(x,a,b)=>Math.min(b,Math.max(a,x)),round:x=>Math.round(x),sign:Math.sign,rad:x=>x*Math.PI/180,deg:x=>x*180/Math.PI,
    random:(a,b)=>{if(a==null)return R();if(b==null)return 1+Math.floor(R()*num(a));a=num(a);b=num(b);return a+Math.floor(R()*(b-a+1))},noise:(x,y)=>Math.sin(x*1.7+(y||0)*2.3)*.5}));
  set('string',STRLIB);
  set('table',mkTbl({insert:(t,a,b)=>{if(b===undefined){t.set(t.len()+1,a)}else{const n=t.len();for(let i=n;i>=a;i--)t.set(i+1,t.get(i));t.set(a,b)}},
    remove:(t,i)=>{const n=t.len();i=i==null?n:num(i);const v=t.get(i);for(let k=i;k<n;k++)t.set(k,t.get(k+1));t.set(n,undefined);return v},
    concat:(t,s)=>{const a=[];for(let i=1;i<=t.len();i++)a.push(tostr(t.get(i)));return a.join(s==null?'':s)},getn:t=>t.len(),
    find:(t,v)=>{for(let i=1;i<=t.len();i++)if(t.get(i)===v)return i;return undefined},
    sort:(t)=>{const a=[];for(let i=1;i<=t.len();i++)a.push(t.get(i));a.sort((x,y)=>x<y?-1:x>y?1:0);a.forEach((v,i)=>t.set(i+1,v))}}))}

/* ---------- exécution : fils coopératifs ---------- */
class Runtime{constructor(out){this.out=out;this.time=0;this.threads=[];this.G=new Scope(null);baseLib(this.G,this);this.errors=0}
  spawn(fn,args,name,delay=0){if(this.threads.length>400){this.out('trop de fils de script actifs','error');return}
    const th={rt:this,G:this.G,steps:0,depth:0,line:0,name,wake:this.time+delay,dead:false};th.gen=(function*(){yield* call(fn,args||[],th,0)})();this.threads.push(th);if(!delay)this.step(th);return th}
  runScript(src,name,locals){let ast;try{ast=parse(src)}catch(e){this.report(e,name);return false}
    const sc=new Scope(this.G);for(const k in locals||{})sc.v.set(k,locals[k]);
    const th={rt:this,G:this.G,steps:0,depth:0,line:0,name,wake:this.time,dead:false};th.gen=exec(ast,sc,th);this.threads.push(th);this.step(th);return true}
  step(th){th.steps=0;th.depth=0;try{const r=th.gen.next();if(r.done)th.dead=true;else th.wake=this.time+(r.value&&r.value.t||0)}catch(e){th.dead=true;this.report(e,th.name,th.line)}}
  tick(dt){this.time+=dt;for(const th of this.threads.slice())if(!th.dead&&th.wake<=this.time)this.step(th);this.threads=this.threads.filter(t=>!t.dead)}
  report(e,name,line){this.errors++;const l=e.line||line;this.out(`${name||'script'}${l?' (ligne '+l+')':''} : ${e.cs?e.message:'erreur interne — '+e.message}`,'error')}
  fire(fn,args,name){this.spawn(fn,args,name)}
  stop(){this.threads=[]}}
return{parse,lex,Tbl,LFunc,Wait,Multi,Runtime,tostr,truthy,mkTbl,typeOf,err,num}})();
if(typeof module!=='undefined')module.exports=CS;
