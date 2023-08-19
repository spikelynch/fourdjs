
// Utilities for generating sets of coordinates based on 
// permutations, even permutations and changes of sign.
// Based on https://www.qfbox.info/epermute


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


function find_by_chord(nodesid, n, d) {
	const EPSILON = 0.02;
	return Object.keys(nodesid).filter((n1) => {
		const d2 = dist2(nodesid[n1], nodesid[n]);
		return Math.abs(d2 - d ** 2) < EPSILON;
	});
}


function has_chord(n1, n2, d) {
	const d2 = dist2(n1, n2);
	const EPSILON = 0.01;
	return Math.abs(d2 - d ** 2) < EPSILON;
}


function find_all_chords(nodes) {
	const chords = {};
	for( let i = 0; i < nodes.length - 1; i++ ) {
		for( let j = i + 1; j < nodes.length; j++ ) {
			const n1 = nodes[i];
			const n2 = nodes[j];
			const chord = Math.sqrt(dist2(n1, n2)).toFixed(5);
			if( !(chord in chords) ) {
				chords[chord] = [];
			} 
			chords[chord].push([n1, n2]);
		}
	}
	return chords;
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


// bad stuff

function find_chords(chords, n) {
	return chords.filter((c) => c[0].id === n.id || c[1].id === n.id);
}

function find_neighbours(chords, n) {
	const c = find_chords(chords, n);
	return c.map((c) => c[0].id === n.id ? c[1] : c[0])
}



// for a list of pairs [n1, n2] (these are nodes which share a common angle
// from a center), find all the groups of nodes which don't appear in a pair
// together

function partition_nodes(pairs) {
	let groups = [];
	const seen = new Set();
	for( const pair of pairs ) {
		// both nodes are in a group already
		if( seen.has(pair[0]) && seen.has(pair[1]) ) {
			continue;
		}
		let already = false;
		// check if either node is already in a group
		for( const group of groups ) {
			if( group.has(pair[0]) ) {
				group.add(pair[1]);
				seen.add(pair[1]);
				already = true;
				continue;
			} else if( group.has(pair[1]) ) {
				group.has(pair[0]);
				seen.has(pair[0]);
				already = true;
				continue;
			}
		}
		// if neither of the pair was in a former group, start a new group
		if( !already ) {
			groups.push(new Set(pair));
		}
		// collapse any groups which now have common elements
		groups = collapse_groups(groups);
	}
	return groups;
}

// given a list of groups, if any have common elements, collapse them

function collapse_groups(groups) {
	const new_groups = [ ];
	for( group of groups ) {
		let collapsed = false;
		for( new_group of new_groups ) {
			const i = intersection(group, new_group);
			if( i.size > 0 ) {
				for( const e of group ) {
					new_group.add(e);
				}
				collapsed = true;
				break;
			}
		}
		if( !collapsed ) {
			new_groups.push(new Set(group));
		}
	}
	return new_groups;
}


function intersection(s1, s2) {
	const i = new Set();
	for( const e of s1 ) {
		if( s2.has(e) ) {
			i.add(e)
		}
	}
	return i;
}

function union(s1, s2) {
	const u = new Set(s1);
	for( const e of s2 ) {
		u.add(e);
	}
	return u;
}


function vector_angle(n1, n2, n3) {
	const v1 = new THREE.Vector4(n1.x, n1.y, n1.z, n1.w);
	const v2 = new THREE.Vector4(n2.x, n2.y, n2.z, n2.w);
	const v3 = new THREE.Vector4(n3.x, n3.y, n3.z, n3.w);
	v2.sub(v1);
	v3.sub(v1);
	const dp = v2.dot(v3);
	return Math.acos(dp / ( v2.length() * v3.length()));
}

function neighbour_angles_orig(chords, n) {
	const ns = find_neighbours(chords, n);
	const angles = {};
	for( let i = 0; i < ns.length - 1; i++ ) {
		for( let j = i + 1; j < ns.length; j++ ) {
			const n2 = ns[i];
			const n3 = ns[j];
			const a = THREE.MathUtils.radToDeg(vector_angle(n, n2, n3));
			const af = (a).toFixed(3);
			if( ! (af in angles) ) {
				angles[af] = [];
			}
			angles[af].push([n2.id, n3.id]);
		}
	}
	return angles;
}

function neighbour_angles(chords, n, angle) {
	const ns = find_neighbours(chords, n);
	const pairs = [];
	for( let i = 0; i < ns.length - 1; i++ ) {
		for( let j = i + 1; j < ns.length; j++ ) {
			const n2 = ns[i];
			const n3 = ns[j];
			const a = THREE.MathUtils.radToDeg(vector_angle(n, n2, n3));
			const af = (a).toFixed(3);
			if( af === angle ) {
				pairs.push([n2.id, n3.id]);
			}
		}
	}
	return pairs;
}


function make_120_partition(nodes, n) {
	const chords = find_all_chords(nodes);
	const chord3 = chords["1.74806"];  // these are edges of the 600-cells;
	const pairs60 = neighbour_angles(chord3, n, "60.000");
	const icosas = partition_nodes(pairs60);

	n.label = 1;
	const angles = icosa_nodes(nodes, icosas[0]);
	label_120_partition_r(nodes, chord3, 1, n, angles);
}

// recursive function to label a single 600-cell vertex partition of the 
// 120-cell by following icosahedral nets
// this doesn't work! completely - labels only 108-112

function label_120_partition_r(nodes, chords, label, origin, neighbours) {
	console.log(`label_120_partition_r ${origin.id}`);
	console.log(neighbours.map((n) => n.id).join(', '));

	// first try to label everything
	const unlabelled = [];
	for( const n of neighbours ) {
		if( n.label === 0 ) {
			console.log(`Labelled ${n.id} ${label}`);
			n.label = label;
			unlabelled.push(n);
		} else if( n.label !== label ) {
			console.log(`node ${n.id} is already in group ${n.label}`);
			//return false;
		}
	}
	for( const n of unlabelled ) { 
		// the angles represent two icosahedral pyramids - partition them and
		// pick the one which is at 60 to the edge we arrived on
		//console.log(`looking for more neighbors for ${n}`);
		const pairs60 = neighbour_angles(chords, n, "60.000");
		const icosas = partition_nodes(pairs60);
		const icosa = choose_icosa(nodes, origin, n, icosas);
		const icosa_n = icosa_nodes(nodes, icosa);
		console.log(`recursing to ${nice_icosa(nodes,icosa)}`);
		return label_120_partition_r(nodes, chords, label, n, icosa_n);
	}
}

// given a pair of icosa-sets, pick the one which is at the right angle to
// the incoming vector

function choose_icosa(nodes, origin, n1, icosas) {
	for( const icosa of icosas ) {
		const inodes = icosa_nodes(nodes, icosa);
		const a60 = inodes.map((ni) => {
			const a = THREE.MathUtils.radToDeg(vector_angle(n1, origin, ni));
			return a.toFixed(3);
		});
		if( a60.filter((a) => a === "60.000").length > 0 ) {
			return icosa;
		}
	}
	console.log("No icosa found!");
	return undefined;
}

function icosa_nodes(nodes, icosa) {
	return Array.from(icosa).map((nid) => node_by_id(nodes, nid)).sort((a, b) => a.id - b.id);
}

function node_by_id(nodes, nid) {
	const ns = nodes.filter((n) => n.id === nid);
	return ns[0];
}


function enumerate_icosas(nodes) {
	const chords = find_all_chords(nodes);
	const chord3 = chords["1.74806"];  // these are edges of the 600-cells;

	for( const n of nodes ) {
		const pairs60 = neighbour_angles(chord3, n, "60.000");
		const icosas = partition_nodes(pairs60);
		for( const icosa of icosas ) {
			const inodes = icosa_nodes(nodes, icosa);
			console.log(icosa_to_csv(n.id, inodes).join(','));
		}
	}
}


function icosa_to_csv(nid, icosa) {
	const cols = [ nid ];
	const ia = icosa.map((n) => n.id);
	for( let i = 1; i < 601; i++ ) {
		if( ia.includes(i) ) {
			cols.push(i);
		} else {
			cols.push('')
		}
	}
	return cols;
}


function start_icosas(nodes, chords, origin) {
	const pairs60 = neighbour_angles(chords, origin, "60.000");
	return partition_nodes(pairs60).map((i) => nice_icosa(nodes, i));
}



function next_icosa(nodes, chords, origin, nid) {
	const n = node_by_id(nodes, nid);
	const pairs60 = neighbour_angles(chords, n, "60.000");
	const icosas = partition_nodes(pairs60);
	const icosa = choose_icosa(nodes, origin, n, icosas);

	return nice_icosa(nodes, icosa);
}

function nice_icosa(nodes, icosa) {
	return icosa_nodes(nodes, icosa).map((n) => n.id).join(', ');
}


// New approach with tetrahedral coloring

function find_edges(links, nid) {
	return links.filter((l) => l.source === nid || l.target === nid );
}


function find_adjacent(links, nid) {
	return find_edges(links, nid).map((l) => {
		if( l.source === nid ) {
			return l.target;
		} else {
			return l.source;
		}
	});
}

function iterate_graph(nodes, links, n, fn) {
	const queue = [];
	const seen = {};
	const nodes_id = {};
	nodes.map((n) => nodes_id[n.id] = n);

	queue.push(n.id);
	seen[n.id] = true;
	fn(n);

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




// stupid tetrahedral labelling
// keeps getting stuck


function naive_label_120cell(nodes, links, n) {
	const nodes_id = {};
	nodes.map((n) => nodes_id[n.id] = n);
	iterate_graph(nodes, links, nodes[0], (n) => {
		const cols = new Set();
		const nbors = find_adjacent(links, n.id);
		for( const nb of nbors ) {
			if( nodes_id[nb].label > 0 ) {
				cols.add(nodes_id[nb].label);
			}
			for( const nb2 of find_adjacent(links, nb) ) {
				if( nb2 !== n.id && nodes_id[nb].label > 0 ) {
					cols.add(nodes_id[nb2].label);
				}
			}
		}
		const pcols = [ 1, 2, 3, 4, 5 ].filter((c) => !cols.has(c));
		if( pcols.length < 1 ) {
			console.log(`Got stuck, no options at ${n.id}`);
			return false;
		} else {
			n.label = pcols[0];
			console.log(`found ${pcols.length} colors for node ${n.id}`);
			console.log(`applied ${pcols[0]} to node ${n.id}`);
			return true;
		}
	});
}








const nodes = make_120cell_vertices();
const links = auto_detect_edges(nodes, 4);
const faces = auto_120cell_faces(links);

console.log('links');

for( const link of links ) {
	console.log(link);
}

console.log('faces');

for( const face of faces ) {
	console.log(face);
}

