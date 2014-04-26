module.exports = SoundPlayer;

window.AudioContext = window.AudioContext || window.webkitAudioContext;

function SoundPlayer() {
  var ctx = this;
  this.audio = new AudioContext();
  this.sounds = {};

  this.loadSound('test');
}

SoundPlayer.prototype.destroy  = function() {
};

SoundPlayer.sound  = {
  
};

SoundPlayer.prototype.play = function(sound) {
  if(!this.sounds[sound]){
    console.log("not loaded");
    return;
  }
  var source = this.audio.createBufferSource();
  source.buffer = this.sounds[sound];
  source.connect(this.audio.destination);
  source.start(0);
}

SoundPlayer.prototype.loadSound = function(url) {
  var ctx = this;
  var request = new XMLHttpRequest();
  request.open('GET', './sounds/' + url + '.wav', true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  request.onload = function() {
    ctx.audio.decodeAudioData(request.response, function(buffer) {
      ctx.sounds[url] = buffer;
    }, onError);
  }
  request.send();
};

function onError(err){
  console.log(err);
}