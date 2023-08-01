
import './App.css'
import {Board} from './scene/Board.tsx';
import {FrontPage} from './scene/FrontPage.tsx'
import {useState} from 'react';
import {KeyboardControls} from "@react-three/drei";

export type GameStateProps =  {
    gameState(n:number): void;
}
function App() {
    let [gameState, setGameState] = useState(0);
    function handleGameState(value:number) :void{
        setGameState(value)
    }


    return (
    <>
        <KeyboardControls map={[
            { name: "forward", keys: ["ArrowUp", "w", "W"] },
            { name: "backward", keys: ["ArrowDown", "s", "S"] },
            { name: "left", keys: ["ArrowLeft", "a", "A"] },
            { name: "right", keys: ["ArrowRight", "d", "D"] },
            { name: "jump", keys: ["Space"] },
        ]}>
        {gameState == 0 ?
            <FrontPage gameState={handleGameState}/> :
            <Board gameState={handleGameState}/>

        }
        </KeyboardControls>
    </>
    )
}

export default App
