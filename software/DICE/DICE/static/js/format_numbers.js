console.log("format numbers")

function formatNumber(num) {
    if (num < 1000) return num; // return the number directly if less than 1000

    let divisor = 1000;
    let suffix = 'K';

    if (num >= 1000000) {
        divisor = 1000000;
        suffix = 'M';
        if (num >= 10000000) {
            return Math.round(num / divisor) + suffix; // Rounds to nearest million without decimal for 10M+
        }
        return (Math.round(num / (divisor / 10)) / 10).toFixed(1) + suffix; // Keeps one decimal place for millions less than 10M
    }

    if (num >= 10000) {
        return Math.round(num / divisor) + suffix; // Rounds to nearest thousand without decimal for 10K+
    }

    return (Math.round(num / (divisor / 10)) / 10).toFixed(1) + suffix; // Keeps one decimal place for thousands less than 10K
}

window.onload = function() {
    // Define the classes you want to modify
    const classes = ['like-count', 'repost-count', 'reply-count'];

    classes.forEach(cls => {
        document.querySelectorAll('.' + cls).forEach(element => {
            const formattedNumber = formatNumber(Number(element.innerText));
            element.innerText = formattedNumber;
        });
    });
};
