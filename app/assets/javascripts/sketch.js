let canvas;
let microphone;
let amplitude;
let fft;

function setup() {
	// determine if p5.js should run this //////////////////////////////////////
	if ( $('.playerPage').length === 0 ) {
		return;
	} //////////////////////////////////////////////////////////////////////////

	canvas = createCanvas( windowWidth, windowHeight );
	frameRate( 30 );
	background(0);
	noStroke();
	colorMode(HSB, 255);

	// // new audio in
	// microphone = new p5.AudioIn();
	// // turn on listener
	// microphone.start();

	// // setup new spectrum analyser
	// fft = new p5.FFT(0, 16);
	// fft.setInput( microphone );
}

function draw() {
	// determine if p5.js should run this //////////////////////////////////////
	if ( $('.playerPage').length === 0 ) {
		return;
	} //////////////////////////////////////////////////////////////////////////

	background( 0 );

	// let level = microphone.getLevel();

	// let spectrum = fft.analyze();
	// console.log( spectrum );

	ellipse( windowWidth / 2, windowHeight / 2, windowWidth / 3, windowWidth / 3 );
}

function windowResized() {
	// determine if p5.js should run this //////////////////////////////////////
	if ( $('.playerPage').length === 0 ) {
		return;
	} //////////////////////////////////////////////////////////////////////////

	resizeCanvas( windowWidth, windowHeight );
}