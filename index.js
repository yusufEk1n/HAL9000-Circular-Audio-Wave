var c = null;
var cO = null;
var cT = null;
var ctx = null;

var audioCtx = null;
var analyser = null;
var source = null;
var bufferLength = null;
var dataArray = null;
var microphone = null;

var base = document.querySelector(".lens");
var animation = document.querySelector(".animation");

var recordButton = document.querySelector("#recordButton");
var resetButton = document.querySelector("#resetButton");

recordButton.addEventListener("click", useMic);
resetButton.addEventListener("click", reset);

$(function () {
	initBinCanvas();
});

function useMic() {
	navigator.mediaDevices.getUserMedia({ audio: true, video: false })
		.then(function (stream) {

			if (resetButton.disabled) {
				resetButton.disabled = false;
				recordButton.disabled = true;
			}

			microphone = stream;
			setup();

			function draw() {

				analyser.getByteFrequencyData(dataArray);

				SetOpacity(dataArray, bufferLength);
				drawBars(dataArray);

				requestAnimationFrame(draw);
			}

			draw();
		})
		.catch(function (err) {
            //Mikrofon verileri alınamadı. Lütfen desteklenen bir tarayıcıda deneyiniz. to english
            alert("Can't get microphone data! (Please try in a supported browser)")
		});
}

function initBinCanvas() {
	c = document.getElementById("audioWaveCanvas");
	c.width = base.offsetWidth + 100;
	c.height = base.offsetHeight + 100;
	ctx = c.getContext("2d");

	window.addEventListener("resize", onWindowResize, false);

	cO = document.getElementById("opacityCanvas");
	cO.width = base.offsetWidth;
	cO.height = base.offsetHeight;
	cT = cO.getContext('2d');
}

function onWindowResize() {
	c.width = base.offsetWidth + 100;
	c.height = base.offsetHeight + 100;
}

function setup() {
	audioCtx = new AudioContext();
	analyser = audioCtx.createAnalyser();
	source = audioCtx.createMediaStreamSource(microphone);
	source.connect(analyser);
	analyser.fftSize = 512;
	bufferLength = analyser.frequencyBinCount;
	dataArray = new Uint8Array(bufferLength);
}

function reset() {
	if (typeof microphone !== "undefined") {
		microphone.getTracks().forEach(function (track) {
			track.stop();
		});
	}
	if (typeof source !== "undefined") {
		source.disconnect();
	}
	if (recordButton.disabled) {
		recordButton.disabled = false;
		resetButton.disabled = true;
	}

	cO.style.opacity = 0;
}

function drawBars(array) {
	const threshold = 0;
	const maxBinCount = array.length;
	const average = array.reduce((acc, value) => acc + value, 0) / maxBinCount;

	if (average > 40) {
		someOneTalking.innerHTML = "Someone is talking";
	} else {
		someOneTalking.innerHTML = "...";
	}

	ctx.clearRect(0, 0, c.width, c.height);
	ctx.save();
	ctx.globalCompositeOperation = "source-over";
	ctx.scale(0.5, 0.5);
	ctx.translate(ctx.canvas.width, ctx.canvas.height);
	ctx.fillStyle = "#df0000";

	const radius = -(base.offsetWidth + 1);
	const bar_length_factor = $(window).width() >= 785 ? 3.0 : 7.0;

	for (var i = 0; i < maxBinCount; i++) {

		var value = array[i];
		if (value >= threshold) {
			ctx.fillRect(0, radius, $(window).width() <= 450 ? 2 : 3, -value / bar_length_factor);
			ctx.rotate((180 / 128) * Math.PI / 360);
		}
	}

	for (var i = 0; i < maxBinCount; i++) {

		var value = array[i];
		if (value >= threshold) {
			ctx.fillRect(0, radius, $(window).width() <= 450 ? 2 : 3, -value / bar_length_factor);
			ctx.rotate(-(180 / 128) * Math.PI / 360);
		}
	}

	for (var i = 0; i < maxBinCount; i++) {

		var value = array[i];
		if (value >= threshold) {
			ctx.fillRect(0, radius, $(window).width() <= 450 ? 2 : 3, -value / bar_length_factor);
			ctx.rotate(-(180 / 128) * Math.PI / 360);
		}
	}

	for (var i = 0; i < maxBinCount; i++) {

		var value = array[i];
		if (value >= threshold) {
			ctx.fillRect(0, radius, $(window).width() <= 450 ? 2 : 3, -value / bar_length_factor);
			ctx.rotate((180 / 128) * Math.PI / 360);
		}
	}

	ctx.restore();
}


function SetOpacity(dataArray, bufferLength) {

	cT.clearRect(0, 0, cO.width, cO.height);

	let average = 0;
	for (let i = 0; i < bufferLength; i++) {
		average += dataArray[i];
	}

	average = average / bufferLength;
	cO.style.opacity = average / 75;
	animation.style.border = "solid " + (average / 75) + "px #fff300";
}