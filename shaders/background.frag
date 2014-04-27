/* spec: webgl */
uniform vec3 colorDiffuse;
uniform vec2 sun;
uniform float aspect;
varying vec2 vPosition;
void main() {
  float y = 1.0 + 0.5 * vPosition.y - 0.5;
  vec3 a = vec3(25. / 255., 36. / 255., 48. / 255.);
  a = vec3(0.02, 0.0, 0.7);
  vec3 b = vec3(120. / 255., 180./255., 200./255.);
  gl_FragColor = vec4(
    mix(a, b, y),
    0.0
  );
  vec2 toSun2 = (vPosition - vec2((sun.x-0.5)*aspect*2.0, sun.y*2.0-1.0));
  float distToSun2 = dot(toSun2, toSun2);
  if (distToSun2 < 0.02) { // size of sun
    gl_FragColor = 3.0 * vec4(1.0, 0.8, 0.7, 0.0);
  }
}