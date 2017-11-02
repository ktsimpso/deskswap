export default (deskPositions, personDesksOld, personDesksNew, person, people) => {
	var filterNewAssignments = (desk) =>
			!personDesksNew.hasDesk(desk),
		filterOldDesks = (desk) =>
			desk !== personDesksOld.getDeskFromPerson(person),
		filterDeskGroup = (desk) =>
			deskPositions[desk].group === people[person].group,
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
			filterDeskGroup,
			filterOldDesks,
			filterPreviousNeighbors,
		]
	return filters.reduce((desks, filter) => {
			var newDesks = desks.filter(filter);
			return newDesks.length > 0 ? newDesks : desks;
		}, Object.keys(deskPositions));
}
