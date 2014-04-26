module.exports = TextureLoader;

function TextureLoader() {
  var ctx = this;
  this.imageLoader = new THREE.ImageLoader();
  this.textures = {};
  this.normals = {};

  this.loadTexture('Sand');
  this.loadNormal('SandNM');

  this.loadTexture('Clay');
  this.loadNormal('ClayNM');
}

TextureLoader.prototype.getTexture = function(tex) {
  if(!this.textures[tex]){
    console.log("Texture not loaded: " + tex);
    return;
  }
  return this.textures[tex];
}

TextureLoader.prototype.getNormal = function(tex) {
  if(!this.normals[tex]){
    console.log("Texture not loaded: " + tex);
    return;
  }
  return this.normals[tex];
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