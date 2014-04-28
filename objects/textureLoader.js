
function TextureLoader() {
  var ctx = this;
  this.imageLoader = new THREE.ImageLoader();
  this.textures = {};
  this.normals = {};

  this.loadTexture('Sand');
  this.loadNormal('SandNM');

  this.loadTexture('Clay');
  this.loadNormal('ClayNM');

  this.loadTexture('Rock');
  this.loadNormal('RockNM');

  this.loadTexture('Gold');
  this.loadNormal('GoldNM');

  this.loadTexture('Dirt');
  this.loadNormal('DirtNM');
  
  this.loadTexture('Diamond');
  this.loadNormal('DiamondNM');
  
  this.loadTexture('Palm');
  this.loadNormal('PalmNM');

  this.loadTexture('Grass');
  
  this.loadTexture('Flare');
  
  this.loadTexture('Player');
  this.loadNormal('PlayerNM');
  this.loadTexture('Monster');
  this.loadNormal('MonsterNM');

  this.loadTexture('Sign');
  this.loadNormal('SignNM');

  // this.loadTexture('spark');
}

TextureLoader.prototype.getTexture = function(tex) {
  if(!this.textures[tex]){
    console.log("Texture not loaded: " + tex);
    return;
  }
  return this.textures[tex];
}

TextureLoader.prototype.getNormal = function(tex) {
  if(!this.normals[tex+'NM']){
    console.log("Texture not loaded: " + tex+'NM');
    return;
  }
  return this.normals[tex+'NM'];
}

TextureLoader.prototype.loadTexture = function(url) {
  var ctx = this;

  var texture = new THREE.Texture();
  this.textures[url] = texture;
  
  this.imageLoader.load('images/' + url + '.png', function (event) {
    texture.image = event;
    texture.needsUpdate = true;
  });
};

TextureLoader.prototype.loadNormal = function(url) {
  var ctx = this;

  var texture = new THREE.Texture();
  this.normals[url] = texture;
  
  this.imageLoader.load('images/' + url + '.png', function (event) {
    texture.image = event;
    texture.needsUpdate = true;
  });
};

function onError(err){
  console.log(err);
}

var instance = new TextureLoader();
module.exports = instance;
