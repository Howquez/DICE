console.log("inconsequential interactions ready!");

/*
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
*/



// REPOSTS (Frontend only)
var repostButtons = document.querySelectorAll(".repost-button");

repostButtons.forEach(function(repostButton) {
    var repostCount = repostButton.querySelector(".repost-count");
    var repostIcon  = repostButton.querySelector(".repost-icon");

    repostButton.addEventListener("click", function() {
      if (repostButton.classList.contains("reposted")) {
        repostButton.classList.remove("reposted");
        repostCount.textContent = (parseInt(repostCount.textContent) - 1).toString();
        repostIcon.className="bi bi-arrow-repeat text-secondary repost-icon";
        repostIcon.removeAttribute("style")
    } else {
        repostButton.classList.add("reposted");
        repostCount.textContent = (parseInt(repostCount.textContent) + 1).toString();
        repostIcon.className="bi bi-arrow-repeat text-primary repost-icon";
        repostIcon.style="-webkit-text-stroke: 0.5px"
    }
});
});


// LIKES
/*var likeButtons = document.querySelectorAll(".like-button");

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
*/


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