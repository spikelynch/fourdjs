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


