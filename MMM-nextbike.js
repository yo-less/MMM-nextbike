/* Magic Mirror
 * Module: MMM-nextbike
 *
 * By yo-less
 * MIT Licensed.
 */

Module.register("MMM-nextbike", {
  defaults: {
    apiBase: "http://api.nextbike.net/maps/nextbike-official.xml",
    cityID: 1,
    stationID: 16337,
    stationName: "nextbike",
    showBikes: true,
    nob: "",
    reload: 1 * 60 * 1000 // every minute
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
    if (notification === "BIKES" + this.config.stationID) {
      this.nextbikeData = payload.markers.country[0].city[0].place[0].$;
      this.config.stationName = this.nextbikeData.name;
      this.updateDom();
    }
  },

  getDom: function () {
    // Auto-create MagicMirror header

    var wrapper = document.createElement("div");
    var header = document.createElement("header");
    if (this.config.stationName !== "nextbike") {
      header.innerHTML = this.config.stationName;
    } else {
      header.innerHTML = this.config.stationName;
    }
    wrapper.appendChild(header);

    // Loading data notification

    if (!this.nextbikeData) {
      var text = document.createElement("div");
      text.innerHTML = this.translate("LOADING");
      text.className = "small dimmed";
      wrapper.appendChild(text);
    } else {
      // Create bike table once data is received

      var table = document.createElement("table");
      table.classList.add("small", "table");
      table.border = "0";
      table.appendChild(this.createSpacerRow());
      table.appendChild(this.createAmountRow());
      table.appendChild(this.createSpacerRow());

      // List available bikes via a bike array

      if (this.config.showBikes) {
        // Make sure user wants to see the bikes

        if (!this.nextbikeData.bike_numbers) {
          this.hide(10000);
        } else {
          if (this.hidden) {
            this.show(5000);
          }

          var bikeArray = this.nextbikeData.bike_numbers.split(",");
          if (!this.config.nob) {
            this.config.nob = 100;
          }
          for (var i = 0; i < bikeArray.length && i < this.config.nob; i++) {
            var bikeNumber = bikeArray[i];
            table.appendChild(this.createDataRow(bikeNumber));
          }
        }
      }

      wrapper.appendChild(table);
    }

    return wrapper;
  },

  createSpacerRow: function () {
    var spacerRow = document.createElement("tr");

    var spacerHeader = document.createElement("td");
    spacerHeader.className = "spacerRow";
    spacerHeader.setAttribute("colSpan", "2");
    spacerHeader.innerHTML = "";
    spacerRow.appendChild(spacerHeader);

    return spacerRow;
  },

  createAmountRow: function () {
    var amountRow = document.createElement("tr");

    var amount = document.createElement("td");
    amount.className = "amountRow";
    amount.setAttribute("colSpan", "2");
    if (!this.nextbikeData.bike_numbers) {
      amount.innerHTML = this.translate("NO-BIKES-AVAILABLE");
    } else {
      amount.innerHTML =
        this.translate("BIKES-AVAILABLE") + " " + this.nextbikeData.bikes;
    }
    amountRow.appendChild(amount);

    return amountRow;
  },

  createDataRow: function (data) {
    var row = document.createElement("tr");

    var symbol = document.createElement("td");
    symbol.setAttribute("width", "8px");
    symbol.className = "fa fa-bicycle";
    row.appendChild(symbol);

    var bikeNo = document.createElement("td");
    bikeNo.className = "bikeNo";
    bikeNo.innerHTML = data;

    row.appendChild(bikeNo);

    return row;
  }
});
