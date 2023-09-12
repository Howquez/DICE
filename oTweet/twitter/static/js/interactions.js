console.log("interactions ready!");

// REPLIES
var replyButtons = document.querySelectorAll(".reply-button");
var ID;
var replyModalButton;

replyButtons.forEach(function(replyButton) {
    replyButton.addEventListener("click", function() {
        ID = replyButton.id.match(/\d+/)[0]
        replyModalButton = document.getElementById("reply_modal_button_" + ID);

        var replyingTweet = document.getElementById("replying_tweet_" + ID);
        replyingTweet.innerHTML=document.getElementById("tweet_" + ID).innerHTML;
    });
});

//replyModalButton.addEventListener("click", function() {

function replyOneUp(){
    var replyButton = document.getElementById("reply_button_" + ID);
    var replyCount = document.getElementById("reply_count_" + ID);
    var replyIcon  = document.getElementById("reply_icon_" + ID);

    if (!replyButton.classList.contains("replied")){
        replyButton.classList.add("replied");
        replyCount.textContent = (parseInt(replyCount.textContent) + 1).toString();
        replyIcon.className="bi bi-chat-fill text-primary reply-icon";
    };
};




// RETWEETS (Frontend only)
var retweetButtons = document.querySelectorAll(".retweet-button");

retweetButtons.forEach(function(retweetButton) {
    var retweetCount = retweetButton.querySelector(".retweet-count");
    var retweetIcon  = retweetButton.querySelector(".retweet-icon");

    retweetButton.addEventListener("click", function() {
      if (retweetButton.classList.contains("retweeted")) {
        retweetButton.classList.remove("retweeted");
        retweetCount.textContent = (parseInt(retweetCount.textContent) - 1).toString();
        retweetIcon.className="bi bi-arrow-repeat text-secondary retweet-icon";
        retweetIcon.removeAttribute("style")
    } else {
        retweetButton.classList.add("retweeted");
        retweetCount.textContent = (parseInt(retweetCount.textContent) + 1).toString();
        retweetIcon.className="bi bi-arrow-repeat text-primary retweet-icon";
        retweetIcon.style="-webkit-text-stroke: 0.5px"
    }
});
});


// LIKES
var likeButtons = document.querySelectorAll(".like-button");

likeButtons.forEach(function(likeButton) {
    var likeField = likeButton.querySelector(".like-field");
    var likeCount = likeButton.querySelector(".like-count");
    var likeIcon  = likeButton.querySelector(".like-icon");

    likeButton.addEventListener("click", function() {
      if (likeButton.classList.contains("liked")) {
        likeButton.classList.remove("liked");
        likeField.value = 0;
        likeCount.textContent = (parseInt(likeCount.textContent) - 1).toString();
        likeIcon.className="bi bi-heart text-secondary like-icon";
    } else {
        likeButton.classList.add("liked");
        likeField.value = 1;
        likeCount.textContent = (parseInt(likeCount.textContent) + 1).toString();
        likeIcon.className="bi bi-heart-fill text-danger like-icon";

        if (likeButton.id == "attention_check") {
            var redirect_button = document.getElementById("submitButton")
            var submit_button = document.createElement("button")
            submit_button.setAttribute("type", "submit")
            submit_button.className = "btn btn-outline-success m-2"
            submit_button.innerHTML = "Questionnaire"
            redirect_button.parentNode.replaceChild(submit_button, redirect_button);
            likeButton.id = "attention_checked";
        }
    }
});
});



// SHARES (Frontend only)
var shareButtons = document.querySelectorAll(".share-button");

shareButtons.forEach(function(shareButton) {
    var shareIcon  = shareButton.querySelector(".share-icon");

    shareButton.addEventListener("click", function() {
      if (shareButton.classList.contains("shared")) {
        shareButton.classList.remove("shared");
        shareIcon.className="bi bi-upload text-secondary share-icon";
        shareIcon.removeAttribute("style")
    } else {
        shareButton.classList.add("shared");
        shareIcon.className="bi bi-upload text-primary share-icon";
        shareIcon.style="-webkit-text-stroke: 0.5px"
    }
});
});