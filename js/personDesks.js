export default () => {
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
}
