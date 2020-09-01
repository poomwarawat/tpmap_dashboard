class TPMAP {
  constructor(
    ind,
    order,
    state,
    code_id = null,
    mapFiler = "คน|นักเรียน|สูงอายุ"
  ) {
    this.lat = 13.553576;
    this.lng = 101.683202;
    this.zoom = 6;
    this.ind = ind;
    this.orderState = order;
    this.mymap = null;
    this.layermap = null;
    this.coordinates = null;
    this.problem = null;
    this.order = null;
    this.poor = null;
    this.max = null;
    this.state = state;
    this.code_id = code_id;
    this.centroid = null;
    this.marker = null;
    this.baseMaps = null;
    this.e3 = null;
    this.e4 = null;
    this.e5 = null;
    this.mapFiler = mapFiler;
  }
  async main() {
    const Country = await new MapData(
      this.state,
      this.code_id,
      this.orderState,
      this.ind
    );
    const CountryCoordinate = await Country.getCoordinate();
    const CountryProblem = await Country.getProblem();
    const CountryOrder = await Country.getOrder();
    const CountryPoor = await Country.getPoor();
    const CountryMax = await Country.getMax(this.ind);
    const CountryMarker = await Country.getMarker();
    Promise.all([
      CountryCoordinate,
      CountryProblem,
      CountryOrder,
      CountryPoor,
      CountryMax,
      CountryMarker,
    ]).then((value) => {
      this.coordinates = value[0];
      this.problem = value[1];
      this.order = value[2];
      this.poor = value[3];
      this.max = value[4];
      this.marker = value[5];
      this.centroid = null;
      // this.createMap();
      // this.createProblem();
      // this.loadGraph();
      // this.createProvinceSelecter();
      // this.createMaker();
      // this.createNewMarker();
      if (this.state === "amphur") {
        this.removeSelecter("select_amphur");
        this.createAmphurSelecter();
        const centroid = Country.getCentroid();
        this.centroid = centroid;
        this.flyMap();
      } else if (this.state === "tambol") {
        const centroid = Country.getCentroid();
        this.removeSelecter("select_tambol");
        this.createTambolSelecter();
        this.centroid = centroid;
        this.flyMap();
      } else if (this.state === "village") {
        const centroid = Country.getCentroid();
        this.centroid = centroid;
        this.flyMap();
      } else if (this.state === "province") {
        this.removeSelecter("select_province");
        this.createProvinceSelecter();
      }
    });
  }
  // createNewMarker() {}
  createProvinceSelecter() {
    try {
      if (this.state === "province") {
        const select_province = document.getElementById("select_province");
        const option = document.createElement("option");
        option.innerHTML = "กรุณาเลือกจังหวัด";
        option.value = 0;
        select_province.appendChild(option);
        this.poor.map((data) => {
          let name;
          const option = document.createElement("option");
          name = this.coordinates.find(
            (prov) =>
              parseInt(prov["properties"]["PV_CODE"]) ===
              parseInt(data["province_ID"])
          );
          name = name["properties"]["PV_TN"];
          option.innerHTML = name;
          option.value = data["province_ID"];
          select_province.appendChild(option);
        });
      }
    } catch (error) {}
  }
  createAmphurSelecter() {
    try {
      if (this.state === "amphur") {
        const select_amphur = document.getElementById("select_amphur");
        const option = document.createElement("option");
        option.innerHTML = "กรุณาเลือกอำเภอ";
        option.value = 0;
        select_amphur.appendChild(option);
        this.poor.map((data) => {
          let name;
          const option = document.createElement("option");
          name = this.coordinates.find(
            (amp) => amp["properties"]["AP_CODE"] === data["amphur_ID"]
          );
          name = name["properties"]["AP_TN"];
          option.innerHTML = name;
          option.value = data["amphur_ID"];
          select_amphur.appendChild(option);
        });
      }
    } catch (error) {}
  }
  createTambolSelecter() {
    try {
      if (this.state === "tambol") {
        const select_tambol = document.getElementById("select_tambol");
        const option = document.createElement("option");
        option.innerHTML = "กรุณาเลือกตำบล";
        option.value = 0;
        select_tambol.appendChild(option);
        this.poor.map((data) => {
          let name;
          const option = document.createElement("option");
          name = this.coordinates.find(
            (tam) =>
              parseInt(tam["properties"]["TAM_CODE"]) ===
              parseInt(data["tambol_ID"])
          );
          if (name !== undefined) {
            name = name["properties"]["T_NAME_T"];
            option.innerHTML = name;
            option.value = data["tambol_ID"];
            select_tambol.appendChild(option);
          } else {
            name = data["tambol_ID"];
            option.innerHTML = name;
            option.value = data["tambol_ID"];
            select_tambol.appendChild(option);
          }
        });
      }
    } catch (error) {}
  }
  removeSelecter(state) {
    try {
      const select_amphur = document.getElementById(state);
      let child = select_amphur.lastElementChild;
      while (child) {
        select_amphur.removeChild(child);
        child = select_amphur.lastElementChild;
      }
    } catch (error) {}
  }
  loadGraph() {
    try {
      const graphData = [];
      for (let index = 0; index < this.order.length; index++) {
        const data = this.order[index];
        let code;
        let name;
        if (this.state === "province") {
          code = data["province_ID"];
          name = this.coordinates.find(
            (prov) => parseInt(prov["properties"]["PV_CODE"]) === parseInt(code)
          );
          name = name["properties"]["PV_TN"];
        } else if (this.state === "amphur") {
          code = data["amphur_ID"];
          name = this.coordinates.find(
            (amp) => parseInt(amp["properties"]["AP_CODE"]) === parseInt(code)
          );
          name = name["properties"]["AP_TN"];
        } else if (this.state === "tambol") {
          code = data["tambol_ID"];
          name = this.coordinates.find(
            (tam) => parseInt(tam["properties"]["TAM_CODE"]) === parseInt(code)
          );
          if (name !== undefined) {
            name = name["properties"]["T_NAME_T"];
          } else {
            name = code;
          }
        } else if (this.state === "village") {
          name = data["village_name"];
        }
        let score = data["poor"]["JPT"]["MOFval"]["CNT"];
        if (this.ind !== 0) {
          score = data["poor"]["JPT"]["MOFval"][`ind${this.ind}`]["CNT"];
        }
        const insertdata = {
          year: name,
          income: score,
        };
        graphData.push(insertdata);
      }
      this.createGraph(graphData);
    } catch (error) {}
  }
  createGraph(graphData) {
    try {
      am4core.ready(function () {
        am4core.useTheme(am4themes_animated);

        var chart = am4core.create("ordergraph", am4charts.XYChart);

        chart.data = graphData;

        var categoryAxis = chart.yAxes.push(new am4charts.CategoryAxis());
        categoryAxis.dataFields.category = "year";
        categoryAxis.numberFormatter.numberFormat = "#";
        categoryAxis.renderer.inversed = true;
        categoryAxis.renderer.grid.template.location = 0;
        categoryAxis.renderer.cellStartLocation = 0.1;
        categoryAxis.renderer.cellEndLocation = 0.9;

        var valueAxis = chart.xAxes.push(new am4charts.ValueAxis());
        valueAxis.renderer.opposite = true;

        function createSeries(field, name) {
          var series = chart.series.push(new am4charts.ColumnSeries());
          series.dataFields.valueX = field;
          series.dataFields.categoryY = "year";
          series.name = name;
          series.columns.template.tooltipText = "จำนวน : [bold]{valueX}[/]";
          series.columns.template.height = am4core.percent(100);
          series.sequencedInterpolation = true;

          var valueLabel = series.bullets.push(new am4charts.LabelBullet());
          valueLabel.label.text = "{valueX}";
          valueLabel.label.horizontalCenter = "left";
          valueLabel.label.dx = 10;
          valueLabel.label.hideOversized = false;
          valueLabel.label.truncate = false;

          var categoryLabel = series.bullets.push(new am4charts.LabelBullet());
          categoryLabel.label.horizontalCenter = "right";
          categoryLabel.label.dx = -10;
          categoryLabel.label.fill = am4core.color("#fff");
          categoryLabel.label.hideOversized = false;
          categoryLabel.label.truncate = false;
        }

        createSeries("income", "Income");
      });
    } catch (error) {}
  }
  createProblem() {
    try {
      const all = document.getElementById("allproblem");
      const Health = document.getElementById("healthproblem");
      const Living = document.getElementById("livingproblem");
      const Education = document.getElementById("educationproblem");
      const Income = document.getElementById("incomeproblem");
      const Accessibility = document.getElementById("accessibilityproblem");
      const {
        CNT,
        health,
        living,
        education,
        income,
        accessibility,
      } = this.problem["poor"]["JPT"]["MOFval"];
      all.innerHTML =
        CNT.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " คน";
      Health.innerHTML =
        health.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " คน";
      Living.innerHTML =
        living.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " คน";
      Education.innerHTML =
        education.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " คน";
      Income.innerHTML =
        income.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " คน";
      Accessibility.innerHTML =
        accessibility.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " คน";
    } catch (error) {}
  }
  createMap() {
    try {
      const coordinates = this.coordinates;
      const loader = document.getElementById("loader");
      loader.style.display = "none";
      for (let index = 0; index < coordinates.length; index++) {
        const coordinate = coordinates[index];
        let code;
        let score;
        if (this.state === "province") {
          code = coordinate["properties"]["PV_CODE"];
          score = this.poor.find(
            (data) => parseInt(data["province_ID"]) === parseInt(code)
          );
        } else if (this.state === "amphur") {
          code = coordinate["properties"]["AP_CODE"];
          score = this.poor.find(
            (data) => parseInt(data["amphur_ID"]) === parseInt(code)
          );
        } else if (this.state === "tambol") {
          code = coordinate["properties"]["TAM_CODE"];
          score = this.poor.find(
            (data) => parseInt(data["tambol_ID"]) === parseInt(code)
          );
        }
        if (score !== undefined && this.ind === 0) {
          score = score["poor"]["JPT"]["MOFval"]["CNT"];
        } else if (score !== undefined && this.ind > 0) {
          score = score["poor"]["JPT"]["MOFval"][`ind${this.ind}`]["CNT"];
        }
        const color = this.createColorMap(score);
        this.layermap = L.geoJSON(coordinate, {
          style: function () {
            return {
              fillColor: `${color}`,
              weight: 2,
              opacity: 1,
              color: "#333333",
              fillOpacity: 0.65,
            };
          },
        }).addTo(this.mymap);
        this.layermap.on("mouseover", (e) => {
          const layer = e.target;
          let name;
          if (this.state === "province") {
            name = coordinate["properties"]["PV_TN"];
          } else if (this.state === "amphur") {
            name = coordinate["properties"]["AP_TN"];
          } else if (this.state === "tambol" || this.state === "village") {
            name = coordinate["properties"]["T_NAME_T"];
          }
          layer.bindPopup(`<b>${name}</b>`).openPopup();
          layer.setStyle({
            fillColor: `${color}`,
            weight: 2,
            opacity: 1,
            color: "#333333",
            fillOpacity: 1,
          });
        });
        this.layermap.on("mouseout", (e) => {
          const layer = e.target;
          layer.resetStyle();
          this.mymap.closePopup();
        });
      }
    } catch (error) {
      this.createErrorMessage("เกิดข้อผิดพลาด : ไม่พบข้อมูลที่ท่านต้องการ");
    }
  }
  createErrorMessage(message) {
    try {
      const error = document.getElementById("error");
      const error_message = document.getElementById("error_message");
      error.style.display = "block";
      error_message.innerHTML = message;
      setTimeout(() => {
        error.style.display = "none";
      }, 3000);
    } catch (error) {}
  }
  createColorMap(score) {
    try {
      let max = this.max["poor"]["JPT"]["MOFval"]["CNT"];
      if (this.ind > 0) {
        max = this.max["poor"]["JPT"]["MOFval"][`ind${this.ind}`]["CNT"];
        if (parseInt(max) === 0) {
          return "#FED976";
        }
      }
      const percentage = (score * 100) / max;
      let COLOR;
      if (percentage >= 0 && percentage <= 20) {
        COLOR = "#FED976";
      } else if (percentage > 20 && percentage <= 40) {
        COLOR = "#FEB24C";
      } else if (percentage > 40 && percentage <= 60) {
        COLOR = "#FD8D3C";
      } else if (percentage > 60 && percentage <= 80) {
        COLOR = "#FC4E2A";
      } else if (percentage > 80) {
        COLOR = "#BD0026";
      } else {
        COLOR = "#FED976";
      }
      return COLOR;
    } catch (error) {}
  }
  removeLayer() {
    try {
      const layer = this.mymap._layers;
      const LayerKey = Object.keys(layer);
      for (let index = 0; index < LayerKey.length; index++) {
        this.mymap.removeLayer(layer[LayerKey[index]]);
      }
    } catch (err) {
      err;
    }
  }
  async flyMap() {
    try {
      let centroid = await this.centroid;
      let zoom = 9;
      centroid = centroid["geometry"]["coordinates"];
      if (this.state === "tambol") {
        zoom = 10;
      } else if (this.state === "village") {
        zoom = 12;
      }
      setTimeout(() => {
        this.mymap.flyTo([centroid[1], centroid[0]], zoom);
      }, 300);
    } catch (error) {}
  }
  fetchNewMarker() {
    return new Promise((resolve, reject) => {
      try {
        fetch(
          `https://api.logbook.emenscr.in.th/emenscr/getApprovedProjects?Y=3&search=${this.mapFiler}`,
          {
            method: "GET",
            rejectUnauthorized: true,
          }
        )
          .then((res) => res.json())
          .then((res) => resolve(res.data));
      } catch (error) {
        reject(error);
      }
    });
  }
  fetchNewMarker2() {
    return new Promise((resolve, reject) => {
      try {
        fetch(
          `https://api.logbook.emenscr.in.th/emenscr/getApprovedProjects?Y=4&search=${this.mapFiler}`,
          {
            method: "GET",
            rejectUnauthorized: true,
          }
        )
          .then((res) => res.json())
          .then((res) => resolve(res.data));
      } catch (error) {
        reject(error);
      }
    });
  }
  async loadBaseMap() {
    try {
      this.mymap = L.map("mapid").setView([this.lat, this.lng], this.zoom);
      L.tileLayer(
        "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
        {
          attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
          maxZoom: 18,
          id: "mapbox/light-v10",
          tileSize: 512,
          zoomOffset: -1,
          accessToken:
            "pk.eyJ1Ijoid2FyYXdhdCIsImEiOiJja2J3ZXdlejQwOHl0MnpuYWJ6OXpsYmNpIn0.r3XzLHziEuUpsPtKXwYjJg",
        }
      ).addTo(this.mymap);
      var scale = L.control.scale(); // Creating scale control
      scale.addTo(this.mymap); // Adding scale control to the map
      var Icon = L.icon({
        iconUrl:
          "https://cdn0.iconfinder.com/data/icons/small-n-flat/24/678111-map-marker-512.png",
        iconSize: [25, 25], // size of the icon
        shadowSize: [20, 30], // size of the shadow
        iconAnchor: [17, 25], // point of the icon which will correspond to marker's location
        shadowAnchor: [4, 62], // the same for the shadow
        popupAnchor: [-3, -40], // point from which the popup should open relative to the iconAnchor
      });
      const Marker = await this.fetchNewMarker();
      const Marker2 = await this.fetchNewMarker2();
      const MarkerArray = [];
      const MarkerArray2 = [];
      for (let index = 0; index < Marker.length; index++) {
        const point = Marker[index];
        const { latitude, longitude } = point.area_geo;
        const name = point.name;

        let marker = new L.marker([latitude, longitude], {
          icon: Icon,
        });
        //.bindPopup(`ชื่อโครงการ : ${name}`);
        marker.on("mouseover", (e) => {
          marker.bindPopup(`<b>ชื่อโครงการ : ${name}</b><br>`).openPopup();
        });
        marker.on("mouseout", (e) => {
          marker.closePopup();
        });

        MarkerArray.push(marker);
      }
      for (let index = 0; index < Marker2.length; index++) {
        const point = Marker2[index];
        const { latitude, longitude } = point.area_geo;
        const name = point.name;

        let marker = new L.marker([latitude, longitude], {
          icon: Icon,
        });
        //.bindPopup(`ชื่อโครงการ : ${name}`);
        marker.on("mouseover", (e) => {
          marker.bindPopup(`<b>ชื่อโครงการ : ${name}</b><br>`).openPopup();
        });
        marker.on("mouseout", (e) => {
          marker.closePopup();
        });

        MarkerArray2.push(marker);
      }
      var cities = L.layerGroup(MarkerArray);
      var cities2 = L.layerGroup(MarkerArray2);
      var grayscale = L.tileLayer(
          "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
          {
            attribution:
              'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: "mapbox/light-v10",
            tileSize: 512,
            zoomOffset: -1,
            accessToken:
              "pk.eyJ1Ijoid2FyYXdhdCIsImEiOiJja2J3ZXdlejQwOHl0MnpuYWJ6OXpsYmNpIn0.r3XzLHziEuUpsPtKXwYjJg",
          }
        ),
        streets = L.tileLayer(
          "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
          {
            attribution:
              'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            id: "mapbox/streets-v11",
            tileSize: 512,
            zoomOffset: -1,
            accessToken:
              "pk.eyJ1Ijoid2FyYXdhdCIsImEiOiJja2J3ZXdlejQwOHl0MnpuYWJ6OXpsYmNpIn0.r3XzLHziEuUpsPtKXwYjJg",
          }
        );

      var baseMaps = {
        Grayscale: grayscale,
        Streets: streets,
      };
      this.baseMaps = baseMaps;
      this.e3 = cities;
      this.e4 = cities2;
    } catch (error) {
      console.log(error);
    }
  }
  createMaker() {
    if (this.state === "province") {
      const MarkerArray = [];
      this.marker.map(async (data, index) => {
        const Location = new MapData("amphur", data["_id"]);
        var location = await Location.getCentroid();
        let name = location["properties"]["PV_TN"];
        location = location["geometry"]["coordinates"];
        //{ icon: Icon }
        // var marker = L.marker([location[1], location[0]]); // .addTo(this.mymap);
        let marker = new L.marker([location[1], location[0]]);
        // console.log(marker);
        marker.on("mouseover", (e) => {
          marker
            .bindPopup(`<b>${name} มีจำนวน ${data["count"]} ครัวเรือน</b><br>`)
            .openPopup();
        });
        marker.on("mouseout", (e) => {
          marker.closePopup();
        });

        const icon = marker.options.icon;
        icon.options.iconSize = [17, 25];
        icon.options.iconAnchor = [17, 25];
        icon.options.shadowSize = [20, 30];
        marker.setIcon(icon);
        MarkerArray.push(marker);
        if (index === this.marker.length - 1) {
          let Default = L.layerGroup(MarkerArray);
          // console.log(Default);
          let overlayMaps = {
            Default: Default,
            E3: this.e3,
            E4: this.e4,
          };
          Default.addTo(this.mymap);
          if (this.mapFiler !== "คน|นักเรียน|สูงอายุ") {
            this.e3.addTo(this.mymap);
            const map_controller = document.getElementById("map_controller");
            // const box_filter = document.getElementById("box_filter");
            map_controller.style.display = "block";
            // box_filter.style.display = "ิblock";
          }
          L.control.layers(this.baseMaps, overlayMaps).addTo(this.mymap);
          this.mymap.on("overlayadd", function (e) {
            if (e.name === "E3" || e.name === "E4") {
              const map_controller = document.getElementById("map_controller");
              map_controller.style.display = "block";
            }
          });
          this.mymap.on("overlayremove", function (e) {
            if (e.name === "E3" || e.name === "E4") {
              const map_controller = document.getElementById("map_controller");
              map_controller.style.display = "none";
            }
          });
        }
      });
    } else if (this.state === "amphur") {
      const MarkerArray = [];
      this.marker.map(async (data, index) => {
        const location = data["geometry"]["coordinates"];
        //var marker = L.marker([location[1], location[0]]); // .addTo(this.mymap);
        let marker = new L.marker([location[1], location[0]]);
        marker.on("mouseover", (e) => {
          marker
            .bindPopup(
              `<b>House ID : ${data["properties"]["house_ID"]}</b><br>`
            )
            .openPopup();
        });
        marker.on("mouseout", (e) => {
          marker.closePopup();
        });
        MarkerArray.push(marker);
        const icon = marker.options.icon;
        icon.options.iconSize = [17, 25];
        icon.options.iconAnchor = [17, 25];
        icon.options.shadowSize = [20, 30];
        marker.setIcon(icon);
        MarkerArray.push(marker);
      });
      let Default = L.layerGroup(MarkerArray);
      let overlayMaps = {
        Default: Default,
        E3: this.e3,
        E4: this.e4,
      };
      Default.addTo(this.mymap);
      if (this.mapFiler !== "คน|นักเรียน|สูงอายุ") {
        this.e3.addTo(this.mymap);
        const map_controller = document.getElementById("map_controller");
        // const box_filter = document.getElementById("box_filter");
        map_controller.style.display = "block";
        // box_filter.style.display = "ิblock";
      }
      L.control.layers(this.baseMaps, overlayMaps).addTo(this.mymap);
      this.mymap.on("overlayadd", function (e) {
        if (e.name === "E3" || e.name === "E4") {
          const map_controller = document.getElementById("map_controller");
          map_controller.style.display = "block";
        }
      });
      this.mymap.on("overlayremove", function (e) {
        if (e.name === "E3" || e.name === "E4") {
          const map_controller = document.getElementById("map_controller");
          map_controller.style.display = "none";
        }
      });
    } else if (this.state === "tambol") {
      const MarkerArray = [];
      this.marker.map(async (data, index) => {
        const location = data["geometry"]["coordinates"];
        // var marker = L.marker([location[1], location[0]]); // .addTo(this.mymap);
        let marker = new L.marker([location[1], location[0]]);
        marker.on("mouseover", (e) => {
          marker
            .bindPopup(
              `<b>House ID : ${data["properties"]["house_ID"]}</b><br>`
            )
            .openPopup();
        });
        marker.on("mouseout", (e) => {
          marker.closePopup();
        });
        MarkerArray.push(marker);
        const icon = marker.options.icon;
        icon.options.iconSize = [17, 25];
        icon.options.iconAnchor = [17, 25];
        icon.options.shadowSize = [20, 30];
        marker.setIcon(icon);
        MarkerArray.push(marker);
      });
      let Default = L.layerGroup(MarkerArray);
      let overlayMaps = {
        Default: Default,
        E3: this.e3,
        E4: this.e4,
      };

      Default.addTo(this.mymap);
      if (this.mapFiler !== "คน|นักเรียน|สูงอายุ") {
        this.e3.addTo(this.mymap);
        const map_controller = document.getElementById("map_controller");
        // const box_filter = document.getElementById("box_filter");
        map_controller.style.display = "block";
        // box_filter.style.display = "ิblock";
      }
      L.control.layers(this.baseMaps, overlayMaps).addTo(this.mymap);
      this.mymap.on("overlayadd", function (e) {
        if (e.name === "E3" || e.name === "E4") {
          const map_controller = document.getElementById("map_controller");
          map_controller.style.display = "block";
        }
      });
      this.mymap.on("overlayremove", function (e) {
        if (e.name === "E3" || e.name === "E4") {
          const map_controller = document.getElementById("map_controller");
          map_controller.style.display = "none";
        }
      });
    } else if (this.state === "village") {
      const MarkerArray = [];
      this.marker.map(async (data, index) => {
        const location = data["geometry"]["coordinates"];
        // var marker = L.marker([location[1], location[0]]); // .addTo(this.mymap);
        let marker = new L.marker([location[1], location[0]]);
        marker.on("mouseover", (e) => {
          marker
            .bindPopup(
              `<b>House ID : ${data["properties"]["house_ID"]}</b><br>`
            )
            .openPopup();
        });
        marker.on("mouseout", (e) => {
          marker.closePopup();
        });
        MarkerArray.push(marker);
        const icon = marker.options.icon;
        icon.options.iconSize = [17, 25];
        icon.options.iconAnchor = [17, 25];
        icon.options.shadowSize = [20, 30];
        marker.setIcon(icon);
        MarkerArray.push(marker);
      });
      let Default = L.layerGroup(MarkerArray);
      let overlayMaps = {
        Default: Default,
        E3: this.e3,
        E4: this.e4,
      };

      Default.addTo(this.mymap);
      if (this.mapFiler !== "คน|นักเรียน|สูงอายุ") {
        this.e3.addTo(this.mymap);
        const map_controller = document.getElementById("map_controller");
        // const box_filter = document.getElementById("box_filter");
        map_controller.style.display = "block";
        // box_filter.style.display = "ิblock";
      }
      L.control.layers(this.baseMaps, overlayMaps).addTo(this.mymap);
      this.mymap.on("overlayadd", function (e) {
        if (e.name === "E3" || e.name === "E4") {
          const map_controller = document.getElementById("map_controller");
          map_controller.style.display = "block";
        }
      });
      this.mymap.on("overlayremove", function (e) {
        if (e.name === "E3" || e.name === "E4") {
          const map_controller = document.getElementById("map_controller");
          map_controller.style.display = "none";
        }
      });
    }
  }
}
