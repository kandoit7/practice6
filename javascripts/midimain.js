
if (navigator.requestMIDIAccess) {
    console.log('Browser supports MIDI!');
    navigator.requestMIDIAccess()
        .then(success, failure);
}

function success (midi) {
    console.log('Got midi!', midi);
}
 
function failure () {
    console.error('No access to your midi devices.')
}
