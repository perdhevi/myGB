import {useFBX} from '@react-three/drei';
import {Group} from "three";
import {FBXLoader} from "three/examples/jsm/loaders/FBXLoader";
import {useLoader} from "@react-three/fiber";

export enum MonsterState{
    chasing,
    dying,
    dead

}
let fbx:Group;

class Monster{
    monster:Group;
    state: MonsterState = MonsterState.chasing;

    Monster(){
        if(!fbx) useFBX( '/assets/alien1.fbx');
        this.monster = fbx.clone();
    }
}

export function MonsterModel(){

    fbx = useFBX( '/assets/alien1.fbx');

    return (<>
        <primitive object={fbx} scale={0.005} />
    </>);
}
export default Monster;

