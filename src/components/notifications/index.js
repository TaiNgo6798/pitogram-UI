import React, { useContext, useEffect, useState } from 'react'
import { Menu, Avatar, notification, Badge, Tooltip } from 'antd'
import { useMutation, useQuery, useSubscription } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import DropdownTN from '@components/DropdownTN'
import FullScreenMenu from '@components/fullScreenMenu'

import { BellOutlined } from '@ant-design/icons'

import './index.scss'

//days
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/en'
dayjs.extend(relativeTime)
dayjs.extend(LocalizedFormat)
dayjs.locale('en')

const GET_NOTI = gql`
  query getNotiByUserID($userID: String!) {
    getNotiByUserID(userID: $userID) {
      _id
      userID
      postID
      text
      thumb
      whoInteractive
      timeStamp
      seen
    }
  }
`
const NOTI_ADDED = gql`
  subscription notiAdded {
    notiAdded {
      _id
      text
      whoInteractive
      timeStamp
      seen
    }
  }
`

const I_READ_MY_NOTI = gql`
  mutation iReadMyNoti($_id: String!) {
    iReadMyNoti(_id: $_id)
  }
`

//context
import { UserContext } from '@contexts/userContext'
import { withRouter } from 'react-router-dom'

const Notifications = ({ history, isDesktop }) => {
	const [listNoti, setListNoti] = useState([])
	const [show, setShow] = useState(false)

	//context
	const { user: currentUser, getAvatarLinkById } = useContext(UserContext)

	const notify = (text) => {
		notification.info({
			message: text,
			placement: 'bottomLeft',
		})
	}

	const [iReadMyNoti] = useMutation(I_READ_MY_NOTI)

	const { loading, data, refetch } = useQuery(GET_NOTI, {
		fetchPolicy: 'network-only',
		variables: {
			userID: currentUser._id || '',
		},
	})

	useSubscription(NOTI_ADDED, {
		onSubscriptionData: (e) => receiveNewNotification(e.subscriptionData.data),
	})

	const receiveNewNotification = (data) => {
		notify(data.notiAdded.text)
		refetch().then((res) => {
			setListNoti([...res.data.getNotiByUserID])
		})
	}

	useEffect(() => {
		let mounted = true
		if (mounted) {
			if (!loading) {
				setListNoti([...data.getNotiByUserID])
			}
		}
		return () => {
			mounted = false
		}
	}, [data])

	const renderNotifications = () => {
		return listNoti.length === 0 ? (
			<Menu.Item>
				<div className="noti-item">
					<div className="noti_text">
						<p>No any notification !</p>
						<p></p>
					</div>
				</div>
			</Menu.Item>
		) : (
			listNoti.map((v) => {
				const daysCount = Math.round(
					new Date(Date.now() - v.timeStamp) / 3600000 / 24,
				)
				const reacted = v.text.split(' ').reverse()[2]
				const reactions = ['HAHA', 'ANGRY', 'SAD', 'WOW', 'LIKE', 'LOVE']
				const reactionColor = [
					'yellow',
					'orange',
					'yellow',
					'yellow',
					'blue',
					'pink',
				]
				return (
					<Menu.Item
						key={v._id}
						onMouseEnter={() => {
							if (!v.seen) {
								iReadMyNoti({
									variables: {
										_id: v._id,
									},
								}).then(() => {
									refetch().then((res) => {
										setListNoti([...res.data.getNotiByUserID])
									})
								})
							}
						}}
						style={{ backgroundColor: 'F5F5F5' }}
					>
						{v.seen ? (
							<div
								className="noti-item"
								onClick={() => history.push('/post/' + v.postID)}
							>
								<Avatar
									size={60}
									src={getAvatarLinkById(
										['male', 'female'].indexOf(v.thumb) !== -1 ? null : v.thumb,
										v.thumb,
									)}
								/>
								<div className="noti_text">
									<p>{v.text}</p>

									<p>
										{daysCount === 1
											? dayjs(v.timeStamp).format('[Yesterday], [at] HH:mm')
											: daysCount > 1
												? dayjs(v.timeStamp).format('LL')
												: dayjs(v.timeStamp).fromNow()}
									</p>
								</div>
							</div>
						) : (
							<Badge.Ribbon
								text={`${
									v.text.indexOf('commented') !== -1 ? 'comment' : reacted
								}`}
								color={
									v.text.indexOf('commented') !== -1
										? 'green'
										: reactionColor[reactions.indexOf(reacted)]
								}
							>
								<div
									className="noti-item"
									onClick={() => history.push('/post/' + v.postID)}
								>
									<Avatar
										size={60}
										src={getAvatarLinkById(
											['male', 'female'].indexOf(v.thumb) !== -1
												? null
												: v.thumb,
											v.thumb,
										)}
									/>
									<div className="noti_text">
										<p>{v.text}</p>

										<p>
											{daysCount === 1
												? dayjs(v.timeStamp).format('[Yesterday], [at] HH:mm')
												: daysCount > 1
													? dayjs(v.timeStamp).format('LL')
													: dayjs(v.timeStamp).fromNow()}
										</p>
									</div>
								</div>
							</Badge.Ribbon>
						)}
					</Menu.Item>
				)
			})
		)
	}

	const list = (
		<>
			<Menu>{renderNotifications()}</Menu>
		</>
	)

	return (
		<Badge count={listNoti.filter((v) => !v.seen).length}>
			<Tooltip placement="bottom" title={isDesktop && 'Notifications'}>
				{isDesktop ? (
					<DropdownTN
						overlay={list}
						trigger={['click']}
            
						placement={isDesktop ? 'bottomLeft' : 'topRight'}
					>
						<BellOutlined />
					</DropdownTN>
				) : (
					<>
						<BellOutlined onClick={!isDesktop && (() => setShow(true))} />
						<FullScreenMenu
							items={list}
							show={show}
							close={() => setShow(false)}
						/>
					</>
				)}
			</Tooltip>
		</Badge>
	)
}

export default withRouter(Notifications)
