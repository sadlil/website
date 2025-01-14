document.addEventListener('DOMContentLoaded', function () {
  const currentSharesInput = document.getElementById('current-shares');
  const currentAverageInput = document.getElementById('current-average');

  const newSharesInput = document.getElementById('new-shares');
  const newPriceInput = document.getElementById('new-price');

  const currentPriceInput = document.getElementById('current-price');
  const targetAverageInput = document.getElementById('target-average');

  const sellAmountInput = document.getElementById('gains-shares');
  const sellPriceInput = document.getElementById('gains-price');

  const calculateAverageButton = document.getElementById('calculate-average');
  const calculateSharesButton = document.getElementById('calculate-shares');
  const calculateGainsButton = document.getElementById('calculate-gains');

  const resultTextAvg = document.getElementById('result-text-avg');
  const resultTextShare = document.getElementById('result-text-shares');
  const resultTextGains = document.getElementById('result-text-gains');


  calculateAverageButton.addEventListener('click', function () {
    const currentShares = parseFloat(currentSharesInput.value);
    const currentAverage = parseFloat(currentAverageInput.value);
    const newShares = parseFloat(newSharesInput.value);
    const newPrice = parseFloat(newPriceInput.value);

    if (isNaN(currentShares) || isNaN(currentAverage) || isNaN(newShares) || isNaN(newPrice)) {
      resultTextAvg.textContent = "Please enter valid numbers.";
      return;
    }

    const newAverage = calculateNewAverage(currentShares, currentAverage, newShares, newPrice);
    resultTextAvg.textContent = `${newAverage.toFixed(2)}`;
  });

  calculateSharesButton.addEventListener('click', function () {
    const currentShares = parseFloat(currentSharesInput.value);
    const currentAverage = parseFloat(currentAverageInput.value);
    const newPrice = parseFloat(currentPriceInput.value);
    const targetAverage = parseFloat(targetAverageInput.value);

    if (isNaN(currentShares) || isNaN(currentAverage) || isNaN(newPrice) || isNaN(targetAverage)) {
      resultTextShare.textContent = "Please enter valid numbers.";
      return;
    }

    if (targetAverage <= newPrice) {
      resultTextShare.textContent = "Target average needs to be at least 0.01 higher than the current price";
      return;
    }

    const sharesNeeded = calculateSharesToBuy(currentShares, currentAverage, newPrice, targetAverage);
    resultTextShare.textContent = `${sharesNeeded.toFixed(2)}`;
  });

  calculateGainsButton.addEventListener('click', function () {
    const currentShares = parseFloat(currentSharesInput.value);
    const currentAverage = parseFloat(currentAverageInput.value);
    const sellAmount = parseFloat(sellAmountInput.value);
    const sellPrice = parseFloat(sellPriceInput.value);

    if (isNaN(currentShares) || isNaN(currentAverage) || isNaN(sellAmount) || isNaN(sellPrice)) {
      resultTextGains.textContent = "Please enter valid numbers.";
      return;
    }

    const gains = ((sellAmount * sellPrice) - (sellAmount * currentAverage));
    resultTextGains.textContent = `${gains.toFixed(2)}`;
  });

  function calculateNewAverage(currentShares, currentAverage, newShares, newPrice) {
    const totalCost = (currentShares * currentAverage) + (newShares * newPrice);
    const totalShares = currentShares + newShares;
    return totalCost / totalShares;
  }

  function calculateSharesToBuy(currentShares, currentAverage, currentPrice, targetAverage) {
    const sharesToBuy = ((currentShares * (targetAverage - currentAverage)) / (currentPrice - targetAverage))
    console.log(sharesToBuy);

    // If the target is impossible to reach (e.g., trying to get a lower average by buying at a higher price), return null
    if (sharesToBuy < 0) {
      return 0;
    }
    return sharesToBuy;
  }
});
