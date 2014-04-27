varying vec2 vPosition;
uniform float aspect;
void main() {
  vPosition = vec2(aspect * position.x, position.y);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
