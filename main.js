import * as THREE from 'three';

const NODE_SIZE = 0.2;
const LINK_SIZE = 0.1;

function makeShape(graph) {
	const nodeids = {}
	const group = new THREE.Group();
	for ( const n of graph.nodes ) {
		nodeids[n.id] = [ n.x, n.y, n.z ];
		const geometry = new THREE.SphereGeometry(NODE_SIZE, NODE_SIZE,NODE_SIZE);
		const material = new THREE.MeshBasicMaterial({color: 0x00ff00});
		const sphere = new THREE.Mesh(geometry, material);
		group.add(sphere);
		sphere.x = n.x;
		sphere.y = n.y;
		sphere.z = n.z;
	}
	return group;
}



// const shape = makeShape({
// 	nodes: [
// 		{ id: 1, x: -10, y: -10, z: -10 },
// 		{ id: 2, x: 10, y: 10, z: 10}
// 	],
// 	links: [
// 		{ id: 1, source: 1, target: 1 }
// 	]
// });







const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// const geometry = new THREE.BoxGeometry( 1, 1, 1 );
// const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
// const cube = new THREE.Mesh( geometry, material );
// scene.add( cube );

const group = new THREE.Group();

const sphere_g = new THREE.SphereGeometry( 1 );
const sphere_m = new THREE.MeshBasicMaterial( { color: 0x33ff00 } );
const sphere = new THREE.Mesh( sphere_g, sphere_m );
group.add( sphere );

const cyl_g = new THREE.CylinderGeometry( 0.2, 0.2, 4 );
const cyl_m = new THREE.MeshBasicMaterial( { color: 0x009930 } );
const cyl = new THREE.Mesh( cyl_g, cyl_m );
group.add( cyl );


scene.add(group);



camera.position.z = 5;

let tick = 0;

function animate() {
	requestAnimationFrame( animate );

	group.rotation.x = tick;
	group.rotation.y = tick;
	cyl.position.y = Math.sin(tick * 10) * 0.4;
	cyl.rotation.x = tick * 2;

	tick += 0.01;
	renderer.render( scene, camera );
}
animate();