import React, { Component } from 'react';
import './App.css';

class App extends Component {
	componentDidMount = () => {
		this.ctx.canvas.width = 300;
		this.ctx.canvas.height = 400;
		this.lastTime = Date.now();
		this.test = 0;

		this.draw();
	}

	render = () => {
		return (
			<div className="App">
				<canvas ref={canvas => this.ctx = canvas.getContext('2d', {alpha: false})}>
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
