import React,{useState,useEffect,useContext} from 'react'
import './index.scss'
import gql from 'graphql-tag'
import { useQuery,useMutation } from '@apollo/react-hooks'
import ToolBar from '@components/admin/adminTopToolBar'
import {Table,Switch} from 'antd'
import { UserContext } from '@contexts/userContext'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2'
const USERS = gql`
  query {
    users {
      _id
			permissions
			firstName
      lastName
      avatar
    }
  }
`
const EDIT_USER = gql`
  mutation edit($_id: String!, $permiss: [String]!) {
    updateUserPermission(_id: $_id, permiss: $permiss)
  }
`
const PermissionManager = () => {
	const { data, refetch, networkStatus } = useQuery(USERS, {
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true
	})

	const [loadingData, setLoadingData] = useState(true)
	const { getAvatarLinkById } = useContext(UserContext)
	const [updateUser] = useMutation(EDIT_USER)
	const [selectedRowKeys, setSelectedRowKeys] = useState([])

	useEffect(() => {
		if (networkStatus !== 4) {
			setLoadingData(false)
		} else {
			setLoadingData(true)
		}
	}, [networkStatus])

	const onSelectChange = (selectedRowKeys) => {
		setSelectedRowKeys(selectedRowKeys)
	}
	const onChangePermission= async (col,permiss)=>{

		if((col.permissions).includes(permiss)){
			const newPermissions = (col.permissions).filter(e =>e !== permiss)
			await updateUser({
				variables: {
					_id: col._id,
					permiss: newPermissions,
				},
			})
			refetch()
		}else{
			const newPermissions = (col.permissions).concat(permiss)
			await updateUser({
				variables: {
					_id: col._id,
					permiss: newPermissions,
				},
			})
			refetch()
		}
	}

	const demoImage = (image) => {
		Swal.fire({
			imageUrl: image,
		})
	}
	const columns=[
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
			title:'Full Name',
			render:(col)=>{
				return(<Link to={`/profile/${col._id}`}>
					{col.firstName +' '+ col.lastName}
				</Link>)
			}
		},
		{
			title:'Admin',
			render:(col) =>{
				return (
					<Switch
						onChange={() => onChangePermission(col, 'ADMIN')}
						defaultChecked={col['permissions'].includes('ADMIN') ?true:false}
					></Switch>
				)
			}
		},
		{
			title:'Access',
			render:(col) =>{
				return (
					<Switch
						onChange={() => onChangePermission(col, 'ACCESS')}
						defaultChecked={col['permissions'].includes('ACCESS') ? true : false}
					></Switch>
				)
			}
		},
		{
			title:'Post',
			render:(col) =>{
				return (
					<Switch
						onChange={() => onChangePermission(col, 'POST')}
						defaultChecked={col['permissions'].includes('POST') ? true : false}
					></Switch>
				)
			}
		},
		{
			title:'Delete',
			render:(col) =>{
				return (
					<Switch
						onChange={() => onChangePermission(col, 'DELETE')}
						defaultChecked={col['permissions'].includes('DELETE') ? true : false}
					></Switch>
				)
			}
		},
		{
			title:'Edit',
			render:(col) =>{
				return (
					<Switch
						onChange={() => onChangePermission(col, 'EDIT')}
						defaultChecked={col['permissions'].includes('EDIT') ? true : false}
					></Switch>
				)
			}
		},
		{
			title:'Post Comment',
			render:(col) =>{
				return (
					<Switch
						onChange={() => onChangePermission(col, 'POSTCOMMENT')}
						defaultChecked={col['permissions'].includes('POSTCOMMENT') ? true : false}
					></Switch>
				)
			}
		},
		{
			title:'Edit Comment',
			render:(col) =>{
				return (
					<Switch
						onChange={() => onChangePermission(col, 'EDITCOMMENT')}
						defaultChecked={col['permissions'].includes('EDITCOMMENT') ? true : false}
					></Switch>
				)
			}
		},
		{
			title:'Delete Comment',
			render:(col) =>{
				return (
					<Switch
						onChange={() => onChangePermission(col, 'DELETECOMMENT')}
						defaultChecked={col['permissions'].includes('DELETECOMMENT') ? true : false}
					></Switch>
				)
			}
		},
	]
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

export default PermissionManager
