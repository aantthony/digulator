
attribute vec2 osVert;

void main()
{
	gl_Position = vec4(osVert, 0, 1);
}
