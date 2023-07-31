import {Mesh, Vector2} from "three";

class Bullet {
    direction: Vector2 = new Vector2(0,0);
    sphereMesh : Mesh = new Mesh();
}


export default Bullet;