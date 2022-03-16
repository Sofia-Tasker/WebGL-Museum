#version 300 es
in vec3 aPosition;
in vec4 aColor;
in vec3 aNormal;

out vec4 vColor;

uniform mat4 modelMatrix, cameraMatrix, projectionMatrix;

uniform vec4 matAmbient, matDiffuse, matSpecular;
uniform float matAlpha;

uniform vec3 lightDirection;
uniform vec4 lightAmbient, lightDiffuse, lightSpecular;

uniform vec3 SlightDirection;
uniform vec4 SlightAmbient, SlightDiffuse, SlightSpecular;

void main()
{
    gl_Position = projectionMatrix*cameraMatrix*modelMatrix*vec4(aPosition,1.0);
    
    //compute vectors in camera coordinates
    //the vertex in camera coordinates
    vec3 pos = (cameraMatrix*modelMatrix*vec4(aPosition,1.0)).xyz;

    //the ray from the vertex towards the light
    //for a directional light, this is just -lightDirection
    vec3 L = normalize((-cameraMatrix*vec4(lightDirection,0.0)).xyz);

    //the ray from the vertex towards the Slight
    //for a directional Slight, this is just -lightDirection
    vec3 S = normalize((-cameraMatrix*vec4(SlightDirection,0.0)).xyz);
    
    //the ray from the vertex towards the camera
    vec3 E = normalize(vec3(0,0,0)-pos);
    
    //normal in camera coordinates
    vec3 N = normalize(cameraMatrix*modelMatrix*vec4(aNormal,0)).xyz;
    
    //half-way vector	
    vec3 H = normalize(L+E);

    vec3 SH = normalize(S+E);
    
    vec4 ambient = lightAmbient*matAmbient;

    vec4 Sambient = SlightAmbient*matAmbient;
    
    float Kd = max(dot(L,N),0.0);
    vec4 diffuse = Kd*lightDiffuse*matDiffuse;

    float Sd = max(dot(S,N),0.0);
    vec4 Sdiffuse = Sd*SlightDiffuse*matDiffuse;
    
    float Ks = pow(max(dot(N,H),0.0),matAlpha);
    vec4 specular = Ks*lightSpecular*matSpecular;

    float Ss = pow(max(dot(N,SH),0.0),matAlpha);
    vec4 Sspecular = Ss*SlightSpecular*matSpecular;
    
    vec4 lightColor = ambient + diffuse + specular;
    lightColor.a = 1.0;

    vec4 SlightColor = Sambient + Sdiffuse + Sspecular;
    SlightColor.a = 1.0;

    vColor = 0.4*aColor+0.4*lightColor+0.9*SlightColor;

    vec3 V = normalize(inverse(cameraMatrix)*vec4(0,0,0,1)-modelMatrix*vec4(aPosition,1.0)).xyz;
    vec3 I = -V;
    vec3 M = normalize(modelMatrix*vec4(aNormal,0.0)).xyz;

    reflect(I, M);

}