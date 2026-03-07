// Deduplicate story bubbles in the Instagram feed stories rail
document.addEventListener('DOMContentLoaded', function () {
    var seen = new Set();
    document.querySelectorAll('.story-item').forEach(function (item) {
        var usernameEl = item.querySelector('.story-username');
        if (!usernameEl) return;
        var username = usernameEl.textContent.trim();
        if (username === 'Your story') return;
        if (seen.has(username)) {
            item.remove();
        } else {
            seen.add(username);
        }
    });
});
