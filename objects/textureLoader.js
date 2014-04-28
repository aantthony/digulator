
function TextureLoader() {
  var ctx = this;
  this.imageLoader = new THREE.ImageLoader();
  this.textures = {};
  this.normals = {};

  this.loadTexture('Sand', 'jpg');
  this.loadNormal('SandNM', 'jpg');

  this.loadTexture('Clay', 'jpg');
  this.loadNormal('ClayNM', 'jpg');

  this.loadTexture('Rock', 'jpg');
  this.loadNormal('RockNM', 'jpg');

  this.loadTexture('Gold', 'jpg');
  this.loadNormal('GoldNM', 'jpg');

  this.loadTexture('Dirt', 'jpg');
  this.loadNormal('DirtNM', 'jpg', 'SandNM');
  
  this.loadTexture('Diamond', 'jpg');
  this.loadNormal('DiamondNM', 'jpg');
  
  this.loadTexture('Palm');
  this.loadNormal('PalmNM', 'jpg');

  this.loadTexture('Grass');
  
  this.loadTexture('Flare');
  
  this.loadTexture('Player', 'jpg');
  this.loadNormal('PlayerNM', 'jpg');
  this.loadTexture('Monster', 'jpg');
  this.loadNormal('MonsterNM', 'jpg');

  this.loadTexture('Sign', 'jpg');
  this.loadNormal('SignNM', 'jpg');

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

TextureLoader.prototype.loadTexture = function(url, extension, alt) {
  var ctx = this;
  var extension = extension || 'png';
  
  if(alt == undefined){
    var texture = new THREE.Texture();
    this.textures[url] = texture;
    
    this.imageLoader.load('images/' + url + '.' + extension, function (event) {
      texture.image = event;
      texture.needsUpdate = true;
    });
  }
  else{
    this.textures[url] = this.textures[alt];
  }
};

TextureLoader.prototype.loadNormal = function(url, extension, alt) {
  var ctx = this;
  var extension = extension || 'png';

  if(alt == undefined){
    var texture = new THREE.Texture();
    this.normals[url] = texture;
    
    this.imageLoader.load('images/' + url + '.' + extension, function (event) {
      texture.image = event;
      texture.needsUpdate = true;
    });
  }
  else{
    this.normals[url] = this.normals[alt];
  }
};

function onError(err){
  console.log(err);
}

var instance = new TextureLoader();
module.exports = instance;
