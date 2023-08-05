
// Utilities for generating sets of coordinates based on 
// permutations, even permutations and changes of sign.
// Based on https://www.qfbox.info/epermute


function pandita(a) {
	const n = a.length;
	for( let k = n - 2; k >= 0; k-- ) {
		if( a[k] < a[k + 1] ) {
			for( let l = n - 1; l >= 0; l-- ) {
				if( a[k] < a[l] ) {
					const tmp = a[k];
					a[k] = a[l];
					a[l] = tmp;
					const revtail = a.slice(k + 1);
					revtail.reverse();
					for( let i = 0; i < revtail.length; i++ ) {
						a[k + 1 + i] = revtail[i];
					}
					return Math.floor(revtail.length / 2) + 1;
				}
			}
			console.log("Shouldn't get here");
			process.exit();
		}
	}
	return false;
}

function permutations_old(a) {
	a.sort();
	const ps = [ [...a] ];
	let running = true;
	while( running ) {
		const s = pandita(a);
		if( s ) {
			ps.push([...a]);
		} else {
			running = false;
		}
	}
	return ps;
}

function permutations(a) {
	a.sort();
	const ps = [ [...a] ];
	let running = true;
	while( pandita(a) > 0 ) {
		ps.push([...a]);
	}
	return ps;
}


function permutations_even(a) {
	a.sort();
	let parity = 'even';
	const ps = [ [...a] ];
	let running = true;
	while( running ) {
		const s = pandita(a);
		if( s ) {
			if( parity === 'even' ) {
				if( s % 2 === 1 ) {
					parity = 'odd';
				}
			} else {
				if( s % 2 === 1 ) {
					parity = 'even';
				}
			}
			if( parity === 'even' ) {
				ps.push([...a]);
			}
		} else {
			running = false;
		}
	}
	return ps;
}

// for a given permutation, say [ 1, 1, 0, 0 ], return all
// of the valid changes of sign, so:
// [ [1, 1, 0, 0 ], [ -1, 1, 0, 0 ], [ 1, -1, 0, 0 ], [-1, -1, 0, 0 ]]
// ie don't do it on the zeros

function expand_sign(a, label) {
	const expanded = [];
	const exv = a.map((v) => v ? [ -v, v ] : [ 0 ]);
	for( const xv of exv[0] ) {
		for( const yv of exv[1] ) {
			for( const zv of exv[2] ) {
				for( const wv of exv[3] ) {
					expanded.push({label: label, x: xv, y:yv, z:zv, w:wv});
				}
			}
		}
	}
	return expanded;
}


function coordinates(a, id0=1, even=false) {
	const ps = even ? permutations_even(a) : permutations(a);
	const coords = [];
	for( const p of ps ) {
		const expanded = expand_sign(p, 0);
		coords.push(...expanded);
	}
	return coords;
}



function index_nodes(nodes, scale) {
	let i = 1;
	for( const n of nodes ) {
		n["id"] = i;
		i++;
	}
}

function scale_nodes(nodes, scale) {
	for( const n of nodes ) {
		for( const a of [ 'x', 'y', 'z', 'w' ] ) {
			n[a] = scale * n[a];
		}
	}
}

function dist2(n1, n2) {
	return (n1.x - n2.x) ** 2 + (n1.y - n2.y) ** 2 + (n1.z - n2.z) ** 2 + (n1.w - n2.w) ** 2;
}

function auto_detect_edges(nodes, neighbours, debug=false) {
	const seen = {};
	const nnodes = nodes.length;
	const links = [];
	let id = 1;
	for( const n1 of nodes ) {
		const d2 = [];
		for( const n2 of nodes ) {
			d2.push({ d2: dist2(n1, n2), id: n2.id });
		}
		d2.sort((a, b) => a.d2 - b.d2);
		const closest = d2.slice(1, neighbours + 1);
		if( debug ) {
			console.log(`closest = ${closest.length}`);
			console.log(closest);
		}
		for( const e of closest ) {
			const ids = [ n1.id, e.id ];
			ids.sort();
			const fp = ids.join(',');
			if( !seen[fp] ) {
				seen[fp] = true;
				links.push({ id: id, label: 0, source: n1.id, target: e.id });
				id++;
			}
		}
	}
	if( debug ) {
		console.log(`Found ${links.length} edges`)
	}
	return links;
}

// too small and simple to calculate

const cell5 = () => {
	const r5 = Math.sqrt(5);
	const r2 = Math.sqrt(2) / 2;
	return {
		nodes: [
	      {id:1, x: r2, y: r2, z: r2, w: -r2 / r5 },
	      {id:2, x: r2, y: -r2, z: -r2, w: -r2 / r5 },
	      {id:3, x: -r2, y: r2, z: -r2, w: -r2 / r5 },
	      {id:4, x: -r2, y: -r2, z: r2, w: -r2 / r5 },
	      {id:5, x: 0, y: 0, z: 0, w: 4 * r2 / r5 },
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
		],
		geometry: {
			node_size: 0.02,
			link_size: 0.02
		}
	};
};


const cell16 = () => {
	let nodes = coordinates([1, 1, 1, 1],  0);
	nodes = nodes.filter((n) => n.x * n.y * n.z * n.w > 0);
	index_nodes(nodes);
	scale_nodes(nodes, 0.75);
	const links = auto_detect_edges(nodes, 6);

	return {
		nodes: nodes,
		links: links,
		geometry: {
			node_size: 0.02,
			link_size: 0.02
		}
	};
};



const tesseract = () => {
	const nodes = coordinates([1, 1, 1, 1],  0);
	index_nodes(nodes);
	scale_nodes(nodes, Math.sqrt(2) / 2);
	const links = auto_detect_edges(nodes, 4);

	return {
		nodes: nodes,
		links: links,
		geometry: {
			node_size: 0.02,
			link_size: 0.02
		}
	};
}




const cell24 = () => {
	const nodes = coordinates([0, 0, 1, 1], 0);
	index_nodes(nodes);
	const links = auto_detect_edges(nodes, 6);

	return {
		nodes: nodes,
		links: links,
		geometry: {
			node_size: 0.02,
			link_size: 0.02
		}
	};
}




function make_120cell_vertices() {
	const phi = 0.5 * (1 + Math.sqrt(5));  
	const r5 = Math.sqrt(5);   
	const phi2 = phi * phi;    
	const phiinv = 1 / phi;    
	const phi2inv = 1 / phi2;  

	const nodes = [
		coordinates([0, 0, 2, 2],  0),
		coordinates([1, 1, 1, r5], 0),
		coordinates([phi, phi, phi, phi2inv], 0),
		coordinates([phiinv, phiinv, phiinv, phi2], 0),

		coordinates([phi2, phi2inv, 1, 0], 0, true),
		coordinates([r5, phiinv, phi, 0], 0, true),
		coordinates([2, 1, phi, phiinv], 0, true),
		].flat();
	index_nodes(nodes);
	scale_nodes(nodes, 0.5);
	return nodes;
}


const cell120 = () => {
	const nodes  = make_120cell_vertices();
	const links = auto_detect_edges(nodes, 4);
	return {
		nodes: nodes,
		links: links,
		geometry: {
			node_size: 0.02,
			link_size: 0.02
		}

	}
}




function make_600cell_vertices() {
	const phi = 0.5 * (1 + Math.sqrt(5));  

	const nodes = [
		coordinates([0, 0, 0, 2],  0),
		coordinates([1, 1, 1, 1],  1),

		coordinates([phi, 1, 1 / phi, 0], 1, true)
		].flat();

	index_nodes(nodes);
	return nodes;
}


function find_peers(nodesid, seen, n, d) {
	const EPSILON = 0.02;
	console.log(`find_peers ${n} (already seen ${seen})`)
	return Object.keys(nodesid).filter((n1) => {
		if( seen.includes(n1) ) {
			return false;
		}
		const d2 = dist2(nodesid[n1], nodesid[n]);
		return Math.abs(d2 - d ** 2) < EPSILON;
	});
}


function peer(n1, n2, d) {
	const d2 = dist2(n1, n2);
	const EPSILON = 0.01;
	return Math.abs(d2 - d ** 2) < EPSILON;
}


function partition_nodes_by_distance(nodes, d) {
	const groups = [];
	const nodesid = {};
	const EPSILON = 0.005;

	for( const node of nodes ) {
		nodesid[node.id] = node;
	}
	let tick = 0;
	while( Object.keys(nodesid).length > 0 ) {
		const start = Object.keys(nodesid)[0];
		console.log(`Start node = ${start}`);
		const group = [ start ];
		for( const n2 of Object.keys(nodesid) ) {
			console.log(`group [ ${group} ] / n2 ${n2}`);
			const n3 = [];
			if( !group.includes(n2) ) {
				console.log(`group: ${group}`);
				for( const g of group ) {
					if( peer(nodesid[g], nodesid[n2], d) ) {
						console.log(`Match`);
						//n3.push(n2);
					}
				}
			}
			console.log(`n3 = ${n3}`);
			group.push(...n3);
		}
		process.exit();
		for( const g of group ) {
			delete nodesid[g];
		}
		groups.push(group);
		console.log(`Added group ${group}`);
	}
	return groups;
}





const cell600 = () => {
	const nodes  = make_600cell_vertices();
	const links = auto_detect_edges(nodes, 12);
	return {
		nodes: nodes,
		links: links,
		geometry: {
			node_size: 0.08,
			link_size: 0.02
		}
	}
}


const nodes = make_600cell_vertices();

