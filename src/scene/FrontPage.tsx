import {GameboyModel} from "../components/GameboyModel.tsx";
import {Canvas, useFrame, useThree} from "@react-three/fiber";
import {OrbitControls, Stars} from "@react-three/drei";
import {Perf} from "r3f-perf";
import {GameStateProps} from "../App.tsx";

export function FrontPage({gameState}:GameStateProps) {

    function startTheGame(){
        gameState(1);
    }
    function FPSetup(){
        const {camera} = useThree();
        useFrame(() => {
            console.log("tick");
        });
        console.log(camera);
        camera.position.z =2;
        return <></>
    }
    return (
        <>
            <Canvas>
            <OrbitControls />
                <Perf />
                <FPSetup />
            <Stars radius={50} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <ambientLight />
            <mesh onClick={()=> startTheGame()}>
                <GameboyModel  />
            </mesh>
            </Canvas>
        </>
    );
}