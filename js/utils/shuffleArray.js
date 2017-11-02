export default (array) => {
	var copy = array.slice(),
		currentIndex, randomIndex;

	for (currentIndex = copy.length - 1; 0 < currentIndex; currentIndex -= 1) {
		randomIndex = Math.floor(Math.random() * (currentIndex + 1));
		[copy[currentIndex], copy[randomIndex]] = [copy[randomIndex], copy[currentIndex]];
	}
	return copy;
}
