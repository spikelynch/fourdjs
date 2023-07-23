import * as THREE from 'three';



const NODE_SIZE = 0.07;
const LINK_SIZE = 0.02;

const HYPERPLANE = 4;

const r5 = Math.sqrt(5);

const CELL5 = {
	nodes: [
      {id:1, x: 1, y: 1, z: 1, w: -1 / r5 },
      {id:2, x: 1, y: -1, z: -1, w: -1 / r5 },
      {id:3, x: -1, y: 1, z: -1, w: -1 / r5 },
      {id:4, x: -1, y: -1, z: 1, w: -1 / r5 },
      {id:5, x: 0, y: 0, z: 0, w: 4 / r5 },
	],
	links: [
		{ id:1, source:1, target: 2},
		{ id:2, source:1, target: 3},
		{ id:3, source:1, target: 4},
		{ id:4, source:1, target: 5},
		{ id:5, source:2, target: 3},
		{ id:6, source:2, target: 4},
		{ id:7, source:2, target: 5},
		{ id:8, source:3, target: 4},
		{ id:9, source:3, target: 5},
		{ id:10, source:4, target: 5},
		]

	};


const CELL16 = {
	nodes: [
		{ id: 1, x: 0, y: -1, z: 0, w: 0 },
		{ id: 2, x: 0, y: 0, z: -1, w: 0 },
		{ id: 3, x: -1, y: 0, z: 0, w: 0 },
		{ id: 4, x: 0, y: 0, z: 1, w: 0 },
		{ id: 5, x: 1, y: 0, z: 0, w: 0 },
		{ id: 6, x: 0, y: 1, z: 0, w: 0 },
		{ id: 7, x: 0, y: 0, z: 0, w: -1 },
		{ id: 8, x: 0, y: 0, z: 0, w: 1 },
	],
	links: [
		{ id: 1, source: 1, target: 2 },
		{ id: 2, source: 1, target: 3 },
		{ id: 3, source: 1, target: 4 },
		{ id: 4, source: 1, target: 5 },
		{ id: 5, source: 2, target: 3 },
		{ id: 6, source: 3, target: 4 },
		{ id: 7, source: 4, target: 5 },
		{ id: 8, source: 5, target: 2 },
		{ id: 9, source: 2, target: 6 },
		{ id: 10, source: 3, target: 6 },
		{ id: 11, source: 4, target: 6 },
		{ id: 12, source: 5, target: 6 },
		{ id: 13, source: 1, target: 7 },
		{ id: 14, source: 1, target: 8 },
		{ id: 15, source: 2, target: 7 },
		{ id: 16, source: 2, target: 8 },
		{ id: 17, source: 3, target: 7 },
		{ id: 18, source: 3, target: 8 },
		{ id: 19, source: 4, target: 7 },
		{ id: 20, source: 4, target: 8 },
		{ id: 21, source: 5, target: 7 },
		{ id: 22, source: 5, target: 8 },
		{ id: 23, source: 6, target: 7 },
		{ id: 25, source: 6, target: 8 },
	]
};


const TESSERACT = {
	nodes: [
		{ id: 1,  x: -1, y: -1, z: -1, w: -1 },
		{ id: 2,  x:  1, y: -1, z: -1, w: -1 },
		{ id: 3,  x: -1, y:  1, z: -1, w: -1 },
		{ id: 4,  x:  1, y:  1, z: -1, w: -1 },
		{ id: 5,  x: -1, y: -1, z:  1, w: -1 },
		{ id: 6,  x:  1, y: -1, z:  1, w: -1 },
		{ id: 7,  x: -1, y:  1, z:  1, w: -1 },
		{ id: 8,  x:  1, y:  1, z:  1, w: -1 },
		{ id: 9,  x: -1, y: -1, z: -1, w:  1 },
		{ id: 10, x:  1, y: -1, z: -1, w:  1 },
		{ id: 11, x: -1, y:  1, z: -1, w:  1 },
		{ id: 12, x:  1, y:  1, z: -1, w:  1 },
		{ id: 13, x: -1, y: -1, z:  1, w:  1 },
		{ id: 14, x:  1, y: -1, z:  1, w:  1 },
		{ id: 15, x: -1, y:  1, z:  1, w:  1 },
		{ id: 16, x:  1, y:  1, z:  1, w:  1 },
	],
	links: [
		{ id: 1, source: 1, target: 2 },
		{ id: 2, source: 2, target: 4 },
		{ id: 3, source: 4, target: 3 },
		{ id: 4, source: 3, target: 1 },
		{ id: 5, source: 5, target: 6 },
		{ id: 6, source: 6, target: 8 },
		{ id: 7, source: 8, target: 7 },
		{ id: 8, source: 7, target: 5 },
		{ id: 9, source: 1, target: 5 },
		{ id: 10, source: 2, target: 6 },
		{ id: 11, source: 3, target: 7 },
		{ id: 12, source: 4, target: 8 },

		{ id: 13, source: 9, target: 10 },
		{ id: 14, source: 10, target: 12 },
		{ id: 15, source: 12, target: 11 },
		{ id: 16, source: 11, target: 9 },
		{ id: 17, source: 13, target: 14 },
		{ id: 18, source: 14, target: 16 },
		{ id: 19, source: 16, target: 15 },
		{ id: 20, source: 15, target: 13 },
		{ id: 21, source: 9, target: 13 },
		{ id: 22, source: 10, target: 14 },
		{ id: 23, source: 11, target: 15 },
		{ id: 24, source: 12, target: 16 },

		{ id: 25, source: 1, target: 9 },
		{ id: 26, source: 2, target: 10 },
		{ id: 27, source: 3, target: 11 },
		{ id: 28, source: 4, target: 12 },
		{ id: 29, source: 5, target: 13 },
		{ id: 30, source: 6, target: 14 },
		{ id: 31, source: 7, target: 15 },
		{ id: 32, source: 8, target: 16 },


	]
};


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
//renderer.physicallyCorrectLights = true;
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const node_m = new THREE.MeshStandardMaterial(
	{ color: 0x990044 } );

node_m.roughness = 0.2;

const link_m = new THREE.MeshStandardMaterial(
	{ color: 0xb0b0b0 } );


link_m.metalness = 0.4;
link_m.roughness = 0.0;
link_m.transparent = true;
link_m.opacity = 0.5;



const shape = new FourDShape(node_m, link_m, TESSERACT);

scene.add(shape);

camera.position.z = 4;

let theta = 0;



const rotation = new THREE.Matrix4();

function animate() {
	requestAnimationFrame( animate );

	theta += 0.01;

	const rotations = [rotXY(theta * 0.5), rotXW(theta)];
	shape.render3(rotations);


	renderer.render( scene, camera );
}
animate();