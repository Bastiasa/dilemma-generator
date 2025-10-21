import { useEffect, useRef, useState } from 'react';
import { motion } from "framer-motion";
import SplitText from './components/SplitText';

import './App.css';

import QUESTIONS from './assets/questions.json';


type CurrentState = 'loading' | 'question' | 'percentage';
type Answers = Record<string, { yes: number; no: number; }>;

const getSavedAnswers = ():Answers | {} => {
  try {
    return JSON.parse(localStorage.getItem('answers') || '{}');
  } catch {
    return {};
  }
};

function App() {
  const [question, setQuestion] = useState('');
  const [currentMode, setCurrentMode] = useState<CurrentState>('loading');

  const percentageValuesRef = useRef<[number, number]>([NaN, NaN]);

  const answersRef = useRef<Answers>(getSavedAnswers());

  const questionIdRef = useRef(0);
  const questionCountRef = useRef(0);

  const alreadyShownDilemmasRef = useRef<string[]>([]);

  function getDilemma() {
    let dilemma = undefined;

    while (!dilemma || alreadyShownDilemmasRef.current.includes(dilemma)) {
      dilemma = QUESTIONS[Math.floor(QUESTIONS.length * Math.random())];
    }

    return dilemma;
  }

  function showNextDilemma() {

    const dilemma = getDilemma();


    questionIdRef.current++;
    questionCountRef.current++;

    setQuestion(dilemma);
    alreadyShownDilemmasRef.current.push(dilemma);
  }

  function optionClicked(option: 'yes' | 'no') {
    
    if (answersRef.current[question] == undefined) {
      answersRef.current[question] = {
        yes: 0,
        no: 0
      }
    }

    answersRef.current[question][option]++;
    const { yes, no } = answersRef.current[question];

    const total = yes + no;

    const yesPercentage = yes / total * 100;
    const noPercentage = no / total * 100;

    percentageValuesRef.current = [yesPercentage, noPercentage];

    localStorage.setItem('answers', JSON.stringify(answersRef.current));
    setCurrentMode('percentage');

    setTimeout(() => {
      showNextDilemma();
      setCurrentMode('question');
    }, 3000);

    if (alreadyShownDilemmasRef.current.length >= 20) {
      alreadyShownDilemmasRef.current.shift();
    }
  }

  useEffect(() => {
    showNextDilemma();
    setCurrentMode('question');
  }, []);

  return (
    <div
      className='relative w-dvw px-16 max-w-[800px] mx-auto h-dvh vbox gap-2 justify-center items-center'>
      <SplitText
        key={`question#${questionIdRef.current}`}
        duration={0.5}
        splitType='words'
        ease={'power3.out'}
        text={currentMode === 'question' ? question : 'Cargando'}
        textAlign='center'
        className='font-bold text-3xl! mb-10'/>

      {currentMode === 'question' && <>
      
      
        <span className='text-[20px]'>Seleccione una respuesta</span>
        <div className='text-[20px] hbox max-w-[512px] gap-4 w-full'>
          <button onClick={()=>optionClicked('yes')} className='grow'>Sí</button>
          <button onClick={()=>optionClicked('no')} className='grow'>No</button>
        </div>
      
      </>}


      <div
        className={`${currentMode == 'percentage' ? 'opvisible' : 'ophidden'} items-center hbox gap-8 fade-enable absolute inset-0 bg-primary`}>
        {percentageValuesRef.current.map((value, index) => {
          return <div
            className='text-center font-extrabold content-center relative grow h-full max-h-[500px]'
            key={index + questionIdRef.current}>
            
            <div className='text-white! relative z-50 mix-blend-difference text-[28px]'>
              {index == 0 ? 'SÍ' : 'NO'} <br/>
              {Math.floor(value)}%
            </div>

            <motion.div
              
              key={`bar-${index + questionIdRef.current}-${Math.random()}`}

              initial={{
                opacity: 0,
                height: 0
              }}

              animate={{
                opacity: 1,
                height: `${value}%`
              }}

              transition={{
                duration:1.5
              }}

              className='bg-black absolute bottom-0 left-0 w-full'>
              
              </motion.div>
          </div>
        })}
      </div>
    </div>
  )
}

export default App
