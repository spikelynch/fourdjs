import * as THREE from 'three';

import * as POLYTOPES from './polytopes.js';

import { FourDShape } from './fourDShape.js';

import { GUI } from 'lil-gui';


const DEFAULT_SHAPE = '120-cell';
const DEFAULT_COLOR = 0x90ebff;
const DEFAULT_BG = 0xdddddd;





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



function fallbackCopyTextToClipboard(text) {
  var textArea = document.createElement("textarea");
  textArea.value = text;
  
  // Avoid scrolling to bottom
  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Fallback: Copying text command was ' + msg);
  } catch (err) {
    console.error('Fallback: Oops, unable to copy', err);
  }

  document.body.removeChild(textArea);
}


function copyTextToClipboard(text) {
 	if (!navigator.clipboard) {
    	fallbackCopyTextToClipboard(text);
    	return;
  	}
  	navigator.clipboard.writeText(text).then(function() {
    	console.log('Async: Copying to clipboard was successful!');
  	}, function(err) {
    	console.error('Async: Could not copy text: ', err);
  	});
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

scene.background = new THREE.Color(DEFAULT_BG);


const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


const material = new THREE.MeshStandardMaterial(
	{ color: DEFAULT_COLOR }
);

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


function floatParam(params, param) {
	const value = params.get(param);
	if( value ) {
		const fl = parseFloat(value);
		if( fl !== NaN ) {
			return fl;
		}
	}
	return 0;
}

function stringtoHex(cstr) {
	return parseInt('0x' + cstr.substr(1));
}

function hexToString(hex) {
	return '#' + hex.toString(16);
}


function colorParam(params, param, dft) {
	const value = params.get(param);
	if( value ) {
		const hex = stringtoHex(value);
		if( hex !== NaN ) {
			return hex;
		}
	}
	return dft;
}


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

const linkUrl = new URL(window.location.toLocaleString());

const link_params = {};

const urlParams = linkUrl.searchParams;
for( const param of [ "shape", "xRotate", "yRotate" ]) {
	const value = urlParams.get(param);
	if( value ) {
		link_params[param] = value;
	}
}

link_params['hyperplane'] = floatParam(urlParams, 'hyperplane');
link_params['thickness'] = floatParam(urlParams, 'thickness');
link_params['color'] = colorParam(urlParams, 'color', DEFAULT_COLOR);
link_params['background'] = colorParam(urlParams, 'background', DEFAULT_BG);

dpsi = floatParam(urlParams, 'dpsi');
dtheta = floatParam(urlParams, 'dtheta');


const gui_params = {
	shape: link_params['shape'] || DEFAULT_SHAPE,
	thickness: link_params['thickness'] || 1,
	color: link_params['color'] || DEFAULT_COLOR,
	background: link_params['background'] || DEFAULT_BG,
	hyperplane: link_params['hyperplane'] || 2,
	xRotate: link_params['xRotate'] || 'YW',
	yRotate: link_params['yRotate'] || 'XZ',
	damping: false,
	"copy link": function () {
		const url = new URL(linkUrl.origin + linkUrl.pathname);
		url.searchParams.append("shape", gui_params.shape);
		url.searchParams.append("thickness", gui_params.thickness.toString());
		url.searchParams.append("color", hexToString(gui_params.color));
		url.searchParams.append("background", hexToString(gui_params.background));
		url.searchParams.append("hyperplane", gui_params.hyperplane.toString());
		url.searchParams.append("xRotate", gui_params.xRotate);
		url.searchParams.append("yRotate", gui_params.yRotate);
		url.searchParams.append("dtheta", dtheta.toString());
		url.searchParams.append("dpsi", dpsi.toString());
		copyTextToClipboard(url);
	}
};



gui.add(gui_params, 'shape',
	[ '5-cell', '16-cell', 'tesseract', '24-cell', '120-cell', '600-cell' ]
	).onChange(createShape)

gui.add(gui_params, 'hyperplane', 1.5, 4);
gui.add(gui_params, 'thickness', 0.01, 4);
gui.addColor(gui_params, 'color').onChange((c) => {
	console.log(`Setting material colour to ${c}`);
	material.color = new THREE.Color(c);
});
gui.addColor(gui_params, 'background').onChange((c) => {
	console.log(`Setting background colour to ${c}`);
	scene.background = new THREE.Color(c);
});
gui.add(gui_params, 'xRotate', [ 'YW', 'YZ', 'ZW' ]);
gui.add(gui_params, 'yRotate', [ 'XZ', 'XY', 'XW' ]);
gui.add(gui_params, 'damping');
gui.add(gui_params, 'copy link');

const ROTFN = {
	XY: rotXY,
	XZ: rotXZ,
	XW: rotXW,
	YZ: rotYZ,
	YW: rotYW,
	ZW: rotZW,
};



createShape(gui_params["shape"]);


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
	shape.geom_scale = gui_params.thickness;
	shape.render3(rotations);

	renderer.render( scene, camera );
}
animate();
