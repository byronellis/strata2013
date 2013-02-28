var http    = require('http')
,   connect = require('connect')
,   kafka   = require('kafka')
,   pubsub  = require('redis').createClient()
,   redis   = require('redis').createClient();

var subs = {};
pubsub.on('message',function(channel,message) {
    if(subs[channel])
	subs[channel](message);
});

function deep(data) {
    var dict = {};
    for(var i=0;i<data.length;i+=2) {
	var keys = data[i].split(":");
	var x    = dict;
	for(var j=0;j<keys.length-1;j++) {
	    if(!x[keys[j]]) x[keys[j]] = {};
	    x = x[keys[j]];
	}
	x[keys[keys.length-1]] = 1*data[i+1];
    }
}

function top100(data) {
    var keys = [];
    for(var i in data) keys.push(i);
    keys.sort(function(a,b) { return 1*data[b]-1*data[a]; });
    console.log(keys.length+" total values");
    var l = keys.length > 100 ? 100 : keys.length;
    var dict = {};
    for(var i=0;i<l;i++) {
	dict[keys[i]] = 1*data[keys[i]];
    }
    return dict;
}

function words(req,res) {
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
    redis.hgetall("WordCount",function(err,data) {
	if(data != null) {
	    res.json(top100(data));
	}
	subs['WordCount'] = function(message) {
	    console.log("update");
	    redis.hgetall("WordCount",function(err,data) {
		if(data != null) {
		    res.json(top100(data));
		}
	    });
	};
	pubsub.subscribe("WordCount");
    });
    

}

function speaker(req,res) {
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
    redis.hgetall("speaker",function(err,data) {
	res.json(deep(data));
	subs['speaker'] = function(message) {
	    redis.hgetall("speaker",function(err,data) {
		res.json({speaker:dict(data)});
	    });
	};
	pubsub.subscribe("speaker");
    });
    

}

function consumer(req,res) {

	console.log("Subscribing to topic");
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

    var consumer = new kafka.Consumer()
	.on('message',function(topic,message,offset) {
	    res.message(message);
	})
	.on('lastmessage',function(topic,offset) {
	    consumer.fetchTopic({name:topic,offset:offset});
	})
	.on('lastoffset',function(topic,offset) {
	    consumer.fetchTopic({name:topic,offset:offset});
	})
	.connect(function() {
	    console.log("connected");
	    consumer.fetchOffsets('hamlet');
	});
}


connect()
    .use(connect.static(__dirname))
    .use(function(req,res) {
	if(req.url == '/consumer') {
	    consumer(req,res);
	} else if(req.url == '/words') {
	    words(req,res);
	} else if(req.url == '/speaker') {
	    speaker(req,res);
	}
    })
    .listen(9000);