var MongoClient=require("mongodb").MongoClient,
	format=require("util").format,
	mongodb=null;
	
	
//connect mongodb
function connectDB(callback){
	MongoClient.connect("mongodb://localhost:27017/kiein", function(error, db){
		if(error) throw error
		
		mongodb=db;
		
		
		
	
		
		var collection=db.collection("layers");
		
		//read
		collection.find().each(function(err, doc){
			//console.log(doc)
		});
		
		
		//insert
		// collection.insert({"Health":"test"}, null, function(err, objects){
			// if(err) console.warn(err.message);
		// });
	
	
		//delete
		// collection.remove({"Health": "test"}, function(err, result){
			// console.log(result);
			// //db.close()
		// })
		
		//callback
		if(callback){
			callback(db)
		}
		
		
		
	});
}




/**
 *   External function: search
 */ 
exports.search=function(req,res){
	if(req.params.domain && req.params.value){
		var query={};
	
		query[req.params.domain]=req.params.value;
		
		//find	
		find(query, function(items){
			
			if(items.length>0){
				res.send(items)
			}else{
				res.send([])
			}
		});
		
	}
} 
 
 
 

function find(query, callback){
 	if(!mongodb){connectDB(function(db){
 		doSearch()
 	})}else{
 		doSearch()
 	}
 	
 	function doSearch(){
 		var collection=mongodb.collection("layers");
 		
 		collection.find(query).toArray(function(err, items){
 			if(err) throw err
 			
 			if(callback){
 				callback(items)
 			}
 		})
 	}
 }
