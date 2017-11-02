export default (deskMap, personDesksOld, personDesksNew, container) => {
	container.insertAdjacentHTML('beforeend', deskMap);
	personDesksNew.getPeople().forEach((person) => {
		document.querySelector(`[id='${personDesksNew.getDeskFromPerson(person)}'] text`).textContent = person;
	});
	container.insertAdjacentHTML('beforeend', `
		<textarea disabled>Person,Old Desk Location,New Desk Location
${personDesksNew.getPeople().map((person) => `${person},${personDesksOld.getDeskFromPerson(person)},${personDesksNew.getDeskFromPerson(person)}`).join('\n')}</textarea>
		<textarea disabled>${personDesksNew.toJson()}</textarea>
	`);
}
