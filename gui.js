import { GUI } from 'lil-gui';


const DEFAULT_SHAPE = '120-cell';
const DEFAULT_COLOR = 0x90ebff;
const DEFAULT_BG = 0xdddddd;




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


