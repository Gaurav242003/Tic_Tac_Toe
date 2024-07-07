import Square from './square/Square';
import './App.css';
import { useEffect, useState } from 'react';

const renderFrom=[[1,2,3],[4,5,6],[7,8,9]];

function App() {
  
  const [gameState,setGameState]=useState(renderFrom);
  const [curPlayer,setCurPlayer]=useState('circle');
  const [finishedState,setFinishedState]=useState(false);

  const checkWinner=() => {
    const arr=gameState;
    let winner=null;
     // row wise
     let sum2=0,sum3=0;
    for(let i=0;i<3;i++){
      let sum=0,sum1=0;
      for(let j=0;j<3;j++){
        //row wise
         if(gameState[i][j]==='circle') sum=sum+1;
         else if(gameState[i][j]==='cross')sum=sum-1;
         //col wise
         if(gameState[j][i]==='circle') sum1=sum1+1;
         else if(gameState[j][i]==='cross')sum1=sum1-1;
      }

      //lower diagonal
      if(gameState[i][i]==='circle') sum2=sum2+1;
         else if(gameState[i][i]==='cross')sum2=sum2-1;

      //upper diagonal
      if(gameState[i][2-i]==='circle') sum3=sum3+1;
      else if(gameState[i][2-i]==='cross')sum3=sum3-1;

      if(sum===3 || sum1===3 || sum2===3 || sum3===3) winner='circle';
      if(sum===-3 || sum1===-3 || sum2===-3 || sum3===-3) winner='cross';
    }
   
    console.log(winner);
    return winner;
  
  }

  useEffect(() =>{
    const winner= checkWinner();
    if(winner){
      setFinishedState(winner);
    }
  },[gameState])

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
           renderFrom.map( (arr,i) =>
             arr.map((e,j)=>{
              return <Square  setGameState={setGameState} id={i*3 + j} key={i*3 + j}  curPlayer={curPlayer} setCurPlayer={setCurPlayer}
                finishedState={finishedState}
               
              />
               })
           )
         }
     </div>
     </div>
    </div>
  );
}

export default App;
