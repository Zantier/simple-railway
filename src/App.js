import React, { Component } from 'react';
import ZoomView from './ZoomView';
import './App.css';

const MOUSE_LEFT = 0;
const MOUSE_RIGHT = 2;
const tileCount = 100;
const tileWidth = 50;
const lineWidth = 1;

class TilePos {
	constructor() {
		this.pos = new Array(2);
		this.subPos = new Array(2);
		this.isVertical = false;
		this.inBounds = false;
	}
}

function mod(a, b) {
	return (a % b + b) % b
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

			const line = getLine(this.mouseTile.subPos, this.mouseTile.isVertical);
			if (this.mouseTile.inBounds && line) {
				const indexes = createArray(2, i => 3 * line[i][0] + line[i][1])
				const tile = this.tiles[this.mouseTile.pos[0]][this.mouseTile.pos[1]];

				// Add or remove track
				if (tile[indexes[0]].includes(indexes[1])) {
					tile[indexes[0]] = tile[indexes[0]].filter(num => num !== indexes[1]);
					tile[indexes[1]] = tile[indexes[1]].filter(num => num !== indexes[0]);
				} else {
					tile[indexes[0]].push(indexes[1]);
					tile[indexes[1]].push(indexes[0]);
				}
			}
		}

		if (evt.button === MOUSE_RIGHT) {
			this.updateMousePos(evt);
			this.doPan = true;
			this.zoomView.beginPan(this.mousePos);
		}
	}

	handleMouseUp = evt => {
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

	updateMousePos = evt => {
		const rect = this.ctx.canvas.getBoundingClientRect();
		this.mousePos[0] = evt.clientX - rect.left;
		this.mousePos[1] = evt.clientY - rect.top;
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

		this.updateMouseTile();
		const line = getLine(this.mouseTile.subPos, this.mouseTile.isVertical);
		if (this.mouseTile.inBounds && line) {
			this.ctx.strokeStyle = 'rgba(64, 64, 64, 0.7)';
			this.drawLine(this.mouseTile.pos, line);
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
	}

	updateMouseTile = () => {
		const sourcePos = this.zoomView.destToSource(this.mousePos);
		const prevIsVertical = this.mouseTile.isVertical;
		for (let i = 0; i < 2; i++) {
			this.mouseTile.pos[i] = Math.floor(sourcePos[i] / tileWidth);
			const remainder = mod(sourcePos[i], tileWidth);
			this.mouseTile.subPos[i] = Math.floor(remainder / tileWidth * 3);
		}

		this.mouseTile.isVertical = this.mouseTile.subPos[0] % 2 === 1 && (
			this.mouseTile.subPos[1] % 2 === 0 || prevIsVertical);

		this.mouseTile.inBounds = this.mouseTile.pos[0] >= 0 && this.mouseTile.pos[0] < tileCount && this.mouseTile.pos[1] >= 0 && this.mouseTile.pos[1] < tileCount;
	}
}

export default App;
