
// Utilities for generating sets of coordinates based on 
// permutations, even permutations and changes of sign.
// Based on https://www.qfbox.info/epermute


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

function permutations(a) {
	a.sort();
	const ps = [ [...a] ];
	while( pandita(a) ) {
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


