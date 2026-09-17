export default (shader) => shader
  .replace('#include <common>', `
    #include <common>
    varying vec2 sphereUv;
    varying float noise;
  `)
  .replace('vec4 diffuseColor = vec4( diffuse, opacity );', `
    vec3 color = vec3(sphereUv * (0.2 - 2.0 * noise), 1.0);
    vec3 finalColors = vec3(color.b * 1.5, color.r, color.r);
    vec4 diffuseColor = vec4(cos(finalColors * noise * 3.0), 1.0);
  `)
  .replace('#include <colorspace_fragment>', '');
