import {Stars, useKeyboardControls} from "@react-three/drei";


import {Hero} from "../components/Hero";
import {Canvas, ThreeEvent, useFrame, useThree} from "@react-three/fiber";
import {Perf} from "r3f-perf";
import {useRef} from "react";
import {Vector2} from "three";

export function Board({gameState}){
    const speed = 0.1;

    const maxSize : Vector2 = new Vector2(2,1);
    let degree: number = 0;
    const heroPos = new Vector2(0,0);

    const [, get] = useKeyboardControls()
    const heroRef = useRef({
        position: {x:0,y:0,z:0},
        rotation: {x:0,y:0,z:0}
    });

    function calculateHeroHeading(calc:Vector2){

        const dx = heroPos.x - calc.x;
        const dy = heroPos.y - calc.y;
        if(dx <0) {
            degree = Math.atan((dy) / (dx));
        }else{
            degree = Math.PI + Math.atan((dy) / (dx));
        }
        heroRef.current.rotation.y = degree;

    }
    function calcHeroMove(){
        const { forward, backward, left, right } = get();
        heroPos.y  = heroPos.y  + (forward? speed : 0);
        heroPos.y  = heroPos.y  - (backward? speed : 0);
        heroPos.x  = heroPos.x  - (left? speed : 0);
        heroPos.x  = heroPos.x  + (right? speed : 0);

        heroRef.current.position.x = heroPos.x;
        heroRef.current.position.y = 0.5
        heroRef.current.position.z = -heroPos.y;


    }

    function BSetup(){
        const {camera} = useThree();
        camera.position.x = 0;
        camera.position.z =10;
        camera.position.y = 20;

        camera.lookAt(0,0,0);
        useFrame(() => {
            //console.log("tick");
            calcHeroMove();

        });

        return <></>
    }
    function planeToPosition(input: Vector2): Vector2 {
        return new Vector2((input.x - 0.5) * maxSize.x * 10, (input.y - 0.5) * maxSize.y * 10);
    }

    function handleAreaPressed(event:ThreeEvent<PointerEvent>){
        console.log('pressed', event);

    }
    function handleAreaMove(event:ThreeEvent<PointerEvent>){
        const calc = planeToPosition(event.uv!);
        calculateHeroHeading(calc);

    }

    // @ts-ignore
    return (
        <Canvas camera={{fov:45}}>
            <Perf />
                <BSetup />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            <ambientLight />
            {/*Plane*/}
            <mesh
                onPointerMove={(event)=> handleAreaMove(event)}
                onPointerDown = {(event)=> handleAreaPressed(event)}
                position-y={ 0 }
                rotation-x={ - Math.PI * 0.5 }
                scale={ 10 }>
                <planeGeometry args={[maxSize.x, maxSize.y]}/>
                <meshStandardMaterial color="brown" />
            </mesh>
            {/*Hero*/}
            <mesh  ref={heroRef} onClick={()=> gameState(1)} >
                <Hero />
            </mesh>
        </Canvas>
    )
}