import React, { useState, useRef, useContext } from 'react'
import withAuthLogged from '../utils/hoc/authLogged'
import { Input, Avatar, Spin } from 'antd'
import { LoadingOutlined, SmileOutlined } from '@ant-design/icons'
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'
import * as _ from 'lodash'

import './index.scss'

import gql from 'graphql-tag'
import { useMutation } from '@apollo/react-hooks'

//context
import { UserContext } from '@contexts/userContext'

const { TextArea } = Input

const POST_COMMENT = gql`
  mutation postComment($commentInput: CommentInput!) {
    postOneComment(commentInput: $commentInput)
  }
`
const TYPING = gql`
  mutation typing($input: TypingInput!) {
    submitCommentStatus(input: $input)
  }
`
const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />

function CreateComment(props) {
	const { postID, isBlock } = props

	const textRef = useRef(null)

	const [typingStatus, setTypingStatus] = useState(false) // chi goi api mot lan true/false
	const [handle, setHandle] = useState(false)
	const [text, setText] = useState('')
	//context
	const { user, getAvatarLinkById } = useContext(UserContext)
	const { avatar, gender } = user

	const [postComment] = useMutation(POST_COMMENT)
	const [typing] = useMutation(TYPING)
	const [postingComment, setPostingComment] = useState(false)

	const onChange = (e) => {
		setText(e.target.value)
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

	const postCommentHandler = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			const text = textRef.current.resizableTextArea.props.value
			if (text && text.length > 0) {
				setPostingComment(true)
				postComment({
					variables: {
						commentInput: {
							postID,
							text: _.escape(text),
							parentID: postID,
						},
					},
				}).then(() => {
					setTypingStatus(false)
					setPostingComment(false)
					typing({
						variables: {
							input: {
								postID,
								status: false,
							},
						},
					})
					setText('')
					setHandle(false)
					textRef.current.resizableTextArea.props.value = null
				})
			}
		}
	}

	const handleVisibleChange = (visible) => {
		visible === true ? setHandle(false) : setHandle(true)
	}
	const addEmoji = (e) => {
		setText(text + e.native)
	}
	return (
		<div>
			<Spin spinning={postingComment} indicator={loadingIcon}>
				{isBlock === false ? (
					<div className="postComment">
						<Avatar size={30} src={getAvatarLinkById(avatar, gender)} />
						<TextArea
							id="cmtText"
							placeholder="Type comment ..."
							autoSize
							onKeyPress={(e) => postCommentHandler(e)}
							value={text}
							ref={textRef}
							onChange={(e) => onChange(e)}
						/>
						<SmileOutlined
							onClick={() => handleVisibleChange(handle)}
							style={{ position: 'absolute', right: '0.5rem' }}
							id="emoji"
						/>
					</div>
				) : (
					''
				)}
			</Spin>
			{handle === true ? <Picker id="picker" onSelect={addEmoji} /> : ''}
		</div>
	)
}

export default withAuthLogged(CreateComment)
