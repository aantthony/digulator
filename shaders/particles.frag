precision mediump float;

uniform sampler2D positions;
uniform sampler2D velocities;
uniform sampler2D noise;

uniform vec2 vpSize;
uniform float time;
uniform int pass;

void main()
{
	vec2 coord = gl_FragCoord.xy / vpSize;
	vec4 position = texture2D(positions, coord);
	vec4 velocity = texture2D(velocities, coord);
	vec3 n = texture2D(noise, position.xy * 30.0).rgb;

	velocity.x += sin(n.x*6.2) * n.y * 0.01;
	velocity.y += sin(n.y*6.2) * n.x * 0.01;
	velocity.z += sin(n.z*6.2) * n.z * 0.01;
	
	velocity.w += time;
	
	/*
	if (position.w == 1.0)
	{
		if (length(position.xyz) < 2.1)
			position.xyz = normalize(position.xyz) * 2.1;
		
		velocity.xyz += -position.xyz * 0.01;
		velocity.xyz *= 0.97;
	}
	else*/
	{
		velocity.xyz *= 0.95;
		velocity.y -= time * 9.8;
	}
	
	position.xyz += velocity.xyz * time;
	
	if (pass == 0)
		gl_FragColor = position;
	else
		gl_FragColor = velocity;
}
