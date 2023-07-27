import { useLoader } from '@react-three/fiber';
// @ts-ignore
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import gbUrl from './assets/gameboy1.fbx?url';
export function GameboyModel(){
    const fbx = useLoader(FBXLoader, gbUrl);

    return <>
        <primitive object={fbx} scale={0.005}/>
    </>
}