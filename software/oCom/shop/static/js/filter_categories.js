// JavaScript code to handle dynamic filtering
    const tags = document.querySelectorAll('.tag');
    const cardItems = document.querySelectorAll('.card-item');

    tags.forEach(function(tag) {
        tag.addEventListener('click', function() {
            if (tag.classList.contains('active')) {
                tag.classList.remove('active');
            } else {
                // Deselect all other tags
                tags.forEach(function(otherTag) {
                    if (otherTag !== tag) {
                        otherTag.classList.remove('active');
                    }
                });
                tag.classList.add('active');
            }

            const activeTags = document.querySelectorAll('.tag.active');
            const selectedCategories = Array.from(activeTags).map(tag => tag.getAttribute('data-category'));

            cardItems.forEach(function(card) {
                const cardCategory = card.getAttribute('data-category');
                if (selectedCategories.length === 0 || selectedCategories.includes(cardCategory)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });