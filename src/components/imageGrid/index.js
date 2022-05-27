import React, { useState, useEffect, useContext, useMemo, useRef } from 'react'
import PinterestGrid from 'rc-pinterest-grid'
import { useBottomScrollListener } from 'react-bottom-scroll-listener'
import { LoadingOutlined } from '@ant-design/icons'

//context
import { DefaultValues } from '@contexts/defaultValues'
import { PostContext } from '@contexts/postContext'

import { Spin, notification, Empty } from 'antd'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import Post from '../post'

import { useMediaQuery } from 'react-responsive'

import './index.scss'

const POSTS = gql`
  query posts($skip: Float!, $limit: Float) {
    posts(skip: $skip, limit: $limit) {
      _id
      who {
        email
        firstName
        lastName
        _id
        gender
        avatar
      }
      photo {
        height
        width
        artist
        copyright
        flash
        focalLength
        iso
        lensModel
        make
        model
        createDate
        pathID
      }
      description
      time
      likes {
        who {
          _id
          firstName
          lastName
        }
        react
      }
      commentsCount
    }
  }
`

const POSTS_BY_USER_ID = gql`
  query getPostsByUserID($userID: String!, $skip: Float!) {
    getPostsByUserID(userID: $userID, skip: $skip) {
      _id
      who {
        email
        firstName
        lastName
        _id
        gender
        avatar
      }
      photo {
        height
        width
        artist
        copyright
        flash
        focalLength
        iso
        lensModel
        make
        model
        createDate
        pathID
      }
      description
      time
      likes {
        who {
          _id
          firstName
          lastName
        }
        react
      }
      commentsCount
    }
  }
`

const SEARCH = gql`
  query search($keywords: [String!], $skip: Float!, $limit: Float) {
    search(keywords: $keywords, skip: $skip, limit: $limit) {
      _id
      who {
        email
        firstName
        lastName
        _id
        gender
        avatar
      }
      photo {
        height
        width
        artist
        copyright
        flash
        focalLength
        iso
        lensModel
        make
        model
        createDate
        pathID
      }
      description
      time
      likes {
        who {
          _id
          firstName
          lastName
        }
        react
      }
      commentsCount
    }
  }
`

const resultKey = {
	all: 'posts',
	byID: 'getPostsByUserID',
	search: 'search',
}

const antIcon = <LoadingOutlined className="posts-spinner__spin-icon" spin />

const HOW_MANY_POST_PER_FETCH_MORE = 50

const ImageGrid = ({ userID, keywords, query }) => {
	const isMobile = useMediaQuery({ query: '(max-width: 425px)' })

	const notify = (text, status) => {
		status
			? notification.success({
				message: text,
				placement: 'topRight',
			})
			: notification.error({
				message: text,
				placement: 'topRight',
			})
	}

	const queryType = {
		all: POSTS,
		byID: POSTS_BY_USER_ID,
		search: SEARCH,
	}

	//contexts
	const { defaultWho } = useContext(DefaultValues)
	const { addPostData, setAddPostData } = useContext(PostContext)

	const [skip, setSkip] = useState(0)
	const { loading: postLoading, data, fetchMore } = useQuery(
		queryType[query] || POSTS,
		{
			fetchPolicy: 'network-only',
			variables: {
				skip: skip,
				userID: userID || '',
				keywords: keywords || [],
				limit: 100, //first time load
			},
		},
	)
	const [postList, setPostList] = useState([])
	const postLoadingRef = useRef(null)
	postLoadingRef.current = postLoading

	//refs
	const overData = useRef()
	overData.current = false
	const [isLoadingMore, setIsLoadingMore] = useState(false)

	useEffect(() => {
		let mount = true
		if (mount && !postLoading && postList.length === 0 && data) {
			setPostList(data[resultKey[query || 'all']] || [])
			setSkip(100 - HOW_MANY_POST_PER_FETCH_MORE)
		}
		return () => {
			mount = false
		}
	}, [postLoading])

	useEffect(() => {
		if (addPostData && addPostData.length > 0) {
			fetchMore({
				variables: {
					limit: 100,
					skip: 0,
					keywords: [...new Set([...(keywords || []), ...addPostData.map(post => post.tags).flat()])]
				},
				updateQuery: (prev, { fetchMoreResult }) => {
					if (!fetchMoreResult) return prev
					return fetchMoreResult
				},
			}).then((res) => {
				let postRes = res && res.data && res.data[resultKey[query || 'all']] || []
				postRes.length > 0 && setPostList(postRes)
				setAddPostData(null)
			})
		}
	}, [addPostData])

	useBottomScrollListener(() => {
		loadMoreData()
	})

	const loadMoreData = () => {
		if (!overData.current && !postLoadingRef.current && !isLoadingMore) {
			setIsLoadingMore(true)
			fetchMore({
				variables: {
					skip: skip + HOW_MANY_POST_PER_FETCH_MORE,
					limit: HOW_MANY_POST_PER_FETCH_MORE,
				},
				updateQuery: (prev, { fetchMoreResult }) => {
					if (!fetchMoreResult) return prev
					return fetchMoreResult
				},
			})
				.then((res) => {
					const resultKey = {
						all: 'posts',
						byID: 'getPostsByUserID',
						search: 'search',
					}
					const x = res.data[resultKey[query || 'all']]
					setSkip((prev) => prev + HOW_MANY_POST_PER_FETCH_MORE)
					if (x.length > 0) {
						setPostList((prev) => [...prev, ...x])
					} else {
						overData.current = true
					}
					setIsLoadingMore(false)
				})
				.catch((err) => {
					notify(err.message, false)
					setIsLoadingMore(false)
				})
		}
	}

	const renderItems = useMemo(() => {
		try {
			if (postList.length > 0) {
				return postList.map((v) => {
					const { _id, photo, who, likes, description, time, commentsCount } = v
					return (
						<Post
							key={_id}
							_id={_id}
							photo={photo}
							user={who || defaultWho}
							likes={(likes || []).filter((v) => v.who)} // chi lay nhung like co user
							description={description}
							time={time}
							commentsCount={commentsCount}
						/>
					)
				})
			}
		} catch (err) {
			notify(err.message, false)
			return 'Cannot load post  :('
		}
	}, [postList])

	return (
		<>
			<div className="posts">
				<Spin
					indicator={antIcon}
					spinning={postLoading && (postList.length === 0 || !postList)}
					className="posts-spinner"
				/>
				{postList.length > 0 ? (
					isMobile ? (
						<div className="mobile-grid"> {renderItems}</div>
					) : (
						<PinterestGrid
							columnWidth={300} // width of each block
							gutterWidth={8} // horizontal gutter between each block
							gutterHeight={isMobile ? 14 : 8} // vertical gutter between each block
							responsive={true}
						>
							{renderItems}
						</PinterestGrid>
					)
				) : (
					postLoading || <Empty />
				)}
				<Spin
					indicator={antIcon}
					spinning={true}
					className={`posts__loading-more-icon ${
						isLoadingMore && 'is-loading'
					}`}
				/>
			</div>
		</>
	)
}

export default ImageGrid
