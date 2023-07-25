import * as THREE from 'three';

import * as POLYTOPES from './polytopes.js';

import { FourDShape } from './fourDShape.js';

import { GUI } from 'lil-gui';




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


const amblight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(amblight);

scene.background = new THREE.Color(0xdddddd);


const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


const NODE_OPACITY = 1.0;
const LINK_OPACITY = 0.7;

// nodes. links
// 0 R    0 (0-1) Y
// 1 G    1 (1-2) C
// 2 B    2 (0-2) M

// duals
// 0 C    0 (0-1) G 
// 1 Y    1 (1-2) R
// 2 M    2 (0-2) B

const node_ms = [
	new THREE.MeshStandardMaterial( { color: 0x20dddd } ),
	new THREE.MeshStandardMaterial( { color: 0xdddd20 } ),
	new THREE.MeshStandardMaterial( { color: 0xdd20dd } ),
];

for( const node_m of node_ms ) {
	node_m.roughness = 0.9;

	if( NODE_OPACITY < 1.0 ) {
		node_m.transparent = true;	
		node_m.opacity = NODE_OPACITY;
	}
}

const link_ms = [
	new THREE.MeshStandardMaterial( { color: 0x20dd20 } ),
	new THREE.MeshStandardMaterial( { color: 0xdd2020 } ),
	new THREE.MeshStandardMaterial( { color: 0x2020dd } ),
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
};

let shape = false;

function createShape(name) {
	if( shape ) {
		scene.remove(shape);
	}

	shape = new FourDShape(node_ms, link_ms, STRUCTURES[name]);
	scene.add(shape);

}




createShape('24-cell');


camera.position.z = 4;

const dragK = 0.01;

let theta = 0;
let psi = 0;
let startX = 0;
let startY = 0;
let startX0 = 0;
let startY0 = 0;

renderer.domElement.addEventListener("mousedown", (event) => {
	if( event.buttons === 1 ) {
		startX = event.clientX;
		startY = event.clientY;
		startX0 = theta / dragK;
		startY0 = theta / dragK;
	}
})


renderer.domElement.addEventListener("mousemove", (event) => {
	if( event.buttons === 1 ) {
		theta = (event.clientX - startX + startX0) * dragK;
		psi = (event.clientY - startY + startY0) * dragK;
	}
})

// set up GUI

const gui = new GUI();

const gui_params = {
	shape: '24-cell',
	hyperplane: 2,
	xRotate: 'YW',
	yRotate: 'XZ',
};

gui.add(gui_params, 'shape',
	[ '5-cell', '16-cell', 'tesseract', '24-cell' ]
	).onChange(createShape)

gui.add(gui_params, 'hyperplane', 1, 4);
gui.add(gui_params, 'xRotate', [ 'YW', 'YZ', 'ZW' ]);
gui.add(gui_params, 'yRotate', [ 'XZ', 'XY', 'XW' ]);

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

	const rotations = [
		ROTFN[gui_params.xRotate](theta), 
		ROTFN[gui_params.yRotate](psi)
	];
	shape.hyperplane = gui_params.hyperplane;
	shape.render3(rotations);

	renderer.render( scene, camera );
}
animate();