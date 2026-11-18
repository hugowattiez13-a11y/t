"use strict";
/* ============================================================================
   MUSIQUE PROCÉDURALE + SONS SUPPLÉMENTAIRES
   Séquenceur WebAudio : accords, basse, arpège, mélodie et batterie synthétisés.
   ============================================================================ */
Object.assign(SFX,{
  boom(){noise(1.2,.5,{type:'lowpass',f:900,f2:60,q:.7,rev:.35});tone('sine',90,.7,.5,{f2:28,rev:.2});tone('square',60,.25,.08,{f2:30});noise(.15,.2,{type:'highpass',f:2500,rev:.2})},
  emoji(){tone('sine',880,.12,.07,{f2:1320});tone('triangle',1320,.1,.04,{delay:.06})},
  laugh(){for(let i=0;i<5;i++)tone('triangle',420-i*18,.09,.06,{f2:300-i*14,delay:i*.11,vib:[12,30]})},
  cry(){tone('sine',520,.9,.05,{f2:300,vib:[6,25]})},
  cheer(){noise(.9,.06,{type:'bandpass',f:1600,q:.6,rev:.3});for(let i=0;i<4;i++)tone('triangle',[523,659,784,1047][i],.18,.05,{delay:i*.07})},
  guitar(){[196,247,294,392].forEach((f,i)=>tone('sawtooth',f,.6,.04,{delay:i*.03,rev:.25}))},
  flip(){tone('sine',300,.35,.08,{f2:900});noise(.3,.04,{type:'bandpass',f:1500,f2:3500})},
  paint(){noise(.06,.025,{type:'highpass',f:4000,rev:0})},
  place(){tone('square',260,.06,.05,{f2:180,rev:.05});noise(.05,.05,{type:'lowpass',f:1200})}
});

const Music={cur:null,timer:null,step:0,next:0,bus:null,
  init(){if(!AU.ctx||this.bus)return;const C=AU.ctx;this.bus=C.createGain();this.bus.gain.value=0;const lp=C.createBiquadFilter();lp.type='lowpass';lp.frequency.value=5200;this.bus.connect(lp);lp.connect(AU.master);this.lp=lp;this.vol()},
  vol(){if(!this.bus)return;const v=(SET.mus??50)/100*.55;this.bus.gain.setTargetAtTime(this.cur?v:0,AU.ctx.currentTime,.4)},
  play(name){if(name===this.cur&&this.timer)return;this.want=name;if(!AU.ctx)return;this.init();this.stop(true);if(!name||name==='none'||!SONGS[name]){this.cur=null;this.vol();return}
    this.cur=name;this.song=SONGS[name];this.step=0;this.next=AU.ctx.currentTime+.15;this.vol();this.timer=setInterval(()=>this.tick(),60)},
  stop(keep){clearInterval(this.timer);this.timer=null;if(!keep){this.cur=null;this.vol()}},
  duck(k){if(this.bus)this.bus.gain.setTargetAtTime(((SET.mus??50)/100*.55)*k,AU.ctx.currentTime,.2)},
  tick(){const C=AU.ctx,S=this.song;if(!C||!S)return;const sp=60/S.bpm/4;
    while(this.next<C.currentTime+.25){this.sched(S,this.step,this.next,sp);this.step++;this.next+=sp*(this.step%2?1+(S.swing||0):1-(S.swing||0))}},
  sched(S,i,t,sp){const bar=Math.floor(i/16)%S.prog.length,s=i%16,ch=S.prog[bar],root=S.key;
    const N=n=>440*Math.pow(2,(n-69)/12);
    const v=(type,f,dur,g,o={})=>this.note(type,f,t,dur,g,o);
    // accords (pads)
    if(s===0&&S.pad)for(const n of ch)v(S.pad,N(root+n+12),sp*16*.98,.022,{a:.25,r:.4,lp:1800});
    // basse
    if(S.bass){const pat=S.bass;const k=pat[s];if(k!=null&&k!=='.')v(S.bassType||'triangle',N(root+ch[0]-12+(+k||0)),sp*1.7,.11,{a:.005,r:.08,lp:900})}
    // arpège
    if(S.arp&&s%S.arp.every===0){const idx=(s/S.arp.every)%ch.length;v(S.arp.type||'square',N(root+ch[idx]+24+(S.arp.oct||0)),sp*.9,.025,{a:.004,r:.06,lp:3200})}
    // mélodie
    if(S.mel){const m=S.mel[(Math.floor(i/16)%(S.mel.length/16|0||1))*16+s];if(m!=null&&m!=='.'){const sc=S.scale,deg=+m,oct=Math.floor(deg/sc.length),n=sc[((deg%sc.length)+sc.length)%sc.length]+12*oct;v(S.melType||'triangle',N(root+24+n),sp*1.6,.05,{a:.01,r:.12,vib:1,lp:4000,rev:1})}}
    // batterie
    const D=S.drums;if(D){if(D.k[s]==='x')this.kick(t);if(D.s[s]==='x')this.snare(t);if(D.h[s]==='x')this.hat(t,s%4===2?.045:.025);if(D.c&&D.c[s]==='x')this.clap(t)}},
  note(type,f,t,dur,g,{a=.01,r=.1,lp,vib,rev}={}){const C=AU.ctx,o=C.createOscillator(),gn=C.createGain();o.type=type;o.frequency.setValueAtTime(f,t);let node=o;
    if(vib){const l=C.createOscillator(),lg=C.createGain();l.frequency.value=5.5;lg.gain.value=f*.006;l.connect(lg);lg.connect(o.frequency);l.start(t);l.stop(t+dur+r+.05)}
    if(lp){const fl=C.createBiquadFilter();fl.type='lowpass';fl.frequency.value=lp;o.connect(fl);node=fl}
    gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(g,t+a);gn.gain.setValueAtTime(g,t+Math.max(a,dur-r));gn.gain.linearRampToValueAtTime(0,t+dur+r);node.connect(gn);gn.connect(this.bus);if(rev&&AU.rev){const rg=C.createGain();rg.gain.value=.4;gn.connect(rg);rg.connect(AU.rev)}
    o.start(t);o.stop(t+dur+r+.05)},
  kick(t){const C=AU.ctx,o=C.createOscillator(),g=C.createGain();o.frequency.setValueAtTime(140,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);g.gain.setValueAtTime(.32,t);g.gain.exponentialRampToValueAtTime(.001,t+.3);o.connect(g);g.connect(this.bus);o.start(t);o.stop(t+.32)},
  nz(t,dur,g,type,f,q=1){const C=AU.ctx,s=C.createBufferSource(),fl=C.createBiquadFilter(),gn=C.createGain();s.buffer=AU.noise;fl.type=type;fl.frequency.value=f;fl.Q.value=q;gn.gain.setValueAtTime(g,t);gn.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(fl);fl.connect(gn);gn.connect(this.bus);s.start(t,Math.random()*1.5);s.stop(t+dur+.02)},
  snare(t){this.nz(t,.18,.14,'bandpass',1900,.8);const C=AU.ctx,o=C.createOscillator(),g=C.createGain();o.type='triangle';o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(140,t+.08);g.gain.setValueAtTime(.08,t);g.gain.exponentialRampToValueAtTime(.001,t+.12);o.connect(g);g.connect(this.bus);o.start(t);o.stop(t+.14)},
  hat(t,g){this.nz(t,.05,g,'highpass',7500)},clap(t){for(let i=0;i<3;i++)this.nz(t+i*.012,.1,.08,'bandpass',1200,1.2)}};
// gammes : degrés (demi-tons) ; accords relatifs à la tonique
const MAJ=[0,2,4,5,7,9,11],MIN=[0,2,3,5,7,8,10],PENTA=[0,2,4,7,9];
const SONGS={
  menu:{bpm:84,key:57,prog:[[0,4,7,11],[5,9,12,16],[2,5,9,12],[7,11,14,17]],pad:'sine',bass:['0','.','.','.','.','.','.','.','7','.','.','.','.','.','.','.'],
    arp:{every:2,type:'sine',oct:0},scale:PENTA,mel:null,drums:{k:'x.......x.......',s:'................',h:'..x...x...x...x.'}},
  studio:{bpm:92,key:55,prog:[[0,4,7,11],[9,12,16,19],[5,9,12,16],[7,11,14,17]],pad:'sine',bass:['0','.','.','.','.','.','0','.','.','.','.','.','.','.','.','.'],
    arp:{every:4,type:'triangle'},scale:MAJ,drums:{k:'x.........x.....',s:'....x.......x...',h:'..x...x...x...x.'}},
  sandbox:{bpm:104,key:60,swing:.08,prog:[[0,4,7],[7,11,14],[9,12,16],[5,9,12]],pad:'triangle',bass:['0','.','.','0','.','.','7','.','0','.','.','0','.','.','5','.'],
    arp:{every:2,type:'square'},scale:PENTA,mel:['4','.','.','3','.','2','.','.','1','.','2','.','.','.','.','.','2','.','.','3','.','4','.','.','6','.','5','.','4','.','.','.'],
    drums:{k:'x.....x...x.....',s:'....x.......x...',h:'x.x.x.x.x.x.x.x.'}},
  obby:{bpm:128,key:62,prog:[[0,3,7],[8,12,15],[3,7,10],[10,14,17]],pad:'sawtooth',bassType:'sawtooth',bass:['0','0','.','0','.','0','.','12','0','0','.','0','.','0','12','.'],
    arp:{every:1,type:'square'},scale:MIN,mel:['7','.','6','.','4','.','3','.','4','.','.','.','2','.','3','.','4','.','3','.','4','.','7','.','6','.','.','.','.','.','.','.'],
    drums:{k:'x...x...x...x...',s:'....x.......x...',h:'..x...x...x...x.',c:'............x...'}},
  tycoon:{bpm:112,key:58,swing:.12,prog:[[0,4,7,10],[5,9,12,15],[0,4,7,10],[7,11,14,17]],pad:'triangle',bass:['0','.','7','.','10','.','7','.','0','.','7','.','12','.','10','.'],
    arp:null,scale:PENTA,mel:['.','.','4','.','3','.','4','.','.','.','2','.','.','.','.','.','.','.','4','.','5','.','4','.','2','.','1','.','.','.','.','.'],
    drums:{k:'x.....x.x.......',s:'....x.......x..x',h:'x.xxx.xxx.xxx.xx'}},
  rpg:{bpm:96,key:57,prog:[[0,3,7],[-4,0,3],[-2,2,5],[-5,-2,2]],pad:'sawtooth',bass:['0','.','.','.','0','.','.','.','0','.','.','.','0','.','7','.'],
    arp:{every:2,type:'triangle'},scale:MIN,melType:'sine',mel:['4','.','.','.','5','.','4','.','2','.','.','.','0','.','.','.','2','.','.','.','4','.','2','.','1','.','.','.','.','.','.','.'],
    drums:{k:'x.......x.....x.',s:'........x.......',h:'....x.......x...'}},
  boss:{bpm:140,key:52,prog:[[0,3,7],[1,5,8],[0,3,7],[-2,1,5]],pad:'sawtooth',bassType:'sawtooth',bass:['0','0','0','.','0','0','1','.','0','0','0','.','-2','.','-2','.'],
    arp:{every:1,type:'square',oct:-12},scale:MIN,drums:{k:'x.x.x.x.x.x.x.x.',s:'....x.......x...',h:'xxxxxxxxxxxxxxxx'}},
  victoire:{bpm:120,key:60,prog:[[0,4,7],[5,9,12],[7,11,14],[0,4,7]],pad:'triangle',bass:['0','.','0','.','7','.','7','.','0','.','0','.','7','.','12','.'],arp:{every:1,type:'square'},scale:MAJ,
    drums:{k:'x...x...x...x...',s:'....x.......x...',h:'x.x.x.x.x.x.x.x.'}}};
