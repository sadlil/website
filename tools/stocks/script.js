document.addEventListener('DOMContentLoaded', function () {
  const currentSharesInput = document.getElementById('current-shares');
  const currentAverageInput = document.getElementById('current-average');
  const newSharesInput = document.getElementById('new-shares');
  const newPriceInput = document.getElementById('new-price');
  const targetAverageInput = document.getElementById('target-average');
  const calculateAverageButton = document.getElementById('calculate-average');
  const calculateSharesButton = document.getElementById('calculate-shares');
  const resultText = document.getElementById('result-text');

  calculateAverageButton.addEventListener('click', function () {
    const currentShares = parseFloat(currentSharesInput.value);
    const currentAverage = parseFloat(currentAverageInput.value);
    const newShares = parseFloat(newSharesInput.value);
    const newPrice = parseFloat(newPriceInput.value);

    if (isNaN(currentShares) || isNaN(currentAverage) || isNaN(newShares) || isNaN(newPrice)) {
      resultText.textContent = "Please enter valid numbers.";
      return;
    }

    const newAverage = calculateNewAverage(currentShares, currentAverage, newShares, newPrice);
    resultText.textContent = `New Average Price: ${newAverage.toFixed(2)}`;
  });

  calculateSharesButton.addEventListener('click', function () {
    const currentShares = parseFloat(currentSharesInput.value);
    const currentAverage = parseFloat(currentAverageInput.value);
    const newPrice = parseFloat(newPriceInput.value);
    const targetAverage = parseFloat(targetAverageInput.value);

    if (isNaN(currentShares) || isNaN(currentAverage) || isNaN(newPrice) || isNaN(targetAverage)) {
      resultText.textContent = "Please enter valid numbers.";
      return;
    }

    const sharesNeeded = calculateSharesToBuy(currentShares, currentAverage, newPrice, targetAverage);
    resultText.textContent = `Shares to Buy: ${sharesNeeded.toFixed(0)}`;
  });

  function calculateNewAverage(currentShares, currentAverage, newShares, newPrice) {
    const totalCost = (currentShares * currentAverage) + (newShares * newPrice);
    const totalShares = currentShares + newShares;
    return totalCost / totalShares;
  }

  function calculateSharesToBuy(currentShares, currentAverage, newPrice, targetAverage) {
    if (newPrice === targetAverage) {
      return 0; // No new shares needed if the new price is the same as the target average
    }

    const totalCost = (currentShares * currentAverage);
    const totalTargetCost = (currentShares * targetAverage);

    const neededShares = (totalTargetCost - totalCost) / (newPrice - targetAverage);
    return neededShares;
  }
});