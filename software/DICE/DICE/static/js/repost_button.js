console.log("Reposts ready!");

const INSTA_FIRST_REPOST_KEY = 'dice_insta_first_repost_shown';
let lastInstagramRepostedButton = null;

function getDocIdFromRepostButton(button) {
    const buttonId = button.getAttribute('id');
    if (buttonId && buttonId.startsWith('repost_button_')) {
        return parseInt(buttonId.replace('repost_button_', ''), 10);
    }

    const post = button.closest('.insta-post')
        || button.closest('.tweet-content')
        || button.closest('.linkedin-post');
    if (post && post.id) {
        if (post.id.startsWith('tweet_')) {
            return parseInt(post.id.replace('tweet_', ''), 10);
        }
        return parseInt(post.id, 10);
    }
    return null;
}

function updateRepostCountDisplay(button, newText) {
    const repostCountSpan = button.querySelector('.repost-count');
    if (repostCountSpan) {
        repostCountSpan.textContent = newText;
    }

    const post = button.closest('.insta-post')
        || button.closest('.tweet-content')
        || button.closest('.linkedin-post');
    if (post) {
        post.querySelectorAll('.repost-count').forEach(function(span) {
            if (span !== repostCountSpan) {
                span.textContent = newText;
            }
        });
    }
}

function setInstagramRepostIconActive(button, isActive) {
    const instaIcon = button.querySelector('.insta-repost-icon');
    if (!instaIcon) {
        return false;
    }

    const defaultSvg = instaIcon.querySelector('.repost-icon-default');
    const checkSvg = instaIcon.querySelector('.repost-icon-check');
    if (!defaultSvg || !checkSvg) {
        return false;
    }

    if (isActive) {
        defaultSvg.classList.add('d-none');
        checkSvg.classList.remove('d-none');
    } else {
        defaultSvg.classList.remove('d-none');
        checkSvg.classList.add('d-none');
    }
    return true;
}

function setRepostIconActive(button, isActive) {
    if (setInstagramRepostIconActive(button, isActive)) {
        return;
    }

    const icon = button.querySelector('.repost-icon');
    if (!icon) {
        return;
    }

    const isLinkedIn = icon.classList.contains('bi-arrow-left-right');

    if (isActive) {
        icon.classList.add('repost-active');
        if (isLinkedIn) {
            icon.classList.add('text-primary');
        } else {
            icon.className = 'bi bi-arrow-repeat text-primary repost-icon';
            icon.style.fontWeight = 'bold';
        }
    } else {
        icon.classList.remove('repost-active', 'text-primary');
        icon.style.fontWeight = '';
        if (isLinkedIn) {
            icon.className = 'bi bi-arrow-left-right repost-icon';
            icon.style.fontSize = '20px';
        } else {
            icon.className = 'bi bi-arrow-repeat text-secondary repost-icon';
            icon.removeAttribute('style');
        }
    }
}

function toggleRepost(button) {
    const repostCount = button.querySelector('.repost-count');
    const originalText = repostCount ? repostCount.textContent : '0';
    let repostNum = parseInt(originalText.replace(/[^0-9]/g, ''), 10) || 0;
    const hasFormattedCount = originalText.includes('K') || originalText.includes('M');

    if (button.classList.contains('reposted')) {
        button.classList.remove('reposted');
        if (!hasFormattedCount && repostCount) {
            repostNum -= 1;
            updateRepostCountDisplay(button, repostNum.toString());
        }
        setRepostIconActive(button, false);
    } else {
        button.classList.add('reposted');
        if (!hasFormattedCount && repostCount) {
            repostNum += 1;
            updateRepostCountDisplay(button, repostNum.toString());
        }
        setRepostIconActive(button, true);
    }

    console.log("toggleRepost - button.id");
    console.log(button.id);
}

function undoRepost(button) {
    if (!button || !button.classList.contains('reposted')) {
        return;
    }

    toggleRepost(button);
}

function showFirstInstagramRepostModal() {
    if (sessionStorage.getItem(INSTA_FIRST_REPOST_KEY)) {
        return;
    }

    sessionStorage.setItem(INSTA_FIRST_REPOST_KEY, 'true');
    const firstRepostModal = document.getElementById('firstRepostModal');
    if (!firstRepostModal || typeof bootstrap === 'undefined') {
        return;
    }

    const confirmModal = new bootstrap.Modal(firstRepostModal);
    confirmModal.show();
}

function handleInstagramRepostClick(button) {
    if (button.classList.contains('reposted')) {
        undoRepost(button);
        lastInstagramRepostedButton = null;
        return;
    }

    toggleRepost(button);
    lastInstagramRepostedButton = button;
    showFirstInstagramRepostModal();
}

function handleStandardRepostClick(button) {
    toggleRepost(button);
}

function collectReposts() {
    const repostsData = [];
    document.querySelectorAll('.repost-button').forEach(function(button) {
        const docId = getDocIdFromRepostButton(button);
        if (docId === null) {
            return;
        }

        repostsData.push({
            doc_id: docId,
            reposted: button.classList.contains('reposted'),
            repost_note: ''
        });
    });

    console.log("collectReposts - repostsData");
    console.log(repostsData);
    return repostsData;
}

function serializeRepostsToField() {
    const repostsField = document.getElementById('reposts_data');
    if (!repostsField) {
        return;
    }

    const repostsData = collectReposts();
    repostsField.value = JSON.stringify(repostsData);

    console.log("serializeRepostsToField - repostsData");
    console.log(repostsData);
}

function initRepostSubmitHandlers() {
    const submitButtonIds = ['submitButtonTop', 'submitButtonBottom', 'submitButton'];

    submitButtonIds.forEach(function(buttonId) {
        const submitButton = document.getElementById(buttonId);
        if (!submitButton || submitButton.dataset.repostSubmitBound === 'true') {
            return;
        }

        submitButton.dataset.repostSubmitBound = 'true';
        submitButton.addEventListener('click', function() {
            serializeRepostsToField();
        });
    });
}

function initRepostButtons() {
    const instaFeed = document.getElementById('insta_feed');

    if (instaFeed && !instaFeed.dataset.repostBound) {
        instaFeed.dataset.repostBound = 'true';
        instaFeed.addEventListener('click', function(event) {
            const button = event.target.closest('.repost-button');
            if (!button || !instaFeed.contains(button)) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();
            handleInstagramRepostClick(button);
        });

        const undoButton = document.getElementById('firstRepostUndo');
        if (undoButton && !undoButton.dataset.repostBound) {
            undoButton.dataset.repostBound = 'true';
            undoButton.addEventListener('click', function() {
                if (lastInstagramRepostedButton) {
                    undoRepost(lastInstagramRepostedButton);
                    lastInstagramRepostedButton = null;
                }
            });
        }

        console.log("initRepostButtons - instagram feed bound");
        console.log(instaFeed);
        return;
    }

    document.querySelectorAll('.repost-button').forEach(function(button) {
        if (button.dataset.repostBound === 'true') {
            return;
        }
        button.dataset.repostBound = 'true';
        button.addEventListener('click', function(event) {
            event.preventDefault();
            handleStandardRepostClick(button);
        });
    });
}

function runWhenDocumentReady(callback) {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', callback);
    } else {
        callback();
    }
}

runWhenDocumentReady(function() {
    initRepostButtons();
    initRepostSubmitHandlers();
});
