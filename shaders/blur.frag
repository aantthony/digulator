
precision mediump float;

uniform sampler2D tex;
uniform sampler2D orig;
uniform vec2 size;

uniform int pass;

vec4 getTex(vec2 coord)
{
	vec4 col = texture2D(tex, coord);
	return pass == 0 ? max(col - 0.8, vec4(0.0)) : col;
}

void main()
{
	float weight[5];
	weight[0] = 0.2270270270;
	weight[1] = 0.1945945946;
	weight[2] = 0.1216216216;
	weight[3] = 0.0540540541;
	weight[4] = 0.0162162162;

	vec2 dir = vec2(pass==0?1.0:0.0, pass==0?0.0:1.0);
	vec4 accum = vec4(0);
	for (int i = 4; i > 0; --i)
		accum += getTex((gl_FragCoord.xy + dir * float(-i)) * size) * weight[i];
	for (int i = 0; i < 4; ++i)
		accum += getTex((gl_FragCoord.xy + dir * float(i)) * size) * weight[i];
	if (pass == 0)
		accum *= 1.0/0.2;
	else if (pass == 1)
		accum = texture2D(orig, gl_FragCoord.xy * size) * 0.8 + accum * 0.2;
	else
		accum *= 0.2;
	gl_FragColor = accum;
}
