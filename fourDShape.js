import * as THREE from 'three';


const HYPERPLANE = 2.0;


class FourDShape extends THREE.Group {

	constructor(node_ms, link_ms, face_ms, structure) {
		super();
		this.node_ms = node_ms;
		this.link_ms = link_ms;
		this.face_ms = face_ms;
		this.nodes4 = structure.nodes;
		this.nodes3 = {};
		this.links = structure.links;
		this.faces = ( "faces" in structure ) ? structure.faces : [];
		this.node_size = structure.geometry.node_size;
		this.link_size = structure.geometry.link_size;
		this.node_scale = 1;
		this.link_scale = 1;
		this.hyperplane = HYPERPLANE;
		this.initShapes();
	}



	// if a node/link has no label, use the 0th material

	getMaterial(entity, materials) {
		if( "label" in entity ) {
			return materials[entity.label];
		} else {
			return materials[0];
		}
	}

	makeNode(material, v3) {
		const geometry = new THREE.SphereGeometry(this.node_size);
		const sphere = new THREE.Mesh(geometry, material);
		sphere.position.copy(v3);
		this.add(sphere);
		return sphere;
	}

	makeLink(material, link) {
		const n1 = this.nodes3[link.source].v3;
		const n2 = this.nodes3[link.target].v3;
		const length = n1.distanceTo(n2);
		const centre = new THREE.Vector3();
		centre.lerpVectors(n1, n2, 0.5);
		const geometry = new THREE.CylinderGeometry(this.link_size, this.link_size, 1);
		const cyl = new THREE.Mesh(geometry, material);
		const edge = new THREE.Group();
		edge.add(cyl);
		edge.position.copy(centre);
		edge.scale.copy(new THREE.Vector3(1, 1, length));
		edge.lookAt(n2);
		cyl.rotation.x = Math.PI / 2.0;
		this.add(edge);
		return edge;
	}

	updateLink(link) {
		const n1 = this.nodes3[link.source].v3;
		const n2 = this.nodes3[link.target].v3;
		const length = n1.distanceTo(n2);
		const centre = new THREE.Vector3();
		centre.lerpVectors(n1, n2, 0.5);
		link.object.scale.copy(new THREE.Vector3(this.link_scale, this.link_scale, length));
		link.object.position.copy(centre);
		link.object.lookAt(n2);
		link.object.children[0].rotation.x = Math.PI / 2.0;
	}


	setFaceGeometry(face, geometry) {
		const values = [];
		for( const f of face.nodes ) {
			const v3 = this.nodes3[f].v3;
			values.push(v3.x);
			values.push(v3.y);
			values.push(v3.z);
		}
		const v3 = this.nodes3[face.nodes[0]].v3;
		values.push(v3.x);
		values.push(v3.y);
		values.push(v3.z);
		const vertices = new Float32Array(values);
		geometry.setAttribute( 'position', new THREE.BufferAttribute( vertices, 3 ) );
	}

	makeFace(material, face) {
		const geometry = new THREE.BufferGeometry();
		this.setFaceGeometry(face, geometry)
		const mesh = new THREE.Mesh( geometry, material );
		this.add(mesh);
		return mesh;
	}


	fourDtoV3(x, y, z, w, rotations) {
		const v4 = new THREE.Vector4(x, y, z, w);
		for ( const m4 of rotations ) {
			v4.applyMatrix4(m4);
		}
		const k = this.hyperplane / (this.hyperplane + v4.w);
		return new THREE.Vector3(v4.x * k, v4.y * k, v4.z * k);
	}


	initShapes() {
		for( const n of this.nodes4 ) {
			const v3 = this.fourDtoV3(n.x, n.y, n.z, n.w, []);
			const material = this.getMaterial(n, this.node_ms);
			this.nodes3[n.id] = {
				v3: v3,
				object: this.makeNode(material, v3)
			};
		}
		for( const l of this.links ) {
			const material = this.getMaterial(l, this.link_ms);
			l.object = this.makeLink(material, l);
		}
		for( const f of this.faces ) {
			const material = this.getMaterial(f, this.face_ms);
			f.object = this.makeFace(material, f);
		}
	}


	render3(rotations) {
		this.scalev3 = new THREE.Vector3(this.node_scale, this.node_scale, this.node_scale);
		for( const n of this.nodes4 ) {
			const v3 = this.fourDtoV3(n.x, n.y, n.z, n.w, rotations);
			this.nodes3[n.id].v3 = v3;
			this.nodes3[n.id].object.position.copy(v3);
			this.nodes3[n.id].object.scale.copy(this.scalev3);
		}

		for( const l of this.links ) {
			this.updateLink(l);
		}

		for( const f of this.faces ) {
			this.setFaceGeometry(f, f.object.geometry);
		}
	}


}

export { FourDShape };
