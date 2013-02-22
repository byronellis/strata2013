$(function() {
    var stream = new EventSource("/consumer");
    stream.addEventListener("message",function(e) {
	var data = e.data;
	try{ 
	    data = JSON.parse(data);
	    if(data.SPEAKER && data.LINE) {
		$('#timestamp').html(""+(new Date(data.TIMESTAMP)));
		$('#speaker').html(data.SPEAKER);
		$('#line').html(data.LINE);
	    }
	} catch(e) { console.log(e); }
    });
});