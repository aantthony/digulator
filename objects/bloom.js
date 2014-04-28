
module.exports = Bloom;

var Shader = require('./shader');
var GLUtil = require('./glutil');

function Bloom(w, h) {
	
	this.primaryScale = 0.9;
	this.threshold = 0.8;
	
	this.w = w;
	this.h = h;
	
	this.quad = GLUtil.createQuad();
	
	this.RTTFBO = gl.createFramebuffer();
	this.RTT = GLUtil.createTexture(this.w, this.h, gl.RGBA, true, "bloomRTT");
	this.RTTFBOdown = gl.createFramebuffer();
	this.RTTdown = GLUtil.createTexture(this.w/4, this.h/4, gl.RGBA, true, "bloomRTTdown");
	this.RTTD = gl.createRenderbuffer(1);
	gl.bindRenderbuffer(gl.RENDERBUFFER, this.RTTD);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.w, this.h);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	this.blurFBO = gl.createFramebuffer();
	this.blurTex = GLUtil.createTexture(this.w, this.h, gl.RGBA, true, "bloomBlur");
	this.blurFBOdown = gl.createFramebuffer();
	this.blurTexDown = GLUtil.createTexture(this.w/4, this.h/4, gl.RGBA, true, "bloomBlurDown");

	var vertSrc = require('../shaders/blur.vert');
	var fragSrc = require('../shaders/blur.frag');
	this.blur = Shader.create(vertSrc, fragSrc, "blur");
	
	var vertSrc = require('../shaders/downsample.vert');
	var fragSrc = require('../shaders/downsample.frag');
	this.downsample = Shader.create(vertSrc, fragSrc, "downsample");
	
	var vertSrc = require('../shaders/blit.vert');
	var fragSrc = require('../shaders/blit.frag');
	this.blit = Shader.create(vertSrc, fragSrc, "blit");
	
	var vertSrc = require('../shaders/volumetric.vert');
	var fragSrc = require('../shaders/volumetric.frag');
	this.volumetrics = Shader.create(vertSrc, fragSrc, "volumetric");
	
	this._attach = function()
	{
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.RTTFBO);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.RTT, 0);
		gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.RTTD);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.RTTFBOdown);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.RTTdown, 0);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.blurFBO);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.blurTex, 0);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.blurFBOdown);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.blurTexDown, 0);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	}
	
	this._attach();
	
	this.bind = function() {
	   gl.bindFramebuffer(gl.FRAMEBUFFER, this.RTTFBO);
	}
	this.unbind = function(target, sunPos) {
		if (!target)
			target = null;
			
		gl.disable(gl.DEPTH_TEST);
			
		//blit primary + volumetrics
		gl.useProgram(this.volumetrics);
		gl.bindFramebuffer(gl.FRAMEBUFFER, target);
		Shader.setActiveTexture(this.volumetrics, "tex", 0, this.RTT);
		gl.uniform2f(gl.getUniformLocation(this.volumetrics, "size"), 1.0/this.w, 1.0/this.h);
		gl.uniform2f(gl.getUniformLocation(this.volumetrics, "sun"), sunPos.x, sunPos.y);
		gl.uniform1f(gl.getUniformLocation(this.volumetrics, "primaryScale"), this.primaryScale);
		this.quad.draw(this.volumetrics);
		
		//first full rez blur pass
		gl.useProgram(this.blur);
		gl.uniform1i(gl.getUniformLocation(this.blur, "pass"), 0);
		gl.uniform2f(gl.getUniformLocation(this.blur, "size"), 1.0/this.w, 1.0/this.h);
		gl.uniform1f(gl.getUniformLocation(this.blur, "thresh"), this.threshold);
		this.threshold
		Shader.setActiveTexture(this.blur, "tex", 0, this.RTT);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.blurFBO);
		this.quad.draw(this.blur);
		
		//second full rez blur pass
		gl.uniform1i(gl.getUniformLocation(this.blur, "pass"), 1);
		Shader.setActiveTexture(this.blur, "tex", 0, this.blurTex);
		gl.bindFramebuffer(gl.FRAMEBUFFER, target);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE);
		this.quad.draw(this.blur);
		gl.disable(gl.BLEND);
		
		//downsample for large blur
		gl.useProgram(this.downsample);
		gl.uniform2f(gl.getUniformLocation(this.downsample, "size"), 1.0/(this.w), 1.0/(this.h));
		Shader.setActiveTexture(this.downsample, "tex", 0, this.RTT);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.blurFBO);
		gl.viewport(0, 0, this.w/2, this.h/2);
		this.quad.draw(this.downsample);
		gl.uniform2f(gl.getUniformLocation(this.downsample, "size"), 1.0/(this.w), 1.0/(this.h));
		Shader.setActiveTexture(this.downsample, "tex", 1, this.blurTex);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.RTTFBOdown);
		gl.viewport(0, 0, this.w/4, this.h/4);
		this.quad.draw(this.downsample);
		
		//first low rez (large) blur pass
		gl.useProgram(this.blur);
		gl.uniform1i(gl.getUniformLocation(this.blur, "pass"), 0);
		gl.uniform2f(gl.getUniformLocation(this.blur, "size"), 1.0/(this.w/4), 1.0/(this.h/4));
		gl.uniform1f(gl.getUniformLocation(this.blur, "thresh"), this.threshold);
		Shader.setActiveTexture(this.blur, "tex", 0, this.RTTdown);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.blurFBOdown);
		this.quad.draw(this.blur);
		
		//second low rez blur pass
		gl.uniform1i(gl.getUniformLocation(this.blur, "pass"), 2);
		Shader.setActiveTexture(this.blur, "tex", 0, this.blurTexDown);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.RTTFBOdown);
		this.quad.draw(this.blur);
		
		//add low rez blur to target
		gl.useProgram(this.blit);
		gl.uniform2f(gl.getUniformLocation(this.blit, "size"), 1.0/(this.w), 1.0/(this.h));
		Shader.setActiveTexture(this.blit, "tex", 0, this.RTTdown);
		gl.bindFramebuffer(gl.FRAMEBUFFER, target);
		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE);
		gl.viewport(0, 0, this.w, this.h);
		this.quad.draw(this.blit);
		gl.disable(gl.BLEND);
	}
	
	this.resize = function(w, h)
	{
		this.w = w;
		this.h = h;
		this.RTT.resize(this.w, this.h);
		this.RTTdown.resize(this.w/4, this.h/4);
		gl.bindRenderbuffer(gl.RENDERBUFFER, this.RTTD);
		gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.w, this.h);
		gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		this.blurTex.resize(this.w, this.h);
		this.blurTexDown.resize(this.w/4, this.h/4);
		
		this._attach();
	}
	
	this.release = function()
	{
		this.quad.release();
		
		if (this.RTTFBO) gl.deleteFramebuffer(this.RTTFBO);
		if (this.RTTFBOdown) gl.deleteFramebuffer(thisRTTFBOdown);
		if (this.blurFBO) gl.deleteFramebuffer(this.blurFBO);
		if (this.blurFBOdown) gl.deleteFramebuffer(this.blurFBOdown);
		
		if (this.RTT) gl.deleteTexture(this.RTT);
		if (this.RTTdown) gl.deleteFramebuffer(this.RTTdown);
		if (this.blurTex) gl.deleteFramebuffer(this.blurTex);
		if (this.blurTexDown) gl.deleteFramebuffer(this.blurTexDown);
		
		if (this.RTTD) gl.deleteRenderBuffer(this.RTTD);
	}
};
