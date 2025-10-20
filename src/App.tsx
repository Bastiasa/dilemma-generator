import { useEffect, useRef, useState } from 'react';
import './App.css';




function App() {
  const [text, setText] = useState('LOADING...');
  const dilemmasRef = useRef<string[]>([]);

  function onGenerateDilemmaClicked() {

    const dilemmas = dilemmasRef.current;

    if (dilemmas.length > 0) {
      setText(dilemmas.shift() as string);
      console.log(dilemmas);
      
      return;
    }

    setText('CARGANDO...');

    (async () => {

      const response = await fetch('/api/generate/');
      const generatedDilemmas = await response.json();


      console.log('Generated dilemmas: ', generatedDilemmas);
      


      dilemmasRef.current = generatedDilemmas;
      setText(dilemmasRef.current.shift() as string);
      console.log(dilemmas);
     })();
  }

  useEffect(() => onGenerateDilemmaClicked(), []);

  return (
    <>
      <p>{text}</p>
      <button onClick={onGenerateDilemmaClicked}>CREAR DILEMA</button>
    </>
  )
}

export default App
