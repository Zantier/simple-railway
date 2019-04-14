import React, { Component } from 'react';
import { addScalar, addThis, ang, dot, div, mul, sub, subThis } from './VecArray';
import ZoomView from './ZoomView';
import './App.css';

const TWO_PI = 2 * Math.PI;
const MOUSE_LEFT = 0;
const MOUSE_RIGHT = 2;
const tileCount = 100;
const tileWidth = 50;
const lineWidth = 1;

class TilePos {
	constructor() {
		this.floatPos = new Array(2);
		this.intPos = new Array(2);
		this.subPos = new Array(2);
		this.isVertical = false;
		this.inBounds = false;
	}

	clone = () => {
		const res = new TilePos();
		res.floatPos = [...this.floatPos];
		res.intPos = [...this.intPos];
		res.subPos = [...this.subPos];
		res.isVertical = this.isVertical;
		res.inBounds = this.inBounds;

		return res;
	}
}

// Modulus that's >= 0
function mod(a, b) {
	return (a % b + b) % b
}

// 1 if >= 0, else -1
function nonZeroSign(num) {
	return num >= 0 ? 1 : -1;
}

// Normalize and get the absolute of an angle
function absAngle(angle) {
	return Math.abs(((angle + Math.PI) % TWO_PI + TWO_PI) % TWO_PI - Math.PI);
}

function createArray(length, func) {
	const res = new Array(length);
	for (let i = 0; i < length; i++) {
		res[i] = func(i);
	}

	return res;
}

function getLine(subTile, isVertical) {
	// No line for the middle of the tile.
	if (subTile[0] === 1 && subTile[1] === 1) {
		if (isVertical) {
			return [[1,0], [1,2]];
		} else {
			return [[0,1], [2,1]];
		}
	}

	const line = new Array(2);
	if ((subTile[0] + subTile[1]) % 2 === 0) {
		// Even - corners
		line[0] = [subTile[0], 1];
		line[1] = [1, subTile[1]];
	} else {
		// Odd - sides
		line[0] = [subTile[0], subTile[1]];
		line[1] = [2 - subTile[0], 2 - subTile[1]];
	}

	return line;
}

class App extends Component {
	constructor(props) {
		super(props);
		this.zoomView = new ZoomView([-30,-30], [1,1]);
		this.doPan = false;
		// Position of the mouse, relative to the canvas
		this.mousePos = [0,0];
		this.mouseTile = new TilePos();
		this.mouseDownTile = undefined;
		this.tiles = new Array(tileCount);
		this.tiles = createArray(tileCount, () =>
			createArray(tileCount, () =>
				createArray(9, () => [])
			)
		);

		window.addEventListener('mouseup', this.handleMouseUp);
		window.addEventListener('mousemove', this.handleMouseMove);
		window.addEventListener('contextmenu', this.handleContextMenu);
	}

	componentDidMount = () => {
		this.ctx.canvas.width = 640;
		this.ctx.canvas.height = 480;
		this.draw();
	}

	handleMouseDown = evt => {
		if (evt.button === MOUSE_LEFT) {
			this.updateMouseTile();
			if (this.mouseTile.inBounds) {
				this.mouseDownTile = this.mouseTile.clone();
			}
		}

		if (evt.button === MOUSE_RIGHT) {
			this.updateMousePos(evt);
			this.doPan = true;
			this.zoomView.beginPan(this.mousePos);
		}
	}

	handleMouseUp = evt => {
		if (evt.button === MOUSE_LEFT && this.mouseDownTile) {
			this.updateMousePos(evt);
			this.updateMouseTile();

			const [tempPos, dir, count] = this.getTilesBetween(this.mouseDownTile, this.mouseTile);
			if (tempPos) {
				// Whether to add track
				const doAdd = !this.hasTrack(tempPos);

				for (let i = 0; i <= count; i++) {
					if (tempPos.intPos[0] < 0 || tempPos.intPos[0] >= tileCount ||
						tempPos.intPos[1] < 0 || tempPos.intPos[1] >= tileCount) {
						break;
					}
					const line = getLine(tempPos.subPos, tempPos.isVertical);
					const indexes = createArray(2, i => 3 * line[i][0] + line[i][1])
					const tile = this.tiles[tempPos.intPos[0]][tempPos.intPos[1]];

					// Add or remove track
					tile[indexes[0]] = tile[indexes[0]].filter(num => num !== indexes[1]);
					tile[indexes[1]] = tile[indexes[1]].filter(num => num !== indexes[0]);
					if (doAdd) {
						tile[indexes[0]].push(indexes[1]);
						tile[indexes[1]].push(indexes[0]);
					}

					addThis(tempPos.intPos, dir);
				}
			}

			this.mouseDownTile = undefined;
		}
	}

	handleMouseMove = evt => {
		this.updateMousePos(evt);
	}

	handleWheel = evt => {
		this.updateMousePos(evt);
		const zoom = -evt.deltaY/100;
		this.zoomView.addZoom(zoom, this.mousePos);
	}

	handleContextMenu = evt => {
		if (this.doPan) {
			this.doPan = false;
			evt.preventDefault();
		}
	}

	render = () => {
		return (
			<div className="App">
				<canvas onMouseDown={this.handleMouseDown} onWheel={this.handleWheel}
					ref={canvas => this.ctx = canvas.getContext('2d', {alpha: false})}>
					Your browser sucks.
				</canvas>
			</div>
		);
	}

	draw = () => {
		this.update();

		// Clear
		this.ctx.fillStyle = '#000000';
		this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

		this.ctx.save();
		this.ctx.strokeStyle = '#202020';
		this.ctx.lineWidth = lineWidth;
		const zoom = this.zoomView.getZoom();
		this.ctx.translate(this.zoomView.destPos[0], this.zoomView.destPos[1]);
		this.ctx.scale(zoom[0], zoom[1]);
		this.ctx.translate(-this.zoomView.sourcePos[0], -this.zoomView.sourcePos[1]);
		for (let i = 0; i <= tileCount; i++) {
			this.ctx.beginPath();
			this.ctx.moveTo(0, i*tileWidth);
			this.ctx.lineTo(tileCount*tileWidth, i*tileWidth);
			this.ctx.moveTo(i*tileWidth, 0);
			this.ctx.lineTo(i*tileWidth, tileCount*tileWidth);
			this.ctx.stroke();
		}

		for (let tileI = 0; tileI < tileCount; tileI++) {
			for (let tileJ = 0; tileJ < tileCount; tileJ++) {
				for (let m = 0; m < 9; m++) {
					for (let n of this.tiles[tileI][tileJ][m]) {
						const line = [
							[Math.floor(m / 3), mod(m, 3)],
							[Math.floor(n / 3), mod(n, 3)],
						];

						this.ctx.strokeStyle = 'rgb(64, 128, 64)';
						this.drawLine([tileI, tileJ], line);
					}
				}
			}
		}


		if (this.mouseDownTile) {
			const [tempPos, dir, count] = this.getTilesBetween(this.mouseDownTile, this.mouseTile);
			if (tempPos) {
				this.ctx.strokeStyle = 'rgba(64, 64, 64, 0.7)';
				for (let i = 0; i <= count; i++) {
					if (tempPos.intPos[0] < 0 || tempPos.intPos[0] >= tileCount ||
						tempPos.intPos[1] < 0 || tempPos.intPos[1] >= tileCount) {
						break;
					}

					const line = getLine(tempPos.subPos, tempPos.isVertical);
					this.drawLine(tempPos.intPos, line);

					addThis(tempPos.intPos, dir);
				}
			}
		} else {
			const line = getLine(this.mouseTile.subPos, this.mouseTile.isVertical);
			if (this.mouseTile.inBounds && line) {
				this.ctx.strokeStyle = 'rgba(64, 64, 64, 0.7)';
				this.drawLine(this.mouseTile.intPos, line);
			}
		}

		this.ctx.restore();

		requestAnimationFrame(this.draw);
	}

	drawLine = (tile, line) => {
		this.ctx.lineWidth = 5;
		this.ctx.beginPath();
		this.ctx.moveTo(tile[0]*tileWidth + line[0][0]*0.5*tileWidth,
			tile[1]*tileWidth + line[0][1]*0.5*tileWidth);
		this.ctx.lineTo(tile[0]*tileWidth + line[1][0]*0.5*tileWidth,
			tile[1]*tileWidth + line[1][1]*0.5*tileWidth);
		this.ctx.stroke();
	}

	update = () => {
		if (this.doPan) {
			this.zoomView.pan(this.mousePos);
		}
		this.zoomView.update();
		this.updateMouseTile();
	}

	hasTrack = (tilePos) => {
		const line = getLine(tilePos.subPos, tilePos.isVertical);
		if (!tilePos.inBounds) {
			return false;
		}

		const indexes = createArray(2, i => 3 * line[i][0] + line[i][1])
		const tile = this.tiles[tilePos.intPos[0]][tilePos.intPos[1]];

		// Add or remove track
		return tile[indexes[0]].includes(indexes[1]);
	}

	// Get the tiles to fill in from dragging the mouse
	//
	// tilePos1: Start tile
	// tilePos2: End tile
	// return: [tilePos, dir, count]
	getTilesBetween = (tilePos1, tilePos2) => {
		if (!tilePos1.inBounds) {
			return [];
		}

		if (tilePos1.intPos[0] === tilePos2.intPos[0] && tilePos1.intPos[1] === tilePos2.intPos[1]) {
			return [tilePos2, [0,0], 0];
		}

		// Where mouse ended, relative to middle of start tile
		const mousePos = sub(tilePos2.floatPos, addScalar(tilePos1.intPos, 0.5));
		// Nearest 45 degree direction
		const dir45 = [nonZeroSign(mousePos[0]), nonZeroSign(mousePos[1])];
		const ang45 = ang(dir45);

		// Nearest 90 degree direction
		let dir90 = undefined;
		if (Math.abs(mousePos[0]) > Math.abs(mousePos[1])) {
			dir90 = [nonZeroSign(mousePos[0]), 0];
		} else {
			dir90 = [0, nonZeroSign(mousePos[1])];
		}
		const ang90 = ang(dir90);

		// Where mouse ended, relative to edge of start tile
		const edgePos = sub(mousePos, mul(dir90, 0.5));
		const angMouse = ang(edgePos);

		if (absAngle(angMouse - ang45) < absAngle(angMouse - ang90)) {
			// Move in 45 degree direction
			return [];
		} else {
			// Move in 90 degree direction
			const count = Math.ceil(dot(dir90, edgePos));
			const returnPos = tilePos1.clone();
			returnPos.subPos = subThis([1,1], dir90);
			return [returnPos, dir90, count];
		}
	}

	updateMousePos = evt => {
		const rect = this.ctx.canvas.getBoundingClientRect();
		this.mousePos[0] = evt.clientX - rect.left;
		this.mousePos[1] = evt.clientY - rect.top;
	}

	updateMouseTile = () => {
		const sourcePos = this.zoomView.destToSource(this.mousePos);
		const prevIsVertical = this.mouseTile.isVertical;
		for (let i = 0; i < 2; i++) {
			const floatPos = sourcePos[i] / tileWidth;
			this.mouseTile.floatPos[i] = floatPos
			this.mouseTile.intPos[i] = Math.floor(floatPos);
			const remainder = mod(sourcePos[i], tileWidth);
			this.mouseTile.subPos[i] = Math.floor(remainder / tileWidth * 3);
		}

		this.mouseTile.isVertical = this.mouseTile.subPos[0] % 2 === 1 && (
			this.mouseTile.subPos[1] % 2 === 0 || prevIsVertical);

		this.mouseTile.inBounds = this.mouseTile.intPos[0] >= 0 && this.mouseTile.intPos[0] < tileCount && this.mouseTile.intPos[1] >= 0 && this.mouseTile.intPos[1] < tileCount;
	}
}

export default App;
