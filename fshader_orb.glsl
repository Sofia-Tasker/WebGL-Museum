#version 300 es
precision mediump float;

in vec4 vColor;
in vec3 texCoord;
uniform samplerCube uTextureUnit;

out vec4 fColor;

void main()
{
    fColor = vColor*texture(uTextureUnit, texCoord);
}
