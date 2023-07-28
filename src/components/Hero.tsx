import {useFBX} from '@react-three/drei';

export function Hero(){
    const fbx = useFBX( '/assets/gameboy1.fbx');

    return (
        <primitive object={fbx} rotation-y={Math.PI /2} scale={0.005}/>
        // <mesh>
        //     <RoundedBox />
        //     <meshStandardMaterial color="blue" />
        // </mesh>
    );

}