import * as THREE from 'three';


const HYPERPLANE = 2;


class FourDShape extends THREE.Group {

	constructor(node_ms, link_ms, structure) {
		super();
		this.node_ms = node_ms;
		this.link_ms = link_ms;
		this.nodes4 = structure.nodes;
		this.nodes3 = {};
		this.links = structure.links;
		this.node_size = structure.geometry.node_size;
		this.link_size = structure.geometry.link_size;
		this.geom_scale = 1;
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
		link.object.scale.copy(new THREE.Vector3(this.geom_scale, this.geom_scale, length));
		link.object.position.copy(centre);
		link.object.lookAt(n2);
		link.object.children[0].rotation.x = Math.PI / 2.0;
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
	}


	render3(rotations) {
		this.scalev3 = new THREE.Vector3(this.geom_scale, this.geom_scale, this.geom_scale);
		for( const n of this.nodes4 ) {
			const v3 = this.fourDtoV3(n.x, n.y, n.z, n.w, rotations);
			this.nodes3[n.id].v3 = v3;
			this.nodes3[n.id].object.position.copy(v3);
			this.nodes3[n.id].object.scale.copy(this.scalev3);
		}

		for( const l of this.links ) {
			this.updateLink(l);
		}
	}


}

export { FourDShape };