
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


function faces_to_dodecahedron(faces, f1, f2, flip=false) {
	const dodecahedron = [ f1, f2 ];

	// take f1 as the 'center', get the other four around it from f2
	const fs = find_dodeca_mutuals(faces, f1, f2);
	const f3 = flip ? fs[1] : fs[0];
	const f6 = flip ? fs[0] : fs[1];
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

// from a face and one neighbouring node, return a dodecahedron
// Set 'flip' to true if we're coming to this dodecahedron from a
// face on a previous one so that the chirality doesn't get inverted

function face_plus_to_dodecahedron(faces, f1, node, flip=false) {
	const neighbours = find_adjacent_faces(faces, f1);
	const nodens = neighbours.filter((f) => f.nodes.includes(node));
	return faces_to_dodecahedron(faces, f1, nodens[0], flip); // does it matter which?
}




// for three faces, return their common vertex (if they have one)

function find_dodeca_vertex(f1, f2, f3) {
	const v12 = f1.nodes.filter((n) => f2.nodes.includes(n));
	const v123 = v12.filter((n) => f3.nodes.includes(n));
	if( v123.length === 1 ) {
		return v123[0];
	} else {
		console.log(`warning: faces ${f1.id} ${f2.id} ${f3.id} don't share 1 vertex`);
		return false;
	}
}

const VERTEX_MAP = [
	[ 0, 1, 5 ],
	[ 0, 1, 2 ],
	[ 0, 2, 3 ],
	[ 0, 3, 4 ],
	[ 0, 4, 5 ],
	[ 1, 5, 6 ],
	[ 1, 2, 7 ],
	[ 2, 3, 8 ],
	[ 3, 4, 9 ],
	[ 4, 5, 10 ],
	[ 1, 6, 7 ],
	[ 2, 7, 8 ],
	[ 3, 8, 9 ],
	[ 4, 9, 10 ],
	[ 5, 6, 10 ],
	[ 6, 7, 11 ],
	[ 7, 8, 11 ],
	[ 8, 9, 11 ],
	[ 9, 10, 11 ],
	[ 6, 10, 11 ],
];



function dodecahedron_vertices(faces) {
	const face_sets = VERTEX_MAP.map((vs) => vs.map((v) => faces[v]));
	return face_sets.map((fs) => find_dodeca_vertex(...fs));
}

// p is the permutation of the first face

function dodecahedron_colours(vertices, p) {
	const LEFT_PART = [
		1, 2, 3, 4, 5,   3, 4, 5, 1, 2,   5, 1, 2, 3, 4,   2, 3, 4, 5, 1,
		];
	const RIGHT_PART = [
		1, 2, 3, 4, 5,   4, 5, 1, 2, 3,   3, 4, 5, 1, 2,   1, 2, 3, 4, 5,
		];
	const part = LEFT_PART;
	const colours = {};
	for( let i = 0; i < 20; i++ ) {
		const v = vertices[i];
		const colour = p[part[i] - 1];
		colours[v] = colour;
	}
	return colours;
}


// p is the permutation of the first face

function colour_dodecahedron_from_face(dd, p) {
	const vertices = dodecahedron_vertices(dd);
	return dodecahedron_colours(vertices, p);
}

// from a dodecahedron and a face, get the adjoining dodecahedron

function follow_face_to_dodeca(faces, startdd, nextf, flip=false) {
	const neighbours = find_adjacent_faces(faces, nextf);
	const nextnbors = neighbours.filter((f) => !startdd.includes(f));
	return faces_to_dodecahedron(faces, nextf, nextnbors[0], flip);
}


function find_edges(links, nid) {
	return links.filter((l) => l.source === nid || l.target === nid );
}


function find_adjacent_nodes(links, nid) {
	return find_edges(links, nid).map((l) => {
		if( l.source === nid ) {
			return l.target;
		} else {
			return l.source;
		}
	});
}

function node_by_id(nodes, nid) {
	const ns = nodes.filter((n) => n.id === nid);
	return ns[0];
}



function find_adjacent_labels(nodes, links, nid) {
	return find_adjacent_nodes(links, nid).map(
		(nid) => node_by_id(nodes, nid).label 
	);
}



function colour_next_dodeca_maybe(nodes, links, faces, colours, dd, nextf, nextdd) {
	const lastvs = dodecahedron_vertices(dd);
	const nextvs = dodecahedron_vertices(nextdd);
	// get the initial colour permutations from the existing labels;
	const p = [];
	for( i = 0; i < 5; i ++ ) {
		p[i] = colours[nextvs[i]];
	}
	const nlabels = colour_dodecahedron_from_face(nextdd, p);
	// check if this is inconsistent with the original dd
	const n = nextf.nodes[0];
	const nbors = find_adjacent_nodes(links, n);
	const nextns = nbors.filter((n) => !lastvs.includes(n));
	const lastns = nbors.filter((n) => !nextvs.includes(n));
	const lastcol = colours[lastns[0]];
	const nextcol = nlabels[nextns[0]];
	if( lastcol === nextcol ) {
		// one node in the adjoining face has two same-coloured neighbours
		// console.log('chirality mismatch');
		// console.log(`   test node ${n}`);
		// console.log(`   neighbours ${lastns[0]} ${nextns[0]}`);
		return false;
	}
	return nlabels;
}






function meridian(nodes, links, faces, startf, startn, dir=11, max=10) {
	const o =  face_plus_to_dodecahedron(faces, startf, startn);

	const colours = colour_dodecahedron_from_face(o, [ 1, 2, 3, 4, 5 ] );

	const dds = follow_meridian(nodes, links, faces, colours, o, dir, max);

	const labels = { 1: [], 2:[], 3:[], 4:[], 5:[] };
	for( const vstr in colours ) {
		labels[colours[vstr]].push(Number(vstr));
	}

	return { dodecahedra: dds, labels: labels };

}


function all_meridians(nodes, links, faces, startf, startn) {
	const o =  face_plus_to_dodecahedron(faces, startf, startn);

	const colours = colour_dodecahedron_from_face(o, [ 1, 2, 3, 4, 5 ] );

	// first meridian 
	const dds = follow_meridian(nodes, links, faces, colours, o, 11, 10);
	for ( const f of [ 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 ] ) {
		follow_meridian(nodes, links, faces, colours, o, f, 4);
	}

	const labels = { 1: [], 2:[], 3:[], 4:[], 5:[] };
	for( const vstr in colours ) {
		labels[colours[vstr]].push(Number(vstr));
	}

	return labels;

}




// go along a meridian
// modifies colours 

function follow_meridian(nodes, links, faces, colours, odd, dir, max) {
	let ncolours = {};
	const dds = [ odd ];
	while( ncolours && dds.length < max ) {
		const dd = dds[dds.length - 1];
		const nextf = dds.length === 1 ? dd[dir] : dd[11]; 

		let nextdd = follow_face_to_dodeca(faces, dd, nextf);
		ncolours = colour_next_dodeca_maybe(nodes, links, faces, colours, dd, nextf, nextdd);

		if( !ncolours ) {
			nextdd = follow_face_to_dodeca(faces, dd, nextf, true);
			ncolours = colour_next_dodeca_maybe(nodes, links, faces, colours, dd, nextf, nextdd);
			if( !ncolours ) {
				console.log("*** two mismatches");
			}
		}

		for( const vertex in ncolours ) {
			if( vertex in colours ) {
				if( colours[vertex] !== ncolours[vertex] ) {
					console.log(`*** label mismatch at ${vertex}: ${colours[vertex]}/${ncolours[vertex]}`);
				}
			} else {
				colours[vertex] = ncolours[vertex];
			}
		}
		dds.push(nextdd);
	}
	return dds;
}


function follow_and_colour(nodes, links, faces, colours, dd, face) {
	let nextdd = follow_face_to_dodeca(faces, dd, face);
	let ncolours = colour_next_dodeca_maybe(nodes, links, faces, colours, dd, face, nextdd);

	if( !ncolours ) {
		nextdd = follow_face_to_dodeca(faces, dd, face, true);
		ncolours = colour_next_dodeca_maybe(nodes, links, faces, colours, dd, face, nextdd);
		if( !ncolours ) {
			console.log("two mismatches");
		}
	}
	return [ nextdd, ncolours ];
}


function add_colours(colours, ncolours) {
	for( const vertex in ncolours ) {
		if( vertex in colours ) {
			if( colours[vertex] !== ncolours[vertex] ) {
				console.log(`label mismatch at ${vertex}: ${colours[vertex]}/${ncolours[vertex]}`);
			}
		} else {
			colours[vertex] = ncolours[vertex];
		}
	}
}


// "arctic circle" - this one works

function arctic(nodes, links, faces, startf, startn, max) {
	console.log(startf);
	const pole = face_plus_to_dodecahedron(faces, startf, startn);
	const dds = [ pole ];
	// colour first cell

	const colours = colour_dodecahedron_from_face(dds[0], [ 1, 2, 3, 4, 5 ] );
	const vs = dodecahedron_vertices(dds[0]);

	let ncolours = {};

	for( const face of pole ) {

		let nextdd = follow_face_to_dodeca(faces, pole, face);
		ncolours = colour_next_dodeca_maybe(nodes, links, faces, colours, pole, face, nextdd);

		if( !ncolours ) {
			nextdd = follow_face_to_dodeca(faces, pole, face, true);
			ncolours = colour_next_dodeca_maybe(nodes, links, faces, colours, pole, face, nextdd);
			if( !ncolours ) {
				console.log("two mismatches");
			}
		}
		for( const vertex in ncolours ) {
			if( vertex in colours ) {
				if( colours[vertex] !== ncolours[vertex] ) {
					console.log(`label mismatch at ${vertex}: ${colours[vertex]}/${ncolours[vertex]}`);
				}
			} else {
				colours[vertex] = ncolours[vertex];
			}
		}
		dds.push(nextdd);
	}


	const labels = { 1: [], 2:[], 3:[], 4:[], 5:[] };
	for( const vstr in colours ) {
		labels[colours[vstr]].push(Number(vstr));
	}


	return { dodecahedra: dds, labels: labels };



}




function arctic_two(nodes, links, faces, startf, startn) {
	const pole = face_plus_to_dodecahedron(faces, startf, startn);
	const dds = [ pole ];

	const seen = {};
	seen[dd_fingerprint(pole)] = true;

	const colours = colour_dodecahedron_from_face(dds[0], [ 1, 2, 3, 4, 5 ] );
	const vs = dodecahedron_vertices(dds[0]);

	for( const face of pole ) {
		const [ nextdd, ncolours ] = follow_and_colour(
			nodes, links, faces, colours, pole, face
		);
		add_colours(colours, ncolours);
		dds.push(nextdd);
		seen[dd_fingerprint(nextdd)] = true;
	}

	// go around all of the arctic circle and grow all faces

    // 1, 12, 20, 12, 30 = 75
    // 0  1   13, 33, 45

	for( const a of dds.slice(1, 13) ) {
		for( const i of [ 6, 7, 8, 9, 10 ] ) {
			const [ nextdd, ncolours ] = follow_and_colour(
				nodes, links, faces, colours, a, a[i]
			);
			const fp = dd_fingerprint(nextdd);
			if( !(fp in seen) ) {
				add_colours(colours, ncolours);
				dds.push(nextdd);
				seen[fp] = true;
			}
		}
	}

	// meridians = 45

	for( const a of dds.slice(1, 13) ) {
		const [ nextdd, ncolours ] = follow_and_colour(
			nodes, links, faces, colours, a, a[11]
		);
		const fp = dd_fingerprint(nextdd);
		if( !(fp in seen) ) {
			add_colours(colours, ncolours);
			dds.push(nextdd);
			seen[fp] = true;
		}
	}

	// the 30 equatorials?
	for( const a of dds.slice(13, 46) ) {
		for( const i of [ 6, 7, 8, 9, 10 ] ) {
			const [ nextdd, ncolours ] = follow_and_colour(
				nodes, links, faces, colours, a, a[i]
			);
			const fp = dd_fingerprint(nextdd);
			if( !(fp in seen) ) {
				add_colours(colours, ncolours);
				dds.push(nextdd);
				seen[fp] = true;
			}
		}
	}

	for( const a of dds.slice(33, 76) ) {
		for( const i of [ 6, 7, 8, 9, 10 ] ) {
			const [ nextdd, ncolours ] = follow_and_colour(
				nodes, links, faces, colours, a, a[i]
			);
			const fp = dd_fingerprint(nextdd);
			if( !(fp in seen) ) {
				add_colours(colours, ncolours);
				dds.push(nextdd);
				seen[fp] = true;
			}
		}
	}

	// this should get the rest or explode!
	for( const a of dds ) {
		for( const i of [ 6, 7, 8, 9, 10 ] ) {
			const [ nextdd, ncolours ] = follow_and_colour(
				nodes, links, faces, colours, a, a[i]
			);
			const fp = dd_fingerprint(nextdd);
			if( !(fp in seen) ) {
				add_colours(colours, ncolours);
				dds.push(nextdd);
				seen[fp] = true;
			}
		}
	}


	const labels = { 1: [], 2:[], 3:[], 4:[], 5:[] };
	for( const vstr in colours ) {
		labels[colours[vstr]].push(Number(vstr));
	}


	return { dodecahedra: dds, labels: labels };
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
	ids.sort((a, b) => a - b);
	return ids.join(',');
}

function make_120cell_cells(faces) {
	const dodecas = [];
	const seen = {};
	let i = 1;
	for( const face of faces ) {
		const dds = face_to_dodecahedra(faces, face);
		for( const dd of dds ) {
			const fp = dd_fingerprint(dd);
			if( ! (fp in seen) ) {
				//console.log(`added dodeca ${fp}`);
				const d = {
					id: i,
					faces: dd,
					nodes: dodecahedron_vertices(dd),
				}
				dodecas.push(d);
				i += 1;
				seen[fp] = 1;
			}
		}
	}
	return dodecas;
}



function dodeca_travers(nodes, links, n, fn) {
	const queue = [];
	const seen = {};
	const nodes_id = {};

	queue.push(n.id);

	while( queue.length > 0 ) {
		const v = queue.shift();
		find_adjacent(links, v).map((aid) => {
			if( !(aid in seen) ) {
				seen[aid] = true;
				queue.push(aid);
				fn(nodes_id[aid]);
			}
		})
	}
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


function dodeca_nodes(dd) {
	const ns = new Set();
	for( const face of dd.faces ) {
		for( const node of face.nodes ) {
			ns.add(node);
		}
	}
	dd.nodes = Array.from(ns);
}


function label_nodes(nodes, ids, label) {
	nodes.filter((n) => ids.includes(n.id)).map((n) => n.label = label);
}

function meridian_label_120cell(nodes) {

		const MERIDIAN_COLOURED ={"1":[27,38,49,61,68,74,87,105,120,126,131,140,149,156,165,174,179,185,200,207,210,218,223,226,231,234,239,241,253,258,263,265,272,274,279,284,285,289,296,300,301,306,311,313,320,324,325,331,334,339,342,347,350,356,357,367,369,376,378,383,388,389,393,400,413,414,419,420,425,440,449,453,458,460,469,471,473,474,487,488,490,494,499,503,511,512,513,514,525,527,530,532,539,543,546,550,555,558,563,566,572,573,580,581,592,593],"2":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,18,19,21,22,23,24,25,28,30,31,34,35,37,40,41,46,47,50,51,53,56,57,60,62,63,66,67,69,72,73,76,78,83,85,88,90,93,97,103,106,107,109,112,113,116,118,119,122,123,125,129,132,134,135,138,139,141,144,145,148,150,151,155,157,160,161,164,166,167,170,171,173,177,180,182,183,187,189,192,193,196,198,202,203,205,208,209,212,214,215],"3":[26,39,45,52,64,65,94,99,108,117,127,130,137,152,153,168,175,178,188,197,206,211,219,222,227,230,235,238,245,251,268,269,273,280,283,286,292,293,299,302,305,312,316,317,321,328,330,335,349,355,358,363,366,370,375,377,384,385,392,394,399,404,405,415,416,417,418,426,437,439,441,445,452,456,457,459,470,472,475,485,486,491,495,498,502,509,510,515,516,526,529,531,538,542,547,551,554,559,562,567,569,576,577,584,588,597],"4":[32,33,43,54,58,71,77,84,101,110,115,121,136,143,146,159,162,169,184,204,213,220,221,228,229,236,237,249,260,261,271,276,277,281,288,290,295,297,304,308,309,315,318,322,327,329,336,340,341,351,354,359,361,368,371,374,379,382,387,390,396,397,409,410,423,424,430,433,435,443,447,450,454,461,463,466,468,477,478,483,484,489,493,500,504,507,508,517,518,522,533,535,540,544,545,549,553,560,561,568,570,583,587,590,595,598],"5":[29,36,42,55,59,70,80,81,89,111,114,133,142,147,163,181,191,194,201,216,217,224,225,232,233,240,243,246,255,267,270,275,278,282,287,291,294,298,303,307,310,314,319,323,326,332,333,337,344,345,352,353,360,364,365,372,373,380,381,395,398,402,407,411,412,421,422,429,436,442,446,451,455,462,464,465,467,479,481,482,492,496,497,501,505,506,519,520,521,523,534,536,537,541,548,552,556,557,564,565,574,579,586,591,594,599]};


		for( const cstr in MERIDIAN_COLOURED ) {
			label_nodes(nodes, MERIDIAN_COLOURED[cstr], Number(cstr));
		}

		//label_nodes(nodes, [313], 6);
}


function check_120cell_nodes(nodes) {
	nodes.map((n) => {
		const vs = find_adjacent_labels(nodes, links, n.id);
		vs.push(n.label);
		console.log(`Node ${n.id} and neighbours ${vs}`);
		const fp = vs.sort().join(',');
		if( fp !== "1,2,3,4,5" ) {
			console.log(`Label error ${n.id} ${fp}`)
		}
	});
}

function make_dodecahedron_vertices() {
	const phi = 0.5 * (1 + Math.sqrt(5));  
	const phiinv = 1 / phi;    

	const nodes = [
			{ x: 1, y: 1, z: 1, w: 0, 			label: 4 },
			{ x: 1, y: 1, z: -1, w: 0, 			label: 3 },
			{ x: 1, y: -1, z: 1, w: 0, 			label: 3 },
			{ x: 1, y: -1, z: -1, w: 0, 		label: 2 },

			{ x: -1, y: 1, z: 1, w: 0, 			label: 3 },
			{ x: -1, y: 1, z: -1, w: 0, 		label: 1 },
			{ x: -1, y: -1, z: 1, w: 0, 		label: 5 },
			{ x: -1, y: -1, z: -1, w: 0, 		label: 3 },

			{ x: 0, y: phi, z: phiinv, w: 0, 	label: 5 },
			{ x: 0, y: phi, z: -phiinv, w: 0 , 	label: 2 },
			{ x: 0, y: -phi, z: phiinv, w: 0, 	label: 4 },
			{ x: 0, y: -phi, z: -phiinv, w: 0 , label: 1 },

			{ x: phiinv, y: 0, z: phi, w: 0 , 	label: 2},
			{ x: phiinv, y: 0, z: -phi, w: 0 , 	label: 4},
			{ x: -phiinv, y: 0, z: phi, w: 0 , 	label: 1},
			{ x: -phiinv, y: 0, z: -phi, w: 0 , label: 5},

			{ x: phi, y: phiinv, z:0, w: 0 , 	label: 1},
			{ x: phi, y: -phiinv, z:0, w: 0 , 	label: 5},
			{ x: -phi, y: phiinv, z:0, w: 0 , 	label: 4},
			{ x: -phi, y: -phiinv, z:0, w: 0 , 	label: 2},
		];
	index_nodes(nodes);
	return nodes;
}
 

// const nodes = make_120cell_vertices();
// const links = auto_detect_edges(nodes, 4);
// const faces = auto_120cell_faces(links);


// console.log("Calculating 120-cell colours")

// const a2 = arctic_two(nodes, links, faces, faces[0], 341)

// console.log(`got ${a2.dodecahedra.length}`);

// const labels = a2.labels;

// console.log("labelling nodes");
// for( const cstr in labels ) {
// 	label_nodes(nodes, labels[cstr], Number(cstr));
// }



