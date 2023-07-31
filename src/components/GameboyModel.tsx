import {useFBX} from '@react-three/drei';

export function GameboyModel(){
    const fbx = useFBX( '/assets/gameboy1.fbx');
    //const fbx = useFBX( '/assets/alien1.fbx');

    return (<>
        <primitive object={fbx} scale={0.005}/>
    </>);
}