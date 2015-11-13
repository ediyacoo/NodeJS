var express=require("express"),
	mongodb=require("./nodejs/mongodb"),
	proxy=require("./nodejs/proxy"),
	useIO=require("./nodejs/io"),
	electionpath=require("./nodejs/electionpath"),
	//soapClient=require("./nodejs/soapClient"),
	app=express(),
	port=8080,
	server=app.listen(port),
	io=require("socket.io").listen(server),
	domain="";



console.log("Server is started and listened on port "+port);


//gzip conpress method
app.use(express.compress())
//parse the post data of the body
app.use(express.bodyParser());



/***********************************************************************************
 *  RESTful 
 *********************************************************************************/
//kiein
app.get('/kiein', function(req, res){
	domain="kiein";
	res.sendfile("public/kiein/data.html")
})


//gesr
app.get('/gesr', function(req, res){
	domain="gesr"
	res.sendfile("public/gesr/index.html")
})


//soap  testing jquery soap extension
app.get('/soap', function(req, res){
	domain="soap"
	res.sendfile("public/soap/index.html")
})


//soap request
// app.get("/soap/:wsURL/:wsName", soapClient.sendSoap)

//pathgeo electionpath
app.get('/electionpath', function(req, res){electionpath.opengraph})



//proxy
app.post("/proxy", proxy.proxy)
app.get("/proxy", proxy.proxy)


//mongodb
app.get("/mongo/:domain/:value", mongodb.search)



//socket io test
//each event will be in each application
useIO.io(io); // this socket io need to be declared first. Otherwise, it will trigger to many event between client and server sides.
app.get("/io", function(req, res){
	domain="io";
	res.sendfile("public/io/index.html");
});



//hello.txt
app.get('/hello.txt', function(req, res){
  var body = 'Hello World';
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Length', body.length);
  res.end(body);
});




//others
//it needs to be placed at the end, otherwise the above path will not work
app.get(/^(.+)$/, function(req, res) { 
	res.sendfile('public/'+domain+"/"+ req.params[0]); 
});


/**********************************************************************************/






