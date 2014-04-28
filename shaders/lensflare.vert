
attribute vec4 osVert;

uniform vec2 sun;
uniform float aspect;

uniform vec3 attribs;

varying float col;
varying vec2 coord;

const float flareScale = 1.0;

void main()
{
	coord = osVert.xy;
	col = attribs.z;
	
	gl_Position = vec4((sun*2.0-1.0) * (1.0 - attribs.x) + osVert.xy * attribs.y * flareScale * vec2(1.0/aspect, 1.0), 0.0, 1.0);
}

