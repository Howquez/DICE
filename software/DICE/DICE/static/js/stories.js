console.log("Stories ready!");

// ===== CONFIG =====
// Story display duration in ms. Overridden by js_vars.story_duration (seconds).
var storyDuration = 7000;

// ===== STATE =====
var storyItems   = [];   // [{docId, el, username, date, userImage, profilePicAvailable, colorClass, icon}]
var currentIndex = -1;
var segmentFills = [];   // parallel array of .stories-segment-fill elements
var animFrame    = null; // rAF handle for progress animation
var slideStartTime = null; // wall-clock ms when current slide became visible
var likedStories = {};   // {docId: bool}
var storyReplies = {};   // {docId: string}
var viewTimes    = [];   // [{doc_id, duration}]  – populated on navigation

// ===== BOOT =====
document.addEventListener('DOMContentLoaded', function () {

    // Override story duration from oTree js_vars if provided
    if (typeof js_vars !== 'undefined' && js_vars.story_duration) {
        storyDuration = js_vars.story_duration * 1000;
    }

    var slidesContainer = document.getElementById('storiesSlides');
    if (!slidesContainer) return;

    // Collect all story slides (exclude the end placeholder)
    slidesContainer.querySelectorAll('.stories-slide:not(.stories-end-slide)').forEach(function (el) {
        var docId = parseInt(el.getAttribute('data-doc-id'), 10);
        if (!isNaN(docId) && docId !== 9999) {
            storyItems.push({
                docId:               docId,
                el:                  el,
                username:            el.getAttribute('data-username')             || '',
                date:                el.getAttribute('data-date')                 || '',
                userImage:           el.getAttribute('data-user-image')           || '',
                profilePicAvailable: el.getAttribute('data-profile-pic-available') === 'True',
                colorClass:          el.getAttribute('data-color-class')          || '',
                icon:                el.getAttribute('data-icon')                 || ''
            });
        }
    });

    if (storyItems.length === 0) {
        showEndSlide();
        return;
    }

    buildProgressBar();

    // Show first slide without starting the timer (wait for preloader)
    activateSlide(0, /* startTimer = */ false);

    // Start timer only after the loading screen disappears
    var preloader = document.getElementById('loadingScreen');
    if (preloader) {
        var obs = new MutationObserver(function (mutations) {
            mutations.forEach(function (m) {
                if (m.attributeName === 'class' && preloader.classList.contains('d-none')) {
                    obs.disconnect();
                    slideStartTime = Date.now();
                    startProgressAnimation(currentIndex);
                }
            });
        });
        obs.observe(preloader, { attributes: true });
    } else {
        slideStartTime = Date.now();
        startProgressAnimation(0);
    }

    // --- Tap zones ---
    var tapPrev = document.getElementById('storiesTapPrev');
    var tapNext = document.getElementById('storiesTapNext');
    if (tapPrev) tapPrev.addEventListener('click', goToPrev);
    if (tapNext) tapNext.addEventListener('click', goToNext);

    // --- Heart button ---
    var heartBtn = document.getElementById('storiesHeartBtn');
    if (heartBtn) {
        heartBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            if (currentIndex < 0 || currentIndex >= storyItems.length) return;
            var docId = storyItems[currentIndex].docId;
            likedStories[docId] = !likedStories[docId];
            updateHeartUI();
        });
    }

    // --- Reply input ---
    var replyInput = document.getElementById('storiesReplyInput');
    if (replyInput) {
        // Prevent taps on the input from bubbling to the tap zones
        replyInput.addEventListener('click',      function (e) { e.stopPropagation(); });
        replyInput.addEventListener('touchstart', function (e) { e.stopPropagation(); });

        // Pause progress while typing; resume on blur
        replyInput.addEventListener('focus', function () {
            cancelAnimationFrame(animFrame);
        });
        replyInput.addEventListener('blur', function () {
            saveCurrentReply();
            if (currentIndex >= 0 && currentIndex < storyItems.length) {
                var fill       = segmentFills[currentIndex];
                var currentPct = parseFloat(fill ? fill.style.width : 0) || 0;
                var remaining  = storyDuration * (1 - currentPct / 100);
                startProgressAnimationFrom(currentIndex, currentPct, remaining);
            }
        });
        replyInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') {
                saveCurrentReply();
                replyInput.blur();
            }
        });
    }

    // --- Submit button ---
    var submitBtn = document.getElementById('submitButton');
    if (submitBtn) {
        submitBtn.addEventListener('click', function () {
            saveCurrentReply();
            serializeDataToFields();
        });
    }

    // Catch page unload as safety net
    window.addEventListener('beforeunload', function () {
        saveCurrentReply();
        recordViewTime();
        serializeDataToFields();
    });
});

// ===== PROGRESS BAR =====

function buildProgressBar() {
    var track = document.getElementById('storiesProgressTrack');
    if (!track) return;
    track.innerHTML = '';
    segmentFills = [];
    storyItems.forEach(function () {
        var seg  = document.createElement('div');
        seg.className = 'stories-segment';
        var fill = document.createElement('div');
        fill.className = 'stories-segment-fill';
        seg.appendChild(fill);
        track.appendChild(seg);
        segmentFills.push(fill);
    });
}

// ===== NAVIGATION =====

function activateSlide(index, startTimer) {
    if (index < 0 || index >= storyItems.length) return;

    // Deactivate the outgoing slide
    if (currentIndex >= 0 && currentIndex < storyItems.length) {
        storyItems[currentIndex].el.classList.remove('active');
    }

    currentIndex = index;
    var story = storyItems[index];
    story.el.classList.add('active');

    updateHeader(story);
    updateHeartUI();
    updateReplyInput(story.docId);

    // Reset progress: past = full, current + future = empty
    cancelAnimationFrame(animFrame);
    segmentFills.forEach(function (fill, i) {
        fill.style.width = (i < index) ? '100%' : '0%';
    });

    slideStartTime = Date.now();

    if (startTimer !== false) {
        startProgressAnimation(index);
    }
}

function goToNext() {
    if (currentIndex >= storyItems.length) return;
    cancelAnimationFrame(animFrame);
    recordViewTime();
    saveCurrentReply();

    // Mark current segment complete
    if (segmentFills[currentIndex]) {
        segmentFills[currentIndex].style.width = '100%';
    }

    var next = currentIndex + 1;
    if (next < storyItems.length) {
        activateSlide(next);
    } else {
        showEndSlide();
    }
}

function goToPrev() {
    if (currentIndex <= 0) return;
    cancelAnimationFrame(animFrame);
    recordViewTime();
    saveCurrentReply();

    // Empty current and previous segments so the previous story re-animates
    if (segmentFills[currentIndex]) segmentFills[currentIndex].style.width = '0%';
    var prev = currentIndex - 1;
    if (segmentFills[prev])        segmentFills[prev].style.width = '0%';

    activateSlide(prev);
}

// ===== PROGRESS ANIMATION =====

function startProgressAnimation(index) {
    startProgressAnimationFrom(index, 0, storyDuration);
}

function startProgressAnimationFrom(index, startPct, duration) {
    cancelAnimationFrame(animFrame);
    if (index !== currentIndex) return;
    var fill = segmentFills[index];
    if (!fill || duration <= 0) {
        goToNext();
        return;
    }

    var start      = Date.now();
    var initialPct = startPct;

    function step() {
        var elapsed = Date.now() - start;
        var pct     = Math.min(initialPct + (elapsed / duration) * (100 - initialPct), 100);
        fill.style.width = pct + '%';
        if (pct < 100) {
            animFrame = requestAnimationFrame(step);
        } else {
            goToNext();
        }
    }
    animFrame = requestAnimationFrame(step);
}

// ===== END SLIDE =====

function showEndSlide() {
    cancelAnimationFrame(animFrame);

    // Hide last story slide
    if (currentIndex >= 0 && currentIndex < storyItems.length) {
        storyItems[currentIndex].el.classList.remove('active');
    }
    currentIndex = storyItems.length; // sentinel: beyond range

    // Fill all segments
    segmentFills.forEach(function (fill) { fill.style.width = '100%'; });

    // Hide stories-specific overlays
    ['storiesTopOverlay', 'storiesBottomOverlay', 'storiesTapPrev', 'storiesTapNext'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    // Show end slide
    var endSlide = document.querySelector('.stories-end-slide');
    if (endSlide) endSlide.classList.add('active');

    serializeDataToFields();
}

// ===== VIEW-TIME TRACKING =====

function recordViewTime() {
    if (slideStartTime && currentIndex >= 0 && currentIndex < storyItems.length) {
        var dur = (Date.now() - slideStartTime) / 1000;
        if (dur > 0.1) {
            viewTimes.push({ doc_id: storyItems[currentIndex].docId, duration: dur });
        }
        slideStartTime = null;
    }
}

// ===== UI UPDATES =====

function updateHeader(story) {
    var nameEl     = document.getElementById('storiesAuthorName');
    var timeEl     = document.getElementById('storiesAuthorTime');
    var avatarWrap = document.getElementById('storiesAvatarWrap');

    if (nameEl) nameEl.textContent = story.username;
    if (timeEl) timeEl.textContent = story.date;

    if (avatarWrap) {
        if (story.profilePicAvailable && story.userImage && story.userImage !== 'nan') {
            avatarWrap.innerHTML =
                '<img src="' + escapeHtml(story.userImage) +
                '" alt="' + escapeHtml(story.username) + '">';
        } else {
            avatarWrap.innerHTML =
                '<div class="stories-avatar-icon poster ' + escapeHtml(story.colorClass) + '">' +
                escapeHtml(story.icon) + '</div>';
        }
    }
}

function updateHeartUI() {
    var icon = document.getElementById('storiesHeartIcon');
    if (!icon || currentIndex < 0 || currentIndex >= storyItems.length) return;
    var liked = !!likedStories[storyItems[currentIndex].docId];
    icon.classList.toggle('bi-heart',      !liked);
    icon.classList.toggle('bi-heart-fill',  liked);
}

function updateReplyInput(docId) {
    var input = document.getElementById('storiesReplyInput');
    if (input) input.value = storyReplies[docId] || '';
}

function saveCurrentReply() {
    if (currentIndex >= 0 && currentIndex < storyItems.length) {
        var input = document.getElementById('storiesReplyInput');
        if (input) storyReplies[storyItems[currentIndex].docId] = input.value.trim();
    }
}

function escapeHtml(str) {
    var d = document.createElement('div');
    d.appendChild(document.createTextNode(String(str)));
    return d.innerHTML;
}

// ===== SERIALISE TO HIDDEN FIELDS =====

function serializeDataToFields() {
    // viewport_data – dwell times per story
    var vpField = document.getElementById('viewport_data');
    if (vpField) vpField.value = JSON.stringify(viewTimes);

    // scroll_sequence – ordered doc_ids
    var ssField = document.getElementById('scroll_sequence');
    if (ssField) ssField.value = storyItems.map(function (s) { return s.docId; }).join(',');

    // likes_data
    var likesField = document.getElementById('likes_data');
    if (likesField) {
        likesField.value = JSON.stringify(
            storyItems.map(function (s) {
                return { doc_id: s.docId, liked: !!likedStories[s.docId] };
            })
        );
    }

    // replies_data
    var repliesField = document.getElementById('replies_data');
    if (repliesField) {
        repliesField.value = JSON.stringify(
            storyItems.map(function (s) {
                var reply = storyReplies[s.docId] || '';
                return { doc_id: s.docId, reply: reply, hasReply: reply.length > 0 };
            })
        );
    }
}
