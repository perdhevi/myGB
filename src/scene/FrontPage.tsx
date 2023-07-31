
import {OrbitControls, Stars} from "@react-three/drei";
import {GameboyModel} from "../components/GameboyModel.tsx";
import {useFrame, useThree, Canvas} from "@react-three/fiber";
import {Perf} from "r3f-perf";
import {MonsterModel} from "../components/Monster.tsx";

export function FrontPage({gameState}) {

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
            <mesh onClick={()=> gameState(1)}>
                <GameboyModel  />
            </mesh>
            {/*<mesh>*/}
            {/*    <MonsterModel />*/}
            {/*</mesh>*/}
            </Canvas>
        </>
    );
}