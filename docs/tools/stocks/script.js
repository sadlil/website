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

  function calculateSharesToBuy(currentShares, currentAverage, currentPrice, targetAverage) {
    // --- Input Validation and Safety Checks ---

    if (
      typeof currentShares !== 'number' ||
      typeof currentAverage !== 'number' ||
      typeof currentPrice !== 'number' ||
      typeof targetAverage !== 'number'
    ) {
      return null; // Invalid input types
    }

    if (
      currentShares < 0 ||
      currentAverage < 0 ||
      currentPrice <= 0 || // Stock price should be positive
      targetAverage < 0
    ) {
      return null; // Negative values are generally not valid in this context
    }

    // If the target average is already achieved or better, no shares needed
    if (currentAverage <= targetAverage && currentAverage > 0) {
      return 0;
    }
    const sharesToBuy = (currentShares * (currentAverage - targetAverage)) / (targetAverage - currentPrice);
    if (targetAverage > currentAverage) {
      return null;
    }

    // If the target is impossible to reach (e.g., trying to get a lower average by buying at a higher price), return null
    if (sharesToBuy < 0) {
      return null;
    }

    return Math.ceil(sharesToBuy); // Rounds up to the nearest whole share (can't buy fractions of shares usually).
  }
});
