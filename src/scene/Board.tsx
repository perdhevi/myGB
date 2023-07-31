import {Stars, useKeyboardControls} from "@react-three/drei";


import {Hero} from "../components/Hero";
import {Canvas, ThreeEvent, useFrame, useThree} from "@react-three/fiber";
import {Perf} from "r3f-perf";
import {useRef} from "react";
import {Mesh, MeshBasicMaterial, Scene, SphereGeometry, Vector2} from "three";
import Bullet from '../components/Bullet.tsx';
import Monster, {MonsterModel, MonsterState} from "../components/Monster.tsx";

export function Board({gameState}){
    const maxScale = 10;
    const maxSize : Vector2 = new Vector2(2,1);

    const speed = 0.1;
    let bullets : Array<Bullet> = [];

    let monsters: Array<Monster> = [];
    let spawnTimer = 0;
    let monsterSpeed = 0.01;

    let globalScene: Scene;
    let pressed: Boolean = false;

    let degree: number = 0;
    const heroPos = new Vector2(0,0);
    let fireCoolDown = 0;

    const [, get] = useKeyboardControls()
    const heroRef = useRef({
        position: {x:0,y:0,z:0},
        rotation: {x:0,y:0,z:0}
    });

    function calculateHeroHeading(calc:Vector2){

        const dx = heroRef.current.position.x - calc.x;
        const dy = heroRef.current.position.z - calc.y;
        if(dx <0) {
            degree = Math.atan((dy) / (dx));
        }else{
            degree = Math.PI + Math.atan((dy) / (dx));
        }
        heroRef.current.rotation.y = degree;

    }
    function calcHeroMove(){
        const { forward, backward, left, right } = get();
        heroPos.y  = heroPos.y  - (forward? speed : 0);
        heroPos.y  = heroPos.y  + (backward? speed : 0);
        heroPos.x  = heroPos.x  - (left? speed : 0);
        heroPos.x  = heroPos.x  + (right? speed : 0);

        if(heroPos.x >= maxSize.x * maxScale / 2) heroPos.x = maxSize.x * maxScale / 2;
        if(heroPos.x <= -(maxSize.x * maxScale / 2)) heroPos.x = -(maxSize.x * maxScale / 2);
        if(heroPos.y >= maxSize.y * maxScale / 2) heroPos.y = maxSize.y * maxScale / 2;
        if(heroPos.y <= -(maxSize.y * maxScale / 2)) heroPos.y = -(maxSize.y * maxScale / 2);

        heroRef.current.position.x = heroPos.x;
        heroRef.current.position.y = 0.5
        heroRef.current.position.z = heroPos.y;

    }

    function spawnMonster(){
        if(spawnTimer !==0 ) return
        console.log('spawning monster');
        spawnTimer= 100;
        let monster = new Monster();

        monster.Monster();

        console.log(monster);

        monster.monster.position.x = (Math.random() * maxSize.x * maxScale) - (maxSize.x * maxScale/2);
        monster.monster.position.z = (Math.random() * maxSize.y * maxScale) - (maxSize.y * maxScale/2);
        monster.monster.position.y = 1;
        // monster.monster.children[0].scale.setScalar(0.005);
        console.log(monster.monster.position);
        globalScene.add(monster.monster);

        monsters.push(monster);


    }

    function checkBullet(){
        for(let i=0;i<bullets.length;i++){
            bullets[i].sphereMesh.position.x  = bullets[i].sphereMesh.position.x + bullets[i].direction.x;
            bullets[i].sphereMesh.position.z  = bullets[i].sphereMesh.position.z + bullets[i].direction.y;

            monsters.forEach((monster)=> {
                if((bullets[i].sphereMesh.position.x >= monster.monster.position.x-0.5)&&
                    (bullets[i].sphereMesh.position.x <= monster.monster.position.x+0.5)&&
                    (bullets[i].sphereMesh.position.z <= monster.monster.position.z+0.5)&&
                    (bullets[i].sphereMesh.position.z >= monster.monster.position.z-0.5)){

                    monster.state = MonsterState.dying;
                    bullets[i].sphereMesh.position.x  =  maxSize.x * maxScale /2 + 10;
                }

            });
        }

    }

    function cleanUpMonster(){
        monsters = monsters.filter((monster) => {
            if(monster.state == MonsterState.dying) {
                globalScene.remove(monster.monster)
                return false;
            } return true;
        })
    }

    function cleanUpBullets(){
        bullets = bullets.filter(function (bullet:Bullet)  {
            if((Math.abs(bullet.sphereMesh.position.x) > maxSize.x * maxScale /2)||
                (Math.abs(bullet.sphereMesh.position.z) > maxSize.y * maxScale / 2)){

                globalScene.remove(bullet.sphereMesh);
                bullet.sphereMesh.geometry.dispose();
                return false;
            }
            return true;
        })
    }

    function BSetup(){
        const {camera, scene} = useThree();
        camera.position.x = 0;
        camera.position.z =10;
        camera.position.y = 20;

        camera.lookAt(0,0,0);

        globalScene = scene;

        useFrame((delta) => {
            //console.log("tick", delta);
            calcHeroMove();
            spawnMonster();
            camera.position.x = heroPos.x;
            camera.position.z = heroPos.y +10;
            camera.lookAt(heroPos.x,0,heroPos.y);

            if(fireCoolDown >0) fireCoolDown --;
            if(spawnTimer > 0 ) spawnTimer -= 1;

            // spawnMonster();
            if(pressed)
                fireBullet();


            monsters.forEach((monster)=>{
                let dx = (monster.monster.position.x < heroPos.x ? monsterSpeed : - monsterSpeed) ;
                let dy = (monster.monster.position.z < heroPos.y ? monsterSpeed : - monsterSpeed) ;
                console.log('dx,dy:', dx, dy);
                monster.monster.position.x =
                    monster.monster.position.x + dx;
                monster.monster.position.z =
                    monster.monster.position.z + dy;
                //monster.monster.rotation.y += delta;
            })

            checkBullet();
            cleanUpBullets();
            cleanUpMonster();

        });

        return <></>
    }


    function fireBullet(){
        if(fireCoolDown <= 0){
            fireCoolDown = 20;
            let bul = new Bullet();
            const geometry = new SphereGeometry( 0.1, 8, 8 );
            const material = new MeshBasicMaterial( { color: 0xffff00 } );
            const sphere = new Mesh( geometry, material );
            bul.sphereMesh = sphere;

            bul.sphereMesh.position.x = heroPos.x;
            bul.sphereMesh.position.y = 1
            bul.sphereMesh.position.z = heroPos.y;

            const degree = heroRef.current.rotation.y

            let x = (Math.cos(degree)) * 0.1;
            let y = (Math.sin(-degree)) * 0.1;
            bul.direction.x = x;
            bul.direction.y = y;

            globalScene.add( sphere );

            bullets.push(bul)
        }

    }
    function planeToPosition(input: Vector2): Vector2 {
        return new Vector2((input.x - 0.5) * maxSize.x * 10, (input.y - 0.5) * maxSize.y * 10);
    }

    function handleAreaPressed(event:ThreeEvent<PointerEvent>){
        pressed = true;
    }

    function handleAreaReleae(event:ThreeEvent<PointerEvent>){
        pressed = false;
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
            {/*/!*Plane*!/*/}
            <mesh
                onPointerMove={(event)=> handleAreaMove(event)}
                onPointerDown = {(event)=> handleAreaPressed(event)}
                onPointerUp = {(event)=> handleAreaReleae(event)}
                position-y={ -1 }
                rotation-x={ - Math.PI * 0.5 }
                scale={ maxScale }>
                <planeGeometry args={[maxSize.x, maxSize.y]}/>
                <meshStandardMaterial color="brown" />
            </mesh>
            {/*Hero*/}
            <mesh  ref={heroRef} onClick={()=> gameState(1)} >
                <Hero />
            </mesh>
            <mesh  position={[100,100,100]}>
                <MonsterModel />
            </mesh>
        </Canvas>
    )
}