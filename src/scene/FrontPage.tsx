import {GameboyModel} from "../components/GameboyModel.tsx";
import {Canvas, ThreeEvent, useFrame, useThree} from "@react-three/fiber";
import {OrbitControls, Stars} from "@react-three/drei";
import {Perf} from "r3f-perf";
import {GameStateProps} from "../App.tsx";

export function FrontPage({gameState}:GameStateProps) {


    function FPSetup(){
        const {camera} = useThree();
        useFrame(() => {
            //console.log("tick");
        });
        console.log(camera);


        return <></>
    }

    function startTheGame(event:ThreeEvent<MouseEvent>){
        if(
            (event.uv!.x>=0.24)&&
            (event.uv!.x <= 0.78)&&
            (event.uv!.y >= 0.57)&&
            (event.uv!.y <= 0.86)
            )
            gameState(1);

    }
    return (
        <>
            <Canvas camera={{fov:45}}>
                <OrbitControls makeDefault/>
                <Perf />
                <FPSetup />
                <Stars radius={50} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <ambientLight />
                <mesh
                    onClick={(event)=> startTheGame(event)}
                >
                    <GameboyModel  />
                </mesh>
            </Canvas>
        </>
    );
}