import React, { useEffect, useState, useRef } from 'react'
import { withRouter } from 'react-router-dom'
import { useQuery, useSubscription } from '@apollo/react-hooks'
import gql from 'graphql-tag'

import './index.scss'
import AComment from './AComment'

const GET_COMMENTS = gql`
  query getCmt(
    $postID: String!
    $parentID: String!
    $limit: Float
    $skip: Float
  ) {
    getCommentsByPostID(
      postID: $postID
      parentID: $parentID
      skip: $skip
      limit: $limit
    ) {
      _id
      who {
        _id
        firstName
        lastName
        email
        avatar
        gender
      }
      postID
      text
      time
      likes {
        who {
          _id
          firstName
          lastName
        }
        react
      }
      parentID
    }
  }
`
const COMMENT_ADDED = gql`
  subscription commentAdded($postID: String!) {
    commentCreated(postID: $postID) {
      _id
      who {
        _id
        firstName
        lastName
        email
        gender
        avatar
      }
      text
      time
    }
  }
`

const TYPING = gql`
  subscription typing($postID: String!) {
    commentTyping(postID: $postID) {
      status
    }
  }
`
const Comments = (props) => {
	const { postID, commentsCount, isBlock } = props
	const [listComment, setListComment] = useState([])
	const [isTyping, setIsTyping] = useState(false)
	const [skip, setSkip] = useState(0)
	const [seeMore, setSeeMore] = useState(0)
	const [newCommentsCount, setNewCommentsCount] = useState(0)

	//refs
	const skipRef = useRef(null)
	skipRef.current = skip

	const { loading, data, fetchMore } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'network-only',
		variables: {
			postID,
			parentID: postID,
			skip,
		},
	})
	useSubscription(COMMENT_ADDED, {
		variables: {
			postID,
		},
		onSubscriptionData: (e) => receiveNewComment(e.subscriptionData.data),
	})

	useSubscription(TYPING, {
		variables: {
			postID,
		},
		onSubscriptionData: (e) =>
			e.subscriptionData.data.commentTyping.status
				? setIsTyping(true)
				: setIsTyping(false),
	})
	useEffect(() => {
		let mounted = true
		if (mounted) {
			if (!loading && listComment.length === 0) {
				setListComment([...data.getCommentsByPostID])
				setSeeMore(commentsCount - [...data.getCommentsByPostID].length)
			}
		}
		return () => {
			mounted = false
		}
	}, [data])

	const loadMore = (skip) => {
		fetchMore({
			variables: {
				skip,
			},
			updateQuery: (prev, { fetchMoreResult }) => {
				if (!fetchMoreResult) return prev
				return fetchMoreResult
			},
		}).then((res) => {
			setListComment((prev) => [...prev, ...res.data.getCommentsByPostID])
			setSkip((prev) => prev + 4 + newCommentsCount)
			setSeeMore((prev) => prev - 4)
		})
	}

	const refreshData = () => {
		fetchMore({
			variables: {
				skip: 0,
				limit: 4 + skipRef.current,
			},
			updateQuery: (prev, { fetchMoreResult }) => {
				if (!fetchMoreResult) return prev
				return fetchMoreResult
			},
		}).then((res) => {
			setListComment([...res.data.getCommentsByPostID])
		})
	}

	const receiveNewComment = (data) => {
		try {
			const { commentCreated: newComment } = data
			setListComment([newComment, ...listComment])
			setNewCommentsCount((prev) => prev + 1)
		} catch (error) {
			console.log(error)
		}
	}

	const removeComment = () => {
		setSeeMore((prev) => prev - 1)
		refreshData()
	}

	const typing = (
		<div className="typing_comment">
			<p>Someone is typing comment ...</p>
		</div>
	)
	return (
		<div className="comments" id="comments-section">
			{isTyping && typing}
			{listComment.map((v) => {
				return (
					<AComment
						key={v._id}
						dataa={v}
						rf={() => refreshData()}
						removeComment={() => removeComment()}
						postID={postID}
						isBlock={isBlock}
					/>
				)
			})}
			{loading && <div>loading ...</div>}
			{seeMore > 0 && listComment.length >= 4 && (
				<a
					className="more-comments"
					onClick={() => {
						loadMore(skip + 4)
					}}
				>
          see more {seeMore} bình luận
				</a>
			)}
		</div>
	)
}

export default withRouter(Comments)
