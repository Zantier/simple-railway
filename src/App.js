import React, { Component } from 'react';
import ZoomView from './ZoomView';
import './App.css';

const MOUSE_LEFT = 0;
const MOUSE_RIGHT = 2;

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

		this.draw();
	}

	updateMousePos = evt => {
		const rect = this.ctx.canvas.getBoundingClientRect();
		this.mousePos[0] = evt.clientX - rect.left;
		this.mousePos[1] = evt.clientY - rect.top;
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
		this.ctx.fillStyle = '#404040';
		const zoom = this.zoomView.getZoom();
		this.ctx.translate(this.zoomView.destPos[0], this.zoomView.destPos[1]);
		this.ctx.scale(zoom[0], zoom[1]);
		this.ctx.translate(-this.zoomView.sourcePos[0], -this.zoomView.sourcePos[1]);
		const tileCount = 10;
		const tileWidth = 20;
		const lineWidth = 2;
		for (let i = 0; i < 10; i++) {
			this.ctx.fillRect(0, i*tileWidth, tileCount*tileWidth, lineWidth);
			this.ctx.fillRect(i*tileWidth, 0, lineWidth, tileCount*tileWidth);
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
}

export default App;
