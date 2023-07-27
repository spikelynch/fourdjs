
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


export function coordinates(a, id0=1, even=false) {
	const ps = even ? permutations_even(a) : permutations(a);
	const coords = [];
	for( const p of ps ) {
		const expanded = expand_sign(p, 0);
		coords.push(...expanded);
	}
	return coords;
}




function scale_and_index(nodes, scale) {
	let i = 1;
	for( const n of nodes ) {
		n["id"] = i;
		i++;
		for( const a of [ 'x', 'y', 'z', 'w' ] ) {
			n[a] = scale * n[a];
		}
	}
	return nodes;
}



function make_120cell_vertices() {
	const phi = 0.5 * (1 + Math.sqrt(5));  
	const r5 = Math.sqrt(5);   
	const phi2 = phi * phi;    
	const phiinv = 1 / phi;    
	const phi2inv = 1 / phi2;  

	const nodes = [
		coordinates([2, 2, 0, 0],  0),
		coordinates([r5, 1, 1, 1], 1),
		coordinates([phi, phi, phi, phi2inv], 2),
		coordinates([phi, phiinv, phiinv, phiinv], 0),

		coordinates([phi2, phi2inv, 1, 0], 1, true),
		coordinates([r5, phiinv, phi, 0], 2, true),
		coordinates([2, 1, phi, phiinv], 0, true),
		].flat();
	return scale_and_index(nodes, 0.5);
}


function dist2(n1, n2) {
	return (n1.x - n2.x) ** 2 + (n1.y - n2.y) ** 2 + (n1.z - n2.z) ** 2 + (n1.w - n2.w) ** 2;
}

function make_120cell_edges(nodes) {
	const seen = {};
	const nnodes = nodes.length;
	const links = [];
	let id = 1;
	for( let i = 0; i < nnodes - 1; i++ ) {
		const d2 = [];
		for( let j = 0; j < nnodes; j++ ) {
			d2.push({ d2: dist2(nodes[i], nodes[j]), id: j });
		}
		d2.sort((a, b) => b.d2 - a.d2);
		const closest = d2.slice(1, 4);
		for( const e in closest ) {
			const ids = [ nodes[i].id, e.id ];
			ids.sort();
			const fp = ids.join(',');
			if( !seen[fp] ) {
				seen[fp] = true;
				links.push({ id: id, label: 0, source: nodes[i].id, target: e.id });
				id++;
			}
		}
	}
	return links;
}


const nodes  = make_120cell_vertices();
const links = make_120cell_edges(nodes);

console.log(links);