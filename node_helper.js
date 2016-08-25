/* Magic Mirror
 * Module: MMM-KVV
 *
 * By yo-less
 * MIT Licensed.
 */

var parseString = require('xml2js').parseString;
const request = require('request');
const NodeHelper = require("node_helper");



module.exports = NodeHelper.create({

    start: function() {
        console.log("Starting modules: " + this.name);
    },

	
	/* getParams
	 * Generates an url with api parameters based on the config.
	 *
	 * return String - URL params.
	 */
	
	getParams: function() {
			var params = "?city=";
			params += this.config.cityID;
			params += "&place=";
			params += this.config.stationID;
			return params;
	},
	
    socketNotificationReceived: function(notification, payload) {
        if(notification === 'CONFIG'){
            this.config = payload;
			var nextbike_url = this.config.apiBase + this.getParams();
			this.getData(nextbike_url, this.config.stationID);
        }
    },

	parseData: function(input) {
				var nextbikeData = "";
				parseString(input, function (err, result) {
				nextbikeData = JSON.parse(JSON.stringify(result));
				});
				return nextbikeData;
	},
	
	
    getData: function(options, stationID) {
		request(options, (error, response, body) => {
	        if (response.statusCode === 200) {
				this.sendSocketNotification("BIKES" + stationID, this.parseData(body));
				} else {
                console.log("Error getting nextbike data " + response.statusCode);
            }
        });
    }
});