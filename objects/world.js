module.exports = World;

var fs = require('fs');
var shaderSource = fs.readFileSync(__dirname + '/../README.md', 'utf8');
console.log('example string: ', shaderSource);

function World() {

}