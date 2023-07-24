import * as THREE from 'three';

import * as SHAPES from './shapes.js';

const NODE_SIZE = 0.07;
const LINK_SIZE = 0.03;
const NODE_OPACITY = 1.0;
const LINK_OPACITY = 0.8;

const HYPERPLANE = 2;



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


// putting rotation here first - it's a matrix4

function fourDtoV3(x, y, z, w, rotations) {
	const v4 = new THREE.Vector4(x, y, z, w);
	for ( const m4 of rotations ) {
		v4.applyMatrix4(m4);
	}
	const k = HYPERPLANE / (HYPERPLANE + v4.w);
	return new THREE.Vector3(v4.x * k, v4.y * k, v4.z * k);
}


class FourDShape extends THREE.Group {

	constructor(node_m, link_m, structure) {
		super();
		this.node_m = node_m;
		this.link_m = link_m;
		this.nodes4 = structure.nodes;
		this.nodes3 = {};
		this.links = structure.links;
		this.initShapes();
	}

	makeNode(v3) {
		const geometry = new THREE.SphereGeometry(NODE_SIZE);
		const sphere = new THREE.Mesh(geometry, this.node_m);
		sphere.position.copy(v3);
		this.add(sphere);
		return sphere;
	}

	makeLink(link) {
		const n1 = this.nodes3[link.source].v3;
		const n2 = this.nodes3[link.target].v3;
		const length = n1.distanceTo(n2);
		const centre = new THREE.Vector3();
		centre.lerpVectors(n1, n2, 0.5);
		const geometry = new THREE.CylinderGeometry(LINK_SIZE, LINK_SIZE, 1);
		const cyl = new THREE.Mesh(geometry, this.link_m);
		const edge = new THREE.Group();
		edge.add(cyl);
		edge.position.copy(centre);
		edge.scale.copy(new THREE.Vector3(1, 1, length));
		edge.lookAt(n2);
		cyl.rotation.x = Math.PI / 2.0;
		this.add(edge);
		return edge;
	}

	updateLink(link) {
		const n1 = this.nodes3[link.source].v3;
		const n2 = this.nodes3[link.target].v3;
		const length = n1.distanceTo(n2);
		const centre = new THREE.Vector3();
		centre.lerpVectors(n1, n2, 0.5);
		link.object.scale.copy(new THREE.Vector3(1, 1, length));
		link.object.position.copy(centre);
		link.object.lookAt(n2);
		link.object.children[0].rotation.x = Math.PI / 2.0;
	}

	initShapes() {
		for( const n of this.nodes4 ) {
			const v3 = fourDtoV3(n.x, n.y, n.z, n.w, []);
			this.nodes3[n.id] = {
				v3: v3,
				object: this.makeNode(v3)
			};
		}
		for( const l of this.links ) {
			l.object = this.makeLink(l);
		}
	}

	render3(rotations) {
		for( const n of this.nodes4 ) {
			const v3 = fourDtoV3(n.x, n.y, n.z, n.w, rotations);
			this.nodes3[n.id].v3 = v3;
			this.nodes3[n.id].object.position.copy(v3);
			// could do scaling here
		}

		for( const l of this.links ) {
			this.updateLink(l);
		}
	}


}






const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const light = new THREE.PointLight(0xffffff, 2);
light.position.set(10, 10, 10);
scene.add(light);


const amblight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(amblight);

scene.background = new THREE.Color(0xdddddd);

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const node_m = new THREE.MeshStandardMaterial(
	{ color: 0x990044 } );

node_m.roughness = 0.2;

if( NODE_OPACITY < 1.0 ) {
	node_m.transparent = true;	
	node_m.opacity = NODE_OPACITY;
}


const link_m = new THREE.MeshStandardMaterial(
	{ color: 0xb0b0b0 } );


link_m.metalness = 0.4;
link_m.roughness = 0.0;

if( LINK_OPACITY < 1.0 ) {
	link_m.transparent = true;	
	link_m.opacity = LINK_OPACITY;
}

const struct = SHAPES.cell24();

const shape = new FourDShape(node_m, link_m, struct);

scene.add(shape);

camera.position.z = 4;

let theta = 0;



const rotation = new THREE.Matrix4();

function animate() {
	requestAnimationFrame( animate );

	theta += 0.01;

	const rotations = [rotYZ(theta * 0.33), rotXW(theta * 0.5)];
	shape.render3(rotations);


	renderer.render( scene, camera );
}
animate();