
var GLUtil = require('./glutil');

Shader = {
	defaultShaderDefines: {},
	variablesAlreadyLogged: {},
	setActiveTexture: function(shader, str, index, tex)
	{
		var texLoc = gl.getUniformLocation(shader, str);
		if (texLoc == null)
		{
			if (Shader.variablesAlreadyLogged[str] != true)
			{
				console.log(str + " not in shader " + shader.name);
				Shader.variablesAlreadyLogged[str] = true;
			}
			return;
		}
		gl.activeTexture(gl.TEXTURE0 + index);
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.uniform1i(texLoc, index);
		gl.activeTexture(gl.TEXTURE0);
		GLUtil.checkerror("setActiveTexture " + str);
	},
	myarrayUnion: function(a, b)
	{
		var c = {}
		for (var i in a)
			if (!(i in c))
				c[i] = a[i];
		for (var i in b)
			if (!(i in c))
				c[i] = b[i];
		return c;
	},
	compileShader: function(n, str, type)
	{
		var shader = gl.createShader(type);
		gl.shaderSource(shader, str);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			var log = "Compile Error (" + n + "):\n" + gl.getShaderInfoLog(shader);
			console.log(log);
			alert(log);
			return null;
		}
		return shader
	},
	extractText: function(theSource, defines)
	{
		var mapdef = function (m, a, b, c, d)
		{
			if (b in defines)
				return a + b + c + defines[b] + " //" + d + "\n";
			return m;
		}
		var mapped = theSource.replace(/(#define[ \t]+)([A-Za-z_][A-Za-z0-9_]+)([\t ]+)(.*)\n/g, mapdef);
		//document.write("<div>" + mapped.replace(/\r?\n/g, "<br/>") + "</div>");
		return mapped;
	},
	create: function(vertSrc, fragSrc, name, defines)
	{
		var vertSrcN = name + ".vert";
		var fragSrcN = name + ".frag";
		if (defines == null)
			defines = {};
		defines = Shader.myarrayUnion(Shader.defaultShaderDefines, defines);
		vertSrc = Shader.extractText(vertSrc, defines);
		fragSrc = Shader.extractText(fragSrc, defines);
		if (vertSrc.length == 0) {alert("Error: invalid shader - " + vertSrcN); return null;}
		if (fragSrc.length == 0) {alert("Error: invalid shader - " + fragSrcN); return null;}
		var vert = Shader.compileShader(vertSrcN, vertSrc, gl.VERTEX_SHADER);
		var frag = Shader.compileShader(fragSrcN, fragSrc, gl.FRAGMENT_SHADER);
		var prog = gl.createProgram();
		gl.attachShader(prog, vert);
		gl.attachShader(prog, frag);
		gl.bindAttribLocation(prog, 0, "osVert");
		gl.bindAttribLocation(prog, 1, "osNorm");
		gl.bindAttribLocation(prog, 2, "texCoord");
		gl.linkProgram(prog);
		if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
			var log = "Link Error (" + vertSrcN + ", " + fragSrcN + "):\n" + gl.getProgramInfoLog(prog);
			console.log(log);
			alert(log);
			gl.deleteProgram(prog);
			return null;
		}
		prog.name = vertSrcN + "/" + fragSrcN;
		return prog;
	}
}

module.exports = Shader;