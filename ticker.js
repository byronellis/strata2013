var R = require('redis').createClient();
setInterval(function() {
    var second = Math.floor((new Date().getTime())/1000) % 60;
    var x = {};
    x[second] = {x:Math.random(),y:Math.random(),r:Math.random()};
    R.publish("ticker",JSON.stringify({ticker:x}));
},500);