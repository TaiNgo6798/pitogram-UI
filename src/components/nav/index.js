import React, { useContext } from 'react'
import { useMediaQuery } from 'react-responsive'
import {
	PlusOutlined,
	MailOutlined,
	CaretDownFilled,
	CaretUpFilled,
	LogoutOutlined,
	SearchOutlined,
	LoginOutlined,
} from '@ant-design/icons'
import { Input, Badge, Tooltip, Menu } from 'antd'
import { withRouter } from 'react-router-dom'

import './index.scss'

import Infor from '@components/nav/infor'
import DropdownTN from '@components/DropdownTN'
import { UserContext } from '../../contexts/userContext'
import CreatePost from '@components/createPost'
import Notifications from '@components/notifications'

//contexts
import { PostingModalContext } from '@contexts/postingModalContext'
import { ChatBarContext } from '@contexts/chatBarContext'

const { Search } = Input

function Nav(props) {
	const { logged, history } = props
	const isDesktop = useMediaQuery({ minWidth: 1024 })

	//contexts
	const { user: currentUser, getAvatarLinkById, unReadFrom = [] } = useContext(
		UserContext,
	)
	const { setShowPostingModal } = useContext(PostingModalContext)
	const { showChatBar, setShowChatBar } = useContext(ChatBarContext)

	const logoutHandler = () => {
		localStorage.clear()
		window.location.href = '/'
	}

	const moreMenu = logged ? (
		<>
			<Menu>
				{!isDesktop && (
					<Menu.Item onClick={() => setShowPostingModal(true)}>
						<PlusOutlined style={{ marginRight: '0.8em' }} />
            Create
					</Menu.Item>
				)}
				<Menu.Item onClick={() => logoutHandler()}>
					<LogoutOutlined style={{ marginRight: '0.8em' }} />
          Log out
				</Menu.Item>
			</Menu>
		</>
	) : (
		<>
			<Menu>
				<Menu.Item onClick={() => history.push('/login')}>
					<LoginOutlined style={{ marginRight: '0.8em' }} />
          Login
				</Menu.Item>
			</Menu>
		</>
	)

	const toggleSearchBar = () => {
		window.document
			.getElementById('search-bar')
			.classList.toggle('show-search-bar')
	}

	return (
		<div className="nav">
			{logged && <CreatePost />}
			<div className="container-nav">
				{isDesktop ? (
					<div className="logo" onClick={() => history.push('/')} />
				) : (
					<div className="logo_mobile" onClick={() => history.push('/')} />
				)}

				<div
					className={`searchBar ${!isDesktop && logged && 'search-bar-toggle'}`}
					id="search-bar"
				>
					<Search
						placeholder="cats, dogs, people, portrait,..."
						onSearch={(text) =>
							history.push(`/s/photos/${text.replace(' ', '-')}`)
						}
					/>
				</div>

				{!isDesktop && logged && (
					<SearchOutlined
						className="icon user_icon direct-button circle-icon"
						onClick={() => toggleSearchBar()}
					/>
				)}

				{logged && (
					<>
						{!!isDesktop && (
							<div
								className="direct-button circle-icon"
								onClick={() => setShowPostingModal(true)}
							>
								<Tooltip placement="bottom" title={isDesktop && 'Create'}>
									<PlusOutlined className="icon " />
								</Tooltip>
							</div>
						)}

						<div
							className="direct-button circle-icon"
							onClick={() => setShowChatBar(!showChatBar)}
						>
							<Badge count={unReadFrom.length}>
								<Tooltip placement="bottom" title={isDesktop && 'Message'}>
									<MailOutlined />
								</Tooltip>
							</Badge>
						</div>

						<div className="direct-button circle-icon">
							<Notifications isDesktop={isDesktop} />
						</div>

						<Infor
							isDesktop={isDesktop}
							user={
								currentUser
									? currentUser
									: { image: '', firstName: 'anonymous' }
							}
							getAvatarLinkById={(avatar, gender) =>
								getAvatarLinkById(avatar, gender)
							}
						/>
					</>
				)}

				<DropdownTN
					overlay={moreMenu}
					trigger={['click']}
					placement={!isDesktop ? 'topLeft' : 'bottomLeft'}
				>
					{!isDesktop ? (
						<CaretUpFilled className="icon more_icon direct-button circle-icon" />
					) : (
						<CaretDownFilled className="icon more_icon direct-button circle-icon" />
					)}
				</DropdownTN>

				{window.location.href.indexOf('login') === -1 && !logged && (
					<>
						<a
							className="login-button"
							onClick={() => (window.location.href = '/login')}
						>
              Login
						</a>
					</>
				)}
			</div>
		</div>
	)
}

export default withRouter(Nav)
