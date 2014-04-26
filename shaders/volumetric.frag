
precision mediump float;

uniform sampler2D tex;
uniform vec2 size;
uniform vec2 sun;

const float samples = 20.0;
const float brightness = 0.1;

void main()
{
	vec2 pos = gl_FragCoord.xy * size;
	vec2 dir = (sun - pos) / 20.0; //div portion of screen
	float scattering = 0.0;
	for (float i = 0.0; i < samples; i += 1.0)
		scattering += texture2D(tex, pos + dir * i / samples).a > 0.0 ? 0.0 : 1.0;
	gl_FragColor = texture2D(tex, pos) + vec4(1,1,0.8,0.0) * (brightness * scattering / samples);
}