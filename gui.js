import { GUI } from 'lil-gui';



const DEFAULTS = {
	thickness: 0.25,
	nodesize: 1.25,
	linkopacity: 0.5,
	link2opacity: 0.5,
	shape: '120-cell',
	inscribed: false,
	inscribe_all: false,
	color: 0x3293a9,
	background: 0xd4d4d4,
	hyperplane: 2,
	rotation: 'rigid',
	dtheta: 0,
	dpsi: 0,
}



class FourDGUI {

	constructor(changeShape, setColor, setBackground, setLinkOpacity) {
		this.gui = new GUI();
		this.parseLinkParams();
		const guiObj = this;
		this.params = {
			shape: this.link['shape'],
			inscribed: this.link['inscribed'],
			inscribe_all: this.link['inscribe_all'],
			thickness: this.link['thickness'],
			linkopacity: this.link['linkopacity'],
			link2opacity: this.link['linkopacity'],
			nodesize: this.link['nodesize'],
			color: this.link['color'],
			background: this.link['background'],
			hyperplane: this.link['hyperplane'],
			rotation: this.link['rotation'],
			damping: false,
			dtheta: this.link['dtheta'],
			dpsi: this.link['dpsi'],
			"copy link": function () { guiObj.copyUrl() }
		};

		this.gui.add(this.params, 'shape',
			[ '5-cell', '16-cell', 'tesseract',
				'24-cell', '600-cell', '120-cell', 'dodecahedron' ]
		).onChange(changeShape)
		this.gui.add(this.params, 'inscribed').onChange(changeShape);
		this.gui.add(this.params, 'inscribe_all').onChange(changeShape);
		this.gui.add(this.params, 'hyperplane', 1.5, 2.25);
		this.gui.add(this.params, 'thickness', 0.1, 2);
		this.gui.add(this.params, 'linkopacity', 0, 1).onChange(
			(v) => setLinkOpacity(v, true)
		);
		this.gui.add(this.params, 'link2opacity', 0, 1).onChange(
			(v) => setLinkOpacity(v, false)
		);
		this.gui.add(this.params, 'nodesize', 0.1, 4);
		this.gui.addColor(this.params, 'color').onChange(setColor);
		this.gui.addColor(this.params, 'background').onChange(setBackground);
		this.gui.add(this.params, 'rotation', [ 'rigid', 'tumbling', 'inside-out', 'axisymmetrical' ]);
		this.gui.add(this.params, 'damping');
		this.gui.add(this.params, 'copy link');

	}	


	numParam(param, parser) {
		const value = this.urlParams.get(param);
		if( value ) {
			const n = parser(value);
			if( n !== NaN ) {
				return n;
			}
		}
		return DEFAULTS[param];
	}

	stringToHex(cstr) {
		return parseInt('0x' + cstr.substr(1));
	}

	hexToString(hex) {
		return '#' + hex.toString(16);
	}



	parseLinkParams() {
		this.linkUrl = new URL(window.location.toLocaleString());
		this.link = {};
		const guiObj = this;

		this.urlParams = this.linkUrl.searchParams;
		for( const param of [ "shape", "rotation" ]) {
			const value = this.urlParams.get(param);
			if( value ) {
				this.link[param] = value;
			} else {
				this.link[param] = DEFAULTS[param];
			}
		}
		for( const param of [ "inscribed", "inscribe_all"] ) {
			this.link[param] = ( this.urlParams.get(param) === 'y' );
		}
		this.link['hyperplane'] = this.numParam('hyperplane', parseFloat);
		this.link['thickness'] = this.numParam('thickness', parseFloat);
		this.link['linkopacity'] = this.numParam('linkopacity', parseFloat);
		this.link['link2opacity'] = this.numParam('link2opacity', parseFloat);
		this.link['nodesize'] = this.numParam('nodesize', parseFloat);
		this.link['color'] = this.numParam('color', (s) => guiObj.stringToHex(s));
		this.link['background'] = this.numParam('background', (s) => guiObj.stringToHex(s));
		this.link['dpsi'] = this.numParam('dpsi', parseFloat);
		this.link['dtheta'] = this.numParam('dtheta', parseFloat);
	}


	copyUrl() {
		const url = new URL(this.linkUrl.origin + this.linkUrl.pathname);
		url.searchParams.append("shape", this.params.shape);
		url.searchParams.append("inscribed", this.params.inscribed ? 'y': 'n');
		url.searchParams.append("inscribe_all", this.params.inscribe_all ? 'y': 'n');
		url.searchParams.append("thickness", this.params.thickness.toString());
		url.searchParams.append("nodesize", this.params.nodesize.toString());
		url.searchParams.append("linkopacity", this.params.thickness.toString());
		url.searchParams.append("link2opacity", this.params.nodesize.toString());
		url.searchParams.append("color", this.hexToString(this.params.color));
		url.searchParams.append("background", this.hexToString(this.params.background));
		url.searchParams.append("hyperplane", this.params.hyperplane.toString());
		url.searchParams.append("rotation", this.params.rotation);
		url.searchParams.append("dtheta", this.params.dtheta.toString());
		url.searchParams.append("dpsi", this.params.dpsi.toString());
		this.copyTextToClipboard(url);
	}


	copyTextToClipboard(text) {
 		if (!navigator.clipboard) {
    		this.fallbackCopyTextToClipboard(text);
    		return;
  		}
  		navigator.clipboard.writeText(text).then(function() {
    		console.log('Async: Copying to clipboard was successful!');
  		}, function(err) {
    	console.error('Async: Could not copy text: ', err);
  		});
	}


	fallbackCopyTextToClipboard(text) {
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


}


export { FourDGUI, DEFAULTS };