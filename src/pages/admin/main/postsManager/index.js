import React, { useState, useEffect } from 'react'
import { Popconfirm, Table, Tag, Modal, notification } from 'antd'

import ImageGrid from '@components/imageGrid'
import ToolBar from '@components/admin/adminTopToolBar'

import gql from 'graphql-tag'

//dayjs
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/en'
dayjs.extend(relativeTime)
dayjs.extend(LocalizedFormat)
dayjs.locale('en')
import { useQuery, useMutation } from '@apollo/react-hooks'
import './index.scss'
import { Link } from 'react-router-dom'

const POSTS = gql`
  query posts($skip: Float!, $limit: Float) {
    posts(skip: $skip, limit: $limit) {
      _id
      who {
        email
        firstName
        lastName
        _id
        gender
        avatar
      }
      photo {
        height
        width
        artist
        copyright
        flash
        focalLength
        iso
        lensModel
        make
        model
        createDate
        pathID
      }
      description
      time
      likes {
        who {
          _id
          firstName
          lastName
        }
        react
      }
      commentsCount
    }
  }
`
const DELETE_ONE_POST = gql`
  mutation delete($deleteInput: DeleteInput!) {
    deletePost(deleteInput: $deleteInput)
  }
`
function Index() {
	const [selectedRowKeys, setSelectedRowKeys] = useState([])
	const [skip] = useState(0)
	const [gridShow] = useState(false)
	const [chosePostID, setChosePostID] = useState('')
	const [deleteAPost] = useMutation(DELETE_ONE_POST)
	const [modal, setModal] = useState(false)
	const [loadingData, setLoadingData] = useState(true)

	const getDetailPost = (postID) => {
		if (postID) {
			setChosePostID(postID)
			setModal(true)
		} else {
			notify('This post was deleted', false)
		}
	}
	const { data, refetch, networkStatus } = useQuery(POSTS, {
		fetchPolicy: 'network-only',
		variables: {
			skip: skip,
			userID: '',
			keywords: [],
			limit: 999,
		},
		notifyOnNetworkStatusChange: true
	})

	useEffect(() => {
		if (data && networkStatus !== 4) {
			setLoadingData(false)
		} else {
			setLoadingData(true)
		}
	}, [data, networkStatus])

	// useEffect(() => {
	// 	if (data && networkStatus !== 4) {
	// 		setLoadingData(false)
	// 		// console.log(JSON.stringify({posts: data.posts.map(v => {
	// 		//   v.tagsReport = [1]
	// 		//   return v
	// 		// })}))
	// 	} else {
	// 		setLoadingData(true)
	// 	}
	// }, [data, networkStatus])

	const notify = (text, status) => {
		status
			? notification.success({
				message: text,
				placement: 'topRight',
			})
			: notification.error({
				message: text,
				placement: 'topRight',
			})
	}
	const confirmDeleteThisPost = async (col) => {
		await deleteAPost({
			variables: {
				deleteInput: {
					postID: col._id,
				},
			},
		}).then((res) => {
			if (res.data.deletePost) {
				notify('Delete Post Successfully !', true)
			} else notify('This post was deleted !', false)
		})
		refetch()
	}
	const columns = [
		{
			title: '#',
			dataIndex: 'key',
			render: (text) => <p>{text}</p>,
		},
		{
			title: 'Poster',
			dataIndex: 'who',
			render: (who) => (
				<Link to={`profile/${who._id}`}>
					{who.firstName + ' ' + who.lastName}
				</Link>
			),
		},
		{
			title: 'Description',
			dataIndex: 'description',
			render: (description) => <p>{description.substring(0, 40)}</p>,
		},
		{
			title: 'Create Date',
			dataIndex: 'time',
			render: (time) => {
				const daysCount = Math.round(
					new Date(Date.now() - Number(time)) / 3600000 / 24,
				)
				return (
					<p>
						{daysCount === 1
							? dayjs(time).format('[Yesterday], [at] HH:mm')
							: daysCount > 1
								? dayjs(time).format('LL')
								: dayjs(time).fromNow()}
					</p>
				)
			},
		},
		{
			title: 'Like Count',
			dataIndex: 'likes',
			render: (likes) => (
				<Tag
					color={
						likes.length <= 20 ? 'green' : likes.length <= 50 ? 'orange' : 'red'
					}
				>
					{likes.length}
				</Tag>
			),
		},
		{
			title: 'Comment Count',
			dataIndex: 'commentsCount',
			render: (commentsCount) => (
				<Tag
					color={
						commentsCount <= 20
							? 'green'
							: commentsCount <= 50
								? 'orange'
								: 'red'
					}
				>
					{commentsCount}
				</Tag>
			),
		},
		{
			title: 'Action',
			render: (col) => (
				<span>
					<a
						style={{ color: 'green', marginRight: '10px' }}
						onClick={() => getDetailPost(col._id)}
					>
            Detail
					</a>
					<Popconfirm
						title="Are you sure to delete this post !"
						onConfirm={() => confirmDeleteThisPost(col)}
					>
						<a style={{ color: 'blue' }}>Delete Post</a>
					</Popconfirm>
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
	const onCloseModal = () => {
		setModal(false)
	}
	return (
		<>
			<ToolBar refetch={() => {refetch()}} />
			{gridShow ? (
				<div className="posts-card">
					<ImageGrid isAdmin={true} />
				</div>
			) : (
				<Table
					style={{
						padding: '0.2em 1em',
					}}
					pagination={{ pageSize: 9 }}
					columns={columns}
					dataSource={(data || { posts: [] }).posts.map((v, k) => {
						v.key = k + 1
						return v
					})}
					rowSelection={rowSelection}
					loading={loadingData}
				/>
			)}
			{chosePostID ? (
				<Modal
					visible={modal}
					width={'80vw'}
					onCancel={() => onCloseModal()}
					onOk={() => onCloseModal()}
				>
					<iframe
						src={`${process.env.SERVER_MEDIA_URL}/post/${chosePostID}`}
						className="iframe"
					></iframe>
				</Modal>
			) : (
				''
			)}
		</>
	)
}

export default Index
