/*jshint esversion: 6 */
/*jshint evil: true*/

//TODO: stop animation loop when nothing is changing

const MAX_WAVE_SIZE = 75;
const CANVAS_LENGTH = 500;
const framerate = 50;
const FIND_DISTANCE = 5;
const CANVAS_RADIUS = CANVAS_LENGTH / 2;
const MINE_COUNT = 20;
const WAVE_SPEED = 5;

let canv = document.querySelector("canvas");
canv.width = CANVAS_LENGTH;
canv.height = CANVAS_LENGTH;
let ctx  = canv.getContext("2d");
let BG_CIRCLE = new Circle(new Point(CANVAS_RADIUS,CANVAS_RADIUS),CANVAS_RADIUS);
const HIDDEN_MINES = document.querySelector('#hidden-mines');
const CLICK_COUNT = document.querySelector('#click-count');

let clickWaves = [];
let unfoundMines = [];
let foundMines = [];
let echoCircles = [];
let clicks = [];
let gameOver;


const SOUNDS = ['echo','click','victory'];
let sound = {};

window.onload = main;

function main() {
	initialize();
	newGame();
}

function initialize() {
	addEvents();
	createSoundBank();
	setInterval(draw, 1000/framerate);
}

function addEvents() {
	canv.addEventListener("click", click);
}

function click(ev) {
	let p = getCursorPosition(ev);
	let found = false;
	for (let i = 0; i < unfoundMines.length; i++) {
		let mine = unfoundMines[i];
		if (p.distanceTo(mine) <= FIND_DISTANCE) {
			foundMines.push(new FoundMine(mine));
			for (let j = 0; j < echoCircles.length; j++) {
				if (echoCircles[j].echoes(mine)) {
					echoCircles.splice(j,1);
					j--;
				}
 			}
			unfoundMines.splice(i,1);
			i--;
			found = true;
			HIDDEN_MINES.textContent = unfoundMines.length + '';
		}
		if (unfoundMines.length === 0) {
			victory();
		}
	}

	if (!found) {
		sound.click();
		addClickCirc(p);
	}
	updateClickCount();
}

function createSoundBank() {
	for (var soundName of SOUNDS) {
		createSoundFunction(soundName);
	}
}

function createSoundFunction(soundName) {
	var funcStr =
	`let sounds = [];
	let soundBankLen = 10;
	for (let i = 0; i < soundBankLen; i++) {
		sounds.push(new Audio('assets/sounds/${soundName}.mp3'));
	}
	var i = 0;
	return function() {
		sounds[i].play();
		i++;
		i %= soundBankLen;
	}()`;
	sound[soundName] = new Function(soundName,funcStr);
}

function newGame() {
	gameOver = false;
	unfoundMines = [];
	foundMines = [];
	for (let i = 0; i < MINE_COUNT; i++) {
		unfoundMines.push(new Mine(Point.randomWithinCircle()));
	}
	echoCircles = [];
	clickWaves = [];
	clicks = [];
	HIDDEN_MINES.textContent = unfoundMines.length;
}

function draw() {
	ctx.fillStyle = '#232323';
	ctx.fillRect(0,0,CANVAS_LENGTH,CANVAS_LENGTH);
	drawEchoCircles();
	drawClicks();
	drawClickWaves();
	drawFoundMines();
}

function drawClicks() {
	if (clicks.length > 0) {
		drawClearedClickBackgrounds();
		drawClickCenters();
	}
}

function drawClearedClickBackgrounds() {
	ctx.fillStyle = ClickCircle.fillColor;
	ctx.beginPath();
	for (let i = 0; i < clicks.length; i++) {
		if (clicks[i].isClear) {
			clicks[i].background.getArc(ctx, 0.95);
		}
	}
	ctx.fill();
	ctx.closePath();
}

function drawClickCenters() {
	ctx.fillStyle = ClickCircle.pointColor;
	ctx.beginPath();
	for (let i = 0; i < clicks.length; i++) {
		clicks[i].clickMark.getArc(ctx);
	}
	ctx.fill();
	ctx.closePath();
}

function drawEchoCircles() {
	ctx.strokeStyle = this.color;
	ctx.lineWidth = 1;
	ctx.beginPath();
	for (let i = 0; i < echoCircles.length; i++) {
		echoCircles[i].getArc(ctx);
	}
	ctx.stroke();
	ctx.closePath();
}

function drawClickWaves() {
	for (let i = 0; i < clickWaves.length; i++) {
		let w = clickWaves[i][0];
		let maxSize = clickWaves[i][1];
		if (w.radius > maxSize) {
			clickWaves.splice(i,1);
			i--;
			continue;
		}
		for (let mine of unfoundMines) {
			if (Math.abs(w.distanceToPoint(mine)) <= WAVE_SPEED / 2) {
				sound.echo();
				echoCircles.unshift(new EchoWave(w.center,mine));
			}
		}
		w.opacityMultiplier = (maxSize / 2 / w.radius >= 1) ? 1 : 2 * (maxSize - w.radius) / maxSize;
		w.draw(ctx);
		w.radius += WAVE_SPEED;
	}
}

function drawFoundMines() {
	for (let mine of foundMines) {
		mine.draw(ctx);
	}
}

function addClickCirc(p) {
	clickWaves.push([new Wave(p),MAX_WAVE_SIZE]);
	clicks.push(new ClickCircle(p));
}

function getCursorPosition(event) {
    var rect = canv.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    return new Point(x,y);
}

function victory() {
	sound.victory();
	gameOver = true;
}

function updateClickCount() {
	CLICK_COUNT.textContent = clicks.length;
}