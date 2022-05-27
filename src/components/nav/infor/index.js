import React from 'react'
import { Avatar, Tooltip } from 'antd'
// import css
import './index.scss'
import { withRouter } from 'react-router-dom'

const Infor = ({ user, getAvatarLinkById, isDesktop, history } ) => {
	const { gender, avatar, _id } = user

	const InforSection = (
		<div
			className="infor hover-color"
			onClick={() => history.push(`/profile/${_id}`)}
		>
			<Avatar size={30} src={getAvatarLinkById(avatar, gender)} />
		</div>
	)
		
	return (
		<Tooltip
			arrowPointAtCenter={false}
			placement="bottom"
			title={isDesktop && 'Profile'}
		>
			{InforSection}
		</Tooltip>
	)
}

export default withRouter(Infor)
