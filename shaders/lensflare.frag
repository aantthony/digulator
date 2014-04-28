precision mediump float;

uniform sampler2D tex;

varying float col;
varying vec2 coord;

const float brightness = 0.07;

vec3 hueToRGB(float h)
{
	h = fract(h) * 6.0;
	vec3 rgb;
	rgb.r = clamp(abs(3.0 - h)-1.0, 0.0, 1.0);
	rgb.g = clamp(2.0 - abs(2.0 - h), 0.0, 1.0);
	rgb.b = clamp(2.0 - abs(4.0 - h), 0.0, 1.0);
	return rgb;
}

void main()
{
	if (col == 0.0)
		gl_FragColor = vec4(vec3(1.0), texture2D(tex, coord*0.5+0.5).a);
	else
	{
		float r = length(coord);
		gl_FragColor = vec4(hueToRGB(col), brightness * max(0.0, 1.0 - pow(r, 10.0)));
	}
}

