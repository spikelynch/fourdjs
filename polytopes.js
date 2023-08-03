
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


export const cell16 = () => {
	let nodes = PERMUTE.coordinates([1, 1, 1, 1],  0);
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



export const tesseract = () => {
	const nodes = PERMUTE.coordinates([1, 1, 1, 1],  0);
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




export const cell24 = () => {
	const nodes = PERMUTE.coordinates([0, 0, 1, 1], 0);
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


export const cell120 = () => {
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
		PERMUTE.coordinates([0, 0, 0, 2],  0),
		PERMUTE.coordinates([1, 1, 1, 1],  1),

		PERMUTE.coordinates([phi, 1, 1 / phi, 0], 1, true)
		].flat();

	index_nodes(nodes);
	const groups = partition_nodes_by_distance(nodes, 2);
	scale_nodes(nodes, 0.75);
	return nodes;
}

// Trying to do this with an algorithm, not just a lookup table.
// I think that all of the vertices which belong to the same 24-cell group
// are 2 units apart.

function partition_nodes_by_distance_bad(nodes, d) {
	const groups = [];
	const EPSILON = 0.002;
	for( const n1 of nodes ) {
		let matched = false;
		for( const group of groups ) {
			for( const n2 of group ) {
				const d2 = dist2(n1, n2);
				// console.log(`comparing ${n1.id} ${n2.id}`);
				// console.log(n1);
				// console.log(n2);
				// console.log(`${d2} ${Math.abs(d2 - d**2)}`);
				if( Math.abs(d2 - d ** 2) < EPSILON ) {
					group.push(n1);
					matched = true;
					// console.log(`Matched ${n1.id} ${n2.id} ${d2}`);
					break;
				}
			}
			if( matched ) {
				break;
			}
		}
		if(! matched ) {
			// console.log(`unmatched node ${n1.id}`);
			groups.push([ n1 ]);
		}
	}
	console.log(`Build ${groups.length} groups`);
	console.log(groups);
	return groups;
}

// find all nodes in nodesid which are d away from n (and are not n)

function nodes_by_distance(nodesid, n, d) {
	const EPSILON = 0.02;
	const neighbours = Object.keys(nodesid).filter((n1id) => {
		if( n1id !== n.id ) {
			const d2 = dist2(nodesid[n1id], nodesid[n]);
			console.log(`${n} ${n1id} ${d2}`);
			return Math.abs(d2 - d ** 2) < EPSILON;
		} else {
			return false;
		}
	});
	console.log(`neighbours at ${d} ${neighbours}`);
	return neighbours;
}





function partition_nodes_by_distance(nodes, d) {
	const groups = [];
	const nodesid = {};
	const EPSILON = 0.02;

	for( const node of nodes ) {
		nodesid[node.id] = node;
	}

	while( Object.keys(nodesid).length > 0 ) {
		const start = Object.keys(nodesid)[0];
		const group = [ start ];
		
		const neighbours = nodes_by_distance(nodesid, n, d).filter((n2) => !(n2 in group));
		if( neighbours ) {
			group.push(...neighbours);
		}

		const group = partition_r(nodesid, [ start ], start, d);
		console.log(group);
		for( const g of group ) {
			delete nodesid[g];
		}
		groups.push(group);
	}
}





export const cell600 = () => {
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




