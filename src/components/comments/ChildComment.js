import React, { useState, useContext, useRef } from 'react'
import gql from 'graphql-tag'
import * as _ from 'lodash'
import { Comment, Avatar, Spin, Tooltip, Menu, Modal, notification, Input } from 'antd'
import { Link, withRouter } from 'react-router-dom'
import { UserContext } from '@contexts/userContext'
import { DefaultValues } from '@contexts/defaultValues'
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'
import {
	DeleteOutlined,
	EditOutlined,
	EllipsisOutlined,
	LoadingOutlined,
	MehOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { useMutation } from '@apollo/react-hooks'
import 'dayjs/locale/en'
import DropdownTN from '@components/DropdownTN'

import EmojiReaction from '@components/emoji-reaction-button'
import LIKE from '@assets/icons/like.png'
import HEART from '@assets/icons/love.png'
import WOW from '@assets/icons/wow.png'
import HAHA from '@assets/icons/haha.png'
import SAD from '@assets/icons/sad.png'
import ANGRY from '@assets/icons/angry.png'

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

const {TextArea} = Input

const ChildComment = (props) => {
	const { e, refreshData } = props
	const [deleteComment] = useMutation(DELETE)
	const [editComment] = useMutation(EDIT)
	const [likeAComment] = useMutation(DO_LIKE)
	const [unlikeAComment] = useMutation(UN_LIKE)

	const { user: currentUser, getAvatarLinkById } = useContext(UserContext)
	const { defaultWho } = useContext(DefaultValues)

	const [isEdit, setIsEdit] = useState(false)
	const [editing, setEditing] = useState(false)
	const [textData, setTextData] = useState(e.text)
	const [localLikes, setLocalLikes] = useState(e.likes ? e.likes : [])
	const [handle, setHandle] = useState(false)
	const cmtID = e._id
	const textRef = useRef(null)

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

	const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />
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
	const { confirm } = Modal
	const deleteHandler = () => {
		confirm({
			title: 'Are you sure ?',
			centered: true,
			onOk() {
				deleteComment({
					variables: {
						_id: e._id,
					},
				})
					.then((res) => {
						if (res.data.deleteOneComment) {
							reactHandler()
						} else notify('Something went wrong!', false)
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
		setHandle(false)
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			if (text === textData) {
				setEditing(true)
				editComment({
					variables: {
						editInput: {
							_id: cmtID,
							text: _.escape(text),
						},
					},
				})
					.then((res) => {
						if (!res.data.editOneComment) {
							notify('Cant edit this comment !', false)
						} else {
							setTextData(text)
						}
						setEditing(false)
						setIsEdit(false)
						refreshData()
					})
					.catch(() => {
						setEditing(false)
						setIsEdit(false)
						notify('Something is wrong !', false)
					})
			} else {
				setIsEdit(false)
			}
		}
	}
	const isThisCommentHasEmoji = (reaction) => {
		let newSet = new Set(localLikes.map((v) => v.react))
		return newSet.has(reaction)
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
					parentID: cmtID,
					react: reaction,
				},
			})
			refreshData()
		}
	}
	const whoLikes = () => {
		try {
			return localLikes.map((v) => {
				return (
					<Link
						to={`/profile/${v.who._id}`}
						style={{ color: 'white' }}
						key={v.who._id}
					>
						<p className="who_like_item">
							{v.who.firstName + ' ' + v.who.lastName}
						</p>
					</Link>
				)
			})
		} catch (error) {
			console.log(error)
		}
	}

	const unLikeHandler = () => {
		setLocalLikes((prev) => [
			...prev.filter((v) => v.who && v.who._id !== currentUser._id),
		])
		unlikeAComment({
			variables: {
				parentID: cmtID,
			},
		})
		refreshData()
	}
	const handleEditChange = (visible) => {
		visible === true ? setHandle(false) : setHandle(true)
	}
	const editEmoji = (e) => {
		if (textData) {
			setTextData(textData + e.native)
		} else {
			setTextData(e.native)
		}
	}
	const onEditChildComment = (e) => {
		setTextData(e.target.value)
	}
	return (
		<div className="A_comment" id="childComment">
			<div className={`comment-body ${isEdit && 'editing-comment'}`}>
				<Comment
					avatar={
						<Avatar
							style={{ marginTop: '0.4em' }}
							src={getAvatarLinkById(e.who.avatar, e.who.gender)}
							alt={e.time}
							onClick={() => props.history.push(`/profile/${e.who._id}`)}
							className="child-comment_avatar"
						/>
					}
					content={
						isEdit ? (
							<Spin spinning={editing} indicator={loadingIcon}>
								<div>
									<TextArea
										autoSize
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
										onChange={(e) => onEditChildComment(e)}
									/>
									<MehOutlined
										onClick={() => handleEditChange(handle)}
										id="emojiedit"
									/>
								</div>
							</Spin>
						) : (
							<>
								<div className="name-and-time">
									<a
										onClick={() => props.history.push(`/profile/${e.who._id}`)}
									>{`${e.who.firstName} ${e.who.lastName} `}</a>
									<div className="time">
										<Tooltip
											arrowPointAtCenter={false}
											title={dayjs(e.time).format('LL [at] HH:mm')}
										>
											<span>
												{Math.round(
													new Date(Date.now() - e.time) / 3600000 / 24,
												) === 1
													? dayjs(e.time).format('[Tomorrow], [at] HH:mm')
													: Math.round(
														new Date(Date.now() - e.time) / 3600000 / 24,
													) > 1
														? dayjs(e.time).format('LL')
														: dayjs(e.time).fromNow()}
											</span>
										</Tooltip>
									</div>
								</div>
								<div className="content">{e.text}</div>
							</>
						)
					}
				></Comment>
				{localLikes.length > 0 ? (
					<Tooltip arrowPointAtCenter={false} title={whoLikes}>
						{localLikes.length > 0 && (
							<div className="like-countt" style={{ fontSize: 14 }}>
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

								{localLikes.length}
							</div>
						)}
					</Tooltip>
				) : null}
			</div>
			{handle === true ? (
				<Picker
					style={{ position: 'absolute', right: '-15%', marginTop: '2%' }}
					onSelect={editEmoji}
				/>
			) : (
				''
			)}
			<div className="AComment_footer">
				{
					<div className="circle-icon">
						<EmojiReaction
							key={`${cmtID}-likes`}
							reactHandler={(a) => reactHandler(a)}
							unLikeHandler={() => unLikeHandler()}
							likes={localLikes ? localLikes : []}
							currentUser={currentUser}
							iconType="outline"
							defaultIconColor="#4CAF50"
						/>
					</div>
				}

				{currentUser._id === e.who._id &&
          (isEdit || (
          	<DropdownTN overlay={menu} trigger={['click']}>
          		<EllipsisOutlined className="ant-dropdown-link circle-icon" />
          	</DropdownTN>
          ))}
			</div>
		</div>
	)
}

export default withRouter(ChildComment)
