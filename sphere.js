class Sphere extends Drawable{
    static vertexPositions = [];
    static vertexColors = [];
    static vertexNormals = [];
    static indices = [];

    static positionBuffer = -1;
    static colorBuffer = -1;
    static indexBuffer = -1;
    static normalBuffer = -1;
    
    static shaderProgram = -1;
    static aPositionShader = -1;
    static aColorShader = -1;
    static aNormalShader = -1;
    static uModelMatrixShader = -1;
    static uCameraMatrixShader = -1;
    static uProjectionMatrixShader = -1;
    
    static uMatAmbientShader = -1;
    static uMatDiffuseShader = -1;
    static uMatSpecularShader = -1;
    static uMatAlphaShader = -1;
    
    static uLightDirectionShader = -1;
    static uLightAmbientShader = -1;
    static uLightDiffuseShader = -1;
    static uLightSpecularShader = -1;

	static uSpotlightDirectionShader = -1;
    static uSpotlightAmbientShader = -1;
    static uSpotlightDiffuseShader = -1;
    static uSpotlightSpecularShader = -1;
    
    static computeNormals(){
		var normalSum = [];
		var counts = [];
		
		//initialize sum of normals for each vertex and how often its used.
		for (var i = 0; i<Sphere.vertexPositions.length; i++) {
			normalSum.push(vec3(0, 0, 0));
			counts.push(0);
		}
	
		//for each triangle
		for (var i = 0; i<Sphere.indices.length; i+=3) {
			var a = Sphere.indices[i];
			var b = Sphere.indices[i+1];
			var c = Sphere.indices[i+2];
			
			var edge1 = subtract(Sphere.vertexPositions[b],Sphere.vertexPositions[a])
			var edge2 = subtract(Sphere.vertexPositions[c],Sphere.vertexPositions[b])
			var N = cross(edge1,edge2)
			
			normalSum[a] = add(normalSum[a],normalize(N));
			counts[a]++;
			normalSum[b] = add(normalSum[b],normalize(N));
			counts[b]++;
			normalSum[c] = add(normalSum[c],normalize(N));
			counts[c]++;
	
		}
		
		for (var i = 0; i < Sphere.vertexPositions.length; i++) {
			this.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
		}
    }

    
    static initialize() {
		var smf_file = loadFileAJAX("bound-lo-sphere.smf");
		var lines = smf_file.split('\n');
		for(var line = 0; line < lines.length; line++){
			var strings = lines[line].trimRight().split(' ');
			switch(strings[0]){
				case('v'):
					Sphere.vertexPositions.push(vec3(parseFloat(strings[1]), parseFloat(strings[2]), parseFloat(strings[3])));
					//Sphere.vertexColors.push(vec4(Math.random(), Math.random(), Math.random(), 1));
					Sphere.vertexColors.push(vec4(1.0, 1.0, 0.0, 1.0));
					break;
				case('f'):
					Sphere.indices.push(parseInt(strings[1])-1);
					Sphere.indices.push(parseInt(strings[2])-1);
					Sphere.indices.push(parseInt(strings[3])-1);
					break;
			}
		}

        Sphere.computeNormals();
    	Sphere.shaderProgram = initShaders( gl, "/vshader.glsl", "/fshader.glsl");
    	gl.useProgram(Sphere.shaderProgram );
		
		// Load the data into the GPU
		Sphere.positionBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Sphere.positionBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Sphere.vertexPositions), gl.STATIC_DRAW );
		
		Sphere.colorBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Sphere.colorBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Sphere.vertexColors), gl.STATIC_DRAW );
		
		Sphere.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Sphere.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Sphere.vertexNormals), gl.STATIC_DRAW );
		
		Sphere.indexBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Sphere.indexBuffer);
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(Sphere.indices), gl.STATIC_DRAW );
			
		// Associate our shader variables with our data buffer
		Sphere.aPositionShader = gl.getAttribLocation( Sphere.shaderProgram, "aPosition" );
		Sphere.aColorShader = gl.getAttribLocation( Sphere.shaderProgram, "aColor" );
		Sphere.aNormalShader = gl.getAttribLocation( Sphere.shaderProgram, "aNormal" );
		
		Sphere.uModelMatrixShader = gl.getUniformLocation( Sphere.shaderProgram, "modelMatrix" );
		Sphere.uCameraMatrixShader = gl.getUniformLocation( Sphere.shaderProgram, "cameraMatrix" );
		Sphere.uProjectionMatrixShader = gl.getUniformLocation( Sphere.shaderProgram, "projectionMatrix" );
		
		Sphere.uMatAmbientShader = gl.getUniformLocation( Sphere.shaderProgram, "matAmbient" );
		Sphere.uMatDiffuseShader = gl.getUniformLocation( Sphere.shaderProgram, "matDiffuse" );
		Sphere.uMatSpecularShader = gl.getUniformLocation( Sphere.shaderProgram, "matSpecular" );
		Sphere.uMatAlphaShader = gl.getUniformLocation( Sphere.shaderProgram, "matAlpha" );
		
		Sphere.uLightDirectionShader = gl.getUniformLocation( Sphere.shaderProgram, "lightDirection" );
		Sphere.uLightAmbientShader = gl.getUniformLocation( Sphere.shaderProgram, "lightAmbient" );
		Sphere.uLightDiffuseShader = gl.getUniformLocation( Sphere.shaderProgram, "lightDiffuse" );
		Sphere.uLightSpecularShader = gl.getUniformLocation( Sphere.shaderProgram, "lightSpecular" );

		Sphere.uSpotlightDirectionShader = gl.getUniformLocation( Sphere.shaderProgram, "spotlightDirection" );
		Sphere.uSpotlightAmbientShader = gl.getUniformLocation( Sphere.shaderProgram, "spotlightAmbient" );
		Sphere.uSpotlightDiffuseShader = gl.getUniformLocation( Sphere.shaderProgram, "spotlightDiffuse" );
		Sphere.uSpotlightSpecularShader = gl.getUniformLocation( Sphere.shaderProgram, "spotlightSpecular" );
	
    }
    	
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        if(Sphere.shaderProgram == -1)
            Sphere.initialize()
        
    }
    
    draw() {
    
        gl.useProgram(Sphere.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, Sphere.positionBuffer);
       	gl.vertexAttribPointer(Sphere.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
       	
       	gl.bindBuffer( gl.ARRAY_BUFFER, Sphere.colorBuffer);
       	gl.vertexAttribPointer(Sphere.aColorShader, 4, gl.FLOAT, false, 0, 0 );
       	
       	gl.bindBuffer( gl.ARRAY_BUFFER, Sphere.normalBuffer);
       	gl.vertexAttribPointer(Sphere.aNormalShader, 3, gl.FLOAT, false, 0, 0 );
       	
		gl.uniformMatrix4fv(Sphere.uModelMatrixShader, false, flatten(this.modelMatrix));
		gl.uniformMatrix4fv(Sphere.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
		gl.uniformMatrix4fv(Sphere.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));
		
		gl.uniform4fv(Sphere.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(Sphere.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(Sphere.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(Sphere.uMatAlphaShader, this.matAlpha);
		
		
		gl.uniform3fv(Sphere.uLightDirectionShader, light1.direction);
		gl.uniform4fv(Sphere.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(Sphere.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(Sphere.uLightSpecularShader, light1.specular);

		gl.uniform3fv(Sphere.uSpotlightDirectionShader, light2.direction);
		gl.uniform4fv(Sphere.uSpotlightAmbientShader, light2.ambient);
		gl.uniform4fv(Sphere.uSpotlightDiffuseShader, light2.diffuse);
		gl.uniform4fv(Sphere.uSpotlightSpecularShader, light2.specular);
			
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Sphere.indexBuffer);
		
		gl.enableVertexAttribArray(Sphere.aPositionShader);    
		gl.enableVertexAttribArray(Sphere.aColorShader);
		gl.enableVertexAttribArray(Sphere.aNormalShader);    
    	gl.drawElements(gl.TRIANGLES, Sphere.indices.length, gl.UNSIGNED_INT, 0);
    	gl.disableVertexAttribArray(Sphere.aPositionShader);    
    	gl.disableVertexAttribArray(Sphere.aColorShader);    
    	gl.disableVertexAttribArray(Sphere.aNormalShader);    
    }
}

