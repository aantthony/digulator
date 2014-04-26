
module.exports = Bloom;

var Shader = require('./shader');
var GLUtil = require('./glutil');

function Bloom(w, h) {
	
	this.w = w;
	this.h = h;
	
	this.quad = GLUtil.createQuad();
	
	this.RTTFBO = gl.createFramebuffer();
	this.RTT = GLUtil.createTexture(this.w, this.h, gl.RGBA, true, "bloomRTT");
	this.RTTD = gl.createRenderbuffer(1);
	gl.bindRenderbuffer(gl.RENDER_BUFFER, this.RTTD);
	gl.renderbufferStorage(gl.RENDER_BUFFER, gl.DEPTH_COMPONENT, this.w, this.h);
	gl.bindRenderbuffer(gl.RENDER_BUFFER, null);
	this.blurFBO = gl.createFramebuffer();
	this.blurTex = GLUtil.createTexture(this.w, this.h, gl.RGBA, true, "bloomRTT");

	var vertSrc = require('../shaders/blur.vert');
	var fragSrc = require('../shaders/blur.frag');
	this.blur = Shader.create(vertSrc, fragSrc, "blur");
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.RTTFBO);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.RTT, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.RTTD);
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.blurFBO);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.blurTex, 0);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	
	this.bind = function() {
	   gl.bindFramebuffer(gl.FRAMEBUFFER, this.RTTFBO);
	}
	this.unbind = function(target) {
		if (!target)
			target = null;
		
		gl.useProgram(this.blur);
		gl.uniform1i(gl.getUniformLocation(this.blur, "pass"), 0);
		gl.uniform2f(gl.getUniformLocation(this.blur, "size"), 1.0/this.w, 1.0/this.h);
		Shader.setActiveTexture(this.blur, "tex", 0, this.RTT);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.blurFBO);
		this.quad.draw(this.blur);
		
		gl.uniform1i(gl.getUniformLocation(this.blur, "pass"), 1);
		Shader.setActiveTexture(this.blur, "orig", 0, this.RTT);
		Shader.setActiveTexture(this.blur, "tex", 1, this.blurTex);
		gl.bindFramebuffer(gl.FRAMEBUFFER, target);
		gl.disable(gl.DEPTH_TEST);
		//gl.enable(gl.BLEND);
		//gl.blendFunc(gl.ONE, gl.ONE);
		this.quad.draw(this.blur);
		//gl.disable(gl.BLEND);
	}
};