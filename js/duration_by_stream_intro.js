function startIntro() {
	var intro = introJs();

	intro.setOptions({
		steps: [
			{
				element: document.querySelector('.legendLabel'),
				intro: "This is a legend."
			}
		]
	});

	intro.start();
}