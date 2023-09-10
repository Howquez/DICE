console.log('add to cart: ready!')

// Get the common ancestor element of all buttons
const buttonContainer = document.getElementById("feed");
var doc_id;

// Add a single click event listener to the container
buttonContainer.addEventListener("click", function(event) {
  // Check if the clicked element is a button with the 'myButton' class
  if (event.target.classList.contains("add-to-cart")) {
    doc_id = event.target.value
    console.log(doc_id);
    liveSend(doc_id)

  }
});

const tableBody = document.querySelector("#cart-summary tbody");
const totalPriceElement = document.querySelector("#total_price");
let totalPrice = 0;

function formatNumber(number) {
  return number.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// Function to update the total price
function updateTotalPrice() {
  totalPrice = 0;
  // Loop through all rows in the table and sum the prices
  tableBody.querySelectorAll("tr").forEach((row) => {
    const valueCell = row.querySelector(".value-cell");
    if (valueCell) {
      const price = parseFloat(valueCell.textContent.replace(/,/g, ""));
      if (!isNaN(price)) {
        totalPrice += price;
      }
    }
  });
  // Format the total price with a comma as a thousands separator and two decimal places
  const formattedTotalPrice = formatNumber(totalPrice);
  // Update the total price element with the formatted total
  totalPriceElement.textContent = formattedTotalPrice;
}

function liveRecv(data){
    const newRow = document.createElement("tr");

    const product = document.createElement("td");
    product.textContent = data[0];
    newRow.appendChild(product);

    const price = document.createElement("td");
    price.textContent = formatNumber(data[1]);
    price.className = "value-cell text-end";
    newRow.appendChild(price);

    const currency = document.createElement("td");
    currency.textContent = 'USD';
    currency.className = "currency text-start";
    newRow.appendChild(currency);

    const close = document.createElement("td");
    const iconElement = document.createElement("i");
    iconElement.className = "bi bi-x";
    iconElement.addEventListener("click", function () {
        tableBody.removeChild(newRow);
        updateTotalPrice();
        liveSend('-' + doc_id)
      });
    close.appendChild(iconElement);
    newRow.appendChild(close);

    tableBody.appendChild(newRow);

    updateTotalPrice();
}


// also format all other prices

// Call the formatNumber function for all elements with the 'product_price' class when the page loads
document.addEventListener("DOMContentLoaded", function () {
  const productPriceElements = document.querySelectorAll(".product-price");

  productPriceElements.forEach((element) => {
    const currentText = element.textContent;
    const currentNumber = parseFloat(currentText.replace(/,/g, ""));

    if (!isNaN(currentNumber)) {
      const formattedNumber = formatNumber(currentNumber);
      element.textContent = formattedNumber;
    }
  });
});