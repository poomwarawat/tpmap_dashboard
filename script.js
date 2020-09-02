window.onload = Pageload;
let orderState = -1;
let countryState = "province";
let valueState = null;
var eMenState = null;
var filterState1 = false;
var filterState2 = false;

async function Pageload() {
  const select_province = document.getElementById("select_province");
  const select_amphur = document.getElementById("select_amphur");
  const select_tambol = document.getElementById("select_tambol");
  const indicater = document.getElementById("indicater");
  const order = document.getElementById("order");
  const filter_text = document.getElementById("filter_text");
  const map_control_btn = document.getElementById("map_control_btn");
  const map_control_reset = document.getElementById("map_control_reset");
  map_control_reset.onclick = handleResetFilterMap;
  map_control_btn.onclick = handleMapSelect;
  filter_text.addEventListener("keyup", function (event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
      // Cancel the default action, if needed
      event.preventDefault();
      // Trigger the button element with a click
      document.getElementById("map_control_btn").click();
      filter_text.value = "";
    }
  });
  indicater.onchange = handleIndicaterChage;
  order.onchange = handleOrderChange;
  select_province.onchange = handleSelectProvince;
  select_amphur.onchange = handleSelectAmphur;
  select_tambol.onchange = handleSelectTambol;
  const Province = new TPMAP(0, orderState, countryState);
  await Province.main();
  await Province.loadBaseMap();
  await Province.createMap();
  await Province.createProblem();
  await Province.loadGraph();
  await Province.createProvinceSelecter();
  await Province.createMaker();
  await Province.createLayerControl();
  Fetchcountry();
  CreateNews();
}

let filterArray = [];
async function handleResetFilterMap() {
  filterArray = [];
  let select_amphur = document.getElementById("box_filter");
  const header_map = document.getElementById("header_map");
  header_map.style.height = "50px";
  select_amphur.innerHTML = "";
  select_amphur.className = "";
  const loader = document.getElementById("loader");
  const remove = await removeDivMap();
  const Map = new TPMAP(0, -1, "province");
  countryState = "province";
  valueState = null;
  orderState = -1;
  loader.style.display = "block";
  const map_controller = document.getElementById("map_controller");
  map_controller.style.display = "none";
  await Map.main();
  await Map.loadBaseMap();
  await Map.createMap();
  await Map.createProblem();
  await Map.loadGraph();
  await Map.createProvinceSelecter();
  await Map.createMaker();
  await Map.createLayerControl();
}
async function handleMapSelect() {
  let value = document.getElementById("filter_text").value;
  const header_map = document.getElementById("header_map");
  header_map.style.height = "100px";
  value = value.split(" ");
  if (value.length > 0) {
    for (let index = 0; index < value.length; index++) {
      const splittext = value[index];
      filterArray.push(splittext);
    }
  }
  const right = document.getElementById("box_filter");

  const loader = document.getElementById("loader");
  const remove = await removeDivMap();
  loader.style.display = "block";
  let text = "";
  for (let index = 0; index < filterArray.length; index++) {
    if (filterArray.length === parseInt(index) + 1) {
      text = text + filterArray[index];
      let showText = "คำสำคัญ : " + text;
      right.innerHTML = `<div>${showText}</div>`;
      const Map = new TPMAP(0, orderState, countryState, valueState, text);
      const map_controller = document.getElementById("map_controller");
      const box_filter = document.getElementById("box_filter");
      box_filter.className = "map-controller-right";
      box_filter.style.display = "none";
      map_controller.style.display = "none";
      await Map.main();
      await Map.loadBaseMap();
      await Map.createMap();
      await Map.createProblem();
      await Map.loadGraph();
      await Map.createProvinceSelecter();
      await Map.createMaker();
      box_filter.style.display = "block";
    } else {
      text = text + filterArray[index] + "|";
      let showText = "คำสำคัญ : " + text;
      right.innerHTML = `<div>${showText}</div>`;
    }
  }
}

async function CreateNews() {
  readTextFile("./update_panel.json", function (text) {
    let data = JSON.parse(text);
    data = data["update_panel"];
    const panel = document.getElementById("update_news");
    for (let index = data.length - 1; index >= 0; index--) {
      const New = data[index];
      const div1 = document.createElement("div");
      const div2 = document.createElement("div");
      const a1 = document.createElement("a");
      const a2 = document.createElement("a");
      div1.className = "col-4";
      div2.classList = "col-8";
      a1.className = "new-text";
      a2.className = "new-text";
      a1.innerHTML = New["date_modified"];
      a2.innerHTML = New["title"];
      a1.target = "_blank";
      a2.target = "_blank";
      a1.href = New["link"];
      a2.href = New["link"];
      div1.appendChild(a1);
      div2.appendChild(a2);
      panel.appendChild(div1);
      panel.appendChild(div2);
    }
  });
}
function readTextFile(file, callback) {
  var rawFile = new XMLHttpRequest();
  rawFile.overrideMimeType("application/json");
  rawFile.open("GET", file, true);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4 && rawFile.status == "200") {
      callback(rawFile.responseText);
    }
  };
  rawFile.send(null);
}
async function Fetchcountry() {
  const country_60 = new country(60);
  const country_61 = new country(61);
  const country_62 = new country(62);
  const country_60_res = await country_60.main();
  const country_61_res = await country_61.main();
  const country_62_res = await country_62.main();
  Promise.all([country_60_res, country_61_res, country_62_res]).then(
    async (value) => {
      const Table = new countryTable(value[0], value[1], value[2]);
      const table = await Table.createTable();
    }
  );
}
async function handleIndicaterChage(e) {
  const value = e.currentTarget.value;
  const loader = document.getElementById("loader");
  const remove = await removeDivMap();
  const Order = new TPMAP(value, orderState, countryState, valueState);
  // Order.main();
  // Order.loadBaseMap();
  loader.style.display = "block";
  await Order.main();
  await Order.loadBaseMap();
  await Order.createMap();
  await Order.createProblem();
  await Order.loadGraph();
  await Order.createProvinceSelecter();
  await Order.createMaker();
  await Order.createLayerControl();
}
async function handleOrderChange(e) {
  const value = e.currentTarget.value;
  const loader = document.getElementById("loader");
  const remove = await removeDivMap();
  orderState = value;
  const Order = new TPMAP(0, orderState, countryState, valueState);
  // Order.main();
  // Order.loadBaseMap();
  loader.style.display = "block";
  await Order.main();
  await Order.loadBaseMap();
  await Order.createMap();
  await Order.createProblem();
  await Order.loadGraph();
  await Order.createProvinceSelecter();
  await Order.createMaker();
  await Order.createLayerControl();
}
async function handleSelectTambol(e) {
  const loader = document.getElementById("loader");
  const value = e.currentTarget.value;
  if (parseInt(value) === 0) {
    const provCode = `${valueState[0]}${valueState[1]}${valueState[2]}${valueState[3]}`;
    console.log(provCode);
    const remove = await removeDivMap();
    const Tambol = new TPMAP(0, orderState, "tambol", provCode);
    valueState = provCode;
    countryState = "tambol";
    loader.style.display = "block";
    await Tambol.main();
    await Tambol.loadBaseMap();
    await Tambol.createMap();
    await Tambol.createProblem();
    await Tambol.loadGraph();
    await Tambol.createProvinceSelecter();
    await Tambol.createMaker();
  } else {
    const remove = await removeDivMap();
    const Village = new TPMAP(0, orderState, "village", value);
    countryState = "village";
    valueState = value;
    // Village.main();
    // Village.loadBaseMap();
    loader.style.display = "block";
    await Village.main();
    await Village.loadBaseMap();
    await Village.createMap();
    await Village.createProblem();
    await Village.loadGraph();
    await Village.createProvinceSelecter();
    await Village.createMaker();
    await Village.createLayerControl();
  }
}
async function handleSelectProvince(e) {
  const loader = document.getElementById("loader");
  const value = e.currentTarget.value;
  if (parseInt(value) === 0) {
    console.log(value);
    const loader = document.getElementById("loader");
    const remove = await removeDivMap();
    const Map = new TPMAP(0, -1, "province");
    loader.style.display = "block";
    valueState = null;
    countryState = "province";
    const map_controller = document.getElementById("map_controller");
    map_controller.style.display = "none";
    await Map.main();
    await Map.loadBaseMap();
    await Map.createMap();
    await Map.createProblem();
    await Map.loadGraph();
    await Map.removeSelecter("select_amphur");
    await Map.removeSelecter("select_tambol");
    await createNoneSelect("select_amphur");
    await createNoneSelect("select_tambol");
    // await Map.createProvinceSelecter();
    await Map.createMaker();
    await Map.createLayerControl();
    return false;
  } else {
    const remove = await removeDivMap();
    const Amphur = new TPMAP(0, orderState, "amphur", value);
    valueState = value;
    countryState = "amphur";
    // Amphur.main();
    // Amphur.loadBaseMap();
    loader.style.display = "block";
    await Amphur.main();
    await Amphur.loadBaseMap();
    await Amphur.createMap();
    await Amphur.createProblem();
    await Amphur.removeSelecter("select_tambol");
    await createNoneSelect("select_tambol");
    await Amphur.loadGraph();
    await Amphur.createProvinceSelecter();
    await Amphur.createMaker();
    // await Amphur.createLayerControl();
  }
}
function createNoneSelect(id) {
  return new Promise((resolve) => {
    const select = document.getElementById(id);
    const option = document.createElement("option");
    let text;
    if (id === "select_province") {
      text = "กรุณาเลือกจังหวัด";
    } else if (id === "select_amphur") {
      text = "กรุณาเลือกอำเภอ";
    } else if (id === "select_tambol") {
      text = "กรุณาเลือกตำบล";
    }
    option.value = 0;
    option.innerHTML = text;
    select.appendChild(option);
    resolve(true);
  });
}
async function handleSelectAmphur(e) {
  const loader = document.getElementById("loader");
  const value = e.currentTarget.value;
  if (parseInt(value) === 0) {
    const provCode = `${valueState[0]}${valueState[1]}`;
    const remove = await removeDivMap();
    const Amphur = new TPMAP(0, orderState, "amphur", provCode);
    valueState = provCode;
    countryState = "amphur";
    loader.style.display = "block";
    await Amphur.main();
    await Amphur.loadBaseMap();
    await Amphur.createMap();
    await Amphur.removeSelecter("select_tambol");
    await createNoneSelect("select_tambol");
    await Amphur.createProblem();
    await Amphur.loadGraph();
    await Amphur.createProvinceSelecter();
    await Amphur.createMaker();
  } else {
    const remove = await removeDivMap();
    const Tambol = new TPMAP(0, orderState, "tambol", value);
    valueState = value;
    countryState = "tambol";
    // Tambol.main();
    // Tambol.loadBaseMap();
    loader.style.display = "block";
    await Tambol.main();
    await Tambol.loadBaseMap();
    await Tambol.createMap();
    await Tambol.createProblem();
    await Tambol.loadGraph();
    await Tambol.createProvinceSelecter();
    await Tambol.createMaker();
    await Tambol.createLayerControl();
  }
}
function removeDivMap() {
  return new Promise((resolve, reject) => {
    try {
      const map = document.getElementById("mapid");
      const map_container = document.getElementById("map_container");
      const mapid = document.createElement("div");
      const div = document.createElement("div");
      map.parentNode.removeChild(map);
      mapid.id = "mapid";
      mapid.appendChild(div);
      map_container.appendChild(mapid);
      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
}
class country {
  constructor(year) {
    this.year = year;
    this.url = "https://api4.logbook.emenscr.in.th/poor/country/";
  }
  main() {
    return new Promise((resolve, reject) => {
      try {
        fetch(`${this.url}${this.year}`)
          .then((res) => res.json())
          .then((res) => {
            resolve(res);
          });
      } catch (error) {
        reject(error);
      }
    });
  }
}
class countryTable {
  constructor(country60, country61, country62) {
    this.country60 = country60;
    this.country61 = country61;
    this.country62 = country62;
  }
  createTable() {
    return new Promise((resolve, reject) => {
      try {
        if (
          this.country60.length > 0 &&
          this.country61.length > 0 &&
          this.country62.length > 0
        ) {
          for (let index = 0; index < this.country60.length; index++) {
            const country60 = this.country60[index];

            const country61 = this.country61[index];
            const country62 = this.country62[index];
            for (let j = 0; j < indicater_key.length; j++) {
              const key = indicater_key[j];
              let splitKey = key.split(".");
              let data60, data61, data62;
              if (splitKey.length === 3) {
                data60 = country60[splitKey[0]][splitKey[1]][splitKey[2]];
                data61 = country61[splitKey[0]][splitKey[1]][splitKey[2]];
                data62 = country62[splitKey[0]][splitKey[1]][splitKey[2]];
              } else if (splitKey.length === 4) {
                data60 =
                  country60[splitKey[0]][splitKey[1]][splitKey[2]][splitKey[3]];
                data61 =
                  country61[splitKey[0]][splitKey[1]][splitKey[2]][splitKey[3]];
                data62 =
                  country62[splitKey[0]][splitKey[1]][splitKey[2]][splitKey[3]];
              } else if (splitKey.length === 5) {
                data60 =
                  country60[splitKey[0]][splitKey[1]][splitKey[2]][splitKey[3]][
                    splitKey[4]
                  ];
                data61 =
                  country61[splitKey[0]][splitKey[1]][splitKey[2]][splitKey[3]][
                    splitKey[4]
                  ];
                data62 =
                  country62[splitKey[0]][splitKey[1]][splitKey[2]][splitKey[3]][
                    splitKey[4]
                  ];
              }

              // ส่วนแปะ data ในตารางเทียบข้อมูล
              const overview_body = document.getElementById("overview_body");
              const row = document.createElement("div");
              const col1 = document.createElement("div");
              const col2 = document.createElement("div");
              const col3 = document.createElement("div");
              const col4 = document.createElement("div");
              const col5 = document.createElement("div");
              const hr = document.createElement("hr");
              var nfObject = new Intl.NumberFormat("en-US");
              row.className = "row overview-row";
              col1.className = "col-3";
              col2.className = "col-3";
              col3.className = "col-3";
              col4.className = "col-3";
              col5.className = "col-12";
              hr.className = "line";
              col1.innerHTML = indicater_name[j];
              col2.innerHTML = nfObject.format(parseFloat(data60).toFixed(2));
              // .toString()
              // .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
              col3.innerHTML = nfObject.format(parseFloat(data61).toFixed(2));
              // .toString()
              // .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
              col4.innerHTML = nfObject.format(parseFloat(data62).toFixed(2));
              // .toString()
              // .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
              col5.appendChild(hr);
              row.appendChild(col1);
              row.appendChild(col2);
              row.appendChild(col3);
              row.appendChild(col4);
              row.appendChild(col5);
              overview_body.appendChild(row);
            }
          }
          resolve(true);
        }
      } catch (error) {
        reject(error);
      }
    });
  }
}

const indicater_key = [
  "poor.household.CNT",
  "poor.JPT.CNT",
  "poor.JPT.MOFreg.CNT",
  "poor.JPT.MOFval.CNT",
  "poor.JPT.MOFval.health",
  "poor.JPT.MOFval.living",
  "poor.JPT.MOFval.education",
  "poor.JPT.MOFval.income",
  "poor.JPT.MOFval.accessibility",
  "JPT.MOFval.pov.rate",
  "poor.JPT.MOFval.ind1.CNT",
  "poor.JPT.MOFval.ind2.CNT",
  "poor.JPT.MOFval.ind3.CNT",
  "poor.JPT.MOFval.ind4.CNT",
  "poor.JPT.MOFval.ind5.CNT",
  "poor.JPT.MOFval.ind6.CNT",
  "poor.JPT.MOFval.ind7.CNT",
  "poor.JPT.MOFval.ind8.CNT",
  "poor.JPT.MOFval.ind9.CNT",
  "poor.JPT.MOFval.ind10.CNT",
  "poor.JPT.MOFval.ind11.CNT",
  "poor.JPT.MOFval.ind12.CNT",
  "poor.JPT.MOFval.ind13.CNT",
  "poor.JPT.MOFval.ind14.CNT",
  "poor.JPT.MOFval.ind15.CNT",
  "poor.JPT.MOFval.ind16.CNT",
  "poor.JPT.MOFval.ind17.CNT",
  "poor.JPT.MOFval.ind18.CNT",
  "poor.JPT.MOFval.ind19.CNT",
  "poor.JPT.MOFval.ind20.CNT",
  "poor.JPT.MOFval.ind21.CNT",
  "poor.JPT.MOFval.ind22.CNT",
  "poor.JPT.MOFval.ind23.CNT",
  "poor.JPT.MOFval.ind24.CNT",
  "poor.JPT.MOFval.ind25.CNT",
  "poor.JPT.MOFval.ind26.CNT",
  "poor.JPT.MOFval.ind27.CNT",
  "poor.JPT.MOFval.ind28.CNT",
  "poor.JPT.MOFval.ind29.CNT",
  "poor.JPT.MOFval.ind30.CNT",
  "poor.JPT.MOFval.ind31.CNT",
];

const indicater_name = [
  "จำนวนครัวเรือน (จปฐ.) ที่จน",
  "จำนวนคน (จปฐ.) ที่จน",
  "จำนวนคนในจปฐ. ที่ลงทะเบียนสวัสดิการแห่งรัฐ ปี 2560 (กระทรวงการคลัง) ที่จน",
  "จำนวนคนในจปฐ. ที่ลงทะเบียนสวัสดิการแห่งรัฐ ปี 2560 (กระทรวงการคลัง) ที่ผ่านการตรวจสอบแล้ว ที่จน = คนจนเป้าหมาย",
  "จำนวนคนจนที่มีปัญหาด้านสุขภาพ",
  "จำนวนคนจนที่มีปัญหาด้านความเป็นอยู่",
  "จำนวนคนจนที่มีปัญหาด้านการศึกษา",
  "จำนวนคนจนที่มีปัญหาด้านรายได้",
  "จำนวนคนจนด้านการเข้าถึงบริการรัฐ",
  "สัดส่วนคนจนเป้าหมาย (% เทียบกับจำนวนคนในจปฐ.)",
  "ตัวชี้วัดที่ 1 : เด็กแรกเกิดมีน้ำหนัก 2,500 กรัมขึ้นไป",
  "ตัวชี้วัดที่ 2 : เด็กแรกเกิดได้กินนมแม่อย่างเดียวอย่างน้อย 6 เดือนแรกติดต่อกัน",
  "ตัวชี้วัดที่ 3 : เด็กแรกเกิดถึง 12 ปี ได้รับวัคซีนป้องกันโรคครบตามตารางสร้างเสริมภูมิคุ้มกันโรค",
  "ตัวชี้วัดที่ 4 : ครัวเรือนกินอาหารถูกสุขลักษณะ ปลอดภัย และได้มาตราฐาน",
  "ตัวชี้วัดที่ 5 : ครัวเรือนมีการใช้ยาเพื่อบำบัด บรรเทาอาการเจ็บป่วยเบื้องต้นอย่างเหมาะสม",
  "ตัวชี้วัดที่ 6 : คนอายุ 35 ปีขึ้นไป ได้รับการตรวจสุขภาพประจำปี",
  "ตัวชี้วัดที่ 7 : คนอายุ 6 ปีขึ้นไป ออกกำลังกายอย่างน้อยสัปดาห์ละ 3 วันๆละ 30 นาที",
  "ตัวชี้วัดที่ 8 : ครัวเรือนมีความมั่นคงในที่อยู่อาศัย และบ้านมีสภาพคงทนถาวร",
  "ตัวชี้วัดที่ 9 : ครัวเรือนมีน้ำสะอาดสำหรับดื่มและบริโภคเพียงพอตลอดปี อย่างน้อยคนละ 5 ลิตรต่อวัน",
  "ตัวชี้วัดที่ 10 : ครัวเรือนมีน้ำใช้เพียงพอตลอดปี อย่างน้อยคนละ 45 ลิตรต่อวัน",
  "ตัวชี้วัดที่ 11 : ครัวเรือนมีการจัดการบ้านเรือนเป็นระเบียบเรียบร้อย สะอาด และถูกสุขลักษณะ",
  "ตัวชี้วัดที่ 12 : ครัวเรือนไม่ถูกรบกวนจากมลพิษ",
  "ตัวชี้วัดที่ 13 : ครัวเรือนมีการป้องกันอุบัติภัยและภัยธรรมชาติอย่างถูกวิธี",
  "ตัวชี้วัดที่ 14 : ครัวเรือนมีความปลอดภัยในชีวิตและทรัพย์สิน",
  "ตัวชี้วัดที่ 15 : เด็กอายุ 3-5 ปี ได้รับบริการเลี้ยงดูเตรียมความพร้อมก่อนวัยเรียน",
  "ตัวชี้วัดที่ 16 : เด็กอายุ 6-14 ปี ได้รับการศึกษาภาคบังคับ 9 ปี",
  "ตัวชี้วัดที่ 17 : เด็กจบชั้น ม.3 ได้เรียนต่อชั้น ม.4 หรือเทียบเท่า",
  "ตัวชี้วัดที่ 18 : คนในครัวเรือนที่จบการศึกษาภาคบังคับ 9 ปี ที่ไม่ได้เรียนต่อและยังไม่มีงานทำ ได้รับการฝึกอบรมด้านอาชีพ",
  "ตัวชี้วัดที่ 19 : คนอายุ 15-59 ปี อ่าน เขียนภาษาไทย และคิดเลขอย่างง่ายได้",
  "ตัวชี้วัดที่ 20 : คนอายุ 15-59 ปี มีอาชีพและรายได้",
  "ตัวชี้วัดที่ 21 : คนอายุ 60 ปีขึ้นไป มีอาชีพและรายได้",
  "ตัวชี้วัดที่ 22 : รายได้เฉลี่ยของคนในครัวเรือนต่อปี",
  "ตัวชี้วัดที่ 23 : ครัวเรือนมีการเก็บออมเงิน",
  "ตัวชี้วัดที่ 24 : คนในครัวเรือนไม่ดื่มสุรา",
  "ตัวชี้วัดที่ 25 : คนในครัวเรือนไม่สูบบุหรี่",
  "ตัวชี้วัดที่ 26 : คนอายุ 6 ปีขึ้นไป ปฏิบัติกิจกรรมทางศาสนาอย่างน้อยสัปดาห์ละ 1 ครั้ง",
  "ตัวชี้วัดที่ 27 : ผู้สูงอายุ ได้รับการดูแลจากครอบครัว ชุมชน ภาครัฐ หรือภาคเอกชน",
  "ตัวชี้วัดที่ 28 : ผู้พิการ ได้รับการดูแลจากครอบครัว ชุมชน ภาครัฐ หรือภาคเอกชน",
  "ตัวชี้วัดที่ 29 : ผู้ป่วยเรื้อรัง ได้รับการดูแลจากครอบครัว ชุมชน ภาครัฐ หรือภาคเอกชน",
  "ตัวชี้วัดที่ 30 : ครัวเรือนมีส่วนร่วมทำกิจกรรมสาธารณะเพื่อประโยชน์ของชุมชน หรือท้องถิ่น",
  "ตัวชี้วัดที่ 31 : ครอบครัวมีความอบอุ่น",
];
