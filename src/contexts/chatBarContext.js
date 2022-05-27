import React, { useState, createContext } from 'react'

export const ChatBarContext = createContext()

function Index(props) {
	const [showChatBar, setShowChatBar] = useState(false)

	const contextValue = {
		showChatBar,
		setShowChatBar,
	}

	return (
		<ChatBarContext.Provider value={contextValue}>
			{props.children}
		</ChatBarContext.Provider>
	)
}

export default Index
