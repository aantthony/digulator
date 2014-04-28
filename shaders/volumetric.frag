
precision mediump float;

uniform sampler2D tex;
uniform vec2 size;
uniform vec2 sun;

uniform float primaryScale; //scales down the primary colour

const float samples = 30.0;
const float brightness = 0.3;

void main()
{
	vec2 pos = gl_FragCoord.xy * size;
	vec2 dir = (sun - pos) / 10.0; //div portion of screen
	float scattering = 0.0;
	for (float i = 0.0; i < samples; i += 1.0)
		scattering += 1.0-texture2D(tex, pos + dir * i / samples).a;
	gl_FragColor = texture2D(tex, pos) * primaryScale + vec4(1,1,0.8,0.0) * (brightness * scattering / samples);
}
