
module.exports = LensFlare;

var textureLoader = require('./textureLoader');

function LensFlare()
{
	this.quad = GLUtil.createQuad();
	
	this.starTex = textureLoader.getTexture("Flare");
	this.starTex = GLUtil.uploadTexture(this.starTex.image, gl.createTexture(), "flaretex");
	
	var vertSrc = require('../shaders/lensflare.vert');
	var fragSrc = require('../shaders/lensflare.frag');
	this.shader = Shader.create(vertSrc, fragSrc, "lensflare");

	this.flares = [];
	this.flares.push([0.0, 1.0, 0.0]);
	for (var i = 0; i < 20; ++i)
	{
		var d = -0.5 + Math.random() * 4.0;
		var l = Math.abs(1.0 - d);
		this.flares.push([d, 0.4 * l * (Math.random()>0.8?0.3:1.0), Math.random()]);
	}
	
	this.draw = function(sun, aspect)
	{
		gl.enable(gl.BLEND);
		//gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
		gl.disable(gl.DEPTH_TEST);
	
		gl.useProgram(this.shader);
		gl.uniform2f(gl.getUniformLocation(this.shader, "sun"), sun.x, sun.y);
		gl.uniform1f(gl.getUniformLocation(this.shader, "aspect"), aspect);
		
		Shader.setActiveTexture(this.shader, "tex", 0, this.starTex);
		
		for (var e in this.flares)
		{
			gl.uniform3f(gl.getUniformLocation(this.shader, "attribs"), this.flares[e][0], this.flares[e][1], this.flares[e][2]);			
			this.quad.draw(this.shader);
		}
		
		gl.disable(gl.BLEND);
	}
}
