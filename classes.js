/*jshint esversion: 6 */

class Point {
	constructor(x,y) {
		this.x = Math.floor(x);
		this.y = Math.floor(y);
	}

	distanceTo(p) {
		var dx = Math.abs(this.x - p.x);
		var dy = Math.abs(this.y - p.y);
		return Math.sqrt(dx*dx + dy*dy);
	}

	equals(p) {
		return this.x === p.x && this.y === p.y;
	}

	// https://stackoverflow.com/questions/5837572/generate-a-random-point-within-a-circle-uniformly
	static randomWithinCircle(boundingCircle=BG_CIRCLE, padding=FIND_DISTANCE) {
		var t = 2*Math.PI*Math.random(); // random angle less than tau
		var u = Math.random()+Math.random(); // creates bell curve around 1
		var r = (u>1) ? 2-u : u; // folds bell curve in half, weighting toward 1
		var radius = boundingCircle.radius - padding;
		var x = radius * r * Math.cos(t) + boundingCircle.center.x;
		var y = radius * r * Math.sin(t) + boundingCircle.center.y;
		return new Point(x,y);
	}
}

class Circle {
	constructor(center, radius=FIND_DISTANCE, color='blue') {
		this.center = center;
		this.radius = radius;
		this.color = color;
	}

	distanceToCirc(c) {
		return this.center.distanceTo(c.center) - this.radius - c.radius;
	}
	distanceToPoint(p) {
		return this.center.distanceTo(p) - this.radius;
	}

	contains(p) {
		return this.distanceToPoint(p) <= 0;
	}

	draw(ctx) {
		ctx.beginPath();
		ctx.arc(this.center.x,this.center.y,this.radius,0,2*Math.PI);
		ctx.fillStyle = this.color;
		ctx.fill();
		ctx.closePath();
	}

	getArc(ctx, modifier = 1) {
		let modRad = Math.floor(this.radius * modifier);
		ctx.moveTo(this.center.x + modRad, this.center.y);
		ctx.arc(this.center.x, this.center.y, modRad, 0, 2*Math.PI);
	}
}

class Mine extends Point {
	constructor(p) {
		super(p.x,p.y);
		this.clickCircles = [];
	}
}

class FoundMine extends Circle {
	constructor(center, radius=FIND_DISTANCE/2, color="orange") {
		super(center, radius, color);
		for (let clickCircle of center.clickCircles) {
			let i = clickCircle.mines.indexOf(center);
			clickCircle.mines.splice(i,1);
			clickCircle.update();
		}
	}
}

class Wave extends Circle {

	constructor(center, radius=1, opacityMultiplier=1) {
		super(center, radius);
		this.opacityMultiplier = opacityMultiplier;
	}

	set color(val) {}

	get color() {
		let opacity =  0.5 * this.opacityMultiplier;
		return 'rgba(255,255,255,' + opacity + ')';
	}

	draw(ctx) {
		ctx.strokeStyle = this.color;
		ctx.lineWidth = FIND_DISTANCE;
		ctx.beginPath();
		ctx.arc(this.center.x,this.center.y,this.radius,0,2*Math.PI);
		ctx.stroke();
		ctx.closePath();
	}
}

class EchoWave extends Wave {
	constructor(center, echoPoint) {
		let radius = center.distanceTo(echoPoint);
		super(center, radius);
		this.echoPoint = echoPoint;
	}

	echoes(p) {
		return this.echoPoint.equals(p);
	}
}

class ClickCircle {

	constructor(center) {
		this.background = new Circle(center, MAX_WAVE_SIZE);
		this.clickMark = new Circle(center, (FIND_DISTANCE / 2));
		this.mines = [];
		this.isClear = false;
		for (let mine of unfoundMines) {
			if (this.background.contains(mine)) {
				this.mines.push(mine);
				mine.clickCircles.push(this);
			}
		}
		this.update();
	}

	update() {
		this.isClear = (this.mines.length === 0);
	}

	static get fillColor() {
		return 'rgba(100,200,100,0.5';
	}

	static get pointColor() {
		return 'cyan';
	}
}
