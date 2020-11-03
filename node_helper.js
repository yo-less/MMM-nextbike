/* Magic Mirror
 * Module: MMM-KVV
 *
 * By yo-less
 * MIT Licensed.
 */

var parseString = require("xml2js").parseString;
const request = require("request");
const NodeHelper = require("node_helper");

module.exports = NodeHelper.create({
  start: function () {
    console.log("Starting node helper for: " + this.name);
  },

  /* getParams
   * Generates an url with api parameters based on the config.
   *
   * return String - URL params.
   */

  getParams: function () {
    var params = "?city=";
    params += this.config.cityId;
    return params;
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "CONFIG") {
      this.config = payload;
      var nextbike_url = this.config.apiBase + this.getParams();
      this.getData(nextbike_url, this.config.cityId);
    }
  },

  parseData: function (input) {
    var nextbikeData = "";
    parseString(input, function (err, result) {
      nextbikeData = JSON.parse(JSON.stringify(result));
	});
	var stations = nextbikeData.markers.country[0].city[0].place;
	var stationIds = this.config.stations.map(station => station.id);
	return stations.filter(station => stationIds.includes(station.$.uid));
  },

  getData: function (options, cityId) {
    request(options, (error, response, body) => {
      if (response.statusCode === 200) {
        this.sendSocketNotification("BIKES" + cityId, this.parseData(body));
      } else {
        console.log("Error getting nextbike data " + response.statusCode);
      }
    });
  }
});
