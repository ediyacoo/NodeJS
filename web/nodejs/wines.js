/**
 *  find all 
 */
exports.findAll=function(req,res){
	res.send([{name:"wine1"}, {name:"wine2"}, {name:"wine3"}])
}
	
	
/**
 * find by id 
 * @param {Object} req
 * @param {Object} res
 */
exports.findByID= function(req, res){
	res.send({id:req.params.id, name:"The name", description:"description"})
}
	

