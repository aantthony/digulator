precision mediump float;

varying vec2 coord;
varying float fade;

uniform sampler2D shadow;
varying vec4 lsPos;

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
	
	vec3 col = vec3(inShadow ? 0.2 : 1.0);
	
	float d = fade * max(0.0, 1.0 - length(coord));
	//gl_FragColor = vec4(1,d*d,0,d * 0.2);
	gl_FragColor = vec4(col,d);
	
	gl_FragColor = vec4(1,0,0,1);
}

