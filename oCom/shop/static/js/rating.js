// Function to create a star rating element based on a product's rating
function createStarRating(rating) {
    const starRatingElement = document.createElement('div');
    starRatingElement.classList.add('star-rating');

    const wholeNumber = Math.floor(rating);
    const decimalPart = rating - wholeNumber;

    for (let i = 0; i < wholeNumber; i++) {
        const star = document.createElement('span');
        star.classList.add('bi', 'bi-star-fill');
        starRatingElement.appendChild(star);
    }

    if (decimalPart >= 0.25 && decimalPart < 0.75) {
        const halfStar = document.createElement('span');
        halfStar.classList.add('bi', 'bi-star-half');
        starRatingElement.appendChild(halfStar);
    } else if (decimalPart >= 0.75) {
        const filledStar = document.createElement('span');
        filledStar.classList.add('bi', 'bi-star-fill');
        starRatingElement.appendChild(filledStar);
    }

    for (let i = Math.ceil(rating); i < 5; i++) {
        const unfilledStar = document.createElement('span');
        unfilledStar.classList.add('bi', 'bi-star');
        starRatingElement.appendChild(unfilledStar);
    }

    return starRatingElement;
}

// Get all elements with the class "card-text rating"
const cardTextElements = document.querySelectorAll('.card-text.rating');

// Loop through each card-text element
cardTextElements.forEach(cardTextElement => {
    // Extract the rating and rating count from the value and text content
    const rating = parseFloat(cardTextElement.getAttribute('value'));
    const ratingCount = parseInt(cardTextElement.textContent.trim());

    // Create the star rating element
    const starRating = createStarRating(rating);

    // Replace the content of the card-text element with the star rating and rating count
    cardTextElement.innerHTML = '';
    cardTextElement.appendChild(starRating);
    cardTextElement.appendChild(document.createTextNode(' ' + ratingCount + ' Reviews'));
});