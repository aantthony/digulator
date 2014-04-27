window.AudioContext = window.AudioContext || window.webkitAudioContext;

function SoundPlayer() {
  var ctx = this;
  this.audio = new AudioContext();
  this.sounds = {};

  //Drill
  this.loadSound('DrillFast');
  this.loadSound('DrillMed');
  this.loadSound('Laser');
  this.loadSound('Laser2');

  //atmospheric
  this.loadSound('Bird1');
  this.loadSound('Bird2');
  this.loadSound('Bird3');
  this.loadSound('Wind1');
  this.loadSound('Wind2');

  //misc
  this.loadSound('DestroyTree');
  this.loadSound('Leaves');
  this.loadSound('Engine');
  this.loadSound('Explosion');
  this.loadSound('Grenade');
  this.loadSound('Rocket');
  this.loadSound('Sand');

  //Success
  this.loadSound('Gold');

  //Death
  this.loadSound('Death');
}

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

var instance = new SoundPlayer();
module.exports = instance;