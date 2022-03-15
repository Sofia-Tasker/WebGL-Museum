class Triangle3D extends Drawable{
    static vertexPositions = [
    	vec3( -0.5, -0.5, 0 ),
    	vec3(  0.5,  -0.5, 0 ),
    	vec3(  0, 0.5, 0 )];
    static shaderProgram = -1;
    static positionBuffer = -1;
    static aPositionShader = -1;
    static uModelMatrixShader = -1;
    static uCameraMatrixShader = -1;
    static uProjectionMatrixShader = -1;
    
    static initialize() {
    	Triangle3D.shaderProgram = initShaders( gl, "/vshader.glsl", "/fshader.glsl");
    	gl.useProgram(Triangle3D.shaderProgram );
		
	// Load the data into the GPU
	Triangle3D.positionBuffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, Triangle3D.positionBuffer);
	gl.bufferData( gl.ARRAY_BUFFER, flatten(Triangle3D.vertexPositions), gl.STATIC_DRAW );
		
	// Associate our shader variables with our data buffer
	Triangle3D.aPositionShader = gl.getAttribLocation( Triangle3D.shaderProgram, "aPosition" );
	
	Triangle3D.uModelMatrixShader = gl.getUniformLocation( Triangle3D.shaderProgram, "modelMatrix" );
	Triangle3D.uCameraMatrixShader = gl.getUniformLocation( Triangle3D.shaderProgram, "cameraMatrix" );
	Triangle3D.uProjectionMatrixShader = gl.getUniformLocation( Triangle3D.shaderProgram, "projectionMatrix" );
    }
    	
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ){
        super(tx,ty,tz,scale,rotX,rotY,rotZ);
        if(Triangle3D.shaderProgram == -1)
            Triangle3D.initialize()
        
    }
    
    draw() {
    
        gl.useProgram(Triangle3D.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, Triangle3D.positionBuffer);
       	gl.vertexAttribPointer(Triangle3D.aPositionShader, 3, gl.FLOAT, false, 0, 0 );

	gl.uniformMatrix4fv(Triangle3D.uModelMatrixShader, false, flatten(this.modelMatrix));
	gl.uniformMatrix4fv(Triangle3D.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
	gl.uniformMatrix4fv(Triangle3D.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));
	
	console.log(camera1.projectionMatrix);
	
	gl.enableVertexAttribArray(Triangle3D.aPositionShader);    
    	gl.drawArrays( gl.TRIANGLE_FAN, 0, Triangle3D.vertexPositions.length);
    	gl.disableVertexAttribArray(Triangle3D.aPositionShader);    
    }
}

