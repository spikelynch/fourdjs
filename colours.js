import ColorScheme from 'color-scheme';

export const get_colours = () => {
	var scheme = new ColorScheme;
	scheme.from_hue(21).scheme('triade').variation('soft');
	return scheme.colors().map((cs) => parseInt('0x' + cs));
}

