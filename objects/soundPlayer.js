window.AudioContext = window.AudioContext || window.webkitAudioContext;

function SoundPlayer() {
  var ctx = this;
  this.audio = new AudioContext();

  this.atmosAudio = new AudioContext();
  this.atmosGain = this.atmosAudio.createGainNode();
  this.atmosGainValue = 0.1;

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
  this.loadSound('Wind3');

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

SoundPlayer.prototype.playAtmospheric = function() {
  setTimeout(instance.playAtmospheric, Math.random()*2000+2000);

  var atmos = ['Bird1', 'Bird2', 'Bird3', 'Wind1', 'Wind2', 'Wind3'];
  var pos = Math.floor(Math.random()*atmos.length);

  if(!instance.sounds[atmos[pos]]){
    console.log("not loaded");
    return;
  }

  instance.atmosGain.gain.value = instance.atmosGainValue;

  var source = instance.atmosAudio.createBufferSource();
  source.buffer = instance.sounds[atmos[pos]];
  source.connect(instance.atmosGain);
  instance.atmosGain.connect(instance.atmosAudio.destination);
  source.start(0);
}

SoundPlayer.prototype.setAtmosGain = function(val) {
  var val = (val-5)/10;
  val *= 0.2;
  if(val < 0){
    val = 0;
  }
  this.atmosGainValue = val;
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
setTimeout(instance.playAtmospheric, 1000);
module.exports = instance;