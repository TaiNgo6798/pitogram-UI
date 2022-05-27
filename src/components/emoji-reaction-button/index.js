import React from 'react'
import { Dropdown } from 'antd'
import './index.scss'
import LikeGif from '@assets/icons/like.gif'
import LoveGif from '@assets/icons/love.gif'
import HahaGif from '@assets/icons/haha.gif'
import WowGif from '@assets/icons/wow.gif'
import SadGif from '@assets/icons/sad.gif'
import AngryGif from '@assets/icons/angry.gif'

import { useMediaQuery } from 'react-responsive'

import { HeartFilled, HeartOutlined } from '@ant-design/icons'

const LIKE = <img src={LikeGif} className="icon_reaction" />

const HEART = <img src={LoveGif} className="icon_reaction" />

const HAHA = <img src={HahaGif} className="icon_reaction" />

const WOW = <img src={WowGif} className="icon_reaction" />

const SAD = <img src={SadGif} className="icon_reaction" />

const ANGRY = <img src={AngryGif} className="icon_reaction" />

const Index = (props) => {
	const {
		reactHandler,
		likes,
		currentUser,
		unLikeHandler,
		placement = 'top',
		iconType = 'outline',
		defaultIconColor = 'white',
		defaultIconFontSize,
		iconWidth = '1em',
		iconHeight = '1em',
	} = props
	const isDesktop = useMediaQuery({ query: '(min-width: 1024px)' })

	const getCurrentReact = () => {
		let react = likes.find((v) => v.who && v.who._id === currentUser._id).react
		switch (react) {
		case 'LIKE':
			return (
				<img
					src={LikeGif}
					className="icon_reacted"
					style={{ height: iconHeight, width: iconWidth }}
				/>
			)
		case 'LOVE':
			return (
				<img
					src={LoveGif}
					className="icon_reacted"
					style={{ height: iconHeight, width: iconWidth }}
				/>
			)
		case 'WOW':
			return (
				<img
					src={WowGif}
					className="icon_reacted"
					style={{ height: iconHeight, width: iconWidth }}
				/>
			)
		case 'HAHA':
			return (
				<img
					src={HahaGif}
					className="icon_reacted"
					style={{ height: iconHeight, width: iconWidth }}
				/>
			)
		case 'SAD':
			return (
				<img
					src={SadGif}
					className="icon_reacted"
					style={{ height: iconHeight, width: iconWidth }}
				/>
			)
		case 'ANGRY':
			return (
				<img
					src={AngryGif}
					className="icon_reacted"
					style={{ height: iconHeight, width: iconWidth }}
				/>
			)
		default:
			return null
		}
	}

	const iconClick = (react) => {
		reactHandler(react)
	}

	const likeClick = () => {
		if (
			likes.filter((v) => (v.who ? v.who._id : null) === currentUser._id)
				.length === 0
		) {
			iconClick('LOVE')
		} else {
			unLikeHandler()
		}
	}

	return (
		<Dropdown
			placement={placement}
			trigger={[isDesktop ? 'hover' : 'contextMenu']}
			overlay={
				<div className="emoji_list" style={{ marginBottom: '0.5em' }}>
					<div onClick={() => iconClick('LIKE')}>{LIKE}</div>
					<div onClick={() => iconClick('LOVE')}>{HEART}</div>
					<div onClick={() => iconClick('HAHA')}>{HAHA}</div>
					<div onClick={() => iconClick('WOW')}>{WOW}</div>
					<div onClick={() => iconClick('SAD')}>{SAD}</div>
					<div onClick={() => iconClick('ANGRY')}>{ANGRY}</div>
				</div>
			}
		>
			<div onClick={() => likeClick()} shape="round" className="react-button">
				<div
					className="default-icon"
					style={{
						color: defaultIconColor,
						fontSize: defaultIconFontSize,
						width: iconWidth,
						height: iconHeight,
					}}
				>
					{likes.map((v) => v.who && v.who._id).indexOf(currentUser._id) !==
          -1 ? (
							getCurrentReact()
						) : iconType === 'outline' ? (
							<HeartOutlined />
						) : (
							<HeartFilled />
						)}
				</div>
			</div>
		</Dropdown>
	)
}

export { LIKE, HEART, HAHA, WOW, SAD, ANGRY }

export default Index
