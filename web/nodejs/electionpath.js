var jsdom=require("jsdom");
	
	

/**
 *   External function: search
 */ 
exports.opengraph=function(req,res){
	if(req.query.url && req.query.url!=''){
		var og=[];
		jsdom.env({
			url:url,
			done:function(err, window){
				jsdom.jQueryify(window, 'http://code.jquery.com/jquery-1.4.2.min.js', function(){
					window.$('meta[property^=og]').each(function(i, tem) {
	                    og.push([ tem.getAttribute('property'), tem.getAttribute('content')]);
	                });
	                res.send(og);
				})
			}
		})
		
	}else{
		res.send('no url param')
	}
} 
 
 
 
