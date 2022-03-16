class PlatformTop extends Drawable{
    static vertexPositions = [
    	vec3(-3.5,1,3.5),
    	vec3(-3.5,2,3.5),
    	vec3(3.5,2,3.5),
    	vec3(3.5,1,3.5),
    	vec3(-3.5,1,-3.5),
    	vec3(-3.5,2,-3.5),
    	vec3(3.5,2,-3.5),
    	vec3(3.5,1,-3.5),
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
		for (var i = 0; i<PlatformTop.vertexPositions.length; i++) {
			normalSum.push(vec3(0, 0, 0));
			counts.push(0);
		}
		
		//for each triangle
		for (var i = 0; i<PlatformTop.indices.length; i+=3) {
			var a = PlatformTop.indices[i];
			var b = PlatformTop.indices[i+1];
			var c = PlatformTop.indices[i+2];
			
			var edge1 = subtract(PlatformTop.vertexPositions[b],PlatformTop.vertexPositions[a])
			var edge2 = subtract(PlatformTop.vertexPositions[c],PlatformTop.vertexPositions[b])
			var N = cross(edge1,edge2)
			
			normalSum[a] = add(normalSum[a],normalize(N));
			counts[a]++;
			normalSum[b] = add(normalSum[b],normalize(N));
			counts[b]++;
			normalSum[c] = add(normalSum[c],normalize(N));
			counts[c]++;
		
		}
			
		for (var i = 0; i < PlatformTop.vertexPositions.length; i++)
			this.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
    }

	static initializeTexture(){
        var image1 = new Image();

        image1.onload = function(){
            PlatformTop.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, PlatformTop.texture);
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

			PlatformTop.imagesLoaded = 6;
            
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            
        }
        
        image1.src = "textures/dark-oak.jpg";
    }

    
    static initialize() {
        PlatformTop.computeNormals();
    	PlatformTop.shaderProgram = initShaders( gl, "/vshader_cube.glsl", "/fshader_cube.glsl");
    	gl.useProgram(PlatformTop.shaderProgram );
		
		// Load the data into the GPU
		PlatformTop.positionBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, PlatformTop.positionBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(PlatformTop.vertexPositions), gl.STATIC_DRAW );
		
		PlatformTop.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, PlatformTop.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(PlatformTop.vertexNormals), gl.STATIC_DRAW );
		
		PlatformTop.indexBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, PlatformTop.indexBuffer);
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(PlatformTop.indices), gl.STATIC_DRAW );

		PlatformTop.uTextureUnitShader = gl.getUniformLocation(PlatformTop.shaderProgram, "uTextureUnit");
			
		// Associate our shader variables with our data buffer
		PlatformTop.aPositionShader = gl.getAttribLocation( PlatformTop.shaderProgram, "aPosition" );
		PlatformTop.aNormalShader = gl.getAttribLocation( PlatformTop.shaderProgram, "aNormal" );
		
		PlatformTop.uModelMatrixShader = gl.getUniformLocation( PlatformTop.shaderProgram, "modelMatrix" );
		PlatformTop.uCameraMatrixShader = gl.getUniformLocation( PlatformTop.shaderProgram, "cameraMatrix" );
		PlatformTop.uProjectionMatrixShader = gl.getUniformLocation( PlatformTop.shaderProgram, "projectionMatrix" );
		
		PlatformTop.uMatAmbientShader = gl.getUniformLocation( PlatformTop.shaderProgram, "matAmbient" );
		PlatformTop.uMatDiffuseShader = gl.getUniformLocation( PlatformTop.shaderProgram, "matDiffuse" );
		PlatformTop.uMatSpecularShader = gl.getUniformLocation( PlatformTop.shaderProgram, "matSpecular" );
		PlatformTop.uMatAlphaShader = gl.getUniformLocation( PlatformTop.shaderProgram, "matAlpha" );
		
		PlatformTop.uLightDirectionShader = gl.getUniformLocation( PlatformTop.shaderProgram, "lightDirection" );
		PlatformTop.uLightAmbientShader = gl.getUniformLocation( PlatformTop.shaderProgram, "lightAmbient" );
		PlatformTop.uLightDiffuseShader = gl.getUniformLocation( PlatformTop.shaderProgram, "lightDiffuse" );
		PlatformTop.uLightSpecularShader = gl.getUniformLocation( PlatformTop.shaderProgram, "lightSpecular" );

		PlatformTop.uSpotlightDirectionShader = gl.getUniformLocation( PlatformTop.shaderProgram, "spotlightDirection" );
		PlatformTop.uSpotlightAmbientShader = gl.getUniformLocation( PlatformTop.shaderProgram, "spotlightAmbient" );
		PlatformTop.uSpotlightDiffuseShader = gl.getUniformLocation( PlatformTop.shaderProgram, "spotlightDiffuse" );
		PlatformTop.uSpotlightSpecularShader = gl.getUniformLocation( PlatformTop.shaderProgram, "spotlightSpecular" );	
    }
    	
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        if(PlatformTop.shaderProgram == -1)
            PlatformTop.initialize()
			PlatformTop.initializeTexture();
    }
    
    draw() {
		if (PlatformTop.texture == -1 && PlatformTop.imagesLoaded != 6) {
			return;
		}
    
        gl.useProgram(PlatformTop.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, PlatformTop.positionBuffer);
       	gl.vertexAttribPointer(PlatformTop.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
       	
       	gl.bindBuffer( gl.ARRAY_BUFFER, PlatformTop.normalBuffer);
       	gl.vertexAttribPointer(PlatformTop.aNormalShader, 3, gl.FLOAT, false, 0, 0 );

		gl.activeTexture(gl.TEXTURE0);
       	gl.bindTexture(gl.TEXTURE_CUBE_MAP, PlatformTop.texture);
       	gl.uniform1i(PlatformTop.uTextureUnitShader,0);
       	
		gl.uniformMatrix4fv(PlatformTop.uModelMatrixShader, false, flatten(this.modelMatrix));
		gl.uniformMatrix4fv(PlatformTop.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
		gl.uniformMatrix4fv(PlatformTop.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));
		
		gl.uniform4fv(PlatformTop.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(PlatformTop.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(PlatformTop.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(PlatformTop.uMatAlphaShader, this.matAlpha);
		
		gl.uniform3fv(PlatformTop.uLightDirectionShader, light1.direction);
		gl.uniform4fv(PlatformTop.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(PlatformTop.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(PlatformTop.uLightSpecularShader, light1.specular);

		gl.uniform3fv(PlatformTop.uSpotlightDirectionShader, light2.direction);
		gl.uniform4fv(PlatformTop.uSpotlightAmbientShader, light2.ambient);
		gl.uniform4fv(PlatformTop.uSpotlightDiffuseShader, light2.diffuse);
		gl.uniform4fv(PlatformTop.uSpotlightSpecularShader, light2.specular);
			
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, PlatformTop.indexBuffer);
	
		gl.enableVertexAttribArray(PlatformTop.aPositionShader);    
		gl.enableVertexAttribArray(PlatformTop.aNormalShader);   
    	gl.drawElements(gl.TRIANGLES, PlatformTop.indices.length, gl.UNSIGNED_BYTE, 0);
    	gl.disableVertexAttribArray(PlatformTop.aPositionShader);      
    	gl.disableVertexAttribArray(PlatformTop.aNormalShader);      
    }
}

