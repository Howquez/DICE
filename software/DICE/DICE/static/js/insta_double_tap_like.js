console.log("Instagram double-tap like ready!");

document.addEventListener('DOMContentLoaded', function () {
    var DOUBLE_TAP_MS = 300;
    var TAP_MOVE_THRESHOLD_PX = 20;
    var OVERLAY_DURATION_MS = 1000;

    var lastTapByMedia = new WeakMap();

    function showHeartOverlay(mediaElement) {
        var overlay = mediaElement.querySelector('.insta-double-tap-heart');
        if (!overlay) {
            overlay = document.createElement('span');
            overlay.className = 'insta-double-tap-heart';
            overlay.setAttribute('aria-hidden', 'true');
            overlay.innerHTML = '<i class="bi bi-heart-fill insta-double-tap-heart-icon"></i>';
            mediaElement.appendChild(overlay);
        }

        var heartIcon = overlay.querySelector('.insta-double-tap-heart-icon');
        overlay.classList.remove('is-visible');
        if (heartIcon) {
            heartIcon.style.animation = 'none';
            void heartIcon.offsetWidth;
            heartIcon.style.animation = '';
        }
        void overlay.offsetWidth;
        overlay.classList.add('is-visible');

        window.setTimeout(function () {
            overlay.classList.remove('is-visible');
        }, OVERLAY_DURATION_MS);
    }

    function handleDoubleLike(mediaElement, event) {
        var instaPost = mediaElement.closest('.insta-post');
        if (!instaPost) {
            return;
        }

        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (typeof window.diceLikeInstaPostMedia === 'function') {
            window.diceLikeInstaPostMedia(instaPost);
        }

        showHeartOverlay(mediaElement);
    }

    function registerDoubleTap(mediaElement) {
        mediaElement.addEventListener('dblclick', function (event) {
            handleDoubleLike(mediaElement, event);
        });

        mediaElement.addEventListener('touchend', function (event) {
            if (event.changedTouches.length !== 1) {
                return;
            }

            var touch = event.changedTouches[0];
            var lastTap = lastTapByMedia.get(mediaElement);
            var now = Date.now();

            if (lastTap) {
                var timeDelta = now - lastTap.time;
                var moveX = Math.abs(touch.clientX - lastTap.x);
                var moveY = Math.abs(touch.clientY - lastTap.y);

                if (timeDelta <= DOUBLE_TAP_MS && moveX <= TAP_MOVE_THRESHOLD_PX && moveY <= TAP_MOVE_THRESHOLD_PX) {
                    handleDoubleLike(mediaElement, event);
                    lastTapByMedia.delete(mediaElement);
                    return;
                }
            }

            lastTapByMedia.set(mediaElement, {
                time: now,
                x: touch.clientX,
                y: touch.clientY
            });
        });
    }

    document.querySelectorAll('.insta-post .insta-post-media').forEach(registerDoubleTap);
});
