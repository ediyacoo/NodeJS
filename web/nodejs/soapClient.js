var soap=require("soap");


//send soap request to a server
exports.sendSoap=function(req,res){
	if(req.params.wsURL && req.params.wsName){
		var url=req.params.wsURL,
			name=req.params.wsName;
		
		console.log(url);
		console.log(name)
		
		
		
	}else{
		res.end("No WS URL or name.");
		return;
	}
	
	
	
}
