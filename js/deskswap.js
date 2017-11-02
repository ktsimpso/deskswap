import PersonDesks from '/js/personDesks.js';
import shufflePeople from '/js/views/shufflePeople.js';
import renderEnd from '/js/views/renderEnd.js';
import renderDesks from '/js/views/renderDesks.js';


var container = document.getElementById('container'),
	deskMap = fetch('/svg/desks.svg')
		.then((response) =>
			response.text()),
	deskPositions = fetch('/data/desks.json')
		.then((response) =>
			response.json()),
	peopleLocations = fetch('/data/people.json')
		.then((response) =>
			response.json());

Promise.all([deskPositions, peopleLocations, deskMap])
	.then((results) => {
		var [desks, personToDeskOld, deskMap] = results,
			personDesksOld = Object.keys(personToDeskOld).reduce((personDesks, person) =>
				personDesks.add(person, personToDeskOld[person])
				, PersonDesks()),
			personDesksNew = PersonDesks(),
			shuffledPeoplePromise = shufflePeople(personDesksOld.getPeople().slice(), container),
			selectDesks = () =>
				shuffledPeoplePromise.then((shuffledPeople) =>
					shuffledPeople
						.filter((person) =>
							!personDesksNew.hasPerson(person))
						.reduce((chain, person) =>
							chain.then((desk) =>
								renderDesks(deskMap, desks, personDesksOld, personDesksNew, person, shuffledPeople, container))
						, Promise.resolve())
						.then(() =>
							personDesksOld.getPeople().length > personDesksNew.getPeople().length ?
								selectDesks() :
								Promise.resolve()));

			selectDesks()
				.then(() => renderEnd(deskMap, personDesksOld, personDesksNew, container));
	});
