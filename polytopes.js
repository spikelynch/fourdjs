import * as PERMUTE from './permute.js';

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

export const cell5 = () => {
	const r5 = Math.sqrt(5);
	const r2 = Math.sqrt(2) / 2;
	return {
		nodes: [
	      {id:1, label: 0, x: r2, y: r2, z: r2, w: -r2 / r5 },
	      {id:2, label: 1, x: r2, y: -r2, z: -r2, w: -r2 / r5 },
	      {id:3, label: 2, x: -r2, y: r2, z: -r2, w: -r2 / r5 },
	      {id:4, label: 3, x: -r2, y: -r2, z: r2, w: -r2 / r5 },
	      {id:5, label: 4, x: 0, y: 0, z: 0, w: 4 * r2 / r5 },
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


export const cell16 = () => {
	let nodes = PERMUTE.coordinates([1, 1, 1, 1],  0);
	nodes = nodes.filter((n) => n.x * n.y * n.z * n.w > 0);

	nodes[0].label = 0;
	nodes[3].label = 1;
	nodes[5].label = 2;
	nodes[6].label = 3;
	nodes[7].label = 0;
	nodes[4].label = 1;
	nodes[2].label = 2;
	nodes[1].label = 3;

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



export const tesseract = () => {
	const nodes = PERMUTE.coordinates([1, 1, 1, 1],  0);
	index_nodes(nodes);

	for( const n of nodes ) {
		if( n.x * n.y * n.z * n.w > 0 ) {
			n.label = 1;
		}
	}

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



const CELL24_INDEXING = {
	x: { y: 0, z: 2, w: 1 },
	y: { z: 1, w: 2 },
	z: { w: 0 } 
};



export const cell24 = () => {
	const nodes = PERMUTE.coordinates([0, 0, 1, 1], 0);
	
	for( const n of nodes ) {
		const axes = ['x', 'y', 'z', 'w'].filter((a) => n[a] !== 0);
		n.label = CELL24_INDEXING[axes[0]][axes[1]];
	}

	index_nodes(nodes);
	const links = auto_detect_edges(nodes, 8);

	return {
		nodes: nodes,
		links: links,
		geometry: {
			node_size: 0.02,
			link_size: 0.02
		}
	};
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
				faces.push({ id: id, nodes: face });
				id++;
				seen[fp] = true;
			}
		}
	}
	return faces;
}



function make_120cell_vertices() {
	const phi = 0.5 * (1 + Math.sqrt(5));  
	const r5 = Math.sqrt(5);   
	const phi2 = phi * phi;    
	const phiinv = 1 / phi;    
	const phi2inv = 1 / phi2;  

	const nodes = [
		PERMUTE.coordinates([0, 0, 2, 2],  0),
		PERMUTE.coordinates([1, 1, 1, r5], 0),
		PERMUTE.coordinates([phi, phi, phi, phi2inv], 0),
		PERMUTE.coordinates([phiinv, phiinv, phiinv, phi2], 0),

		PERMUTE.coordinates([phi2, phi2inv, 1, 0], 0, true),
		PERMUTE.coordinates([r5, phiinv, phi, 0], 0, true),
		PERMUTE.coordinates([2, 1, phi, phiinv], 0, true),
		].flat();
	index_nodes(nodes);
	scale_nodes(nodes, 0.5);
	return nodes;
}



function label_nodes(nodes, ids, label) {
	nodes.filter((n) => ids.includes(n.id)).map((n) => n.label = label);
}






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



function dumb_label_120cell(nodes, links) {
	let l = 0;

	iterate_graph(nodes, links, nodes[0], (n) => {
		n.label = l;
		console.log(`Labelled ${n.id} ${n.label}`);
		l++;
		if( l > 2 ) {
			l = 0;
		}
	})
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


function manual_label_120cell(nodes, links) {

	const faces = auto_120cell_faces(links);
	const cfaces = [ 1, 2, 4, 145, 169 ];

	const ns = new Set();

	for( const fid of cfaces ) {
		const face = faces.filter((f)=> f.id === fid );
		console.log(face);
		if( face.length > 0 ) {
			for ( const nid of face[0].nodes ) {
				ns.add(nid);
			}
		}
	}


	label_nodes(nodes, Array.from(ns), 4);

}





export const cell120 = () => {
	const nodes  = make_120cell_vertices();
	const links = auto_detect_edges(nodes, 4);

	manual_label_120cell(nodes, links);

	return {
		nodes: nodes,
		links: links,
		geometry: {
			node_size: 0.02,
			link_size: 0.02
		},
	}
}

// Schoute's partition via https://arxiv.org/abs/1010.4353

const partition600 = {

	"2,0,0,0": 1,
	"0,2,0,0": 1,
	"0,0,2,0": 1,
	"0,0,0,2": 1,
	"1,1,1,1": 1,
	"1,1,-1,-1": 1,
	"1,-1,1,-1": 1,
	"1,-1,-1,1": 1,
	"1,-1,-1,-1": 1,
	"1,-1,1,1": 1,
	"1,1,-1,1": 1,
	"1,1,1,-1": 1,

	"k,0,-t,-1": 2,
	"0,k,1,-t": 2,
	"t,-1,k,0": 2,
	"1,t,0,k": 2,
	"t,k,0,-1": 2,
	"1,0,k,t": 2,
	"k,-t,-1,0": 2,
	"0,1,-t,k": 2,
	"1,k,t,0": 2,
	"t,0,-1,k": 2,
	"0,t,-k,-1": 2,
	"k,-1,0,-t": 2,

	"t,0,1,k": 3,
	"0,t,-k,1": 3,
	"1,-k,-t,0": 3,
	"k,1,0,-t": 3,
	"0,k,1,t": 3,
	"t,1,-k,0": 3,
	"k,0,t,-1": 3,
	"1,-t,0,k": 3,
	"t,-k,0,-1": 3,
	"0,1,-t,-k": 3,
	"1,0,-k,t": 3,
	"k,t,1,0": 3,

	"t,0,-1,-k": 4,
	"0,t,k,-1": 4,
	"1,-k,t,0": 4,
	"k,1,0,t": 4,
	"t,1,k,0": 4,
	"0,k,-1,-t": 4,
	"1,-t,0,-k": 4,
	"k,0,-t,1": 4,
	"0,1,t,k": 4,
	"t,-k,0,1": 4,
	"k,t,-1,0": 4,
	"1,0,k,-t": 4,

	"k,0,t,1": 5,
	"0,k,-1,t": 5,
	"t,-1,-k,0": 5,
	"1,t,0,-k": 5,
	"1,0,-k,-t": 5,
	"t,k,0,1": 5,
	"0,1,t,-k": 5,
	"k,-t,1,0": 5,
	"t,0,1,-k": 5,
	"1,k,-t,0": 5,
	"k,-1,0,t": 5,
	"0,t,k,1": 5
};



function partition_coord(i, coords, invert) {
	const j = invert ? -i : i;
	if( j >= 0 ) {
		return coords[j];
	}
	return "-" + coords[-j];
}

function partition_fingerprint(n, coords, invert) {
	const p = ['x','y','z','w'].map((a) => partition_coord(n[a], coords, invert));
	const fp = p.join(',');
	return fp;
}


function label_vertex(n, coords, partition) {
	const fp = partition_fingerprint(n, coords, false);
	if( fp in partition ) {
		return partition[fp];
	} else {
		const ifp = partition_fingerprint(n, coords, true);
		if( ifp in partition ) {
			return partition[ifp];
		}
		console.log(`Map for ${fp} ${ifp} not found`);
		return 0;
	}
}


function map_coord(i, coords, values) {
	if( i >= 0 ) {
		return values[coords[i]];
	}
	return -values[coords[-i]];
}


function make_600cell_vertices() {
	const coords = {
		0: '0',
		1: '1',
		2: '2',
		3: 't',
		4: 'k'
	};
	const t = 0.5 * (1 + Math.sqrt(5));
	const values = {
		'0': 0,
		'1': 1,
		'2': 2,
		't': t,
		'k': 1 / t 
	};

	const nodes = [
		PERMUTE.coordinates([0, 0, 0, 2],  0),
		PERMUTE.coordinates([1, 1, 1, 1],  0),
		PERMUTE.coordinates([3, 1, 4, 0],  0, true)
	].flat();

	for( const n of nodes ) {
		n.label = label_vertex(n, coords, partition600) - 1;
	}

	for( const n of nodes ) {
		for( const a of [ 'x', 'y', 'z', 'w'] ) {
			n[a] = map_coord(n[a], coords, values);
		}
	}


	index_nodes(nodes);
	scale_nodes(nodes, 0.75);
	return nodes;
}

function get_node(nodes, id) {
	const ns = nodes.filter((n) => n.id === id);
	if( ns ) {
		return ns[0]
	} else {
		return undefined;
	}
}

function audit_link_labels(nodes, links) {
	console.log("Link audit");
	for( const l of links ) {
		const n1 = get_node(nodes, l.source);
		const n2 = get_node(nodes, l.target);
		if( n1.label === n2.label ) {
			console.log(`link ${l.id} joins ${n1.id} ${n2.id} with label ${n2.label}`);
		}
	}
}



export const cell600 = () => {
	const nodes  = make_600cell_vertices();
	const links = auto_detect_edges(nodes, 12);

	return {
		nodes: nodes,
		links: links,
		geometry: {
			node_size: 0.02,
			link_size: 0.02
		}
	}
}


