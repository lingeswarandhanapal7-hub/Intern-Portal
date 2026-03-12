import React, { useState, Children, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import './Stepper.css';

export default function Stepper({
  children, initialStep=1, onStepChange=()=>{}, onFinalStepCompleted=()=>{},
  stepCircleContainerClassName='', contentClassName='', footerClassName='',
  backButtonText='Back', nextButtonText='Continue', disableStepIndicators=false, ...rest
}) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [direction, setDirection] = useState(0);
  const stepsArray = Children.toArray(children);
  const totalSteps = stepsArray.length;
  const isCompleted = currentStep > totalSteps;
  const isLastStep = currentStep === totalSteps;

  const updateStep = newStep => {
    setCurrentStep(newStep);
    if (newStep > totalSteps) onFinalStepCompleted();
    else onStepChange(newStep);
  };

  const handleBack = () => { if (currentStep>1) { setDirection(-1); updateStep(currentStep-1); } };
  const handleNext = () => { if (!isLastStep) { setDirection(1); updateStep(currentStep+1); } };
  const handleComplete = () => { setDirection(1); updateStep(totalSteps+1); };

  return (
    <div className="stepper-outer" {...rest}>
      <div className={`step-circle-container ${stepCircleContainerClassName}`}>
        <div className="step-indicator-row">
          {stepsArray.map((_, index) => {
            const n = index + 1, isNotLast = index < totalSteps - 1;
            return (
              <React.Fragment key={n}>
                <StepIndicator step={n} disableStepIndicators={disableStepIndicators} currentStep={currentStep}
                  onClickStep={clicked => { setDirection(clicked>currentStep?1:-1); updateStep(clicked); }} />
                {isNotLast && <StepConnector isComplete={currentStep > n} />}
              </React.Fragment>
            );
          })}
        </div>
        <StepContentWrapper isCompleted={isCompleted} currentStep={currentStep} direction={direction}
          className={`step-content-default ${contentClassName}`}>
          {stepsArray[currentStep - 1]}
        </StepContentWrapper>
        {!isCompleted && (
          <div className={`step-footer ${footerClassName}`}>
            <div className={`footer-nav ${currentStep!==1?'spread':'end'}`}>
              {currentStep!==1 && <button onClick={handleBack} className="step-back-btn">{backButtonText}</button>}
              <button onClick={isLastStep?handleComplete:handleNext} className="step-next-btn">
                {isLastStep?'Complete':nextButtonText}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StepContentWrapper({ isCompleted, currentStep, direction, children, className }) {
  const [parentHeight, setParentHeight] = useState(0);
  return (
    <motion.div className={className} style={{position:'relative',overflow:'hidden'}}
      animate={{height:isCompleted?0:parentHeight}} transition={{type:'spring',duration:0.4}}>
      <AnimatePresence initial={false} mode="sync" custom={direction}>
        {!isCompleted && (
          <SlideTransition key={currentStep} direction={direction} onHeightReady={h=>setParentHeight(h)}>
            {children}
          </SlideTransition>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SlideTransition({ children, direction, onHeightReady }) {
  const containerRef = useRef(null);
  useLayoutEffect(() => { if (containerRef.current) onHeightReady(containerRef.current.offsetHeight); }, [children,onHeightReady]);
  return (
    <motion.div ref={containerRef} custom={direction}
      variants={{ enter: d=>({x:d>=0?'-100%':'100%',opacity:0}), center:{x:'0%',opacity:1}, exit: d=>({x:d>=0?'50%':'-50%',opacity:0}) }}
      initial="enter" animate="center" exit="exit" transition={{duration:0.4}}
      style={{position:'absolute',left:0,right:0,top:0}}>
      {children}
    </motion.div>
  );
}

export function Step({ children }) { return <div className="step-body">{children}</div>; }

function StepIndicator({ step, currentStep, onClickStep, disableStepIndicators }) {
  const status = currentStep===step?'active':currentStep<step?'inactive':'complete';
  return (
    <motion.div onClick={()=>{ if(step!==currentStep&&!disableStepIndicators) onClickStep(step); }} className="step-ind" animate={status} initial={false}>
      <motion.div className="step-ind-inner"
        variants={{ inactive:{backgroundColor:'#1a0038',color:'#a3a3a3'}, active:{backgroundColor:'#5227FF',color:'#fff'}, complete:{backgroundColor:'#5227FF',color:'#fff'} }}
        transition={{duration:0.3}}>
        {status==='complete'?<CheckIcon className="check-icon"/>:status==='active'?<div className="active-dot"/>:<span className="step-num">{step}</span>}
      </motion.div>
    </motion.div>
  );
}

function StepConnector({ isComplete }) {
  return (
    <div className="step-conn">
      <motion.div className="step-conn-inner" variants={{incomplete:{width:0,backgroundColor:'transparent'},complete:{width:'100%',backgroundColor:'#5227FF'}}}
        initial={false} animate={isComplete?'complete':'incomplete'} transition={{duration:0.4}}/>
    </div>
  );
}

function CheckIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <motion.path initial={{pathLength:0}} animate={{pathLength:1}} transition={{delay:0.1,type:'tween',ease:'easeOut',duration:0.3}}
        strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
    </svg>
  );
}
