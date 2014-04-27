precision mediump float;

varying vec2 coord;
varying float fade;

uniform sampler2D shadow;
varying vec4 lsPos;

varying vec3 noiseVal;

varying float type;

void main()
{
	bool inShadow = false;
	/*
	vec4 shadowCoord = lsPos;
	shadowCoord.xyz /= shadowCoord.w;
	shadowCoord.xyz = shadowCoord.xyz * 0.5 + 0.5;
	
	if (shadowCoord.x > 0.001 && shadowCoord.x < 0.99 && shadowCoord.y > 0.001 && shadowCoord.y < 0.99 && shadowCoord.w > 0.0 && shadowCoord.z < 0.9999)
		if (texture2D(shadow, shadowCoord.xy).r - shadowCoord.z < -0.01)
			inShadow = true;
	*/
	
	vec3 col;// = vec3(inShadow ? 0.2 : 1.0);
	
	float circle = min(length(coord), 1.0);
	
	circle = (1.0/(circle*circle*16.0+1.0)-(1.0/17.0))*(17.0/16.0);
	
	if (type == 0.0)
	{
		col = mix(vec3(1, 0.7, 0.2), vec3(1, 0.2, 0.0), 1.0 - fade * fade) * 10.0 * fade;
		circle = ceil(circle - 0.5);
	}
	else if (type == 1.0)
	{
		col = mix(vec3(0.6, 0.5, 0.3), vec3(0.2, 0.1, 0.0), noiseVal.x);
		circle = sqrt(circle);
	}
	else if (type == 2.0)
	{
		col = mix(vec3(1, 1, 1), vec3(0, 0.8, 0.8), 1.0 - fade * fade);
	}
	
	float d = fade * circle;
	//gl_FragColor = vec4(1,d*d,0,d * 0.2);
	gl_FragColor = vec4(col, d);
	
	//gl_FragColor = vec4(1,0,0,1);
}

