
const useUrlify = () => {
	const urlify = (text) => {
		let res = text.replace(
			/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim,
			(v) => `<a href=${v}>${v}</a>`,
		)
		return res
	}

	return urlify
}

export { useUrlify }
