"use strict";
/* ============================== MATHS ============================== */
const V={add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],mul:(a,s)=>[a[0]*s,a[1]*s,a[2]*s],
  dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],
  len:a=>Math.hypot(a[0],a[1],a[2]),norm:a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return[a[0]/l,a[1]/l,a[2]/l]}};
const M={
  id(){const m=new Float32Array(16);m[0]=m[5]=m[10]=m[15]=1;return m},
  mul(a,b){const o=new Float32Array(16);for(let c=0;c<4;c++)for(let r=0;r<4;r++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+r]*b[c*4+k];o[c*4+r]=s}return o},
  persp(fov,asp,n,f){const t=1/Math.tan(fov/2),o=new Float32Array(16);o[0]=t/asp;o[5]=t;o[10]=(f+n)/(n-f);o[11]=-1;o[14]=2*f*n/(n-f);return o},
  ortho(l,r,b,t,n,f){const o=M.id();o[0]=2/(r-l);o[5]=2/(t-b);o[10]=-2/(f-n);o[12]=-(r+l)/(r-l);o[13]=-(t+b)/(t-b);o[14]=-(f+n)/(f-n);return o},
  lookAt(e,c,u){const z=V.norm(V.sub(e,c)),x=V.norm(V.cross(u,z)),y=V.cross(z,x),o=M.id();
    o[0]=x[0];o[4]=x[1];o[8]=x[2];o[1]=y[0];o[5]=y[1];o[9]=y[2];o[2]=z[0];o[6]=z[1];o[10]=z[2];o[12]=-V.dot(x,e);o[13]=-V.dot(y,e);o[14]=-V.dot(z,e);return o},
  T(x,y,z){const o=M.id();o[12]=x;o[13]=y;o[14]=z;return o},
  S(x,y,z){const o=M.id();o[0]=x;o[5]=y;o[10]=z;return o},
  RX(a){const o=M.id(),c=Math.cos(a),s=Math.sin(a);o[5]=c;o[6]=s;o[9]=-s;o[10]=c;return o},
  RY(a){const o=M.id(),c=Math.cos(a),s=Math.sin(a);o[0]=c;o[2]=-s;o[8]=s;o[10]=c;return o},
  RZ(a){const o=M.id(),c=Math.cos(a),s=Math.sin(a);o[0]=c;o[1]=s;o[4]=-s;o[5]=c;return o},
  tr(m){const o=new Float32Array(16);for(let i=0;i<4;i++)for(let j=0;j<4;j++)o[i*4+j]=m[j*4+i];return o},
  inv(a){const o=new Float32Array(16),a00=a[0],a01=a[1],a02=a[2],a03=a[3],a10=a[4],a11=a[5],a12=a[6],a13=a[7],a20=a[8],a21=a[9],a22=a[10],a23=a[11],a30=a[12],a31=a[13],a32=a[14],a33=a[15],
    b00=a00*a11-a01*a10,b01=a00*a12-a02*a10,b02=a00*a13-a03*a10,b03=a01*a12-a02*a11,b04=a01*a13-a03*a11,b05=a02*a13-a03*a12,b06=a20*a31-a21*a30,b07=a20*a32-a22*a30,b08=a20*a33-a23*a30,b09=a21*a32-a22*a31,b10=a21*a33-a23*a31,b11=a22*a33-a23*a32;
    let d=b00*b11-b01*b10+b02*b09+b03*b08-b04*b07+b05*b06;if(!d)return M.id();d=1/d;
    o[0]=(a11*b11-a12*b10+a13*b09)*d;o[1]=(a02*b10-a01*b11-a03*b09)*d;o[2]=(a31*b05-a32*b04+a33*b03)*d;o[3]=(a22*b04-a21*b05-a23*b03)*d;o[4]=(a12*b08-a10*b11-a13*b07)*d;o[5]=(a00*b11-a02*b08+a03*b07)*d;o[6]=(a32*b02-a30*b05-a33*b01)*d;o[7]=(a20*b05-a22*b02+a23*b01)*d;
    o[8]=(a10*b10-a11*b08+a13*b06)*d;o[9]=(a01*b08-a00*b10-a03*b06)*d;o[10]=(a30*b04-a31*b02+a33*b00)*d;o[11]=(a21*b02-a20*b04-a23*b00)*d;o[12]=(a11*b07-a10*b09-a12*b06)*d;o[13]=(a00*b09-a01*b07+a02*b06)*d;o[14]=(a31*b01-a30*b03-a32*b00)*d;o[15]=(a20*b03-a21*b01+a22*b00)*d;return o},
  chain(...ms){return ms.reduce((a,b)=>M.mul(a,b))},
  xf(m,p){const x=m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],y=m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13],z=m[2]*p[0]+m[6]*p[1]+m[10]*p[2]+m[14],w=m[3]*p[0]+m[7]*p[1]+m[11]*p[2]+m[15];return[x,y,z,w]}
};
const lerp=(a,b,t)=>a+(b-a)*t,clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[Math.floor(Math.random()*a.length)];
function angLerp(a,b,t){const d=((b-a+Math.PI)%(2*Math.PI)+2*Math.PI)%(2*Math.PI)-Math.PI;return a+d*t}
const hexRGB=h=>{const n=parseInt(h.slice(1),16);return[(n>>16&255)/255,(n>>8&255)/255,(n&255)/255]};

/* ============================== WEBGL ============================== */
const cv=document.getElementById('c');
const gl=cv.getContext('webgl2',{antialias:false,alpha:false,powerPreference:'high-performance'});
function fail(m){const e=document.getElementById('err');e.style.display='block';e.textContent=m;throw new Error(m)}
if(!gl)fail("WebGL2 n'est pas disponible dans ce navigateur.");
const HDR=!!gl.getExtension('EXT_color_buffer_float');
const ANISO=gl.getExtension('EXT_texture_filter_anisotropic');
function program(vs,fs){const mk=(t,s)=>{const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))fail(gl.getShaderInfoLog(sh));return sh};
  const p=gl.createProgram();gl.attachShader(p,mk(gl.VERTEX_SHADER,vs));gl.attachShader(p,mk(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))fail(gl.getProgramInfoLog(p));
  const u={},n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(let i=0;i<n;i++){const f=gl.getActiveUniform(p,i);u[f.name.replace('[0]','')]=gl.getUniformLocation(p,f.name)}return{p,u}}

const COMMON=`
vec3 aces(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}`;
const CUT=`
uniform int uMode;uniform vec3 uBMin,uBSize;
bool cutout(vec3 w,vec3 n){
  vec3 l=w-uBMin;
  if(uMode==4){ // échelle : montants + barreaux
    if(abs(n.y)>.5)return false;
    float hz=uBSize.x>=uBSize.z?l.x:l.z,wd=max(uBSize.x,uBSize.z);
    bool rail=hz<.16||hz>wd-.16;float v=fract(l.y*1.6);bool rung=v>.42&&v<.6;
    return !(rail||rung);}
  if(uMode==5){ // treillis
    vec2 q=abs(n.y)>.5?l.xz:(abs(n.x)>.5?l.zy:l.xy);vec2 c=fract(q/2.);float b=.07;
    bool fr=c.x<b||c.x>1.-b||c.y<b||c.y>1.-b;bool dg=abs(c.x-c.y)<b*1.2||abs(c.x+c.y-1.)<b*1.2;
    return !(fr||dg);}
  return false;}`;
const VS=`#version 300 es
layout(location=0) in vec3 aP;layout(location=1) in vec3 aN;layout(location=2) in vec2 aUV;
uniform mat4 uVP,uM,uNM;out vec3 vW;out vec3 vN;out vec2 vUV;
void main(){vec4 w=uM*vec4(aP,1.);vW=w.xyz;vN=mat3(uNM)*aN;vUV=aUV;gl_Position=uVP*w;}`;
const FS=`#version 300 es
precision highp float;precision highp sampler2DShadow;
in vec3 vW;in vec3 vN;in vec2 vUV;out vec4 o;
uniform vec3 uColor,uCam,uSun,uSunCol,uSky,uGnd,uHor,uZen,uDir;
uniform float uShin,uEmis,uTime,uAlpha,uRim,uHDR,uMatScale,uTint,uStuds,uAO;
uniform int uTaps;uniform mat4 uLVP;uniform sampler2DShadow uShadow;uniform sampler2D uTex,uMat,uStud,uInlet;
uniform int uNL;uniform vec4 uLP[8];uniform vec3 uLC[8];uniform float uFogD;uniform vec3 uFogC;
${COMMON}${CUT}
const vec2 PD[16]=vec2[16](vec2(-.942,-.399),vec2(.946,-.769),vec2(-.094,-.929),vec2(.345,.294),vec2(-.916,.458),vec2(-.815,-.879),vec2(-.383,.277),vec2(.975,.756),
  vec2(.443,-.975),vec2(.537,-.474),vec2(-.265,-.419),vec2(.792,.191),vec2(-.242,.997),vec2(-.814,.914),vec2(.2,.786),vec2(.144,-.141));
vec3 skyCol(vec3 d){return d.y>0.?mix(uHor,uZen,pow(smoothstep(0.,.6,d.y),.7)):mix(uHor,uGnd,smoothstep(0.,-.2,d.y));}
float shadow(vec3 n,float ndl){
  vec4 sp=uLVP*vec4(vW+n*.035,1.);vec3 p=sp.xyz/sp.w*.5+.5;
  if(uTaps==0)return 1.;if(p.x<0.||p.x>1.||p.y<0.||p.y>1.||p.z>1.)return 1.;
  float b=.0003+.0012*(1.-ndl);vec2 ts=1./vec2(textureSize(uShadow,0));
  float a=hash(vW.xz*37.+vW.y*13.)*6.2831;mat2 R=mat2(cos(a),sin(a),-sin(a),cos(a));
  float s=0.;float k=0.;
  for(int i=0;i<16;i++){if(i>=uTaps)break;s+=texture(uShadow,vec3(p.xy+R*PD[i]*ts*1.8,p.z-b));k+=1.;}
  return s/k;}
vec3 finish(vec3 c,float dist){float f=1.-exp(-dist*uFogD);c=mix(c,uFogC,clamp(f,0.,uFogD>.004?.97:.75));
  return uHDR>.5?c:pow(aces(c),vec3(1./2.2));}
void main(){
  vec3 gn=normalize(vN);vec3 sn=gl_FrontFacing?gn:-gn;vec3 n=sn;
  if(cutout(vW,gn))discard;
  if(uMode==7){vec2 c=vec2(fract(vUV.x*3.),fract(vUV.y*2.));float e=min(min(c.x,1.-c.x),min(c.y,1.-c.y));
    vec3 cc=pow(uColor,vec3(2.2))*(uHDR>.5?2.:1.);o=vec4(uHDR>.5?cc:uColor,e<.04?.95:uAlpha);return;}
  vec3 v=normalize(uCam-vW);float dist=length(uCam-vW);
  vec3 base=pow(uColor,vec3(2.2));float shin=uShin,specK=1.;vec3 an=abs(n);
  if(uMode==0)base=pow(texture(uTex,vUV).rgb,vec3(2.2));
  else if(uMode==1||uMode==4||uMode==5){
    vec2 uv=an.y>.5?vW.xz:(an.x>.5?vW.zy:vW.xy);
    vec3 t=pow(texture(uMat,uv/uMatScale).rgb,vec3(2.2));
    base=uTint>.5?base*t*1.25:t;specK=.4+dot(t,vec3(.4));
    if(uStuds>.5){if(n.y>.5)base*=texture(uStud,vW.xz*2.).r*1.15;else if(n.y<-.5)base*=texture(uInlet,vW.xz*2.).r*1.1;}
  }else if(uMode==2){
    float w=sin(vW.x*2.3+uTime*2.)*sin(vW.z*2.1-uTime*1.7)+sin((vW.x+vW.z)*4.+uTime*3.)*.5;
    base=mix(vec3(1.,.06,0.),vec3(1.,.6,.05),w*.35+.5);
  }else if(uMode==6){
    vec3 l=vW-uBMin;vec3 ac=vec3(abs(uDir.z),0.,abs(uDir.x));float across=dot(l,ac),wd=dot(uBSize,ac);
    float s=fract((dot(vW,uDir)-abs(across-wd*.5)*.7)*.9-uTime*1.5);if(n.y>.5)base*=s<.45?1.:.3;
  }else if(uMode==9&&n.y>.5){
    vec2 q=vW.xz;float t=uTime;
    n=normalize(vec3(sin(q.x*1.7+t*1.6)*.1+sin(q.x*3.1-q.y*2.3+t*2.3)*.06+sin(q.x*7.+t*3.)*.03,1.,cos(q.y*1.9-t*1.3)*.1+sin(q.y*3.7+q.x*1.3+t*2.)*.06+cos(q.y*6.3-t*2.7)*.03));
  }
  if(uAO>.5&&an.y<.5)base*=mix(.6,1.,smoothstep(0.,.8,vW.y-uBMin.y));
  float ndl=max(dot(n,uSun),0.),sh=shadow(sn,ndl);
  vec3 h=normalize(uSun+v);float sp=pow(max(dot(n,h),0.),shin)*(shin+8.)/40.*specK;
  float ndv=max(dot(n,v),0.),fres=pow(1.-ndv,5.);
  vec3 amb=mix(uGnd,uSky,n.y*.5+.5)*.42;
  vec3 col=base*amb+(base*ndl+sp*ndl*.5)*uSunCol*sh;
  col+=skyCol(reflect(-v,n))*fres*.3*clamp(shin/90.,.05,1.);
  col+=uSky*pow(1.-ndv,3.)*uRim*.55;
  if(uMode==2)col=base*3.2+col*.15;
  for(int i=0;i<8;i++){if(i>=uNL)break;vec3 L=uLP[i].xyz-vW;float d=length(L);float r=uLP[i].w;if(d>r)continue;L/=d;float at=1.-d/r;at*=at;
    float nl=max(dot(n,L),0.)*.85+.15;vec3 hh=normalize(L+v);col+=uLC[i]*at*(base*nl+pow(max(dot(n,hh),0.),shin)*.25*specK);}
  col+=base*uEmis;
  if(uMode==8){vec3 r=skyCol(reflect(-v,n));float a=clamp(.16+fres*.8,0.,1.);
    col=base*amb*.6+r*(.2+fres*.8)+pow(max(dot(n,h),0.),300.)*uSunCol*6.*sh;o=vec4(finish(col,dist),a);return;}
  if(uMode==9){vec3 r=skyCol(reflect(-v,n));vec3 deep=vec3(.01,.09,.13);
    col=mix(deep+base*amb*.25,r,.15+fres*.75)+pow(max(dot(n,h),0.),260.)*uSunCol*5.*sh;o=vec4(finish(col,dist),.7+fres*.28);return;}
  o=vec4(finish(col,dist),uAlpha);
}`;
const SVS=`#version 300 es
layout(location=0) in vec3 aP;layout(location=1) in vec3 aN;uniform mat4 uVP,uM;out vec3 vW;out vec3 vN;
void main(){vec4 w=uM*vec4(aP,1.);vW=w.xyz;vN=mat3(uM)*aN;gl_Position=uVP*w;}`;
const SFS=`#version 300 es
precision highp float;in vec3 vW;in vec3 vN;out vec4 o;${CUT}
void main(){if(cutout(vW,normalize(vN)))discard;o=vec4(1.);}`;
const FSQ=`#version 300 es
out vec2 vU;void main(){vec2 p=vec2((gl_VertexID<<1)&2,gl_VertexID&2);vU=p;gl_Position=vec4(p*2.-1.,.9999,1.);}`;
const KFS=`#version 300 es
precision highp float;in vec2 vU;out vec4 o;uniform mat4 uIVP;uniform vec3 uCam,uZen,uHor,uSun,uSunCol,uGnd;uniform float uHDR,uTime,uClouds;
${COMMON}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
void main(){vec4 p=uIVP*vec4(vU*2.-1.,1.,1.);vec3 d=normalize(p.xyz/p.w-uCam);
  vec3 c=d.y>0.?mix(uHor,uZen,pow(smoothstep(0.,.6,d.y),.7)):mix(uHor,uGnd,smoothstep(0.,-.2,d.y));
  if(d.y>0.&&uClouds>.5){vec2 cp=d.xz/(d.y+.12)*1.6+vec2(uTime*.006,0.);float cl=noise(cp)*.6+noise(cp*2.3)*.3+noise(cp*5.)*.1;
    float m=smoothstep(.55,.82,cl)*smoothstep(0.,.25,d.y);float lit=.85+.3*max(dot(d,uSun),0.);c=mix(c,vec3(1.)*lit,m*.85);}
  float s=max(dot(d,uSun),0.);c+=uSunCol*(pow(s,900.)*14.+pow(s,40.)*.25+pow(s,6.)*.06);
  o=vec4(uHDR>.5?c:pow(aces(c),vec3(1./2.2)),1.);}`;
// particules (billboards)
const PVS=`#version 300 es
layout(location=0) in vec3 aP;layout(location=1) in vec2 aUV;layout(location=2) in vec4 aC;layout(location=3) in float aS;
uniform mat4 uVP;out vec2 vUV;out vec4 vC;out float vS;
void main(){vUV=aUV;vC=aC;vS=aS;gl_Position=uVP*vec4(aP,1.);}`;
const PFS=`#version 300 es
precision mediump float;in vec2 vUV;in vec4 vC;in float vS;out vec4 o;uniform float uAdd,uHDR;
void main(){float d=length(vUV),a;
  if(vS<.5){a=1.-smoothstep(0.,1.,d);a*=a;}
  else if(vS<1.5){a=smoothstep(.22,0.,abs(d-.78));}
  else{a=pow(max(1.-d,0.),3.)*1.4;}
  vec3 c=vC.rgb;if(uHDR<.5)c=min(c,vec3(1.));
  a*=vC.a;o=uAdd>.5?vec4(c*a,a):vec4(c,a);}`;
// post-traitement
const DOWN=`#version 300 es
precision highp float;in vec2 vU;out vec4 o;uniform sampler2D uSrc;uniform vec2 uTx;uniform float uFirst,uTh;
vec3 s(vec2 k){return texture(uSrc,vU+k*uTx).rgb;}
void main(){vec3 c=s(vec2(0))*4.+s(vec2(-1,-1))+s(vec2(1,-1))+s(vec2(-1,1))+s(vec2(1,1));c/=8.;
  if(uFirst>.5){float b=max(c.r,max(c.g,c.b));float k=clamp(b-uTh+.6,0.,1.2);k=k*k/2.4;c*=max(b-uTh,k)/max(b,1e-4);c=min(c,vec3(50.));}
  o=vec4(c,1.);}`;
const UP=`#version 300 es
precision highp float;in vec2 vU;out vec4 o;uniform sampler2D uSrc;uniform vec2 uTx;
void main(){vec3 c=vec3(0);
  c+=texture(uSrc,vU+vec2(-1,-1)*uTx).rgb+texture(uSrc,vU+vec2(1,-1)*uTx).rgb+texture(uSrc,vU+vec2(-1,1)*uTx).rgb+texture(uSrc,vU+vec2(1,1)*uTx).rgb;
  c+=2.*(texture(uSrc,vU+vec2(-1,0)*uTx).rgb+texture(uSrc,vU+vec2(1,0)*uTx).rgb+texture(uSrc,vU+vec2(0,-1)*uTx).rgb+texture(uSrc,vU+vec2(0,1)*uTx).rgb);
  c+=4.*texture(uSrc,vU).rgb;o=vec4(c/16.,1.);}`;
const COMP=`#version 300 es
precision highp float;in vec2 vU;out vec4 o;uniform sampler2D uScene,uBloom;uniform float uBloomI,uHDR,uTime,uExp,uFlare;uniform vec2 uRes,uSunP;
${COMMON}
void main(){vec3 c=texture(uScene,vU).rgb;
  if(uHDR>.5){c+=texture(uBloom,vU).rgb*uBloomI;c=pow(aces(c*uExp),vec3(1./2.2));}
  if(uFlare>.01){vec2 asp=vec2(uRes.x/uRes.y,1.);vec2 d=(vU-uSunP)*asp;float g=exp(-length(d)*6.)*.35+exp(-abs(d.y)*90.)*exp(-abs(d.x)*3.)*.12;vec3 f=vec3(1.,.92,.75)*g;
    for(int i=1;i<=4;i++){float k=float(i)*.42-.2;vec2 gp=uSunP+(vec2(.5)-uSunP)*k*2.;float r=length((vU-gp)*asp);float sz=.03+.025*float(i);
      f+=mix(vec3(.4,.7,1.),vec3(1.,.6,.4),fract(float(i)*.37))*smoothstep(sz,sz*.6,r)*.07;}
    c+=f*uFlare;}
  float l=dot(c,vec3(.299,.587,.114));c=mix(vec3(l),c,1.1);c=(c-.5)*1.05+.5;
  vec2 q=vU-.5;c*=1.-dot(q,q)*.6;
  c+=(hash(vU*uRes+fract(uTime)*91.)-.5)*.014;
  o=vec4(c,1.);}`;
const P=program(VS,FS),PS=program(SVS,SFS),PK=program(FSQ,KFS),PP=program(PVS,PFS),PD_=program(FSQ,DOWN),PU=program(FSQ,UP),PC=program(FSQ,COMP);
const emptyVAO=gl.createVertexArray();

/* ---------- cibles de rendu ---------- */
let RT=null,shadowRes=0,shTex=null,shFB=null;
function makeShadow(size){if(shTex){gl.deleteTexture(shTex);gl.deleteFramebuffer(shFB)}shadowRes=size;
  shTex=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,shTex);gl.texStorage2D(gl.TEXTURE_2D,1,gl.DEPTH_COMPONENT24,size,size);
  for(const[k,v]of[[gl.TEXTURE_MIN_FILTER,gl.LINEAR],[gl.TEXTURE_MAG_FILTER,gl.LINEAR],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE],[gl.TEXTURE_COMPARE_MODE,gl.COMPARE_REF_TO_TEXTURE],[gl.TEXTURE_COMPARE_FUNC,gl.LEQUAL]])gl.texParameteri(gl.TEXTURE_2D,k,v);
  shFB=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,shFB);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.TEXTURE_2D,shTex,0);gl.bindFramebuffer(gl.FRAMEBUFFER,null)}
function texRT(fmt,w,h){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texStorage2D(gl.TEXTURE_2D,1,fmt,w,h);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  const fb=gl.createFramebuffer();gl.bindFramebuffer(gl.FRAMEBUFFER,fb);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,t,0);return{t,fb,w,h}}
function makeRT(w,h,want=4){
  if(RT){gl.deleteFramebuffer(RT.ms);gl.deleteRenderbuffer(RT.crb);gl.deleteRenderbuffer(RT.drb);for(const x of[RT.scene,...RT.bloom]){gl.deleteTexture(x.t);gl.deleteFramebuffer(x.fb)}}
  const fmt=HDR?gl.RGBA16F:gl.RGBA8;let samples=Math.min(want,gl.getParameter(gl.MAX_SAMPLES)||0);
  const build=s=>{const ms=gl.createFramebuffer(),crb=gl.createRenderbuffer(),drb=gl.createRenderbuffer();
    gl.bindRenderbuffer(gl.RENDERBUFFER,crb);gl.renderbufferStorageMultisample(gl.RENDERBUFFER,s,fmt,w,h);
    gl.bindRenderbuffer(gl.RENDERBUFFER,drb);gl.renderbufferStorageMultisample(gl.RENDERBUFFER,s,gl.DEPTH_COMPONENT24,w,h);
    gl.bindFramebuffer(gl.FRAMEBUFFER,ms);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.RENDERBUFFER,crb);gl.framebufferRenderbuffer(gl.FRAMEBUFFER,gl.DEPTH_ATTACHMENT,gl.RENDERBUFFER,drb);
    return{ms,crb,drb,ok:gl.checkFramebufferStatus(gl.FRAMEBUFFER)===gl.FRAMEBUFFER_COMPLETE}};
  let r=build(samples);if(!r.ok){samples=0;r=build(0)}
  const scene=texRT(fmt,w,h),bloom=[];let bw=w>>1,bh=h>>1;
  for(let i=0;i<5&&bw>=4&&bh>=4;i++){bloom.push(texRT(fmt,bw,bh));bw>>=1;bh>>=1}
  gl.bindFramebuffer(gl.FRAMEBUFFER,null);RT={...r,scene,bloom,w,h,want}}

/* ============================== MAILLAGES ============================== */
const FACES=[[0,0,1],[0,0,-1],[1,0,0],[-1,0,0],[0,1,0],[0,-1,0]];
// boîte arrondie (UV en atlas 3×2) — taper : largeur du bas relative au haut
function gRBox(sx,sy,sz,r,n=12,taper=1){const h=[sx/2,sy/2,sz/2],inn=h.map(v=>Math.max(v-r,0)),pos=[],nrm=[],uv=[],idx=[];
  FACES.forEach((f,fi)=>{const up=Math.abs(f[1])>.5?[1,0,0]:[0,1,0],a=V.cross(up,f),b=V.cross(f,a),o=pos.length/3,col=fi%3,row=fi/3|0;
    for(let j=0;j<=n;j++)for(let i=0;i<=n;i++){const s=Math.sin((i/n*2-1)*Math.PI/2),t=Math.sin((j/n*2-1)*Math.PI/2);
      const q=[0,1,2].map(k=>h[k]*(f[k]+a[k]*s+b[k]*t)),c=q.map((v,k)=>clamp(v,-inn[k],inn[k])),d=V.sub(q,c),L=V.len(d);let nn=L>1e-7?V.mul(d,1/L):f;
      const p=L>1e-7?V.add(c,V.mul(nn,r)):q;
      if(taper!==1){const k=lerp(taper,1,(p[1]+h[1])/(2*h[1]));p[0]*=k;nn=V.norm([nn[0]/k,nn[1]+(1-taper)*.25*Math.abs(nn[0]),nn[2]])}
      pos.push(...p);nrm.push(...nn);uv.push((col+.015+.97*(s+1)/2)/3,(row+.015+.97*(t+1)/2)/2)}
    for(let j=0;j<n;j++)for(let i=0;i<n;i++){const k=o+j*(n+1)+i;idx.push(k,k+1,k+n+2,k,k+n+2,k+n+1)}});return{pos,nrm,uv,idx}}
function gQuad(w,h){return{pos:[-w/2,-h/2,0,w/2,-h/2,0,w/2,h/2,0,-w/2,h/2,0],nrm:[0,0,1,0,0,1,0,0,1,0,0,1],uv:[0,0,1,0,1,1,0,1],idx:[0,1,2,0,2,3]}}
function upload(g){const vao=gl.createVertexArray();gl.bindVertexArray(vao);
  const buf=(l,d,s)=>{const b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(d),gl.STATIC_DRAW);gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,s,gl.FLOAT,false,0,0)};
  buf(0,g.pos,3);buf(1,g.nrm,3);buf(2,g.uv,2);const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint32Array(g.idx),gl.STATIC_DRAW);
  gl.bindVertexArray(null);return{vao,count:g.idx.length}}
/* ============================== TEXTURES ============================== */
function glTex(c,repeat){const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);gl.generateMipmap(gl.TEXTURE_2D);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  const w=repeat?gl.REPEAT:gl.CLAMP_TO_EDGE;gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,w);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,w);
  if(ANISO)gl.texParameterf(gl.TEXTURE_2D,ANISO.TEXTURE_MAX_ANISOTROPY_EXT,8);return t}
const cnv=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return[c,c.getContext('2d')]};
// bruit tuilable
function makeNoise(n,seed){const g=new Float32Array(n*n);let s=seed*9973+7;for(let i=0;i<n*n;i++){s=(s*16807)%2147483647;g[i]=s/2147483647}
  return(x,y)=>{const fx=x*n,fy=y*n,ix=Math.floor(fx),iy=Math.floor(fy),tx=fx-ix,ty=fy-iy,sx=tx*tx*(3-2*tx),sy=ty*ty*(3-2*ty);
    const X0=((ix%n)+n)%n,X1=(X0+1)%n,Y0=((iy%n)+n)%n,Y1=(Y0+1)%n,a=g[Y0*n+X0],b=g[Y0*n+X1],c=g[Y1*n+X0],d=g[Y1*n+X1];
    return a+(b-a)*sx+(c-a)*sy+(a-b-c+d)*sx*sy}}
const NZ=[makeNoise(4,1),makeNoise(8,2),makeNoise(16,3),makeNoise(32,4),makeNoise(64,5)];
const fbm=(x,y,o=1)=>{let v=0,a=.5,t=0;for(let i=o;i<NZ.length;i++){v+=NZ[i](x,y)*a;t+=a;a*=.5}return v/t};
function makeVor(G,seed){let s=seed*7919+3;const R=()=>(s=(s*16807)%2147483647)/2147483647,pts=[];
  for(let j=0;j<G;j++)for(let i=0;i<G;i++)pts.push([(i+.15+R()*.7)/G,(j+.15+R()*.7)/G,R()]);
  return(x,y)=>{const ci=Math.floor(x*G),cj=Math.floor(y*G);let d1=9,d2=9,id=0;
    for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){let i=ci+di,j=cj+dj,ox=0,oy=0;if(i<0){i+=G;ox=-1}if(i>=G){i-=G;ox=1}if(j<0){j+=G;oy=-1}if(j>=G){j-=G;oy=1}
      const p=pts[j*G+i],d=Math.hypot(p[0]+ox-x,p[1]+oy-y);if(d<d1){d2=d1;d1=d;id=p[2]}else if(d<d2)d2=d}return[d1,d2,id]}}
function genTex(fn,S=256){const[c,x]=cnv(S,S),img=x.createImageData(S,S),d=img.data;
  for(let y=0;y<S;y++)for(let X=0;X<S;X++){const r=fn(X/S,y/S),i=(y*S+X)*4;d[i]=clamp(r[0],0,255);d[i+1]=clamp(r[1],0,255);d[i+2]=clamp(r[2],0,255);d[i+3]=255}
  x.putImageData(img,0,0);return glTex(c,true)}
const mixc=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)],scl=(a,k)=>[a[0]*k,a[1]*k,a[2]*k];
const rh=(i)=>{const s=Math.sin(i*127.1+311.7)*43758.5453;return s-Math.floor(s)};
const vorA=makeVor(5,11),vorB=makeVor(4,23),vorC=makeVor(7,5);
const MATTEX={
  plastique:genTex((x,y)=>{const v=.86+(fbm(x,y,2)-.5)*.08;return[v*255,v*255,v*255]}),
  bois:genTex((x,y)=>{const rows=4,row=Math.floor(y*rows),ry=y*rows-row,rr=rh(row+1),jo=rh(row+7);
    const g=Math.sin((ry*7+NZ[3](x,y)*2.2+NZ[1](x*2%1,y)*.8+rr*9)*Math.PI*2)*.5+.5;let c=mixc([128,84,48],[184,128,78],rr*.8+.1);
    c=scl(c,.82+.18*g*(.7+.3*fbm(x,y)));if(ry<.035||ry>.975)c=scl(c,.35);const jx=Math.abs(((x-jo)%1+1)%1);if(jx<.006||jx>.994)c=scl(c,.4);return c}),
  brique:genTex((x,y)=>{const rows=8,row=Math.floor(y*rows),ry=y*rows-row,bx=x*4+(row%2?.5:0),bi=Math.floor(bx),fx=bx-bi,id=rh(row*13+(((bi%4)+4)%4));
    const n=fbm(x,y);if(fx<.035||ry<.07)return scl([196,190,178],.8+.25*n);
    return scl(mixc([150,56,44],[188,82,58],id),.8+.35*n*(1-.3*NZ[4](x,y)))}),
  pierre:genTex((x,y)=>{const[d1,d2,id]=vorA(x,y),e=d2-d1,n=fbm(x,y);if(e<.022)return scl([72,70,66],.8+.4*n);
    return scl(mixc([112,110,104],[168,164,154],id),(.78+.3*n)*(1-clamp(d1*1.6,0,.35))*(e<.045?.85:1))}),
  metal:genTex((x,y)=>{let v=148+(NZ[4](x,y*.05)*2-1)*10+(fbm(x,y)-.5)*20;const cx=(x*8)%1,cy=(y*8)%1,odd=(Math.floor(x*8)+Math.floor(y*8))%2;
    const u=(cx-.5),w=(cy-.5),a=odd?(u+w):(u-w),b=odd?(u-w):(u+w),d=Math.hypot(a*1,b*3.2);
    if(d<.2){const k=1-d/.2;v+=(a*(odd?1:-1)>0?34:-26)*k}return[v,v*1.01,v*1.04]}),
  herbe:genTex((x,y)=>{const n=fbm(x,y),p=NZ[1](x,y),s=NZ[4](x,y);let c=mixc([60,118,40],[106,168,58],n);c=mixc(c,[52,96,36],clamp((p-.55)*2,0,.5));if(s>.7)c=mixc(c,[150,200,90],(s-.7)*2);return c}),
  sable:genTex((x,y)=>{const n=fbm(x,y),r=Math.sin((y+n*.25)*Math.PI*2*12)*.5+.5;return scl([214,190,140],.88+.12*n+.06*r+(NZ[4](x,y)-.5)*.06)}),
  glace:genTex((x,y)=>{const n=fbm(x,y),[a,b]=vorB(x,y),[c2,d2]=vorC(x,y);let c=mixc([170,212,238],[222,242,252],n);
    if(b-a<.008)c=[248,252,255];else if(d2-c2<.005)c=mixc(c,[240,250,255],.6);return c}),
  marbre:genTex((x,y)=>{const n=fbm(x,y),v=Math.abs(Math.sin((x*2+y*1+n*2.6)*Math.PI*2)),v2=Math.abs(Math.sin((x*3-y*2+n*4)*Math.PI*4));
    let c=mixc([236,233,228],[220,216,210],NZ[1](x,y));c=mixc(c,[120,116,112],Math.pow(1-v,14)*.85);c=mixc(c,[160,156,150],Math.pow(1-v2,22)*.5);return c}),
  neige:genTex((x,y)=>{const n=fbm(x,y),s=NZ[4](x,y);let c=scl([236,242,250],.9+.1*n);c=mixc(c,[205,220,238],clamp((NZ[1](x,y)-.5)*1.5,0,.5));if(s>.86)c=[255,255,255];return c}),
  carrelage:genTex((x,y)=>{const T=4,i=Math.floor(x*T),j=Math.floor(y*T),fx=x*T-i,fy=y*T-j,n=fbm(x,y);if(fx<.035||fy<.035)return scl([196,192,184],.85+.2*n);
    const c=(i+j)%2?[236,232,222]:[64,104,124];return scl(c,.94+.08*n+.04*(1-fy))}),
  tissu:genTex((x,y)=>{const a=Math.sin(x*Math.PI*96),b=Math.sin(y*Math.PI*96),w=(Math.floor(x*48)+Math.floor(y*48))%2?a:b;const v=.8+.12*w+(fbm(x,y)-.5)*.12;return[v*255,v*255,v*255]}),
  ardoise:genTex((x,y)=>{const rows=3,row=Math.floor(y*rows),ry=y*rows-row,bx=x*2+(row%2?.5:0),fx=bx-Math.floor(bx),id=rh(row*7+Math.floor(bx));const n=fbm(x,y),st=Math.sin((y*40+n*6)*Math.PI)*.5+.5;
    let c=scl(mixc([52,58,66],[78,84,94],id),.85+.15*n+.06*st);if(ry<.04||fx<.02)c=scl(c,.45);return c}),
  rouille:genTex((x,y)=>{const n=fbm(x,y),p=NZ[1](x,y),q=NZ[4](x,y);let c=mixc([112,104,98],[96,88,84],n);c=mixc(c,[168,82,32],clamp((p-.42)*3,0,1));c=mixc(c,[90,46,24],clamp((n-.6)*3,0,.8));if(q>.82)c=scl(c,.6);return c}),
  granit:genTex((x,y)=>{const n=fbm(x,y),q=NZ[4](x,y),r=NZ[3](x*1,y);let c=scl([150,144,140],.85+.2*n);if(q>.7)c=[40,38,40];else if(q<.22)c=[226,222,218];else if(r>.72)c=[176,128,120];return c}),
  beton:genTex((x,y)=>{const n=fbm(x,y);let c=scl([150,150,146],.86+.2*n);if(NZ[4](x,y)>.83&&NZ[3](x,y)>.5)c=scl(c,.62);return c})
};
// picots & creux (multipliés)
const studTex=(()=>{const[c,x]=cnv(128,128);x.fillStyle='#c8c8c8';x.fillRect(0,0,128,128);x.fillStyle='#b0b0b0';x.fillRect(0,0,128,2);x.fillRect(0,0,2,128);
  const sh=x.createRadialGradient(70,72,30,70,72,46);sh.addColorStop(0,'rgba(0,0,0,.38)');sh.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=sh;x.beginPath();x.arc(70,72,46,0,7);x.fill();
  x.beginPath();x.arc(64,64,36,0,7);x.fillStyle='#d4d4d4';x.fill();const g=x.createRadialGradient(50,48,4,64,64,36);g.addColorStop(0,'#fff');g.addColorStop(.6,'#dcdcdc');g.addColorStop(1,'#a6a6a6');
  x.beginPath();x.arc(64,64,30,0,7);x.fillStyle=g;x.fill();x.lineWidth=3;x.strokeStyle='rgba(255,255,255,.65)';x.beginPath();x.arc(64,64,33,Math.PI*1.05,Math.PI*1.6);x.stroke();return glTex(c,true)})();
const inletTex=(()=>{const[c,x]=cnv(128,128);x.fillStyle='#c4c4c4';x.fillRect(0,0,128,128);x.fillStyle='#a8a8a8';x.fillRect(0,0,128,2);x.fillRect(0,0,2,128);
  const g=x.createRadialGradient(58,58,6,64,64,34);g.addColorStop(0,'#5a5a5a');g.addColorStop(.8,'#787878');g.addColorStop(1,'#999');x.beginPath();x.arc(64,64,32,0,7);x.fillStyle=g;x.fill();
  x.lineWidth=4;x.strokeStyle='#dcdcdc';x.beginPath();x.arc(64,64,33,0,Math.PI*.9);x.stroke();return glTex(c,true)})();

// Matériaux : texture, échelle (m par tuile), brillance, friction, vitesse, son
const MATS={
  plastique:{tex:MATTEX.plastique,scale:4,tint:1,studs:1,shin:45,snd:'plastic',fr:'Plastique (picots)'},
  lisse:{tex:MATTEX.plastique,scale:4,tint:1,shin:70,snd:'plastic',fr:'Plastique lisse'},
  bois:{tex:MATTEX.bois,scale:4,shin:22,snd:'wood',fr:'Bois'},
  brique:{tex:MATTEX.brique,scale:4,shin:8,snd:'stone',fr:'Brique'},
  pierre:{tex:MATTEX.pierre,scale:4,shin:10,snd:'stone',fr:'Pavés'},
  metal:{tex:MATTEX.metal,scale:3,shin:110,snd:'metal',fr:'Métal'},
  herbe:{tex:MATTEX.herbe,scale:6,shin:6,snd:'grass',fr:'Herbe'},
  sable:{tex:MATTEX.sable,scale:6,shin:6,snd:'sand',speed:.62,fr:'Sable (lent)'},
  glace:{tex:MATTEX.glace,scale:6,shin:180,snd:'ice',fric:.09,fr:'Glace (glisse)'},
  marbre:{tex:MATTEX.marbre,scale:6,shin:130,snd:'stone',fr:'Marbre'},
  beton:{tex:MATTEX.beton,scale:5,shin:10,snd:'stone',fr:'Béton'},
  neon:{neon:1,shin:30,snd:'plastic',fr:'Néon'},
  verre:{glass:1,shin:200,snd:'glass',fr:'Verre'},
  neige:{tex:MATTEX.neige,scale:6,shin:30,snd:'snow',speed:.85,fr:'Neige'},
  carrelage:{tex:MATTEX.carrelage,scale:4,shin:140,snd:'stone',fr:'Carrelage'},
  tissu:{tex:MATTEX.tissu,scale:2,tint:1,shin:3,snd:'fabric',fr:'Tissu'},
  ardoise:{tex:MATTEX.ardoise,scale:5,shin:40,snd:'stone',fr:'Ardoise'},
  rouille:{tex:MATTEX.rouille,scale:4,shin:25,snd:'metal',fr:'Métal rouillé'},
  granit:{tex:MATTEX.granit,scale:5,shin:90,snd:'stone',fr:'Granit'},
  lave:{snd:'stone',fr:'Lave'},trampoline:{snd:'plastic',fr:'Trampoline'},tapis:{snd:'metal',fr:'Tapis roulant'}
};

/* ---------- textures des personnages ---------- */
function atlas(draw){const[c,x]=cnv(384,256);for(let fi=0;fi<6;fi++){const col=fi%3,row=fi/3|0;x.save();x.translate(col*128,256-(row+1)*128);x.beginPath();x.rect(0,0,128,128);x.clip();draw(x,fi);x.restore()}return c}
function fill(x,col,k=.07){x.fillStyle=col;x.fillRect(0,0,128,128);const g=x.createLinearGradient(0,0,0,128);g.addColorStop(0,`rgba(255,255,255,${k})`);g.addColorStop(1,`rgba(0,0,0,${k})`);x.fillStyle=g;x.fillRect(0,0,128,128)}
function dark(hex,k){const c=hexRGB(hex).map(v=>Math.round(v*255*k));return`rgb(${c})`}
function signTex(text){const[c,x]=cnv(512,170);const g=x.createLinearGradient(0,0,0,170);g.addColorStop(0,'#fffaf0');g.addColorStop(1,'#efe4cc');x.fillStyle=g;x.fillRect(0,0,512,170);
  x.strokeStyle='#6d4a2a';x.lineWidth=14;x.strokeRect(7,7,498,156);x.fillStyle='#2b2118';x.textAlign='center';x.textBaseline='middle';const ls=text.split('\n');
  x.font=`800 ${ls.length>1?40:50}px system-ui,sans-serif`;ls.forEach((l,i)=>x.fillText(l,256,85+(i-(ls.length-1)/2)*48));return glTex(c)}

/* ============================== FORMES SUPPLÉMENTAIRES ============================== */
function gSphere(sl=24,st=16){const p=[],n=[],u=[],i=[];
  for(let y=0;y<=st;y++){const th=y/st*Math.PI;for(let x=0;x<=sl;x++){const ph=x/sl*2*Math.PI,nx=Math.sin(th)*Math.sin(ph),ny=Math.cos(th),nz=Math.sin(th)*Math.cos(ph);p.push(nx*.5,ny*.5,nz*.5);n.push(nx,ny,nz);u.push(x/sl,1-y/st)}}
  for(let y=0;y<st;y++)for(let x=0;x<sl;x++){const a=y*(sl+1)+x,b=a+sl+1;i.push(a,b,a+1,b,b+1,a+1)}return{pos:p,nrm:n,uv:u,idx:i}}
// cylindre : côté en UV [0..0.5], bouts en [0.5..1] (sert aux bûches)
function gCylUV(seg=28,rTop=.5,rBot=.5){const p=[],n=[],u=[],i=[];const sy=rBot-rTop;
  for(let k=0;k<=seg;k++){const a=k/seg*2*Math.PI,c=Math.cos(a),s=Math.sin(a),nn=V.norm([s,sy,c]);p.push(s*rBot,-.5,c*rBot,s*rTop,.5,c*rTop);n.push(...nn,...nn);u.push(k/seg*.5,0,k/seg*.5,1)}
  for(let k=0;k<seg;k++){const a=k*2;i.push(a,a+2,a+1,a+2,a+3,a+1)}
  for(const[y,r,ny]of[[.5,rTop,1],[-.5,rBot,-1]]){if(r<=0)continue;const c0=p.length/3;p.push(0,y,0);n.push(0,ny,0);u.push(.75,.5);
    for(let k=0;k<=seg;k++){const a=k/seg*2*Math.PI;p.push(Math.sin(a)*r,y,Math.cos(a)*r);n.push(0,ny,0);u.push(.75+Math.sin(a)*.24,.5+Math.cos(a)*.48)}
    for(let k=0;k<seg;k++)ny>0?i.push(c0,c0+1+k,c0+2+k):i.push(c0,c0+2+k,c0+1+k)}return{pos:p,nrm:n,uv:u,idx:i}}
function gTorus(R=.35,r=.15,M1=32,N1=14){const p=[],n=[],u=[],i=[];
  for(let a=0;a<=M1;a++){const t=a/M1*2*Math.PI,ct=Math.cos(t),st=Math.sin(t);for(let b=0;b<=N1;b++){const v=b/N1*2*Math.PI,nx=Math.cos(v)*ct,ny=Math.sin(v),nz=Math.cos(v)*st;p.push(ct*R+r*nx,r*ny,st*R+r*nz);n.push(nx,ny,nz);u.push(a/M1,b/N1)}}
  for(let a=0;a<M1;a++)for(let b=0;b<N1;b++){const x=a*(N1+1)+b,y=x+N1+1;i.push(x,y,x+1,x+1,y,y+1)}return{pos:p,nrm:n,uv:u,idx:i}}
// tête façon Roblox : cylindre aux bords très arrondis, UV cylindriques (le visage est à u = 0.5, face +Z)
function gHead(R=.34,Hh=.62,rr=.15,seg=40){const prof=[];const h=Hh/2;
  prof.push([0,-h,0,-1]);for(let k=0;k<=8;k++){const a=-Math.PI/2+k/8*Math.PI/2;prof.push([R-rr+Math.cos(a)*rr,-h+rr+Math.sin(a)*rr,Math.cos(a),Math.sin(a)])}
  for(let k=0;k<=8;k++){const a=k/8*Math.PI/2;prof.push([R-rr+Math.cos(a)*rr,h-rr+Math.sin(a)*rr,Math.cos(a),Math.sin(a)])}prof.push([0,h,0,1]);
  const p=[],n=[],u=[],i=[],cols=prof.length;
  for(let s=0;s<=seg;s++){const uu=s/seg,a=(uu-.5)*2*Math.PI,sa=Math.sin(a),ca=Math.cos(a);
    for(const[r,y,nr,ny]of prof){p.push(sa*r,y,ca*r);n.push(...V.norm([sa*nr,ny,ca*nr]));u.push(uu,(y+h)/Hh)}}
  for(let s=0;s<seg;s++)for(let k=0;k<cols-1;k++){const a=s*cols+k,b=a+cols;i.push(a,b,a+1,a+1,b,b+1)}return{pos:p,nrm:n,uv:u,idx:i}}
// Nouveau corps (tête façon Roblox, corps affiné : torse évasé, membres plus fins et arrondis)
const MESH={
  head:upload(gHead()), torso:upload(gRBox(1,1,.52,.1,12,.84)), arm:upload(gRBox(.44,1,.46,.16,12)), leg:upload(gRBox(.46,1,.48,.13,12)),
  box:upload(gRBox(1,1,1,0,1)), cube:upload(gRBox(1,1,1,.12,3)), rbox:upload(gRBox(1,1,1,.18,6)), quad:upload(gQuad(3.6,1.2)), quad1:upload(gQuad(1,1)),
  sphere:upload(gSphere()), cyl:upload(gCylUV()), cone:upload(gCylUV(28,0,.5)), torus:upload(gTorus()), torusThin:upload(gTorus(.42,.06))};

/* ============================== TEXTURES SUPPLÉMENTAIRES ============================== */
const vorD=makeVor(9,41),vorE=makeVor(6,77),vorF=makeVor(4,91);
Object.assign(MATTEX,{
  terre:genTex((x,y)=>{const n=fbm(x,y),q=NZ[4](x,y),[d1,d2]=vorD(x,y);let c=mixc([92,64,40],[128,92,58],n);if(q>.8)c=scl(c,.7);if(d1<.02)c=mixc(c,[150,140,128],.6);return c}),
  gravier:genTex((x,y)=>{const[d1,d2,id]=vorD(x,y),e=d2-d1,n=fbm(x,y);if(e<.012)return[58,54,50];return scl(mixc([120,116,108],[176,168,156],id),(.8+.25*n)*(1-clamp(d1*3,0,.35)))}),
  foin:genTex((x,y)=>{const a=Math.sin((y*60+Math.sin(x*12)*1.5+NZ[3](x,y)*4)*Math.PI),b=Math.sin((y*23-x*3+NZ[2](x,y)*6)*Math.PI);let c=mixc([196,160,70],[232,204,112],a*.5+.5);c=scl(c,.85+.15*b*fbm(x,y));if(NZ[4](x,y)>.82)c=scl(c,.7);return c}),
  or:genTex((x,y)=>{const v=(NZ[4](x,y*.04)-.5)*.25+(fbm(x,y)-.5)*.2;return scl([236,184,64],1+v)}),
  cuivre:genTex((x,y)=>{const n=fbm(x,y),p=NZ[1](x+.3,y),q=NZ[4](x,y);let c=scl([196,112,70],.9+.2*n);c=mixc(c,[86,160,140],clamp((p-.55)*3,0,.85));if(q>.85)c=scl(c,1.15);return c}),
  mousse:genTex((x,y)=>{const[d1,d2,id]=vorA(x,y),e=d2-d1,n=fbm(x,y),m=NZ[1](x,y)*.6+NZ[3](x,y)*.4;let c=e<.022?[60,62,58]:scl(mixc([104,104,98],[150,148,140],id),.8+.3*n);
    if(m>.52)c=mixc(c,mixc([58,104,40],[96,150,56],NZ[4](x,y)),clamp((m-.52)*5,0,1));return c}),
  feuillage:genTex((x,y)=>{const[d1,d2,id]=vorE(x,y),n=fbm(x,y);let c=mixc([46,104,40],[96,164,62],id*.7+n*.3);c=scl(c,1-clamp(d1*2.4,0,.45));if(d2-d1<.015)c=scl(c,.55);return c}),
  basalte:genTex((x,y)=>{const[d1,d2,id]=vorF(x,y),e=d2-d1,n=fbm(x,y);if(e<.018)return mixc([30,26,26],[150,40,20],clamp(NZ[2](x,y)-.45,0,1)*1.5);return scl(mixc([52,50,54],[78,76,80],id),.85+.25*n)}),
  planches:genTex((x,y)=>{const cols=5,col=Math.floor(x*cols),cx=x*cols-col,rr=rh(col+3),g=Math.sin((x*cols*6+NZ[3](x,y)*2.5+rr*7)*Math.PI*2)*.5+.5;
    let c=scl(mixc([70,44,28],[104,68,42],rr),.82+.18*g*(.7+.3*fbm(x,y)));if(cx<.03||cx>.97)c=scl(c,.35);const jy=((y-rh(col+9))%1+1)%1;if(jy<.008)c=scl(c,.4);return c}),
  cristal:genTex((x,y)=>{const[d1,d2,id]=vorE(x,y),e=d2-d1;let c=mixc([120,70,220],[70,200,255],id);c=scl(c,.7+.6*(1-d1*3));if(e<.02)c=mixc(c,[255,255,255],.7);return c})
});
Object.assign(MATS,{
  terre:{tex:MATTEX.terre,scale:5,shin:4,snd:'sand',fr:'Terre'},
  gravier:{tex:MATTEX.gravier,scale:3,shin:6,snd:'gravel',fr:'Gravier'},
  foin:{tex:MATTEX.foin,scale:3,shin:6,snd:'grass',fr:'Foin'},
  or:{tex:MATTEX.or,scale:3,shin:160,snd:'metal',fr:'Or'},
  cuivre:{tex:MATTEX.cuivre,scale:4,shin:90,snd:'metal',fr:'Cuivre'},
  mousse:{tex:MATTEX.mousse,scale:4,shin:10,snd:'stone',fr:'Pierre moussue'},
  feuillage:{tex:MATTEX.feuillage,scale:3,shin:10,snd:'grass',fr:'Feuillage'},
  basalte:{tex:MATTEX.basalte,scale:4,shin:30,snd:'stone',fr:'Basalte'},
  planches:{tex:MATTEX.planches,scale:4,shin:25,snd:'wood',fr:'Planches foncées'},
  cristal:{tex:MATTEX.cristal,scale:3,shin:200,snd:'glass',fr:'Cristal',glow:.5},
  buche:{snd:'wood',fr:'Bûches'}
});
// texture de bûche : écorce à gauche, cernes à droite
const logTex=(()=>{const S=256,[c,x]=cnv(S*2,S),img=x.createImageData(S*2,S),d=img.data;
  for(let y=0;y<S;y++)for(let X=0;X<S*2;X++){let r;
    if(X<S){const u=X/S,v=y/S,ridge=Math.abs(Math.sin((u*14+NZ[2](u,v)*2.2)*Math.PI)),n=fbm(u,v);r=scl(mixc([62,40,24],[112,78,48],ridge*.7+n*.3),.8+.3*NZ[4](u,v*.2));if(ridge<.12)r=scl(r,.55)}
    else{const u=(X-S)/S*2-1,v=y/S*2-1,dd=Math.hypot(u,v)+NZ[2]((u+1)/2,(v+1)/2)*.06;if(dd>.92)r=[86,58,34];else if(dd>.84)r=[70,46,28];else{const ring=Math.sin(dd*70)*.5+.5;r=scl(mixc([196,150,96],[214,172,116],ring),.85+.15*fbm((u+1)/2,(v+1)/2));if(Math.sin(dd*70)>.92)r=scl(r,.78)}}
    const i=(y*S*2+X)*4;d[i]=r[0];d[i+1]=r[1];d[i+2]=r[2];d[i+3]=255}
  x.putImageData(img,0,0);return glTex(c,false)})();

/* ---------- panneaux (texte), y compris dynamiques ---------- */
function signCanvas(text,o={}){const W=o.w||512,Hh=o.h||170,[c,x]=cnv(W,Hh);const g=x.createLinearGradient(0,0,0,Hh);g.addColorStop(0,o.bg1||'#fffaf0');g.addColorStop(1,o.bg2||'#efe4cc');x.fillStyle=g;x.fillRect(0,0,W,Hh);
  x.strokeStyle=o.border||'#6d4a2a';x.lineWidth=14;x.strokeRect(7,7,W-14,Hh-14);x.fillStyle=o.ink||'#2b2118';x.textAlign='center';x.textBaseline='middle';const ls=String(text).split('\n');
  x.font=`800 ${o.size||(ls.length>1?40:50)}px system-ui,sans-serif`;ls.forEach((l,i)=>x.fillText(l,W/2,Hh/2+(i-(ls.length-1)/2)*(o.lh||48)));return c}
function signTexEx(text,o){return glTex(signCanvas(text,o))}
function updateTex(t,canvas){gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,canvas);gl.generateMipmap(gl.TEXTURE_2D)}
/* ============================== PARTICULES (VFX) ============================== */
const parts=[],debris=[],glows=[];let QC=null;
function emit(o,force){if(!force&&QC&&Math.random()>QC.parts)return;if(parts.length>1600)parts.shift();
  parts.push({vel:[0,0,0],life:1,size:.3,col:[1,1,1],alpha:1,add:0,shape:0,flat:0,grav:0,drag:0,...o,max:o.life||1,pos:[...o.pos]})}
const glow=(pos,col,size)=>glows.push({pos,col,size});
function dust(p,col,n,spd=1){for(let i=0;i<n;i++){const a=Math.random()*6.28;emit({pos:V.add(p,[rnd(-.3,.3),rnd(0,.2),rnd(-.3,.3)]),vel:[Math.cos(a)*spd*rnd(.5,1.5),rnd(.3,1.2)*spd,Math.sin(a)*spd*rnd(.5,1.5)],life:rnd(.5,.9),size:rnd(.2,.35),size1:rnd(.6,1.1),col,alpha:.5,drag:2.5,grav:-.4})}}
function ring(p,col,size,life,add=false){emit({pos:V.add(p,[0,.06,0]),life,size:.3,size1:size,col,alpha:add?1:.5,add:add?1:0,shape:1,flat:1},true)}
function sparks(p,col,n,spd=1){for(let i=0;i<n;i++){const a=Math.random()*6.28,u=rnd(2,6)*spd;emit({pos:[...p],vel:[Math.cos(a)*u,rnd(3,8)*spd,Math.sin(a)*u],life:rnd(.35,.8),size:rnd(.07,.15),size1:0,col,add:1,shape:2,grav:14})}}
function chips(p,col,n){for(let i=0;i<n;i++){if(QC&&Math.random()>QC.parts)continue;const a=Math.random()*6.28,u=rnd(1.5,4);debris.push({pos:V.add(p,[0,.1,0]),vel:[Math.cos(a)*u,rnd(3,6),Math.sin(a)*u],life:rnd(.6,1.1),color:col,size:rnd(.06,.13),rot:Math.random()*6})}}
function splash(p,k){for(let i=0;i<Math.round(18*k);i++){const a=Math.random()*6.28,u=rnd(1,3.5)*k;emit({pos:V.add(p,[rnd(-.4,.4),0,rnd(-.4,.4)]),vel:[Math.cos(a)*u,rnd(3,7)*k,Math.sin(a)*u],life:rnd(.5,.9),size:rnd(.12,.24),size1:.05,col:[.85,.95,1],alpha:.85,grav:18})}
  ring(p,[.9,.97,1],1.6*k,.7);ring(p,[.9,.97,1],2.6*k,1.1)}
function ambientVFX(dt,t){
  for(const p of blocks){
    if(p.kind==='lava'){const b=bnd(p);if(Math.random()<dt*p.size[0]*p.size[2]*.6)emit({pos:[rnd(b.mn[0],b.mx[0]),b.mx[1],rnd(b.mn[2],b.mx[2])],vel:[rnd(-.3,.3),rnd(1,2.5),rnd(-.3,.3)],life:rnd(1,2),size:rnd(.05,.12),size1:0,col:[5,1.4,.25],add:1,shape:2,drag:.3});
      if(Math.random()<dt*2)emit({pos:[rnd(b.mn[0],b.mx[0]),b.mx[1]+.1,rnd(b.mn[2],b.mx[2])],vel:[0,rnd(.4,.9),0],life:rnd(1.5,2.5),size:.3,size1:1.4,col:[.25,.2,.18],alpha:.25,drag:.4});
      glow(V.add(p.pos,[0,.4,0]),[1.6,.45,.08],Math.max(p.size[0],p.size[2])*.75)}
    if(p.mat==='neon'){const c=hexRGB(p.color);for(let k=-1;k<=1;k++)glow(V.add(p.pos,[0,k*1.3,0]),V.mul(c,.55),1.5);
      if(Math.random()<dt*.6)emit({pos:V.add(p.pos,[rnd(-.2,.2),rnd(-2,2),rnd(-.2,.2)]),vel:[rnd(-.3,.3),rnd(.2,.6),rnd(-.3,.3)],life:2,size:.06,size1:0,col:V.mul(c,3),add:1,shape:2})}
    if(p.kind==='bounce')glow(V.add(p.pos,[0,.4,0]),[.9,.2,.55],1.6+Math.sin(t*4)*.2)}
  // lucioles près du spawn
  if(WORLD.motes&&Math.random()<dt*3)emit({pos:[SPAWN.pos[0]+rnd(-10,10),rnd(.5,4),SPAWN.pos[2]+rnd(-10,10)],vel:[rnd(-.2,.2),rnd(.05,.3),rnd(-.2,.2)],life:rnd(3,5),size:.07,size1:.07,col:[1.6,1.5,.9],add:1,shape:2});
  // feuilles qui tombent des arbres
  for(const tr of trees)if(Math.random()<dt*.35)emit({pos:V.add(tr,[rnd(-1.4,1.4),-.7,rnd(-1.4,1.4)]),vel:[rnd(-.6,.6),-rnd(.4,.8),rnd(-.6,.6)],life:rnd(3,5),size:.09,size1:.07,col:pick([[.35,.6,.2],[.5,.7,.25],[.75,.65,.2]]),alpha:.95,shape:0,drag:.2,grav:.05});
  // ronds dans l'eau quand on marche dedans
  if(waters.length)for(const c of chars)if(c.inWater&&!c.dead&&!c.left){c.ripT=(c.ripT||0)-dt;if(c.ripT<0&&Math.hypot(c.vel[0],c.vel[2])>1){c.ripT=.28;ring([c.pos[0],waters[0].pos[1]+.43,c.pos[2]],[.85,.95,1],1.3,.9)}}
}
function updParticles(dt){for(let i=parts.length-1;i>=0;i--){const q=parts[i];q.life-=dt;if(q.life<=0){parts.splice(i,1);continue}
    q.vel[1]-=q.grav*dt;if(q.drag)q.vel=V.mul(q.vel,Math.max(0,1-q.drag*dt));q.pos=V.add(q.pos,V.mul(q.vel,dt));
    if(q.grav>.1&&q.pos[1]<.02&&!q.flat){q.pos[1]=.02;q.vel=[q.vel[0]*.5,-q.vel[1]*.25,q.vel[2]*.5]}}
  for(let i=debris.length-1;i>=0;i--){const q=debris[i];q.life-=dt;if(q.life<=0){debris.splice(i,1);continue}q.vel[1]-=22*dt;q.pos=V.add(q.pos,V.mul(q.vel,dt));q.rot+=dt*7;
    if(q.pos[1]<q.size/2){q.pos[1]=q.size/2;q.vel=[q.vel[0]*.6,-q.vel[1]*.35,q.vel[2]*.6]}}}
const pBuf=gl.createBuffer(),pVAO=gl.createVertexArray();
gl.bindVertexArray(pVAO);gl.bindBuffer(gl.ARRAY_BUFFER,pBuf);
[[0,3,0],[1,2,12],[2,4,20],[3,1,36]].forEach(([l,s,o])=>{gl.enableVertexAttribArray(l);gl.vertexAttribPointer(l,s,gl.FLOAT,false,40,o)});gl.bindVertexArray(null);
const pData=new Float32Array(2200*60);
function buildParticles(add,R,U){let n=0;const C=[[-1,-1],[1,-1],[1,1],[-1,-1],[1,1],[-1,1]];
  const put=(pos,s,col,a,shape,flat)=>{if(n>=2200*6-6)return;const ax=flat?[s,0,0]:V.mul(R,s),ay=flat?[0,0,s]:V.mul(U,s);
    for(const[u,v]of C){const o=n*10;pData[o]=pos[0]+ax[0]*u+ay[0]*v;pData[o+1]=pos[1]+ax[1]*u+ay[1]*v;pData[o+2]=pos[2]+ax[2]*u+ay[2]*v;
      pData[o+3]=u;pData[o+4]=v;pData[o+5]=col[0];pData[o+6]=col[1];pData[o+7]=col[2];pData[o+8]=a;pData[o+9]=shape;n++}};
  for(const q of parts){if(!!q.add!==add)continue;const k=1-q.life/q.max,s=lerp(q.size,q.size1??q.size,k),fade=Math.min(1,q.life/(q.max*.4))*Math.min(1,(q.max-q.life)/.06+.2);put(q.pos,s,q.col,q.alpha*fade,q.shape,q.flat)}
  if(add)for(const g of glows)put(g.pos,g.size,g.col,.5,0,0);
  return n}
/* ============================== SONS (synthèse) ============================== */
const AU={ctx:null,birdT:3};
function audioInit(){if(AU.ctx){if(AU.ctx.state==='suspended')AU.ctx.resume();return}
  try{const C=new(window.AudioContext||window.webkitAudioContext)();AU.ctx=C;
    const comp=C.createDynamicsCompressor();comp.threshold.value=-16;comp.ratio.value=4;comp.connect(C.destination);
    AU.master=C.createGain();AU.master.connect(comp);AU.sfx=C.createGain();AU.sfx.connect(AU.master);AU.amb=C.createGain();AU.amb.connect(AU.master);
    const len=C.sampleRate*1.8|0,ir=C.createBuffer(2,len,C.sampleRate);for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3.2)}
    AU.rev=C.createConvolver();AU.rev.buffer=ir;const rg=C.createGain();rg.gain.value=.32;AU.rev.connect(rg);rg.connect(AU.master);
    const nb=C.createBuffer(1,C.sampleRate*2,C.sampleRate),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=Math.random()*2-1;AU.noise=nb;
    const loop=(dest,type,f,q,g0)=>{const s=C.createBufferSource();s.buffer=nb;s.loop=true;s.playbackRate.value=rnd(.95,1.05);const fl=C.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=q;const g=C.createGain();g.gain.value=g0;s.connect(fl);fl.connect(g);g.connect(dest);s.start(0,Math.random());return{g,fl}};
    // vent (avec rafales)
    const w=loop(AU.amb,'lowpass',380,.7,.03);const lfo=C.createOscillator(),lg=C.createGain();lfo.frequency.value=.11;lg.gain.value=.022;lfo.connect(lg);lg.connect(w.g.gain);lfo.start();
    const lf2=C.createOscillator(),lg2=C.createGain();lf2.frequency.value=.07;lg2.gain.value=180;lf2.connect(lg2);lg2.connect(w.fl.frequency);lf2.start();
    AU.lava=loop(AU.amb,'highpass',2600,.7,0).g;
    AU.water=loop(AU.amb,'bandpass',420,.6,0);const wl=C.createOscillator(),wg=C.createGain();wl.frequency.value=.35;wg.gain.value=.5;wl.connect(wg);wg.connect(AU.water.fl.Q);wl.start();AU.water=AU.water.g;
    AU.fall=loop(AU.sfx,'bandpass',900,.5,0).g;
    // bourdonnement des néons
    const o=C.createOscillator();o.type='sawtooth';o.frequency.value=118;const of=C.createBiquadFilter();of.type='lowpass';of.frequency.value=420;AU.neon=C.createGain();AU.neon.gain.value=0;o.connect(of);of.connect(AU.neon);AU.neon.connect(AU.amb);o.start();
    applyVolume();
  }catch(e){AU.ctx=null}
  if(AU.ctx&&typeof Music!=='undefined'&&Music.want)setTimeout(()=>Music.play(Music.want),50)}
function applyVolume(){if(!AU.ctx)return;if(typeof Music!=='undefined')Music.vol();AU.master.gain.setTargetAtTime(SET.vol/100,AU.ctx.currentTime,.05);AU.amb.gain.setTargetAtTime(SET.amb/100,AU.ctx.currentTime,.05)}
function out(node,rev,bus){node.connect(bus||AU.sfx);if(rev){const g=AU.ctx.createGain();g.gain.value=rev;node.connect(g);g.connect(AU.rev)}}
function tone(type,f,dur,peak,{f2,a=.004,rev=.12,delay=0,vib,bus}={}){if(!AU.ctx||peak<=.0005)return;const C=AU.ctx,t=C.currentTime+delay,o=C.createOscillator(),g=C.createGain();o.type=type;
  o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
  if(vib){const l=C.createOscillator(),lg=C.createGain();l.frequency.value=vib[0];lg.gain.value=vib[1];l.connect(lg);lg.connect(o.frequency);l.start(t);l.stop(t+dur+.05)}
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+dur);o.connect(g);out(g,rev,bus);o.start(t);o.stop(t+a+dur+.05)}
function noise(dur,peak,{type='bandpass',f=1000,f2,q=1,a=.003,rev=.1,delay=0,bus}={}){if(!AU.ctx||peak<=.0005)return;const C=AU.ctx,t=C.currentTime+delay,s=C.createBufferSource(),fl=C.createBiquadFilter(),g=C.createGain();
  s.buffer=AU.noise;s.playbackRate.value=rnd(.9,1.1);fl.type=type;fl.frequency.setValueAtTime(f,t);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t+dur);fl.Q.value=q;
  g.gain.setValueAtTime(.0001,t);g.gain.linearRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(.0001,t+a+dur);s.connect(fl);fl.connect(g);out(g,rev,bus);s.start(t,Math.random()*1.5);s.stop(t+a+dur+.05)}
let stepAlt=1;
const SFX={
  step(m,v=1){stepAlt=-stepAlt;const r=rnd(.94,1.06)*(1+stepAlt*.04);v*=.9;
    if(m==='grass'){noise(.07,.07*v,{f:2300*r,q:.7});noise(.05,.04*v,{type:'lowpass',f:500})}
    else if(m==='wood'){tone('sine',190*r,.07,.12*v,{f2:120});noise(.04,.06*v,{f:950*r,q:2});tone('triangle',380*r,.03,.02*v)}
    else if(m==='stone'){noise(.035,.08*v,{type:'highpass',f:2600*r});tone('sine',120*r,.04,.07*v,{f2:80})}
    else if(m==='metal'){tone('triangle',880*r,.14,.035*v,{rev:.25});tone('sine',1390*r,.11,.025*v);noise(.03,.05*v,{f:3200,q:1.5})}
    else if(m==='gravel'){noise(.08,.08*v,{f:2000*r,q:.5,a:.01});noise(.05,.05*v,{type:'highpass',f:3500,delay:.03})}
    else if(m==='sand'){noise(.12,.07*v,{type:'lowpass',f:900*r,a:.02});noise(.06,.02*v,{type:'highpass',f:5000,delay:.02})}
    else if(m==='snow'){noise(.09,.08*v,{f:1700*r,q:.6,a:.015});noise(.05,.05*v,{f:900*r,q:1,delay:.04})}
    else if(m==='ice'){noise(.03,.05*v,{type:'highpass',f:4200});tone('sine',2400*r,.05,.02*v)}
    else if(m==='glass'){tone('sine',2900*r,.09,.035*v,{rev:.3});tone('sine',4300*r,.07,.02*v);noise(.02,.03*v,{type:'highpass',f:5000})}
    else if(m==='fabric'){noise(.08,.05*v,{type:'lowpass',f:650*r,a:.01})}
    else if(m==='water'){noise(.12,.08*v,{type:'lowpass',f:1600*r,f2:500,a:.01});tone('sine',rnd(500,900),.06,.02*v,{f2:rnd(1000,1400)})}
    else{noise(.04,.07*v,{f:1400*r,q:1.5});tone('sine',300*r,.03,.04*v)}},
  jump(v=1){noise(.18,.06*v,{f:500,f2:1800,q:.8,a:.01});tone('sine',260,.12,.05*v,{f2:470});noise(.06,.03*v,{type:'lowpass',f:700})},
  land(s,m,v=1){tone('sine',110,.2,.15*s*v,{f2:40});noise(.12,.11*s*v,{type:'lowpass',f:650});if(s>.6)noise(.2,.05*s*v,{type:'lowpass',f:300,rev:.3});this.step(m,v)},
  grab(){noise(.08,.05,{type:'highpass',f:1500,f2:4000,a:.01});tone('sine',220,.04,.04,{f2:160})},
  mantle(){noise(.25,.06,{f:450,f2:1200,q:.7,a:.03});tone('sine',180,.15,.05,{f2:120,delay:.3})},
  climb(kind){const r=rnd(.92,1.08);
    if(kind==='wood'){tone('sine',240*r,.09,.13,{f2:190});noise(.05,.09,{f:720*r,q:3});tone('triangle',480*r,.04,.03);noise(.03,.03,{type:'highpass',f:3000,delay:.05})}
    else if(kind==='metal'){tone('sine',520*r,.4,.05,{rev:.45});tone('sine',803*r,.3,.035,{rev:.45});tone('sine',1243*r,.22,.022,{rev:.45});noise(.03,.06,{f:2600,q:2})}
    else{noise(.12,.07,{f:1300*r,q:.8,a:.02});tone('sine',150*r,.05,.06,{f2:90});noise(.05,.03,{type:'highpass',f:4000,delay:.06})}},
  boing(v=1){tone('sine',170,.5,.15*v,{f2:560,vib:[16,30]});tone('triangle',85,.3,.06*v,{f2:200});noise(.1,.03*v,{type:'highpass',f:3000})},
  splash(v=1){noise(.35,.15*v,{type:'lowpass',f:2600,f2:500,a:.01,rev:.2});for(let i=0;i<6;i++)tone('sine',rnd(600,1300),.06,.03*v,{f2:rnd(1400,2200),delay:rnd(.05,.4)})},
  die(lava,v=1){noise(.4,.18*v,{type:'lowpass',f:3000,f2:200});tone('square',300,.4,.05*v,{f2:60});tone('sine',90,.3,.12*v,{f2:35});if(lava)noise(.9,.08*v,{type:'highpass',f:3200,a:.02,rev:.2})},
  respawn(){[523,659,784,1047,1319].forEach((f,i)=>tone('sine',f,.35,.045,{delay:i*.06,rev:.7}));noise(.6,.025,{type:'highpass',f:6000,f2:9000,rev:.6})},
  pop(v=1){tone('sine',650,.06,.06*v,{f2:1100});tone('sine',1400,.05,.02*v,{delay:.03})},
  click(){tone('sine',900,.03,.03);noise(.015,.02,{type:'highpass',f:5000})},
  menu(open){if(open){noise(.18,.05,{f:400,f2:2400,q:.8,a:.02});tone('sine',520,.12,.04,{f2:780,delay:.05})}else{noise(.15,.04,{f:2000,f2:400,q:.8});tone('sine',700,.1,.03,{f2:450})}},
  report(){[660,880,1100].forEach((f,i)=>tone('triangle',f,.18,.05,{delay:i*.09,rev:.3}))},
  chirp(v){const n=2+Math.floor(Math.random()*4),f0=rnd(2400,3600);for(let i=0;i<n;i++)tone('sine',f0*rnd(.95,1.05),.07,.035*v,{f2:f0*1.4,delay:i*rnd(.09,.14),rev:.4,bus:AU.amb})},
  whoosh(v){noise(.25,.06*v,{f:600,f2:2000,q:.6,a:.04})}
};
function ambientAudio(dt){if(!AU.ctx||!pl)return;const t=AU.ctx.currentTime,P=pl.pos;
  let dl=99,dn=99;for(const p of blocks){const d=V.len(V.sub(p.pos,P));if(p.kind==='lava')dl=Math.min(dl,d);if(p.mat==='neon')dn=Math.min(dn,d)}
  const dw=waters.length?V.len(V.sub(waters[0].pos,P)):99;
  AU.lava.gain.setTargetAtTime(.06*clamp(1-dl/12,0,1),t,.15);AU.neon.gain.setTargetAtTime(.012*clamp(1-dn/5,0,1),t,.15);
  AU.water.gain.setTargetAtTime(.05*clamp(1-dw/12,0,1),t,.2);
  AU.fall.gain.setTargetAtTime(pl.grounded||pl.climb?0:clamp((-pl.vel[1]-12)/40,0,.12),t,.08);
  AU.birdT-=dt;if(AU.birdT<0&&trees.length){AU.birdT=rnd(3,9);const tr=pick(trees),d=V.len(V.sub(tr,P));SFX.chirp(clamp(1-d/45,.15,1))}}
/* ---------- sons supplémentaires (jeux, interface) ---------- */
Object.assign(SFX,{
  swim(v=1){noise(.22,.07*v,{type:'bandpass',f:900,f2:2400,q:1.2,rev:.15});noise(.14,.04*v,{type:'lowpass',f:500,delay:.08})},
  dive(v=1){noise(.5,.16*v,{type:'lowpass',f:1400,f2:300,rev:.2});tone('sine',300,.3,.05*v,{f2:120})}});
Object.assign(SFX,{
  kaching(){tone('square',1318,.06,.035);tone('square',1760,.18,.035,{delay:.06});noise(.12,.04,{type:'highpass',f:6000,delay:.04,rev:.3});tone('sine',2637,.25,.02,{delay:.1,rev:.4})},
  buy(){[784,988,1175,1568].forEach((f,i)=>tone('triangle',f,.14,.05,{delay:i*.055,rev:.35}));noise(.3,.03,{type:'highpass',f:5000,f2:9000,delay:.15,rev:.5})},
  error(){tone('square',220,.12,.04);tone('square',180,.16,.04,{delay:.1})},
  coin(v=1){tone('square',988,.06,.03*v);tone('square',1319,.14,.03*v,{delay:.06})},
  sword(){noise(.16,.09,{f:900,f2:3400,q:1.2,a:.01});tone('sine',300,.08,.03,{f2:180})},
  hit(v=1){noise(.08,.14*v,{type:'lowpass',f:1800,f2:300});tone('square',140,.07,.06*v,{f2:70});noise(.03,.06*v,{type:'highpass',f:3000})},
  hurt(){tone('sawtooth',260,.18,.06,{f2:140});noise(.1,.08,{type:'lowpass',f:1200})},
  enemyDie(){noise(.3,.1,{type:'bandpass',f:1200,f2:200,q:.8});[660,520,390].forEach((f,i)=>tone('square',f,.08,.03,{delay:i*.06}))},
  slime(v=1){tone('sine',180,.12,.07*v,{f2:420,a:.01});noise(.06,.03*v,{type:'lowpass',f:700})},
  slam(){tone('sine',70,.5,.22,{f2:30});noise(.5,.18,{type:'lowpass',f:500,f2:120,rev:.4})},
  levelUp(){[523,659,784,1047,1319,1568].forEach((f,i)=>tone('triangle',f,.25,.05,{delay:i*.07,rev:.5}));noise(.8,.03,{type:'highpass',f:6000,rev:.6,delay:.2})},
  potion(){for(let i=0;i<4;i++)tone('sine',rnd(400,700),.07,.05,{f2:rnd(900,1300),delay:i*.08});tone('sine',880,.3,.03,{delay:.35,rev:.5})},
  quest(){[392,523,659,784].forEach((f,i)=>tone('triangle',f,.3,.05,{delay:i*.12,rev:.5}))},
  checkpoint(){[523,659,784].forEach((f,i)=>tone('triangle',f,.16,.06,{delay:i*.08,rev:.3}));noise(.3,.02,{type:'highpass',f:7000,rev:.4})},
  win(){[523,659,784,1047,784,1047,1319].forEach((f,i)=>tone('square',f,.18,.035,{delay:i*.11,rev:.4}));noise(1.2,.03,{type:'highpass',f:5000,rev:.6,delay:.4})},
  glass(){for(let i=0;i<7;i++)tone('sine',rnd(2400,5200),.12,.03,{delay:rnd(0,.15),rev:.4});noise(.25,.1,{type:'highpass',f:3500})},
  hover(){tone('sine',1200,.02,.012)},
  daily(){[659,784,988,1319].forEach((f,i)=>tone('sine',f,.3,.05,{delay:i*.09,rev:.6}))}
});
