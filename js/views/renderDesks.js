import clearElement from '/js/utils/clearElement.js';
import getPossibleDesks from '/js/getPossibleDesks.js';

export default (deskMap, desks, personDesksOld, personDesksNew, person, shuffledPeople, people, container) =>
	new Promise((resolve) => {
		var onDeskClick = (event) => {
				var target = event.target,
					match;

				while (target && target.tagName !== 'g') {
					target = target.parentNode;
				}

				if (target && target.classList.contains('available')) {
					match = deskArea.querySelector('.selected');
					if (match) {
						match.classList.remove('selected');
					}
					target.classList.add('selected');
					endButton.removeAttribute('disabled');
				}
			},
			onEndClick = () => {
				var match = deskArea.querySelector('.selected');
				if (!match) {
					return;
				}

				onResolve();
				personDesksNew.add(person, match.id);
				resolve();
			},
			onSkipClick = () => {
				onResolve();
				resolve();
			},
			onResolve = () => {
				container.removeEventListener('click', onDeskClick);
				endButton.removeEventListener('click', onEndClick);
				skipButton.removeEventListener('click', onSkipClick);
				clearElement(container);
			},
			endButton,
			skipButton,
			deskArea;

		container.insertAdjacentHTML('beforeend', `
			<div id="main">
				<div id="desks">${deskMap}</div>
				<div id="personList">
					${shuffledPeople
						.map((currentPerson) =>
							`<div>
								<span class="${personDesksNew.hasPerson(currentPerson) ? 'complete' : ''} ${currentPerson === person ? 'selected' : ''}">
									${currentPerson}
								</span>
							</div>`)
						.join('')
					}
				</div>
			</div>
			<div id="buttons">
				<button id="end" disabled>Select</button>
				<button id="skip">Skip</button>
			</div>
		`);

		deskArea = document.querySelector('#desks');
		personDesksNew.getPeople().forEach((person) => {
			document.querySelector(`[id='${personDesksNew.getDeskFromPerson(person)}'] text`).textContent = person;
		});

		getPossibleDesks(desks, personDesksOld, personDesksNew, person, people).forEach((desk) => {
			document.querySelector(`[id='${desk}']`).classList.add('available');
		});

		endButton = container.querySelector('#end');
		skipButton = container.querySelector('#skip');
		container.addEventListener('click', onDeskClick);
		endButton.addEventListener('click', onEndClick);
		skipButton.addEventListener('click', onSkipClick);
	})
