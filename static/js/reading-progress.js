document.addEventListener('scroll', function(e) {
	const readingProgress = document.querySelector('#reading-progress-fill');
	if (readingProgress == null) {
		console.log("could not find reading-progress-fill")
	}
	else {
		const footerHeight = 0;
		let w = (document.body.scrollTop || document.documentElement.scrollTop) / (document.documentElement.scrollHeight - document.documentElement.clientHeight - footerHeight) * 100;
		readingProgress.style.setProperty('width', w + '%');
	}
});
