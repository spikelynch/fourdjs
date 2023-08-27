import * as PERMUTE from './permute.js';

import * as DODECAHEDRA from './dodecahedra.js';

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











function label_faces_120cell(nodes, faces, cfaces, label) {
	const ns = new Set();
	console.log(`label faces from ${cfaces}`);
	for( const fid of cfaces ) {
		const face = faces.filter((f)=> f.id === fid );
		if( face.length > 0 ) {
			for ( const nid of face[0].nodes ) {
				ns.add(nid);
			}
		}
	}
	label_nodes(nodes, Array.from(ns), label);
}


function basic_auto_label_120cell(nodes, links) {

	const faces = auto_120cell_faces(links);
	const dodecas = DODECAHEDRA.DODECAHEDRA;
	//const cfaces = [ 1, 2, 4, 145, 169 ];

	let colour = 1;
	for( const dd of dodecas ) {
		label_faces_120cell(nodes, faces, dd, colour);
		colour++;
		if( colour > 8 ) {
			colour = 1;
		}
	}

// 	label_faces_120cell(nodes, faces, [
//     1,   2,   4, 169, 626,
//   145, 149, 553, 173, 171,
//   147, 554
// ], 2);

// 	label_faces_120cell(nodes, faces, [
//     1,   5,   3, 193, 641,
//   217, 221, 565, 197, 195,
//   219, 566
// ], 3);

}

// manual compound-of-tetrahedra colouring 

function manual_label_120cell(nodes, links) {
	label_nodes(nodes, [1, 153, 29, 105], 1);
	label_nodes(nodes, [317, 409, 265, 109], 2);
	label_nodes(nodes, [221, 337, 25, 509], 3);
	label_nodes(nodes, [217, 413, 457, 361], 4);
	label_nodes(nodes, [313, 157, 461, 505], 5);


	// second dodecahedron needs to have opposite chirality

	label_nodes(nodes, [ 165, 33, 117 ], 1);   
	label_nodes(nodes, [ 161, 465, 517 ], 2);
	label_nodes(nodes, [ 417, 469, 365 ], 3);
	label_nodes(nodes, [ 341, 37, 513 ], 4);
	label_nodes(nodes, [ 421, 269, 113 ], 5);

	// third

	label_nodes(nodes, [ 45, 101, 181 ], 1);   
	label_nodes(nodes, [ 241, 429, 53 ], 2);
	label_nodes(nodes, [ 93, 229 ], 3);
	label_nodes(nodes, [ 173, 437 ], 4);
	label_nodes(nodes, [ 245, 325 ], 5);

	// fourth (id = 3)

	label_nodes(nodes, [ 89, 169, 49 ], 1);   
	label_nodes(nodes, [ 321 ], 2);
	label_nodes(nodes, [ 425, 177 ], 3);
	label_nodes(nodes, [ 97,  225 ], 4);
	label_nodes(nodes, [ 41,  433], 5);



}

function meridian_label_120cell(nodes) {

		const MERIDIAN_COLOURED ={"1":[27,38,49,61,68,74,87,105,120,126,131,140,149,156,165,174,179,185,200,207,210,218,223,226,231,234,239,241,253,258,263,265,272,274,279,284,285,289,296,300,301,306,311,313,320,324,325,331,334,339,342,347,350,356,357,367,369,376,378,383,388,389,393,400,413,414,419,420,425,440,449,453,458,460,469,471,473,474,487,488,490,494,499,503,511,512,513,514,525,527,530,532,539,543,546,550,555,558,563,566,572,573,580,581,592,593],"2":[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,18,19,21,22,23,24,25,28,30,31,34,35,37,40,41,46,47,50,51,53,56,57,60,62,63,66,67,69,72,73,76,78,83,85,88,90,93,97,103,106,107,109,112,113,116,118,119,122,123,125,129,132,134,135,138,139,141,144,145,148,150,151,155,157,160,161,164,166,167,170,171,173,177,180,182,183,187,189,192,193,196,198,202,203,205,208,209,212,214,215],"3":[26,39,45,52,64,65,94,99,108,117,127,130,137,152,153,168,175,178,188,197,206,211,219,222,227,230,235,238,245,251,268,269,273,280,283,286,292,293,299,302,305,312,316,317,321,328,330,335,349,355,358,363,366,370,375,377,384,385,392,394,399,404,405,415,416,417,418,426,437,439,441,445,452,456,457,459,470,472,475,485,486,491,495,498,502,509,510,515,516,526,529,531,538,542,547,551,554,559,562,567,569,576,577,584,588,597],"4":[32,33,43,54,58,71,77,84,101,110,115,121,136,143,146,159,162,169,184,204,213,220,221,228,229,236,237,249,260,261,271,276,277,281,288,290,295,297,304,308,309,315,318,322,327,329,336,340,341,351,354,359,361,368,371,374,379,382,387,390,396,397,409,410,423,424,430,433,435,443,447,450,454,461,463,466,468,477,478,483,484,489,493,500,504,507,508,517,518,522,533,535,540,544,545,549,553,560,561,568,570,583,587,590,595,598],"5":[29,36,42,55,59,70,80,81,89,111,114,133,142,147,163,181,191,194,201,216,217,224,225,232,233,240,243,246,255,267,270,275,278,282,287,291,294,298,303,307,310,314,319,323,326,332,333,337,344,345,352,353,360,364,365,372,373,380,381,395,398,402,407,411,412,421,422,429,436,442,446,451,455,462,464,465,467,479,481,482,492,496,497,501,505,506,519,520,521,523,534,536,537,541,548,552,556,557,564,565,574,579,586,591,594,599]};


		for( const cstr in MERIDIAN_COLOURED ) {
			label_nodes(nodes, MERIDIAN_COLOURED[cstr], Number(cstr));
		}

		//label_nodes(nodes, [313], 6);
}

function arctic_label_120cell(nodes) {

		const ARCTIC_COLOURED ={
    '1': [
       49, 105, 131, 149, 165, 223,
      241, 253, 265, 279, 301, 313,
      325, 347, 367, 389, 413, 425,
      449, 453, 469, 473, 487, 513,
      581, 593
    ],
    '2': [
        1,   5,   7,  15,  19,  25,  35,
       37,  41,  53,  69,  85,  93,  97,
      109, 113, 129, 135, 145, 155, 157,
      161, 167, 173, 177, 209
    ],
    '3': [
       39,  45,  65, 117, 153, 219,
      245, 251, 269, 293, 317, 321,
      349, 375, 399, 417, 437, 441,
      445, 457, 485, 509, 515, 529,
      577, 597
    ],
    '4': [
       33, 101, 159, 169, 213, 221,
      229, 249, 271, 277, 329, 341,
      351, 361, 397, 409, 433, 461,
      477, 483, 517, 533, 545, 549,
      561, 583
    ],
    '5': [
       29,  81,  89, 133, 163, 181,
      217, 225, 255, 267, 303, 333,
      337, 345, 365, 373, 421, 429,
      465, 481, 497, 501, 505, 519,
      565, 579
    ]
  }
  		for( const cstr in ARCTIC_COLOURED ) {
			label_nodes(nodes, ARCTIC_COLOURED[cstr], Number(cstr));
		}

}



function link_labels(nodes, link) {
	const n1 = nodes.filter((n) => n.id === link.source);
	const n2 = nodes.filter((n) => n.id === link.target);
	return [ n1[0].label, n2[0].label ];
}



export const cell120 = () => {
	const nodes  = make_120cell_vertices();
	const links = auto_detect_edges(nodes, 4);

	meridian_label_120cell(nodes);

	// const links = links_all.filter((l) => {
	// 	const labels = link_labels(nodes, l);
	// 	return ( labels[0] > 0 && labels[1] > 0 );
	// });

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


