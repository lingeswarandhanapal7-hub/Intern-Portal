import { useRef, useEffect, useCallback, useState } from 'react';
import { gsap } from 'gsap';
import './MagicBento.css';

const DEFAULT_PARTICLE_COUNT = 12;
const DEFAULT_SPOTLIGHT_RADIUS = 300;
const DEFAULT_GLOW_COLOR = '125, 249, 255';
const MOBILE_BREAKPOINT = 768;

const createParticle = (x, y, color) => {
  const el = document.createElement('div');
  el.className = 'mb-particle';
  el.style.cssText = `position:absolute;width:4px;height:4px;border-radius:50%;background:rgba(${color},1);box-shadow:0 0 6px rgba(${color},0.6);pointer-events:none;z-index:100;left:${x}px;top:${y}px;`;
  return el;
};

const ParticleCard = ({ children, className='', disableAnimations=false, style, particleCount=DEFAULT_PARTICLE_COUNT, glowColor=DEFAULT_GLOW_COLOR, enableTilt=true, clickEffect=false, enableMagnetism=false }) => {
  const cardRef = useRef(null);
  const particlesRef = useRef([]);
  const timeoutsRef = useRef([]);
  const isHoveredRef = useRef(false);
  const memoized = useRef([]);
  const initialized = useRef(false);
  const magnetRef = useRef(null);

  const initParticles = useCallback(() => {
    if (initialized.current || !cardRef.current) return;
    const { width, height } = cardRef.current.getBoundingClientRect();
    memoized.current = Array.from({ length: particleCount }, () => createParticle(Math.random()*width, Math.random()*height, glowColor));
    initialized.current = true;
  }, [particleCount, glowColor]);

  const clearParticles = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout); timeoutsRef.current = [];
    magnetRef.current?.kill();
    particlesRef.current.forEach(p => gsap.to(p, { scale:0, opacity:0, duration:0.3, ease:'back.in(1.7)', onComplete:()=>p.parentNode?.removeChild(p) }));
    particlesRef.current = [];
  }, []);

  const animateParticles = useCallback(() => {
    if (!cardRef.current || !isHoveredRef.current) return;
    if (!initialized.current) initParticles();
    memoized.current.forEach((particle, i) => {
      const tid = setTimeout(() => {
        if (!isHoveredRef.current || !cardRef.current) return;
        const clone = particle.cloneNode(true);
        cardRef.current.appendChild(clone);
        particlesRef.current.push(clone);
        gsap.fromTo(clone, { scale:0, opacity:0 }, { scale:1, opacity:1, duration:0.3, ease:'back.out(1.7)' });
        gsap.to(clone, { x:(Math.random()-0.5)*100, y:(Math.random()-0.5)*100, rotation:Math.random()*360, duration:2+Math.random()*2, ease:'none', repeat:-1, yoyo:true });
        gsap.to(clone, { opacity:0.3, duration:1.5, ease:'power2.inOut', repeat:-1, yoyo:true });
      }, i * 100);
      timeoutsRef.current.push(tid);
    });
  }, [initParticles]);

  useEffect(() => {
    if (disableAnimations || !cardRef.current) return;
    const el = cardRef.current;
    const onEnter = () => { isHoveredRef.current=true; animateParticles(); if(enableTilt) gsap.to(el, { rotateX:5, rotateY:5, duration:0.3, ease:'power2.out', transformPerspective:1000 }); };
    const onLeave = () => {
      isHoveredRef.current=false; clearParticles();
      if(enableTilt) gsap.to(el, { rotateX:0, rotateY:0, duration:0.3, ease:'power2.out' });
      if(enableMagnetism) gsap.to(el, { x:0, y:0, duration:0.3, ease:'power2.out' });
    };
    const onMove = e => {
      if(!enableTilt&&!enableMagnetism) return;
      const rect=el.getBoundingClientRect(), x=e.clientX-rect.left, y=e.clientY-rect.top;
      const cx=rect.width/2, cy=rect.height/2;
      if(enableTilt) gsap.to(el, { rotateX:((y-cy)/cy)*-10, rotateY:((x-cx)/cx)*10, duration:0.1, ease:'power2.out', transformPerspective:1000 });
      if(enableMagnetism) { magnetRef.current=gsap.to(el, { x:(x-cx)*0.05, y:(y-cy)*0.05, duration:0.3, ease:'power2.out' }); }
    };
    const onClick = e => {
      if(!clickEffect) return;
      const rect=el.getBoundingClientRect(), x=e.clientX-rect.left, y=e.clientY-rect.top;
      const maxD=Math.max(Math.hypot(x,y),Math.hypot(x-rect.width,y),Math.hypot(x,y-rect.height),Math.hypot(x-rect.width,y-rect.height));
      const ripple=document.createElement('div');
      ripple.style.cssText=`position:absolute;width:${maxD*2}px;height:${maxD*2}px;border-radius:50%;background:radial-gradient(circle,rgba(${glowColor},0.4) 0%,rgba(${glowColor},0.2) 30%,transparent 70%);left:${x-maxD}px;top:${y-maxD}px;pointer-events:none;z-index:1000;`;
      el.appendChild(ripple);
      gsap.fromTo(ripple,{scale:0,opacity:1},{scale:1,opacity:0,duration:0.8,ease:'power2.out',onComplete:()=>ripple.remove()});
    };
    el.addEventListener('mouseenter',onEnter); el.addEventListener('mouseleave',onLeave);
    el.addEventListener('mousemove',onMove); el.addEventListener('click',onClick);
    return () => { isHoveredRef.current=false; el.removeEventListener('mouseenter',onEnter); el.removeEventListener('mouseleave',onLeave); el.removeEventListener('mousemove',onMove); el.removeEventListener('click',onClick); clearParticles(); };
  }, [animateParticles, clearParticles, disableAnimations, enableTilt, enableMagnetism, clickEffect, glowColor]);

  return <div ref={cardRef} className={`${className} mb-particle-container`} style={{...style,position:'relative',overflow:'hidden'}}>{children}</div>;
};

const GlobalSpotlight = ({ gridRef, disableAnimations=false, enabled=true, spotlightRadius=DEFAULT_SPOTLIGHT_RADIUS, glowColor=DEFAULT_GLOW_COLOR }) => {
  const spotRef = useRef(null);
  useEffect(() => {
    if (disableAnimations||!gridRef?.current||!enabled) return;
    const spot=document.createElement('div');
    spot.className='mb-global-spotlight';
    spot.style.cssText=`position:fixed;width:600px;height:600px;border-radius:50%;pointer-events:none;background:radial-gradient(circle,rgba(${glowColor},0.12) 0%,rgba(${glowColor},0.06) 20%,transparent 60%);z-index:200;opacity:0;transform:translate(-50%,-50%);mix-blend-mode:screen;`;
    document.body.appendChild(spot);
    spotRef.current=spot;
    const prox=spotlightRadius*0.5, fadeD=spotlightRadius*0.75;
    const onMove = e => {
      if(!spotRef.current||!gridRef.current) return;
      const section=gridRef.current.closest('.mb-bento-section')||gridRef.current;
      const rect=section.getBoundingClientRect();
      const inside=e.clientX>=rect.left&&e.clientX<=rect.right&&e.clientY>=rect.top&&e.clientY<=rect.bottom;
      const cards=gridRef.current.querySelectorAll('.mb-card');
      if(!inside){gsap.to(spotRef.current,{opacity:0,duration:0.3,ease:'power2.out'});cards.forEach(c=>{c.style.setProperty('--glow-intensity','0');});return;}
      let minD=Infinity;
      cards.forEach(card=>{
        const cr=card.getBoundingClientRect(),cx=cr.left+cr.width/2,cy=cr.top+cr.height/2;
        const effectiveD=Math.max(0,Math.hypot(e.clientX-cx,e.clientY-cy)-Math.max(cr.width,cr.height)/2);
        minD=Math.min(minD,effectiveD);
        const gi=effectiveD<=prox?1:effectiveD<=fadeD?(fadeD-effectiveD)/(fadeD-prox):0;
        const relX=((e.clientX-cr.left)/cr.width)*100, relY=((e.clientY-cr.top)/cr.height)*100;
        card.style.setProperty('--glow-x',`${relX}%`); card.style.setProperty('--glow-y',`${relY}%`);
        card.style.setProperty('--glow-intensity',gi.toString()); card.style.setProperty('--glow-radius',`${spotlightRadius}px`);
      });
      gsap.to(spotRef.current,{left:e.clientX,top:e.clientY,duration:0.1,ease:'power2.out'});
      const opacity=minD<=prox?0.6:minD<=fadeD?((fadeD-minD)/(fadeD-prox))*0.6:0;
      gsap.to(spotRef.current,{opacity,duration:opacity>0?0.2:0.5,ease:'power2.out'});
    };
    const onLeave=()=>{gridRef.current?.querySelectorAll('.mb-card').forEach(c=>{c.style.setProperty('--glow-intensity','0');});if(spotRef.current)gsap.to(spotRef.current,{opacity:0,duration:0.3});};
    document.addEventListener('mousemove',onMove); document.addEventListener('mouseleave',onLeave);
    return ()=>{document.removeEventListener('mousemove',onMove);document.removeEventListener('mouseleave',onLeave);spotRef.current?.parentNode?.removeChild(spotRef.current);};
  }, [gridRef, disableAnimations, enabled, spotlightRadius, glowColor]);
  return null;
};

const MagicBento = ({
  cards=[],
  textAutoHide=true, enableStars=true, enableSpotlight=true, enableBorderGlow=true,
  disableAnimations=false, spotlightRadius=DEFAULT_SPOTLIGHT_RADIUS,
  particleCount=DEFAULT_PARTICLE_COUNT, enableTilt=false, glowColor=DEFAULT_GLOW_COLOR,
  clickEffect=true, enableMagnetism=false
}) => {
  const gridRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check=()=>setIsMobile(window.innerWidth<=MOBILE_BREAKPOINT);
    check(); window.addEventListener('resize',check); return ()=>window.removeEventListener('resize',check);
  }, []);
  const shouldDisable = disableAnimations || isMobile;
  const baseClass = `mb-card ${textAutoHide?'mb-card--text-autohide':''} ${enableBorderGlow?'mb-card--border-glow':''}`;
  return (
    <>
      {enableSpotlight && <GlobalSpotlight gridRef={gridRef} disableAnimations={shouldDisable} enabled={enableSpotlight} spotlightRadius={spotlightRadius} glowColor={glowColor} />}
      <div className="mb-grid mb-bento-section" ref={gridRef}>
        {cards.map((card, i) => {
          const props = { className: baseClass, style: { backgroundColor: '#0d001f', '--glow-color': glowColor } };
          const content = (
            <>
              <div className="mb-card__header"><div className="mb-card__label">{card.label}</div>{card.icon&&<div className="mb-card__icon">{card.icon}</div>}</div>
              <div className="mb-card__body"><h3 className="mb-card__title">{card.title}</h3><p className="mb-card__desc">{card.description}</p></div>
            </>
          );
          return enableStars ? (
            <ParticleCard key={i} {...props} disableAnimations={shouldDisable} particleCount={particleCount} glowColor={glowColor} enableTilt={enableTilt} clickEffect={clickEffect} enableMagnetism={enableMagnetism}>{content}</ParticleCard>
          ) : <div key={i} {...props}>{content}</div>;
        })}
      </div>
    </>
  );
};

export default MagicBento;
