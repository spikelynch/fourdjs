import * as THREE from 'three';

const NODE_SIZE = 0.1;
const LINK_SIZE = 0.05;

function makeWireFrame(node_m, link_m, graph) {
	const nodeids = {}
	const group = new THREE.Group();
	for ( const n of graph.nodes ) {
		nodeids[n.id] = [ n.x, n.y, n.z ];
		const geometry = new THREE.SphereGeometry(NODE_SIZE);
		const sphere = new THREE.Mesh(geometry, node_m);
		group.add(sphere);
		sphere.position.x = n.x;
		sphere.position.y = n.y;
		sphere.position.z = n.z;
	}
	return group;
}


const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const node_m = new THREE.MeshBasicMaterial( { color: 0x33ff00 } );
const link_m = new THREE.MeshBasicMaterial( { color: 0x009930 } );




const octahedron = makeWireFrame(node_m, link_m, {
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



scene.add(octahedron);



camera.position.z = 5;

let tick = 0;

function animate() {
	requestAnimationFrame( animate );

	octahedron.rotation.x = tick * 0.3;
	octahedron.rotation.y = tick * 0.5;

	tick += 0.01;
	renderer.render( scene, camera );
}
animate();