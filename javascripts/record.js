var audioContext = new (window.AudioContext || window.webkitAudioContext) ();

//var track = null;

//var audioRecorder = null;
var test1 = null;
var recIndex = 0;
var tagIndex = 2;
//final process
var childIndex = 0;

var deviceSF = document.getElementById('deviceSF');

//mute
function mute(e) {
	if(e.previousElementSibling.href === ""){
		console.log("no recorded audio");
	} else {
		if(e.classList.contains("muteOff")){
			e.classList.remove("muteOff");
			e.src = 'images/muteon.png';
		} else {
			e.classList.add("muteOff");
			e.src = 'images/muteoff.png';
		}
	}
	
	if(!e.parentNode.nextElementSibling.src){
		console.log("no audio Source");
	} else {
		
		if(e.classList.contains("muteOff")){
			e.classList.remove("muteOff");
			e.src = 'images/muteon.png';
		} else {
			e.classList.add("muteOff");
			e.src = 'images/muteoff.png';
		}
	}
}

//drag
function allowDrop(ev) {
	ev.preventDefault();
}

//canvas drag & drop
function dropping(e) {
	e.preventDefault();
	
	var ctx = e.toElement.getContext('2d');
	var w = e.toElement.width;
	var h = e.toElement.height;
	
	//create audio node
	var source = audioContext.createBufferSource();
	var analyser = audioContext.createScriptProcessor(1024,1,1);
	
	//fill the canvas first
	ctx.fillStyle = "555";
	ctx.fillRect(0,0,w,h);
	
	//create the file reader to read the audio file dropped
	var reader = new FileReader();
	reader.onload = function(e){
		if(audioContext.decodeAudioData){
			//decode the audio data
			audioContext.decodeAudioData(e.target.result,function(buffer){
				source.buffer = buffer;
				drawBuffer(w, h, ctx, buffer.getChannelData(0));
			});
		} else {
			//fallback to the old API
			source.buffer = audioContext.createBuffer(e.target.result,true);
		}
		//connect to the destination and our analyser
		source.connect(audioContext.destination);
		source.connect(analyser);
		analyser.connect(audioContext.destination);
	}
	//read the file
	reader.readAsArrayBuffer(e.dataTransfer.files[0]);
	e.target.src = source;
}

//all track Recording function
function allRecord(){
	var allrec = document.querySelectorAll('img.recordB');
	for(var i = 0; i < allrec.length; i++){
		toggleRecording(allrec[i]);
	}
	console.log(allrec);
}

//device select element show/hide
function deviceSelect(e){
	var allsel = document.querySelectorAll('select');
	if(deviceSF.checked === true){
		for(var i = 0; i < allsel.length; i++)
		{
			allsel[i].hidden = false;
		}
	} else {
		for(var i = 0; i < allsel.length; i++)
		{
			allsel[i].hidden = true;
		}
	}
};

//track All play
function AllPlay(e) {
	
	var Alllink = document.querySelectorAll('a#tracklink');
	e.playlist = [];
	for( var i = 0; i < Alllink.length; i++ ) {
		e.playlist[i] = new Audio(Alllink[i].href);
		e.playlist[i].play();
	}
	
	var allCanTrack = document.querySelectorAll('canvas');
	e.playClist = [];
	e.gainList = [];
	for( var i = 0; i < allCanTrack.length; i++ ) {
		if(allCanTrack[i].src) {
			e.playClist[i] = audioContext.createBufferSource();
			e.gainList[i] = audioContext.createGain();
			e.playClist[i].buffer = allCanTrack[i].src.buffer;
			e.playClist[i].connect(e.gainList[i]);
			e.gainList[i].connect(audioContext.destination);
			e.playClist[i].start();
		}
	}
}

//track All play
function AllStop(e) {
	
	var Alllink = document.querySelectorAll('a#tracklink');
	var playlist = e.previousElementSibling.playlist;
	for( var i = 0; i < Alllink.length; i++ ) {
		playlist[i].pause();
	}
	
	var allCanTrack = document.querySelectorAll('canvas');
	var playClist = e.previousElementSibling.playClist;
	for( var i = 0; i < allCanTrack.length; i++ ) {
		if(allCanTrack[i].src) {
			playClist[i].stop();
		}
	}
}

//add New Track
function addNewTrack(e) {
	var newDiv = document.createElement('div');
	
	newDiv.id = "track"+tagIndex;
	newDiv.class = "bar";
	var node = e.parentNode.parentNode;
	node.insertBefore(newDiv, node.childNodes[7+childIndex]);
	
	var tag = "	<span class='track'>Track " + tagIndex 
	  	+ "		<img src='images/play.png' onclick='play(this);'/> "
	  	+ "		<img id='record" + tagIndex + "'" + "class='recordB' src='images/recordOff.png' onclick='toggleRecording(this);'>"
	  	+ "		<a id='down'></a>"
		+ "	</span>"
		+ "	<canvas id='crecord" + tagIndex + "'" + "class='record" + tagIndex + "'" + "ondrop='dropping(event)' ondragover='allowDrop(event)'></canvas>"
		+ "	<select id='change'></select>"
		+ "	<a></a>";
	
	var lastProc = document.getElementById("track"+tagIndex);
	lastProc.innerHTML = tag;
	tagIndex++;
	childIndex++;
	navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);
}

//To change, click play button -> stop button the recorded audio
function play(e) {
	if(!this.song) {
		this.song = new Audio();
		console.log(this.song);
	} else {
		if(e.parentNode.nextElementSibling.nextElementSibling.nextElementSibling.href === "") {
			console.log("no recorded audio");
		} else {
			if(e.classList.contains("NoPlaying")){
				e.classList.remove("NoPlaying");
				e.src = 'images/stop.png';
				var link = e.parentNode.nextElementSibling.nextElementSibling.nextElementSibling.cloneNode(true);
				var parentLink = e.parentNode;
				var a = document.createElement('a');
				a = link;
				var existA = e.nextElementSibling.nextElementSibling;
				var img = document.createElement('img');
				img.id = 'save';
				img.src = 'images/save.png';
				a.appendChild(img);
				parentLink.replaceChild(a, existA);
				this.song.src = link.href;
				this.song.play();
				
			} else {
				e.classList.add("NoPlaying");
				e.src = 'images/play.png';
				this.song.pause();
			}
		}
	}
	if(!e.parentNode.nextElementSibling.src){
		console.log("no audio Source");
	} else {
		
		if(e.classList.contains("NoPlaying")){
			this.track = audioContext.createBufferSource();
			this.gainNode = audioContext.createGain();
			this.track.buffer = e.parentNode.nextElementSibling.src.buffer;
			this.track.connect(this.gainNode);
			this.gainNode.connect(audioContext.destination);
			e.classList.remove("NoPlaying");
			e.src = 'images/stop.png';
			this.track.start();
		} else {
			e.classList.add("NoPlaying");
			e.src = 'images/play.png';
			this.track.stop();
		}
	}
}

// recording button function ( toggle )
function toggleRecording( e ) {
	var imgchange = e;
	var Check = e.parentNode;
	
	if (e.classList.contains("recording")) {
		// stop recording
		e.parentNode.parentNode.src.stop();
		e.classList.remove("recording");
		imgchange.src = 'images/recordOff.png';
		
		//draw signal on canvas && buffer link create
		e.parentNode.parentNode.src.getBuffers( function(buffers) {
			var ci = e.parentNode.nextElementSibling.id;
   			var canvas = document.getElementById(ci);
			drawBuffer( canvas.width, canvas.height, canvas.getContext('2d'), buffers[0] );
			e.parentNode.parentNode.src.exportWAV(function(blob) {
				var good = Recorder.setupDownload( blob );
				var replace = e.parentNode.nextElementSibling.nextElementSibling.nextElementSibling;
				var link = document.createElement("a");
				link.id = "tracklink";
				link.href = good;
				link.download =  "myRecording" + ((recIndex<10)?"0":"") + recIndex + ".wav"  || 'output.wav';
				recIndex++;
				e.parentNode.parentNode.replaceChild(link, replace);
			});
			
		});
	} else {
		// start recording  
		if (!e.parentNode.parentNode.src)
	    		return;
	
		e.classList.add("recording");
		imgchange.src = 'images/recordOn.png';
		e.parentNode.parentNode.src.clear();
		e.parentNode.parentNode.src.record();
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
	masterInputSelector.hidden = true;
	
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
//page load then Start function
navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

