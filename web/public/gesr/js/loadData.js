//some basic definition
app.gesr={
	geonames:{},
	searchResults:[], 
	filter:{
		year:{},
		institute:{},
		author:{}
	},
	filterHistories:[],
	filterResults:[],
	features:[],
	oplayer:null,
	searchTerm:"",
	countriesLayer:null,
	arabCountries:["Algeria", "Bahrain", "Comoros", "Djibout", "Egypt", "Iraq", "Jordan", "Kuwait", "Lebanon", "Libya", "Mauritania", "Morocco", "Oman", "Palestine", "Qatar", "Saudi Arabia", "Somalia", "Sudan", "Syria", "Tunisia", "United Arab Emirates", "Yemen"],
	publicationPlaces:{}
}



//init
$(function(){
	//show information at the startup
	//app.main.showDialog("about", "KIEIN GeoProtal", {width:800, height:500, position:"center", modal:true, resizable:false, draggable:false});
	
	app.main.initUI();
	customizeUI();
	
	app.main.initMap();
	
	//read gcc countries features and show on the map	
	readCountries('GCC');
	
	//read publication places in GESR
	getGESRPublicationPlace();
	
	//read theme from theme.json
	$.getJSON("db/data.json", function(json){
		app.theme=json;
		
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
	//set up the width of menuContent
	//$("#menuContent").width($("#menuWidget").width() - $("#toolboxContent").width());
	
	
	//hide searchResult
	$("#searchInput").keyup(function(){
		if($(this).val()==''){
			//change UI
			//$('#menuWidget, #menuContent').height(''); 
			$("#menuContent > div").hide();
			$("#intro").show();
		}
	}).keypress(function(e){
		var code = (e.keyCode ? e.keyCode : e.which);
		if(code == 13) { //Enter keycode
			//doSearch($(this).val(), $('#searchType').val())
			doSearch($(this).val(), "LIBRARY")
		}
	});
	
	
	
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
	
	
	//hide toolbox except show/hide/map
	//$("#toolboxContent ul li[title='show/hide map']").siblings().hide();
}




/**
 * show hide map
 * @method showhideMap
 * @param {String} showhide
 * @return {} Null
 */
function showhideMap(showhide){
	
	
	if(!showhide){showhide='auto'}
	
	switch (showhide){
		case "show":
			show();
		break;
		case "hide":
			hide();
		break;
		case "auto":
			var condition=($("#menuWidget").width() / $(document).width() > 0.9) ? show() : hide() ;
		break;
	}
	
	function show(){
		$("#menuWidget").animate({width:"48%"}, 500, function(){
			$("#baseMapSwitch").css({right:$("#menuWidget").width()+"px"});	
		})
	}

	function hide(){
		$("#menuWidget").animate({width:"100%"}, 500, function(){
			$("#baseMapSwitch").css({right:$("#menuWidget").width()+"px"});	
		})
	}
}





/**
 * do a search
 * @method doSearch
 * @param {String} value
 * @param {String} type
 * @return {} Null
 */
function doSearch(value, type){
	app.gesr.searchTerm=value;
	
	//hide intro
	$("#intro").hide();
	
	//remove multiple space in the searchTerm
	value=value.replace(/ {2,}/g,' ').replace(/ /g, "+");
	
	
	//remove existing features on the map
	if(app.gesr.oplayer){
		app.map.removeLayer(app.gesr.oplayer);
	}
	
	//WMS obj
	if(app.gesr.countriesLayer && app.gesr.countriesLayer.oplayer){
		app.map.removeLayer(app.gesr.countriesLayer.oplayer);
		app.gesr.countriesLayer.oplayer=null;
	}


	switch (type){
		case "LIBRARY":
			
			var pageNumber=1;
			var url="http://161.252.9.43:8088/search/query?theme=GESR&term_1="+value+"&match_1=MUST&field_1=&pageNumber="+pageNumber;
			
			//search
			doFilter(url)
		
		break;
		case "GEODATABASE":
			showGeoDatabaseResult(value);
		break;
	}
	
	
}



//
/**
 * do a filter on the inputted URL
 * @method doFilter
 * @param {String} url
 * @return {} Null
 */
function doFilter(url){
	//console.log(url)
	
	//show loading image
	$("#searchResult_list").html("<img src='images/loading.gif' width='25px' height='25px' />")
	searchGESR(url, null, showSearchResult, function(error){console.log(error)});
}





/**
 * parse and visulize search results from GESR server
 * @method showSearchResult
 * @param {Object} $records
 * @return {} Null
 */
function showSearchResult($records){
	//change UI
	$('#menuWidget, #menuContent').height('100%'); 
	$(".searchResult, #intro").hide();
	$("#searchResult_library > div").hide();
	$("#searchResult_library, #searchResult_listContent").show();
	//$("#toolboxContent ul li[title='show/hide map']").siblings().hide();
	
	
	var html_list='No search results. Please use other keywords to search again.',
		html_filter="";
	
	if($records.length>0){
		
		    //parse records into list
		    var html_list="<ul>";
		    var results=[];
		    $records.filter("li.record").each(function(i, record){
		    	var $record=$(record);
		   		
		    	//define obj
		    	var url=$record.find("a.title").attr("url");
		    	obj={
		    		title: $record.find(".title").html(),
		    		author: $record.find(".author").html(),
		    		url:url,
		    		id:url.match(/id=[^&]*/)[0].split("id=")[1],
		    		fid:i
		    	};
		    	results.push(obj);
		    	
		    	html_list+="<li id='"+i+"'><div id='listID'>"+$record.find("div.checkbox").text()+"</div>"+$record.find("div.record").html()+"</li>";
		    });
		    app.gesr.searchResults=results;
			html_list+="</ul>";
		    
		    
		    //parse records into filter
		    var $filter=$($records.filter("ul")[0])
		    if($filter.length>0){
		    	//show more and show less button
		    	$filter.find("> li > ul").each(function(i, ul){
		    		var $ul=$(ul), $li=$ul.find("> li");
		    		
		    		if($li.length>5){
		    			$ul.find("li:nth-child(n+6)").hide();
		    			$ul.append("<li><a href='#' onclick='' id='showMoreLess' value='showMore'>Show more...</a></li>");
		    		}
		    	});

		    	html_filter=$filter.html();
		    }
		    
		    //searchTerms
		    $records.filter("#searchTerms").find("img[alt='X']").attr("src", 'images/remove_GESR.png')
		    $("#searchResult_searchTerm").html($records.filter("#searchTerms").html());
		    
		    
		    //show searchTerms in the search box
		    var searchTerms=[];
		    $("#searchResult_searchTerm ul li span").each(function(){
		    	searchTerms.push($(this).html());
		    });
		    $("#searchInput").val(searchTerms.join(" "))


		    
		    
		    //page link
		    $("#searchResult_pageLink").html($records.filter(".pageLinks").html());
		    
		    //show result count
		    $("#searchResult_count").html($records.filter("div.resultCount").html());
			
	}
		
	
	//show search result
	$('#searchResult_filter').html(html_filter)
		.find("#showMoreLess").click(function(){
			var $this=$(this), value=$this.attr('value');
			
			if(value=='showMore'){
				$this.parent().siblings().show();
				$this.attr('value', 'showLess').html('Show less...');
			}else{
				$this.parent().siblings("li:nth-child(n+6)").hide();
				$this.attr('value', 'showMore').html('Show more...').parent().show();
			}
		});
	$('#searchResult_list').html(html_list)
		.find("ul li a.title").click(function(){
			var id=$(this).parent().attr("id");
			showItemDetail(app.gesr.searchResults[id])
		});


	$('#searchResult').show(); 
		
}




/**
 * show detail information of selected item
 * @method showItemDetail
 * @param {Object} item
 * @return {} Null
 */
function showItemDetail(item){
	if(!item){console.log("[ERROR] showItemDetail: no matched item. Please check again."); return;}
	
	//clear layer
	if(app.gesr.oplayer){
		app.gesr.oplayer.removeAllFeatures()
	}
	
	
	//UI
	$(".searchResult").hide();
	$("#searchResult_library > div").hide();
	$("#searchResult_library").show();
	

	//search
	searchGESR(item.url, "#main", function(record){
		var $record=$(record),
			$target=$("#searchResult_ltemDetail");
		
		//parseMARC
		if(!item.marc){
			item.marc=parseMARC($record.find(".detail"));
		}
		
		var html=$record.html();
		
		
		//show item detail
		$target
			.html(html)
			.append("<div id='showMap'>Show Map</div>")
			.show()
			.find("h1.title")
			.before("<a id='goBack' href='#' onclick='$(\".searchResult > div\").hide();$(\"#searchResult_listContent\").show();'><< Go Back to Search Results</a>");
			
		
		//get tabs object
		var $tabs=$target.find("#itemTabs");
		
		//geocodeMarc
		item.features=geocodeMARC(item.marc);
		if(item.features.length>0){
				//show location in the tabs
				var tabsHtml="<table><tr><td>Key</td><td>Description</td><td>Location</td><td>MARC</td></tr>", attributes={};
				$.each(item.features, function(i, feature){
					attributes=feature.attributes;
					tabsHtml+="<tr><td>"+attributes.marcKey+"</td><td>"+attributes.name+"</td><td>"+attributes.geoname+"</td><td>"+attributes.marc+"</td></tr>";
				})
				tabsHtml+="</table>"
			
				
				$tabs.append("<div id='itemDetail_location'>" + tabsHtml+"</div><div id='itemDetail_layer'></div>").find(" > ul").append("<li><a href='#itemDetail_location'>Locations</li><li><a href='#itemDetail_layer'>Layers</li>");
				
				//copy html from #layers to #itemDetail_layer
				$("#itemDetail_layer").html($("#layers").html()).find("#layersAccordion").accordion();
				
				//toc event
				TOCevent();
				
				$target.find("#showMap").show().click(function(){
					showhideMap("show");
					showLocation(item.features);
				})
		}
		
		//remove first empty tab
		$tabs.find("li#tabs-1").remove();
		
		//tabs
		$tabs.tabs({selected: 0});
		
		console.log(item)
		
		
		//hide add to cart
		$target.find("input[value='Add To Cart'], #searchInformation").hide();
		
	}), function(error){console.log(error)}
}




/**
 * parse MARC
 * @method parseMARC
 * @param {Object} $obj
 * @return {Object} objs
 */
function parseMARC($obj){
	var tags=$obj.find(".marcTag").map(function(i,el) { return $(el).html(); }),
		values=$obj.find(".marcData").map(function(i,el) { return $(el).html(); }),
		objs={}
	
	if(tags.length==values.length){
		tags.each(function(i,tag){
			var value=values[i],
				valueSplits=value.split(/\$[A-Za-z0-9] /);
	
			if(objs[tag]){
				objs[tag].push(values[i]);
			}else{
				objs[tag]=[values[i]];
			}
			
		});
	}
	
	return objs
}




/**
 * geocoding MARC. If there is MARC containing geolocation information, it will be geocoded and attached with latitude and longtigude. 
 * @method geocodeMARC
 * @param {Object} marcObj
 * @return {Array} results
 */
function geocodeMARC(marcObj){
	var keys={
		"110": {name:"Main Entry-Corporate Name", locationKey:"$c"},
		"111": {name:"Main Entry-Corporate Name", locationKey:"$c"},
		"600": {name:"Subject Added Entry - Personal Name", locationKey:"$z"},
		"610": {name:"Subject Added Entry - Corporate Name", locationKey:"$z"},
		"630": {name:"Subject Added Entry - Uniform Title", locationKey:"$z"},
		"648": {name:"", locationKey:"$z"},
		"650": {name:"Subject Added Entry - Topical Term", locationKey:"$z"},
		"651": {name:"Subject Added Entry - Geographic Name", locationKey:"$z"},
		"654": {name:"", locationKey:"$z"},
		"655": {name:"", locationKey:"$z"},
		"656": {name:"", locationKey:"$z"},
		"657": {name:"", locationKey:"$z"},
		"751": {name:"", locationKey:"$z"},
		"710": {name:"Added Entry - Corporate Name", locationKey:"$c"},
		"711": {name:"Added Entry - Meeting Name", locationKey:"$c"}
	};
	
	var geoname="", lat=0, lng=0, feature={}, results=[] 
	$.each(keys, function(k,v){
		//if key exist in the marcObj
		if(marcObj[k]){
			$.each(marcObj[k], function(i,value){
				if(value.indexOf(v.locationKey)!=-1){
					geoname=(value+"$").match(new RegExp("\\"+v.locationKey+" [^$]*\\w",""))[0].split(v.locationKey+" ")[1];
					
					if(geoname && app.gesr.geonames[geoname]){
						lat=app.gesr.geonames[geoname].Latitude;
						lng=app.gesr.geonames[geoname].Longitude;
						
						feature=new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(lng, lat).transform(app.map.displayProjection, app.map.projection), {marcKey: k, name: v.name, geoname: geoname, marc:value});
						
						results.push(feature);
					}
					
				}
			})
		}
	})
	
	return results;
	
}





/**
 * show geodatabser result
 * @method showGeoDatabaseResult
 * @param {String} searchTerm
 * @return {} Null
 */
function showGeoDatabaseResult(searchTerm){
	//UI
	$(".searchResult").hide();
	$("#searchResult, #searchResult_geodatabase").show();
	showhideMap("show");
	$("#toolboxContent ul li[title='show/hide map']").siblings().show();
	
	searchTerm=searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1).toLowerCase();
	
	
	//zoom to the location of the searchTerm
	var center=app.gesr.geonames[searchTerm];
	if(center){
		var lat=parseFloat(center.Latitude),
			lng=parseFloat(center.Longitude)+1.5,
			latlng=new OpenLayers.LonLat(lng, lat).transform(app.map.displayProjection, app.map.projection);
	
		app.map.setCenter(latlng, 7);
	}
	
	
	
	//show content in the wikipedia
	$("#iframe_wikipedia").attr("src", "http://en.wikipedia.org/wiki/"+ searchTerm)
	
	//show content in the dbpedia
	$("#iframe_dbpedia").attr("src", "http://dbpedia.org/page/"+searchTerm);
	
}








/**
 * show location
 * @method showLocation
 * @param {Array} features
 * @return {} Null
 */
function showLocation(features){
	if(app.gesr.oplayer){
		console.log(app.gesr.oplayer)
		//app.map.removeLayer(app.gesr.oplayer);
		//app.gesr.oplayer.removeAllFeatures();
	}
	
	
	//create feature layer
	var flayer=app.gesr.oplayer=new OpenLayers.Layer.Vector("cluster", {
		//projection: "EPSG:4326"
		//strategies: []
	}); 

	//make cluster layer
	//need to make the cluster layer first before adding features
	var cluster=new OpenLayers.Strategy.Cluster();
	// cluster.distance=10;
	// cluster.threshold=1;
	flayer=kiein.layer.clusterVectorLayer(flayer, {clusterStrategy: cluster});
	app.map.addLayer(flayer);

	
	//read feature
	flayer.addFeatures(features);
	
	
	

	var countries={}, geoname="", 
		pushCountries=function(country){
			if(!countries[country]){countries[country]=true;}
		};
		
	$.each(features, function(i, feature){
		geoname=feature.attributes.geoname;
		
		if(geoname=='Arab countries' || geoname=='Arab World'){
			$.each(app.gesr.arabCountries, function(j,country){pushCountries(country)})
		}else{
			pushCountries(geoname);
		}
	})

	getCountriesWMS(countries)
}




/**
 * read gcc_countires.geojson file and show on the map
 * @method readCountries
 * @param {String} type
 * @return {} Null
 */
function readCountries(type){
	if(type=='GCC'){
		$.getJSON("db/GCC_countries.json", function(json){
			var layer = new OpenLayers.Layer.Vector(); 	
			var features=new OpenLayers.Format.GeoJSON({'externalProjection': app.map.displayProjection, 'internalProjection': app.map.projection}).read(json);
			
	
			layer.addFeatures(features);
			//app.map.addLayer(layer);
			
			app.vectorLayer.gcc=layer;
		});
	}
	
	//read all countries
	$.getJSON('db/countries.json', function(json){
		app.gesr.geonames=json;
	});
	
	
}





/**
 * send a request to GESR server to search
 * @method searchGESR
 * @param {String} url
 * @param {String} selector
 * @param {Function} callback_success
 * @param {Function} callback_error
 * @return {} Null
 */
function searchGESR(url, selector, callback_success, callback_error){
	if(!selector){
		selector="li.record, #main #refine > ul, #searchTerms, .pageLinks, div.resultCount"
	}
	
	
	$.ajax({
		url:"../proxy?url="+url.replace(/&/ig,"%26").replace(/\+/ig, "%2B"),   //if url contains & symbols, it will make the error in the proxy.py. Because it cannot make sure the parpaetmers behind "&" are for url or proxy
		type:"GET",
		dataType:"html",
		success:function(result){
			//overwrite a href
			var $result=$(result).find(selector);
			$result.find("a").each(function(){
				var $a=$(this),
		    		href=$a.attr("href"),
		    		splits=href.split("./"),
		    		link=(function(){
		    			var url=splits[0];
		    			
		    			if(splits.length>1){
		    				url=splits[1].replace(/(^|;)jsessionid=[^?]*/,'');
		    				
		    				if(url.indexOf("query?")!=-1 && url.indexOf("search/")==-1){
		    					url="search/"+url;
		    				}
		    				url="http://161.252.9.43:8088/"+url;
		    			}
		    			
		    			return url;
		    		})();
		    		
		    	$a.attr({
		    		"href":(splits.length>1)?"#":link,
		    		"url":link,
		    		"onclick": ((splits.length>1)? "doFilter('"+link+"')" : ""),
		    		"target": (splits.length>1)?"":"_blank"
		    	})
		    	
		    	
		    	if($a.hasClass("title")){
		    		$a.attr("onclick", "");
		    		//will be triggered in the showSearchResult click event
		    	}
			});
			
		    if(callback_success){
		    	callback_success($result)
		    }
		},
		error:function(e){
		   if(callback_error){
		   		callback_error(e)
		   }
		}
	}) ;
}





/**
 * advanced search
 * @method advancedSearch
 * @return {} NULL
 */
function advancedSearch(){
	searchGESR("http://161.252.9.43:8088/search/advanced?theme=GESR", "#main", function($result){
		//hide 
		$(".searchResult, #searchResult_library > div, #intro").hide();
		
		//show advanced Search option
		$("#searchResult_library, #searchResult").show();
		$("#searchResult_advancedSearch").html("<h2>Advanced Search</h2>"+$result.html()).show();
		
		
		//advanced search button click event
		$("#searchResult_advancedSearch .button[value='Search']").attr("onclick","").click(function(){
			var $advancedSearch=$("#searchResult_advancedSearch"),
				url='http://161.252.9.43:8088/search/query?' + 
					"match_1="+$advancedSearch.find("select[name='searchFields:1:match']").val()+"&"+
					"field_1="+$advancedSearch.find("select[name='searchFields:1:field']").val()+"&"+
					"term_1="+$advancedSearch.find("input[name='searchFields:1:term']").val()+"&"+
					"match_2="+$advancedSearch.find("select[name='searchFields:2:match']").val()+"&"+
					"field_2="+$advancedSearch.find("select[name='searchFields:2:field']").val()+"&"+
					"term_2="+$advancedSearch.find("input[name='searchFields:2:term']").val()+"&"+
					"match_3="+$advancedSearch.find("select[name='searchFields:3:match']").val()+"&"+
					"field_3="+$advancedSearch.find("select[name='searchFields:3:field']").val()+"&"+
					"term_3="+$advancedSearch.find("input[name='searchFields:3:term']").val()+"&"+
					"match_4="+$advancedSearch.find("select[name='searchFields:4:match']").val()+"&"+
					"field_4="+$advancedSearch.find("select[name='searchFields:4:field']").val()+"&"+
					"term_4="+$advancedSearch.find("input[name='searchFields:4:term']").val()+"&"+
					"filter_loc="+(($advancedSearch.find("select[name='filters:4:filter']").val())?$advancedSearch.find("select[name='filters:4:filter']").val():"")+"&"+
					"filter_format="+(($advancedSearch.find("select[name='filters:3:filter']").val())?$advancedSearch.find("select[name='filters:3:filter']").val():"")+"&"+
					"filter_pp="+(($advancedSearch.find("select[name='filters:2:filter']").val())?$advancedSearch.find("select[name='filters:2:filter']").val():"")+"&"+
					"filter_lang="+(($advancedSearch.find("select[name='filters:1:filter']").val())?$advancedSearch.find("select[name='filters:1:filter']").val():"")+"&"+
					"theme=GESR";
			
			
			//search
			searchGESR(url, null, showSearchResult, function(e){console.log(e)})
			
			//Due to the search button is in the form, we need to return false to stop submit value into form's action URL.
			return false;
		});

	}, function(e){console.log(e)})
	
	
	
	
}






/**
 * get counrties wms
 * @method getCountriesWMS
 * @param {Object} countries
 * @return {} Null
 */
function getCountriesWMS(countries){
	if(!countries){console.log("[ERROR]getCountriesWMS: no countries"); return;}
	if(!countries instanceof Object){console.log("[ERROR]getCountriesWMS: not an object"); return;}
	
	if(countries){
		//parse countries object to CQL string
		
		var array_countries=[]
		$.each(countries, function(k,v){
			array_countries.push("'"+k+"'");
		})
		var cql_filter="admin IN (" + array_countries.join(", ")+")"
		
		//console.log(cql_filter)
		
		//WMS obj
		if(app.gesr.countriesLayer && app.gesr.countriesLayer.oplayer){
			app.map.removeLayer(app.gesr.countriesLayer.oplayer);
		}
		
		app.gesr.countriesLayer={
			"name":"World Countries", 
			"type":"WMS", 
			"source": "KISR", 
			"software": "GeoServer", 
			"url":"http://sgis.kisr.edu.kw/geoserver/GESR/wms", 
			"srs":"EPSG:4326", 
			"param": {"layers":"GESR:WorldCountries",  "format":"image/png", "transparent": true, "tiled": true, "cql_filter":cql_filter}
		}
		
		
		app.main.showLayer(app.gesr.countriesLayer)

	}
	
	
}






/**
 * get gesr publication places
 * @method getGESRPublicationPlace
 * @return {} Null
 */
function getGESRPublicationPlace(){
	searchGESR("http://161.252.9.43:8088/search/advanced?theme=GESR", "#main .filter select[name='filters:2:filter'] option", function($result){
		$result.each(function(i,o){
			var $o=$(o)
			app.gesr.publicationPlaces[$o.text()]=$o.val()
		})
	}, function(e){console.log(e)});
}






/**
 * Read db/data.json file to show theme
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
						html+="<li id='" + layer.name + "_" + i + "'><img id='" + app.layersNum + "' name=" + layer_name + " class='layer_setting' src='images/1351075640_gear.png' width=18px style='cursor:pointer;' title='setting' /> <input type=checkbox id='" + app.layersNum + "' name=" + layer_name + " class='layer_chk' title='show/hide layers on the map'/>&nbsp;<img class='loading' src='images/loading.gif' id='loading_" + app.layersNum +"' style='display:none' />&nbsp;<label title='From: " + layer.source + "@" + layer.software + " / " + layer.srs + "'>" + layer.name + "</label></li>"; 
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
		
		
		//toc event
		TOCevent();
		
		
		
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



/**
 * Events in the table of content
 * @method TOCevent
 * @return {} Null
 */
function TOCevent(){
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
			  	if(layer.slider && (layer.slider.time || layer.slider.elevation || layer.slider.styles)){
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
}


