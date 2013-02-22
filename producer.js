var X = require('node-xml')
,   kafka = require('kafka');

var producer = new kafka.Producer({topic:'hamlet'}).connect(function() {
    function send(i,line) {
	setTimeout(function() { 
	    line.TIMESTAMP = (new Date().getTime());
	    producer.send(JSON.stringify(line));
	},1000*i + Math.floor(300*Math.random()));
    }
    
    var parser = new X.SaxParser(function(c) { 
	var i    = 0;
	var line = {};
	var field = [];
	c.onStartElementNS(function(e) {
	    field.push(e);
	    switch(e) {
	    case 'SPEECH':
		line = {};
		break;
	    }
	});
	c.onEndElementNS(function(e) {
	    field.pop();
	    switch(e) {
	    case 'SPEECH':
		delete line['SPEECH'];
		delete line['SCENE'];
		send(i++,line);
		break;
	    }
	});
	c.onCharacters(function(e) {
	    line[field[field.length-1]] = (line[field[field.length-1]]||"") + e;
	});
    });
    parser.parseFile("hamlet.xml");
});