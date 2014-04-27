
attribute vec4 osVert;
attribute vec2 texCoord;

uniform mat4 projectionMat;
uniform mat4 modelviewMat;
uniform mat4 lightMat;

uniform sampler2D noise;
uniform sampler2D particles;
uniform sampler2D velocities;

varying vec2 coord;
varying float fade;

varying vec3 noiseVal;

varying vec4 lsPos;

varying float type;

void main()
{
	coord = osVert.xy;
	
	noiseVal = texture2D(noise, texCoord).xyz;
	
	vec4 particle = texture2D(particles, texCoord);
	type = particle.w;
	
	vec4 veldat = texture2D(velocities, texCoord);
	fade = clamp(1.0 - veldat.w, 0.0, 1.0);
	
	vec3 velocity = vec3(modelviewMat * vec4(veldat.xyz, 0.0));
	vec3 n = normalize(cross(velocity, vec3(0, 0, 1)));
	vec4 esVert = modelviewMat * vec4(particle.xyz, 1.0);
	
	float size;
	
	if (type == 0.0)
		size = 0.8;
	else if (type == 1.0)
	{
		size = max(veldat.w, 1.0);
		velocity = normalize(velocity);
	}
	else if (type == 2.0)
		size = 0.6;
		
	if (veldat.w > 1.0)
		size = 0.0;
	
	vec2 square = osVert.xy * vec2(0.2, 0.1) * size;
	
	#if 1
	esVert.xyz += velocity * square.x + n * square.y;
	#else
	esVert.xyz += vec3(square, 0.0);
	#endif
	
	gl_Position = projectionMat * esVert;
	
	lsPos = lightMat * esVert;
}

