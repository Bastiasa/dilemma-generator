import { useEffect, useRef, useState } from 'react';
import { motion } from "framer-motion";
import SplitText from './components/SplitText';

import './App.css';


type CurrentState = 'loading' | 'question' | 'percentage';
type Answers = Record<string, { yes: number; no: number; }>;

function App() {
  const [question, setQuestion] = useState('');
  const [currentMode, setCurrentMode] = useState<CurrentState>('loading');

  const percentageValuesRef = useRef<[number, number]>([NaN, NaN]);

  const loadingDilemmas = useRef<Promise<any>>(undefined);

  const answersRef = useRef<Answers>(JSON.parse(localStorage.getItem('answers') as string) ?? {});

  const dilemmasRef = useRef<string[]>([]);
  const questionIdRef = useRef(0);
  const questionCountRef = useRef(0);

  async function loadDilemmas() {
    const response = await fetch('/api/generate/');
    const generatedDilemmas = await response.json() as string[];
    dilemmasRef.current = [...dilemmasRef.current, ...generatedDilemmas];
  }

  function checkDilemmas() {
    if (dilemmasRef.current.length < 10) {
      loadingDilemmas.current = new Promise<void>(async (resolve) => {
        await loadDilemmas();
        await loadDilemmas();
        console.log("Dilemmas reloaded");
        
        resolve();
      });
    }
  }

  function showNextDilemma() {

    const dilemmas = dilemmasRef.current;

    checkDilemmas();

    if (dilemmas.length > 0) {
      questionIdRef.current++;
      questionCountRef.current++;
      setQuestion(dilemmas.shift() as string);
      return;
    }

    setCurrentMode('loading');

    loadingDilemmas.current?.then(() => {
      showNextDilemma();
    });
  }

  function optionClicked(option: 'yes' | 'no') {

    if (questionCountRef.current >= 2) {
      questionCountRef.current = 0;
      const answeredQuestions = Object.keys(answersRef.current);
      dilemmasRef.current.unshift(answeredQuestions[Math.floor(answeredQuestions.length - 1 * Math.random())]);
      
    }
    
    if (answersRef.current[question] == undefined) {
      answersRef.current[question] = {
        yes: 0,
        no: 0
      }
    } else {
      answersRef.current[question][option]++;
      const { yes, no } = answersRef.current[question];

      const total = yes + no;

      const yesPercentage = yes / total * 100;
      const noPercentage = no / total * 100;

      percentageValuesRef.current = [yesPercentage, noPercentage];
      setCurrentMode('percentage');
      setTimeout(() => {
        showNextDilemma();
        setCurrentMode('question');
      }, 3000);

      return;
    }


    answersRef.current[question][option]++;
    showNextDilemma();
    localStorage.setItem('answers', JSON.stringify(answersRef.current));
  }

  useEffect(() => {
    (async () => {

      showNextDilemma();
      await loadingDilemmas.current;
      setCurrentMode('question');


    })();
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
              key={`${index}#${questionIdRef.current}`}
              initial={{
                opacity: 0,
                height:0
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
