
module.exports = GameState;

function GameState()
{
	this.enter = function() {};
	this.display = function() {};
	this.update = function(time) {};
	this.resize = function(x, y) {};
	this.leave = function() {};
}