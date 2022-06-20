import React, { useEffect, useRef } from 'react';
import styled from '@emotion/styled';
import './App.css';
import * as tf from '@tensorflow/tfjs';
import * as tmImage from '@teachablemachine/image';

const Container = styled.div`
  font-size: 1.2rem;
`;

const Title = styled.div`
  align-items: center;
  font-family: 'Space Mono';
  font-size: 3rem;
  margin: 2rem;
`;

const Webcam = styled.div`
  margin: 2rem;
`;

const Label = styled.div`
  line-height: 2rem;
`;

function App() {
  const initialized = useRef(false);


  const webcamContainerEl = useRef<HTMLDivElement>(null);
  const labelContainerEl = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const URL = "https://teachablemachine.withgoogle.com/models/cVizOguBV/";

    let model: tmImage.CustomMobileNet;
    let maxPredictions: number;
    let webcam: tmImage.Webcam;

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

    async function predict() {
      const prediction = await model.predict(webcam.canvas);
      for (let i = 0; i < maxPredictions; i++) {
          const classPrediction =
              prediction[i].className + ": " + prediction[i].probability.toFixed(2);
          labelContainerEl.current!.children[i].innerHTML = classPrediction;
      }
  }
  init();
  }, []);

  return (
    <div className="App">
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
          <div ref={labelContainerEl}>

          </div>
          </Label>
        </Container>
      </header>
    </div>
  );
}



export default App;
