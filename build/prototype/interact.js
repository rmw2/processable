/**
 * animations and other non-angular interactions
 */

$(document).ready(function () {
	hide(0);
	show(500);

	window.history.replaceState({}, 'processable [prototype]', '/processable/prototype');
});

function hide(speed) {
	$('#registers').animate({
		top: '-=100%'
	}, speed);

	$('#stack').animate({
		right: '-=100%'
	}, speed);

	$('#controls').animate({
		bottom: '-=100%'
	}, speed);

	$('#text').animate({
		left: '-=100%'
	}, speed);
}

function show(speed) {
	$('#registers').animate({
		top: '+=100%'
	}, speed);

	$('#stack').animate({
		right: '+=100%'
	}, speed);

	$('#controls').animate({
		bottom: '+=100%'
	}, speed);

	$('#text').animate({
		left: '+=100%'
	}, speed);
}