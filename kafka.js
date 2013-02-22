var Kafka = require('franz-kafka');
  
module.exports = function() {
    return new Kafka({
	brokers:[{
	    id: 0,
	    host: 'localhost',
	    port: 9092
	}],
	paritions:{
	    produce:['0:1']
	},
	compression:'none',
	queueTime: 100,
	batchSize: 20,
	logger: console
    });
}