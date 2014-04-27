/* spec: webgl */

varying vec2 coord;

uniform float time;

uniform sampler2D texture;

void main() {
	vec2 c = coord;
	c.x += sin(time + c.x*6.2812) * c.y * 0.1;
	if (c.y > 0.9)
		discard;
	gl_FragColor = texture2D(texture, c);
}