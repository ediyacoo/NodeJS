//create a http server
var http=require("http"),
	url=require("url");


//init 
startServer({
	port:8888
});	



/**
 * start HTTP Server 
 * @param {Object} options
 */
function startServer(options){
	//options
	if(!options){options={}}
	options.header=options.header || "text/plain";
	options.port=options.port || 8888;
	
	//create web server
	http.createServer(function(request, response){
		console.log('request received');
		var pathname=url.parse(request.url).pathname,
			query=url.parse(request.url).query;
		
		//RESTful
		var content=route(pathname);
		
		response.writeHead(200, {"Content-Type": options.header});
		response.write(content);
		response.end();
	}).listen(options.port);
	console.log('server started');
}



//RESTful
function route(pathname){
	switch(pathname){
		case "/test":
			return "pathname is test";
		break;
		case "/upload":
			console.log('pathname is '+ pathname);
			return "pathname is upload"
		break;
		default:
			return "This is the HTTP server powered by node.js."
		break;
	}
}



//make startServer can be globally
exports.startServer=startServer;








	
