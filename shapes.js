const r5 = Math.sqrt(5);


export const CELL5 = {
	nodes: [
      {id:1, x: 1, y: 1, z: 1, w: -1 / r5 },
      {id:2, x: 1, y: -1, z: -1, w: -1 / r5 },
      {id:3, x: -1, y: 1, z: -1, w: -1 / r5 },
      {id:4, x: -1, y: -1, z: 1, w: -1 / r5 },
      {id:5, x: 0, y: 0, z: 0, w: 4 / r5 },
	],
	links: [
		{ id:1, source:1, target: 2},
		{ id:2, source:1, target: 3},
		{ id:3, source:1, target: 4},
		{ id:4, source:1, target: 5},
		{ id:5, source:2, target: 3},
		{ id:6, source:2, target: 4},
		{ id:7, source:2, target: 5},
		{ id:8, source:3, target: 4},
		{ id:9, source:3, target: 5},
		{ id:10, source:4, target: 5},
		]

	};


export const CELL16 = {
	nodes: [
		{ id: 1, x: 0, y: -1, z: 0, w: 0 },
		{ id: 2, x: 0, y: 0, z: -1, w: 0 },
		{ id: 3, x: -1, y: 0, z: 0, w: 0 },
		{ id: 4, x: 0, y: 0, z: 1, w: 0 },
		{ id: 5, x: 1, y: 0, z: 0, w: 0 },
		{ id: 6, x: 0, y: 1, z: 0, w: 0 },
		{ id: 7, x: 0, y: 0, z: 0, w: -1 },
		{ id: 8, x: 0, y: 0, z: 0, w: 1 },
	],
	links: [
		{ id: 1, source: 1, target: 2 },
		{ id: 2, source: 1, target: 3 },
		{ id: 3, source: 1, target: 4 },
		{ id: 4, source: 1, target: 5 },
		{ id: 5, source: 2, target: 3 },
		{ id: 6, source: 3, target: 4 },
		{ id: 7, source: 4, target: 5 },
		{ id: 8, source: 5, target: 2 },
		{ id: 9, source: 2, target: 6 },
		{ id: 10, source: 3, target: 6 },
		{ id: 11, source: 4, target: 6 },
		{ id: 12, source: 5, target: 6 },
		{ id: 13, source: 1, target: 7 },
		{ id: 14, source: 1, target: 8 },
		{ id: 15, source: 2, target: 7 },
		{ id: 16, source: 2, target: 8 },
		{ id: 17, source: 3, target: 7 },
		{ id: 18, source: 3, target: 8 },
		{ id: 19, source: 4, target: 7 },
		{ id: 20, source: 4, target: 8 },
		{ id: 21, source: 5, target: 7 },
		{ id: 22, source: 5, target: 8 },
		{ id: 23, source: 6, target: 7 },
		{ id: 25, source: 6, target: 8 },
	]
};


export const TESSERACT = {
	nodes: [
		{ id: 1,  x: -1, y: -1, z: -1, w: -1 },
		{ id: 2,  x:  1, y: -1, z: -1, w: -1 },
		{ id: 3,  x: -1, y:  1, z: -1, w: -1 },
		{ id: 4,  x:  1, y:  1, z: -1, w: -1 },
		{ id: 5,  x: -1, y: -1, z:  1, w: -1 },
		{ id: 6,  x:  1, y: -1, z:  1, w: -1 },
		{ id: 7,  x: -1, y:  1, z:  1, w: -1 },
		{ id: 8,  x:  1, y:  1, z:  1, w: -1 },
		{ id: 9,  x: -1, y: -1, z: -1, w:  1 },
		{ id: 10, x:  1, y: -1, z: -1, w:  1 },
		{ id: 11, x: -1, y:  1, z: -1, w:  1 },
		{ id: 12, x:  1, y:  1, z: -1, w:  1 },
		{ id: 13, x: -1, y: -1, z:  1, w:  1 },
		{ id: 14, x:  1, y: -1, z:  1, w:  1 },
		{ id: 15, x: -1, y:  1, z:  1, w:  1 },
		{ id: 16, x:  1, y:  1, z:  1, w:  1 },
	],
	links: [
		{ id: 1, source: 1, target: 2 },
		{ id: 2, source: 2, target: 4 },
		{ id: 3, source: 4, target: 3 },
		{ id: 4, source: 3, target: 1 },
		{ id: 5, source: 5, target: 6 },
		{ id: 6, source: 6, target: 8 },
		{ id: 7, source: 8, target: 7 },
		{ id: 8, source: 7, target: 5 },
		{ id: 9, source: 1, target: 5 },
		{ id: 10, source: 2, target: 6 },
		{ id: 11, source: 3, target: 7 },
		{ id: 12, source: 4, target: 8 },

		{ id: 13, source: 9, target: 10 },
		{ id: 14, source: 10, target: 12 },
		{ id: 15, source: 12, target: 11 },
		{ id: 16, source: 11, target: 9 },
		{ id: 17, source: 13, target: 14 },
		{ id: 18, source: 14, target: 16 },
		{ id: 19, source: 16, target: 15 },
		{ id: 20, source: 15, target: 13 },
		{ id: 21, source: 9, target: 13 },
		{ id: 22, source: 10, target: 14 },
		{ id: 23, source: 11, target: 15 },
		{ id: 24, source: 12, target: 16 },

		{ id: 25, source: 1, target: 9 },
		{ id: 26, source: 2, target: 10 },
		{ id: 27, source: 3, target: 11 },
		{ id: 28, source: 4, target: 12 },
		{ id: 29, source: 5, target: 13 },
		{ id: 30, source: 6, target: 14 },
		{ id: 31, source: 7, target: 15 },
		{ id: 32, source: 8, target: 16 },


	]
};

// this was done manually and I'm not sure if it's right

const CELL24_INDEXING = {
	x: { y: 'RED', z: 'BLUE', w: 'GREEN' },
	y: { z: 'GREEN', w: 'BLUE' },
	z: { w: 'RED' } 
};

function make_24cell_vertices() {
	const axes = [ 'x', 'y', 'z', 'w' ];
	const nodes = [];
	let i = 1;
	for ( let p = 0; p < 3; p++ ) {
		for ( let q = p + 1; q < 4; q++ ) {
			const a1 = axes[p];
			const a2 = axes[q];
			const label = CELL24_INDEXING[a1][a2];
			for ( const v1 of [ -1, 1 ] ) {
				for ( const v2 of [ -1, 1 ] ) {
					const node = {
						id: i,
						x: 0, y: 0, z: 0, w:0,
						label: label
					};
					node[a1] = v1;
					node[a2] = v2;
					nodes.push(node);
					i++;
				}
			}
		}
	}
	return nodes;
}



function node_axes(n1) {
	return [ 'x', 'y', 'z', 'w' ].filter((a) => n1[a] !== 0 );
}

function make_24cell_edges(nodes) {
	const seen = {};
	const links = [];
	let id = 1;
	for( const n1 of nodes ) {
		const axes = node_axes(n1);
		const axeq = nodes.filter((n) => n[axes[0]] === n1[axes[0]] && n[axes[1]] === 0);
		const axeq2 = nodes.filter((n) => n[axes[1]] === n1[axes[1]] && n[axes[0]] === 0);
		for( const n2 of axeq.concat(axeq2) ) {
			const ids = [ n1.id, n2.id ];
			ids.sort();
			const fp = ids.join(',');
			if( !seen[fp] ) {
				seen[fp] = true;
				links.push({ id: id, source: n1.id, target: n2.id });
			}
		}
	}
	return links;
}

export const cell24 = () => {
	const nodes = make_24cell_vertices();
	const links = make_24cell_edges(nodes);

	return { nodes: nodes, links: links, labels: [ "RED", "GREEN", "BLUE" ] };
}

