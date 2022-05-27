import React, { useState, createContext } from 'react'

export const PostContext = createContext()

function Index(props) {
	const [addPostData, setAddPostData] = useState([])
	const [deleteID, setDeleteID] = useState(null)

	const contextValue = {
		addPostData,
		setAddPostData,
		deleteID,
		setDeleteID,
	}

	return (
		<PostContext.Provider value={contextValue}>
			{props.children}
		</PostContext.Provider>
	)
}

export default Index
