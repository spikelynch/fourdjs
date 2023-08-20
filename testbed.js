
//testbed for playing with stuff in node repl

const THREE =require('three');

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
//	scale_nodes(nodes, 0.5);
	return nodes;
}



// face detection for the 120-cell

// NOTE: all of these return node ids, not nodes

// return all the links which connect to a node

function nodes_links(links, nodeid) {
	return links.filter((l) => l.source === nodeid || l.target === nodeid);
}

// filter to remove a link to a given id from a set of links

function not_to_this(link, nodeid) {
	return !(link.source === nodeid || link.target === nodeid);
}

// given nodes n1, n2, return all neighbours of n2 which are not n1

function unmutuals(links, n1id, n2id) {
	const nlinks = nodes_links(links, n2id).filter((l) => not_to_this(l, n1id));
	return nlinks.map((l) => {
		if( l.source === n2id ) {
			return l.target;
		} else {
			return l.source;
		}
	})
}


function fingerprint(ids) {
	const sids = [...ids];
	sids.sort();
	return sids.join(',');
}



function auto_120cell_faces(links) {
	const faces = [];
	const seen = {};
	let id = 1;
	for( const edge of links ) {
		const v1 = edge.source;
		const v2 = edge.target;
		const n1 = unmutuals(links, v2, v1);
		const n2 = unmutuals(links, v1, v2);
		const shared = [];
		for( const a of n1 ) {
			const an = unmutuals(links, v1, a);
			for( const d of n2 ) {
				const dn = unmutuals(links, v2, d);
				for( const x of an ) {
					for( const y of dn ) {
						if( x == y ) {
							shared.push([v1, a, x, d, v2])
						}
					}
				}
			}
		}
		if( shared.length !== 3 ) {
			console.log(`Bad shared faces for ${edge.id} ${v1} ${v2}`);
		}
		for( const face of shared ) {
			const fp = fingerprint(face);
			if( !seen[fp] ) {
				faces.push({ id: id, edge: edge.id, v1: edge.source, v2: edge.target, fingerprint: fp, nodes: face });
				id++;
				seen[fp] = true;
			}
		}
	}
	return faces;
}


// trying to go from faces to dodecahedra

function shared_vertices(f1, f2) {
	return f1.nodes.filter((f) => f2.nodes.includes(f));	
}


function adjacent_faces(f1, f2) {
	// adjacent faces which share an edge, not just a vertex
	const intersect = shared_vertices(f1, f2);
	if( intersect.length < 2 ) {
		return false;
	}
	if( intersect.length > 2 ) {
		console.log(`warning: faces ${f1.id} and ${f2.id} have too many common vertices`);
	}
	return true;
}


function find_adjacent_faces(faces, face) {
	const neighbours = faces.filter((f) => f.id !== face.id && adjacent_faces(f, face));
	return neighbours;
}




function find_dodeca_mutuals(faces, f1, f2) {
	// for any two adjacent faces, find their common neighbours where
	// all three share exactly one vertex (this, I think, guarantees that
	// all are on the same dodecahedron)

	const n1 = find_adjacent_faces(faces, f1);
	const n2 = find_adjacent_faces(faces, f2);
	const common =  n1.filter((f1) => n2.filter((f2) => f1.id === f2.id).length > 0 );
	// there's one extra here - the third which has two nodes in common with
	// both f1 and f2 - filter it out 
	const mutuals = common.filter((cf) => {
		const shared = cf.nodes.filter((n) => f1.nodes.includes(n) && f2.nodes.includes(n));
		return shared.length === 1
	});
	return mutuals;
}

function find_dodeca_next(faces, dodeca, f1, f2) {
	// of a pair of mutuals, return the one we haven't already got
	const m = find_dodeca_mutuals(faces, f1, f2);
	if( dodeca.filter((f) => f.id === m[0].id ).length > 0 ) {
		m.shift();
	}
	return m[0];
}

// from any two mutual faces, return all the faces in their dodecahedron

function make_dodecahedron(faces, f1, f2) {
	const dodecahedron = [ f1, f2 ];

	// take f1 as the 'center', get the other four around it from f2
	const fs = find_dodeca_mutuals(faces, f1, f2);
	const f3 = fs[0];
	const f6 = fs[1];
	dodecahedron.push(f3);
	const f4 = find_dodeca_next(faces, dodecahedron, f1, f3);
	dodecahedron.push(f4);
	const f5 = find_dodeca_next(faces, dodecahedron, f1, f4);
	dodecahedron.push(f5);
	dodecahedron.push(f6);

	// get the next ring

	const f7 = find_dodeca_next(faces, dodecahedron, f6, f2);
	dodecahedron.push(f7);
	const f8 = find_dodeca_next(faces, dodecahedron, f2, f3);
	dodecahedron.push(f8);
	const f9 = find_dodeca_next(faces, dodecahedron, f3, f4);
	dodecahedron.push(f9);
	const f10 = find_dodeca_next(faces, dodecahedron, f4, f5);
	dodecahedron.push(f10);
	const f11 = find_dodeca_next(faces, dodecahedron, f5, f6);
	dodecahedron.push(f11);

	// get the last

	const f12 = find_dodeca_next(faces, dodecahedron, f7, f8);
	dodecahedron.push(f12);

	return dodecahedron;
}


// for a face, pick an edge, and then find the other two faces which
// share this edge. These can be used as the starting points for the
// first face's two dodecahedra 

function find_edge_neighbours(faces, face) {
	const n1 = face.nodes[0];
	const n2 = face.nodes[1];
	return faces.filter((f) => f.id !== face.id && f.nodes.includes(n1) && f.nodes.includes(n2));
}


// each face is in two dodecahedra: this returns them both

function face_to_dodecahedra(faces, f) {
	const edge_friends = find_edge_neighbours(faces, f);
	const d1 = make_dodecahedron(faces, f, edge_friends[0]);
	const d2 = make_dodecahedron(faces, f, edge_friends[1]);
	return [ d1, d2 ];
}

// brute-force calculation of all dodecahedra 

function dd_fingerprint(dodecahedron) {
	const ids = dodecahedron.map((face) => face.id);
	ids.sort()
	return ids.join(',');
}

function make_120cell_cells(faces) {
	const dodecas = [];
	const seen = {};
	for( const face of faces ) {
		const dds = face_to_dodecahedra(faces, face);
		for( const dd of dds ) {
			const fp = dd_fingerprint(dd);
			if( ! (fp in seen) ) {
				console.log(`added dodeca ${fp}`);
				dodecas.push(dd);
				seen[fp] = 1;
			}
		}
	}
	return dodecas;
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





const nodes = make_120cell_vertices();
const links = auto_detect_edges(nodes, 4);
const faces = auto_120cell_faces(links);

