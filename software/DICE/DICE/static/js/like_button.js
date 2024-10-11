console.log("Reactions (likes and replies) ready!");

document.addEventListener('DOMContentLoaded', function() {
    console.log("Document is ready!");

    function toggleLike(button) {
        const icon = button.querySelector('.like-icon');
        const likeCountSpan = button.querySelector('.like-count');
        let originalText = likeCountSpan.textContent;
        let likeCount = parseInt(originalText);

        if (icon.classList.contains('bi-heart')) {
            icon.classList.remove('bi-heart', 'text-secondary');
            icon.classList.add('bi-heart-fill', 'text-danger');
            if (!originalText.includes('K') && !originalText.includes('M')) {
                likeCount++;
            }
        } else {
            icon.classList.remove('bi-heart-fill', 'text-danger');
            icon.classList.add('bi-heart', 'text-secondary');
            if (!originalText.includes('K') && !originalText.includes('M')) {
                likeCount--;
            }
        }

        if (originalText.includes('K') || originalText.includes('M')) {
            likeCountSpan.textContent = originalText;
        } else {
            likeCountSpan.textContent = likeCount.toString();
        }
        console.log("Like toggled for button:", button.id, "; New count:", likeCountSpan.textContent);
    }

    document.querySelectorAll('.like-button').forEach(button => {
        button.addEventListener('click', function() {
            toggleLike(button);
        });
    });

    function collectLikes() {
        let likesData = [];
        document.querySelectorAll('.like-button').forEach(button => {
            let docId = parseInt(button.getAttribute('id').replace('like_button_', ''));
            let icon = button.querySelector('.like-icon');
            let isLiked = icon.classList.contains('bi-heart-fill');
            likesData.push({ doc_id: docId, liked: isLiked });
        });
        console.log("Collected likes data:", JSON.stringify(likesData));
        return likesData;
    }

    function collectReplies() {
        let repliesData = [];
        document.querySelectorAll('.reply-modal-button').forEach(button => {
            let docId = parseInt(button.getAttribute('id').replace('reply_modal_button_', ''));
            const replyField = document.getElementById(`reply_to_item_${docId}`);
            const replyText = replyField.value.trim();
            repliesData.push({ doc_id: docId, reply: replyText, hasReply: !!replyText });
        });
        console.log("Collected replies data:", JSON.stringify(repliesData));
        return repliesData;
    }

    function collectDataHarmonized() {
        let likesData = collectLikes();
        let repliesData = collectReplies();
        return { likes: JSON.stringify(likesData), replies: JSON.stringify(repliesData) };
    }

    // Function to track clicks on sponsored posts and record their doc_id
    function trackSponsoredClicks(post) {
        let sponsoredData = JSON.parse(document.getElementById('sponsored_post_clicks').value || '[]');
        let docId = parseInt(post.getAttribute('id').replace('tweet_', ''));
        sponsoredData.push({ doc_id: docId });
        document.getElementById('sponsored_post_clicks').value = JSON.stringify(sponsoredData);
        console.log("Sponsored post click tracked. Data:", JSON.stringify(sponsoredData));
    }

    // Attach event listeners for clicks on sponsored posts using the 'sponsored-post' class
    document.querySelectorAll('.sponsored-post').forEach(post => {
        post.addEventListener('click', function() {
            trackSponsoredClicks(this.closest('.tweet-content'));
        });
    });

    document.getElementById('submitButtonTop').addEventListener('click', function(event) {
        let data = collectDataHarmonized();
        document.getElementById('likes_data').value = data.likes;
        document.getElementById('replies_data').value = data.replies;
        console.log("Data to send:", data);
    });
   document.getElementById('submitButtonBottom').addEventListener('click', function(event) {
        let data = collectDataHarmonized();
        document.getElementById('likes_data').value = data.likes;
        document.getElementById('replies_data').value = data.replies;
        console.log("Data to send:", data);
    });

    function displayTweetContent(docId, tweetContent) {
        const replyingTweetDiv = document.getElementById(`replying_tweet_${docId}`);
        replyingTweetDiv.textContent = tweetContent;
    }

    document.querySelectorAll('.reply-button').forEach(button => {
        button.addEventListener('click', function() {
            const docId = this.id.replace('reply_button_', '');
            let yourTweetContent = document.getElementById("tweet_text_" + docId).textContent;
            displayTweetContent(docId, yourTweetContent);
        });
    });
});
