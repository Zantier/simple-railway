import React, { Component } from 'react';
import './App.css';

const MOUSE_LEFT = 0;
const MOUSE_RIGHT = 2;

/*
 * Get the position of the mouse relative to an element.
 */
function getMousePos(element, evt) {
	const rect = element.getBoundingClientRect();
	return [
		evt.clientX - rect.left,
		evt.clientY - rect.top,
	];
}

class App extends Component {
	componentDidMount = () => {
		window.addEventListener('mouseup', this.handleMouseUp);
		window.addEventListener('contextmenu', this.handleContextMenu);
		this.ctx.canvas.width = 640;
		this.ctx.canvas.height = 480;
		this.lastTime = Date.now();
		this.test = 0;
		this.rightClickPos = undefined;

		this.draw();
	}

	handleMouseDown = evt => {
		if (evt.button === MOUSE_RIGHT) {
			this.rightClickPos = getMousePos(this.ctx.canvas, evt);
		}
	}

	handleMouseUp = evt => {
	}

	handleWheel = evt => {
	}

	handleContextMenu = evt => {
		if (this.rightClickPos) {
			this.rightClickPos = undefined;
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
		this.ctx.fillStyle = '#000000';
		this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

		this.ctx.fillStyle = '#cccccc';
		var testWidth = 100;
		this.ctx.fillRect(testWidth + testWidth * Math.cos(this.test), testWidth + testWidth * Math.sin(this.test), 10, 10);

		requestAnimationFrame(this.draw);
	}

	update = () => {
		var nowTime = Date.now();
		var timeDiff = nowTime - this.lastTime;
		this.lastTime = nowTime;

		this.test += timeDiff/1000;
	}
}

export default App;
