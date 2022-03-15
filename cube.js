class Cube extends Drawable{
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
		for (var i = 0; i<Cube.vertexPositions.length; i++) {
			normalSum.push(vec3(0, 0, 0));
			counts.push(0);
		}
		
		//for each triangle
		for (var i = 0; i<Cube.indices.length; i+=3) {
			var a = Cube.indices[i];
			var b = Cube.indices[i+1];
			var c = Cube.indices[i+2];
			
			var edge1 = subtract(Cube.vertexPositions[b],Cube.vertexPositions[a])
			var edge2 = subtract(Cube.vertexPositions[c],Cube.vertexPositions[b])
			var N = cross(edge1,edge2)
			
			normalSum[a] = add(normalSum[a],normalize(N));
			counts[a]++;
			normalSum[b] = add(normalSum[b],normalize(N));
			counts[b]++;
			normalSum[c] = add(normalSum[c],normalize(N));
			counts[c]++;
		
		}
			
		for (var i = 0; i < Cube.vertexPositions.length; i++)
			this.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
    }

	static initializeTexture(){
        var image1 = new Image();

        image1.onload = function(){
            Cube.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Cube.texture);
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

			Cube.imagesLoaded = 6;
            
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            
        }
        
        image1.src = "textures/crate_texture.jpg";
    }

    
    static initialize() {
        Cube.computeNormals();
    	Cube.shaderProgram = initShaders( gl, "/vshader_cube.glsl", "/fshader_cube.glsl");
    	gl.useProgram(Cube.shaderProgram );
		
		// Load the data into the GPU
		Cube.positionBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Cube.positionBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Cube.vertexPositions), gl.STATIC_DRAW );
		
		Cube.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Cube.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Cube.vertexNormals), gl.STATIC_DRAW );
		
		Cube.indexBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Cube.indexBuffer);
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(Cube.indices), gl.STATIC_DRAW );

		Cube.uTextureUnitShader = gl.getUniformLocation(Cube.shaderProgram, "uTextureUnit");
			
		// Associate our shader variables with our data buffer
		Cube.aPositionShader = gl.getAttribLocation( Cube.shaderProgram, "aPosition" );
		Cube.aNormalShader = gl.getAttribLocation( Cube.shaderProgram, "aNormal" );
		
		Cube.uModelMatrixShader = gl.getUniformLocation( Cube.shaderProgram, "modelMatrix" );
		Cube.uCameraMatrixShader = gl.getUniformLocation( Cube.shaderProgram, "cameraMatrix" );
		Cube.uProjectionMatrixShader = gl.getUniformLocation( Cube.shaderProgram, "projectionMatrix" );
		
		Cube.uMatAmbientShader = gl.getUniformLocation( Cube.shaderProgram, "matAmbient" );
		Cube.uMatDiffuseShader = gl.getUniformLocation( Cube.shaderProgram, "matDiffuse" );
		Cube.uMatSpecularShader = gl.getUniformLocation( Cube.shaderProgram, "matSpecular" );
		Cube.uMatAlphaShader = gl.getUniformLocation( Cube.shaderProgram, "matAlpha" );
		
		Cube.uLightDirectionShader = gl.getUniformLocation( Cube.shaderProgram, "lightDirection" );
		Cube.uLightAmbientShader = gl.getUniformLocation( Cube.shaderProgram, "lightAmbient" );
		Cube.uLightDiffuseShader = gl.getUniformLocation( Cube.shaderProgram, "lightDiffuse" );
		Cube.uLightSpecularShader = gl.getUniformLocation( Cube.shaderProgram, "lightSpecular" );

		Cube.uSpotlightDirectionShader = gl.getUniformLocation( Cube.shaderProgram, "spotlightDirection" );
		Cube.uSpotlightAmbientShader = gl.getUniformLocation( Cube.shaderProgram, "spotlightAmbient" );
		Cube.uSpotlightDiffuseShader = gl.getUniformLocation( Cube.shaderProgram, "spotlightDiffuse" );
		Cube.uSpotlightSpecularShader = gl.getUniformLocation( Cube.shaderProgram, "spotlightSpecular" );	
    }
    	
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        if(Cube.shaderProgram == -1)
            Cube.initialize()
			Cube.initializeTexture();
    }
    
    draw() {
		if (Cube.texture == -1 && Cube.imagesLoaded != 6) {
			console.log("cube returned");
			return;
		}
    
        gl.useProgram(Cube.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, Cube.positionBuffer);
       	gl.vertexAttribPointer(Cube.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
       	
       	gl.bindBuffer( gl.ARRAY_BUFFER, Cube.normalBuffer);
       	gl.vertexAttribPointer(Cube.aNormalShader, 3, gl.FLOAT, false, 0, 0 );

		gl.activeTexture(gl.TEXTURE0);
       	gl.bindTexture(gl.TEXTURE_CUBE_MAP, Cube.texture);
       	gl.uniform1i(Cube.uTextureUnitShader,0);
       	
		gl.uniformMatrix4fv(Cube.uModelMatrixShader, false, flatten(this.modelMatrix));
		gl.uniformMatrix4fv(Cube.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
		gl.uniformMatrix4fv(Cube.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));
		
		gl.uniform4fv(Cube.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(Cube.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(Cube.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(Cube.uMatAlphaShader, this.matAlpha);
		
		gl.uniform3fv(Cube.uLightDirectionShader, light1.direction);
		gl.uniform4fv(Cube.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(Cube.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(Cube.uLightSpecularShader, light1.specular);

		gl.uniform3fv(Cube.uSpotlightDirectionShader, light2.direction);
		gl.uniform4fv(Cube.uSpotlightAmbientShader, light2.ambient);
		gl.uniform4fv(Cube.uSpotlightDiffuseShader, light2.diffuse);
		gl.uniform4fv(Cube.uSpotlightSpecularShader, light2.specular);
			
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Cube.indexBuffer);
	
		gl.enableVertexAttribArray(Cube.aPositionShader);    
		gl.enableVertexAttribArray(Cube.aNormalShader);   
    	gl.drawElements(gl.TRIANGLES, Cube.indices.length, gl.UNSIGNED_BYTE, 0);
    	gl.disableVertexAttribArray(Cube.aPositionShader);      
    	gl.disableVertexAttribArray(Cube.aNormalShader);      
    }
}

