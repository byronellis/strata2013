(function($) {
    var words  = d3.select('div#words').append("svg").attr({width: 700,height:300}).append("g").attr({transform:"translate(350,150)"});
    var layout = d3.layout.cloud()
	.size([700,300])
	.rotate(0)
	.font('Helvetica')
	.fontSize(function(d) { return d.size; })
	.on("end",function(data) {
	    var w = words.selectAll("text.word").data(data,function(d) { return d.text; })
	    w.enter().append("text").attr("class","word").style({
		"font-size":function(d) { return d.size+"px"; },
	    })
		.attr("transform",function(d) { return "translate("+[d.x,d.y]+")rotate("+d.rotate+")"; })
		.text(function(d) { return d.text; })
		.on('click',function(d) {window.location = '/search?q='+d.text;});
	    w.transition()
		.style("font-size",function(d) { return d.size+"px"; })
		.attr("transform",function(d) { return "translate("+[d.x,d.y]+")rotate("+d.rotate+")"; });
	    w.exit().remove();
	})
	.start();

    var stream = new EventSource("/words");
    stream.addEventListener("message",function(e) {
	var data = e.data;
	try{ 
	    data = d3.entries(JSON.parse(data));
	    var  max = d3.max(data,function(d) { return d.value; });
	    console.log(max);
	    layout.words(data.map(function(d) { return {text:d.key,size:10+45*d.value/max }})).start();
	} catch(e) { console.log(e); }
    });    
})(jQuery);