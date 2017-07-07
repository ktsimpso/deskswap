(() => {
	var container = document.getElementById('container'),
		PersonDesks = () => {
			var deskToPerson = {},
				personToDesk = {},
				self = {
				getPersonFromDesk: (desk) =>
					deskToPerson[desk],
				getDeskFromPerson: (person) =>
					personToDesk[person],
				add: (person, desk) => {
					deskToPerson[desk] = person;
					personToDesk[person] = desk;
					return self;
				},
				getDesks: () =>
					Object.keys(deskToPerson),
				getPeople: () =>
					Object.keys(personToDesk),
				hasPerson: (person) =>
					personToDesk.hasOwnProperty(person),
				hasDesk: (desk) =>
					deskToPerson.hasOwnProperty(desk),
				toJson: () =>
					JSON.stringify(personToDesk, null, '\t')
			};
			return self;
		},
		clearElement = (element) => {
			while(element.firstChild) {
				element.removeChild(element.firstChild);
			}
		},
		shuffleArray = (array) => {
			var currentIndex, randomIndex;

			for (currentIndex = array.length - 1; 0 < currentIndex; currentIndex -= 1) {
				randomIndex = Math.floor(Math.random() * (currentIndex + 1));
				[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
			}
			return array;
		},
		deskMap = fetch('/svg/desks.svg')
			.then((response) =>
				response.text()),
		deskPositions = fetch('/data/desks.json')
			.then((response) =>
				response.json()),
		peopleLocations = fetch('/data/people.json')
			.then((response) =>
				response.json())
		getPossibleDesks = (deskPositions, personDesksOld, personDesksNew, person) => {
			var filterNewAssignments = (desk) =>
					!personDesksNew.hasDesk(desk),
				filterOldDesks = (desk) =>
					desk !== personDesksOld.getDeskFromPerson(person),
				filterPreviousNeighbors = (desk) =>
					!deskPositions[personDesksOld.getDeskFromPerson(person)].adjacentDesks
						.map((desk) => 
							personDesksOld.getPersonFromDesk(desk))
						.filter((neighbor) =>
							personDesksNew.hasPerson(neighbor))
						.map((neighbor) =>
							deskPositions[personDesksNew.getDeskFromPerson(neighbor)].adjacentDesks)
						.reduce((bannedDesks, neighborDesks) =>
							bannedDesks.concat(neighborDesks), [])
						.reduce((bannedDesks, desk) =>
							Object.defineProperty(bannedDesks, desk, {
								value: true,
								enumerable: true
							}), {})
						.hasOwnProperty(desk),
				filters = [
					filterNewAssignments,
					filterOldDesks,
					filterPreviousNeighbors,
				]
			return filters.reduce((desks, filter) => {
					var newDesks = desks.filter(filter);
					return newDesks.length > 0 ? newDesks : desks;
				}, Object.keys(deskPositions));
		},
		shufflePeople = (people) =>
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
			}),
		renderEnd = (deskMap, personDesksOld, personDesksNew) => {
			container.insertAdjacentHTML('beforeend', deskMap);
			personDesksNew.getPeople().forEach((person) => {
				document.querySelector(`[id='${personDesksNew.getDeskFromPerson(person)}'] text`).textContent = person;
			});
			container.insertAdjacentHTML('beforeend', `
				<textarea disabled>Person,Old Desk Location,New Desk Location
${personDesksNew.getPeople().map((person) => `${person},${personDesksOld.getDeskFromPerson(person)},${personDesksNew.getDeskFromPerson(person)}`).join('\n')}</textarea>
				<textarea disabled>${personDesksNew.toJson()}</textarea>
			`);
		},
		renderDesks = (deskMap, desks, personDesksOld, personDesksNew, person, shuffledPeople) =>
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
				
				getPossibleDesks(desks, personDesksOld, personDesksNew, person).forEach((desk) => {
					document.querySelector(`[id='${desk}']`).classList.add('available');
				});
				
				endButton = container.querySelector('#end');
				skipButton = container.querySelector('#skip');
				container.addEventListener('click', onDeskClick);
				endButton.addEventListener('click', onEndClick);
				skipButton.addEventListener('click', onSkipClick);

			});

	Promise.all([deskPositions, peopleLocations, deskMap])
		.then((results) => {
			var [desks, personToDeskOld, deskMap] = results,
				personDesksOld = Object.keys(personToDeskOld).reduce((personDesks, person) =>
					personDesks.add(person, personToDeskOld[person])
					, PersonDesks()),
				personDesksNew = PersonDesks(),
				shuffledPeoplePromise = shufflePeople(personDesksOld.getPeople().slice()),
				selectDesks = () => 
					shuffledPeoplePromise.then((shuffledPeople) =>
						shuffledPeople
							.filter((person) => 
								!personDesksNew.hasPerson(person))
							.reduce((chain, person) =>
								chain.then((desk) => 
									renderDesks(deskMap, desks, personDesksOld, personDesksNew, person, shuffledPeople))
							, Promise.resolve())
							.then(() =>
								personDesksOld.getPeople().length > personDesksNew.getPeople().length ?
									selectDesks() :
									Promise.resolve()));

				selectDesks()
					.then(() => renderEnd(deskMap, personDesksOld, personDesksNew));
		});
})();
