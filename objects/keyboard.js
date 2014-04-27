module.exports = KeyboardState;

function keydown(event) {
  if (this.keyCodes[event.keyCode]) return;
  this.keyCodes[event.keyCode] = true;
}

function keyup(event) {
  if (!this.keyCodes[event.keyCode]) return;
  delete this.keyCodes[event.keyCode];
}

function KeyboardState() {
  this.keyCodes = {};
  this.modifiers  = {};

  var self  = this;
  this._onKeyDown = keydown.bind(this);
  this._onKeyUp = keyup.bind(this);

  document.addEventListener('keydown', this._onKeyDown, false);
  document.addEventListener('keyup', this._onKeyUp, false);
}

KeyboardState.prototype.destroy  = function() {
  document.removeEventListener('keydown', this._onKeyDown, false);
  document.removeEventListener('keyup', this._onKeyUp, false);
};

KeyboardState.prototype.pressed = function (keyDesc) {
  var keys  = keyDesc.split('+');
  for(var i = 0; i < keys.length; i++){
    var key = keys[i];
    var pressed;
    if( KeyboardState.MODIFIERS.indexOf( key ) !== -1 ){
      pressed = this.modifiers[key];
    }else if( Object.keys(KeyboardState.ALIAS).indexOf( key ) != -1 ){
      pressed = this.keyCodes[KeyboardState.ALIAS[key]];
    }else {
      pressed = this.keyCodes[key.toUpperCase().charCodeAt(0)]
    }
    if( !pressed) return false;
  };
  return true;
}

KeyboardState.MODIFIERS  = ['shift', 'ctrl', 'alt', 'meta'];
KeyboardState.ALIAS  = {
  'left'    : 37,
  'up'      : 38,
  'right'   : 39,
  'down'    : 40,
  'space'   : 32,
  'pageup'  : 33,
  'pagedown': 34,
  'tab'     : 9
};
