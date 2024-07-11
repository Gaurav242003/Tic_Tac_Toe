import Square from './square/Square';
import './App.css';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Swal from 'sweetalert2'

const renderFrom = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];

function App() {

  const [gameState, setGameState] = useState(renderFrom);
  const [curPlayer, setCurPlayer] = useState('circle');
  const [finishedState, setFinishedState] = useState(false);
  const [finishedArrayState, setFinishedArrayState] = useState([]);
  const [playOnline, setPlayOnline] = useState(false);
  const [socket, setSocket] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [opponentName,setOpponentName]=useState(null);



  const takePlayerName = async () => {
    const result = await Swal.fire({
      title: "Enter your Name",
      input: "text",

      showCancelButton: true,
      inputValidator: (value) => {
        if (!value) {
          return "You need to write something!";
        }
      }
    });

    return result;
  }



  socket?.on("connect", function () {
    setPlayOnline(true);
  });

  socket?.on("opponentNotFound", function () {
    setOpponentName(false);
  });

  socket?.on("opponentFound", function (data) {
    
    setOpponentName(data.opponentName);
  });

  async function playOnlineClick() {
    const result = await takePlayerName();
   
    if (!result.isConfirmed) return;

    const username = result.value;
    setPlayerName(username);
    const newsocket = io("http://localhost:4000", {
      autoConnect: true
    });

    newsocket?.emit("request_to_play", {
      playerName: username,
    });

    setSocket(newsocket);
  }

  const checkWinner = () => {
    // row dynamic
    for (let row = 0; row < gameState.length; row++) {
      if (
        gameState[row][0] === gameState[row][1] &&
        gameState[row][1] === gameState[row][2]
      ) {
        setFinishedArrayState([row * 3 + 0, row * 3 + 1, row * 3 + 2]);
        return gameState[row][0];
      }
    }

    // column dynamic
    for (let col = 0; col < gameState.length; col++) {
      if (
        gameState[0][col] === gameState[1][col] &&
        gameState[1][col] === gameState[2][col]
      ) {
        setFinishedArrayState([0 * 3 + col, 1 * 3 + col, 2 * 3 + col]);
        return gameState[0][col];
      }
    }

    if (
      gameState[0][0] === gameState[1][1] &&
      gameState[1][1] === gameState[2][2]
    ) {
      return gameState[0][0];
    }

    if (
      gameState[0][2] === gameState[1][1] &&
      gameState[1][1] === gameState[2][0]
    ) {
      return gameState[0][2];
    }

    const isDrawMatch = gameState.flat().every((e) => {
      if (e === "circle" || e === "cross") return true;
    });

    if (isDrawMatch) return "Draw";

    return null;
  };

  useEffect(() => {
    const winner = checkWinner();
    if (winner) {
      setFinishedState(winner);
    }
  }, [gameState])

  if (!playOnline) {
    return (
      <div className="main-div">
        <button className="playOnline" onClick={playOnlineClick} >
          Play Online
        </button>
      </div>
    );
  }

  if(playOnline && !opponentName){
    return (
      <div className='waiting'>
        <p>
          Waiting for opponent...
        </p>
      </div>
    )
  }  

  return (
    <div className="main-div">
      <div className='move-detection'>
        <div className='left'>{playerName}</div>
        <div className='right'>{opponentName}</div>
      </div>
      <div>

        <h1 className='water-background game-heading'>TIC TAC TOE</h1>
        <div className='square-wrapper'>
          {
            renderFrom.map((arr, i) =>
              arr.map((e, j) => {
                return <Square setGameState={setGameState} id={i * 3 + j} key={i * 3 + j} curPlayer={curPlayer} setCurPlayer={setCurPlayer}
                  finishedState={finishedState}
                  finishedArrayState={finishedArrayState}
                />
              })
            )
          }
        </div>
        {
          finishedState ? <h1 className='winner'>
            {finishedState != "Draw" ? `${finishedState} won the game` : "DRAW"}
          </h1> : null
        }
        {
          !finishedState && opponentName && <h3  className='winner'> You are playing against {opponentName}</h3>
        }

      </div>
    </div>
  );
}

export default App;
