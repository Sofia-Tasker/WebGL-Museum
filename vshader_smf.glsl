#version 300 es
in vec3 aPosition;
in vec4 aColor;

uniform mat4 modelMatrix;
uniform mat4 cameraMatrix;
uniform mat4 projectionMatrix;

flat out vec4 vColor;

void main()
{
    gl_Position = projectionMatrix*cameraMatrix*modelMatrix*vec4(aPosition,1.0);
    vColor = aColor;
}