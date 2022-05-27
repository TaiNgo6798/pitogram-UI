import React, { useState, useContext } from 'react'
import NoImg from '@assets/images/no-img.jpg'
import { Avatar, Button, Menu } from 'antd'
import { DownloadOutlined } from '@ant-design/icons'
import { saveAs } from 'file-saver'

//dayjs
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)
import 'dayjs/locale/en'
dayjs.locale('en')

import { useMediaQuery } from 'react-responsive'

// import css
import './index.scss'

//import components
import PostFooter from './postFooter'
import DropdownTN from '@components/DropdownTN'

//Context
import { UserContext } from '@contexts/userContext'
import { DefaultValues } from '@contexts/defaultValues'

import { Link, withRouter } from 'react-router-dom'

const Post = (props) => {
	const isDesktop = useMediaQuery({ query: '(min-width: 664px)' })
	const isMobile = useMediaQuery({ query: '(max-width: 425px)' })
	const {
		_id,
		photo,
		user,
		likes: dataLikes,
		commentsCount: dataCommentsCount,
	} = props

	const { defaultWho } = useContext(DefaultValues)
	const { user: currentUser, getAvatarLinkById } = useContext(UserContext)

	// neu la bai dang cua nguoi minh thi dung currentUser => khi thay doi thong tin user => thong tin user trong post cung thay doi theo
	const { _id: userID, avatar, firstName, lastName, gender } = user
		? user._id === currentUser._id
			? currentUser
			: user
		: defaultWho

	const {
		height,
		width,
		// artist,
		// copyright,
		// flash,
		// focalLength,
		// iso,
		// lensModel,
		// make,
		// model,
		// createDate,
		pathID,
	} = photo || {}

	//local state
	const [commentsCount] = useState(dataCommentsCount)

	const onMouseEnter = () => {
		const USER = document.getElementById(`${_id}-post-user`)
		const FOOTER = document.getElementById(`${_id}-post-footer`)
		const IMAGE = document.getElementById(`${_id}-post-image`)

		IMAGE.classList.add('hover-image')
		USER.classList.add('hover-user')
		FOOTER.classList.add('hover-footer')
	}

	const onMouseLeave = () => {
		const USER = document.getElementById(`${_id}-post-user`)
		const FOOTER = document.getElementById(`${_id}-post-footer`)
		const IMAGE = document.getElementById(`${_id}-post-image`)

		IMAGE.classList.remove('hover-image')
		USER.classList.remove('hover-user')
		FOOTER.classList.remove('hover-footer')
	}

	const triggerDownload = (size) => {
		saveAs(
			`${process.env.SERVER_MEDIA_URL}/url?type=post&id=${pathID}&size=${size}`,
			`${_id}.jpg`,
		)
	}

	const menu = (
		<>
			<Menu>
				<Menu.Item onClick={() => triggerDownload('small')}>
          Small {`(${500} x ${((height * 500) / width).toFixed(0)})`}
				</Menu.Item>
				<Menu.Item onClick={() => triggerDownload('medium')}>
          Medium {`(${1024} x ${((height * 1024) / width).toFixed(0)})`}
				</Menu.Item>
				<Menu.Item onClick={() => triggerDownload('large')}>
          Large {`(${2048} x ${((height * 2048) / width).toFixed(0)})`}
				</Menu.Item>
				<Menu.Item onClick={() => triggerDownload('original')}>
          Original {`(${width} x ${height})`}
				</Menu.Item>
			</Menu>
		</>
	)

	return (
		<>
			<div
				className={`postForm ${isDesktop ? 'on-desktop' : 'on-mobile'}`}
				style={{ minHeight: Math.round((height * 300) / width) }}
			>
				<div
					className="body"
					id="post-body"
					onMouseEnter={() => onMouseEnter()}
					onMouseLeave={() => onMouseLeave()}
				>
					<div
						className={`user ${isMobile && 'hover-user'}`}
						id={`${_id}-post-user`}
					>
						<div className="avatar">
							<Link id={`${_id}-avatar-link`} to={`/profile/${userID}`}>
								<Avatar
									key={_id}
									size={30}
									src={getAvatarLinkById(avatar, gender)}
								/>
							</Link>
						</div>
						<div className="username">
							<Link to={`/profile/${userID}`}>
								<p>{`${firstName || ''} ${lastName || ' '}`}</p>
							</Link>
						</div>
						<div className="top-right">
							<DropdownTN overlay={menu} trigger="hover">
								<Button
									type="default"
									shape="circle"
									className="download-button"
								>
									<DownloadOutlined />
								</Button>
							</DropdownTN>
						</div>
					</div>

					<Link to={`/post/${_id}`} className="image" id={`${_id}-post-image`}>
						{photo ? (
							<img
								src={`https://storage.googleapis.com/taingoblog.appspot.com/social/post/${pathID}-medium.jpg`}
							/>
						) : (
							<img className="image" src={NoImg} />
						)}
					</Link>

					<div
						id={`${_id}-post-footer`}
						className={`post__footer ${isMobile && 'hover-footer'}`}
					>
						<PostFooter
							postID={_id}
							dataLikes={dataLikes}
							commentsCount={commentsCount}
						/>
					</div>
				</div>
			</div>
		</>
	)
}

export default withRouter(Post)
