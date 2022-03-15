class Ground extends Drawable{
    static vertices = [
		vec4(-1,0,1,1),
		vec4(1,0,1,1),
		vec4(1,0,-1,1),
		vec4(-1,0,-1,1)
    ];
    
	static vertexPositions = [];
	static vertexTextureCoords = [];
    static vertexNormals = [];
	static indices = [];

    static positionBuffer = -1;
	static textureCoordBuffer = -1;
    static indexBuffer = -1;
    static normalBuffer = -1;
    
    static shaderProgram = -1;
    static aPositionShader = -1;
    static aColorShader = -1;
	static aTextureCoordShader = -1;
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
		for (var i = 0; i<Ground.vertexPositions.length; i++) {
			normalSum.push(vec3(0, 0, 0));
			counts.push(0);
			Ground.indices.push(i);
		}
		
		//for each triangle
		for (var i = 0; i<Ground.vertexPositions.length; i+=3) {
			var a = Ground.vertexPositions[i];
			var b = Ground.vertexPositions[i+1];
			var c = Ground.vertexPositions[i+2];
			
			var edge1 = subtract(b,a)
			var edge2 = subtract(c,b)
			var N = cross(edge1,edge2)
			
			normalSum[i] = add(normalSum[i],normalize(N));
			counts[i]++;
			normalSum[i+1] = add(normalSum[i+1],normalize(N));
			counts[i+1]++;
			normalSum[i+2] = add(normalSum[i+2],normalize(N));
			counts[i+2]++;
		}
		
		for (var i = 0; i < Ground.vertexPositions.length; i++)
			this.vertexNormals[i] = mult(1.0/counts[i],normalSum[i]);
    }

	static divideQuad(a, b, c, d, depth) {
		if (depth>0) {
			var v1 = mult(0.5, add(a,b));
			v1[3] = 1.0;
			var v2 = mult(0.5, add(b,c));
			v2[3] = 1.0;
			var v3 = mult(0.5, add(c,d));
			v3[3] = 1.0;
			var v4 = mult(0.5, add(d,a));
			v4[3] = 1.0;
			var v5 = mult(0.5, add(a,c));
			v5[3] = 1.0;

			this.divideQuad(a, v1, v5, v4, depth - 1);
			this.divideQuad(v1, b, v2, v5, depth - 1);
			this.divideQuad(v2, c, v3, v5, depth - 1);
			this.divideQuad(v3, d, v4, v5, depth - 1);
		} else {
			Ground.vertexPositions.push(vec3(a[0], a[1], a[2]));
			Ground.vertexTextureCoords.push(vec2(0,0));

			Ground.vertexPositions.push(vec3(b[0], b[1], b[2]));
			Ground.vertexTextureCoords.push(vec2(1,0));

			Ground.vertexPositions.push(vec3(c[0], c[1], c[2]));
			Ground.vertexTextureCoords.push(vec2(1,1));

			Ground.vertexPositions.push(vec3(c[0], c[1], c[2]));
			Ground.vertexTextureCoords.push(vec2(1,1));

			Ground.vertexPositions.push(vec3(d[0], d[1], d[2]));
			Ground.vertexTextureCoords.push(vec2(0,1));

			Ground.vertexPositions.push(vec3(a[0], a[1], a[2]));
			Ground.vertexTextureCoords.push(vec2(0,0));
		}
	}

	static initializeTexture(){
        var image = new Image();

        image.onload = function(){
            Ground.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, Ground.texture);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, image.width, image.height, 0, gl.RGB, gl.UNSIGNED_BYTE, image);
            
            gl.generateMipmap(gl.TEXTURE_2D);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            
        }
        
        image.src = "textures/dark-grey.jpg";
    }

    
    static initialize() {
		Ground.divideQuad(Ground.vertices[0], Ground.vertices[1], Ground.vertices[2], Ground.vertices[3], 2);

        Ground.computeNormals();
    	Ground.shaderProgram = initShaders( gl, "/vshader_texture.glsl", "/fshader_texture.glsl");
    	gl.useProgram(Ground.shaderProgram );

		// Load the data into the GPU
		Ground.positionBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Ground.positionBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Ground.vertexPositions), gl.STATIC_DRAW );

		Ground.textureCoordBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ARRAY_BUFFER, Ground.textureCoordBuffer);
        gl.bufferData( gl.ARRAY_BUFFER, flatten(Ground.vertexTextureCoords), gl.STATIC_DRAW );
        Ground.uTextureUnitShader = gl.getUniformLocation(Ground.shaderProgram, "uTextureUnit");
		
		Ground.normalBuffer = gl.createBuffer();
		gl.bindBuffer( gl.ARRAY_BUFFER, Ground.normalBuffer);
		gl.bufferData( gl.ARRAY_BUFFER, flatten(Ground.vertexNormals), gl.STATIC_DRAW );

		Ground.indexBuffer = gl.createBuffer();
        gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Ground.indexBuffer);
        gl.bufferData( gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(Ground.indices), gl.STATIC_DRAW );
			
		// Associate our shader variables with our data buffer
		Ground.aPositionShader = gl.getAttribLocation( Ground.shaderProgram, "aPosition" );
		Ground.aNormalShader = gl.getAttribLocation( Ground.shaderProgram, "aNormal" );
		Ground.aTextureCoordShader = gl.getAttribLocation( Ground.shaderProgram, "aTextureCoord" );
		
		Ground.uModelMatrixShader = gl.getUniformLocation( Ground.shaderProgram, "modelMatrix" );
		Ground.uCameraMatrixShader = gl.getUniformLocation( Ground.shaderProgram, "cameraMatrix" );
		Ground.uProjectionMatrixShader = gl.getUniformLocation( Ground.shaderProgram, "projectionMatrix" );
		
		Ground.uMatAmbientShader = gl.getUniformLocation( Ground.shaderProgram, "matAmbient" );
		Ground.uMatDiffuseShader = gl.getUniformLocation( Ground.shaderProgram, "matDiffuse" );
		Ground.uMatSpecularShader = gl.getUniformLocation( Ground.shaderProgram, "matSpecular" );
		Ground.uMatAlphaShader = gl.getUniformLocation( Ground.shaderProgram, "matAlpha" );
		
		Ground.uLightDirectionShader = gl.getUniformLocation( Ground.shaderProgram, "lightDirection" );
		Ground.uLightAmbientShader = gl.getUniformLocation( Ground.shaderProgram, "lightAmbient" );
		Ground.uLightDiffuseShader = gl.getUniformLocation( Ground.shaderProgram, "lightDiffuse" );
		Ground.uLightSpecularShader = gl.getUniformLocation( Ground.shaderProgram, "lightSpecular" );

		Ground.uSpotlightDirectionShader = gl.getUniformLocation( Ground.shaderProgram, "spotlightDirection" );
		Ground.uSpotlightAmbientShader = gl.getUniformLocation( Ground.shaderProgram, "spotlightAmbient" );
		Ground.uSpotlightDiffuseShader = gl.getUniformLocation( Ground.shaderProgram, "spotlightDiffuse" );
		Ground.uSpotlightSpecularShader = gl.getUniformLocation( Ground.shaderProgram, "spotlightSpecular" );
	
    }
    	
    constructor(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh){
        super(tx,ty,tz,scale,rotX,rotY,rotZ,amb,dif,sp,sh);
        if(Ground.shaderProgram == -1)
            Ground.initialize()
			Ground.initializeTexture();
    }
    
    draw() {
		if (Ground.texture == -1) {
			return;
		}

        gl.useProgram(Ground.shaderProgram);
        
        gl.bindBuffer( gl.ARRAY_BUFFER, Ground.positionBuffer);
       	gl.vertexAttribPointer(Ground.aPositionShader, 3, gl.FLOAT, false, 0, 0 );

		gl.bindBuffer( gl.ARRAY_BUFFER, Ground.textureCoordBuffer);
       	gl.vertexAttribPointer(Ground.aTextureCoordShader, 2, gl.FLOAT, false, 0, 0 );
       	
       	gl.bindBuffer( gl.ARRAY_BUFFER, Ground.normalBuffer);
       	gl.vertexAttribPointer(Ground.aNormalShader, 3, gl.FLOAT, false, 0, 0 );

		gl.activeTexture(gl.TEXTURE0);
       	gl.bindTexture(gl.TEXTURE_2D, Ground.texture);
       	gl.uniform1i(Ground.uTextureUnitShader,0);
    
		gl.uniformMatrix4fv(Ground.uModelMatrixShader, false, flatten(this.modelMatrix));
		gl.uniformMatrix4fv(Ground.uCameraMatrixShader, false, flatten(camera1.cameraMatrix));
		gl.uniformMatrix4fv(Ground.uProjectionMatrixShader, false, flatten(camera1.projectionMatrix));
		
		gl.uniform4fv(Ground.uMatAmbientShader, this.matAmbient);
		gl.uniform4fv(Ground.uMatDiffuseShader, this.matDiffuse);
		gl.uniform4fv(Ground.uMatSpecularShader, this.matSpecular);
		gl.uniform1f(Ground.uMatAlphaShader, this.matAlpha);
		
		gl.uniform3fv(Ground.uLightDirectionShader, light1.direction);
		gl.uniform4fv(Ground.uLightAmbientShader, light1.ambient);
		gl.uniform4fv(Ground.uLightDiffuseShader, light1.diffuse);
		gl.uniform4fv(Ground.uLightSpecularShader, light1.specular);

		gl.uniform3fv(Ground.uSpotlightDirectionShader, light2.direction);
		gl.uniform4fv(Ground.uSpotlightAmbientShader, light2.ambient);
		gl.uniform4fv(Ground.uSpotlightDiffuseShader, light2.diffuse);
		gl.uniform4fv(Ground.uSpotlightSpecularShader, light2.specular);

		gl.bindBuffer( gl.ELEMENT_ARRAY_BUFFER, Ground.indexBuffer);
	
		gl.enableVertexAttribArray(Ground.aPositionShader);    
		gl.enableVertexAttribArray(Ground.aNormalShader);    
		gl.enableVertexAttribArray(Ground.aTextureCoordShader);
		//gl.drawArrays(gl.TRIANGLES, 0, Ground.vertexPositions.length);
		gl.drawElements(gl.TRIANGLES, Ground.indices.length, gl.UNSIGNED_BYTE, 0);
    	gl.disableVertexAttribArray(Ground.aPositionShader);    
    	gl.disableVertexAttribArray(Ground.aNormalShader); 
		gl.disableVertexAttribArray(Ground.aTextureCoordShader);       
    }
}

