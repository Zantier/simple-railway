/*
 * Some functions for treating an array as a vector.
 */


export function addScalar(vec1, val) {
	return vec1.map(x => x + val);
}

export function add(vec1, vec2) {
	return vec1.map((x, i) => x + vec2[i]);
}

export function addThis(vec1, vec2) {
	for (let i = 0; i < vec1.length; i++) {
		vec1[i] += vec2[i];
	}

	return vec1;
}

export function ang(vec) {
	return Math.atan2(vec[1], vec[0]);
}

export function dot(vec1, vec2) {
	return vec1[0] * vec2[0] + vec1[1] * vec2[1];
}

export function div(vec1, val) {
	return vec1.map(x => x / val);
}

export function divVecThis(vec1, vec2) {
	for (let i = 0; i < vec1.length; i++) {
		vec1[i] /= vec2[i];
	}

	return vec1;
}

export function mul(vec1, val) {
	return vec1.map(x => x * val);
}

export function mulVecThis(vec1, vec2) {
	for (let i = 0; i < vec1.length; i++) {
		vec1[i] *= vec2[i];
	}

	return vec1;
}

export function sub(vec1, vec2) {
	return vec1.map((x, i) => x - vec2[i]);
}

export function subThis(vec1, vec2) {
	for (let i = 0; i < vec1.length; i++) {
		vec1[i] -= vec2[i];
	}

	return vec1;
}
