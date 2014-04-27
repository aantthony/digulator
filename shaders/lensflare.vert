
attribute vec4 osVert;

uniform vec3 sun;
uniform mat4 projectionMat;
uniform mat4 modelviewMat;

uniform vec3 attribs;

varying float col;

void main()
{
	col = attribs.z;
	
	vec2 esSun = vec2(modelviewMat * vec4(sun, 1.0));
	vec2 pos = esSun.xy * (1.0 - attribs.x);
	vec4 csPos = projectionMat * vec4(pos + osVert.xy * 10.0 * attribs.y, sun.z, 1.0);
	gl_Position = csPos;
}

