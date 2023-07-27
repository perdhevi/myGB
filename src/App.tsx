
import './App.css'
import {Canvas} from '@react-three/fiber';
import {GameboyModel} from './GameboyModel';
import { Environment } from "@react-three/drei";

function App() {
    return (
    <>
        <Canvas>
            <Environment preset="sunset" background/>
            <ambientLight />
            <GameboyModel />
        </Canvas>

    </>
    )
}

export default App
