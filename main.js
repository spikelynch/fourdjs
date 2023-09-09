import * as THREE from 'three';



import * as POLYTOPES from './polytopes.js';
import { get_rotation } from './rotation.js';
import { FourDGUI, DEFAULTS } from './gui.js';
import { FourDShape } from './fourDShape.js';
import { get_colours } from './colours.js';

const FACE_OPACITY = 0.3;

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

scene.background = new THREE.Color(DEFAULTS.background);
const material = new THREE.MeshStandardMaterial({ color: DEFAULTS.color });
const node_colours = get_colours(DEFAULTS.color);


material.transparent = true;
material.opacity = 0.5;


const node_ms = node_colours.map((c) => new THREE.MeshStandardMaterial({color: c}));
const link_ms = node_colours.map((c) => new THREE.MeshStandardMaterial({color: c}));

link_ms.map((m) => {
	m.transparent =  true;
	m.opacity = 0.5;
	}
)

const face_ms = [
	new THREE.MeshLambertMaterial( { color: 0x44ff44 } )
	];

for( const face_m of face_ms ) {
	face_m.transparent = true;	
	face_m.opacity = FACE_OPACITY;
}


const STRUCTURES = {
	'5-cell': POLYTOPES.cell5(),
	'16-cell': POLYTOPES.cell16(),
	'tesseract': POLYTOPES.tesseract(),
	'24-cell': POLYTOPES.cell24(),
	'120-cell': POLYTOPES.cell120(),
	'600-cell': POLYTOPES.cell600(),
};

const INSCRIBED = {
	'tesseract': POLYTOPES.tesseract_inscribed(),
	'120-cell': POLYTOPES.cell120_inscribed(),
	'600-cell': POLYTOPES.cell600_inscribed(),
};

const ALL_INSCRIBED = {
	'tesseract': POLYTOPES.tesseract_all_inscribed(),
	'120-cell': POLYTOPES.cell120_all_inscribed(),
	'600-cell': POLYTOPES.cell600_all_inscribed(),
}

let shape = false;

function createShape(name, inscribed, all) {
	if( shape ) {
		scene.remove(shape);
	}
	let structure = STRUCTURES[name];
	if( inscribed ) {
		if( name in INSCRIBED ) {
			if( all ) {
				structure = ALL_INSCRIBED[name];
			} else {
				structure = INSCRIBED[name];
			}
		} 
	}

	shape = new FourDShape(node_ms, link_ms, face_ms, structure);
	scene.add(shape);
}

// initialise gui and read params from URL

// callbacks to do things which are triggered by controls: reset the shape,
// change the colors.  Otherwise we just read stuff from gui.params.

function setColors(c) {
	const nc = get_colours(c);
	for( let i = 0; i < node_ms.length; i++ ) {
		node_ms[i].color = new THREE.Color(nc[i]);
		link_ms[i].color = new THREE.Color(nc[i]);
	}
	material.color = new THREE.Color(c);
}

function setBackground(c) {
	scene.background = new THREE.Color(c)
}

function setLinkOpacity(o, primary) {
	if( primary ) {
		link_ms[0].opacity = o;
	} else {
		for( const lm of link_ms.slice(1) ) {
			lm.opacity = o;
		}
	}
}

let gui; // 

function changeShape() {
	console.log("change shape!")
	createShape(gui.params.shape, gui.params.inscribed, gui.params.inscribe_all);
}

gui = new FourDGUI(changeShape, setColors, setBackground, setLinkOpacity);

// these are here to pick up colour settings from the URL params
setColors(gui.params.color);
setBackground(gui.params.background);

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

createShape(gui.params.shape, gui.params.inscribed, gui.params.inscribe_all);

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

	const rotations = get_rotation(gui.params.rotation, theta, psi);

	shape.hyperplane = gui.params.hyperplane;
	shape.link_scale = gui.params.thickness;
	shape.node_scale = gui.params.nodesize;
	shape.render3(rotations);

	renderer.render( scene, camera );
}
animate();
