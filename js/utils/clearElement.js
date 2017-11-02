
export default (element) => {
	while(element.firstChild) {
		element.removeChild(element.firstChild);
	}
}
