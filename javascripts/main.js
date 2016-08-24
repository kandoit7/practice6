var audioContext = new (window.AudioContext || window.webkitAudioContext) ();
var masterInputSelector = document.createElement('select');

function recordTest () {

	recordTest.audioRecorder = null;
	recordTest.recIndex = 0;
	recordTest.canvasID = null;
	recordTest.lrecord = null;
	recordTest.tracklink = null;
	recordTest.downlink = null;
	
	recordTest.gotBuffer = function(buffers) {
		var ci = "c"+canvasID;
		var canvas = document.getElementById(ci);
		drawBuffer(canvas.width, canvas.height, canvas.getContext('2d'), buffers[0]);
		audioRecorder.exportWAV(doneEncoding);
	}
	
	recordTest.doneEncoding = function(blob) {
		Recorder.setupDownload(blob, "myRecording" + ((recIndex<10)?"0":"") + recIndex + ".wav");
		recIndex++;
	}
	
	recordTest.play = function(e) {
		var track = new Audio(tracklink.href);
	}
	
	recordTest.down = function(e) {
		tracklink = document.createElement('a');
		tracklink.id = lrecord;
		tracklink.href = downlink.href;
		e.appendChild(tracklink);
	}
	
	recordTest.toggleRecording = function(e) {
		canvasID = e.id;
		var imgChange = e;
		if(e.classList.containts("recording")) {
			audioRecorder.stop();
			e.classList.remove("recording");
			imgChange.src = 'images/mic.png';
			lrecord = "l" + e.id;
			audioRecorder.getBuffers(gotBuffer);
			downlink = document.getElementById('save');
		} else {
			if(!audioRecorder)
				return;
			
			e.classList.add("recording");
			imgChange.src = 'images/micrec.png';
			audioRecorder.clear();
			audioRecorder.record();
		}
	}
	
	recordTest.initAudio = function(index) {
		var audioSource = index.value;
		var constraints = {
			audio: {deviceId: audioSource ? {exact: audioSource} : undefined}
		};
		
		navigator.mediaDevices.getUserMedia(constraints).then(gotStream).catch(handleError);
	}
	
	recordTest.gotStream = function(stream) {
		
		var realAudioInput = audioContext.createMediaStreamSource(stream);
		var audioInput = realAudioInput;
		
		var inputPoint = audioContext.createGain();
		inputPoint.gain.value = 1.0;
		audioInput.connect(inputPoint);
		//audioInput = convertToMono( input );
		
		var analyserNode = audioContext.createAnalyser();
		analyserNode.fftSize = 2048;
		inputPoint.connect( analyserNode );
		
		audioRecorder = new Recorder( inputPoint ); // this fuck what the fuck
		
		inputPoint.connect(audioContext.destination);
		
	}
}

function gotDevices(deviceInfos) {
	
	for (var i = 0; i !== deviceInfos.length; ++i) {
		var deviceInfo = deviceInfos[i];
		var option = document.createElement('option');
		option.value = deviceInfo.deviceId;
		if (deviceInfo.kind === 'audioinput') {
			option.text = deviceInfo.label || 'microphone ' + (masterInputSelector.length + 1);
			masterInputSelector.appendChild(option);
		}
	}
	
	var audioInputSelect = document.querySelectorAll('select#change');
	for ( var selector = 0; selector < audioInputSelect.length; selector++) {
		var newInputSelector = masterInputSelector.cloneNode(true);
		newInputSelector.addEventListener('change', changeAudioDestination);
		audioInputSelect[selector].parentNode.replaceChild(newInputSelector, audioInputSelect[selector]);
	}
}

function changeAudioDestination(event) {
	var InputSelector = event.path[0];
	initAudio(InputSelector);
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

var firstRecord = new recordTest();
