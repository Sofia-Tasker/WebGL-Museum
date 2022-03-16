class SMF extends Drawable{
    static vertexPositions = [];
	static vertexColors = [];
	static indices = [];
    static shaderProgram = -1;
    static positionBuffer = -1;
    static aPositionShader = -1;
    static uModelMatrixShader = -1;
    static uCameraMatrixShader = -1;
    static uProjectionMatrixShader = -1;
	static fname;
    
    static initialize() {
		var smf_file = loadFileAJAX(SMF.fname);
		var lines = smf_file.split('\n');
		for(var line = 0; line < lines.length; line++){
			var strings = lines[line].trimRight().split(' ');
			switch(strings[0]){
				case('v'):
					SMF.vertexPositions.push(vec3(parseFloat(strings[1]), parseFloat(strings[2]), parseFloat(strings[3])));
					SMF.vertexColors.push(vec4(Math.random(), Math.random(), Math.random(), 1));
					break;
				case('f'):
					SMF.indices.push(parseInt(strings[1])-1);
					SMF.indices.push(parseInt(strings[2])-1);
					SMF.indices.push(parseInt(strings[3])-1);
					break;
			}
		}

    	SMF.shaderProgram = initShaders( gl, "/vshader_smf.glsl", "/fshader_smf.glsl");
    	gl.useProgram(SMF.shaderProgram );
		
		// Load the data into the GPU
		SMF.positionBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, SMF.positionBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(SMF.vertexPositions), gl.STATIC_DRAW );

		SMF.colorBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, SMF.colorBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(SMF.vertexColors), gl.STATIC_DRAW );

		SMF.indexBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, SMF.indexBuffer );
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(SMF.indices), gl.STATIC_DRAW);
			
		// Associate our shader variables with our data buffer
		SMF.aPositionShader = gl.getAttribLocation( SMF.shaderProgram, "aPosition" );
		SMF.aColorShader = gl.getAttribLocation( SMF.shaderProgram, "aColor" );
		
		SMF.uModelMatrixShader = gl.getUniformLocation( SMF.shaderProgram, "modelMatrix" );
		SMF.uCameraMatrixShader = gl.getUniformLocation( SMF.shaderProgram, "cameraMatrix" );
		SMF.uProjectionMatrixShader = gl.getUniformLocation( SMF.shaderProgram, "projectionMatrix" );
    }
    	
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ, fname){
        super(tx,ty,tz,scale,rotX,rotY,rotZ);
		SMF.fname = fname;
        if(SMF.shaderProgram == -1)
            SMF.initialize()
        
    }
    
    draw() {
    
        gl.useProgram(SMF.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, SMF.positionBuffer);
       	gl.vertexAttribPointer(SMF.aPositionShader, 3, gl.FLOAT, false, 0, 0 );

		gl.bindBuffer( gl.ARRAY_BUFFER, SMF.colorBuffer);
       	gl.vertexAttribPointer(SMF.aColorShader, 4, gl.FLOAT, false, 0, 0 );

		gl.uniformMatrix4fv(SMF.uModelMatrixShader, false, flatten(this.modelMatrix));
		gl.uniformMatrix4fv(SMF.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
		gl.uniformMatrix4fv(SMF.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, SMF.indexBuffer);
		
		gl.enableVertexAttribArray(SMF.aPositionShader);    
		gl.enableVertexAttribArray(SMF.aColorShader);    

		gl.drawElements(gl.TRIANGLES, SMF.indices.length, gl.UNSIGNED_INT, 0);

    	gl.disableVertexAttribArray(SMF.aPositionShader);    
		gl.disableVertexAttribArray(SMF.aColorShader);    
    }
}

