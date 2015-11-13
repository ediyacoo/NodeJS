
$(function(){
	app.main.initUI();
	UI();
	
	app.main.initMap();
	
	app.indicator={
		selectIndicator:{
			indicator:null,
			issue:null,
			theme:null,
			indicatorIndex:null,
			issueIndex:null,
			themeIndex:null,
			featureIndex:null
		},
		isUrlParameter:false,
		wmsLayers:[]  //wms layers
	}
	
	app.css.infoContent_width=0;
	
	//google charts
	app.gCharts=[];
	
	
	//read theme from theme.json
	$.getJSON("db/indicator.json", function(json){
		app.theme=json;
		dropdownMenu();
		

	});
	
	//indicator vector layer
	app.vectorLayer.indicator=new OpenLayers.Layer.Vector("indicator",{isbaseLayer:false});
	app.map.addLayer(app.vectorLayer.indicator);
	
	//indicator control
	app.mapControl.selectFeature_indicator={
		mouseover: new OpenLayers.Control.SelectFeature([app.vectorLayer.indicator], {hover: true, highlightOnly:true, renderIntent: "highlight", eventListeners: {
        	featurehighlighted: function(e){e.feature.layer.events.triggerEvent("featurehighlighted", e);},
        	featureunhighlighted: function(e){e.feature.layer.events.triggerEvent("featureunhighlighted", e);}
    	}}),
    	click: new OpenLayers.Control.SelectFeature([app.vectorLayer.indicator], {clickout:true, eventListeners: {
        	//featurehighlighted: function(e){console.log(e)}
    	}})
    };
    $.each(app.mapControl.selectFeature_indicator, function(k,v){
    	app.map.addControl(v);
		v.activate();
    })
    
});




/**
 * UI 
 */
function UI(){
	
	showDom("indicator_description",1024);
	
	$(window).resize(function(){
		showDom("indicator_description",1024);
	});
	
	
	//adjust infoPanel
	$('#infoPanel').resizable({
		handles: 'w',
		minWidth : $(document).width() * 0.37,
		maxWidth : $(document).width() * 0.65,
		resize:function(){
			$('#infoPanel').css({height:"99.5%"});
		    $("#baseMapSwitch").css("right", $("#infoPanel").width()+ 5);
		},
		stop:function(){
			if(app.indicator.selectIndicator.indicator){
				readModel(app.indicator.selectIndicator.indicator, app.indicator.selectIndicator.theme, app.indicator.selectIndicator.issue);
			}
		}
	});
	
	//basemapSwitch position
	$("#baseMapSwitch").css("right", 5);
	
	
	//infoContent_tabs while swtiching tabs
	$("#infoContent_tabs").bind("tabsshow", function(e,ui){
		//if switch to the first tab
		if(ui.index==0 && app.css.infoContent_width!=$("#infoContent_tabs").width()){
			if(app.indicator.selectIndicator.indicator){
				readModel(app.indicator.selectIndicator.indicator, app.indicator.selectIndicator.theme, app.indicator.selectIndicator.issue);
			}
		}
		app.css.infoContent_width=$("#infoContent_tabs").width();
	});
	
	
	function showDom(id, maxWidth){
		if($(window).width() >= maxWidth){
			$("#"+id).show();
		}else{
			$("#"+id).hide();
		}
	}
}



/**
 * dropdown menu
 */
function dropdownMenu(){
	$("#select_theme").ddslick({
		data:(function(){
			var objs=[];
			$.each(app.theme, function(theme, value){
				objs.push({
					text: theme,
					value: theme,
					selected: false, 
					description: "Theme", 
					imageSrc: null
				});
			});
			return objs;
		})(),
		selectText:"Select a Theme",
		onSelected: function(eTheme){
			//set app.indicator.selectIndicator.theme
			app.indicator.selectIndicator.theme=eTheme.selectedData.value;
			app.indicator.selectIndicator.themeIndex=eTheme.selectedIndex;
			
			//change value in the select_issue
			$("#select_issue").ddslick("destroy");
			$("#select_indicator").ddslick("destroy");
			$("#select_issue").ddslick({
				data:(function(){
					var objs=[];
					$.each(app.theme[eTheme.selectedData.value].issue, function(issue, value){
						objs.push({
							text: issue,
							value: issue,
							selected: false, 
							description: "Issue", 
							imageSrc: ""
						});
					});
					return objs;
				})(),
				selectText:"Select a Issue",
				onSelected: function(eIssue){
					//set app.indicator.selectIndicator.issue
					app.indicator.selectIndicator.issue=eIssue.selectedData.value;
					app.indicator.selectIndicator.issueIndex=eIssue.selectedIndex;
					
					//change value in the select_indicator
					$("#select_indicator").ddslick("destroy");
					$("#select_indicator").ddslick({
						data:(function(){
							var objs=[];
							$.each(app.theme[eTheme.selectedData.value].issue[eIssue.selectedData.value].indicators, function(i, indicator){
								objs.push({
									text: indicator.metadata.name,
									value: i,
									selected: false, 
									description: indicator.metadata.description, 
									imageSrc: ""
								});
							});
							return objs;
						})(),
						selectText:"Select a Indicator",
						onSelected: function(e){
							//set app.indicator.selectIndicator.indicator
							app.indicator.selectIndicator.indicator=app.theme[eTheme.selectedData.value].issue[eIssue.selectedData.value].indicators[e.selectedData.value];
							app.indicator.selectIndicator.indicatorIndex=e.selectedIndex;
							
							//show description
							$("#indicator_description").html(app.indicator.selectIndicator.indicator.metadata.description)
							
							//showlayer
							readModel(app.indicator.selectIndicator.indicator, app.indicator.selectIndicator.theme, app.indicator.selectIndicator.issue);
						},
						width:350
					});
				}
			});

		}
	});
}



/**
 * read model 
 */
function readModel(obj, theme, issue, options){
	//reset
	$("#infoContent_tabs_about, #infoContent_chart, #infoContent_toc").html("");
	app.vectorLayer.indicator.removeAllFeatures();

	//show loading dialog
	app.main.showDialog("dialog_loading", "Loading", {width:300, height:150, modal:true, position:"center"});
	
	//show infoPanel
	if(!$("#menuWidget").is(":visible")){
		$("#menuWidget").fadeIn();
		$("#baseMapSwitch").css("right", $("#infoPanel").width()+ 10);
	}
	
	
	
}




