var http    = require('http')
,   connect = require('connect')
,   pubsub  = require('redis').createClient();

var subscribers = {};
pubsub.on('message',function(channel,payload) {
    if(subscribers[channel]) subscribers[channel](channel,payload); 
});
function ticker2(req,res) {
    var channel = "ticker";
    req.socket.setTimeout(Infinity);
    res.writeHead(200,{
	'Content-Type':'text/event-stream',
	'Cache-Control':'no-cache',
	'Connection':'keepalive'
    });
    res.json = function(obj) { res.write("data: "+obj+"\n\n"); }
    res.json(JSON.stringify({}));
    res.on('close',function() { pubsub.unsubscribe(channel); });
    subscribers[channel] = function(channel,payload) {
	var second = Math.floor((new Date().getTime())/1000) % 60;
	var x = {};
	x[second] = JSON.parse(payload);
	res.json(JSON.stringify({history:x}));
    }
    pubsub.subscribe('ticker');
}


function ticker(req,res) {
    req.socket.setTimeout(Infinity);
    res.writeHead(200,{
	'Content-Type':'text/event-stream',
	'Cache-Control':'no-cache',
	'Connection':'keepalive'
    });
    res.message = function(msg,event) {
	if(event)
	    res.write('event: '+event+'\n');
	res.write('data: '+msg+'\n\n');
    }
    res.json = function(obj,event) {
	this.message(JSON.stringify(obj),event);
    };
    setInterval(function() {
	var second = Math.floor((new Date().getTime())/1000) % 60;
	var x = {};
	x[second]  = 2000*Math.random();
	res.json({history:x});
    },500);
}


connect()
    .use(connect.static(__dirname))
    .use(function(req,res) {
	if(req.url == '/ticker') {
	    ticker(req,res);
	} else if(req.url == '/ticker2') {
	    ticker2(req,res);
	}
    })
    .listen(9000);