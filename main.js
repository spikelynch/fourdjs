import * as THREE from 'three';

import * as POLYTOPES from './polytopes.js';

import { FourDShape } from './fourDShape.js';

import { GUI } from 'lil-gui';


const DEFAULT_SHAPE = '120-cell';

// hacky stuff for 4d rotations

// see https://math.stackexchange.com/questions/1402362/can-rotations-in-4d-be-given-an-explicit-matrix-form#1402376



function rotZW(theta) {
	const ctheta = Math.cos(theta);
	const stheta = Math.sin(theta);
	return new THREE.Matrix4(
		ctheta, -stheta, 0, 0,
		stheta, ctheta, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
		);
}

function rotYW(theta) {
	const ctheta = Math.cos(theta);
	const stheta = Math.sin(theta);
	return new THREE.Matrix4(
		ctheta, 0, -stheta, 0,
		0, 1, 0, 0,
		stheta, 0, ctheta, 0,
		0, 0, 0, 1,
		);
}

function rotYZ(theta) {
	const ctheta = Math.cos(theta);
	const stheta = Math.sin(theta);
	return new THREE.Matrix4(
		ctheta, 0, 0, -stheta,
		0, 1, 0, 0,
		0, 0, 1, 0,
		stheta, 0, 0, ctheta, 
		);
}

function rotXW(theta) {
	const ctheta = Math.cos(theta);
	const stheta = Math.sin(theta);
	return new THREE.Matrix4(
		1, 0, 0, 0,
		0, ctheta, -stheta, 0,
		0, stheta, ctheta, 0,
		0, 0, 0, 1
		);
}

function rotXZ(theta) {
	const ctheta = Math.cos(theta);
	const stheta = Math.sin(theta);
	return new THREE.Matrix4(
		1, 0, 0, 0,
		0, ctheta, 0, -stheta,
		0, 0, 1, 0,
		0, stheta, 0, ctheta,
		);
}

function rotXY(theta) {
	const ctheta = Math.cos(theta);
	const stheta = Math.sin(theta);
	return new THREE.Matrix4(
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, ctheta, -stheta,
		0, 0, stheta, ctheta,
		);
}







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

scene.background = new THREE.Color(0xdddddd);


const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


const NODE_OPACITY = 1.0;
const LINK_OPACITY = 1.0;

const node_ms = [
	new THREE.MeshStandardMaterial( { color: 0x90ebff } )
];

for( const node_m of node_ms ) {
	node_m.roughness = 0.9;

	if( NODE_OPACITY < 1.0 ) {
		node_m.transparent = true;	
		node_m.opacity = NODE_OPACITY;
	}
}

const link_ms = [
	new THREE.MeshStandardMaterial( { color: 0x90ebff } )
	];

for( const link_m of link_ms ) {
	link_m.metalness = 0.8;
	link_m.roughness = 0.1;

	if( LINK_OPACITY < 1.0 ) {
		link_m.transparent = true;	
		link_m.opacity = LINK_OPACITY;
	}
}

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




createShape(DEFAULT_SHAPE);


camera.position.z = 4;

const dragK = 0.005;
const damping = 0.99;

let theta = 0;
let psi = 0;
let theta0 = 0;
let psi0 = 0;
let dragx0 = 0;
let dragy0 = 0;
let dtheta = 0;
let dpsi = 0;
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
		dtheta = theta1 - theta;
		dpsi = psi1 - psi;
		theta = theta1;
		psi = psi1;
	}
})

renderer.domElement.addEventListener("pointerup", (event) => {
	dragging = false;
})


// set up GUI

const gui = new GUI();

const gui_params = {
	shape: DEFAULT_SHAPE,
	hyperplane: 2,
	xRotate: 'YW',
	yRotate: 'XZ',
	damping: false
};

gui.add(gui_params, 'shape',
	[ '5-cell', '16-cell', 'tesseract', '24-cell', '120-cell', '600-cell' ]
	).onChange(createShape)

gui.add(gui_params, 'hyperplane', 1.5, 4);
gui.add(gui_params, 'xRotate', [ 'YW', 'YZ', 'ZW' ]);
gui.add(gui_params, 'yRotate', [ 'XZ', 'XY', 'XW' ]);
gui.add(gui_params, 'damping');

const ROTFN = {
	XY: rotXY,
	XZ: rotXZ,
	XW: rotXW,
	YZ: rotYZ,
	YW: rotYW,
	ZW: rotZW,
};



const rotation = new THREE.Matrix4();

function animate() {
	requestAnimationFrame( animate );

	if( ! dragging ) {
		theta += dtheta;
		psi += dpsi;
		if( gui_params.damping ) {
			dtheta = dtheta * damping;
			dpsi = dpsi * damping;
		}
	}

	const rotations = [
		ROTFN[gui_params.xRotate](theta), 
		ROTFN[gui_params.yRotate](psi)
	];
	shape.hyperplane = gui_params.hyperplane;
	shape.render3(rotations);

	renderer.render( scene, camera );
}
animate();
