
attribute vec4 osVert;
attribute vec2 texCoord;

uniform mat4 projectionMat;
uniform mat4 modelviewMat;
uniform mat4 lightMat;

uniform sampler2D particles;
uniform sampler2D velocities;

varying vec2 coord;
varying float fade;

varying vec4 lsPos;

varying float type;

void main()
{
	coord = osVert.xy;
	
	vec4 particle = texture2D(particles, texCoord);
	type = particle.w;
	
	vec4 veldat = texture2D(velocities, texCoord);
	fade = max(0.0, 1.0 - veldat.w * 2.0);
	
	vec3 velocity = vec3(modelviewMat * vec4(veldat.xyz, 0.0));
	vec3 n = normalize(cross(velocity, vec3(0, 0, 1)));
	vec4 esVert = modelviewMat * vec4(particle.xyz, 1.0);
	
	float size;
	
	if (type == 0.0)
		size = 0.4;
	else if (type == 1.0)
		size = max(veldat.w * 4.0, 1.0);
	else if (type == 2.0)
		size = 1.0;
	
	vec2 square = osVert.xy * vec2(0.05, 0.1) * size;
	
	#if 1
	esVert.xyz += velocity * square.x + n * square.y;
	#else
	esVert.xyz += vec3(square, 0.0);
	#endif
	
	gl_Position = projectionMat * esVert;
	
	lsPos = lightMat * esVert;
}
