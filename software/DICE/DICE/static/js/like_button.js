console.log("Reactions (likes and replies) ready!");

document.addEventListener('DOMContentLoaded', function() {
    // Function to toggle the like state of a button
    function toggleLike(button) {
        const icon = button.querySelector('.like-icon');
        const likeCountSpan = button.querySelector('.like-count');
        let likeCount = parseInt(likeCountSpan.textContent);

        if (icon.classList.contains('bi-heart')) {
            icon.classList.remove('bi-heart', 'text-secondary');
            icon.classList.add('bi-heart-fill', 'text-danger');
            likeCount++;
        } else {
            icon.classList.remove('bi-heart-fill', 'text-danger');
            icon.classList.add('bi-heart', 'text-secondary');
            likeCount--;
        }

        likeCountSpan.textContent = likeCount.toString();
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
