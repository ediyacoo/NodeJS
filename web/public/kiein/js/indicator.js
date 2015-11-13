//show theme
function showTheme(id){
	if(app.theme[id]){
		var value=app.theme[id];
		
		//show title
		$("#theme_title").html(id);
		
		//show description
		$("#theme_description").html(value.description)
		
		//show accordion
		var html="<div  class='accordion' style='widht:100%; height:55%;'>";
		
		//show tabs
		//var html="<ul><li><a href='#layer'>Layer</a></li><li><a href='#legend'>Legend</a></li></ul>";
		
		var layer_name="";
		
		$.each(value, function(key, obj){
			if(key!="description"){
				//accordion
				html+="<h3><a href='#'>" + key + "</a></h3>" +"<div><ul>";
				
								
				//layer
				$.each(obj.layers, function(i, layer){
					layer_name=id + "_" + key + "_" + i;
					html+="<li><input type=checkbox id='" + layer.layerID + "' name=" + layer_name + " class='layer_chk' title='show/hide layers on the map'/>&nbsp;<img src='images/loading.gif' id='loading_" + this.layerID +"' style='display:none' />&nbsp;" + layer.name + "</li>"; 
					app.overlayMapTypeID++;
				});
				
				
				
				html+="</ul></div>";
			}
		});
		$("#theme_content").html(html);
		$(".accordion").accordion({
			autoHeight:false,
		});
		
		
		//add click event on layer checkbox
		$(".layer_chk").click(function(){
	  		//if checked
	  		if(this.checked){
	  			var theme=this.name.split("_")[0],
	  				issue=this.name.split("_")[1],
	  				num=this.name.split("_")[2],
	  				url=app.theme[theme][issue].layers[num].url,
		  			type=app.theme[theme][issue].layers[num].type,
		  			that=this;
		  		
		  		//show loading icon
		  		$("#loading_" + this.id).show();
		  		
		  		switch(type){
		  			case "WMS":
		  				var wms=new makoci.layer.WMS(url);
		  				app.map.overlayMapTypes.setAt(this.id, wms);
		  				
		  				google.maps.event.addListener(wms, "tilesloaded", function(){
		  					//hide loading icon
		  					$("#loading_" + that.id).hide();
		  				});
		  			break;
		  		}
	  		}else{
	  			app.map.overlayMapTypes.removeAt(this.id);
	  			
	  			//hide loading icon
		  		$("#loading_" + this.id).hide();
	  		}
	  	});
		
		
		//show theme
		var elem=$("#menuContent")[0];
		if(elem.style.display=='none'){
			$("#menuContent").show();
		
			$("#mapContent").animate({width:$(window).width()  - $("#menuContent").width() - 8}, 150, function(){
			$("#mapContent").css('width', '80%');
				google.maps.event.trigger(app.map, "resize");
			});
		}
	}else{
		console.log('[ERROR] No Matched Theme');
		return;
	}
}