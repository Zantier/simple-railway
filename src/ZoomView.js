import { addThis, divVecThis, mult, multVecThis, sub } from './VecArray';

/*
 * Convert between a source coordinate system, and a destination (typically
 * a view, such as a canvas). Allows for zooming and panning.
 */
export default class ZoomView {
	constructor(sourcePos, initialZoom) {
		this.sourcePos = sourcePos;
		this.destPos = [0,0];
		this.initialZoom = initialZoom;
		// The target for how zoomed in to be
		this.targetZoomLevel = 0;
		// How zoomed in we actually are
		this.zoomLevel = 0;
	}

	update = () => {
		const val = 0.1;
		this.zoomLevel = (1 - val) * this.zoomLevel + val * this.targetZoomLevel;
	}

	getZoom = () => {
		const zoomVal = Math.pow(Math.E, this.zoomLevel);
		const res = mult(this.initialZoom, zoomVal);
		return res;
	}

	sourceToDest = pair => {
		const zoom = this.getZoom();
		let res = sub(pair, this.sourcePos);
		multVecThis(res, zoom);
		addThis(res, this.destPos);
		return res;
	}

	destToSource = pair => {
		const zoom = this.getZoom();
		let res = sub(pair, this.destPos);
		divVecThis(res, zoom);
		addThis(res, this.sourcePos);
		return res;
	}

	beginPan = destPos => {
		const sourcePos = this.destToSource(destPos);
		this.destPos = [...destPos];
		this.sourcePos = sourcePos;
	}

	pan = destPos => {
		this.destPos = [...destPos];
	}

	addZoom(delta, destPos) {
		this.targetZoomLevel += delta;

		const sourcePos = this.destToSource(destPos);
		this.destPos = [...destPos];
		this.sourcePos = sourcePos;
	}
}
