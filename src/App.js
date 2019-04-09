import React, { Component } from 'react';
import ZoomView from './ZoomView';
import './App.css';

//const MOUSE_LEFT = 0;
const MOUSE_RIGHT = 2;
const tileCount = 100;
const tileWidth = 50;
const lineWidth = 1;

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

class App extends Component {
	constructor(props) {
		super(props);
		this.zoomView = new ZoomView([-30,-30], [1,1]);
	}

	componentDidMount = () => {
		window.addEventListener('mouseup', this.handleMouseUp);
		window.addEventListener('mousemove', this.handleMouseMove);
		window.addEventListener('contextmenu', this.handleContextMenu);
		this.ctx.canvas.width = 640;
		this.ctx.canvas.height = 480;
		this.doPan = false;
		// Position of the mouse, relative to the canvas
		this.mousePos = [0,0];
		this.tiles = new Array(tileCount);
		this.tiles = createArray(tileCount, () =>
			createArray(tileCount, () =>
				createArray(9, () => [])
			)
		);

		this.draw();
	}

	handleMouseDown = evt => {
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
		const zoom = -Math.sign(evt.deltaY);
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
		for (let i = 0; i < tileCount; i++) {
			this.ctx.beginPath();
			this.ctx.moveTo(0, i*tileWidth);
			this.ctx.lineTo(tileCount*tileWidth, i*tileWidth);
			this.ctx.moveTo(i*tileWidth, 0);
			this.ctx.lineTo(i*tileWidth, tileCount*tileWidth);
			this.ctx.stroke();
		}

		const [mouseTile, mouseSubTile] = this.getMouseTile();
		// Don't draw if mouse is in the middle of the tile.
		if (mouseSubTile[0] !== 1 || mouseSubTile[1] !== 1) {
			let line = new Array(2);
			if ((mouseSubTile[0] + mouseSubTile[1]) % 2 === 0) {
				// Even - corners
				line[0] = [mouseSubTile[0], 1];
				line[1] = [1, mouseSubTile[1]];
			} else {
				// Odd - sides
				line[0] = [mouseSubTile[0], mouseSubTile[1]];
				line[1] = [2 - mouseSubTile[0], 2 - mouseSubTile[1]];
			}

			this.ctx.lineWidth = 5;
			this.ctx.beginPath();
			this.ctx.moveTo(mouseTile[0]*tileWidth + line[0][0]*0.5*tileWidth,
				mouseTile[1]*tileWidth + line[0][1]*0.5*tileWidth);
			this.ctx.lineTo(mouseTile[0]*tileWidth + line[1][0]*0.5*tileWidth,
				mouseTile[1]*tileWidth + line[1][1]*0.5*tileWidth);
			this.ctx.stroke();
		}

		this.ctx.restore();

		requestAnimationFrame(this.draw);
	}

	update = () => {
		if (this.doPan) {
			this.zoomView.pan(this.mousePos);
		}
		this.zoomView.update();
	}

	getMouseTile = () => {
		const sourcePos = this.zoomView.destToSource(this.mousePos);
		const res = createArray(2, () => new Array(2));
		for (let i = 0; i < 2; i++) {
			res[0][i] = Math.floor(sourcePos[i] / tileWidth);
			const remainder = mod(sourcePos[i], tileWidth);
			res[1][i] = Math.floor(remainder / tileWidth * 3);
		}

		return res;
	}
}

export default App;
