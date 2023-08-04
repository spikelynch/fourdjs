import ColorScheme from 'color-scheme';

export const get_colours = (basis) => {
	const scheme = new ColorScheme;
	const hexbasis = basis.toString(16).padStart(6, "0");
	scheme.from_hex(hexbasis).scheme("analogic").variation("hard").distance(0.5);
	return scheme.colors().map((cs) => parseInt('0x' + cs));
}

