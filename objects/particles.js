//particles for everything
module.exports = Particles;

var Shader = require('./shader');
var GLUtil = require('./glutil');

function Particles(n)
{
	if (!gl.getExtension("OES_texture_float")) {
		throw("Particles requires OES_texture_float extension");
	}

	this.w = n;
	this.h = n;
	this.noise = GLUtil.createNoiseTexture(16, 16, gl.RGB, false);
	this.fbopa = gl.createFramebuffer();
	this.fbopa.w = n;
	this.fbopa.h = n;
	this.fbopb = gl.createFramebuffer();
	this.fbopb.w = n;
	this.fbopb.h = n;
	this.fbova = gl.createFramebuffer();
	this.fbova.w = n;
	this.fbova.h = n;
	this.fbovb = gl.createFramebuffer();
	this.fbovb.w = n;
	this.fbovb.h = n;
	this.texPosA = GLUtil.createTexture(this.w, this.h, gl.RGBA, true, "particles"+n+"PA");
	this.texPosB = GLUtil.createTexture(this.w, this.h, gl.RGBA, true, "particles"+n+"PB");
	this.texVelA = GLUtil.createTexture(this.w, this.h, gl.RGBA, true, "particles"+n+"VA");
	this.texVelB = GLUtil.createTexture(this.w, this.h, gl.RGBA, true, "particles"+n+"VB");
	//this.texAttr = GLUtil.createTexture(this.w, this.h, gl.RGBA, false, "particles"+n+"ATTR");
	this.next = 0;
	
	this.shaderParticlesDraw = null;
	this.shaderParticles = null;
	
	this.swap = false;
	this.quad = GLUtil.createQuad();
	
	gl.clearColor(0,0,0,0);
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbopa);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texPosA, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbopb);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texPosB, 0);
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbova);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texVelA, 0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbovb);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texVelB, 0);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	
	var vertices = new Array()
	var v = 0;
	for (var i = 0; i < n; ++i)
	{
		for (var j = 0; j < n; ++j)
		{
			var tu = (i + 0.5) / n;
			var tv = (j + 0.5) / n;
			vertices[v++] = -1.0;
			vertices[v++] = -1.0;
			vertices[v++] = tu;
			vertices[v++] = tv;
			vertices[v++] = -1.0;
			vertices[v++] = 1.0;
			vertices[v++] = tu;
			vertices[v++] = tv;
			vertices[v++] = 1.0;
			vertices[v++] = 1.0;
			vertices[v++] = tu;
			vertices[v++] = tv;
			vertices[v++] = 1.0;
			vertices[v++] = -1.0;
			vertices[v++] = tu;
			vertices[v++] = tv;
		}
	}
	
	var indices = new Array()
	var o = 0;
	for (var i = 0; i < n*n; ++i)
	{
		indices[o++] = i*4+0;
		indices[o++] = i*4+2;
		indices[o++] = i*4+1;
		indices[o++] = i*4+0;
		indices[o++] = i*4+3;
		indices[o++] = i*4+2;
	}
	
	this.mesh = new GLUtil.Mesh();
	this.mesh.vertices = new GLUtil.VBO();
	this.mesh.vertices.data = vertices;
	this.mesh.indices = new GLUtil.VBO(gl.ELEMENT_ARRAY_BUFFER);
	this.mesh.indices.data = indices;
	this.mesh.stride = 4 * 4;
	this.mesh.texOffset = 2 * 4;
	this.mesh.primitive = gl.TRIANGLES;
	this.mesh.name = "particleGeom " + n;
	
	//position can be 4D, where w = particle type (does other shit in shaders)
	//velocity is 4D and 4th component should default to zero or be zero as its used for particle TTL
	this.spawn = function(position, velocity)
	{
		var posDat = new Float32Array(4);
		posDat.set(position);
		var velDat = new Float32Array(4);
		velDat.set(velocity);
		var x = this.next % this.w;
		var y = Math.floor(this.next / this.w);
		var texPos = this.swap?this.texPosB:this.texPosA;
		var texVel = this.swap?this.texVelB:this.texVelA;
		gl.bindTexture(gl.TEXTURE_2D, texPos);
		gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, 1, 1, gl.RGBA, gl.FLOAT, posDat);
		gl.bindTexture(gl.TEXTURE_2D, texVel);
		gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, 1, 1, gl.RGBA, gl.FLOAT, velDat);
		this.next = (this.next + 1) % (this.w * this.h);
	}
	this.step = function(time)
	{
		if (!this.shaderParticles)
		{
			var vertSrc = require('../shaders/particles.vert');
			var fragSrc = require('../shaders/particles.frag');
			this.shaderParticles = Shader.create(vertSrc, fragSrc, "particles");
		}
	
		gl.viewport(0, 0, this.w, this.h);
		gl.useProgram(this.shaderParticles);
		Shader.setActiveTexture(this.shaderParticles, "positions", 0, this.swap?this.texPosB:this.texPosA);
		Shader.setActiveTexture(this.shaderParticles, "velocities", 1, this.swap?this.texVelB:this.texVelA);
		Shader.setActiveTexture(this.shaderParticles, "noise", 2, this.noise);
		gl.uniform1f(gl.getUniformLocation(this.shaderParticles, "time"), time);
		gl.uniform2f(gl.getUniformLocation(this.shaderParticles, "vpSize"), this.w, this.h);
		
		gl.uniform1i(gl.getUniformLocation(this.shaderParticles, "pass"), 0);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.swap?this.fbopa:this.fbopb);
		this.quad.draw(this.shaderParticles);
		gl.uniform1i(gl.getUniformLocation(this.shaderParticles, "pass"), 1);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.swap?this.fbova:this.fbovb);
		this.quad.draw(this.shaderParticles);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		
		gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
		this.swap = !this.swap;
	}
	this.draw = function(projection, camera, shadowMap, lightMat)
	{
		gl.disable(gl.CULL_FACE);
	
		if (!this.shaderParticlesDraw)
		{
			var vertSrc = require('../shaders/particlesDraw.vert');
			var fragSrc = require('../shaders/particlesDraw.frag');
			this.shaderParticlesDraw = Shader.create(vertSrc, fragSrc, "particlesDraw");
		}
			
		gl.useProgram(this.shaderParticlesDraw);
		Shader.setActiveTexture(this.shaderParticlesDraw, "particles", 0, this.swap?this.texPosB:this.texPosA);
		Shader.setActiveTexture(this.shaderParticlesDraw, "velocities", 1, this.swap?this.texVelB:this.texVelA);
		Shader.setActiveTexture(this.shaderParticlesDraw, "noise", 3, this.noise);
		//Shader.setActiveTexture(this.shaderParticlesDraw, "attributes", 2, this.texAttr);
		if (!!shadowMap)
		{
			Shader.setActiveTexture(this.shaderParticlesDraw, "shadow", 2, shadowMap);
			gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderParticlesDraw, "lightMat"), false, lightMat);
		}
		gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderParticlesDraw, "modelviewMat"), false, camera);
		gl.uniformMatrix4fv(gl.getUniformLocation(this.shaderParticlesDraw, "projectionMat"), false, projection);
		this.mesh.draw(this.shaderParticlesDraw);
	}
	this.release = function()
	{
		this.quad.release();
		this.mesh.release();
		deleteTexture(this.texPosA);
		deleteTexture(this.texPosB);
		deleteTexture(this.texVelA);
		deleteTexture(this.texVelB);
		deleteTexture(this.noise);
		//deleteTexture(this.texAttr);
		gl.deleteFramebuffer(this.fbopa);
		gl.deleteFramebuffer(this.fbopb);
		gl.deleteFramebuffer(this.fbova);
		gl.deleteFramebuffer(this.fbovb);
	}
}
