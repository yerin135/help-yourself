import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import './App.css';
import * as tf from '@tensorflow/tfjs';
import * as tmImage from '@teachablemachine/image';
import { model } from '@tensorflow/tfjs';
import { setSourceMapRange, setSyntheticTrailingComments } from 'typescript';
import { cursorTo } from 'readline';

const Box = styled.div`
  width: 100%;
  height: 100%;
  /* background-color: #f8f9fa; */
  display : flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
`;
const Container = styled.div`
  font-size: 1.2rem;
  /* background-color: #f8f9fa; */
`;

const Title = styled.div`
  align-items: center;
  text-align: center;
  font-family: 'Gravity Handwritten Regular';
  color: #b197fc;
  font-size: 8rem;
  margin-top: 2rem;
`;

const Webcam = styled.div`
  margin: 2rem;
`;

const Label = styled.div`
  color: #757474;
  text-align: center;
  font-size: 2rem;
  line-height: 2rem;
  font-weight: 500;
`;



function App() {
  const initialized = useRef(false);
  const [scores, setScores] = useState<{className: string, probability: number}[]>();

  const webcamContainerEl = useRef<HTMLDivElement>(null);
  const labelContainerEl = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const URL = "https://teachablemachine.withgoogle.com/models/ww_5-NIwB/";

    let model: tmImage.CustomMobileNet;
    let maxPredictions: number;
    let webcam: tmImage.Webcam;
    // let Item: number;
    let lastPredictedAt = new Date(0);
    let lastPrediction: string;

    async function init() {
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        
        model = await tmImage.load(modelURL, metadataURL);
        maxPredictions = model.getTotalClasses();

        const flip = true; 
        webcam = new tmImage.Webcam(400, 400, flip); 
        await webcam.setup(); 
        await webcam.play();
        window.requestAnimationFrame(loop);
        // window.requestAnimationFrame(loop2);

        webcamContainerEl.current?.appendChild(webcam.canvas);
        for (let i = 0; i < maxPredictions; i++) { 
          labelContainerEl.current?.appendChild(document.createElement("div"));
        }
    }

    async function loop() {
      webcam.update(); // update the webcam frame
      await predict();
      window.requestAnimationFrame(loop);
    }

    // async function loop2() {
    //   setTimeout(() => window.requestAnimationFrame(loop2), 3000);
    //   const prediction = await model.predict(webcam.canvas);
    //   console.log(prediction[0].probability);
    //   setScores(prediction);

    //   const  mmm=prediction?.reduce((prev, curr) => prev.probability >= curr.probability ? prev : curr);
    //   if (!mmm) return
    //   const synth = window.speechSynthesis;
    //   synth.speak(new SpeechSynthesisUtterance(mmm.className));
    // }
    
    async function predict() {
      const prediction = await model.predict(webcam.canvas);
      // console.log(prediction[0].probability);
      setScores(prediction);

      const  mmm=prediction?.reduce((prev, curr) => prev.probability >= curr.probability ? prev : curr);
      if (!mmm) return

      console.log(mmm, lastPrediction)

      if (lastPrediction === mmm.className && (new Date().getTime() - lastPredictedAt.getTime()) > 1000) {
        const synth = window.speechSynthesis;
        synth.speak(new SpeechSynthesisUtterance(mmm.className));
        lastPredictedAt = new Date(9999999999999)
      }

      if (lastPrediction !== mmm.className) {
        lastPrediction = mmm.className;
        lastPredictedAt = new Date();
      }
      

      // max(prediction.probability)
      // if(prediction[0].probability > 0.5 ){
      //   console.log('choco');
        
      // }
      // for (let i = 0; i < maxPredictions; i++) {
      //         prediction[i].className + ": " + prediction[i].probability.toFixed(2);
      //     labelContainerEl.current!.children[i].innerHTML = classPrediction;
      // }
  }
    
  init();
  // loop2();
  // loop();
  }, []);

const maxClass = scores?.reduce((prev, curr) => 
  prev.probability >= curr.probability ? prev : curr
)

  return (
    <Box>
      <header className="App-header">
        <Title>
          Help Yourself
        </Title>
        
        <Container>
          <Webcam>
            <div ref={webcamContainerEl}>
              
            </div>
          </Webcam>
          <Label>
          <div>
              {/* {scores?.map(({className, probability}) => ( */}
              <div>
                {/* <div>{className}</div>
                <div>{probability.toFixed(2)}</div> */}
                <div>{maxClass?.className}</div>
              </div>
            {/* )) */}
            {/* } */}
          </div>
          </Label>
        </Container>
      </header>
    </Box>
  );
}



export default App;
