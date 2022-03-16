class PlatformBottom extends Drawable{
    static vertexPositions = [
    	vec3(-3,-1,3),
    	vec3(-3,1,3),
    	vec3(3,1,3),
    	vec3(3,-1,3),
    	vec3(-3,-1,-3),
    	vec3(-3,1,-3),
    	vec3(3,1,-3),
    	vec3(3,-1,-3),
    ];
    
    static vertexNormals = [];

    static indices = [
		0,3,2,
		0,2,1,
		2,3,7,
		2,7,6, 
		0,4,7,
		0,7,3,
		1,2,6,
		1,6,5,
		4,5,6,
		4,6,7,
		0,1,5,
		0,5,4
    ];

    static positionBuffer = -1;
	static textureCoordBuffer = -1;
    static indexBuffer = -1;
    static normalBuffer = -1;
    
    static shaderProgram = -1;
    static aPositionShader = -1;
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

	static texture = -1;
    static uTextureUnitShader = -1;
    
    static computeNormals(){
		var normalSum = [];
		var counts = [];
		
		//initialize sum of normals for each vertex and how often its used.
		for (var i = 0; i<PlatformBottom.vertexPositions.length; i++) {
			normalSum.push(vec3(0, 0, 0));
			counts.push(0);
		}
		
		//for each triangle
		for (var i = 0; i<PlatformBottom.indices.length; i+=3) {
			var a = PlatformBottom.indices[i];
			var b = PlatformBottom.indices[i+1];
			var c = PlatformBottom.indices[i+2];
			
			var edge1 = subtract(PlatformBottom.vertexPositions[b],PlatformBottom.vertexPositions[a])
			var edge2 = subtract(PlatformBottom.vertexPositions[c],PlatformBottom.vertexPositions[b])
			var N = cross(edge1,edge2)
			
			normalSum[a] = add(normalSum[a],normalize(N));
			counts[a]++;
			normalSum[b] = add(normalSum[b],normalize(N));
			counts[b]++;
			normalSum[c] = add(normalSum[c],normalize(N));
			counts[c]++;
		
		}
			
		for (var i = 0; i < PlatformBottom.vertexPositions.length; i++)
			this.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
    }

	static initializeTexture(){
        var image1 = new Image();

        image1.onload = function(){
            PlatformBottom.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, PlatformBottom.texture);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

			gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, image1.width, image1.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image1);
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, image1.width, image1.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image1);
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, image1.width, image1.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image1);
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, image1.width, image1.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image1);
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, image1.width, image1.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image1);
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, image1.width, image1.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image1);

			PlatformBottom.imagesLoaded = 6;
            
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            
        }
        
        image1.src = "textures/dark-oak.jpg";
    }

    
    static initialize() {
        PlatformBottom.computeNormals();
    	PlatformBottom.shaderProgram = initShaders( gl, "/vshader_cube.glsl", "/fshader_cube.glsl");
    	gl.useProgram(PlatformBottom.shaderProgram );
		
		// Load the data into the GPU
		PlatformBottom.positionBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, PlatformBottom.positionBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(PlatformBottom.vertexPositions), gl.STATIC_DRAW );
		
		PlatformBottom.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, PlatformBottom.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(PlatformBottom.vertexNormals), gl.STATIC_DRAW );
		
		PlatformBottom.indexBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, PlatformBottom.indexBuffer);
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(PlatformBottom.indices), gl.STATIC_DRAW );

		PlatformBottom.uTextureUnitShader = gl.getUniformLocation(PlatformBottom.shaderProgram, "uTextureUnit");
			
		// Associate our shader variables with our data buffer
		PlatformBottom.aPositionShader = gl.getAttribLocation( PlatformBottom.shaderProgram, "aPosition" );
		PlatformBottom.aNormalShader = gl.getAttribLocation( PlatformBottom.shaderProgram, "aNormal" );
		
		PlatformBottom.uModelMatrixShader = gl.getUniformLocation( PlatformBottom.shaderProgram, "modelMatrix" );
		PlatformBottom.uCameraMatrixShader = gl.getUniformLocation( PlatformBottom.shaderProgram, "cameraMatrix" );
		PlatformBottom.uProjectionMatrixShader = gl.getUniformLocation( PlatformBottom.shaderProgram, "projectionMatrix" );
		
		PlatformBottom.uMatAmbientShader = gl.getUniformLocation( PlatformBottom.shaderProgram, "matAmbient" );
		PlatformBottom.uMatDiffuseShader = gl.getUniformLocation( PlatformBottom.shaderProgram, "matDiffuse" );
		PlatformBottom.uMatSpecularShader = gl.getUniformLocation( PlatformBottom.shaderProgram, "matSpecular" );
		PlatformBottom.uMatAlphaShader = gl.getUniformLocation( PlatformBottom.shaderProgram, "matAlpha" );
		
		PlatformBottom.uLightDirectionShader = gl.getUniformLocation( PlatformBottom.shaderProgram, "lightDirection" );
		PlatformBottom.uLightAmbientShader = gl.getUniformLocation( PlatformBottom.shaderProgram, "lightAmbient" );
		PlatformBottom.uLightDiffuseShader = gl.getUniformLocation( PlatformBottom.shaderProgram, "lightDiffuse" );
		PlatformBottom.uLightSpecularShader = gl.getUniformLocation( PlatformBottom.shaderProgram, "lightSpecular" );

		PlatformBottom.uSpotlightDirectionShader = gl.getUniformLocation( PlatformBottom.shaderProgram, "spotlightDirection" );
		PlatformBottom.uSpotlightAmbientShader = gl.getUniformLocation( PlatformBottom.shaderProgram, "spotlightAmbient" );
		PlatformBottom.uSpotlightDiffuseShader = gl.getUniformLocation( PlatformBottom.shaderProgram, "spotlightDiffuse" );
		PlatformBottom.uSpotlightSpecularShader = gl.getUniformLocation( PlatformBottom.shaderProgram, "spotlightSpecular" );	
    }
    	
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        if(PlatformBottom.shaderProgram == -1)
            PlatformBottom.initialize()
			PlatformBottom.initializeTexture();
    }
    
    draw() {
		if (PlatformBottom.texture == -1 && PlatformBottom.imagesLoaded != 6) {
			return;
		}
    
        gl.useProgram(PlatformBottom.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, PlatformBottom.positionBuffer);
       	gl.vertexAttribPointer(PlatformBottom.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
       	
       	gl.bindBuffer( gl.ARRAY_BUFFER, PlatformBottom.normalBuffer);
       	gl.vertexAttribPointer(PlatformBottom.aNormalShader, 3, gl.FLOAT, false, 0, 0 );

		gl.activeTexture(gl.TEXTURE0);
       	gl.bindTexture(gl.TEXTURE_CUBE_MAP, PlatformBottom.texture);
       	gl.uniform1i(PlatformBottom.uTextureUnitShader,0);
       	
		gl.uniformMatrix4fv(PlatformBottom.uModelMatrixShader, false, flatten(this.modelMatrix));
		gl.uniformMatrix4fv(PlatformBottom.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
		gl.uniformMatrix4fv(PlatformBottom.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));
		
		gl.uniform4fv(PlatformBottom.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(PlatformBottom.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(PlatformBottom.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(PlatformBottom.uMatAlphaShader, this.matAlpha);
		
		gl.uniform3fv(PlatformBottom.uLightDirectionShader, light1.direction);
		gl.uniform4fv(PlatformBottom.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(PlatformBottom.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(PlatformBottom.uLightSpecularShader, light1.specular);

		gl.uniform3fv(PlatformBottom.uSpotlightDirectionShader, light2.direction);
		gl.uniform4fv(PlatformBottom.uSpotlightAmbientShader, light2.ambient);
		gl.uniform4fv(PlatformBottom.uSpotlightDiffuseShader, light2.diffuse);
		gl.uniform4fv(PlatformBottom.uSpotlightSpecularShader, light2.specular);
			
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, PlatformBottom.indexBuffer);
	
		gl.enableVertexAttribArray(PlatformBottom.aPositionShader);    
		gl.enableVertexAttribArray(PlatformBottom.aNormalShader);   
    	gl.drawElements(gl.TRIANGLES, PlatformBottom.indices.length, gl.UNSIGNED_BYTE, 0);
    	gl.disableVertexAttribArray(PlatformBottom.aPositionShader);      
    	gl.disableVertexAttribArray(PlatformBottom.aNormalShader);      
    }
}

