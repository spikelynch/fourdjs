import ColorScheme from 'color-scheme';

export const get_colours = (basis) => {
	const scheme = new ColorScheme;
	const hexbasis = basis.toString(16).padStart(6, "0");
	scheme.from_hex(hexbasis).scheme("tetrade").variation("hard").distance(0.5);
	return scheme.colors().map((cs) => parseInt('0x' + cs));
}

export const get_plain_colours = (basis) => {
	return [
		basis,
		0xffffff,
		0x00ff00,
		0xff0000,
		0x0000ff,
		0xff9900,
		0x000000,
		]
}