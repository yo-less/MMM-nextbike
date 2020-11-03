/* Magic Mirror
 * Module: MMM-nextbike
 *
 * By yo-less
 * MIT Licensed.
 */

Module.register("MMM-nextbike", {
  defaults: {
    apiBase: "http://api.nextbike.net/maps/nextbike-official.xml",
    cityId: "1",
    stations: [{ id: "16337", name: "nextbike" }],
    reload: 1 * 60 * 1000, // every minute
    showHeader: true
  },

  getTranslations: function () {
    return {
      en: "translations/en.json",
      es: "translations/es.json",
      de: "translations/de.json"
    };
  },

  getStyles: function () {
    return ["MMM-nextbike.css", "font-awesome.css"];
  },

  start: function () {
    var self = this;
    Log.info("Starting module: " + this.name);
    this.sendSocketNotification("CONFIG", this.config);
    setInterval(function () {
      self.sendSocketNotification("CONFIG", self.config);
    }, this.config.reload);
  },

  socketNotificationReceived: function (notification, payload) {
    if (notification === "BIKES" + this.config.cityId) {
      this.nextbikeData = payload;
      this.updateDom();
    }
  },

  getDom: function () {
    // Auto-create MagicMirror header
    var wrapper = document.createElement("div");

    if (!!this.nextbikeData && !!this.config.showHeader) {
      var header = document.createElement("header");
      var headerLabel =
        (this.nextbikeData && this.nextbikeData.name) || "Nextbike";
      header.innerHTML = `<i class="fas fa-bicycle"></i> ${headerLabel}`;
      wrapper.appendChild(header);
    }

    // Loading data notification
    if (!this.nextbikeData) {
      var text = document.createElement("div");
      text.innerHTML = this.translate("LOADING");
      text.className = "small dimmed";
      wrapper.appendChild(text);
    } else {
      // Create stations list
      var stationsList = document.createElement("ul");
      stationsList.className = "small stationsList";

      this.nextbikeData.stations.forEach((station) => {
        var stationConfig = this.getStationConfig(station);
        var stationElement = document.createElement("li");
        stationElement.className = "stationElement";

        var stationName = document.createElement("span");
        stationName.className = "stationLabel dimmed";
        stationName.innerHTML = `<span class="stationName">${stationConfig.name}</span> `;
        stationElement.appendChild(stationName);

        var stationInfo = document.createElement("span");
        stationInfo.className = "stationInfo";
        if (!station.$.bike_numbers) {
          stationInfo.innerHTML = this.translate("NO-BIKES-AVAILABLE");
        } else {
          stationInfo.innerHTML = `<span class="available-bikes">${station.$.bikes}</span> / <span class="total-bikes">${station.$.bike_racks}</span>`;
        }
        stationElement.appendChild(stationInfo);
        stationsList.appendChild(stationElement);
      });

      wrapper.appendChild(stationsList);
    }
    return wrapper;
  },

  getStationConfig: function (station) {
    return this.config.stations.find((config) => config.id == station.$.uid);
  }
});
