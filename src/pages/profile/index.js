import React, { useState, useEffect, useContext, useMemo } from 'react'
import { withRouter } from 'react-router-dom'
import { Tabs } from 'antd'

import gql from 'graphql-tag'

//import components
import DetailProfile from './inforTab'
import Avatar from './avatar'
import ImageGrid from '@components/imageGrid'

// import css
import './index.scss'

//context
import { UserContext } from '@contexts/userContext'
import { DefaultValues } from '@contexts/defaultValues'
import { useQuery, useMutation } from '@apollo/react-hooks'

const { TabPane } = Tabs

const USER = gql`
  query getUser($_id: String!) {
    getUserByID(_id: $_id) {
      _id
      email
      firstName
      lastName
      avatar
      coverPhoto
      dob
      bio
      gender
      relationship
      phone
      schools
      companies
      permissions
      interestList
    }
  }
`

const UPDATE_PROFILE = gql`
  mutation updateUserInfo($userInfo: UserInfoInput!) {
    updateUserInfo(userInfo: $userInfo)
  }
`

function Profile(props) {
	const { user: currentUser, refreshUser, getAvatarLinkById } = useContext(
		UserContext,
	)

	const { defaultWho } = useContext(DefaultValues)
	const {
		match: {
			params: { userID },
		},
	} = props

	//graphql
	const [updateProfile] = useMutation(UPDATE_PROFILE)
	const { data, loading } = useQuery(USER, {
		fetchPolicy: 'network-only',
		variables: {
			_id: userID,
		},
	})

	//local states
	const [profileKey, setProfileKey] = useState('1')
	const [user, setUser] = useState({})

	useEffect(() => {
		if (!loading) {
			setUser(data.getUserByID || defaultWho)
		}
	}, [data])

	// const menu = (
	// 	<>
	// 		<Menu>
	// 			<Menu.Item>
	// 				<ExclamationCircleOutlined /> Báo cáo{' '}
	// 				{`${user.firstName} ${user.lastName}`}
	// 			</Menu.Item>
	// 		</Menu>
	// 	</>
	// )

	const Content = useMemo(() => {
		if (loading || !user) {
			return 'loading ...'
		} else {
			const { _id, avatar, firstName, lastName, gender } = user
			return (
				<div className="center-content_profile">
					<div className="top-content_profile">
						<div className="cover-photo_profile">
							<Avatar
								avatar={avatar}
								gender={gender}
								refreshUser={refreshUser} //update user info in contex
								getAvatarLinkById={getAvatarLinkById}
								canEdit={currentUser && currentUser._id === _id}
								oldAvatar={currentUser.avatar}
								updateProfile={updateProfile}
							/>
						</div>
						<div className="footer_profile">
							<div className="name_profile">
								<h1 style={{ zIndex: 2 }}>{`${firstName || ''} ${
									lastName || ''
								}`}</h1>
							</div>
							<div className="tabs_profile">
								<Tabs
									defaultActiveKey="1"
									onChange={(key) => setProfileKey(key)}
								>
									<TabPane tab="Timeline" key="1"></TabPane>
									<TabPane tab="Information" key="2"></TabPane>
								</Tabs>
							</div>
							{/* {currentUser._id !== user._id && (
								<div className="buttons_profile">
									<div className="add-friend-btn hover-color">
										<UserAddOutlined className="icon" />
										<p>Thêm bạn bè</p>
									</div>
									<div className="messenger-btn hover-color">
										<MessageOutlined className="icon" />
										<p>Nhắn tin</p>
									</div>
									<DropdownTN
										overlay={menu}
										trigger={['click']}
										placement="bottomLeft"
									>
										<div className="dots-btn hover-color">
											<EllipsisOutlined
												style={{
													fontSize: 'large',
												}}
											/>
										</div>
									</DropdownTN>
								</div>
							)} */}
						</div>
					</div>
					<div className="body_timeline_profile">
						{profileKey === '1' ? (
							<>
								<div className="posts_profile">
									<ImageGrid
										userID={userID}
										query="byID"
										key={'postList-profile'}
									/>
								</div>
							</>
						) : (
							<DetailProfile
								user={user}
								refetch={refreshUser}
								canEdit={currentUser._id === _id}
								updateProfile={updateProfile}
							/>
						)}
					</div>
				</div>
			)
		}
	}, [user, profileKey])

	return <>{Content}</>
}

export default withRouter(Profile)
