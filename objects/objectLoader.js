




/**
 * @author mrdoob / http://mrdoob.com/
 */

THREE.OBJLoader = function ( manager ) {

  this.manager = ( manager !== undefined ) ? manager : THREE.DefaultLoadingManager;

};

THREE.OBJLoader.prototype = {

  constructor: THREE.OBJLoader,

  load: function ( url, onLoad, onProgress, onError ) {

    var scope = this;

    var loader = new THREE.XHRLoader( scope.manager );
    loader.setCrossOrigin( this.crossOrigin );
    loader.load( url, function ( text ) {

      onLoad( scope.parse( text ) );

    } );

  },

  parse: function ( text ) {

    function vector( x, y, z ) {

      return new THREE.Vector3( parseFloat( x ), parseFloat( y ), parseFloat( z ) );

    }

    function uv( u, v ) {

      return new THREE.Vector2( parseFloat( u ), parseFloat( v ) );

    }

    function face3( a, b, c, normals ) {

      return new THREE.Face3( a, b, c, normals );

    }
    
    var object = new THREE.Object3D();
    var geometry, material, mesh;

    function parseVertexIndex( index ) {

      index = parseInt( index );

      return index >= 0 ? index - 1 : index + vertices.length;

    }

    function parseNormalIndex( index ) {

      index = parseInt( index );

      return index >= 0 ? index - 1 : index + normals.length;

    }

    function parseUVIndex( index ) {

      index = parseInt( index );

      return index >= 0 ? index - 1 : index + uvs.length;

    }
    
    function add_face( a, b, c, normals_inds ) {

      if ( normals_inds === undefined ) {

        geometry.faces.push( face3(
          vertices[ parseVertexIndex( a ) ] - 1,
          vertices[ parseVertexIndex( b ) ] - 1,
          vertices[ parseVertexIndex( c ) ] - 1
        ) );

      } else {

        geometry.faces.push( face3(
          vertices[ parseVertexIndex( a ) ] - 1,
          vertices[ parseVertexIndex( b ) ] - 1,
          vertices[ parseVertexIndex( c ) ] - 1,
          [
            normals[ parseNormalIndex( normals_inds[ 0 ] ) ].clone(),
            normals[ parseNormalIndex( normals_inds[ 1 ] ) ].clone(),
            normals[ parseNormalIndex( normals_inds[ 2 ] ) ].clone()
          ]
        ) );

      }

    }
    
    function add_uvs( a, b, c ) {
    
      geometry.faceVertexUvs[ 0 ].push( [
        uvs[ parseUVIndex( a ) ].clone(),
        uvs[ parseUVIndex( b ) ].clone(),
        uvs[ parseUVIndex( c ) ].clone()
      ] );

    }
    
    function handle_face_line(faces, uvs, normals_inds) {

      if ( faces[ 3 ] === undefined ) {
        
        add_face( faces[ 0 ], faces[ 1 ], faces[ 2 ], normals_inds );
        
        if ( uvs !== undefined && uvs.length > 0 ) {

          add_uvs( uvs[ 0 ], uvs[ 1 ], uvs[ 2 ] );

        }

      } else {
        
        if ( normals_inds !== undefined && normals_inds.length > 0 ) {

          add_face( faces[ 0 ], faces[ 1 ], faces[ 3 ], [ normals_inds[ 0 ], normals_inds[ 1 ], normals_inds[ 3 ] ] );
          add_face( faces[ 1 ], faces[ 2 ], faces[ 3 ], [ normals_inds[ 1 ], normals_inds[ 2 ], normals_inds[ 3 ] ] );

        } else {

          add_face( faces[ 0 ], faces[ 1 ], faces[ 3 ] );
          add_face( faces[ 1 ], faces[ 2 ], faces[ 3 ] );

        }
        
        if ( uvs !== undefined && uvs.length > 0 ) {

          add_uvs( uvs[ 0 ], uvs[ 1 ], uvs[ 3 ] );
          add_uvs( uvs[ 1 ], uvs[ 2 ], uvs[ 3 ] );

        }

      }
      
    }

    // create mesh if no objects in text

    if ( /^o /gm.test( text ) === false ) {

      geometry = new THREE.Geometry();
      material = new THREE.MeshLambertMaterial();
      mesh = new THREE.Mesh( geometry, material );
      object.add( mesh );

    }

    var vertices = [];
    var normals = [];
    var uvs = [];

    // v float float float

    var vertex_pattern = /v( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;

    // vn float float float

    var normal_pattern = /vn( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;

    // vt float float

    var uv_pattern = /vt( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;

    // f vertex vertex vertex ...

    var face_pattern1 = /f( +-?\d+)( +-?\d+)( +-?\d+)( +-?\d+)?/;

    // f vertex/uv vertex/uv vertex/uv ...

    var face_pattern2 = /f( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+))?/;

    // f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...

    var face_pattern3 = /f( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))( +(-?\d+)\/(-?\d+)\/(-?\d+))?/;

    // f vertex//normal vertex//normal vertex//normal ... 

    var face_pattern4 = /f( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))( +(-?\d+)\/\/(-?\d+))?/

    //

    var lines = text.split( '\n' );

    for ( var i = 0; i < lines.length; i ++ ) {

      var line = lines[ i ];
      line = line.trim();

      var result;

      if ( line.length === 0 || line.charAt( 0 ) === '#' ) {

        continue;

      } else if ( ( result = vertex_pattern.exec( line ) ) !== null ) {

        // ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

        vertices.push( 
          geometry.vertices.push(
            vector(
              result[ 1 ], result[ 2 ], result[ 3 ]
            )
          )
        );

      } else if ( ( result = normal_pattern.exec( line ) ) !== null ) {

        // ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]

        normals.push(
          vector(
            result[ 1 ], result[ 2 ], result[ 3 ]
          )
        );

      } else if ( ( result = uv_pattern.exec( line ) ) !== null ) {

        // ["vt 0.1 0.2", "0.1", "0.2"]

        uvs.push(
          uv(
            result[ 1 ], result[ 2 ]
          )
        );

      } else if ( ( result = face_pattern1.exec( line ) ) !== null ) {

        // ["f 1 2 3", "1", "2", "3", undefined]

        handle_face_line(
          [ result[ 1 ], result[ 2 ], result[ 3 ], result[ 4 ] ]
        );

      } else if ( ( result = face_pattern2.exec( line ) ) !== null ) {

        // ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]
        
        handle_face_line(
          [ result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ] ], //faces
          [ result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ] ] //uv
        );

      } else if ( ( result = face_pattern3.exec( line ) ) !== null ) {

        // ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]

        handle_face_line(
          [ result[ 2 ], result[ 6 ], result[ 10 ], result[ 14 ] ], //faces
          [ result[ 3 ], result[ 7 ], result[ 11 ], result[ 15 ] ], //uv
          [ result[ 4 ], result[ 8 ], result[ 12 ], result[ 16 ] ] //normal
        );

      } else if ( ( result = face_pattern4.exec( line ) ) !== null ) {

        // ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]

        handle_face_line(
          [ result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ] ], //faces
          [ ], //uv
          [ result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ] ] //normal
        );

      } else if ( /^o /.test( line ) ) {

        geometry = new THREE.Geometry();
        material = new THREE.MeshLambertMaterial();

        mesh = new THREE.Mesh( geometry, material );
        mesh.name = line.substring( 2 ).trim();
        object.add( mesh );

      } else if ( /^g /.test( line ) ) {

        // group

      } else if ( /^usemtl /.test( line ) ) {

        // material

        material.name = line.substring( 7 ).trim();

      } else if ( /^mtllib /.test( line ) ) {

        // mtl file

      } else if ( /^s /.test( line ) ) {

        // smooth shading

      } else {

        // console.log( "THREE.OBJLoader: Unhandled line " + line );

      }

    }

    var children = object.children;

    for ( var i = 0, l = children.length; i < l; i ++ ) {

      var geometry = children[ i ].geometry;

      geometry.computeFaceNormals();
      geometry.computeBoundingSphere();

    }
    
    return object;

  }

};

var textureLoader = require('./textureLoader');


function ObjectLoader() {
  var ctx = this;
  this.objectLoader = new THREE.OBJLoader();
  this.objects = {};
  this.textureLoader = textureLoader;

  this.loadObject('Sand');
  this.loadObject('Clay');
  this.loadObject('Rock');
  this.loadObject('Dirt');
  this.loadObject('Gold');
  this.loadObject('Diamond');
  this.loadObject('Palm');
  this.loadObject('Leaf', 'Palm');
  this.loadObject('Trunk', 'Palm');

  this.loadObject('Player');
  this.loadObject('Monster');
  
  this.loadObject('Sign');
}

ObjectLoader.prototype.loadObject = function(url, texOverride) {
  var ctx = this;
  var texture = this.textureLoader.getTexture(texOverride || url);
  var normal = this.textureLoader.getNormal((texOverride || url));

  var specCol = 0x222222;
  if(url == "Monster"){
    specCol = 0xff0000;
  }
  else if(url == "Gold"){
    specCol = 0xffe400;
  }
  else if(url == "Sand"){
    specCol = 0x111111;
  }
  else if(url == "Dirt"){
    specCol = 0x010101;
  }
  else if(url == "Clay"){
    specCol = 0x111111;
  }
  else if(url == "Diamond"){
    specCol = 0x005a89;
  }
  else if(url == "Rock"){
    specCol = 0x222222;
  }

  var material = new THREE.MeshPhongMaterial({color:0xDDDDDD, specular: specCol});
  material.map = texture;
  material.transparent = true;
  material.normalMap = normal;
  material.normalScale = new THREE.Vector3(0.25,0.25);
  // material.specularMap = specular;
  // material.bumpScale = 0.5;
  material.needsUpdate = true;

  // this.objects[url];
  this.objectLoader.load('models/' + url + '.obj', function (event) {
    obj = event.children[0];
    ctx.objects[url] = obj;
    obj.material = material;

  }, function(){}, function(err){
    console.log(err);
  });
};

ObjectLoader.prototype.getObject = function(obj) {
  if(!this.objects[obj]){
    console.log("Object not loaded: " + obj);
    return;
  }
  return this.objects[obj].clone();
}

function onError(err){
  console.log(err);
}

var instance = new ObjectLoader();
module.exports = instance;