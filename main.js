import * as THREE from 'three';

import * as POLYTOPES from './polytopes.js';

import { FourDShape } from './fourDShape.js';

const NODE_OPACITY = 1.0;
const LINK_OPACITY = 0.7;




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

const struct = POLYTOPES.cell24();

// TODO = automate going from struct labels to colours, this now only
// works with the 24-cell

const node_ms = {};

node_ms["RED"] = new THREE.MeshStandardMaterial( { color: 0x990044 } );
node_ms["GREEN"] = new THREE.MeshStandardMaterial( { color: 0xffffee } );
node_ms["BLUE"] = new THREE.MeshStandardMaterial( { color: 0x101010 } );

for( const label in node_ms ) {
	const node_m = node_ms[label];
	node_m.roughness = 0.2;

	if( NODE_OPACITY < 1.0 ) {
		node_m.transparent = true;	
		node_m.opacity = NODE_OPACITY;
	}
}


const link_m = new THREE.MeshStandardMaterial(
	{ color: 0xb0b0b0 } );


link_m.metalness = 0.4;
link_m.roughness = 0.0;

if( LINK_OPACITY < 1.0 ) {
	link_m.transparent = true;	
	link_m.opacity = LINK_OPACITY;
}


const shape = new FourDShape(node_ms, link_m, struct);

scene.add(shape);


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



const rotation = new THREE.Matrix4();

function animate() {
	requestAnimationFrame( animate );

	const rotations = [rotYZ(theta), rotXZ(psi)];
	shape.render3(rotations);

	renderer.render( scene, camera );
}
animate();