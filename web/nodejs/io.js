
/**
 *  set up io.socket to listen events from client side
 * @param {Object} io
 */
exports.io=function(io){
	io.of("/test")  //set "test" workspace to distinguish other sockets 
	  .on("connection", function(socket){
	  		socket.emit("news", {hello:"world"});
	  		
	  		//broadcast every 10s
			setInterval(function(){
				socket.broadcast.emit("user connected", {"broadcast":"success"});
			}, 10000)
			
	  		//socket.broadcast.emit("user connected", {"broadcast":"success"});
	  		
	  		//events
			socket.on("my other event", function(data){
				console.log(data);
			})
	  		
	  })

}
