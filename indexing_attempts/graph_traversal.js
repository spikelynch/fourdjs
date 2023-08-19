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




