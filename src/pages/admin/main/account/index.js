import React, { useState, useEffect, useContext } from 'react'
import { Table, Divider, Tag, Popconfirm } from 'antd'

import ToolBar from '@components/admin/adminTopToolBar'

import gql from 'graphql-tag'
//context
import { UserContext } from '@contexts/userContext'
import { useQuery, useMutation } from '@apollo/react-hooks'
import Swal from 'sweetalert2'
import './index.scss'

const USERS = gql`
  query {
    users {
      _id
      email
      firstName
      lastName
      avatar
      dob
      gender
      lastSeen
      permissions
    }
  }
`
const EDIT_USER = gql`
  mutation edit($_id: String!, $permiss: [String]!) {
    updateUserPermission(_id: $_id, permiss: $permiss)
  }
`
function Index() {
	const [loadingData, setLoadingData] = useState(true)
	const [selectedRowKeys, setSelectedRowKeys] = useState([])

	//context
	const { getAvatarLinkById } = useContext(UserContext)
	const [updateUser] = useMutation(EDIT_USER)
	//queries
	const { data, refetch, networkStatus } = useQuery(USERS, {
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
	})
	const handeUserStatus = async (user, isActive) => {
		const newpermissons = isActive
			? user.permissions.filter((e) => e !== 'ACCESS')
			: user.permissions.concat(['ACCESS'])
		await updateUser({
			variables: {
				_id: user._id,
				permiss: newpermissons,
			},
		})
		refetch()
	}

	useEffect(() => {
		if (data && networkStatus !== 4) {
			setLoadingData(false)
		} else {
			setLoadingData(true)
		}
	}, [data, networkStatus])

	const demoImage = (image) => {
		Swal.fire({
			imageUrl: image,
		})
	}

	const columns = [
		{
			title: '#',
			dataIndex: 'key',
			render: (text) => <p>{text}</p>,
		},
		{
			title: 'Avatar',
			dataIndex: 'avatar',
			render: (id, record) => {
				return (
					<img
						onClick={() => demoImage(getAvatarLinkById(id, record.gender))}
						className="img_row"
						src={getAvatarLinkById(id, record.gender)}
					/>
				)
			},
		},
		{
			title: 'Tên',
			dataIndex: 'firstName',
			render: (text) => (
				<p
					style={{
						wordWrap: 'break-word',
						wordBreak: 'break-word',
						maxHeight: '10em',
					}}
				>
					{text}
				</p>
			),
		},
		{
			title: 'First Name',
			dataIndex: 'lastName',
			render: (text) => <p>{text}</p>,
		},
		{
			title: 'Ngày sinh',
			dataIndex: 'dob',
			render: (text) => <p>{text}</p>,
		},
		{
			title: 'Email',
			dataIndex: 'email',
			render: (text) => <p>{text}</p>,
		},
		{
			title: 'Trạng thái',
			dataIndex: 'permissions',
			render: (permissions) => (
				<span>
					{permissions.indexOf('ACCESS') !== -1 ? (
						<Tag color="green">Active</Tag>
					) : (
						<Tag color="red">Blocked</Tag>
					)}
				</span>
			),
		},
		{
			title: 'Action',
			dataIndex: 'id',
			render: (id, col) => (
				<span>
					{col.permissions.indexOf('ACCESS') === -1 ? (
						<Popconfirm
							title="Do you want to unblock this user ?"
							okText="Yes"
							cancelText="No"
							onConfirm={() => handeUserStatus(col, false)}
						>
							<a style={{ color: 'green' }}>Unblock</a>
						</Popconfirm>
					) : (
						<Popconfirm
							title="Do you want to block this user ?"
							okText="Yes"
							cancelText="No"
							onConfirm={() => handeUserStatus(col, true)}
						>
							<a style={{ color: 'red' }}>Block</a>
						</Popconfirm>
					)}
					<Divider type="vertical" />
					{/* <a onClick={() => sendMail(col.email)}>Gửi email cấp lại Password</a> */}
				</span>
			),
		},
	]

	const onSelectChange = (selectedRowKeys) => {
		setSelectedRowKeys(selectedRowKeys)
	}

	const rowSelection = {
		selectedRowKeys,
		onChange: onSelectChange,
		selections: [
			Table.SELECTION_ALL,
			Table.SELECTION_INVERT,
			{
				key: 'odd',
				text: 'Select Odd Row',
				onSelect: (changableRowKeys) => {
					let newSelectedRowKeys = []
					newSelectedRowKeys = changableRowKeys.filter((key, index) => {
						if (index % 2 !== 0) {
							return false
						}
						return true
					})
					setSelectedRowKeys(newSelectedRowKeys)
				},
			},
			{
				key: 'even',
				text: 'Select Even Row',
				onSelect: (changableRowKeys) => {
					let newSelectedRowKeys = []
					newSelectedRowKeys = changableRowKeys.filter((key, index) => {
						if (index % 2 !== 0) {
							return true
						}
						return false
					})
					setSelectedRowKeys(newSelectedRowKeys)
				},
			},
		],
	}

	return (
		<>
			<ToolBar refetch={refetch} />
			<Table
				style={{
					padding: '0.2em 1em',
				}}
				rowKey="_id"
				pagination={{ pageSize: 7 }}
				columns={columns}
				dataSource={(data || { users: [] }).users.map((v, k) => {
					v.key = k + 1
					return v
				})}
				loading={loadingData}
				rowSelection={rowSelection}
			/>
		</>
	)
}

export default Index
