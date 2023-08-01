import {
    Center,
    Hud,
    OrthographicCamera,
    Stars,
    Text3D,
    Text,
    useKeyboardControls,
    useMatcapTexture
} from "@react-three/drei";

import {Hero} from "../components/Hero";
import {Canvas, ThreeEvent, useFrame, useThree} from "@react-three/fiber";
import {Perf} from "r3f-perf";
import {useRef} from "react";

import {Mesh, MeshBasicMaterial, Scene, SphereGeometry, Vector2} from "three";
import Bullet from '../components/Bullet.tsx';
import Monster, {MonsterModel, MonsterState} from "../components/Monster.tsx";
import {GameStateProps} from "../App.tsx";



enum BoardState  {
    playing,
    gamingOver,
    gameOver,
    back

}
export function Board({gameState}:GameStateProps){
    const maxScale = 10;
    const maxSize : Vector2 = new Vector2(2,1);
    const maxPadding = 0.5;

    let speed:number = 5;
    let bullets : Array<Bullet> = [];
    let bulletSpeed:number = 10;
    let defaultFireCoolDown:number = 20;

    let monsters: Array<Monster> = [];
    let spawnTimer = 0;
    let monsterSpeed = 3;

    let globalScene: Scene;
    let pressed: Boolean = false;

    let degree: number = 0;
    const heroPos = new Vector2(0,0);
    let fireCoolDown = 0;

    let heroHealth:number = 10;
    let score:number = 0;

    let boardState : BoardState = BoardState.playing;
    let defaultSpawnTimer = 100;

    const [, get] = useKeyboardControls()
    const heroRef = useRef<Mesh>(null!);
    const gameOverRef = useRef<Mesh>(null!);
    const scoreText = useRef<Text>(null!);
    const healthText = useRef<Text>(null!);

    function resetState(){
        speed = 5;
        bulletSpeed = 10;
        defaultFireCoolDown = 20;
        spawnTimer = 0;
        monsterSpeed = 3;
        heroHealth = 10;
        score = 0;
        defaultSpawnTimer = 100;
    }
    function planeToPosition(input: Vector2): Vector2 {
        return new Vector2(
            (input.x) * (maxSize.x+maxPadding) * maxScale,
            (input.y) * (maxSize.y+maxPadding) * maxScale
        );
    }
    function calculateHeroHeading(calc:Vector2){
        let posX = heroRef.current.position.x + ((maxSize.x+maxPadding) * maxScale/2);
        let posY = -(heroRef.current.position.z - ((maxSize.y+maxPadding) * maxScale/2));
        const dx = (calc.x - posX);
        const dy = (calc.y - posY);


        if(dx <0) {
            degree = Math.PI - Math.atan((dy) / (-dx));
        }else{
            degree = Math.atan((dy) / (dx));
        }
        heroRef.current.rotation.y = degree + (Math.PI/2);

    }
    function calcHeroMove(delta:number){
        const { forward, backward, left, right } = get();
        heroPos.y  = heroPos.y  - ((forward? speed : 0)*delta);
        heroPos.y  = heroPos.y  + ((backward? speed : 0)*delta);
        heroPos.x  = heroPos.x  - ((left? speed : 0)*delta);
        heroPos.x  = heroPos.x  + ((right? speed : 0)*delta);

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
        spawnTimer= defaultSpawnTimer;
        let monster = new Monster();

        monster.monster.position.x = heroRef.current.position.x + ((Math.random() * 0.5 + 0.5) * maxSize.x * maxScale) - (maxSize.x * maxScale/2);
        monster.monster.position.z = heroRef.current.position.y + ((Math.random() * 0.5 + 0.5) * maxSize.y * maxScale) - (maxSize.y * maxScale/2);
        monster.monster.position.y = 1;

        globalScene.add(monster.monster);

        monsters.push(monster);

    }

    function checkBullet(delta:number){
        for(let i=0;i<bullets.length;i++){
            bullets[i].sphereMesh.position.x  = bullets[i].sphereMesh.position.x + (bullets[i].direction.x*delta);
            bullets[i].sphereMesh.position.z  = bullets[i].sphereMesh.position.z + (bullets[i].direction.y*delta);

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
                globalScene.remove(monster.monster);
                score++
                if(score % 5 == 0) {
                    defaultSpawnTimer -=5;
                    monsterSpeed += 0.5
                }
                // @ts-ignore
                scoreText.current.text = "Score " + score.toString();

                return false;
            } return true;
        })
    }
    function cleanUpBullets(){
        bullets = bullets.filter(function (bullet:Bullet)  {
            if((Math.abs(bullet.sphereMesh.position.x) > (maxSize.x+maxPadding) * maxScale /2)||
                (Math.abs(bullet.sphereMesh.position.z) > (maxSize.y+maxPadding) * maxScale / 2)){

                globalScene.remove(bullet.sphereMesh);
                bullet.sphereMesh.geometry.dispose();
                return false;
            }
            return true;
        })
    }

    function moveMonster(delta:number){

        monsters.forEach((monster)=>
        {
        let dx = (monster.monster.position.x < heroPos.x ? monsterSpeed : - monsterSpeed) ;
        let dy = (monster.monster.position.z < heroPos.y ? monsterSpeed : - monsterSpeed) ;

        monster.monster.position.x = monster.monster.position.x + (dx*delta);
        monster.monster.position.z = monster.monster.position.z + (dy*delta);

        if((heroRef.current.position.x >= monster.monster.position.x-1)&&
            (heroRef.current.position.x <= monster.monster.position.x+1)&&
            (heroRef.current.position.z <= monster.monster.position.z+1)&&
            (heroRef.current.position.z >= monster.monster.position.z-1)) {

            monster.state = MonsterState.dying;
            heroHealth--;

            bulletSpeed += 0.1;
            speed += 1;
            defaultFireCoolDown -= 1;
            // @ts-ignore
            healthText.current.text = "Health : " + heroHealth;
            if (heroHealth <= 0) {

                boardState = BoardState.gamingOver;
                console.log('gaming over...');
            }
        }

    })


    }

    function BSetup(){
        const {camera, scene} = useThree();
        camera.position.x = 0;
        camera.position.z =10;
        camera.position.y = 20;

        camera.lookAt(0,0,0);

        globalScene = scene;


        useFrame((_state, delta) => {

            switch(boardState){
                case BoardState.playing:

                    heroRef.current.visible = true;
                    gameOverRef.current.visible = false;
                    spawnMonster();
                    camera.position.x = heroPos.x;
                    camera.position.z = heroPos.y +10;
                    camera.lookAt(heroPos.x,0,heroPos.y);
                    if(fireCoolDown >0) fireCoolDown --;
                    if(spawnTimer > 0 ) spawnTimer -= 1;

                    // spawnMonster();
                    if(pressed)
                        fireBullet();

                    calcHeroMove(delta);
                    moveMonster(delta);
                    checkBullet(delta);

                    cleanUpBullets();
                    cleanUpMonster();
                    break;
                case BoardState.gamingOver:
                    monsters.forEach((monster) => {
                        monster.state = MonsterState.dying;
                    });
                    bullets.forEach((bullet:Bullet)=> {
                        bullet.sphereMesh.position.x =  ((maxSize.x+maxPadding) * maxScale /2) +10;
                        bullet.sphereMesh.position.y =  ((maxSize.y+maxPadding) * maxScale /2) +10;
                    });
                    cleanUpMonster();
                    cleanUpBullets();
                    heroRef.current.visible = false;
                    gameOverRef.current.visible = true;
                    resetState();
                    boardState = BoardState.gameOver;
                    break;
                case BoardState.gameOver:
                    camera.position.x = 0;
                    camera.position.z =10;
                    camera.position.y = 20;

                    camera.lookAt(0,0,0);

                    break;
                case BoardState.back:
                    gameState(0);
            }

        });

        return <></>
    }


    function fireBullet(){
        if(fireCoolDown <= 0){
            fireCoolDown = defaultFireCoolDown;
            let bul = new Bullet();
            const geometry = new SphereGeometry( 0.1, 8, 8 );
            const material = new MeshBasicMaterial( { color: 0xffff00 } );
            const sphere = new Mesh( geometry, material );
            bul.sphereMesh = sphere;
            let x = (Math.cos(degree)) * bulletSpeed;
            let y = (Math.sin(-degree)) * bulletSpeed;
            bul.direction.x = x;
            bul.direction.y = y;

            bul.sphereMesh.position.x = heroPos.x ;
            bul.sphereMesh.position.y = 0.2;
            bul.sphereMesh.position.z = heroPos.y ;

            //const degree = heroRef.current.rotation.y



            globalScene.add( sphere );

            bullets.push(bul)
        }

    }


    function handleAreaPressed(){
        pressed = true;
        if(boardState == BoardState.gameOver){
            pressed = false;
            boardState = BoardState.back;
        }
    }

    function handleAreaRelease(){
        pressed = false;
    }

    function handleAreaMove(event:ThreeEvent<PointerEvent>){
        const calc = planeToPosition(event.uv!);
        calculateHeroHeading(calc);

    }


    function PlayMode(){
        return <>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            {/*-------Plane-------*/}
            <mesh
                onPointerMove={(event)=> handleAreaMove(event)}
                onPointerDown = {()=> handleAreaPressed()}
                onPointerUp = {()=> handleAreaRelease()}
                onPointerLeave={()=> handleAreaRelease()}
                position-y={ -1 }
                rotation-x={ - Math.PI * 0.5 }
                scale={ maxScale }
                receiveShadow={true}>
                <planeGeometry args={[maxSize.x+maxPadding, maxSize.y+maxPadding]}/>
                <meshStandardMaterial color="#D2691E" />
            </mesh>
            {/*----------Hero-----------*/}
            <mesh  ref={heroRef} onClick={()=> gameState(1)} >
                <Hero />
            </mesh>
            <mesh  position={[100,100,100]}>
                <MonsterModel />
            </mesh>
            <pointLight
            position={[0,10,10]}/>
            <Hud>
                <mesh
                    position-x={ ((maxSize.x-maxPadding) * maxScale *6/10) }
                    position-z = {-(maxSize.y * maxScale * 2/4)}
                    rotation-x = { - Math.PI * 0.5 }
                    castShadow={true}>
                    <Center>
                        <Text ref={scoreText}
                            font='./font/Roboto Black_Regular.json'
                            >
                            Score : 0
                        </Text>
                    </Center>
                </mesh>
                <mesh
                    position-x={ -((maxSize.x-maxPadding) * maxScale /2) }
                    position-z = {-(maxSize.y * maxScale /2)}
                    rotation-x = { - Math.PI * 0.5 }
                    castShadow={true}>
                    <Center>
                        <Text ref={healthText}
                              font='./font/Roboto Black_Regular.json'
                        >
                            Health : 10
                        </Text>
                    </Center>
                </mesh>
            </Hud>
        </>
    }

    function GameOverMode(){
        console.log('GameOver...')
        const [ matcapTexture ] = useMatcapTexture('7B5254_E9DCC7_B19986_C8AC91', 256)
        return <>
            <mesh ref = {gameOverRef}>
                <mesh  position-y={ 1 }
                    rotation-x = { - Math.PI * 0.5 }
                    castShadow={true}>
                    <Center>
                       <Text3D
                           font='./font/Roboto Black_Regular.json'
                           size = { 2 }>
                           Game Over
                       </Text3D>

                    </Center>
                    <meshMatcapMaterial matcap={ matcapTexture } />
                </mesh>
                <mesh
                    position-y={ 1 }
                    position-z = {3}
                    rotation-x = { - Math.PI * 0.5 }
                    castShadow={true}>
                    <Center>
                        <Text3D
                            font='./font/Roboto Black_Regular.json'
                            size = { 1 }>
                            Click the board to go back
                        </Text3D>
                    </Center>
                    <meshMatcapMaterial matcap={ matcapTexture } />
                </mesh>
            </mesh>
        </>
    }


    return (
        <Canvas camera={{fov:45}}>
            <OrthographicCamera />
            <Perf position="top-left"/>
            <BSetup />
            <PlayMode />
            <GameOverMode />
        </Canvas>
    )
}