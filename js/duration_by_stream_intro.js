function startIntro() {
	var intro = introJs();

	intro.setOptions({
		steps: [
			{
				element: document.querySelector('g#main'),
				intro: "This is the main chart showing build duration in minutes.  Each " +
               "line represents a different RTC Stream."
			},
      {
        element: document.querySelector('#mini'),
        intro: "This is a mini version of the graph above.  Using your mouse you " +
               "can select different time periods.",
        position: 'right'
      }
		]
	});

	intro.start();
}
