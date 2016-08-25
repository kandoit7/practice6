var audioContext = new (window.AudioContext || window.webkitAudioContext) ();

function recordTest () {};

//var audioRecorder = null;
var test1 = null;
var recIndex = 0;
var tagIndex = 3;
//add New Track
function addNewTrack(e) {
	var newDiv = document.createElement('div');
	newDiv.id = "track"+tagIndex;
	var node = e.parentNode.parentNode;
	node.insertBefore(newDiv, node.childNodes[4]);
	console.log(node.childNodes[2]);
	
	var tag = "	<span class='track'>track" + tagIndex 
	  	+ "		<input type='button' value='play' onclick='play(this);'/> "
	  	+ "		<input type='button' value='down' onclick='down(this);'/>"
		+ "	</span>"
		+ "	<canvas id='crecord" + tagIndex + "'" + "class='record" + tagIndex + "'" + "></canvas>"
		+ "	<img id='record" + tagIndex + "'" + "src='images/mic.png' onclick='toggleRecording(this);'>"
		+ "	<select id='change'></select>"
		+ "	<a></a>";
	
	var lastProc = document.getElementById("track"+tagIndex);
	lastProc.innerHTML = tag;
	console.log(lastProc);
	tagIndex++;
}

//click play button -> play the recorded audio
function play(e) {
	var link = e.parentNode.nextElementSibling.nextElementSibling.nextElementSibling.nextElementSibling;
	var track = new Audio(link.href);
	track.play();
	
}

// recording button function ( toggle )
function toggleRecording( e ) {
	var imgchange = e;
	var Check = e.parentNode;
	
	if (e.classList.contains("recording")) {
		// stop recording
		e.parentNode.src.stop();
		e.classList.remove("recording");
		imgchange.src = 'images/mic.png';
		
		//draw signal on canvas && buffer link create
		e.parentNode.src.getBuffers( function(buffers) {
			var ci = e.previousElementSibling.id;
   			var canvas = document.getElementById(ci);
			drawBuffer( canvas.width, canvas.height, canvas.getContext('2d'), buffers[0] );
			//e.parentNode.src.exportWAV(doneEncoding);
			e.parentNode.src.exportWAV(function(blob) {
				var good = Recorder.setupDownload( blob );
				var replace = e.nextElementSibling.nextElementSibling;
				var link = document.createElement("a");
				link.href = good;
				link.download =  "myRecording" + ((recIndex<10)?"0":"") + recIndex + ".wav"  || 'output.wav';
				recIndex++;
				e.parentNode.replaceChild(link, replace);
			});
			
		});
	} else {
		// start recording  
		if (!e.parentNode.src)
	    		return;
	
		e.classList.add("recording");
		imgchange.src = 'images/micrec.png';
		e.parentNode.src.clear();
		e.parentNode.src.record();
	}
}

//Audio recording check
function initAudio(index) {

	var audioSource = index.value;
	var idconfirm = index.parentNode;
	var recordCloud = document.createElement('a');
	var audioRecorder = null;
	
	function gotStream(stream) {
			
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
		idconfirm.src = audioRecorder;
	})
	.catch(handleError);
}

//input Device Check
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

// function for many Selector Element 
function changeAudioDestination(event) {
	
	var InputSelector = event.path[0];
	initAudio(InputSelector);
}

// fail callback
function handleError(error) {
	
  console.log('navigator.getUserMedia error: ', error);
}

//Get Input Devices
navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

//URL of recorded audio && create <a> Element
//but this function not using
/*
function doneEncoding( blob ) {
    var good = Recorder.setupDownload( blob );
    var link = document.createElement("a");
    link.href = good;
    link.download =  "myRecording" + ((recIndex<10)?"0":"") + recIndex + ".wav"  || 'output.wav';
    recIndex++;
}
*/
