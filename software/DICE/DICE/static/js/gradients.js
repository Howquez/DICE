/*document.addEventListener('DOMContentLoaded', function() {
    var gradients = [
        'linear-gradient(to right, #FF0099, #493240)',
        'linear-gradient(to top, #8E2DE2, #4A00E0)',
        'linear-gradient(to right, #11998e, #38ef7d)',
        'linear-gradient(to top, #00416A, #E4E5E6)',
        'linear-gradient(to right, #ee9ca7, #ffdde1)',
        'linear-gradient(to top, #b92b27, #1565C0)',
        'linear-gradient(to right, #f12711, #f5af19)',
        'linear-gradient(to top, #4776E6, #8E54E9)',
        'linear-gradient(to right, #FF416C, #FF4B2B)',
        'linear-gradient(to top, #c0392b, #8e44ad)',
    ];

    var elements = document.querySelectorAll('.p1.poster');

    elements.forEach(function(el) {
        var userId = el.getAttribute('data-user-id');
        var gradientIndex = simpleHash(userId) % gradients.length;
        el.style.background = gradients[gradientIndex];
    });
});

function simpleHash(str) {
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}*/