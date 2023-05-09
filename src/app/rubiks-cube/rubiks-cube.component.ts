import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';
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
  private cubes: THREE.Group[][][] = [];
  private controls!: OrbitControls;
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private cubeColors: (number | undefined)[][][][] = [];



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
    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(10, 10, 10);
    this.scene.add(light);
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
    const cubieSize = 1;
    const spacing = 0.1;
    const offset = (cubieSize + spacing) * this.cubeSize / 2 - (cubieSize / 2);
  
    const materials = [
      new THREE.MeshBasicMaterial({ color: 0xff0000 }), // right face - red
      new THREE.MeshBasicMaterial({ color: 0x00ff00 }), // left face - green
      new THREE.MeshBasicMaterial({ color: 0xffffff }), // top face - white
      new THREE.MeshBasicMaterial({ color: 0xffff00 }), // bottom face - yellow
      new THREE.MeshBasicMaterial({ color: 0xffa500 }), // front face - orange
      new THREE.MeshBasicMaterial({ color: 0x0000ff }), // back face - blue
    ];
  
    for (let x = 0; x < this.cubeSize; x++) {
      this.cubes[x] = [];
      for (let y = 0; y < this.cubeSize; y++) {
        this.cubes[x][y] = [];
        for (let z = 0; z < this.cubeSize; z++) {
          const cubie = new THREE.Group();
  
          for (let faceIndex = 0; faceIndex < 6; faceIndex++) {
            if (
              (faceIndex === 0 && x === this.cubeSize - 1) ||
              (faceIndex === 1 && x === 0) ||
              (faceIndex === 2 && y === this.cubeSize - 1) ||
              (faceIndex === 3 && y === 0) ||
              (faceIndex === 4 && z === this.cubeSize - 1) ||
              (faceIndex === 5 && z === 0)
            ) {
              const faceGeometry = new THREE.PlaneGeometry(cubieSize, cubieSize);
              const faceMaterial = new THREE.MeshBasicMaterial({ color: materials[faceIndex].color, side: THREE.DoubleSide });
              const faceMesh = new THREE.Mesh(faceGeometry, faceMaterial);
  
              const rotationAxis = new THREE.Vector3(faceIndex % 2 === 0 ? 1 : 0, faceIndex < 2 ? 0 : 1, faceIndex < 4 ? 0 : 1);
              const rotationAngle = faceIndex % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
  
              faceMesh.rotateOnWorldAxis(rotationAxis, rotationAngle);
              faceMesh.translateOnAxis(rotationAxis, cubieSize / 2);
              cubie.add(faceMesh);
            }
          }
  
          cubie.position.set(
            x * (cubieSize + spacing) - offset,
            y * (cubieSize + spacing) - offset,
            z * (cubieSize + spacing) - offset
          );
  
          this.cubes[x][y][z] = cubie;
          this.scene.add(cubie);
  
          if (!this.cubeColors[x]) {
            this.cubeColors[x] = [];
          }
          if (!this.cubeColors[x][y]) {
            this.cubeColors[x][y] = [];
          }
          if (!this.cubeColors[x][y][z]) {
            this.cubeColors[x][y][z] = [];
          }
          for (let faceIndex = 0; faceIndex < 6; faceIndex++) {
            if (
              (faceIndex === 0 && x === this.cubeSize - 1) ||
              (faceIndex === 1 && x === 0) ||
              (faceIndex === 2 && y === this.cubeSize - 1) ||
              (faceIndex === 3 && y === 0) ||
              (faceIndex === 4 && z === this.cubeSize - 1) ||
              (faceIndex === 5 && z === 0)
            ) {
              this.cubeColors[x][y][z][faceIndex] = materials[faceIndex].color.getHex();
            } else {
              this.cubeColors[x][y][z][faceIndex] = undefined;
            }
          }
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

      this.rotateLayer(clickedCubie, axis, direction * Math.PI / 2, 500);
    } else {
      this.controls.enabled = true;
    }
  }

  private rotateLayer(clickedCubie: THREE.Object3D, axis: 'x' | 'y' | 'z', angle: number, duration: number) {
    const layerPosition = Math.round(clickedCubie.position[axis]);
    const rotationAxis = axis === 'x'
      ? new THREE.Vector3(1, 0, 0)
      : axis === 'y'
        ? new THREE.Vector3(0, 1, 0)
        : new THREE.Vector3(0, 0, 1);

    this.animateRotation(layerPosition, axis, rotationAxis, angle, duration).onComplete(() => {
      // ...
      // Update cubeColors array with new positions
      for (let x = 0; x < this.cubeSize; x++) {
        for (let y = 0; y < this.cubeSize; y++) {
          for (let z = 0; z < this.cubeSize; z++) {
            this.cubeColors[x][y][z] = this.cubes[x][y][z].material.color.getHex();
          }
        }
      }
      // Reassign the colors based on the updated cubeColors array
      for (let x = 0; x < this.cubeSize; x++) {
        for (let y = 0; y < this.cubeSize; y++) {
          for (let z = 0; z < this.cubeSize; z++) {
            this.cubes[x][y][z].material.color.set(this.cubeColors[x][y][z]);
          }
        }
      }
      // ...
    });;
    
  }

  private animateRotation(layerPosition: number, axis: 'x' | 'y' | 'z', rotationAxis: THREE.Vector3, targetAngle: number, duration: number) {
    const startTime = performance.now();
    const layerCubies = this.cubes.flat(2).filter(cubie => Math.round(cubie.position[axis]) === layerPosition);

    // Create a temporary parent object for the layer
    const layerParent = new THREE.Object3D();

    // Add the cubies in the layer to the parent object
    layerCubies.forEach(cubie => {
      this.scene.remove(cubie);
      layerParent.add(cubie);
    });

    // Add the temporary parent object to the scene
    this.scene.add(layerParent);

    const animate = (currentTime: number) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const currentAngle = targetAngle * progress;

      // Reset the rotation of the parent object
      layerParent.setRotationFromEuler(new THREE.Euler(0, 0, 0));

      // Apply the new rotation to the parent object
      layerParent.rotateOnAxis(rotationAxis, currentAngle);

      this.renderer.render(this.scene, this.camera);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Remove the cubies from the parent object and add them back to the scene
        layerCubies.forEach(cubie => {
          layerParent.remove(cubie);
          this.scene.add(cubie);
        });

        // Remove the temporary parent object from the scene
        this.scene.remove(layerParent);
      }
    };

    requestAnimationFrame(animate);
  }




}
