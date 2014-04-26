var Digulator = {};

var THREE = require('three/three');
window.THREE = THREE;

var scene = new THREE.Scene();
window.scene = scene;
var camera = new THREE.OrthographicCamera(-0.5, 9.5, -0.5, 9.5, 0, 10);

var Keyboard = require('./objects/keyboard');

var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

var geometry = new THREE.CubeGeometry(1,1,1);
var material = new THREE.MeshBasicMaterial({color: 0x00ff00});
var cube = new THREE.Mesh(geometry, material);

var World = require('./objects/world');

var world = new World();
console.log('created a world!');

camera.position.z = 5;

var render = function () {
  requestAnimationFrame(render);

  cube.rotation.x += 0.1;
  cube.rotation.y += 0.1;

  renderer.render(scene, camera);
};

var keys = new Keyboard();

keys.onleft = function () {
  console.log('LEFT!!!');
};
keys.onright = function () {
  console.log('RIGHT!!!');

};
keys.onup = function () {
  console.log('UP!!!');
};
keys.ondown = function () {
  console.log('DOWN!!!');
};

window.onload = function(){
	// cube = new Digulator.Sand();
	// scene.add(cube);

	world.createWorld();
	
	render();
}