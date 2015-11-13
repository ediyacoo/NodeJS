var http=require("http"),
	querystring=require("querystring"),
	url=require("url");




exports.proxy=function(req, res){
	var options={},
		obj={},
		postData=null;

	//POST
	if(req.method=='POST'){
		//check url parameter is exiting or not
		if(!req.body || !req.body.url || req.body.url==''){
			res.end('no url');
			return;
		}
		
		//read url
		obj=url.parse(req.body.url);
		
		//read req.body
		postData=req.body;
		delete postData.url;
	}else{
		//GET
		//check url parameter is exiting or not
		if(req.query && req.query.url && req.query.url!=''){
			obj=url.parse(req.query.url)
		}else{
			res.end("no url!");
		}
	}
	
	
	
	//options
	options={
		host:obj.host.split(":")[0],
		path:obj.path.replace("%26","&").replace("%3D","="),
		port:obj.port || 80,
		method:req.method || "GET"
	}
	
	
	//if post data
	if(postData){
		options.headers={
			'Content-Type': 'application/x-www-form-urlencoded',
        	'Content-Length': Buffer.byteLength(querystring.stringify(postData))
		}
	}
	

	console.log(options)

			
	//send http request		
	http.request(options, function(response){
		response.setEncoding("utf8");
							
		//var str = ''
		response.on('data', function(chunk) {
		//str += chunk;
			res.write(chunk)
		});
							
		response.on('end', function () {
			//console.log(str)
			res.end()
		});
	}).end();
	
	
		

}

