import React, { useContext } from 'react'
import { Tooltip } from 'antd'
import { Link } from 'react-router-dom'
import './index.scss'

import LIKE from '@assets/icons/like.png'
import HEART from '@assets/icons/love.png'
import WOW from '@assets/icons/wow.png'
import HAHA from '@assets/icons/haha.png'
import SAD from '@assets/icons/sad.png'
import ANGRY from '@assets/icons/angry.png'

import { DefaultValues } from '@contexts/defaultValues'

const PostFooter = ({
	dataLikes,
	commentsCount,
	//	postID: _id,
}) => {
	//context
	const { defaultWho } = useContext(DefaultValues)

	const whoLikes = () => {
		try {
			return dataLikes.map((v) => {
				let who = v.who || defaultWho
				return (
					<Link
						to={`/profile/${who._id}`}
						style={{ color: 'white' }}
						key={who._id}
					>
						<p className="who_like_item">
							{who.firstName + ' ' + who.lastName}
						</p>
					</Link>
				)
			})
		} catch (error) {
			console.log(error)
		}
	}

	const isThisPostHasEmoji = (reaction) => {
		let newSet = new Set(dataLikes.map((v) => v.react))
		if (newSet.has(reaction)) return true
		return false
	}

	return (
		<>
			{
				<>
					{dataLikes.length > 0 && (
						<div className="likeCount">
							{isThisPostHasEmoji('LIKE') && (
								<img src={LIKE} className="icon_reaction" />
							)}
							{isThisPostHasEmoji('LOVE') && (
								<img src={HEART} className="icon_reaction" />
							)}
							{isThisPostHasEmoji('WOW') && (
								<img src={WOW} className="icon_reaction" />
							)}
							{isThisPostHasEmoji('HAHA') && (
								<img src={HAHA} className="icon_reaction" />
							)}
							{isThisPostHasEmoji('SAD') && (
								<img src={SAD} className="icon_reaction" />
							)}
							{isThisPostHasEmoji('ANGRY') && (
								<img src={ANGRY} className="icon_reaction" />
							)}
							<Tooltip arrowPointAtCenter={false} title={whoLikes()}>
								{dataLikes.length}
							</Tooltip>
						</div>
					)}
					{commentsCount > 0 && (
						<div className="commentsCount">
							<a>{commentsCount} comments</a>
						</div>
					)}
				</>
			}
		</>
	)
}

export default PostFooter
