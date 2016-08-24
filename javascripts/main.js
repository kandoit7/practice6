var audioContext = new (window.AudioContext || window.webkitAudioContext) ();

function recordTest () {};

//var audioRecorder = null;
var test1 = null;

function gotBuffers( buffers ) {
	var ci = "c"+canvasID1;
   	var canvas = document.getElementById(ci);
	drawBuffer( canvas.width, canvas.height, canvas.getContext('2d'), buffers[0] );
}

function doneEncoding( blob ) {
    Recorder.setupDownload( blob, "myRecording" + ((recIndex<10)?"0":"") + recIndex + ".wav" );
    recIndex++;
}

function toggleRecording( e ) {
	console.log(e);
	console.log(e.parentNode);
	var loadCloud = e.parentNode;
	var audioRecorder = loadCloud.save;
	
	console.log(audioRecorder);
	var imgchange = e;
	if (e.classList.contains("recording")) {
		// stop recording
		audioRecorder.stop();
		e.classList.remove("recording");
		imgchange.src = 'images/mic.png'
		lrecord1 = "l" + e.id;
		audioRecorder.getBuffers( gotBuffers );
		//link1 = document.getElementById('save');
		audioRecorder.exportWAV( doneEncoding );
	} else {
		// start recording  
		if (!audioRecorder)
	    		return;
	
		e.classList.add("recording");
		imgchange.src = 'images/micrec.png'
		audioRecorder.clear();
		audioRecorder.record();
	}
}

function initAudio(index) {

	var audioSource = index.value;
	var idconfirm = index.parentNode;
	var recordCloud = document.createElement('a');
	var audioRecorder = null;
	
	function gotStream(stream) {
		
		//console.log(idconfirm);	
		// Create an AudioNode from the stream.
		var realAudioInput = audioContext.createMediaStreamSource(stream);
		var audioInput = realAudioInput;
		
		var inputPoint = audioContext.createGain();
		inputPoint.gain.value = 1.0;
		audioInput.connect(inputPoint);
		
		var analyserNode = audioContext.createAnalyser();
		analyserNode.fftSize = 2048;
		inputPoint.connect( analyserNode );
		
		audioRecorder = new Recorder( inputPoint ); // this fuck what the fuck
		// speak / headphone feedback initial settings
		
		inputPoint.connect(audioContext.destination);
		return audioRecorder;
	}
	
	var constraints = {
		audio: { deviceId: audioSource ? {exact: audioSource} : undefined}
	};
	
	navigator.mediaDevices.getUserMedia(constraints)
	.then(gotStream)
	.then(function() { 
		console.log(audioRecorder);
		idconfirm.href = audioRecorder;
	})
	.catch(handleError);
}

function gotDevices(deviceInfos) {
	
	var masterInputSelector = document.createElement('select');
	
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
