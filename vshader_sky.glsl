#version 300 es
in vec3 aPosition;
in vec3 aNormal;

out vec3 texCoord;

uniform mat4 modelMatrix, cameraMatrix, projectionMatrix;

uniform vec4 matAmbient, matDiffuse, matSpecular;
uniform float matAlpha;

uniform vec3 lightDirection;
uniform vec4 lightAmbient, lightDiffuse, lightSpecular;

uniform vec3 spotlightDirection;
uniform vec4 spotlightAmbient, spotlightDiffuse, spotlightSpecular;


void main()
{
    gl_Position = projectionMatrix*cameraMatrix*modelMatrix*vec4(aPosition,1.0);
    
    //compute vectors in camera coordinates
    //the vertex in camera coordinates
    vec3 pos = (cameraMatrix*modelMatrix*vec4(aPosition,1.0)).xyz;

    //the ray from the vertex towards the light
    //for a directional light, this is just -lightDirection
    vec3 L = normalize((-cameraMatrix*vec4(lightDirection,0.0)).xyz);
    vec3 S = normalize((-cameraMatrix*vec4(spotlightDirection,0.0)).xyz);
    
    //the ray from the vertex towards the camera
    vec3 E = normalize(vec3(0,0,0)-pos);
    
    //normal in camera coordinates
    vec3 N = normalize(cameraMatrix*modelMatrix*vec4(aNormal,0)).xyz;
    
    //half-way vector	
    vec3 H = normalize(L+E);
    vec3 sH = normalize(S+E);
    
    vec4 ambient = lightAmbient*matAmbient;
    vec4 sAmbient = spotlightAmbient*matAmbient;
    
    float Kd = max(dot(L,N),0.0);
    vec4 diffuse = Kd*lightDiffuse*matDiffuse;
    float Sd = max(dot(S,N),0.0);
    vec4 sDiffuse = Sd*spotlightDiffuse*matDiffuse;
    
    float Ks = pow(max(dot(N,H),0.0),matAlpha);
    vec4 specular = Ks*lightSpecular*matSpecular;
    float Ss = pow(max(dot(N,sH),0.0),matAlpha);
    vec4 sSpecular = Ss*spotlightSpecular*matSpecular;
    
    vec4 lightColor = ambient + diffuse + specular;
    lightColor.a = 1.0;

    vec4 spotlightColor = sAmbient + sDiffuse + sSpecular;
    spotlightColor.a = 1.0;
    
    texCoord = normalize(aPosition.xyz);
}