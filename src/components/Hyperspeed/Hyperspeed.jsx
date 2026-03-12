import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { BloomEffect, EffectComposer, EffectPass, RenderPass, SMAAEffect, SMAAPreset } from 'postprocessing';
import './Hyperspeed.css';

const DEFAULT_EFFECT_OPTIONS = {
  onSpeedUp: () => {}, onSlowDown: () => {},
  distortion: 'turbulentDistortion', length: 400, roadWidth: 10, islandWidth: 2,
  lanesPerRoad: 4, fov: 90, fovSpeedUp: 150, speedUp: 2, carLightsFade: 0.4,
  totalSideLightSticks: 20, lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05, brokenLinesWidthPercentage: 0.1, brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5], lightStickHeight: [1.3, 1.7],
  movingAwaySpeed: [60, 80], movingCloserSpeed: [-120, -160],
  carLightsLength: [400 * 0.03, 400 * 0.2], carLightsRadius: [0.05, 0.14],
  carWidthPercentage: [0.3, 0.5], carShiftX: [-0.8, 0.8], carFloorSeparation: [0, 5],
  colors: {
    roadColor: 0x080808, islandColor: 0x0a0a0a, background: 0x000000,
    shoulderLines: 0xffffff, brokenLines: 0xffffff,
    leftCars: [0xd856bf, 0x6750a2, 0xc247ac],
    rightCars: [0x03b3c3, 0x0e5ea5, 0x324555],
    sticks: 0x03b3c3
  }
};

const random = base => Array.isArray(base) ? Math.random() * (base[1] - base[0]) + base[0] : Math.random() * base;
const pickRandom = arr => Array.isArray(arr) ? arr[Math.floor(Math.random() * arr.length)] : arr;
const lerp = (current, target, speed = 0.1, limit = 0.001) => {
  let change = (target - current) * speed;
  if (Math.abs(change) < limit) change = target - current;
  return change;
};
let nsin = val => Math.sin(val) * 0.5 + 0.5;

const mountainUniforms = { uFreq: { value: new THREE.Vector3(3,6,10) }, uAmp: { value: new THREE.Vector3(30,30,20) } };
const xyUniforms = { uFreq: { value: new THREE.Vector2(5,2) }, uAmp: { value: new THREE.Vector2(25,15) } };
const LongRaceUniforms = { uFreq: { value: new THREE.Vector2(2,3) }, uAmp: { value: new THREE.Vector2(35,10) } };
const turbulentUniforms = { uFreq: { value: new THREE.Vector4(4,8,8,1) }, uAmp: { value: new THREE.Vector4(25,5,10,10) } };
const deepUniforms = { uFreq: { value: new THREE.Vector2(4,8) }, uAmp: { value: new THREE.Vector2(10,20) }, uPowY: { value: new THREE.Vector2(20,2) } };

const distortions = {
  mountainDistortion: {
    uniforms: mountainUniforms,
    getDistortion: `uniform vec3 uAmp;uniform vec3 uFreq;#define PI 3.14159265358979\nfloat nsin(float val){return sin(val)*0.5+0.5;}\nvec3 getDistortion(float progress){float m=0.02;return vec3(cos(progress*PI*uFreq.x+uTime)*uAmp.x-cos(m*PI*uFreq.x+uTime)*uAmp.x,nsin(progress*PI*uFreq.y+uTime)*uAmp.y-nsin(m*PI*uFreq.y+uTime)*uAmp.y,nsin(progress*PI*uFreq.z+uTime)*uAmp.z-nsin(m*PI*uFreq.z+uTime)*uAmp.z);}`,
    getJS: (p, t) => { const m=0.02, f=mountainUniforms.uFreq.value, a=mountainUniforms.uAmp.value; return new THREE.Vector3(Math.cos(p*Math.PI*f.x+t)*a.x-Math.cos(m*Math.PI*f.x+t)*a.x,nsin(p*Math.PI*f.y+t)*a.y-nsin(m*Math.PI*f.y+t)*a.y,nsin(p*Math.PI*f.z+t)*a.z-nsin(m*Math.PI*f.z+t)*a.z).multiply(new THREE.Vector3(2,2,2)).add(new THREE.Vector3(0,0,-5)); }
  },
  xyDistortion: {
    uniforms: xyUniforms,
    getDistortion: `uniform vec2 uFreq;uniform vec2 uAmp;#define PI 3.14159265358979\nvec3 getDistortion(float progress){float m=0.02;return vec3(cos(progress*PI*uFreq.x+uTime)*uAmp.x-cos(m*PI*uFreq.x+uTime)*uAmp.x,sin(progress*PI*uFreq.y+PI/2.+uTime)*uAmp.y-sin(m*PI*uFreq.y+PI/2.+uTime)*uAmp.y,0.);}`,
    getJS: (p, t) => { const m=0.02, f=xyUniforms.uFreq.value, a=xyUniforms.uAmp.value; return new THREE.Vector3(Math.cos(p*Math.PI*f.x+t)*a.x-Math.cos(m*Math.PI*f.x+t)*a.x,Math.sin(p*Math.PI*f.y+t+Math.PI/2)*a.y-Math.sin(m*Math.PI*f.y+t+Math.PI/2)*a.y,0).multiply(new THREE.Vector3(2,0.4,1)).add(new THREE.Vector3(0,0,-3)); }
  },
  LongRaceDistortion: {
    uniforms: LongRaceUniforms,
    getDistortion: `uniform vec2 uFreq;uniform vec2 uAmp;#define PI 3.14159265358979\nvec3 getDistortion(float progress){float c=0.0125;return vec3(sin(progress*PI*uFreq.x+uTime)*uAmp.x-sin(c*PI*uFreq.x+uTime)*uAmp.x,sin(progress*PI*uFreq.y+uTime)*uAmp.y-sin(c*PI*uFreq.y+uTime)*uAmp.y,0.);}`,
    getJS: (p, t) => { const c=0.0125, f=LongRaceUniforms.uFreq.value, a=LongRaceUniforms.uAmp.value; return new THREE.Vector3(Math.sin(p*Math.PI*f.x+t)*a.x-Math.sin(c*Math.PI*f.x+t)*a.x,Math.sin(p*Math.PI*f.y+t)*a.y-Math.sin(c*Math.PI*f.y+t)*a.y,0).multiply(new THREE.Vector3(1,1,0)).add(new THREE.Vector3(0,0,-5)); }
  },
  turbulentDistortion: {
    uniforms: turbulentUniforms,
    getDistortion: `uniform vec4 uFreq;uniform vec4 uAmp;float nsin(float val){return sin(val)*0.5+0.5;}#define PI 3.14159265358979\nfloat getDistortionX(float p){return cos(PI*p*uFreq.r+uTime)*uAmp.r+pow(cos(PI*p*uFreq.g+uTime*(uFreq.g/uFreq.r)),2.)*uAmp.g;}float getDistortionY(float p){return -nsin(PI*p*uFreq.b+uTime)*uAmp.b-pow(nsin(PI*p*uFreq.a+uTime/(uFreq.b/uFreq.a)),5.)*uAmp.a;}vec3 getDistortion(float p){return vec3(getDistortionX(p)-getDistortionX(0.0125),getDistortionY(p)-getDistortionY(0.0125),0.);}`,
    getJS: (p, t) => { const f=turbulentUniforms.uFreq.value, a=turbulentUniforms.uAmp.value; const gX=q=>Math.cos(Math.PI*q*f.x+t)*a.x+Math.pow(Math.cos(Math.PI*q*f.y+t*(f.y/f.x)),2)*a.y; const gY=q=>-nsin(Math.PI*q*f.z+t)*a.z-Math.pow(nsin(Math.PI*q*f.w+t/(f.z/f.w)),5)*a.w; return new THREE.Vector3(gX(p)-gX(p+0.007),gY(p)-gY(p+0.007),0).multiply(new THREE.Vector3(-2,-5,0)).add(new THREE.Vector3(0,0,-10)); }
  },
  deepDistortion: {
    uniforms: deepUniforms,
    getDistortion: `uniform vec2 uFreq;uniform vec2 uAmp;uniform vec2 uPowY;float nsin(float v){return sin(v)*0.5+0.5;}#define PI 3.14159265358979\nfloat gX(float p){return sin(p*PI*uFreq.x+uTime)*uAmp.x;}float gY(float p){return pow(abs(p*uPowY.x),uPowY.y)+sin(p*PI*uFreq.y+uTime)*uAmp.y;}vec3 getDistortion(float p){return vec3(gX(p)-gX(0.02),gY(p)-gY(0.02),0.);}`,
    getJS: (p, t) => { const f=deepUniforms.uFreq.value, a=deepUniforms.uAmp.value, py=deepUniforms.uPowY.value; const gX=q=>Math.sin(q*Math.PI*f.x+t)*a.x; const gY=q=>Math.pow(q*py.x,py.y)+Math.sin(q*Math.PI*f.y+t)*a.y; return new THREE.Vector3(gX(p)-gX(p+0.01),gY(p)-gY(p+0.01),0).multiply(new THREE.Vector3(-2,-4,0)).add(new THREE.Vector3(0,0,-10)); }
  }
};

const distortion_uniforms = { uDistortionX:{value:new THREE.Vector2(80,3)}, uDistortionY:{value:new THREE.Vector2(-40,2.5)} };
const distortion_vertex = `#define PI 3.14159265358979\nuniform vec2 uDistortionX;uniform vec2 uDistortionY;float nsin(float v){return sin(v)*0.5+0.5;}vec3 getDistortion(float p){p=clamp(p,0.,1.);return vec3(uDistortionX.r*nsin(p*PI*uDistortionX.g-PI/2.),uDistortionY.r*nsin(p*PI*uDistortionY.g-PI/2.),0.);}`;

const carLightsFragment = `#define USE_FOG;\n${THREE.ShaderChunk['fog_pars_fragment']}\nvarying vec3 vColor;varying vec2 vUv;uniform vec2 uFade;\nvoid main(){vec3 color=vec3(vColor);float alpha=smoothstep(uFade.x,uFade.y,vUv.x);gl_FragColor=vec4(color,alpha);if(gl_FragColor.a<0.0001)discard;\n${THREE.ShaderChunk['fog_fragment']}}`;
const carLightsVertex = `#define USE_FOG;\n${THREE.ShaderChunk['fog_pars_vertex']}\nattribute vec3 aOffset;attribute vec3 aMetrics;attribute vec3 aColor;uniform float uTravelLength;uniform float uTime;varying vec2 vUv;varying vec3 vColor;\n#include <getDistortion_vertex>\nvoid main(){vec3 t=position.xyz;float radius=aMetrics.r,myLen=aMetrics.g,speed=aMetrics.b;t.xy*=radius;t.z*=myLen;t.z+=myLen-mod(uTime*speed+aOffset.z,uTravelLength);t.xy+=aOffset.xy;float progress=abs(t.z/uTravelLength);t.xyz+=getDistortion(progress);vec4 mv=modelViewMatrix*vec4(t,1.);gl_Position=projectionMatrix*mv;vUv=uv;vColor=aColor;\n${THREE.ShaderChunk['fog_vertex']}}`;
const sideSticksVertex = `#define USE_FOG;\n${THREE.ShaderChunk['fog_pars_vertex']}\nattribute float aOffset;attribute vec3 aColor;attribute vec2 aMetrics;uniform float uTravelLength;uniform float uTime;varying vec3 vColor;mat4 rotY(in float a){return mat4(cos(a),0,sin(a),0,0,1,0,0,-sin(a),0,cos(a),0,0,0,0,1);}\n#include <getDistortion_vertex>\nvoid main(){vec3 t=position.xyz;float w=aMetrics.x,h=aMetrics.y;t.xy*=vec2(w,h);float time=mod(uTime*60.*2.+aOffset,uTravelLength);t=(rotY(3.14/2.)*vec4(t,1.)).xyz;t.z+=-uTravelLength+time;float progress=abs(t.z/uTravelLength);t.xyz+=getDistortion(progress);t.y+=h/2.;t.x+=-w/2.;vec4 mv=modelViewMatrix*vec4(t,1.);gl_Position=projectionMatrix*mv;vColor=aColor;\n${THREE.ShaderChunk['fog_vertex']}}`;
const sideSticksFragment = `#define USE_FOG;\n${THREE.ShaderChunk['fog_pars_fragment']}\nvarying vec3 vColor;void main(){gl_FragColor=vec4(vColor,1.);\n${THREE.ShaderChunk['fog_fragment']}}`;
const roadBaseFragment = `#define USE_FOG;\nvarying vec2 vUv;uniform vec3 uColor;uniform float uTime;\n#include <roadMarkings_vars>\n${THREE.ShaderChunk['fog_pars_fragment']}\nvoid main(){vec2 uv=vUv;vec3 color=vec3(uColor);\n#include <roadMarkings_fragment>\ngl_FragColor=vec4(color,1.);\n${THREE.ShaderChunk['fog_fragment']}}`;
const islandFragment = roadBaseFragment.replace('#include <roadMarkings_fragment>','').replace('#include <roadMarkings_vars>','');
const roadMarkings_vars = `uniform float uLanes;uniform vec3 uBrokenLinesColor;uniform vec3 uShoulderLinesColor;uniform float uShoulderLinesWidthPercentage;uniform float uBrokenLinesLengthPercentage;uniform float uBrokenLinesWidthPercentage;highp float random(vec2 co){highp float a=12.9898,b=78.233,c=43758.5453,dt=dot(co.xy,vec2(a,b)),sn=mod(dt,3.14);return fract(sin(sn)*c);}`;
const roadMarkings_fragment = `uv.y=mod(uv.y+uTime*0.05,1.);float lW=1./uLanes,brW=lW*uBrokenLinesWidthPercentage,lE=1.-uBrokenLinesLengthPercentage;float bl=step(1.-brW,fract(uv.x*2.))*step(lE,fract(uv.y*10.));float sl=step(1.-brW,fract((uv.x-lW*(uLanes-1.))*2.))+step(brW,uv.x);bl=mix(bl,sl,uv.x);`;
const roadFragment = roadBaseFragment.replace('#include <roadMarkings_fragment>',roadMarkings_fragment).replace('#include <roadMarkings_vars>',roadMarkings_vars);
const roadVertex = `#define USE_FOG;\nuniform float uTime;\n${THREE.ShaderChunk['fog_pars_vertex']}\nuniform float uTravelLength;varying vec2 vUv;\n#include <getDistortion_vertex>\nvoid main(){vec3 t=position.xyz;vec3 d=getDistortion((t.y+uTravelLength/2.)/uTravelLength);t.x+=d.x;t.z+=d.y;t.y+=-1.*d.z;vec4 mv=modelViewMatrix*vec4(t,1.);gl_Position=projectionMatrix*mv;vUv=uv;\n${THREE.ShaderChunk['fog_vertex']}}`;

function resizeRenderer(renderer, setSize) {
  const c=renderer.domElement, w=c.clientWidth, h=c.clientHeight;
  if (c.width!==w||c.height!==h) { setSize(w,h,false); return true; } return false;
}

class CarLights {
  constructor(webgl, options, colors, speed, fade) { Object.assign(this,{webgl,options,colors,speed,fade}); }
  init() {
    const o=this.options, curve=new THREE.LineCurve3(new THREE.Vector3(0,0,0),new THREE.Vector3(0,0,-1));
    const geo=new THREE.TubeGeometry(curve,40,1,8,false), inst=new THREE.InstancedBufferGeometry().copy(geo);
    inst.instanceCount=o.lightPairsPerRoadWay*2;
    const lW=o.roadWidth/o.lanesPerRoad, aOffset=[], aMetrics=[], aColor=[];
    let colors=this.colors;
    colors=Array.isArray(colors)?colors.map(c=>new THREE.Color(c)):new THREE.Color(colors);
    for (let i=0;i<o.lightPairsPerRoadWay;i++) {
      const radius=random(o.carLightsRadius),length=random(o.carLightsLength),speed=random(this.speed);
      const lane=i%o.lanesPerRoad, lX=lane*lW-o.roadWidth/2+lW/2+random(o.carShiftX)*lW;
      const oY=random(o.carFloorSeparation)+radius*1.3, oZ=-random(o.length), cW=random(o.carWidthPercentage)*lW;
      aOffset.push(lX-cW/2,oY,oZ,lX+cW/2,oY,oZ);
      aMetrics.push(radius,length,speed,radius,length,speed);
      const col=pickRandom(colors); aColor.push(col.r,col.g,col.b,col.r,col.g,col.b);
    }
    inst.setAttribute('aOffset',new THREE.InstancedBufferAttribute(new Float32Array(aOffset),3,false));
    inst.setAttribute('aMetrics',new THREE.InstancedBufferAttribute(new Float32Array(aMetrics),3,false));
    inst.setAttribute('aColor',new THREE.InstancedBufferAttribute(new Float32Array(aColor),3,false));
    const mat=new THREE.ShaderMaterial({fragmentShader:carLightsFragment,vertexShader:carLightsVertex,transparent:true,uniforms:Object.assign({uTime:{value:0},uTravelLength:{value:o.length},uFade:{value:this.fade}},this.webgl.fogUniforms,o.distortion.uniforms)});
    mat.onBeforeCompile=s=>{s.vertexShader=s.vertexShader.replace('#include <getDistortion_vertex>',o.distortion.getDistortion);};
    const mesh=new THREE.Mesh(inst,mat); mesh.frustumCulled=false; this.webgl.scene.add(mesh); this.mesh=mesh;
  }
  update(time){this.mesh.material.uniforms.uTime.value=time;}
}

class LightsSticks {
  constructor(webgl,options){this.webgl=webgl;this.options=options;}
  init() {
    const o=this.options, geo=new THREE.PlaneGeometry(1,1), inst=new THREE.InstancedBufferGeometry().copy(geo);
    inst.instanceCount=o.totalSideLightSticks;
    const sOff=o.length/(o.totalSideLightSticks-1), aOffset=[], aColor=[], aMetrics=[];
    let colors=o.colors.sticks;
    colors=Array.isArray(colors)?colors.map(c=>new THREE.Color(c)):new THREE.Color(colors);
    for (let i=0;i<o.totalSideLightSticks;i++) {
      aOffset.push((i-1)*sOff*2+sOff*Math.random());
      const col=pickRandom(colors); aColor.push(col.r,col.g,col.b);
      aMetrics.push(random(o.lightStickWidth),random(o.lightStickHeight));
    }
    inst.setAttribute('aOffset',new THREE.InstancedBufferAttribute(new Float32Array(aOffset),1,false));
    inst.setAttribute('aColor',new THREE.InstancedBufferAttribute(new Float32Array(aColor),3,false));
    inst.setAttribute('aMetrics',new THREE.InstancedBufferAttribute(new Float32Array(aMetrics),2,false));
    const mat=new THREE.ShaderMaterial({fragmentShader:sideSticksFragment,vertexShader:sideSticksVertex,side:THREE.DoubleSide,uniforms:Object.assign({uTravelLength:{value:o.length},uTime:{value:0}},this.webgl.fogUniforms,o.distortion.uniforms)});
    mat.onBeforeCompile=s=>{s.vertexShader=s.vertexShader.replace('#include <getDistortion_vertex>',o.distortion.getDistortion);};
    const mesh=new THREE.Mesh(inst,mat); mesh.frustumCulled=false; this.webgl.scene.add(mesh); this.mesh=mesh;
  }
  update(time){this.mesh.material.uniforms.uTime.value=time;}
}

class Road {
  constructor(webgl,options){this.webgl=webgl;this.options=options;this.uTime={value:0};}
  createPlane(side,width,isRoad) {
    const o=this.options, geo=new THREE.PlaneGeometry(isRoad?o.roadWidth:o.islandWidth,o.length,20,100);
    let unis={uTravelLength:{value:o.length},uColor:{value:new THREE.Color(isRoad?o.colors.roadColor:o.colors.islandColor)},uTime:this.uTime};
    if(isRoad) unis=Object.assign(unis,{uLanes:{value:o.lanesPerRoad},uBrokenLinesColor:{value:new THREE.Color(o.colors.brokenLines)},uShoulderLinesColor:{value:new THREE.Color(o.colors.shoulderLines)},uShoulderLinesWidthPercentage:{value:o.shoulderLinesWidthPercentage},uBrokenLinesLengthPercentage:{value:o.brokenLinesLengthPercentage},uBrokenLinesWidthPercentage:{value:o.brokenLinesWidthPercentage}});
    const mat=new THREE.ShaderMaterial({fragmentShader:isRoad?roadFragment:islandFragment,vertexShader:roadVertex,side:THREE.DoubleSide,uniforms:Object.assign(unis,this.webgl.fogUniforms,o.distortion.uniforms)});
    mat.onBeforeCompile=s=>{s.vertexShader=s.vertexShader.replace('#include <getDistortion_vertex>',o.distortion.getDistortion);};
    const mesh=new THREE.Mesh(geo,mat); mesh.rotation.x=-Math.PI/2; mesh.position.z=-o.length/2; mesh.position.x+=(o.islandWidth/2+o.roadWidth/2)*side; this.webgl.scene.add(mesh); return mesh;
  }
  init(){this.leftRoadWay=this.createPlane(-1,this.options.roadWidth,true);this.rightRoadWay=this.createPlane(1,this.options.roadWidth,true);this.island=this.createPlane(0,this.options.islandWidth,false);}
  update(time){this.uTime.value=time;}
}

class App {
  constructor(container,options={}) {
    this.options=options;
    if(!this.options.distortion) this.options.distortion={uniforms:distortion_uniforms,getDistortion:distortion_vertex};
    this.container=container;
    this.renderer=new THREE.WebGLRenderer({antialias:false,alpha:true});
    this.renderer.setSize(container.offsetWidth,container.offsetHeight,false);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.composer=new EffectComposer(this.renderer);
    container.append(this.renderer.domElement);
    this.camera=new THREE.PerspectiveCamera(options.fov,container.offsetWidth/container.offsetHeight,0.1,10000);
    this.camera.position.set(0,8,-5);
    this.scene=new THREE.Scene(); this.scene.background=null;
    const fog=new THREE.Fog(options.colors.background,options.length*0.2,options.length*500);
    this.scene.fog=fog;
    this.fogUniforms={fogColor:{value:fog.color},fogNear:{value:fog.near},fogFar:{value:fog.far}};
    this.clock=new THREE.Clock(); this.assets={}; this.disposed=false;
    this.road=new Road(this,options);
    this.leftCarLights=new CarLights(this,options,options.colors.leftCars,options.movingAwaySpeed,new THREE.Vector2(0,1-options.carLightsFade));
    this.rightCarLights=new CarLights(this,options,options.colors.rightCars,options.movingCloserSpeed,new THREE.Vector2(1,0+options.carLightsFade));
    this.leftSticks=new LightsSticks(this,options);
    this.fovTarget=options.fov; this.speedUpTarget=0; this.speedUp=0; this.timeOffset=0;
    this.tick=this.tick.bind(this); this.init=this.init.bind(this); this.setSize=this.setSize.bind(this);
    this.onMouseDown=this.onMouseDown.bind(this); this.onMouseUp=this.onMouseUp.bind(this);
    this.onTouchStart=this.onTouchStart.bind(this); this.onTouchEnd=this.onTouchEnd.bind(this);
    window.addEventListener('resize',this.onWindowResize.bind(this));
  }
  onWindowResize(){const w=this.container.offsetWidth,h=this.container.offsetHeight;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.composer.setSize(w,h);}
  initPasses(){
    this.renderPass=new RenderPass(this.scene,this.camera);
    this.bloomPass=new EffectPass(this.camera,new BloomEffect({luminanceThreshold:0.2,luminanceSmoothing:0,resolutionScale:1}));
    const smaa=new EffectPass(this.camera,new SMAAEffect({preset:SMAAPreset.MEDIUM,searchImage:SMAAEffect.searchImageDataURL,areaImage:SMAAEffect.areaImageDataURL}));
    this.renderPass.renderToScreen=false; this.bloomPass.renderToScreen=false; smaa.renderToScreen=true;
    this.composer.addPass(this.renderPass); this.composer.addPass(this.bloomPass); this.composer.addPass(smaa);
  }
  loadAssets(){return new Promise(resolve=>{const mgr=new THREE.LoadingManager(resolve),si=new Image(),ai=new Image();this.assets.smaa={};si.addEventListener('load',function(){this.assets&&(this.assets={});mgr.itemEnd('ss');}.bind(this));ai.addEventListener('load',function(){mgr.itemEnd('as');}.bind(this));mgr.itemStart('ss');mgr.itemStart('as');si.src=SMAAEffect.searchImageDataURL;ai.src=SMAAEffect.areaImageDataURL;setTimeout(resolve,500);});}
  init(){
    this.initPasses(); const o=this.options;
    this.road.init(); this.leftCarLights.init();
    this.leftCarLights.mesh.position.setX(-o.roadWidth/2-o.islandWidth/2);
    this.rightCarLights.init(); this.rightCarLights.mesh.position.setX(o.roadWidth/2+o.islandWidth/2);
    this.leftSticks.init(); this.leftSticks.mesh.position.setX(-(o.roadWidth+o.islandWidth/2));
    this.container.addEventListener('mousedown',this.onMouseDown); this.container.addEventListener('mouseup',this.onMouseUp); this.container.addEventListener('mouseout',this.onMouseUp);
    this.container.addEventListener('touchstart',this.onTouchStart,{passive:true}); this.container.addEventListener('touchend',this.onTouchEnd,{passive:true});
    this.tick();
  }
  onMouseDown(ev){if(this.options.onSpeedUp)this.options.onSpeedUp(ev);this.fovTarget=this.options.fovSpeedUp;this.speedUpTarget=this.options.speedUp;}
  onMouseUp(ev){if(this.options.onSlowDown)this.options.onSlowDown(ev);this.fovTarget=this.options.fov;this.speedUpTarget=0;}
  onTouchStart(ev){this.fovTarget=this.options.fovSpeedUp;this.speedUpTarget=this.options.speedUp;}
  onTouchEnd(ev){this.fovTarget=this.options.fov;this.speedUpTarget=0;}
  update(delta){
    const lp=Math.exp(-(-60*Math.log2(1-0.1))*delta);
    this.speedUp+=lerp(this.speedUp,this.speedUpTarget,lp,0.00001);
    this.timeOffset+=this.speedUp*delta;
    const time=this.clock.elapsedTime+this.timeOffset;
    this.rightCarLights.update(time); this.leftCarLights.update(time); this.leftSticks.update(time); this.road.update(time);
    let upCam=false; const fc=lerp(this.camera.fov,this.fovTarget,lp);
    if(fc!==0){this.camera.fov+=fc*delta*6;upCam=true;}
    if(this.options.distortion.getJS){const d=this.options.distortion.getJS(0.025,time);this.camera.lookAt(new THREE.Vector3(this.camera.position.x+d.x,this.camera.position.y+d.y,this.camera.position.z+d.z));upCam=true;}
    if(upCam)this.camera.updateProjectionMatrix();
  }
  render(delta){this.composer.render(delta);}
  dispose(){
    this.disposed=true;
    if(this.renderer)this.renderer.dispose();
    if(this.composer)this.composer.dispose();
    if(this.scene)this.scene.clear();
    window.removeEventListener('resize',this.onWindowResize.bind(this));
    if(this.container){this.container.removeEventListener('mousedown',this.onMouseDown);this.container.removeEventListener('mouseup',this.onMouseUp);this.container.removeEventListener('mouseout',this.onMouseUp);this.container.removeEventListener('touchstart',this.onTouchStart);this.container.removeEventListener('touchend',this.onTouchEnd);}
  }
  setSize(w,h,s){this.composer.setSize(w,h,s);}
  tick(){
    if(this.disposed||!this)return;
    if(resizeRenderer(this.renderer,this.setSize)){const c=this.renderer.domElement;this.camera.aspect=c.clientWidth/c.clientHeight;this.camera.updateProjectionMatrix();}
    const delta=this.clock.getDelta();
    this.render(delta);this.update(delta);
    requestAnimationFrame(this.tick);
  }
}

const Hyperspeed = ({ effectOptions = DEFAULT_EFFECT_OPTIONS }) => {
  const hyperspeed = useRef(null);
  const appRef = useRef(null);
  useEffect(() => {
    if(appRef.current){appRef.current.dispose();const c=document.getElementById('hyperspeed-lights');if(c)while(c.firstChild)c.removeChild(c.firstChild);}
    const container=document.getElementById('hyperspeed-lights');
    if(!container)return;
    const options={...DEFAULT_EFFECT_OPTIONS,...effectOptions,colors:{...DEFAULT_EFFECT_OPTIONS.colors,...effectOptions.colors}};
    options.distortion=distortions[options.distortion]||distortions.turbulentDistortion;
    const myApp=new App(container,options);
    appRef.current=myApp;
    myApp.loadAssets().then(myApp.init);
    return ()=>{if(appRef.current)appRef.current.dispose();};
  },[effectOptions]);
  return <div id="hyperspeed-lights" ref={hyperspeed}></div>;
};

export default Hyperspeed;
