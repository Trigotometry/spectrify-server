<script>
	function spectrify() {

		// Web Audio API variables
		var audioElement;
		var track;
		var audioCtx;
		var analyser;
		var filter;
		var bufferLength;
		var dataArray;

		// A little note on how this works. The audio is broken up into
		// an array which represents the power (or energy) in the most recent
		// portion of audio. But this energy is broken up across the freq
		// spectrum. The first elements in the array show how much power is
		// in the lower frequencies, the last ones in the highest frequencies
		// and the rest in between.
		// Annoyingly the data is not directly related to WHICH frequency but rather
		// is linearly spread across however many elements the array has, which is
		// determined by the sample rate.
		// What I decided to do was sum the enegry in three bands: bass, mids and treble,
		// and use those sums and look for peaks, which cause a new glyph to be displayed.
		// So these 6 variables are the start and end frequencies for each of the Low, Mid
		// and High bands...
		// Low is 60 to 180 Hz, Mid 280 - 1.6k etc
		var minLF = 60; // Hz
		var maxLF = 280; // Hz
		var minMF = 280; // Hz
		var maxMF = 1600; // Hz
		var minHF = 1600; // Hz
		var maxHF = 8250; // Hz

		// these variables are used when we convert frequencies to index positions
		// in the array of audio energy data
		var LFindexStart;
		var LFindexEnd;

		var MFindexStart;
		var MFindexEnd;

		var HFindexStart;
		var HFindexEnd;

		// rAF happens every 16.66ms approx, so around 800 samples have happened
		// - the fft size is twice the buffer length (in samples) so use 2048
		// or else we miss bits of the audio between frames
		var fftSize = 1024; // 2048;

		// so these variables are used in the peak detection for each freq band.
		// I store the last peak, and gradually decrease it by a certain rate, simulating
		// a 'release' of an envelope. Might be worth investigating signal smoothing if
		// this doesn't work well enough. EG Savitzky-Golay
		var prevpeakL = 60; // = 128;
		var peakFallRateL = 0.1;
		var peakFallLimitL = 60;

		var prevpeakM = 60; // = 128;
		var peakFallRateM = 0.2;
		var peakFallLimitM = 60;

		var prevpeakH = 60; // = 128;
		var peakFallRateH = 0.3;
		var peakFallLimitH = 60;

		// these are used for throttling the requestAnimationFrame
		var ticker = 0;
		var maxticks = 5;

		async function play( element, src ) {
			let sound;
			ctl.style.display = 'none';
			try {
				sound = await playAudio();
				document.addEventListener( 'touchstart', mouseMove, false );
				document.addEventListener( "mousemove", mouseMove, false );
			} catch ( e ) {
				ctl.style.display = 'block';
			}
		}

		function playAudio() {
			var promise = audioElement.play();
			if ( promise !== undefined ) {
				return promise;
			}
		}

		// set things up
		function spectrify() {

			// set up audio
			audioElement = document.querySelector( 'audio' );
			audioElement.setAttribute( 'src', audioFilename );
			audioElement.load();

			// add the play button functionality, and make it vanish
			window.addEventListener( 'click', function() {
				audioElement.play();
				audioCtx.resume();
				ctl.style.display = "none";

				document.addEventListener( 'touchstart', mouseMove, false );
				document.addEventListener( "mousemove", mouseMove, false );
			} );

			// display audio timestamp in header
			audioElement.addEventListener( "timeupdate", updateTime, false );

			function updateTime() {
				let mins = Math.floor( audioElement.currentTime / 60 );
				let secs = Math.floor( audioElement.currentTime % 60 );
				if ( secs < 10 ) {
					secs = '0' + String( secs );
				}
				duration.innerHTML = mins + ':' + secs + '/' + trackDuration;
			}

			// audio context set up
			audioCtx = new( window.AudioContext || window.webkitAudioContext )();

			// connect where the audio will come from
			var source = audioCtx.createMediaElementSource( audioElement );

			// find out sample rate of our audio
			var sampleRate = audioCtx.sampleRate;

			// set up the analyser
			analyser = audioCtx.createAnalyser();
			analyser.minDecibels = -100;
			analyser.maxDecibels = -1;
			analyser.smoothingTimeConstant = 0.98;

			// tried getting envelope following working with a filter
			// but results where not good for all audio types:

			//filter = audioCtx.createBiquadFilter();
			//filter.type = "lowpass";
			// source.connect(filter);

			// hook up the analyser
			source.connect( analyser );

			//filter.frequency.value = 70;
			//filter.connect(analyser);

			// make sure the audio gets to the destination
			source.connect( audioCtx.destination );

			///filter.connect(audioCtx.destination);

			// set up analysis
			analyser.fftSize = fftSize;
			bufferLength = analyser.frequencyBinCount;
			dataArray = new Uint8Array( bufferLength );

			// now we know how long our array (dataArray) of audio energies will
			// be, determine which parts of that array fit our desired frequency
			// bands:
			LFindexStart = Math.round( minLF / sampleRate * bufferLength );
			LFindexEnd = Math.round( maxLF / sampleRate * bufferLength );

			MFindexStart = Math.round( minMF / sampleRate * bufferLength );
			MFindexEnd = Math.round( maxMF / sampleRate * bufferLength );

			HFindexStart = Math.round( minHF / sampleRate * bufferLength );
			HFindexEnd = Math.round( maxHF / sampleRate * bufferLength );
			/*
			console.log(
			  LFindexStart + ' ' +
			  LFindexEnd + ' ' +
			  MFindexStart + ' ' +
			  MFindexEnd + ' ' +
			  HFindexStart + ' ' +
			  HFindexEnd
			);
			*/
			play();
			tick(); // let's go!
		}

		function tick() {
			// this is for throttling. tick runs every rAF, but spectrifyListen (which does the
			// real work), is only run when the ticker counts up to maxticks.

			requestAnimationFrame( tick );
			ticker++;

			if ( ticker == maxticks ) {
				ticker = 0;
				spectrifyListen();
			}

		}

		function spectrifyListen() {

			// Analyse the recent snippet of audio and work out if
			// we should spit another glyph onto the screen.

			// get latest audio data
			analyser.getByteFrequencyData( dataArray );
			// frequency bins are linearly spread across the
			// frequencies from 0 to 1/2 the sample rate.
			// Which is actually pretty crappy. Oh well.

			// sum audio energy in low freq range
			var v = 0;
			for ( var i = LFindexStart; i <= LFindexEnd; i++ ) {
				v += dataArray[ i ];
			}
			var peakL = Math.ceil( v / ( LFindexEnd - LFindexStart + 1 ) );

			// sum audio energy in mid freq range
			v = 0;
			for ( var i = MFindexStart; i <= MFindexEnd; i++ ) {
				v += dataArray[ i ];
			}
			var peakM = Math.ceil( v / ( MFindexEnd - MFindexStart + 1 ) );

			// sum audio energy in high freq range
			v = 0;
			for ( var i = HFindexStart; i <= HFindexEnd; i++ ) {
				v += dataArray[ i ];
			}
			var peakH = Math.ceil( v / ( HFindexEnd - HFindexStart + 1 ) );

			// will we need to add a new glyph, for each freq band?
			var addL = false;
			var addM = false;
			var addH = false;

			// find out if we have jumped up above previous peak level:
			if ( peakL > prevpeakL * tr ) { // tr is a scaling threshhold.
				prevpeakL = peakL; // if we have a new peak, set prev peak to be that high.
				addL = true; // and say we want a new glyph
			} else {
				// else gradually lower previous peak, kinda like a release envelope
				prevpeakL = prevpeakL - peakFallRateL;
				if ( prevpeakL < peakFallLimitL ) {
					prevpeakL = peakFallLimitL;
				}
			}
			// do same for mids
			if ( peakM > prevpeakM * tr ) {
				prevpeakM = peakM;
				addM = true;
			} else {
				prevpeakM = prevpeakM - peakFallRateM;
				if ( prevpeakM < peakFallLimitM ) {
					prevpeakM = peakFallLimitM;
				}
			}
			// and treble
			if ( peakH > prevpeakH * tr ) {
				prevpeakH = peakH;
				addH = true;
			} else {
				prevpeakH = prevpeakH - peakFallRateH;
				if ( prevpeakH < peakFallLimitH ) {
					prevpeakH = peakFallLimitH;
				}
			}

			// if any freq band has peaked, add a new letter (aka glyph)
			if ( addL || addM || addH ) {
				lfeAddLetter();
			}

			// update debug/info box
			var dbg = ( addL ? '[' : '.' ) + prevpeakL.toFixed( 2 ) + ' ' + peakL + ( addL ? ']' : '.' ) +
				( addM ? '[' : '.' ) + prevpeakM.toFixed( 2 ) + ' ' + peakM + ( addM ? ']' : '.' ) +
				( addH ? '[' : '.' ) + prevpeakH.toFixed( 2 ) + ' ' + peakH + ( addH ? ']' : '.' );

			// span.innerHTML =  dbg;
			//console.log(dbg);

		}

		function lfeHandleKeypress( e ) {

			var event = window.event ? window.event : e;
			if ( event.keyCode === 73 ) { // key = "i"
				// toggle info window
				if ( infoOn === true ) {
					//    span.style.display = "none";
					infoOn = false;
				} else {
					//    span.style.display = "block";
					infoOn = true;
				}
			}
			if ( event.keyCode === 74 ) {
				//   audioElement.pause();
			}
			if ( event.keyCode === 75 ) {
				//   audioElement.play();
			}

		}

		spectrify(); // get started...

	}
</script>
<script>
	var tr = '1.03';
	var blurb = 'LauNauAmphipoda';
	var audioFilename = 'http://www.longformeditions.com/content/1-releases/2-2019/6-April/2-LE022_LauNau_Amphipoda/Lau%20Nau%20-%20Amphipoda.mp3';
	var glyphPath = 'http://www.longformeditions.com/content/1-releases/2-2019/6-April/2-LE022_LauNau_Amphipoda/glyphs/';
	var trackDuration = '20:09';
	document.onload = spectrify();
</script>