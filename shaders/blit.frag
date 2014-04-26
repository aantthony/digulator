
precision mediump float;

uniform sampler2D tex;
uniform vec2 size;

void main()
{
	gl_FragColor = texture2D(tex, gl_FragCoord.xy * size);
}
