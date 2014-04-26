
precision mediump float;

uniform sampler2D tex;
uniform vec2 size;

void main()
{
	vec2 c = gl_FragCoord.xy * 2.0 - vec2(0.5);
	gl_FragColor = texture2D(tex, gl_FragCoord.xy * size);
}
