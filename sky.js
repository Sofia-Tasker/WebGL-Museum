class Sky extends Drawable{
    static vertexPositions = [
    	vec3(-1,-1,1),
    	vec3(-1,1,1),
    	vec3(1,1,1),
    	vec3(1,-1,1),
    	vec3(-1,-1,-1),
    	vec3(-1,1,-1),
    	vec3(1,1,-1),
    	vec3(1,-1,-1),
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
		for (var i = 0; i<Sky.vertexPositions.length; i++) {
			normalSum.push(vec3(0, 0, 0));
			counts.push(0);
		}
		
		//for each triangle
		for (var i = 0; i<Sky.indices.length; i+=3) {
			var a = Sky.indices[i];
			var b = Sky.indices[i+1];
			var c = Sky.indices[i+2];
			
			var edge1 = subtract(Sky.vertexPositions[b],Sky.vertexPositions[a])
			var edge2 = subtract(Sky.vertexPositions[c],Sky.vertexPositions[b])
			var N = cross(edge1,edge2)
			
			normalSum[a] = add(normalSum[a],normalize(N));
			counts[a]++;
			normalSum[b] = add(normalSum[b],normalize(N));
			counts[b]++;
			normalSum[c] = add(normalSum[c],normalize(N));
			counts[c]++;
		
		}
			
		for (var i = 0; i < Sky.vertexPositions.length; i++)
			this.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
    }

	static initializeTexture(){
        var image1 = new Image();
		var image2 = new Image();
		var image3 = new Image();
		var image4 = new Image();
		var image5 = new Image();
		var image6 = new Image();

		Sky.texture = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, Sky.texture);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP,gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE);

        image1.onload = function(){
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, Sky.texture);
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGB, image1.width, image1.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image1);
			Sky.imagesLoaded += 1;
        }

		image2.onload = function(){
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, Sky.texture);
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGB, image2.width, image2.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image2);
			Sky.imagesLoaded += 1;
        }

		image3.onload = function(){
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, Sky.texture);
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGB, image3.width, image3.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image3);
			Sky.imagesLoaded += 1;
        }

		image4.onload = function(){
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, Sky.texture);
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGB, image4.width, image4.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image4);
			Sky.imagesLoaded += 1;
        }

		image5.onload = function(){
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, Sky.texture);
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGB, image5.width, image5.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image5);
			Sky.imagesLoaded += 1;
        }

		image6.onload = function(){
			gl.bindTexture(gl.TEXTURE_CUBE_MAP, Sky.texture);
			gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGB, image6.width, image6.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image6);
			Sky.imagesLoaded += 1;
        } 
        
		image1.src = "textures/dark-red.png";
		image2.src = "textures/dark-red.png";
		image3.src = "textures/royal-blue.jpg";
		image4.src = "textures/dark-red.png";
		image5.src = "textures/dark-red.png";
		image6.src = "textures/dark-red.png";
    }

    
    static initialize() {
        Sky.computeNormals();
    	Sky.shaderProgram = initShaders( gl, "/vshader_cube.glsl", "/fshader_cube.glsl");
    	gl.useProgram(Sky.shaderProgram );
		
		// Load the data into the GPU
		Sky.positionBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Sky.positionBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Sky.vertexPositions), gl.STATIC_DRAW );
		
		Sky.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Sky.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Sky.vertexNormals), gl.STATIC_DRAW );
		
		Sky.indexBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Sky.indexBuffer);
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(Sky.indices), gl.STATIC_DRAW );

		Sky.uTextureUnitShader = gl.getUniformLocation(Sky.shaderProgram, "uTextureUnit");
			
		// Associate our shader variables with our data buffer
		Sky.aPositionShader = gl.getAttribLocation( Sky.shaderProgram, "aPosition" );
		Sky.aNormalShader = gl.getAttribLocation( Sky.shaderProgram, "aNormal" );
		
		Sky.uModelMatrixShader = gl.getUniformLocation( Sky.shaderProgram, "modelMatrix" );
		Sky.uCameraMatrixShader = gl.getUniformLocation( Sky.shaderProgram, "cameraMatrix" );
		Sky.uProjectionMatrixShader = gl.getUniformLocation( Sky.shaderProgram, "projectionMatrix" );
		
		Sky.uMatAmbientShader = gl.getUniformLocation( Sky.shaderProgram, "matAmbient" );
		Sky.uMatDiffuseShader = gl.getUniformLocation( Sky.shaderProgram, "matDiffuse" );
		Sky.uMatSpecularShader = gl.getUniformLocation( Sky.shaderProgram, "matSpecular" );
		Sky.uMatAlphaShader = gl.getUniformLocation( Sky.shaderProgram, "matAlpha" );
		
		Sky.uLightDirectionShader = gl.getUniformLocation( Sky.shaderProgram, "lightDirection" );
		Sky.uLightAmbientShader = gl.getUniformLocation( Sky.shaderProgram, "lightAmbient" );
		Sky.uLightDiffuseShader = gl.getUniformLocation( Sky.shaderProgram, "lightDiffuse" );
		Sky.uLightSpecularShader = gl.getUniformLocation( Sky.shaderProgram, "lightSpecular" );

		Sky.uSpotlightDirectionShader = gl.getUniformLocation( Sky.shaderProgram, "spotlightDirection" );
		Sky.uSpotlightAmbientShader = gl.getUniformLocation( Sky.shaderProgram, "spotlightAmbient" );
		Sky.uSpotlightDiffuseShader = gl.getUniformLocation( Sky.shaderProgram, "spotlightDiffuse" );
		Sky.uSpotlightSpecularShader = gl.getUniformLocation( Sky.shaderProgram, "spotlightSpecular" );	
    }
    	
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
		Sky.imagesLoaded = 0;
        if(Sky.shaderProgram == -1)
            Sky.initialize()
			Sky.initializeTexture();
    }
    
    draw() {
		if (Sky.texture == -1 || Sky.imagesLoaded != 6) {
			return;
		}
    
        gl.useProgram(Sky.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, Sky.positionBuffer);
       	gl.vertexAttribPointer(Sky.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
       	
       	gl.bindBuffer( gl.ARRAY_BUFFER, Sky.normalBuffer);
       	gl.vertexAttribPointer(Sky.aNormalShader, 3, gl.FLOAT, false, 0, 0 );

		gl.activeTexture(gl.TEXTURE0);
       	gl.bindTexture(gl.TEXTURE_CUBE_MAP, Sky.texture);
       	gl.uniform1i(Sky.uTextureUnitShader,0);
       	
		gl.uniformMatrix4fv(Sky.uModelMatrixShader, false, flatten(this.modelMatrix));
		gl.uniformMatrix4fv(Sky.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
		gl.uniformMatrix4fv(Sky.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));
		
		gl.uniform4fv(Sky.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(Sky.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(Sky.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(Sky.uMatAlphaShader, this.matAlpha);
		
		gl.uniform3fv(Sky.uLightDirectionShader, light1.direction);
		gl.uniform4fv(Sky.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(Sky.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(Sky.uLightSpecularShader, light1.specular);

		gl.uniform3fv(Sky.uSpotlightDirectionShader, light2.direction);
		gl.uniform4fv(Sky.uSpotlightAmbientShader, light2.ambient);
		gl.uniform4fv(Sky.uSpotlightDiffuseShader, light2.diffuse);
		gl.uniform4fv(Sky.uSpotlightSpecularShader, light2.specular);
			
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Sky.indexBuffer);
	
		gl.enableVertexAttribArray(Sky.aPositionShader);    
		gl.enableVertexAttribArray(Sky.aNormalShader);   
    	gl.drawElements(gl.TRIANGLES, Sky.indices.length, gl.UNSIGNED_BYTE, 0);
    	gl.disableVertexAttribArray(Sky.aPositionShader);      
    	gl.disableVertexAttribArray(Sky.aNormalShader);      
    }
}

