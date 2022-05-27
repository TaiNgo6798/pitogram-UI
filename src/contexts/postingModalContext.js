import React, { useState, createContext } from 'react'

export const PostingModalContext = createContext()

function Index(props) {
	const [showPostingModal, setShowPostingModal] = useState(false)

	const contextValue = {
		showPostingModal,
		setShowPostingModal,
	}

	return (
		<PostingModalContext.Provider value={contextValue}>
			{props.children}
		</PostingModalContext.Provider>
	)
}

export default Index
