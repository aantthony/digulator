module.exports = KeyboardState;

function keydown(event) {
  if (this.keyCodes[event.keyCode]) return;
  this.keyCodes[event.keyCode] = true;
  if (event.keyCode === KeyboardState.ALIAS['left']) {
    return this.onleft();
  } else if (event.keyCode === KeyboardState.ALIAS['right']) {
    return this.onright();
  } else if (event.keyCode === KeyboardState.ALIAS['up']) {
    return this.onup();
  } else if (event.keyCode === KeyboardState.ALIAS['down']) {
    return this.ondown();
  }
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
