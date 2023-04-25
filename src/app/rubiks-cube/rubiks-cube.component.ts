import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

@Component({
  selector: 'app-rubiks-cube',
  templateUrl: './rubiks-cube.component.html',
  styleUrls: ['./rubiks-cube.component.css'],
})

export class RubiksCubeComponent implements OnInit {


  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private cubeSize = 3;
  private cubes: THREE.Mesh[][][] = [];
  private controls!: OrbitControls;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();


  @ViewChild('rendererContainer', { static: true })
  rendererContainer!: ElementRef;

  ngOnInit(): void {
    this.initScene();
    this.createRubiksCube();
    this.initControls();
    this.animate();
  }

  private initScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.rendererContainer.nativeElement.appendChild(this.renderer.domElement);
    this.camera.position.z = 10;
  }

  private initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.1;
    this.controls.enableZoom = true;
    this.renderer.domElement.addEventListener('mousedown', this.onMouseDown.bind(this));
    this.controls.enablePan = true;
  }

  private createRubiksCube() {
    const geometry = new THREE.BoxGeometry(0.95, 0.95, 0.95);
    const materials = [
      new THREE.MeshBasicMaterial({ color: 0xff0000 }), // right
      new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // left
      new THREE.MeshBasicMaterial({ color: 0x0000ff }), // top
      new THREE.MeshBasicMaterial({ color: 0xffff00 }), // bottom
      new THREE.MeshBasicMaterial({ color: 0xffa500 }), // front
      new THREE.MeshBasicMaterial({ color: 0xffffff })  // back
    ];

    for (let x = 0; x < this.cubeSize; x++) {
      this.cubes[x] = [];
      for (let y = 0; y < this.cubeSize; y++) {
        this.cubes[x][y] = [];
        for (let z = 0; z < this.cubeSize; z++) {
          const cube = new THREE.Mesh(geometry, materials);
          cube.position.set(x - 1, y - 1, z - 1);
          this.scene.add(cube);
          this.cubes[x][y][z] = cube;
        }
      }
    }
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    this.renderer.render(this.scene, this.camera);
  }

  logCubes() {
    console.log(this.cubes)
  }

  rotate() {
    throw new Error('Method not implemented.');
  }

  private onMouseDown(event: MouseEvent) {
    event.preventDefault();

    // Update mouse coordinates
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update raycaster based on the camera and mouse position
    this.raycaster.setFromCamera(this.mouse, this.camera);

    // Calculate objects intersecting the picking ray
    const allCubes = this.cubes.flat(2);
    const intersects = this.raycaster.intersectObjects(allCubes);

    // Check if a cube is clicked
    if (intersects.length > 0 && intersects[0].face) {
      const clickedCubie = intersects[0].object;
      const clickedFaceNormal = intersects[0].face.normal;

      this.controls.enabled = false;

      const axisMap = {
        x: ['y', 'z'],
        y: ['x', 'z'],
        z: ['x', 'y'],
      };

      const axis = Object.keys(axisMap).find((key) =>
        clickedFaceNormal[key as keyof THREE.Vector3] !== 0
      ) as 'x' | 'y' | 'z';

      const direction = clickedFaceNormal[axis] > 0 ? 1 : -1;

      this.rotateLayer(clickedCubie, axis, direction * Math.PI / 2);
    } else {
      this.controls.enabled = true;
    }
  }

  private rotateLayer(clickedCubie: THREE.Object3D, axis: 'x' | 'y' | 'z', angle: number) {
    const layerPosition = Math.round(clickedCubie.position[axis]);
  
    const rotationAxis = axis === 'x'
      ? new THREE.Vector3(1, 0, 0)
      : axis === 'y'
      ? new THREE.Vector3(0, 1, 0)
      : new THREE.Vector3(0, 0, 1);
  
    const rotationMatrix = new THREE.Matrix4().makeRotationAxis(rotationAxis, angle);

    // Loop through all cubies
    this.cubes.flat(2).forEach((cubie) => {
      if (Math.round(cubie.position[axis]) === layerPosition) {
        // Rotate the cubie
        cubie.applyMatrix4(rotationMatrix);

        // Round the position values to avoid floating-point issues
        cubie.position.round();
      }
    });
    
  }

  
}
