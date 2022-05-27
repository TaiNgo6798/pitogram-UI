import React, {  createContext } from 'react'

export const DefaultValues = createContext()

function Index(props) {

	const defaultWho = {_id: 'nobody', gender: 'male', firstName: 'Some', lastName: 'One', avatar: ''}

	const contextValue = {
		defaultWho
	}

	return (
		<DefaultValues.Provider value={contextValue}>
			{props.children}
		</DefaultValues.Provider>
	)
}

export default Index