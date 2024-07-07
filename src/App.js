import Square from './square/Square';
import './App.css';
import { useState } from 'react';

const renderFrom=[[1,2,3],[4,5,6],[7,8,9]];

function App() {
  
  const [gameState,setGameState]=useState(renderFrom);
  const [curPlayer,setCurPlayer]=useState('circle');

  return (
    <div className="main-div">
    <div className='move-detection'>
          <div className='left'>You</div>
          <div className='right'>Opponent</div>
     </div>
     <div>
     
     <h1 className='water-background game-heading'>TIC TAC TOE</h1>
     <div className='square-wrapper'>
         {
           renderFrom.map( (arr) =>
             arr.map((e)=>{
              return <Square  setGameState={setGameState} id={e} key={e}  curPlayer={curPlayer} setCurPlayer={setCurPlayer}/>
               })
           )
         }
     </div>
     </div>
    </div>
  );
}

export default App;
