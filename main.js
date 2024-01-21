"use strict";

let isModal = false;
let selectedCoins = localStorage.getItem("selectedCoins")
  ? JSON.parse(localStorage.getItem("selectedCoins"))
  : [];
const twoMinutes = 1000 * 120;
let sortByLocalCompare = "A-Z";
let sortByHighToLow = "Price (high - low)";
let sortBySelectedCoins = "Selected Coins";
const updateInterval = 2000;
let graphInterval;

const dataItemInitialValue = {
  type: "line",
  xValueType: "dateTime",
  yValueFormatString: "###.00$",
  xValueFormatString: "hh:mm:ss TT",
  showInLegend: true,
  name: "",
  dataPoints: [],
};

const options = {
  title: {
    text: "Coins Charts",
  },
  axisX: {
    title: "Real Time",
  },
  axisY: {
    suffix: "$",
  },
  toolTip: {
    shared: true,
  },
  legend: {
    cursor: "pointer",
    verticalAlign: "top",
    fontSize: 22,
    fontColor: "dimGrey",
    itemclick: toggleDataSeries,
  },
  data: [],
};

// this function handles the option to see more or less info a a specific coin in the chart
function toggleDataSeries(e) {
  if (typeof e.dataSeries.visible === "undefined" || e.dataSeries.visible) {
    e.dataSeries.visible = false;
  } else {
    e.dataSeries.visible = true;
  }
  e.chart.render();
}

// reset the search box and alert

function hideElementById(id) {
  const element = document.getElementById(id);
  element.classList.add("hide");
}

// reset search box and alert of search
function resetSearchBoxAndAlert() {
  hideElementById("alertOfSearch");
  const searchBox = document.getElementById("searchBox");
  searchBox.value = "";
}

// reset alert of max selected coins on the array
function resetAlertOfMaxCoins() {
  hideElementById("alertOfCoins");
}

// remove input search from the dom
function removeSearchBox() {
  const searchBox = document.getElementById("searchBox");
  searchBox?.remove();
}

(async () => {
  const COINS = await getJson(`assets/json/coins.json`);
  let coins = [...COINS];

  // catch the link of Home page
  const homeLink = document.getElementById("homeLink");
  createHome();

  //  call function createHome when click on link Home Page
  homeLink.addEventListener("click", createHome);
  async function createHome() {
    // create async function bring coins from api and call function
    // displayCoins to show 50 types of crypto coins
    displayCoins(coins);

    removeChartContainer();

    displaySearchInput();
  }

  // sort buttons by by sort function

  function sortButtons(sortFunction) {
    coins = coins.sort(sortFunction);
    displayCoins(coins);
    resetSearchBoxAndAlert();
  }

  // sort coins by alpha bet
  function sortByAlphabet() {
    const sortingAtoZ = sortByLocalCompare === "A-Z" ? 1 : -1;
    sortByLocalCompare = sortByLocalCompare === "A-Z" ? "Z-A" : "A-Z";
    sortButtons(
      (coinA, coinB) => sortingAtoZ * coinA.name.localeCompare(coinB.name)
    );
  }

  // sort coins by by selected coins array

  function sortSelectedCoins() {
    const sortingSelectedCoins =
      sortBySelectedCoins === "Selected Coins" ? 1 : -1;
    sortBySelectedCoins =
      sortBySelectedCoins === "Selected Coins"
        ? "Not Selected Coins"
        : "Selected Coins";
    sortButtons((coinA, coinB) => {
      const inputA = document.getElementById(coinA.id);
      const inputB = document.getElementById(coinB.id);
      if (inputA.checked) {
        if (inputB.checked) {
          return 0;
        }

        return sortingSelectedCoins * -1;
      }

      return sortingSelectedCoins;
    });
  }

  // sort coins by price

  function sortByPrice() {
    const sortingHighToLow = sortByHighToLow === "Price (high - low)" ? 1 : -1;
    sortByHighToLow =
      sortByHighToLow === "Price (high - low)"
        ? "Price (low - high)"
        : "Price (high - low)";
    sortButtons(
      (priceA, priceB) =>
        sortingHighToLow *
        (priceB.market_data.current_price.usd -
          priceA.market_data.current_price.usd)
    );
  }

  // show coins by default order

  function showDefaultCoins() {
    coins = [...COINS];
    displayCoins(coins);
    resetSearchBoxAndAlert();
  }

  //creating sort buttons

  function createSortButtons() {
    return `
    <div class="buttons-container">
    <button type="button" class="btn btn-warning" id="sortByAlphabet">${sortByLocalCompare}</button>
    <button  type="button" class="btn btn-warning" id="sortHighToLow">${sortByHighToLow}</button>
    <button  type="button" class="btn btn-warning" id="sortSelectedCoins">${sortBySelectedCoins}</button>
    <button  type="button" class="btn btn-warning" id="default">Default</button>
    </div>`;
  }

  // catch the link of Reports page
  const reportsLink = document.getElementById("reportsLink");

  //  call function createReports when click on link Reports Page
  reportsLink.addEventListener("click", createReports);
  function createReports() {
    const container = document.getElementById("container");
    container.innerHTML = "";

    displayChartContainer();

    showReports();

    removeSearchBox();
    resetAlertOfMaxCoins();
    hideElementById("alertOfSearch");
  }

  // catch the link of About page
  const aboutLink = document.getElementById("aboutLink");
  //  call function createAbout when click on link About Page
  aboutLink.addEventListener("click", createAbout);

  // creating about page
  function createAbout() {
    const container = document.getElementById("container");
    container.innerHTML = `
    <div class="wrapper">
    <div class="testimonial">
    <article>
    <img src="assets/images/shlomiImage1.jpg">
    <blockquote>

    <p> My name is Shlomi Cohen <br/> and I have been learning to program at John Bryce for almost four months now. <br/>
    I really like the field of software development and I wish to myself, with God's help,<br/>
    that I will successfully complete the course.<br/>
    I will tell you a little about myself.<br/>
    I really like riding motorcycles and doing things that are a little dangerous but <br/>
     always I loved and connected to challenges with the motorcycle and doing all kinds of exercises
     </p>
    
    </blockquote>
    </article>
    </div>
    </div>
    `;

    removeChartContainer();
    removeSearchBox();
    resetAlertOfMaxCoins();
    hideElementById("alertOfSearch");
  }

  // show giving coins in the container section
  function displayCoins(coins) {
    const container = document.getElementById("container");
    let content = createSortButtons();
    for (let i = 0; i < coins.length; i++) {
      const coin = coins[i];
      const selectedCoin = selectedCoins.find(
        (selCoin) => selCoin.id === coin.id
      );
      const checked = selectedCoin ? "checked" : "";
      const div = `
               <div id="cards${i}" class="card" >
                    <h3 class="card-title">${coin.symbol}</h3>
                    <h5 class="card-title">${coin.name}</h5>
                    <br/>
                    <div><img src="${coin.image.small}"></div>
                    <br/>
                    <button type="button" class="btn btn-info" id="btn${i}" data-coin-id="${coin.id}">More Info</button>
                    <div class="more-info hidden"></div>
                    <button class="button-on-off">
                    <label class="toggle-switch">
                    <input  class="checkbox ${coin.symbol}" ${checked} type="checkbox" id="${coin.id}">
                    <div class="toggle-switch-background">
                      <div class="toggle-switch-handle"></div>
                    </div>
                  </label>
                  </button>
                </div>`;
      content += div;
    }
    container.innerHTML = content;

    addOnclickFunctionToElement("sortByAlphabet", sortByAlphabet);

    addOnclickFunctionToElement("sortHighToLow", sortByPrice);

    addOnclickFunctionToElement("sortSelectedCoins", sortSelectedCoins);

    addOnclickFunctionToElement("default", showDefaultCoins);

    // catch all inputs and give a change event
    const inputs = document.querySelectorAll(`.checkbox`);
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      input.addEventListener("change", async () => {
        const card = coins[i];
        checkIfInputChecked(input, card);
      });
    }
    // catch all buttons on cards
    const buttons = document.querySelectorAll(".card > .btn-info");
    for (const btn of buttons) {
      btn.addEventListener("click", toggleMoreInfo);
    }
  }
  // receive the id and function

  function addOnclickFunctionToElement(id, onclick) {
    const element = document.getElementById(id);
    element.onclick = onclick;
  }

  async function toggleMoreInfo() {
    const coinId = this.getAttribute("data-coin-id");
    const div = document.querySelector(
      `button[data-coin-id="${coinId}"] + div`
    );

    div.innerHTML = `
    <div class="ring">
    <span class="span-ring"></span>
  </div>
    `;
    if (div.classList.contains("hidden")) {
      div.classList.remove("hidden");
    } else {
      div.classList.add("hidden");
    }
    // try to get more info for the giving coin and show err message otherwise
    try {
      const prices = await getMoreInfo(coinId);

      div.innerHTML = `
                <strong class="card-text">USD: ${prices.usd} $</strong>
                <strong class="card-text">EUR: ${prices.eur} €</strong>
                <strong class="card-text">ILS: ${prices.ils} ₪</strong>`;
    } catch (err) {
      div.innerHTML = "<strong>Please try again in a few minutes</strong>";
    }
  }

  async function getMoreInfo(coinId) {
    let prices = JSON.parse(localStorage.getItem(coinId));
    const dateNow = Date.now();
    // check if two minutes had passed from the last click on the button
    if (prices && prices.timeStamp + twoMinutes > dateNow) return prices;
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}`;

    const coinInfo = await getJson(url);
    // show the prices
    const usd = coinInfo.market_data.current_price.usd;
    const eur = coinInfo.market_data.current_price.eur;
    const ils = coinInfo.market_data.current_price.ils;
    prices = { usd, eur, ils, timeStamp: dateNow };
    localStorage.setItem(coinId, JSON.stringify(prices));
    return prices;
  }

  // fetch coins from giving url
  async function getJson(url) {
    const response = await fetch(url);
    const json = await response.json();
    return json;
  }

  // find coin in coins array by giving coin id
  function getCoin(coinId) {
    return coins.find((coin) => coin.id === coinId);
  }

  // show modal on page
  function showModal() {
    const myModal = new bootstrap.Modal(document.getElementById("customModal"));
    isModal = true;
    myModal.show();

    isModal = !isModal;
  }

  // check if giving input checked and updates selected coins array
  function checkIfInputChecked(input, card) {
    if (input.checked) {
      if (selectedCoins.length < 5) {
        updateSelectedCoins(card, true);
      } else {
        input.checked = true;
        setTimeout(() => {
          input.checked = false;
        }, 300);

        showSelectedCoinsOnModal();
      }
    } else {
      updateSelectedCoins(card);
    }
  }

  // handles selected coins array with two options : push given coin to array or filter given coin from array
  function updateSelectedCoins(coin, isPush) {
    if (isPush) {
      selectedCoins.push(coin);
    } else {
      selectedCoins = selectedCoins.filter(
        (selectedCoin) => selectedCoin.id !== coin.id
      );
    }
    localStorage.setItem("selectedCoins", JSON.stringify(selectedCoins));
  }

  // show selected coins cards on modal

  function showSelectedCoinsOnModal() {
    const modalBody = document.getElementById("modalBody");
    let count = 0;
    let content = "";
    for (const coin of selectedCoins) {
      const div = `
                        <div class="card" style="height:15rem; width:15rem;">
                          <h3 class="card-title">${coin.symbol}</h3>
                          <h5 class="card-title">${coin.name}</h5>
                          <br/>
                          <div><img src="${coin.image.small}"></div>
                          </br>
                          <button class="button-on-off">
                          <label class="toggle-switch">
                          <input id="modalInputCheck${count}" class="checkbox" checked type="checkbox" data-coin-id="${coin.id}">
                          <div class="toggle-switch-background">
                            <div class="toggle-switch-handle"></div>
                          </div>
                        </label>
                        </button>
        
                      </div>`;

      content += div;
      count++;
    }

    modalBody.innerHTML = content;

    // update home page checkboxes value according to modal checkboxes value
    const modalInputs = modalBody.querySelectorAll(".checkbox");
    for (const modalInput of modalInputs) {
      const coinId = modalInput.getAttribute("data-coin-id");
      const selectedCoin = getCoin(coinId);
      modalInput.addEventListener("change", async () => {
        const homePageInput = document.getElementById(coinId);
        homePageInput.checked = modalInput.checked;
        updateSelectedCoins(selectedCoin, modalInput.checked);
      });
    }
    showModal();
    alertOfSelectedCoins();
  }

  // display search input
  function displaySearchInput() {
    const searchContainer = document.getElementById("searchContainer");
    searchContainer.innerHTML = `
    <form class="d-flex" role="search">
    <input id="searchBox" class="form-control me-2" type="search" placeholder="Search Symbol Coin" aria-label="Search">
  </form>
    `;

    const searchBox = document.getElementById("searchBox");
    // filter coins array by search box value and shows empty coins array message otherwise
    searchBox.addEventListener("input", () => {
      const coinToSearch = searchBox.value;

      const searchedCoins = coins.filter((coin) =>
        coin.symbol
          .toLowerCase()
          .includes(
            coinToSearch.toLowerCase() ||
              coin.name.toLowerCase().includes(coinToSearch.toLowerCase())
          )
      );

      const isMatch = searchedCoins.length > 0;
      console.log({ isMatch });

      if (!isMatch) {
        alertOfSearchCoins();
      } else {
        alertOfSearch.classList.add("hide");
      }

      displayCoins(searchedCoins);

      if (coinToSearch === "") {
        alertOfSearch.classList.add("hide");
        displayCoins(coins);
      }
    });
  }

  // handles removing chart container and make options to be equals to initial data
  function removeChartContainer() {
    const chartContainer = document.getElementById("chartContainer");
    chartContainer?.remove();

    const chartContainerCoins = document.querySelector(".chartContainerCoins");
    chartContainerCoins.style.height = 0;

    clearInterval(graphInterval);
    options.data = [];
  }

  // display chart container

  function displayChartContainer() {
    const chartContainerCoins = document.querySelector(".chartContainerCoins");

    chartContainerCoins.innerHTML = `
          <div id="chartContainer" style="height: 300px; width: 60%;"></div>
          `;
    chartContainerCoins.style.height = "80%";
  }

  // transform selected coin to desired title
  function transformCoinName(selectedCoin, coinValue) {
    return selectedCoin.name + coinValue + "$";
  }

  // update charts every two seconds with current coin price values
  async function updateChart() {
    // initial value
    const symbolString = getCoinBySymbolToChart();
    const coinSymbol = await getJson(
      `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${symbolString}&tsyms=USD`
    );

    for (let i = 0; i < selectedCoins.length; i++) {
      const coinSymbolName = selectedCoins[i].symbol.toUpperCase();
      const coinValue = coinSymbol[coinSymbolName].USD;

      if (!options.data[i]) {
        options.data[i] = {
          type: "line",
          xValueType: "dateTime",
          yValueFormatString: "###.00$",
          xValueFormatString: "hh:mm:ss TT",
          showInLegend: true,
          name: "",
          dataPoints: [],
        };
      }

      options.data[i].name = transformCoinName(selectedCoins[i], coinValue);

      const time = new Date(Date.now());

      options.data[i].dataPoints.push({
        x: time.getTime(),
        y: coinValue,
      });
    }

    $("#chartContainer").CanvasJSChart().render();
  }

  // if the array bigger then zero render the canvas js chart or show alert otherwise
  function showReports() {
    if (selectedCoins.length > 0) {
      $("#chartContainer").CanvasJSChart(options);

      graphInterval = setInterval(updateChart, updateInterval);
    } else {
      alertOfReportsContainer();
    }
  }
  // get coin symbol for api call
  function getCoinBySymbolToChart() {
    let coinSymbol = "";

    for (let i = 0; i < selectedCoins.length; i++) {
      const coin = selectedCoins[i].symbol;
      coinSymbol += coin + ",";
    }
    return coinSymbol;
  }

  // show alert info to remove one or more selected coins for to choose different coins
  function alertOfSelectedCoins() {
    const alertOfCoins = document.getElementById("alertOfCoins");
    alertOfCoins.classList.remove("hide");

    setTimeout(() => {
      alertOfCoins.classList.add("hide");
    }, 5000);
  }

  // hide the alert of search input
  function alertOfSearchCoins() {
    const alertOfSearch = document.getElementById("alertOfSearch");
    alertOfSearch.classList.remove("hide");
  }

  // show the alert of none selected coins in reports page
  function alertOfReportsContainer() {
    const container = document.getElementById("container");
    container.innerHTML = `
  <div class="alert-graph-coins-container ">
    
    <div id="alertOfGraph" class=" alert alert-danger d-flex align-items-center" role="alert">
        <div>
         <div class="text-alert-graph">
            <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="currentColor" class="bi bi-coin" viewBox="0 0 16 16">
                <path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518z"/>
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                <path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11m0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12"/>
              </svg>
              Select coins please to see the graph 

              <svg xmlns="http://www.w3.org/2000/svg" width="35" height="35" fill="currentColor" class="bi bi-coin" viewBox="0 0 16 16">
                <path d="M5.5 9.511c.076.954.83 1.697 2.182 1.785V12h.6v-.709c1.4-.098 2.218-.846 2.218-1.932 0-.987-.626-1.496-1.745-1.76l-.473-.112V5.57c.6.068.982.396 1.074.85h1.052c-.076-.919-.864-1.638-2.126-1.716V4h-.6v.719c-1.195.117-2.01.836-2.01 1.853 0 .9.606 1.472 1.613 1.707l.397.098v2.034c-.615-.093-1.022-.43-1.114-.9zm2.177-2.166c-.59-.137-.91-.416-.91-.836 0-.47.345-.822.915-.925v1.76h-.005zm.692 1.193c.717.166 1.048.435 1.048.91 0 .542-.412.914-1.135.982V8.518z"/>
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                <path d="M8 13.5a5.5 5.5 0 1 1 0-11 5.5 5.5 0 0 1 0 11m0 .5A6 6 0 1 0 8 2a6 6 0 0 0 0 12"/>
              </svg>
            </div>
        </div>
      </div>
</div>
  `;
    removeChartContainer();
  }
})();

// handle closing modal
const close = () => {
  const modalBody = document.getElementById("modalBody");
  modalBody.innerHTML = "";
};
