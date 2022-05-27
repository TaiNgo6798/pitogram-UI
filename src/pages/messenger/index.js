import React, { useContext } from 'react'
import './index.scss'
import _ from 'lodash'

//dayjs
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/en'
dayjs.extend(relativeTime)
dayjs.extend(LocalizedFormat)
dayjs.locale('en')

// import { useMediaQuery } from 'react-responsive'
import { withRouter } from 'react-router-dom'

import { Avatar, Row, Col, Input, Tooltip } from 'antd'
import { SendOutlined,
	SearchOutlined,
	EditOutlined,
	BgColorsOutlined,
	SettingOutlined,
	StopOutlined
} from '@ant-design/icons'

//context
import { UserContext } from '@contexts/userContext'

const mockData = [
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
	1,
]

const { TextArea } = Input
const Messenger = () => {
	// const { history } = props
	// const isDesktop = useMediaQuery({ query: '(min-width: 1024px)' })
	const { user: currentUser, getAvatarLinkById } = useContext(UserContext)

	const { avatar, gender } = currentUser

	const oneMess = (
		_id,
		avatar,
		gender,
		firstName,
		lastName,
		lastestMessage,
	) => {
		return (
			<div key={_id} className="left-content_body_oneMess hover-color">
				<Avatar size={45} src={getAvatarLinkById(avatar, gender)} />
				<div>
					<p className="name">{`${firstName} ${lastName}`}</p>
					<p className="lastest-message">{lastestMessage}</p>
				</div>
			</div>
		)
	}

	const renderMessages = () => {
		return mockData.map((v, k) => {
			return oneMess(
				k,
				null,
				Math.floor(Math.random() * 10) === 0 ? 'male' : 'female',
				'One',
				'User',
				'Lorem Ipsum is simply dummy text of the printing and typesetting industry.',
			)
		})
	}

	const urlify = (text) => {
		let res = text.replace(
			/(?:(?:https?|ftp|file):\/\/|www\.|ftp\.)(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[-A-Z0-9+&@#\/%=~_|$?!:,.])*(?:\([-A-Z0-9+&@#\/%=~_|$?!:,.]*\)|[A-Z0-9+&@#\/%=~_|$])/gim,
			(v) => `<a href=${v}>${v}</a>`,
		)
		return res
	}

	const renderChatData = () => {
		return mockData.map((v, k) => {
			return (
				<div className={`chat_item ${k % 2 === 0 ? 'myChat' : ''}`} key={k}>
					{k % 2 !== 0 && (
						<Avatar
							size={32}
							src={getAvatarLinkById(null, 'male')}
							style={{ marginTop: 'auto' }}
						/>
					)}
					<div className="chat_data">
						<Tooltip
							mouseEnterDelay={0.5}
							placement="top"
							title={dayjs(Date.now()).format('[Yesterday], [at] HH:mm')}
						>
							<p
								style={{ whiteSpace: 'pre-wrap' }}
								dangerouslySetInnerHTML={{
									__html: urlify(_.unescape('test')),
								}}
							/>
						</Tooltip>
					</div>
				</div>
			)
		})
	}

	return (
		<Row className="messenger-content">
			<Col
				className="left-content"
				xs={{ span: 24 }}
				md={{ span: 8 }}
				lg={{ span: 6 }}
			>
				<div className="left-content_header ">
					<Avatar size={40} src={getAvatarLinkById(avatar, gender)} />
					<h3>Trò chuyện</h3>
				</div>
				<div className="left-content_body">{renderMessages()}</div>
			</Col>
			<Col
				className="center-content"
				xs={{ span: 0 }}
				md={{ span: 16 }}
				lg={{ span: 12 }}
			>
				<div className="center-content_header ">
					<Avatar size={40} src={getAvatarLinkById(null, gender)} />
					<div className="name">
						<h4>User Name</h4>
						<p>Đang hoạt động</p>
					</div>
				</div>
				<div className="center-content_body">{renderChatData()}</div>
				<div className="center-content_footer">
					<TextArea autoSize placeholder="Type mesasage ..." />
					<SendOutlined className="circle-icon" />
				</div>
			</Col>
			<Col className="right-content" xs={{ span: 0 }} lg={{ span: 6 }}>
				<div className="right-content_header ">
					<div className='info'>
						<Avatar size={120} src={getAvatarLinkById(avatar, gender)} />
						<h2>User Name</h2>
					</div>
				</div>
				<div className="right-content_body">
					<div className='hover-color'><SearchOutlined />Tìm trong cuộc hội thoại</div>
					<div className='hover-color'><EditOutlined />Sửa biệt danh</div>
					<div className='hover-color'><BgColorsOutlined />Đổi màu</div>
					<div className='hover-color'><SettingOutlined />Cài đặt thông báo</div>
					<div className='hover-color'><StopOutlined />Chặn</div>
				</div>
			</Col>
		</Row>
	)
}

export default withRouter(Messenger)
