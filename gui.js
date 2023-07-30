import { GUI } from 'lil-gui';


const DEFAULT_SHAPE = '120-cell';
const DEFAULT_COLOR = 0x3293a9;
const DEFAULT_BG = 0x808080;



class FourDGUI {

	constructor(createShape, setColor, setBackground) {
		this.gui = new GUI();
		this.parseLinkParams();
		const guiObj = this;
		this.params = {
			shape: this.link['shape'] || DEFAULT_SHAPE,
			thickness: this.link['thickness'] || 1,
			color: this.link['color'] || DEFAULT_COLOR,
			background: this.link['background'] || DEFAULT_BG,
			hyperplane: this.link['hyperplane'] || 2,
			xRotate: this.link['xRotate'] || 'YW',
			yRotate: this.link['yRotate'] || 'XZ',
			damping: false,
			dtheta: this.link['dtheta'] || 0,
			dpsi: this.link['dpsi'] || 0,
			"copy link": function () { guiObj.copyUrl() }
		};

		this.gui.add(this.params, 'shape',
			[ '5-cell', '16-cell', 'tesseract', '24-cell', '120-cell', '600-cell' ]
		).onChange(createShape)

		this.gui.add(this.params, 'hyperplane', 1.5, 4);
		this.gui.add(this.params, 'thickness', 0.01, 4);
		this.gui.addColor(this.params, 'color').onChange(setColor);
		this.gui.addColor(this.params, 'background').onChange(setBackground);
		this.gui.add(this.params, 'xRotate', [ 'YW', 'YZ', 'ZW' ]);
		this.gui.add(this.params, 'yRotate', [ 'XZ', 'XY', 'XW' ]);
		this.gui.add(this.params, 'damping');
		this.gui.add(this.params, 'copy link');

	}	


	numParam(param, parser, dft) {
		const value = this.urlParams.get(param);
		if( value ) {
			const n = parser(value);
			if( n !== NaN ) {
				return n;
			}
		}
		return dft;
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

		this.urlParams = this.linkUrl.searchParams;
		for( const param of [ "shape", "xRotate", "yRotate" ]) {
			const value = this.urlParams.get(param);
			if( value ) {
				this.link[param] = value;
			}
		}
		const guiObj = this;
		this.link['hyperplane'] = this.numParam('hyperplane', parseFloat, 2);
		this.link['thickness'] = this.numParam('thickness', parseFloat, 1);
		this.link['color'] = this.numParam(
			'color', (s) => guiObj.stringToHex(s), DEFAULT_COLOR
			);
		this.link['background'] = this.numParam(
			'background', (s) => guiObj.stringToHex(s), DEFAULT_BG
			);

		this.link['dpsi'] = this.numParam('dpsi', parseFloat, 0);
		this.link['dtheta'] = this.numParam('dtheta', parseFloat, 0);
	}


	copyUrl() {
		const url = new URL(this.linkUrl.origin + this.linkUrl.pathname);
		url.searchParams.append("shape", this.params.shape);
		url.searchParams.append("thickness", this.params.thickness.toString());
		url.searchParams.append("color", this.hexToString(this.params.color));
		url.searchParams.append("background", this.hexToString(this.params.background));
		url.searchParams.append("hyperplane", this.params.hyperplane.toString());
		url.searchParams.append("xRotate", this.params.xRotate);
		url.searchParams.append("yRotate", this.params.yRotate);
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


export { FourDGUI };