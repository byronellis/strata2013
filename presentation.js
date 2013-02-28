$(function() {
$.deck('.slide');
});
prettyPrint();


$(function() { 
    var source2 = new EventSource('/ticker2');
    source2.addEventListener('message',function(e) {
	if(e.data) {
	    $('#payload-2').html(e.data);
	}
    });
    source2.addEventListener('open',function(e) { console.log(e); });
    source2.addEventListener('error',function(e) { console.log(e); });

    var source = new EventSource('/ticker');
    source.addEventListener('message',function(e) {
	if(e.data) {
	    var payload = JSON.parse(e.data);
	    $('#payload').html(e.data);
	    for(var observer in payload)
		$(document).trigger('data:'+observer,
				    [payload[observer]]);
	}
    }); 
    var width = $('#graph-1').width();
    var height= $('#graph-1').height() || 60;
    var svg = d3.select("#graph-1").append('svg').attr({width:width,height:height});
    var w   = width/60;
    function position(d,i) {
	this.attr({
	    x:function(d,i) { return w*d.key; },
	    y:function(d,i) { return height*(1-d.value/2000); },
	    height: function(d,i) { return height*(d.value/2000); }
	}).style({opacity:1});
    }

    
    $(document).bind('data:history',function(e,data) {

	var r = svg.selectAll("rect.timer").data(d3.entries(data),function(d) { return d.key; });
	r.enter().append("rect").attr({
	    class:"timer",
	    width:w,
	}).call(position).style({opacity:0}).transition().style({opacity:1});
	r.transition().duration(100).call(position);
//	r.exit().remove();
    });


});