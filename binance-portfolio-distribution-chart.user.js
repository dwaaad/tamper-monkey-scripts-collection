// ==UserScript==
// @name         Binance - Portfolio Distribution Pie Chart
// @namespace    https://zachhardesty.com
// @author       Zach Hardesty <zachhardesty7@users.noreply.github.com> (https://github.com/zachhardesty7)
// @description  adds a simple visual representation of portfolio distribution (USD) on "balance" and "deposits & withdrawals" pages
// @copyright    2019, Zach Hardesty (https://zachhardesty.com/)
// @license      GPL-3.0-only; http://www.gnu.org/licenses/gpl-3.0.txt
// @version      1.0.1

// @homepageURL  https://github.com/zachhardesty7/tamper-monkey-scripts-collection/raw/master/binance-portfolio-distribution-chart.user.js
// @homepageURL  https://openuserjs.org/scripts/zachhardesty7/Binance_-_Portfolio_Distribution_Pie_Chart
// @supportURL   https://openuserjs.org/scripts/zachhardesty7/Binance_-_Portfolio_Distribution_Pie_Chart/issues

// @updateURL    https://openuserjs.org/meta/zachhardesty7/Binance_-_Portfolio_Distribution_Pie_Chart.meta.js
// @downloadURL  https://openuserjs.org/install/zachhardesty7/Binance_-_Portfolio_Distribution_Pie_Chart.user.js

// @match        https://www.binance.com/userCenter/balances*
// @match        https://www.binance.com/userCenter/depositWithdraw*
// @require      https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.4.0/Chart.min.js
// @require      https://gist.githubusercontent.com/zachhardesty7/ea61364567ce66b94edb81f922efecef/raw/c23ba499828992d632266194384c72ff28dfad6e/onElementReady.js
// ==/UserScript==
/* global onElementReady */

const chartColors = {
  red: "rgb(255, 99, 132)",
  orange: "rgb(255, 159, 64)",
  yellow: "rgb(255, 205, 86)",
  green: "rgb(75, 192, 192)",
  blue: "rgb(54, 162, 235)",
  grey: "rgb(201, 203, 207)",
  purple: "rgb(153, 102, 255)",
  teal: "#59d2fe",
}

const chartConfig = {
  type: "pie",
  data: {
    datasets: [
      {
        data: [],
        backgroundColor: [],
        label: "Dataset 1",
      },
    ],
    labels: [],
  },
  options: {
    responsive: false,
    layout: {
      padding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 20,
      },
    },
    title: {
      display: true,
      text: "Portfolio Distribution",
    },
  },
}

/**
 * finds key with max val in object
 *
 * @param {{}} obj - arbitrary obj
 * @returns {string} matching key
 */
function getMaxInObject(obj) {
  let maxKey = ""
  let maxVal = 0
  Object.keys(obj).forEach((key) => {
    if (obj[key] > maxVal) {
      maxVal = obj[key]
      maxKey = key
    }
  })

  return maxKey
}

// begin program once data has loaded
onElementReady("span.btn.btn-deposit.ng-binding.ng-scope", true, () => {
  // build canvas el
  const page = document.querySelector(".chargeWithdraw-title")
  const canvas = document.createElement("canvas")
  canvas.id = "zh-chart"
  canvas.height = 250
  canvas.width = 250
  canvas.setAttribute(
    "style",
    "height: 250px; width: 250px; display: block; float: right"
  )

  // insert canvas and capture el
  page.append(canvas)
  const ctx = /** @type {HTMLCanvasElement} */ (document.querySelector(
    "#zh-chart"
  )).getContext("2d")

  // scrape value of portfolio data in BTC
  const portfolioRawData = document.querySelectorAll(".td.ng-scope")
  const portfolio = {}
  portfolioRawData.forEach((el) => {
    const name = el.firstElementChild.children[0].textContent.replace(/\s/g, "")
    const val = Number.parseFloat(
      el.firstElementChild.children[5].firstChild.textContent
    )
    if (val !== 0) {
      portfolio[name] = val
    }
  })

  // get cur BTC to USD conversion rate
  fetch("https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD")
    .then((response) => response.json())
    .then((data) => {
      // capture 6 largest assets for pie chart
      for (let i = 0; i < 6; i += 1) {
        const maxName = getMaxInObject(portfolio)
        const maxVal = (portfolio[maxName] * data.USD).toFixed(2)
        chartConfig.data.datasets[0].data.push(maxVal)
        chartConfig.data.labels.push(maxName)
        delete portfolio[maxName]
      }

      // accumulate remaining assets for "other" category of pie chart
      let otherCryptosVal = 0
      Object.values(portfolio).forEach((tickerVal) => {
        otherCryptosVal += tickerVal
      })

      // update chart data with other category
      chartConfig.data.datasets[0].data.push(
        (otherCryptosVal * data.USD).toFixed(2)
      )
      chartConfig.data.labels.push("other")

      // randomize color order and update config
      const keys = Object.keys(chartColors)
      keys.sort(() => Math.random() - 0.5)
      for (let i = 0; i < chartConfig.data.datasets[0].data.length; i += 1) {
        chartConfig.data.datasets[0].backgroundColor.push(keys[i])
      }

      // generate pie chart
      window.myPie = new /** @type {any} */ (window).Chart(ctx, chartConfig)

      return null
    })
    .catch((error) => {
      console.log(error)
    })
})
