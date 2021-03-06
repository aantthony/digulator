var soundPlayer = require('./soundPlayer');
var objectLoader = require('./objectLoader');

var exports = module.exports = function (details) {

  this.model = objectLoader.getObject('Player');
  // this.model.material.depthTest = false;
  this.model.scale.x = 0.05;
  this.model.scale.y = 0.05;
  this.model.scale.z = 0.05;
  // var axes = new THREE.AxisHelper();
  // axes.scale.x = 500;
  // axes.scale.y = 500;
  // axes.scale.z = 500;
  // this.model.add(axes);

  this.model.rotation.x = 0;
  this.model.rotation.y = Math.PI/2;
  this.model.rotation.z = 0;
  this.model.position.y = -0.3;

  this.object = new THREE.Object3D();
  this.object.add(this.model);
  var light = new THREE.PointLight(0xFFFFFF);
  light.position.z = 3;
  this.object.add(light);

  // this.object.position.set(14,0,0);
  // this.object.rotation.set(1.4,0,0);
  this.object.position.set(14,0,1);

  window.p = this.object.position;

  // The direction the player is facing:
  this.faceX = +1;
  this.faceY = +0;

  this._world = details.world;
  this._game = details.game;
  this._keys = details.keys;
  this._touches = details.touches;

  // todo: replace this
  this.intervals = [];
  this.timers = [];

  // timer for current digging action:
  this._currentDig = null;
  // current dig direction (if _currentDig is falsy, then this should be zero)
  this._currentDigX = 0;
  this._currentDigY = 0;
  this._x = Math.round(this.object.position.x);
  this._y = Math.round(this.object.position.y);
  this.digTarget = undefined;
  
  this.digShakeTimer = 0.0;
  this.digTime = 0.0;
  this.digTimeLeft = 0.0;
  
  this._updateKeys = function () {
    var keys = this._keys;
    var touches = this._touches;
    var kL = keys.pressed('left') || touches.touched('left');
    var kR = keys.pressed('right') || touches.touched('right');
    var kU = keys.pressed('up') || touches.touched('up');
    var kD = keys.pressed('down') || touches.touched('down');
    if (this._currentDig) {
      if (this._currentDigX === +1 && kR) return;
      if (this._currentDigX === -1 && kL) return;
      if (this._currentDigY === +1 && kU) return;
      if (this._currentDigY === -1 && kD) return;
      this._currentDigCancel();
    } else {
      if (kL && !kR) return this.left();
      if (kR && !kL) return this.right();
      if (kU && !kD) return this.digUp();
      if (kD && !kU) return this.digDown();
    }
  }
  this.onSurface = function()
  {
  	return this.object.position.y > -0.1;
  }
  this.update = function(dt)
  {
    this._updateKeys();

    if (this.faceX === +1) {
      this._game.emitParticles(this.object.position.clone().sub(new THREE.Vector3(0.1,0.1,0)), 2, {x:0,y:-0.25});
    } else {
      this._game.emitParticles(this.object.position.clone().sub(new THREE.Vector3(-0.1,0.1,0)), 2, {x:0,y:-0.25});
    }

    var yRot = 0.0;
    var xRot = 0.0;
    if (this.faceX === -1) {
      yRot = -Math.PI/2;
    } else if (this.faceX === +1) {
      yRot = Math.PI / 2;
    } else {
      yRot = 0;
    }

    if (this.faceY === +1) {
      xRot = -Math.PI / 2;
    } else if (this.faceY === -1) {
      xRot = Math.PI / 2;
    } else {
      xRot = 0.0;
    }

    this.model.rotation.y += 6.0 * dt * (yRot - this.model.rotation.y);
    this.model.rotation.x += 6.0 * dt * (xRot - this.model.rotation.x);
    
    var pos = this.object.position;
    if (this._currentDig) {
      this.digTimeLeft -= dt;
      if (this.digTimeLeft <= 0) {
        this._cannotCancel = false;
        console.log('finished digging ', block ? block.name : null);
        // finished digging:
        shake(0.5);
        // move the player into the new block:
        pos.x = this._x += this._currentDigX;
        pos.y = this._y += this._currentDigY;
        delete this._currentDig;
        delete this.digTarget;
        if(!this.aboveGroundMove)
          soundPlayer.play('Sand');
        // soundPlayer.play('DrillFast');
        // soundPlayer.stopLoop('Laser');
        var block = this._targetBlock;
        if (block) {
          if (block.name === 'dirt' || block.name === 'sand' || block.name === 'clay') {
            this._game.emitParticles(block.position, 1, {x:-this._currentDigX,y:-this._currentDigY});
          }
          world.setBlock(this._x, this._y, downgradeBlock(block));
          if(block.name == 'gold') game.updateScore('gold');
          if(block.name == 'diamond') game.updateScore('diamond');
          if(block.name == 'rock') game.updateScore('rock');
        }

        this._currentDigX = 0;
        this._currentDigY = 0;
        this.aboveGroundMove = false;

        this.timers.forEach(clearTimeout);
        this.intervals.forEach(clearInterval);
      }
    }
  if (this._currentDig && this.aboveGroundMove) {
    var t = 1.0 - this.digTimeLeft/this.digTime;
    t = Math.min(1.0, Math.max(t, 0.0));
    pos.x = this.digFrom.x + t * (this.digTarget.x - this.digFrom.x);
    pos.y = this.digFrom.y + t * (this.digTarget.y - this.digFrom.y);
  } else if (this._currentDig && this.digTarget) {
		var digSpasticAmplitude = 0.1;
		var digSpasticFrequency = 3.0;
		this.digShakeTimer += dt;
		var tmp = this.digFrom.clone();
		tmp.x += window.shakeFunction(this.digShakeTimer * digSpasticFrequency) * digSpasticAmplitude;
		tmp.y += window.shakeFunction(this.digShakeTimer * digSpasticFrequency+98.412) * digSpasticAmplitude;
		tmp.sub(this.digTarget);
		var randomDist = window.shakeFunction(this.digShakeTimer * digSpasticFrequency+9.9812);
		var progress = Math.min(Math.max(this.digTimeLeft/this.digTime, 0.0), 1.0);
		tmp.setLength((randomDist * 0.25 + 0.5) * progress + 1.0);
		this.object.position.copy(this.digTarget);
		this.object.position.add(tmp);
		// this.object.rotation.y = Math.atan2(tmp.x, -tmp.y);
		this.object.position.z = 1.0;
	}
  }

  scene.add(this.object);
};

function downgradeBlock(block) {
  if (block.name === 'diamond' || block.name === 'gold') return 'dirt'; 
  if (block.name === 'rock') return 'dirt';
  if (block.name === 'clay') return 'dirt';
  return 'sand';
}
function difficulty (block) {
  switch(block.name) {
    case 'diamond': return 12;
    case 'gold': return 8;
    case 'rock': return 14;
    case 'clay': return 4;
    case 'dirt': return 2;
    case 'sand': return 1;
    default:
    console.log('unkown type:', block.name);
    return 3;
  }
}

exports.prototype.digInDirection = function (xDir, yDir) {
  var pos = this.object.position;

  if (this._currentDig) {
    return;
  }
  pos.x = this._x;
  pos.y = this._y;

  var x = this._x + xDir;
  var y = this._y + yDir;
  var prevX = this._x;
  var prevY = this._y;
  var self = this;

  var block = this._world.getBlock(x, y);
  this.digFrom = this.object.position.clone();

  if (block) {
    this.digTarget = block.position.clone();
    shake(3);
    var world = this._world;
    var d = difficulty(block);
    var mineTime = d * 300;
    this.digTimeLeft = this.digTime = mineTime / 1000.0;
    var timers = this.timers;
    
    // timers.push(setTimeout(function () {
    //   shake(3);
    //   if (d > 5) soundPlayer.play('DrillMed');
    // }, mineTime / 3));
    // timers.push(setTimeout(function () {
    //   shake(2);
    //   if (d > 5) soundPlayer.play('DrillMed');
    // }, mineTime * 2 / 3));

    var intervals = this.intervals;
    if (block.name === 'sand' || block.name === 'dirt') {
        soundPlayer.play('Sand');
        intervals.push(setInterval(function () {
          soundPlayer.play('Sand');
        }, 250));
    }
    if (block.name === 'clay') {
        soundPlayer.play('Mud');
        intervals.push(setInterval(function () {
          soundPlayer.play('Mud');
        }, 300));
    }
    if (block.name === 'gold' || block.name === 'diamond' || block.name === 'rock') {
      var sparkPosX = block.position.x - xDir * 0.5;
      var sparkPosY = block.position.y - yDir * 0.5;
      var xO = 0;
      var yO = 0;
      var mO = 0.45;
      intervals.push(setInterval(function () {
        if (xDir) yO += (Math.random() - 0.5) * 0.3;
        if (yDir) xO += (Math.random() - 0.5) * 0.3;
        xO = Math.min(mO, Math.max(-mO, xO));
        yO = Math.min(mO, Math.max(-mO, yO));
        self._game.emitParticles({x: sparkPosX + xO, y: sparkPosY + yO, z: 0}, 0);
      }, 20));
      if (block.name === 'rock') {
        soundPlayer.play('DrillFast');
        intervals.push(setInterval(function () {
          soundPlayer.play('DrillFast');
        }, 200));
      }
      else if(block.name === 'gold'){
        soundPlayer.play('DrillMed');
        intervals.push(setInterval(function () {
          soundPlayer.play('DrillMed');
        }, 400));
      }
      else{
        soundPlayer.play('Laser2');
        intervals.push(setInterval(function () {
          soundPlayer.play('Laser2');
        }, 500));
      }
    }
    // soundPlayer.playLoop('Laser');

    this._currentDig = true;
    this._currentDigX = xDir;
    this._currentDigY = yDir;
    this._targetBlock = block;

  } else {
    this._currentDigX = xDir;
    this._currentDigY = yDir;
    this._currentDig = true;
    this._targetBlock = null;
    var inBlock = this._world.getBlock(this._x, this._y);
    this.digTimeLeft = this.digTime = inBlock ? 0.5 : 0.3;
    if (inBlock) {
      pos.x = this._x + xDir * 0.35;
      pos.y = this._y + yDir * 0.35;
    }
    this.digTarget = new THREE.Vector3(x, y, 0);

    if (!inBlock) {
      this.aboveGroundMove = true;
      this._cannotCancel = true;
    }
  }

  if(this._y == 0){
    this._world.destroyPalm(this._x+xDir);
  }
  else if(this._y == -1 && xDir){
    this._world.destroyPalm(this._x+xDir);
  }
  else if(this._y == -2 && yDir == 1){
    this._world.destroyPalm(this._x);
  }
  soundPlayer.setAtmosGain(this._y);
}

/**
 * Try to dig into a boundary
 * @return undefined
 */
exports.prototype._failAttemptToDig = function (dx, dy) {
  soundPlayer.play('Alarm2');
  if (this._currentDig) return this._currentDigCancel();
  this._currentDig = true;
  this.digFrom = this.object.position.clone();
  var self = this;
  var pos = this.object.position;
  var x = this._x;
  var pos = this.object.position;
  pos.x += dx * 0.5;
  this.digTarget = this.object.position.clone(); //animate drilling into wall
  // setTimeout(this._currentDigCancel, 500);
  this.digTime = 500.0/1000.0;
  this.digTimeLeft = 800.0/1000.0; //a little higher so aniation won't complete
};

exports.prototype._currentDigCancel = function () {
  if (this._cannotCancel) return;
  delete this._currentDig;
  delete this.digTarget;
  this.aboveGroundMove = false;
  var pos = this.object.position;
  pos.x = this._x;
  pos.y = this._y;

  this.timers.forEach(clearTimeout);
  this.intervals.forEach(clearInterval);
  this._currentDigX = this._currentDigY = 0;
  this.digTime = 0;
};

exports.prototype.digLeft = function () {
  if (!this._world.canDig(this._x - 1, this._y)) {
    return this._failAttemptToDig(-1, 0);
  }
  return this.digInDirection(-1, 0);
};

exports.prototype.digRight = function () {
  if (!this._world.canDig(this._x + 1, this._y)) {
    return this._failAttemptToDig(+1, 0);
  }
  return this.digInDirection(+1, 0);
};
exports.prototype.digDown = function () {
  if (!this._world.canDig(this._x, this._y - 1)) {
    return this._failAttemptToDig(0, -1);
  }
  this.faceX = +0;
  this.faceY = -1;
  return this.digInDirection(0, -1);
};
exports.prototype.digUp = function() {
  // this._game.emitParticles(this.object.position, 2, {x:1,y:0});
  var on = this._world.getBlock(this._x, this._y);
  if (!on) return; // no flying!

  if (!this._world.canDig(this._x, this._y + 1)) {
    return;
  }
  this.faceX = +0;
  this.faceY = +1;
  return this.digInDirection(0, +1);
};
exports.prototype.faceLeft = function () {
  this.faceX = -1;
  this.faceY = +0;
};
exports.prototype.faceRight = function () {
  this.faceX = +1;
  this.faceY = +0;
};

exports.prototype.right = function () {
  // this._game.emitParticles(this.object.position, 2, {x:0,y:1});
  if (this.faceX === +1) {
    this.digRight();
  } else {
    this.faceRight();
  }
};

exports.prototype.left = function () {
  if (this.faceX === -1) {
    this.digLeft();
  } else {
    this.faceLeft();
  }
};
