var audioContext = new (window.AudioContext || window.webkitAudioContext) ();

function recordTest () {};

//var audioRecorder = null;
var test1 = null;

function gotStream(stream) {
	
	console.log(stream);
	// Create an AudioNode from the stream.
	var realAudioInput = audioContext.createMediaStreamSource(stream);
	var audioInput = realAudioInput;
	
	var inputPoint = audioContext.createGain();
	inputPoint.gain.value = 1.0;
	audioInput.connect(inputPoint);
	//audioInput = convertToMono( input );
	
	var analyserNode = audioContext.createAnalyser();
	analyserNode.fftSize = 2048;
	inputPoint.connect( analyserNode );
	
	var audioRecorder = new Recorder( inputPoint ); // this fuck what the fuck
	// speak / headphone feedback initial settings
	
	inputPoint.connect(audioContext.destination);
	return audioRecorder;
}

function initAudio(index) {

	var audioSource = index.value;
	var idconfirm = index.parentNode;
	console.log(idconfirm);
	
	var constraints = {
		audio: { deviceId: audioSource ? {exact: audioSource} : undefined}
	};
	navigator.mediaDevices.getUserMedia(constraints).then(gotStream).catch(handleError);
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
