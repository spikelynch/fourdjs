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

export function make_120cell_dodecahedra(faces) {
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
