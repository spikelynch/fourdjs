import * as THREE from 'three';

const NODE_SIZE = 0.07;
const LINK_SIZE = 0.02;


function makeLink(link_m, n1, n2) {
	const length = n1.distanceTo(n2);
	const centre = new THREE.Vector3();
	centre.lerpVectors(n1, n2, 0.5);
	const geometry = new THREE.CylinderGeometry(LINK_SIZE, LINK_SIZE,length);
//	const geometry = new THREE.SphereGeometry(LINK_SIZE);
	const cyl = new THREE.Mesh(geometry, link_m);
	const pivot = new THREE.Group();
	pivot.add(cyl);
	pivot.position.copy(centre);
	pivot.lookAt(n2);
	cyl.rotation.x = Math.PI / 2.0;
	return pivot;
}



function makeWireFrame(node_m, link_m, graph) {
	const nodeids = {}
	const group = new THREE.Group();
	for ( const n of graph.nodes ) {
		const v3 = new THREE.Vector3(n.x, n.y, n.z);
		nodeids[n.id] = v3.clone();
		const geometry = new THREE.SphereGeometry(NODE_SIZE);
		const sphere = new THREE.Mesh(geometry, node_m);
		sphere.position.copy(v3);
		group.add(sphere);
	}
	for ( const l of graph.links ) {
		const link = makeLink(link_m, nodeids[l.source], nodeids[l.target]);
		group.add(link);
	}
	return group;
}


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const light = new THREE.PointLight(0xffffff, 2);
light.position.set(10, 10, 10);
scene.add(light);


const amblight = new THREE.AmbientLight(0xffffff, 0.2);
scene.add(amblight);

scene.background = new THREE.Color(0xdddddd);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const node_m = new THREE.MeshStandardMaterial(
	{ color: 0x330000 } );

node_m.roughness = 0.2;

const link_m = new THREE.MeshStandardMaterial(
	{ color: 0xf0f0f0 } );


link_m.metalness = 0.4;
link_m.roughness = 0.0;

const shape = makeWireFrame(node_m, link_m, {
	nodes: [
		{ id: 1, x: 0, y: -1, z: 0 },
		{ id: 2, x: 0, y: 0, z: -1 },
		{ id: 3, x: -1, y: 0, z: 0 },
		{ id: 4, x: 0, y: 0, z: 1 },
		{ id: 5, x: 1, y: 0, z: 0 },
		{ id: 6, x: 0, y: 1, z: 0 },
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
	]
});




scene.add(shape);



camera.position.z = 3;

let tick = 0;

function animate() {
	requestAnimationFrame( animate );

	shape.rotation.x = tick * 0.3;
	shape.rotation.y = tick * 0.5;

	tick += 0.01;
	renderer.render( scene, camera );
}
animate();