import React, { useState } from 'react'
import { Avatar, Upload, notification, Spin, Menu } from 'antd'
import axios from 'axios'
import { CameraOutlined, LoadingOutlined } from '@ant-design/icons'
import DropdownTN from '@components/DropdownTN'

import ImgCrop from 'antd-img-crop'
import 'antd/es/slider/style'
import 'antd/es/modal/style'

const loadingIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />

const AvatarComponent = (props) => {
	const {
		oldAvatar, // if change avatar
		avatar,
		gender,
		refreshUser,
		getAvatarLinkById,
		canEdit,
		updateProfile,
	} = props

	//local state
	const [changing, setChanging] = useState(false)

	const notify = (text, status) => {
		status === 1
			? notification.success({
				message: text,
				placement: 'bottomRight',
			})
			: notification.error({
				message: text,
				placement: 'bottomRight',
			})
	}

	const beforeUpload = (file) => {
		const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
		if (!isJpgOrPng) {
			notify('You can only upload JPG/PNG file!', false)
		}
		const isLt2M = file.size / 1024 / 1024 < 4
		if (!isLt2M) {
			notify('Image must smaller than 4MB!', false)
		}
		return isJpgOrPng && isLt2M
	}

	const deleteOldAvatar = (id) => {
		const url = `${process.env.SERVER_MEDIA_URL}/delete/?type=user/avatar&id=${id}`
		const config = {
			headers: {
				Authorization: localStorage.getItem('Authorization'),
			},
		}
		return axios.put(url, id, config)
	}

	const uploadToServer = ({ file }) => {
		setChanging(true)
		const url = `${process.env.SERVER_MEDIA_URL}/upload/?type=user/avatar`
		const config = {
			headers: {
				'Content-Type': 'multipart/form-data',
				Authorization: localStorage.getItem('Authorization'),
			},
		}
		let fd = new FormData()
		fd.append('file', file)
		axios
			.post(url, fd, config)
			.then(async (res) => {
				if (res.data) {
					oldAvatar && (await deleteOldAvatar(oldAvatar))
					updateProfile({
						variables: {
							userInfo: {
								avatar: res.data.id,
							},
						},
					}).then(() => {
						refreshUser().then(() => {
							setChanging(false)
						})
					})
				} else {
					notify('Something went wrong !')
					setChanging(false)
				}
			})
			.catch((err) => console.log(err))
	}

	const menu = (
		<>
			<Menu>
				{/* <div>
				<EyeOutlined />
        Xem ảnh đại diện
			</div> */}
				<Menu.Item
					style={{
						height: 'fit-content',
					}}
				>
					<ImgCrop
						rotate
						grid
						modalTitle="Edit"
						modelOk="Done"
						modelCancel="Cancel"
					>
						<Upload
							beforeUpload={beforeUpload}
							customRequest={uploadToServer}
							showUploadList={false}
						>
							<CameraOutlined />
							<span style={{ marginLeft: '0.4em' }}>Change profile picture</span>
						</Upload>
					</ImgCrop>
				</Menu.Item>
			</Menu>
		</>
	)

	return (
		<div className="avatar_profile">
			{canEdit ? (
				<DropdownTN
					overlay={menu}
					trigger={['click']}
					disabled={changing}
					placement="bottom"
				>
					<Spin indicator={loadingIcon} spinning={changing}>
						<Avatar size={130} src={getAvatarLinkById(avatar, gender)} />
					</Spin>
				</DropdownTN>
			) : (
				<Avatar size={130} src={getAvatarLinkById(avatar, gender)} />
			)}
		</div>
	)
}

export default AvatarComponent
