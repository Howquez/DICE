console.log("Reactions (likes, replies, and promoted content clicks) ready!");

document.addEventListener('DOMContentLoaded', function() {
    console.log("Document is ready!");

    function toggleLike(button) {
        const icon = button.querySelector('.like-icon');
        const likeCountSpan = button.querySelector('.like-count');
        let originalText = likeCountSpan.textContent;
        let likeCount = parseInt(originalText);

        // Detect icon type: heart (Twitter/Instagram) or thumbs-up (LinkedIn)
        let isHeart = icon.classList.contains('bi-heart') || icon.classList.contains('bi-heart-fill');
        let isThumbs = icon.classList.contains('bi-hand-thumbs-up') || icon.classList.contains('bi-hand-thumbs-up-fill');

        if (isHeart) {
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
        } else if (isThumbs) {
            if (icon.classList.contains('bi-hand-thumbs-up')) {
                icon.classList.remove('bi-hand-thumbs-up');
                icon.classList.add('bi-hand-thumbs-up-fill', 'text-primary');
                if (!originalText.includes('K') && !originalText.includes('M')) {
                    likeCount++;
                }
            } else {
                icon.classList.remove('bi-hand-thumbs-up-fill', 'text-primary');
                icon.classList.add('bi-hand-thumbs-up');
                if (!originalText.includes('K') && !originalText.includes('M')) {
                    likeCount--;
                }
            }
        }

        let newText = (originalText.includes('K') || originalText.includes('M'))
            ? originalText
            : likeCount.toString();
        likeCountSpan.textContent = newText;

        // Also update the visible like count in the stats bar (for layouts where
        // the displayed count is outside the .like-button, e.g. LinkedIn)
        let post = button.closest('.linkedin-post') || button.closest('.insta-post') || button.closest('.tweet-content');
        if (post) {
            post.querySelectorAll('.like-count').forEach(span => {
                if (span !== likeCountSpan) {
                    span.textContent = newText;
                }
            });
        }

        console.log("Like toggled for button:", button.id, "; New count:", newText);
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
            let isLiked = icon.classList.contains('bi-heart-fill') || icon.classList.contains('bi-hand-thumbs-up-fill');
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

    // Helper to get doc_id from element (supports both Twitter and Instagram formats)
    function getDocIdFromElement(element) {
        // Try Twitter format first (.tweet-content with id="tweet_X")
        let tweetContent = element.closest('.tweet-content');
        if (tweetContent && tweetContent.id) {
            return parseInt(tweetContent.id.replace('tweet_', ''));
        }
        // Try Instagram format (.insta-post with id="X")
        let instaPost = element.closest('.insta-post');
        if (instaPost && instaPost.id) {
            return parseInt(instaPost.id);
        }
        // Try LinkedIn format (.linkedin-post with id="X")
        let linkedinPost = element.closest('.linkedin-post');
        if (linkedinPost && linkedinPost.id) {
            return parseInt(linkedinPost.id);
        }
        return null;
    }

    function initializePromotedData() {
        let promotedData = [];
        document.querySelectorAll('.promoted-content').forEach(tweet => {
            let docId = getDocIdFromElement(tweet);
            if (docId !== null) {
                promotedData.push({ doc_id: docId, clicked: false });
            }
        });
        document.getElementById('promoted_post_clicks').value = JSON.stringify(promotedData);
        return promotedData;
    }

    let promotedData = initializePromotedData();

    function trackPromotedClicks(element) {
        let docId = getDocIdFromElement(element);
        if (docId === null) return;

        promotedData = JSON.parse(document.getElementById('promoted_post_clicks').value);

        let item = promotedData.find(item => item.doc_id === docId);
        if (item) {
            item.clicked = true;
        } else {
            promotedData.push({ doc_id: docId, clicked: true });
        }

        document.getElementById('promoted_post_clicks').value = JSON.stringify(promotedData);
        console.log("Promoted content click tracked. Data:", JSON.stringify(promotedData));
    }

    document.querySelectorAll('.promoted-content').forEach(tweet => {
        const clickableElements = tweet.querySelectorAll('.spons-post p, .spons-post a, .spons-post img');
        clickableElements.forEach(element => {
            element.addEventListener('click', function(event) {
                event.preventDefault();
                trackPromotedClicks(tweet);

                if (element.tagName === 'A' || element.parentElement.tagName === 'A') {
                    const link = element.tagName === 'A' ? element : element.parentElement;
                    setTimeout(() => {
                        window.open(link.href, '_blank');
                    }, 100);
                }
            });
        });
    });

    function collectDataHarmonized() {
        let likesData = collectLikes();
        let repliesData = collectReplies();
        let promotedClicksData = JSON.parse(document.getElementById('promoted_post_clicks').value);
        return {
            likes: JSON.stringify(likesData),
            replies: JSON.stringify(repliesData),
            promoted_clicks: JSON.stringify(promotedClicksData)
        };
    }

    const submitButtonTop = document.getElementById('submitButtonTop');
    if (submitButtonTop) {
        submitButtonTop.addEventListener('click', function(event) {
            let data = collectDataHarmonized();
            document.getElementById('likes_data').value = data.likes;
            document.getElementById('replies_data').value = data.replies;
            document.getElementById('promoted_post_clicks').value = data.promoted_clicks;
            console.log("Data to send:", data);
        });
    }

    const submitButtonBottom = document.getElementById('submitButtonBottom');
    if (submitButtonBottom) {
        submitButtonBottom.addEventListener('click', function(event) {
            let data = collectDataHarmonized();
            document.getElementById('likes_data').value = data.likes;
            document.getElementById('replies_data').value = data.replies;
            document.getElementById('promoted_post_clicks').value = data.promoted_clicks;
            console.log("Data to send:", data);
        });
    }

    const submitButton = document.getElementById('submitButton');
    if (submitButton) {
        submitButton.addEventListener('click', function(event) {
            let data = collectDataHarmonized();
            document.getElementById('likes_data').value = data.likes;
            document.getElementById('replies_data').value = data.replies;
            document.getElementById('promoted_post_clicks').value = data.promoted_clicks;
            console.log("Data to send:", data);
        });
    }

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

    // Increment visible comment count when a reply is posted
    document.querySelectorAll('.reply-modal-button').forEach(button => {
        button.addEventListener('click', function() {
            const docId = this.id.replace('reply_modal_button_', '');
            const replyField = document.getElementById(`reply_to_item_${docId}`);
            if (replyField && replyField.value.trim()) {
                // Find the reply-count span(s) for this post and increment
                let post = document.getElementById(docId)                           // LinkedIn/Instagram (id="doc_id")
                        || document.getElementById('tweet_' + docId);               // Twitter (id="tweet_doc_id")
                if (post) {
                    post.querySelectorAll('.reply-count').forEach(span => {
                        let count = parseInt(span.textContent);
                        if (!isNaN(count)) {
                            span.textContent = (count + 1).toString();
                        }
                    });
                }
                console.log("Comment count incremented for doc_id:", docId);
            }
        });
    });
});