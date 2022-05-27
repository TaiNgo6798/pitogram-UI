import React, { useState, useContext, useRef, useMemo, useEffect } from 'react'
import { withRouter, Link } from 'react-router-dom'
import gql from 'graphql-tag'
import * as _ from 'lodash'
import { Comment, Avatar, Spin, notification, Modal, Tooltip, Menu } from 'antd'
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'
import {
	DeleteOutlined,
	EditOutlined,
	EllipsisOutlined,
	LoadingOutlined,
	CommentOutlined,
	NodeIndexOutlined,
	SmileOutlined,
} from '@ant-design/icons'
//days
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/en'
dayjs.extend(relativeTime)
dayjs.extend(LocalizedFormat)
dayjs.locale('en')

import LIKE from '@assets/icons/like.png'
import HEART from '@assets/icons/love.png'
import WOW from '@assets/icons/wow.png'
import HAHA from '@assets/icons/haha.png'
import SAD from '@assets/icons/sad.png'
import ANGRY from '@assets/icons/angry.png'

import DropdownTN from '@components/DropdownTN'
import EmojiReaction from '@components/emoji-reaction-button'

import { UserContext } from '@contexts/userContext'
import { DefaultValues } from '@contexts/defaultValues'
import { useQuery } from '@apollo/react-hooks'
import { useMutation } from '@apollo/react-hooks'
import TextArea from 'antd/lib/input/TextArea'

//Custom hooks
import { useUrlify } from '@components/utils/hook/urlify'

import Child from './ChildComment'
const DELETE = gql`
  mutation delete($_id: String!) {
    deleteOneComment(_id: $_id)
  }
`
const EDIT = gql`
  mutation edit($editInput: EditInput!) {
    editOneComment(editInput: $editInput)
  }
`
const POST_COMMENT = gql`
  mutation postComment($commentInput: CommentInput!) {
    postOneComment(commentInput: $commentInput)
  }
`

const DO_LIKE = gql`
  mutation like($parentID: String!, $react: REACT!) {
    doLike(likeInput: { parentID: $parentID, react: $react })
  }
`
const UN_LIKE = gql`
  mutation unlike($parentID: String!) {
    unLike(parentID: $parentID)
  }
`

const TYPING = gql`
  mutation typing($input: TypingInput!) {
    submitCommentStatus(input: $input)
  }
`
const GET_COMMENTS = gql`
  query getCmt($parentID: String!, $limit: Float, $skip: Float) {
    getCommentsByParentID(parentID: $parentID, skip: $skip, limit: $limit) {
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

const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />
const { confirm } = Modal

const AComment = (props) => {
	//contexts
	const { user: currentUser, getAvatarLinkById } = useContext(UserContext)
	const { avatar, gender } = currentUser
	const { dataa, postID, removeComment, isBlock } = props
	const { _id, time, text, who: dataWho, likes } = dataa
	const daysCount = Math.round(new Date(Date.now() - time) / 3600000 / 24)

	const notify = (text, status) => {
		status
			? notification.success({
				message: text,
				placement: 'bottomRight',
			})
			: notification.error({
				message: text,
				placement: 'bottomRight',
			})
	}
	// graphql
	const [editComment] = useMutation(EDIT)
	const [deleteComment] = useMutation(DELETE)
	const [likeAComment] = useMutation(DO_LIKE)
	const [unlikeAComment] = useMutation(UN_LIKE)
	const [postComment] = useMutation(POST_COMMENT)
	const [typing] = useMutation(TYPING)
	// local states
	const [isEdit, setIsEdit] = useState(false)
	const [editing, setEditing] = useState(false)
	const [textData, setTextData] = useState(text)
	const [showFullText, setShowFullText] = useState(false)
	const [localLikes, setLocalLikes] = useState(likes || [])
	//const [skip] = useState(0)
	const [listComment, setListComment] = useState([])
	//const [seeMore, setSeeMore] = useState(0)
	const [post, setPosting] = useState(false)
	const [toggle, setToggle] = useState(false)
	const [postingComment, setPostingComment] = useState(false)
	const [typingStatus, setTypingStatus] = useState(false) // chi goi api mot lan true/false
	const [handle, setHandle] = useState(false)
	const [edithandle, setEditHandle] = useState(false)
	const [cmt, setCmt] = useState('')
	const skip = 0
	//refs
	const { defaultWho } = useContext(DefaultValues)
	const [who] = useState(dataWho || defaultWho)
	const textRef = useRef(null)
	const skipRef = useRef(null)
	skipRef.current = skip
	//Custom hooks
	const urlify = useUrlify()

	const menu = (
		<>
			<Menu>
				<Menu.Item
					onClick={() => {
						setIsEdit(true)
					}}
				>
					<EditOutlined /> Edit ...
				</Menu.Item>
				<Menu.Item onClick={() => deleteHandler()}>
					<DeleteOutlined /> Delete ...
				</Menu.Item>
			</Menu>
		</>
	)
	//lấy dữ liệu childcomment mỗi comment cha từ postID
	const { loading, data, fetchMore } = useQuery(GET_COMMENTS, {
		fetchPolicy: 'network-only',
		variables: {
			parentID: _id,
			skip: skip,
			limit: 100,
		},
	})
	useEffect(() => {
		let mounted = true
		if (mounted) {
			if (!loading && listComment.length === 0) {
				setListComment([...data.getCommentsByParentID])
			}
		}
		return () => {
			mounted = false
		}
	}, [data])
	//console.log(listComment);
	const refreshData = () => {
		fetchMore({
			updateQuery: (prev, { fetchMoreResult }) => {
				if (!fetchMoreResult) return prev
				return fetchMoreResult
			},
		}).then((res) => {
			setListComment([...res.data.getCommentsByParentID])
		})
	}
	const childComment = useMemo(() => {
		try {
			return listComment.reverse().map((e) => {
				return (
					<Child
						key={e._id}
						e={e}
						refreshData={refreshData}
					/>
				)
			})
		} catch (error) {
			return
		}
	}, [listComment, isBlock])
	const onChange = (e) => {
		setCmt(e.target.value)
		if (text.length > 0 && !typingStatus) {
			setTypingStatus(true)
			typing({
				variables: {
					input: {
						postID,
						status: true,
					},
				},
			})
		}
		if (text.length === 0) {
			setTypingStatus(false)
			typing({
				variables: {
					input: {
						postID,
						status: false,
					},
				},
			})
		}
	}

	const reloadComment = () => {
		refreshData()
	}
	const postCommentHandler = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			const text = textRef.current.resizableTextArea.props.value
			if (text && text.length > 0) {
				setPostingComment(true)
				postComment({
					variables: {
						commentInput: {
							postID: postID,
							text: _.escape(text),
							parentID: _id,
						},
					},
				}).then(() => {
					setTypingStatus(false)
					setPostingComment(false)
					reloadComment()
					typing({
						variables: {
							input: {
								postID,
								status: false,
							},
						},
					})
					setToggle(true)
					setPosting(true)
					setCmt('')
					setHandle(false)
					textRef.current.resizableTextArea.props.value = null
					//
				})
				// addComment();
			}
		}
	}

	const unLikeHandler = () => {
		setLocalLikes((prev) => [
			...prev.filter((v) => v.who && v.who._id !== currentUser._id),
		])
		unlikeAComment({
			variables: {
				parentID: _id,
			},
		})
	}

	const reactHandler = (reaction) => {
		if (_.isEmpty(currentUser)) {
			window.location.href = '/login'
		} else {
			let newLike = {
				who: currentUser,
				react: reaction,
			}
			// them like moi
			if (
				localLikes.filter(
					(v) => (v.who ? v.who._id : defaultWho._id) === currentUser._id,
				).length === 0
			) {
				setLocalLikes([...localLikes, newLike])
			} else {
				// thay doi reaction (like => love)
				let newList = localLikes.map((v) => {
					let who = v.who || defaultWho
					if (who._id === currentUser._id) {
						v.react = reaction
					}
					return v
				})
				setLocalLikes([...newList])
			}
			likeAComment({
				variables: {
					parentID: _id,
					react: reaction,
				},
			})
		}
	}

	const deleteHandler = () => {
		confirm({
			title: 'Are you sure ?',
			centered: true,
			onOk() {
				deleteComment({
					variables: {
						_id,
					},
				})
					.then((res) => {
						if (res.data.deleteOneComment) {
							if (listComment.length > 0) {
								for (let i = 0; i < listComment.length; i++) {
									deleteComment({
										variables: {
											_id: listComment[i]._id,
										},
									})
								}
							}
							removeComment()
						} else notify('Something went wrong !', false)
					})
					.catch((err) => {
						notify(err.toString(), false)
					})
			},
			onCancel() {},
		})
	}

	const editHandler = (e) => {
		const text = textRef.current.resizableTextArea.props.value
		setEditHandle(false)
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			if (text === textData) {
				setEditing(true)
				editComment({
					variables: {
						editInput: {
							_id,
							text: _.escape(text),
						},
					},
				})
					.then((res) => {
						setEditHandle(false)
						if (!res.data.editOneComment) {
							notify('Cant edit this comment !', false)
						} else {
							setTextData(text)
							setEditHandle(false)
						}
						setEditing(false)
						setIsEdit(false)
					})
					.catch(() => {
						setEditing(false)
						setIsEdit(false)
						//notify('Something is wrong !', false)
					})
			} else {
				setIsEdit(false)
			}
		}
	}

	const commetText =
    _.trim(textData).length > 0 ? (
    	<>
    		<p
    			style={{
    				whiteSpace: 'pre-wrap',
    				wordWrap: 'break-word',
    			}}
    			dangerouslySetInnerHTML={{
    				__html: urlify(
    					_.unescape(
    						!showFullText ? _.truncate(textData, { length: 50 }) : textData,
    					),
    				),
    			}}
    		></p>
    		{!showFullText && !isEdit && textData.length > 50 && (
    			<a
    				style={{ position: '', bottom: '0' }}
    				onClick={() => setShowFullText(true)}
    			>
            see more
    			</a>
    		)}
    	</>
    ) : null

	const isThisCommentHasEmoji = (reaction) => {
		let newSet = new Set(localLikes.map((v) => v.react))
		return newSet.has(reaction)
	}

	const whoLikes = () => {
		try {
			return localLikes.map((v) => {
				let who = v.who || {}
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
	const onToggle = () => {
		post === false ? setPosting(true) : setPosting(false)
		toggle === false ? setToggle(true) : setToggle(false)
	}
	const handleSeeChildComments = () => {
		setToggle(true)
		setPosting(true)
	}
	const handleVisibleChange = (visible) => {
		visible === true ? setHandle(false) : setHandle(true)
	}
	const handleEditChange = (visible) => {
		visible === true ? setEditHandle(false) : setEditHandle(true)
	}
	const addEmoji = (e) => {
		setCmt(cmt + e.native)
	}
	const editEmoji = (e) => {
		if (textData) {
			setTextData(textData + e.native)
		} else {
			setTextData(e.native)
		}
	}
	const onChangeWhenEditing = (e) => {
		setTextData(e.target.value)
	}
	// console.log('child:', listComment);
	return (
		<div className="A_comment">
			<div className={`comment-body ${isEdit && 'editing-comment'}`}>
				<Comment
					avatar={
						<Avatar
							style={{ marginTop: '0.4em' }}
							src={getAvatarLinkById(who.avatar, who.gender)}
							alt={time}
							onClick={() => props.history.push(`/profile/${who._id}`)}
						/>
					}
					content={
						isEdit ? (
							<Spin spinning={editing} indicator={loadingIcon}>
								<div>
									<TextArea
										autoSize
										//defaultValue={textData}
										value={textData}
										ref={textRef}
										style={{
											border: 'none',
											backgroundColor: '#F2F2F2',
											boxShadow: 'none',
											resize: 'none',
											paddingRight: '1em',
											paddingLeft: '1em',
											borderRadius: '20px',
										}}
										onPressEnter={(e) => editHandler(e)}
										onChange={(e) => onChangeWhenEditing(e)}
									/>
									<SmileOutlined
										onClick={() => handleEditChange(edithandle)}
										id="emojiedit"
									/>
								</div>
							</Spin>
						) : (
							<>
								<div className="name-and-time">
									<a
										onClick={() => props.history.push(`/profile/${who._id}`)}
									>{`${who.firstName} ${who.lastName} `}</a>
									<div className="time">
										<Tooltip
											arrowPointAtCenter={false}
											title={dayjs(time).format('LL [at] HH:mm')}
										>
											<span>
												{daysCount === 1
													? dayjs(time).format('[Yesterday], [at] HH:mm')
													: daysCount > 1
														? dayjs(time).format('LL')
														: dayjs(time).fromNow()}
											</span>
										</Tooltip>
									</div>
								</div>
								<div className="content">{commetText}</div>
							</>
						)
					}
				></Comment>
				{localLikes.length > 0 && (
					<div className="like-count">
						{isThisCommentHasEmoji('LIKE') && (
							<img src={LIKE} className="icon_reacted" />
						)}
						{isThisCommentHasEmoji('LOVE') && (
							<img src={HEART} className="icon_reacted" />
						)}
						{isThisCommentHasEmoji('WOW') && (
							<img src={WOW} className="icon_reacted" />
						)}
						{isThisCommentHasEmoji('HAHA') && (
							<img src={HAHA} className="icon_reacted" />
						)}
						{isThisCommentHasEmoji('SAD') && (
							<img src={SAD} className="icon_reacted" />
						)}
						{isThisCommentHasEmoji('ANGRY') && (
							<img src={ANGRY} className="icon_reacted" />
						)}
						<Tooltip arrowPointAtCenter={false} title={whoLikes()}>
							{localLikes.length}
						</Tooltip>
					</div>
				)}
				{edithandle === true ? (
					<Picker
						style={{ position: 'absolute', right: '-15%', marginTop: '2%' }}
						onSelect={editEmoji}
					/>
				) : (
					''
				)}
			</div>
			<div className="AComment_footer">
				<div className="circle-icon">
					<EmojiReaction
						key={`${_id}-likes`}
						reactHandler={(e) => reactHandler(e)}
						unLikeHandler={() => unLikeHandler()}
						likes={localLikes || []}
						currentUser={currentUser}
						iconType="outline"
						defaultIconColor="#4CAF50"
					/>
				</div>
				<CommentOutlined className="circle-icon" onClick={onToggle} />

				{currentUser._id === who._id &&
          (isEdit || (
          	<DropdownTN overlay={menu} trigger={['click']}>
          		<EllipsisOutlined className="ant-dropdown-link circle-icon" />
          	</DropdownTN>
          ))}
			</div>
			<div className="child_comments">
				{toggle === true ? childComment : null}
				{toggle === true && post === true ? (
					<div>
						<Spin spinning={postingComment} indicator={loadingIcon}>
							{isBlock === false ? (
								<div>
									<div className="postComment" id="postCommentInside">
										<Avatar size={30} src={getAvatarLinkById(avatar, gender)} />
										<TextArea
											id="cmtText"
											placeholder="Type comment ..."
											autoSize
											onKeyPress={(e) => postCommentHandler(e)}
											ref={textRef}
											value={cmt}
											onChange={(e) => onChange(e)}
										/>
									</div>
									<SmileOutlined
										className="edit"
										onClick={() => handleVisibleChange(handle)}
										style={{
											position: 'absolute',
											top: '0.5rem',
											right: '0.8rem',
										}}
									/>
								</div>
							) : (
								''
							)}
						</Spin>
						{handle === true ? <Picker id="picker" onSelect={addEmoji} /> : ''}
					</div>
				) : null}
			</div>
			{listComment.length > 0 && toggle === false ? (
				<div className="seeMore">
					<a className="more-comments" onClick={handleSeeChildComments}>
						<NodeIndexOutlined /> {listComment.length} replys
					</a>
				</div>
			) : null}
		</div>
	)
}

export default withRouter(AComment)
