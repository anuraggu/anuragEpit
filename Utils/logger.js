module.exports = {
	errorLogger : function(message, data) {
		console.log('\x1b[31m'+'\r++++++++++++++++'+message+'+++++++++++++\n\r'+JSON.stringify(data));
	},
	successLogger: function(message, data){
		console.log('\x1b[32m'+'\r++++++++++++++++'+message+'+++++++++++++\n\r');
	}
}
