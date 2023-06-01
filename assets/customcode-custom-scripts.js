//function to render a countdown timer

function renderCountDown(countDown, containerJq) {
    // Set the date we're counting down to
    let countDownDate = new Date(countDown).getTime();

    // Update the count down every 1 second
    let x = setInterval(function () {

        // Get today's date and time
        let now = new Date().getTime();

        // Find the distance between now and the count down date
        let distance = countDownDate - now;

        $('.' + containerJq).show();

        // Time calculations for days, hours, minutes and seconds
        let days = Math.floor(distance / (1000 * 60 * 60 * 24));
        days = ('0' + days).slice(-2)
        let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        hours = ('0' + hours).slice(-2)
        let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        minutes = ('0' + minutes).slice(-2)
        let seconds = Math.floor((distance % (1000 * 60)) / 1000);
        seconds = ('0' + seconds).slice(-2)

        // Output the result in an element with id="demo"
        $('.' + containerJq + ' > .custom-days').html(days);
        $('.' + containerJq + ' > .custom-hours').html(hours);
        $('.' + containerJq + ' > .custom-minutes').html(minutes);
        $('.' + containerJq + ' > .custom-seconds').html(seconds);

        // If the count down is over, write some text
        if (distance < 0) {
            clearInterval(x);
            $('.' + containerJq).hide();
        }
    }, 1000);
}
