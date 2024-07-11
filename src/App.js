import Square from './square/Square';
import './App.css';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Swal from 'sweetalert2'

const renderFrom = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];

function App() {

  const [gameState, setGameState] = useState(renderFrom); //to save current game state
  const [curPlayer, setCurPlayer] = useState('circle');  //to save if circle have chance or cross have
  const [finishedState, setFinishedState] = useState(false); //to check if game is over or not
  const [finishedArrayState, setFinishedArrayState] = useState([]); //finished state  to highlight the winning symbol
  const [playOnline, setPlayOnline] = useState(false); //as soon it get connect to server enter into gameplay
  const [socket, setSocket] = useState(null);  //to save socket of current player
  const [playerName, setPlayerName] = useState("");  //to save player name
  const [opponentName, setOpponentName] = useState(null); //to save opponent name
  const [playingAs, setPlayingAs] = useState(null);   //to save if client is playing as circle or cross

  //set a pop up to  take player name
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

  //as soon as we get connect req from server 
  socket?.on("connect", function () {
    setPlayOnline(true);
  });

  //got call from server to update the game state as opponent is moved
  socket?.on("playerMoveFromServer", (data) => {
    //  console.log(data);
    const id = data.state.id;

    setGameState((prevState) => {
      let newState = [...prevState];


      const rowIndex = Math.floor(id / 3);
      const colIndex = id % 3;

      newState[rowIndex][colIndex] = data.state.sign;

      // console.log(newState);

      return newState;
    });
    setCurPlayer(data.state.sign==="circle" ? "cross": "circle" );
  });


  //got call from server that opponent not found
  socket?.on("opponentNotFound", function () {
    setOpponentName(false);
  });

  //got call from server that opponent is found
  socket?.on("opponentFound", function (data) {
    setPlayingAs(data.playingAs);
    setOpponentName(data.opponentName);
  });

  //an on click event .It triggers as soon we press on play online button
  async function playOnlineClick() {
    //take username from pop up
    const result = await takePlayerName();
    //if not successfull 
    if (!result.isConfirmed) return;

    const username = result.value;
    setPlayerName(username);
    //after taking player name, sending connection request to the server
    const newsocket = io("http://localhost:4000", {
      autoConnect: true
    });

    //sending request to server to take username and initiate request to play

    newsocket?.emit("request_to_play", {
      playerName: username,
    });

    setSocket(newsocket);
  }


  //whole game logic to decide whether cross won, cicle won or it's a draw
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


  //this useEffect triggers when gameState updates
  useEffect(() => {
    const winner = checkWinner();
    if (winner) {
      setFinishedState(winner);
    }



  }, [gameState])


  //as soon user enter , show this
  if (!playOnline) {
    return (
      <div className="main-div">
        <button className="playOnline" onClick={playOnlineClick} >
          Play Online
        </button>
      </div>
    );
  }
  //as soon as user enter it's name, show this
  if (playOnline && !opponentName) {
    return (
      <div className='waiting'>
        <p>
          Waiting for opponent...
        </p>
      </div>
    )
  }

  //after finding opponent , enter into the gameplay
  return (
    <div className="main-div">
      <div className='move-detection'>
        <div className={`left ${curPlayer === playingAs ? `current-move-` + curPlayer : ``}`}>{playerName}</div>
        <div className={`right ${curPlayer !== playingAs ? `current-move-` + curPlayer : ``}`}>{opponentName}</div>
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
                  socket={socket}
                  gameState={gameState}
                  currentElement={e}
                  playingAs={playingAs}
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
          !finishedState && opponentName && <h3 className='winner'> You are playing against {opponentName}</h3>
        }

      </div>
    </div>
  );
}

export default App;
