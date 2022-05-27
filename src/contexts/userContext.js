import React, { createContext, useState, useEffect } from 'react'
import jwt from 'jsonwebtoken'
import gql from 'graphql-tag'
import { useQuery } from '@apollo/react-hooks'
import maleUser from '@assets/images/man-user.png'
import femaleUser from '@assets/images/woman-user.png'

export const UserContext = createContext()
const USER = gql`
  query getUser($_id: String!) {
    getUserByID(_id: $_id) {
      _id
      email
      firstName
      lastName
      avatar
      coverPhoto
      dob
      gender
      relationship
      permissions
      phone
      companies
      schools
      interestList
      unReadFrom {
        sendID
      }
    }
  }
`

function Index(props) {
	const decodeToken = () => {
		try {
			const token = localStorage.getItem('Authorization').split(' ')[1]
			const user = jwt.verify(token, 'taingo6798')
			return user
		} catch (error) {
			return null
		}
	}

	const { refetch, data: user } = useQuery(USER, {
		fetchPolicy: 'network-only',
		variables: {
			_id: decodeToken() ? decodeToken()._id : '123',
		},
	})

	const [unReadFrom, setUnReadFrom] = useState([])
	useEffect(() => {
		if (user && user.getUserByID) {
			setUnReadFrom(user.getUserByID.unReadFrom)
		}
	}, [user])

	const refreshUser = () => {
		// check lai user hien tai tu server
		return refetch()
	}

	const getAvatarLinkById = (id, gender) => {
		return id
			? `https://storage.googleapis.com/taingoblog.appspot.com/social/user/avatar/${id}-small.jpg`
			: gender === 'female'
				? femaleUser
				: maleUser
	}

	const contextValue = {
		user: user ? user.getUserByID || {} : {},
		refreshUser,
		decodeToken,
		getAvatarLinkById,
		unReadFrom,
		setUnReadFrom,
	}

	return (
		<UserContext.Provider value={contextValue}>
			{props.children}
		</UserContext.Provider>
	)
}

export default Index
