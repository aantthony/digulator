
GLUtil = {

	checkerror: function(s)
	{
		return;

		if (releaseMode)
			return;
		var e = gl.getError();
		while (e)
		{
			var at = ""
			if (s != null)
				at = " " + s
			var msg = "GL Error " + e + ": " + getGLErrorString(e) + at + "\n" + getStackTrace();
			console.log(msg);
			alert("checkerror: " + msg);
			e = gl.getError();
		}
	},
	getNumChannels: function(format)
	{
		var channels = 0;
		switch(format)
		{
		case gl.ALPHA: channels = 1; break;
		case gl.LUMINANCE: channels = 1; break;
		case gl.LUMINANCE_ALPHA: channels = 2; break;
		case gl.RGB: channels = 3; break;
		case gl.RGBA: channels = 4; break;
		}
		return channels;
	},
	VBO: function(type)
	{
		if (type == null)
			type = gl.ARRAY_BUFFER;
		this.type = type;
		this.object = 0;
		this.data = new Array();
		this.count = 0;
		this.buffered = false;
		this.upload = function()
		{
			GLUtil.checkerror("before buffer data");
			if (this.buffered)
				return;
			this.buffered = true;
			
			if (this.object == 0)
				this.object = gl.createBuffer();
			
			this.count = this.data.length;
			assert(this.count > 0, "VBO data size is zero");
				
			gl.bindBuffer(this.type, this.object);
			if (this.type == gl.ELEMENT_ARRAY_BUFFER)
				gl.bufferData(this.type, new Int16Array(this.data), gl.STATIC_DRAW);
			else
				gl.bufferData(this.type, new Float32Array(this.data), gl.STATIC_DRAW);
			gl.bindBuffer(this.type, null);
			GLUtil.checkerror("at buffer data");
			this.data = new Array();
		}
		this.release = function()
		{
			if (this.object != 0)
				gl.deleteBuffer(this.object);
			this.object = 0;
			this.count = 0;
			this.buffered = false;
		}
	},
	Mesh: function()
	{
		this.primitive = gl.TRIANGLES;
		this.vertices = null;
		this.indices = null;
		this.stride = 0;
		this.normOffset = -1;
		this.texOffset = -1;
		this.name = "unnamed"
		this.draw = function(shader)
		{
			GLUtil.checkerror("before draw " + this.name);
			assert(this.vertices != null, "Can't draw Mesh: null vertices");
			this.vertices.upload();
			var locVert = gl.getAttribLocation(shader, "osVert");
			var locNorm = gl.getAttribLocation(shader, "osNorm");
			var locTex = gl.getAttribLocation(shader, "texCoord");
			//console.log(shader.name + " (" + this.name + ") " + locVert + " " + locNorm + " " + locTex);
			if (locVert == -1)
			{
				console.log("Error: Missing osVert in shader " + shader.name);
				return;
			}
			
			gl.bindBuffer(gl.ARRAY_BUFFER, this.vertices.object);
			gl.enableVertexAttribArray(locVert);
			gl.vertexAttribPointer(locVert, 3, gl.FLOAT, gl.FALSE, this.stride, 0);
			if (locNorm > -1 && this.normOffset > -1)
			{
				gl.enableVertexAttribArray(locNorm);
				gl.vertexAttribPointer(locNorm, 3, gl.FLOAT, gl.FALSE, this.stride, this.normOffset);
			}
			if (locTex > -1 && this.texOffset > -1)
			{
				gl.enableVertexAttribArray(locTex);
				gl.vertexAttribPointer(locTex, 2, gl.FLOAT, gl.FALSE, this.stride, this.texOffset);
			}
			gl.bindBuffer(gl.ARRAY_BUFFER, null);
			GLUtil.checkerror("after binding before draw " + this.name);
			if (this.indices == null)
			{
				gl.drawArrays(this.primitive, 0, this.vertices.count / (this.stride / 4));
			}
			else
			{
				this.indices.upload();
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices.object);
				gl.drawElements(this.primitive, this.indices.count, gl.UNSIGNED_SHORT, 0);
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
			}
			GLUtil.checkerror("after draw " + this.name);
			gl.disableVertexAttribArray(locVert);
			if (locNorm > -1 && this.normOffset > -1)
				gl.disableVertexAttribArray(locNorm);
			if (locTex > -1 && this.texOffset > -1)
				gl.disableVertexAttribArray(locTex);
		}
		this.release = function()
		{
			if (this.vertices != null)
				this.vertices.release();
			if (this.indices != null)
				this.indices.release();
		}
	},
	createQuad: function(size)
	{
		size = typeof size !== 'undefined' ? size : 1.0;
		var mesh = new GLUtil.Mesh();
		mesh.vertices = new GLUtil.VBO();
		mesh.vertices.data =
			[-size, size, 0, 0, 0, 1, 0, 1,
			-size, -size, 0, 0, 0, 1, 0, 0,
			size, size, 0, 0, 0, 1, 1, 1,
			size, -size, 0, 0, 0, 1, 1, 0]
		mesh.stride = 8 * 4;
		mesh.normOffset = 3 * 4;
		mesh.texOffset = 6 * 4;
		mesh.primitive = gl.TRIANGLE_STRIP;
		mesh.name = "quad " + size;
		return mesh;
	},
	nextPowerOf2: function(x)
	{
		var l2 = Math.log(x) / Math.log(2);
		l2 = Math.ceil(l2);
		return Math.pow(2, l2);
	},
	createTexture: function(w, h, format, isfloat, name)
	{	
		if (GLUtil.nextPowerOf2(w) != w || GLUtil.nextPowerOf2(h) != h)
		{
			console.log("Warning: trying to create npot tex " + w + "x" + h);
		}
		var channels = GLUtil.getNumChannels(format);
		if (isfloat == null)
			isfloat = false;
		var tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		var inType = isfloat ? gl.FLOAT : gl.UNSIGNED_BYTE
		var inFormat = format;
		if (format == gl.DEPTH_COMPONENT)
		{
			inType = gl.UNSIGNED_SHORT;
		}
		gl.texImage2D(gl.TEXTURE_2D, 0, format, w, h, 0, inFormat, inType, null);
		gl.bindTexture(gl.TEXTURE_2D, null);
		tex.width = w;
		tex.height = h;
		tex.format = format;
		tex.isFloat = isfloat;
		tex.totalBytes = w * h * channels * (isfloat?4:1);
		if (name == null)
			name = "unnamed";
		tex.name = name + " " + tex.width + "x" + tex.height;
		return tex;
	}
};

module.exports = GLUtil;
