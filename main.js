import * as THREE from 'three';



import * as POLYTOPES from './polytopes.js';
import { rotfn } from './rotation.js';
import { FourDGUI } from './gui.js';
import { FourDShape } from './fourDShape.js';

// scene, lights and camera

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const light = new THREE.PointLight(0xffffff, 2);
light.position.set(10, 10, 10);
scene.add(light);
const light2 = new THREE.PointLight(0xffffff, 2);
light2.position.set(-10, 5, 10);
scene.add(light);
const amblight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(amblight);

camera.position.z = 4;

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// set up colours and materials for gui callbacks

scene.background = new THREE.Color(0x808080);
const material = new THREE.MeshStandardMaterial({ color: 0x3293a9 });

const node_ms = [ material ];

const link_ms = [ material ];

const STRUCTURES = {
	'5-cell': POLYTOPES.cell5(),
	'16-cell': POLYTOPES.cell16(),
	'tesseract': POLYTOPES.tesseract(),
	'24-cell': POLYTOPES.cell24(),
	'120-cell': POLYTOPES.cell120(),
	'600-cell': POLYTOPES.cell600()
};

let shape = false;

function createShape(name) {
	if( shape ) {
		scene.remove(shape);
	}
	shape = new FourDShape(node_ms, link_ms, STRUCTURES[name]);
	scene.add(shape);
}

// initialise gui and read params from URL

// callbacks to do things which are triggered by controls: reset the shape,
// change the colors.  Otherwise we just read stuff from gui.params.

const gui = new FourDGUI(
	createShape,
	(c) => { material.color = new THREE.Color(c) },
	(c) => { scene.background = new THREE.Color(c) },
);

material.color = new THREE.Color(gui.params.color);
scene.background = new THREE.Color(gui.params.background);

const dragK = 0.005;
const damping = 0.99;

let theta = 0;
let psi = 0;
let theta0 = 0;
let psi0 = 0;
let dragx0 = 0;
let dragy0 = 0;
let dragging = false;


renderer.domElement.addEventListener("pointerdown", (event) => {
	if( event.buttons === 1 ) {
		theta0 = theta;
		psi0 = psi;
		dragx0 = event.clientX;
		dragy0 = event.clientY;
		dragging = true;
	}
})

renderer.domElement.addEventListener("pointermove", (event) => {
	if( event.buttons === 1 ) {
		const theta1 = theta0 + (event.clientX - dragx0) * dragK;
		const psi1 = psi0 + (event.clientY - dragy0) * dragK;
		gui.params.dtheta = theta1 - theta;
		gui.params.dpsi = psi1 - psi;
		theta = theta1;
		psi = psi1;
	}
})

renderer.domElement.addEventListener("pointerup", (event) => {
	dragging = false;
})

createShape(gui.params.shape);

function animate() {
	requestAnimationFrame( animate );

	if( ! dragging ) {
		theta += gui.params.dtheta;
		psi += gui.params.dpsi;
		if( gui.params.damping ) {
			gui.params.dtheta = gui.params.dtheta * damping;
			gui.params.dpsi = gui.params.dpsi * damping;
		}
	}

	const rotations = [
		rotfn[gui.params.xRotate](theta), 
		rotfn[gui.params.yRotate](psi)
	];
	shape.hyperplane = gui.params.hyperplane;
	shape.geom_scale = gui.params.thickness;
	shape.render3(rotations);

	renderer.render( scene, camera );
}
animate();
