//init to loadData from db/data.json file
$(function(){
	//show about information at the startup
	//app.main.showDialog("about", "KIEIN GeoProtal", {width:800, height:500, position:"center", modal:true, resizable:false, draggable:false});
	
	app.main.initUI();
	customizeUI();

	app.main.initMap();
	
	//read theme from theme.json
	$.getJSON("db/data.json", function(json){
		app.theme=json;
		
		//setThemeWidget();
		$("#themeContent").ready(function(){
			//show tabs
			var html="<ul><li><a href='#layer'>Layer</a></li><li><a href='#legend'>Legend</a></li></ul>"+
					 "<div id='layer' style='height:95%; overflow:auto;'></div><div id='legend' style='height:95%; overflow:auto;'><ul style='padding:0px; margin:0px; list-style:none'></ul></div>";
			$("#theme_content").html(html);
			$("#theme_content").tabs();
		})
		showTheme();
			
		app.main.readURLParameter();
	});
	
});



/**
 * customize User Interface
 * @method customizeUI
 * @return {} Null
 */
function customizeUI(){
	//make infoPanel resizable
	$('#infoPanel').resizable({
				handles: 'n',
				minHeight : app.css.infoWidget_height-20,
				maxHeight : $(document).height() - $('#titleContent').height()-100,
				resize:function(){
					//$('#infoWidget').height($(this).outerHeight()+30);
					
					// var remainingSpace=$(this).parent().height() - $(this).outerHeight();
					// var divTwo = $(this).next();
					// var divTwoHeight = remainingSpace - (divTwo.outerHeight() - divTwo.height());
					// divTwo.css('height', divTwoHeight +'px');
					// //google.maps.event.trigger(app.map, 'resize');
					// app.css.map_height=$(this).outerHeight();
		// 			
				    //set infoPanel width = 100%
					$('#infoPanel').css('width', '100%');
				}
		
	});
}



/**
 * Read db/data.json file and show theme and layers in the table of content.
 * @method showTheme
 * @return {} Null
 */
function showTheme(){

	if(app.theme){
		var html='';
		$.each(app.theme, function(key, value){
			//show title
			//$("#theme_title").html(id);
			
			//show description
			//$("#theme_description").html(value.description)
			//console.log(value.background_color)
			//html+="<h3 style='background:" + (value.background_color || "") + "'><a href='#'>"+ key + "</a></h3><div style='background:" + value.background_color + "; background-image:url(\""+ (value.background_image || "") +"\");background-repeat:no-repeat;background-size:100%'><ul>";
			html+="<h3 style=''><a href='#'>"+ key + "</a></h3><div style='background-image:url(\""+ (value.background_image || "") +"\");background-repeat:no-repeat;background-size:100%' title='" + value.description + "'><ul class='sortable draggable'>";
			var layer_name="";
			$.each(value, function(k, obj){		
				//layer
				if(k=="layers"){
					$.each(obj, function(i, layer){
						layer_name=key + "_" + k + "_" + i;
						html+="<li id='" + layer.name + "_" + i + "'><img id='" + app.layersNum + "' name=" + layer_name + " class='layer_setting' src='images/1351075640_gear.png' width=18px style='cursor:pointer;' title='setting' /> <input type=checkbox id='" + app.layersNum + "' name=" + layer_name + " class='layer_chk' title='show/hide layers on the map'/>&nbsp;<img src='images/loading.gif' id='loading_" + app.layersNum +"' style='display:none' />&nbsp;<label title='From: " + layer.source + "@" + layer.software + " / " + layer.srs + "'>" + layer.name + "</label></li>"; 
						app.layersNum++;
						
						//spatial query selector
						if(layer.type=='WFS' || layer.type=='WMS'){
							if(layer.type=='WMS'){
								$("#spatialquery_tablename").append("<option value='"+ layer.param.layers + "' url='" + layer.url +"' srs='" + layer.srs + "'>"+ layer.name +"</option>");
							}else{
								$("#spatialquery_tablename").append("<option value='"+ layer.featureType + "' url='" + layer.url + "' srs='" + layer.srs + "'>"+ layer.name +"</option>");
							}
						}
						
						
						
						//get how many different wms server url
						if(layer.type=='WMS'){
							//init app.WMSCapabilities[layer.url]
							if(!app.WMSCapabilities[layer.url]){
								app.WMSCapabilities[layer.url]={
									value:null
								}
							}
							app.WMSCapabilities[layer.url][key + "#" + i]= layer.param.layers;
						}
					});
				}
			});
			html+="</ul></div>";
		});
		
		$("#layersAccordion").html(html);
		$("#layersAccordion").accordion({collapsible:false, autoHeight:false});
		

		//read wms capabilities
		$.each(app.WMSCapabilities, function(url,ob){
			OpenLayers.Request.GET({
				url: url,
				params: {
					SERVICE: "WMS",
					VERSION: "1.3.0",
					REQUEST: "GetCapabilities"
				},
				success: function(response) {
					if(response.status==200){
						var result=new OpenLayers.Format.WMSCapabilities().read(response.responseXML);
					  	app.WMSCapabilities[url].value=result;
					  	
						var theme="", num=0, o;
						$.each(ob, function(k,name){
							if(k!="value"){
								theme=String(k).split("#")[0];
								num=Number(String(k).split("#")[1]);
								o=app.theme[theme].layers[num];
								
								$.each(result.capability.layers, function(i, def){
									if(def.name==String(name).split(":")[1] || def.name==String(name)){
										o.WMSCapability=def;
									}
								});
							}
						});	
					}
				},
				failure: function(msg){
					console.log("[ERROR]WMS_GetCapabilities: '"+ url + "' = " + msg.responseText);
				}
			});				
		});
		
		//draggable and sortable
		$( ".sortable" ).sortable({
            revert: true,
            update: function(e,ui){
            	app.main.adjustLayerOrder();
            }
        });
		
		

		//add click event on layer checkbox
		$(".layer_chk").click(function(){
			var theme=this.name.split("_")[0],
	  			issue=this.name.split("_")[1],
	  			num=this.name.split("_")[2];
	  		
	  		//if checked
	  		if(this.checked){
				$(this).attr('checked', true);
				
		  		//record what checkbox has been checked
		  		//app.theme[theme].layerHtml=$("#layer").html();
		  		
		  		//show loading icon
		  		$("#loading_" + this.id).show();

				//show layer
				var layer=app.theme[theme].layers[num];
				layer.timeStart=new Date().getTime();
				layer.timeEnd=0;
				layer.timeDuration=0;
				layer.timeDurations=[];
				layer.timeAverage=0;
			  	
			  	//if contains slider
			  	if(layer.slider && layer.slider.variable && layer.slider.values.length > 0 && layer.slider.labels.length > 0){
			  		//clear layerslider change event to avoid show previous layer
			  		$("#layerslider").slider({"change": function(e,ui){null}})
			  		app.main.showLayerslider(layer);
			  	}
			  	
			  	app.main.showLayer(layer, {id: this.id});
			  	
			  	//adjust layer order
			  	app.main.adjustLayerOrder();
			  	
			  	
			  	//reset app.performanceIndex
	  			layer.performanceIndex=0;
	  			
			  	//hide contextmenu
			  	$("#contextmenu").hide();
			  	
			  	//google analyst to track what layer is checked
			  	_gaq.push(['_trackEvent', 'DATA-Layer', layer.type, layer.name]);
	  		}else{
	  			//var layer=app.map.getLayersByName(app.theme[theme].layers[num].name)[0];
	  			var layer=app.theme[theme].layers[num].oplayer;
	  			layer.setVisibility(false);
	  			
	  			$(this).attr('checked', false);
	  			
	  			//record what checkbox has been checked
		  		// app.theme[this.name.split("_")[0]].layerHtml=$("#layer").html();

		  		//remove popup
		  		if(app.popup){
	            	app.map.removePopup(app.popup);
	            }
		  		
		  	
	  			//remove legend
	  			$("#legend_"+this.id).hide();

	  			//hide loading icon
		  		$("#loading_" + this.id).hide();
		  		
				
				//remove vectorLayerAttrbiute tab
				if(layer instanceof OpenLayers.Layer.Vector){
					if(layer.vectorLayerAttributeHtml && layer.vectorLayerAttributeId){
						$("#infoContent_vectorAttributeTabs").tabs("remove", "#"+layer.vectorLayerAttributeId);
					}
				}
				
				//hide contextmenu
			  	$("#contextmenu").hide();
			  	
			  	//hide layerslider
			  	var ob=app.theme[theme].layers[num];
			  	if(ob.slider && (ob.slider.time || ob.slider.elevation || ob.slider.styles) &&  $("#layersliderWidget").css("display")!="none"){
			  		$("#layersliderWidget").dialog("close");
			  	}
			  	
			  	
	  		}
	  	});
	  	
	  	
	  	//add click event on the layer_setting image
	  	$(".layer_setting").click(function(e){
	  		var theme=this.name.split("_")[0],
	  			issue=this.name.split("_")[1],
	  			num=this.name.split("_")[2],
	  			obj=app.theme[theme].layers[num];
	  		
	  		//show metadata
	  		$("#contextmenu_name").html(obj.name);
	  		$("#contextmenu_servicetype").html(obj.type);
	  		$("#contextmenu_software").html(obj.software);
	  		$("#contextmenu_loading").html((obj.timeDuration / 1000) + "s");
	  		$("#contextmenu_avgloading").html((obj.timeAverage / 1000).toFixed(3) + "s");
			
	  		//set transparency slider
	  		$("#contextmenu_transparency").hide();
	  		if(obj.type!='GEOJSON' || obj.type!='WFS' || obj.type!='GEORSS'){
	  			$("#slider_transparency").attr("name", obj.name);
	  			$("#slider_transparency").slider({value:(function(){if(obj.oplayer){return obj.oplayer.opacity * 100}else{return 75;}})()});
	  			$("#contextmenu_transparency").show();
	  		}
	  		
	  		
	  		//zoom to extent
	  		$("#contextmenu_zoomtoextent").click(function(e){
	  			switch(obj.type){
	  				case "WMS":
	  					zoomToExtent();	
	  				break;
	  				case "KML": case "GEOJSON": case "GEORSS":
	  					
	  				break;	
	  			}

	  			
			  	function zoomToExtent(){
	  				if(obj.WMSCapability){
	  					var bbox=obj.WMSCapability.bbox["CRS:84"].bbox;
		  				app.map.zoomToExtent(new OpenLayers.Bounds(bbox[0],bbox[1],bbox[2],bbox[3]).transform(app.map.displayProjection, app.map.projection));
	  				}else{
	  					setTimeout(zoomToExtent, 1000);
	  				}
	  			}
	  		});
	  		
	  		
	  		//show properties
	  		$("#contextmenu_properties").click(function(e){
	  			app.main.showProperties(obj);
	  		});
	  		
	  		//show contextmenu
	  		app.main.showContextMenu($("#contextmenu")[0],e.pageY);
	  	});
		
		
		//show theme
		var elem=$("#menuContent")[0];
		if(elem.style.display=='none'){
			$("#menuContent").show();
		
			$("#mapContent").animate({width:$(window).width()  - $("#menuContent").width() - 8}, 150, function(){
			$("#mapContent").css('width', '80%');
				app.map.updateSize();
			});
		}
		
	}//end if
}