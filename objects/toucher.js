module.exports = TouchState;

function touch(event) {
  var width = window.innerWidth;
  var height = window.innerHeight;

  var centreX = width/2;
  var centreY = height/2;

  //get vector from center to touch event
  var touchX = event.pageX;
  var touchY = event.pageY;

  if(event.touches){
    if(event.touches.length == 1){
      touchX = event.touches[0].pageX;
      touchY = event.touches[0].pageY;
    }
    else{
      return;
    }
  }

  var vectorX = touchX - centreX;
  var vectorY = touchY - centreY;

  //normalise vector
  var magnitude = Math.sqrt(vectorX*vectorX + vectorY*vectorY);
  vectorX /= magnitude;
  vectorY /= magnitude;

  if(Math.abs(vectorX) > Math.abs(vectorY)){
    if(vectorX < 0){
      this.direction = "left";
    }
    else{
      this.direction = "right";
    }
  }
  else{
    if(vectorY > 0){
      this.direction = "down";
    }
    else{
      this.direction = "up";
    }
  }
}

function untouch(){
  this.direction = undefined;
}

function TouchState() {
  this.direction;
  
  this.disabled = false;

  var self  = this;
  this._touch = touch.bind(this);
  this._untouch = untouch.bind(this);
  
  this.disable = function() {
  	//disable future events
    this.disabled = true;
    
    //release direction
    this.direction = undefined;
  };

  document.addEventListener('touchstart', this._touch, false);
  document.addEventListener('touchend', this._untouch, false);
  document.addEventListener('mousedown', this._touch, false);
  document.addEventListener('mouseup', this._untouch, false);
}

TouchState.prototype.destroy  = function() {
  document.addEventListener('touchstart', this._touch, false);
  document.addEventListener('touchend', this._untouch, false);
  document.addEventListener('mousedown', this._touch, false);
  document.addEventListener('mouseup', this._untouch, false);
};

TouchState.prototype.touched = function (direction) {
  if(this.disabled){
    return false;
  }
  if(this.direction == direction){
    return true;
  }
  return false;
}
