import React, { useState, useEffect, useMemo, useContext } from 'react'
import {
	CloseOutlined,
	SendOutlined,
	LoadingOutlined,
	SmileOutlined,
} from '@ant-design/icons'
import { Avatar, Badge, Input, Tooltip, Spin } from 'antd'
import gql from 'graphql-tag'
import _ from 'lodash'
import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/en'
dayjs.extend(relativeTime)
dayjs.extend(LocalizedFormat)
dayjs.locale('en')

import typingChat from '@assets/icons/typing-chat.gif'

//hook
import { useMediaQuery } from 'react-responsive'

import './index.scss'
import { useQuery, useMutation, useSubscription } from '@apollo/react-hooks'

//context
import { UserContext } from '@contexts/userContext'
import { Link } from 'react-router-dom'

//constants
import { CHAT_SKIP_STEP } from '@constants'

const CHAT_DATA = gql`
  query getChat($input: GetChatInput!) {
    getChats(input: $input) {
      _id
      time
      text
      sendID
      receiveID
      reactions {
        idWho
        react
      }
    }
  }
`

const SEND_CHAT = gql`
  mutation sendChat($input: ChatInput!) {
    sendChat(input: $input)
  }
`

const SUB_CHAT = gql`
  subscription newChatSentToConversation($receiveID: String!) {
    newChatSentToConversation(receiveID: $receiveID) {
      _id
      text
      sendID
    }
  }
`

const SUB_CHAT_TYPING = gql`
  subscription typingChat($receiveID: String!) {
    chatTyping(receiveID: $receiveID) {
      status
    }
  }
`
const SUBMIT_CHAT_STATUS = gql`
  mutation typing($input: TypingChatInput!) {
    submitChatStatus(input: $input)
  }
`

const { TextArea } = Input
const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />

function ChatWindow(props) {
	const isDesktop = useMediaQuery({ query: '(min-width: 1024px)' })
	const isMobile = useMediaQuery({ maxWidth: 425 })

	const {
		receiveID,
		onClose,
		avatar,
		name,
		onMinimal,
		iReadMyChat,
		lastSeen,
	} = props

	//context
	const { user: currentUser } = useContext(UserContext)

	// Graphql
	const [skip, setSkip] = useState(0)
	const { data, loading, refetch } = useQuery(CHAT_DATA, {
		fetchPolicy: 'network-only',
		variables: {
			input: {
				receiveID,
				skip,
			},
		},
	})
	const [sendChat] = useMutation(SEND_CHAT)
	const [submitChatStatus] = useMutation(SUBMIT_CHAT_STATUS)

	useSubscription(SUB_CHAT, {
		variables: {
			receiveID,
		},
		onSubscriptionData: (e) =>
			receiveNewChat(e.subscriptionData.data.newChatSentToConversation),
	})

	useSubscription(SUB_CHAT_TYPING, {
		variables: {
			receiveID,
		},
		onSubscriptionData: (e) =>
			receiveTypingStatus(e.subscriptionData.data.chatTyping.status),
	})

	//local states
	const [chatData, setChatData] = useState([])
	const [sendingChat] = useState(false)
	const [typingStatus, setTypingStatus] = useState(false) // chi goi api mot lan true/false - gui trang thai typing di
	const [friendTyping, setFriendTyping] = useState(false)
	const [text, setText] = useState('')
	const [handle, setHandle] = useState(false)


	useEffect(() => {
		if (!loading && chatData.length === 0) {
			setChatData(data.getChats)
		}
	}, [data, loading])

	const receiveTypingStatus = (status) => {
		//khi nhan duoc trang thai typing cua nguoi khac
		if (status) {
			setFriendTyping(true)
		} else {
			setFriendTyping(false)
		}
	}

	const howLongSinceMyLastSeen = () => {
		let minute = dayjs().diff(dayjs(lastSeen), 'minute')
		return minute
	}

	const onChange = (e) => {
		setText(e.target.value)
		onTyping(e.target.value)
	}

	const onTyping = (t) => {
		const currentText = t || ''
		if (currentText.length > 0 && !typingStatus) {
			setTypingStatus(true)
			submitChatStatus({
				variables: {
					input: {
						receiveID,
						status: true,
					},
				},
			})
		}
		if (currentText.length === 0) {
			setTypingStatus(false)
			submitChatStatus({
				variables: {
					input: {
						receiveID,
						status: false,
					},
				},
			})
		}
	}

	const receiveNewChat = (data) => {
		setChatData((prev) => [data, ...prev])
	}

	const sendChatHandler = (e) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			const value = text || ''
			e.preventDefault()
			if (_.trim(value).length > 0) {
				sendChat({
					variables: {
						input: {
							receiveID,
							text: _.escape(value),
						},
					},
				}).then(() => {
					setTypingStatus(false)
					submitChatStatus({
						variables: {
							input: {
								receiveID,
								status: false,
							},
						},
					})
				})
				setHandle(false)
				setText('')
			}
		}
	}

	const friendTypingComponent = useMemo(() => {
		return friendTyping ? (
			<div className="chat_item" key={'typing'}>
				<Avatar size={32} src={avatar} style={{ marginTop: 'auto' }} />
				<img src={typingChat} className="typing-image" />
			</div>
		) : null
	}, [friendTyping, typingChat])

	const urlify = (text) => {
		let res = text.replace(
			/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim,
			(v) => `<a href=${v}>${v}</a>`,
		)
		return res
	}

	const loadChatItem = useMemo(() => {
		return loading ? (
			loadingIcon
		) : (
			<>
				{chatData.map((v) => {
					let daysCount = Math.round(
						new Date(Date.now() - v.time) / 3600000 / 24,
					)
					let className = v.sendID === currentUser._id ? 'myChat' : ''
					return (
						<div className={`chat_item ${className}`} key={v._id}>
							{v.sendID === currentUser._id || (
								<Avatar size={32} src={avatar} style={{ marginTop: 'auto' }} />
							)}
							<div className="chat_data">
								<Tooltip
									mouseEnterDelay={0.5}
									placement="top"
									title={
										daysCount === 1
											? dayjs(v.time).format('[Yesterday], [at] HH:mm')
											: daysCount > 1
												? dayjs(v.time).format('LL [at] LT')
												: dayjs(v.time).fromNow()
									}
								>
									<p
										style={{ whiteSpace: 'pre-wrap' }}
										dangerouslySetInnerHTML={{
											__html: urlify(_.unescape(v.text)),
										}}
									/>
								</Tooltip>
							</div>
						</div>
					)
				})}
			</>
		)
	}, [chatData, loading])

	const scrollBodyHandler = () => {
		let element = document.getElementById(
			'_content-window-chatbar_' + receiveID,
		)
		let loadingIcon = document.getElementById(`_loading-more-icon_${receiveID}`)

		let valueScroll = (element.scrollHeight + element.scrollTop).toFixed(0)

		if ([-1, 0, 1].indexOf(valueScroll - element.offsetHeight) !== -1) {
			loadingIcon.classList.add("show-loading-more")
			refetch({
				input: {
					receiveID,
					skip: skip + CHAT_SKIP_STEP,
				},
			}).then((res) => {
				if (res.data && res.data.getChats.length > 0) {
					setSkip((prev) => prev + CHAT_SKIP_STEP)
					setTimeout(() => {
						setChatData((prev) => [...prev, ...res.data.getChats])
						loadingIcon.classList.remove("show-loading-more")
					}, 700);
				} else {
					setTimeout(() => {
						loadingIcon.classList.remove("show-loading-more")
					}, 700);
				}
			})
		}
	}

	const handleClick = () => {
		handle === true ? setHandle(false) : setHandle(true)
	}

	const addEmoji = (e) => {
		setText((prev) => prev + e.native)
		onTyping(e.native)
	}

	return (
		<>
			<div
				className={`chat-window ${!isDesktop && 'chat-window-mobile'}`}
				id={'_window_' + receiveID}
				onMouseEnter={() => iReadMyChat(receiveID)}
			>
				<div
					className="header_chat-window window_width"
					onClick={() => {
						!isMobile ? onMinimal(receiveID) : onClose(receiveID)
					}}
				/>
				<Badge
					color="green"
					dot={howLongSinceMyLastSeen() < 1}
					style={{ backgroundColor: '#52c41a', margin: '5px' }}
					className="avt"
				>
					<Link to={`/profile/${receiveID}`}>
						<Avatar size={32} src={avatar} />
					</Link>
				</Badge>
				<Link to={`/profile/${receiveID}`} className="name">
					<p>{name}</p>
				</Link>
				<Tooltip arrowPointAtCenter={false} placement="top" title="Close">
					<CloseOutlined
						className="circle-icon"
						onClick={() => onClose(receiveID)}
					/>
				</Tooltip>
				{
					<div
						className="loading-more-icon"
						id={'_loading-more-icon_' + receiveID}
					>
						{loadingIcon}
					</div>
				}
				<div
					className="content_chat-window"
					id={'_content-window-chatbar_' + receiveID}
					onScroll={_.debounce(scrollBodyHandler, 200)}
				>
					{friendTypingComponent}
					{loadChatItem}
					{handle === true ? (
						<Picker
							style={{
								position: 'fixed',
								width: '90%',
								marginLeft: 0,
							}}
							onSelect={addEmoji}
						/>
					) : (
						''
					)}
				</div>
				<Spin spinning={sendingChat} indicator={loadingIcon}>
					<div className={'footer_chat-window'}>
						<TextArea
							autoSize
							autoFocus
							placeholder="Type mesasage ..."
							value={text}
							onKeyDown={(e) => sendChatHandler(e)}
							onChange={(e) => onChange(e)}
							onMouseEnter={() => iReadMyChat(receiveID)}
						/>
						<SmileOutlined onClick={() => handleClick()} />
						<SendOutlined
							className="circle-icon"
							onClick={() =>
								sendChatHandler({
									key: 'Enter',
									shiftKey: false,
									preventDefault: () => {},
								})
							}
						/>
					</div>
				</Spin>
			</div>
		</>
	)
}

export default ChatWindow
