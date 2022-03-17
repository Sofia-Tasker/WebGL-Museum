class Button extends Drawable{
    static vertexPositions = [
    	vec3(-1,-0.25,1),
    	vec3(-1,0.25,1),
    	vec3(1,0.25,1),
    	vec3(1,-0.25,1),
    	vec3(-1,-0.25,-1),
    	vec3(-1,0.25,-1),
    	vec3(1,0.25,-1),
    	vec3(1,-0.25,-1),
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
		for (var i = 0; i<Button.vertexPositions.length; i++) {
			normalSum.push(vec3(0, 0, 0));
			counts.push(0);
		}
		
		//for each triangle
		for (var i = 0; i<Button.indices.length; i+=3) {
			var a = Button.indices[i];
			var b = Button.indices[i+1];
			var c = Button.indices[i+2];
			
			var edge1 = subtract(Button.vertexPositions[b],Button.vertexPositions[a])
			var edge2 = subtract(Button.vertexPositions[c],Button.vertexPositions[b])
			var N = cross(edge1,edge2)
			
			normalSum[a] = add(normalSum[a],normalize(N));
			counts[a]++;
			normalSum[b] = add(normalSum[b],normalize(N));
			counts[b]++;
			normalSum[c] = add(normalSum[c],normalize(N));
			counts[c]++;
		
		}
			
		for (var i = 0; i < Button.vertexPositions.length; i++)
			this.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
    }

	static initializeTexture(){
        var image1 = new Image();

        image1.onload = function(){
            Button.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, Button.texture);
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

			Button.imagesLoaded = 6;
            
            gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
            gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            
        }
        
        image1.src = "textures/shiny-red.jpg";
    }

    
    static initialize() {
        Button.computeNormals();
    	Button.shaderProgram = initShaders( gl, "/vshader_cube.glsl", "/fshader_cube.glsl");
    	gl.useProgram(Button.shaderProgram );
		
		// Load the data into the GPU
		Button.positionBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Button.positionBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Button.vertexPositions), gl.STATIC_DRAW );
		
		Button.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Button.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Button.vertexNormals), gl.STATIC_DRAW );
		
		Button.indexBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Button.indexBuffer);
		gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(Button.indices), gl.STATIC_DRAW );

		Button.uTextureUnitShader = gl.getUniformLocation(Button.shaderProgram, "uTextureUnit");
			
		// Associate our shader variables with our data buffer
		Button.aPositionShader = gl.getAttribLocation( Button.shaderProgram, "aPosition" );
		Button.aNormalShader = gl.getAttribLocation( Button.shaderProgram, "aNormal" );
		
		Button.uModelMatrixShader = gl.getUniformLocation( Button.shaderProgram, "modelMatrix" );
		Button.uCameraMatrixShader = gl.getUniformLocation( Button.shaderProgram, "cameraMatrix" );
		Button.uProjectionMatrixShader = gl.getUniformLocation( Button.shaderProgram, "projectionMatrix" );
		
		Button.uMatAmbientShader = gl.getUniformLocation( Button.shaderProgram, "matAmbient" );
		Button.uMatDiffuseShader = gl.getUniformLocation( Button.shaderProgram, "matDiffuse" );
		Button.uMatSpecularShader = gl.getUniformLocation( Button.shaderProgram, "matSpecular" );
		Button.uMatAlphaShader = gl.getUniformLocation( Button.shaderProgram, "matAlpha" );
		
		Button.uLightDirectionShader = gl.getUniformLocation( Button.shaderProgram, "lightDirection" );
		Button.uLightAmbientShader = gl.getUniformLocation( Button.shaderProgram, "lightAmbient" );
		Button.uLightDiffuseShader = gl.getUniformLocation( Button.shaderProgram, "lightDiffuse" );
		Button.uLightSpecularShader = gl.getUniformLocation( Button.shaderProgram, "lightSpecular" );

		Button.uSpotlightDirectionShader = gl.getUniformLocation( Button.shaderProgram, "spotlightDirection" );
		Button.uSpotlightAmbientShader = gl.getUniformLocation( Button.shaderProgram, "spotlightAmbient" );
		Button.uSpotlightDiffuseShader = gl.getUniformLocation( Button.shaderProgram, "spotlightDiffuse" );
		Button.uSpotlightSpecularShader = gl.getUniformLocation( Button.shaderProgram, "spotlightSpecular" );	
    }
    	
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        if(Button.shaderProgram == -1)
            Button.initialize()
			Button.initializeTexture();
    }
    
    draw() {
		if (Button.texture == -1 && Button.imagesLoaded != 6) {
			return;
		}
    
        gl.useProgram(Button.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, Button.positionBuffer);
       	gl.vertexAttribPointer(Button.aPositionShader, 3, gl.FLOAT, false, 0, 0 );
       	
       	gl.bindBuffer( gl.ARRAY_BUFFER, Button.normalBuffer);
       	gl.vertexAttribPointer(Button.aNormalShader, 3, gl.FLOAT, false, 0, 0 );

		gl.activeTexture(gl.TEXTURE0);
       	gl.bindTexture(gl.TEXTURE_CUBE_MAP, Button.texture);
       	gl.uniform1i(Button.uTextureUnitShader,0);
       	
		gl.uniformMatrix4fv(Button.uModelMatrixShader, false, flatten(this.modelMatrix));
		gl.uniformMatrix4fv(Button.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
		gl.uniformMatrix4fv(Button.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));
		
		gl.uniform4fv(Button.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(Button.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(Button.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(Button.uMatAlphaShader, this.matAlpha);
		
		gl.uniform3fv(Button.uLightDirectionShader, light1.direction);
		gl.uniform4fv(Button.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(Button.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(Button.uLightSpecularShader, light1.specular);

		gl.uniform3fv(Button.uSpotlightDirectionShader, light2.direction);
		gl.uniform4fv(Button.uSpotlightAmbientShader, light2.ambient);
		gl.uniform4fv(Button.uSpotlightDiffuseShader, light2.diffuse);
		gl.uniform4fv(Button.uSpotlightSpecularShader, light2.specular);
			
		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Button.indexBuffer);
	
		gl.enableVertexAttribArray(Button.aPositionShader);    
		gl.enableVertexAttribArray(Button.aNormalShader);   
    	gl.drawElements(gl.TRIANGLES, Button.indices.length, gl.UNSIGNED_BYTE, 0);
    	gl.disableVertexAttribArray(Button.aPositionShader);      
    	gl.disableVertexAttribArray(Button.aNormalShader);      
    }

	getIndices() {
		return Button.indices;
	}

	getVertices() {
		return Button.vertices;
	}
}

