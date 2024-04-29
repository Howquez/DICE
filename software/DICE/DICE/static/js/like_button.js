console.log("Reactions (likes and replies) ready!");

document.addEventListener('DOMContentLoaded', function() {
    // Function to toggle the like state of a button
    function toggleLike(button) {
        const icon = button.querySelector('.like-icon');
        const likeCountSpan = button.querySelector('.like-count');
        let originalText = likeCountSpan.textContent;
        let likeCount = parseInt(originalText);

        if (icon.classList.contains('bi-heart')) {
            icon.classList.remove('bi-heart', 'text-secondary');
            icon.classList.add('bi-heart-fill', 'text-danger');
            // Only increment if the original text does not contain 'K' or 'M'
            if (!originalText.includes('K') && !originalText.includes('M')) {
                likeCount++;
            }
        } else {
            icon.classList.remove('bi-heart-fill', 'text-danger');
            icon.classList.add('bi-heart', 'text-secondary');
            // Only decrement if the original text does not contain 'K' or 'M'
            if (!originalText.includes('K') && !originalText.includes('M')) {
                likeCount--;
            }
        }

        // Convert number back to string with possible 'K' or 'M' if originally present
        if (originalText.includes('K') || originalText.includes('M')) {
            likeCountSpan.textContent = originalText; // keep the original text if 'K' or 'M' is involved
        } else {
            likeCountSpan.textContent = likeCount.toString(); // update with new count if no 'K' or 'M'
        }
    }

    // Attach event listeners to all like buttons
    document.querySelectorAll('.like-button').forEach(button => {
        button.addEventListener('click', function() {
            toggleLike(button);
        });
    });

    // Function to collect likes, ensuring doc_id is numeric
    function collectLikes() {
        let likesData = [];
        document.querySelectorAll('.like-button').forEach(button => {
            let docId = parseInt(button.getAttribute('id').replace('like_button_', ''));
            let icon = button.querySelector('.like-icon');
            let isLiked = icon.classList.contains('bi-heart-fill');
            likesData.push({ doc_id: docId, liked: isLiked });
        });
        return likesData;
    }

    // Function to collect replies, harmonized with numeric doc_id
    function collectReplies() {
        let repliesData = [];
        document.querySelectorAll('.reply-modal-button').forEach(button => {
            let docId = parseInt(button.getAttribute('id').replace('reply_modal_button_', ''));
            const replyField = document.getElementById(`reply_to_item_${docId}`);
            const replyText = replyField.value.trim();
            repliesData.push({ doc_id: docId, reply: replyText, hasReply: !!replyText });
        });
        return repliesData;
    }

    // Function to collect both likes and replies data, harmonizing their formats
    function collectDataHarmonized() {
        let likesData = collectLikes();  // Collecting likes data
        let repliesData = collectReplies();  // Collecting replies data with the harmonized approach
        return { likes: JSON.stringify(likesData), replies: JSON.stringify(repliesData) };
    }

    // Event listener for the submit button
    document.getElementById('submitButton').addEventListener('click', function(event) {
        let data = collectDataHarmonized();
        document.getElementById('likes_data').value = data.likes;
        document.getElementById('replies_data').value = data.replies;
        console.log("Data to send:", data);
    });

    // Function to display tweet content in the modal
    function displayTweetContent(docId, tweetContent) {
        const replyingTweetDiv = document.getElementById(`replying_tweet_${docId}`);
        replyingTweetDiv.textContent = tweetContent;
    }

    // Attach event listeners to open modal and display tweet content
    document.querySelectorAll('.reply-button').forEach(button => {
        button.addEventListener('click', function() {
            const docId = this.id.replace('reply_button_', '');
            let yourTweetContent = document.getElementById("tweet_text_" + docId).textContent;
            displayTweetContent(docId, yourTweetContent);
        });
    });
});


document.querySelectorAll('.reply-modal-button').forEach(button => {
    button.addEventListener('click', function() {
        let docId = this.id.match(/\d+/)[0]; // Extract document ID from button's ID
        let replyIcon = document.getElementById(`reply_icon_${docId}`);
        let replyCountSpan = document.getElementById(`reply_count_${docId}`);
        let originalText = replyCountSpan.textContent;
        let replyCount = parseInt(originalText.replace(/[^0-9]/g, '')); // Parse integer removing 'K', 'M'

        if (!originalText.includes('K') && !originalText.includes('M')) {
            replyCount++; // Increment if no 'K' or 'M'
            replyCountSpan.textContent = replyCount.toString(); // Update the display with the new count
        }

        // Change icon to filled version and update color to primary
        replyIcon.classList.remove('bi-chat', 'text-secondary');
        replyIcon.classList.add('bi-chat-fill', 'text-primary');
        replyCountSpan.classList.remove('text-secondary');
        replyCountSpan.classList.add('text-primary');

    });
});