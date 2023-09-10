import ColorScheme from 'color-scheme';

export const get_colours = (basis) => {
	const scheme = new ColorScheme;
	const hexbasis = basis.toString(16).padStart(6, "0");
	scheme.from_hex(hexbasis).scheme("tetrade").variation("hard").distance(0.5);
	const colours = scheme.colors().map((cs) => parseInt('0x' + cs));
	const set = colours.slice(1, 6);
	set.reverse();
	set.unshift(colours[0]);
	return set;
}

// basic colours where 0 = blue
// 1 - dark blue
// 2 - white
// 3 - light cyan
// 4 - light orange
// 5 - dark orange

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