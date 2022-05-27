import React, { useContext, useMemo, useState } from 'react'
import { withRouter } from 'react-router-dom'
import Interest from '../interests/interests'
//import components
import ImageGrid from '@components/imageGrid'
import { UserContext } from '../../contexts/userContext'
function NewsFeed() {
	const { user: currentUser } = useContext(UserContext)
	const [selectTag, setSelectTag] = useState([])

	const getTags = (a) => {
		const tempArr = [...selectTag]
		if (tempArr.includes(a)) {
			const index = tempArr.indexOf(a)
			tempArr.splice(index, 1)
		} else {
			tempArr.push(a)
		}
		setSelectTag(tempArr)
	}

	const getImageByNewGuest = useMemo(() => {
		return <ImageGrid query="search" keywords={selectTag} />
	}, [selectTag])

	return (
		<div
			style={{
				paddingTop: '1em',
			}}
		>
			<Interest getdata={getTags} />

			{!currentUser['_id'] || (currentUser['interestList'] && currentUser['interestList'].length == 0) ? (
				<ImageGrid query="all"/>
			) : currentUser['_id'] && currentUser['interestList'] ? (
				<ImageGrid query="search" keywords={currentUser['interestList']} />
			) : (
				getImageByNewGuest
			)}
		</div>
	)
}

export default withRouter(NewsFeed)
