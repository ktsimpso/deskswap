import clearElement from '/js/utils/clearElement.js';
import shuffleArray from '/js/utils/shuffleArray.js';

export default (people, container) =>
	new Promise((resolve) => {
		var peopleMap = people
			.reduce((personMap, person) =>
				Object.defineProperty(personMap, person, {
					value: true,
					enumerable: true
				}), {}),
			validate = (personList) =>
				personList.length === people.length
				&& personList
					.every((person) => peopleMap.hasOwnProperty(person)),
			onShuffleClick = () => {
				resultArea.value = shuffleArray(people).join('\n');
			},
			onSubmitClick = () => {
				var shuffledPeople = resultArea.value
					.split('\n')
					.map((person) =>
						person.trim())
				if (validate(shuffledPeople)) {
					submitButton.removeEventListener('click', onSubmitClick);
					shuffleButton.removeEventListener('click', onShuffleClick);
					clearElement(container);
					resolve(shuffledPeople);
				}
			},
			submitButton,
			shuffleButton,
			resultArea;

		container.insertAdjacentHTML('beforeend', `
			<div id="main">
				<textarea disabled>${people.join('\n')}</textarea>
				<textarea id="results"></textarea>
			</div>
			<div id="buttons">
				<button id="shuffle">Shuffle</button>
				<button id="submit">Submit</button>
			</div>
		`);

		submitButton = document.querySelector('#submit');
		shuffleButton = document.querySelector('#shuffle');
		resultArea = document.querySelector('#results');
		submitButton.addEventListener('click', onSubmitClick);
		shuffleButton.addEventListener('click', onShuffleClick);
	})
