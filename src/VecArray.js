/*
 * Some functions for treating an array as a vector.
 */


export function addThis(vec1, vec2) {
	for (let i = 0; i < vec1.length; i++) {
		vec1[i] += vec2[i];
	}
}

export function divVecThis(vec1, vec2) {
	for (let i = 0; i < vec1.length; i++) {
		vec1[i] /= vec2[i];
	}
}

export function mul(vec1, val) {
	return vec1.map(x => x * val);
}

export function mulVecThis(vec1, vec2) {
	for (let i = 0; i < vec1.length; i++) {
		vec1[i] *= vec2[i];
	}
}

export function sub(vec1, vec2) {
	return vec1.map((x, i) => x - vec2[i]);
}
