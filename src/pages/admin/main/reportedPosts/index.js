import React, { useState, useEffect } from 'react'
import { Popconfirm, Table, Tag, Modal, notification } from 'antd'

import ToolBar from '@components/admin/adminTopToolBar'
import ImageGrid from '@components/imageGrid'

// import { useQuery } from '@apollo/react-hooks'
//import gql from 'graphql-tag'

//dayjs
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/en'
dayjs.extend(relativeTime)
dayjs.extend(LocalizedFormat)
dayjs.locale('en')

import './index.scss'
import gql from 'graphql-tag'
import { useQuery, useMutation } from '@apollo/react-hooks'
import { Link } from 'react-router-dom'
// const POSTS = gql`
//   query posts($skip: Float!, $limit: Float) {
//     posts(skip: $skip, limit: $limit) {
//       _id
//       who {
//         email
//         firstName
//         lastName
//         _id
//         gender
//         avatar
//       }
//       photoID
//       content
//       time
//       likes {
//         who {
//           _id
//           firstName
//           lastName
//         }
//         react
//       }
//       commentsCount
//     }
//   }
// `
const POST_REPORT = gql`
  query {
    reports {
      _id
      reporterID
      reportCount
      reporterName
      posterName
      postID
      posterID
      message
      tags
      createDate
    }
  }
`
const DELETE_REPORT = gql`
  mutation deleteReport($_id: String!) {
    deleteReport(_id: $_id)
  }
`
const DELETE_ONE_POST = gql`
  mutation delete($deleteInput: DeleteInput!) {
    deletePost(deleteInput: $deleteInput)
  }
`

function ReportedPosts() {
	const [loadingData, setLoadingData] = useState(true)
	const [selectedRowKeys, setSelectedRowKeys] = useState([])
	const [deleteReport] = useMutation(DELETE_REPORT)
	const [deleteAPost] = useMutation(DELETE_ONE_POST)
	const { data, refetch, networkStatus } = useQuery(POST_REPORT, {
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
	})

	const [gridShow] = useState(false)
	const [chosePostID, setChosePostID] = useState('')
	const [modal, setModal] = useState(false)

	useEffect(() => {
		if (networkStatus !== 4) {
			setLoadingData(false)
		} else {
			setLoadingData(true)
		}
	}, [networkStatus])

	const getDetailPost = (postID) => {
		if (postID) {
			setChosePostID(postID)
			setModal(true)
		} else {
			notify('This post was deleted', false)
		}
	}
	const confirmDeleteThisReport = async (col) => {
		await deleteReport({
			variables: {
				_id: col._id,
			},
		})
		refetch()
	}
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
					postID: col.postID,
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
			title: 'Reporter',

			render: (reporter) => (
				<Link to={`profile/${reporter.reporterID}`}>
					{reporter.reporterName}
				</Link>
			),
		},
		{
			title: 'Poster',
			render: (poster) => (
				<Link to={`profile/${poster.posterID}`}>{poster.posterName}</Link>
			),
		},
		{
			title: 'Message',
			dataIndex: 'message',
			render: (message) => <p>{message}</p>,
		},
		{
			title: 'Create Date',
			render: (postDetail) => {
				const daysCount = Math.round(
					new Date(Date.now() - Number(postDetail.createDate)) / 3600000 / 24,
				)
				return (
					<p>
						{daysCount === 1
							? dayjs(postDetail.createDate).format('[Yesterday], [at] HH:mm')
							: daysCount > 1
								? dayjs(postDetail.createDate).format('LL')
								: dayjs(postDetail.createDate).fromNow()}
					</p>
				)
			},
		},
		{
			title: 'Report Count',
			dataIndex: 'reportCount',
			render: (reportCount) => {
				return (
					<Tag
						color={
							reportCount <= 20 ? 'green' : reportCount <= 50 ? 'orange' : 'red'
						}
					>
						{reportCount}
					</Tag>
				)
			},
		},
		{
			title: 'Tags',
			dataIndex: 'tags',
			render: (tags) => {
				return tags.map((tag, index) => {
					return <Tag key={index}>{tag}</Tag>
				})
			},
		},
		{
			title: 'Action',
			dataIndex: 'postID',
			render: (postID, col) => (
				<span>
					<a
						style={{ color: 'green', marginRight: '10px' }}
						onClick={() => getDetailPost(postID)}
					>
            Detail
					</a>
					<Popconfirm
						title="Are you sure to ignore this report !"
						onConfirm={() => confirmDeleteThisReport(col)}
						//onCancel={cancelDeleteThisReport}
					>
						<a style={{ color: 'red', marginRight: '10px' }}>Ignore</a>
					</Popconfirm>
					<Popconfirm
						title="Are you sure to delete this post !"
						onConfirm={() => confirmDeleteThisPost(col)}
					>
						{col.postID ? (
							<a style={{ color: 'blue' }}>Delete Post</a>
						) : (
							<a style={{ color: 'black' }} disabled>
                Deleted
							</a>
						)}
					</Popconfirm>
				</span>
			),
		},
	]

	const onSelectChange = (selectedRowKeys) => {
		setSelectedRowKeys(selectedRowKeys)
	}
	const onCloseModal = () => {
		setModal(false)
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
			<ToolBar  refetch={refetch} />
			{gridShow ? (
				<div className="posts-card">
					<ImageGrid isAdmin={true} mockData={data} />
				</div>
			) : (
				<Table
					style={{
						padding: '0.2em 1em',
					}}
					pagination={{ pageSize: 9 }}
					columns={columns}
					dataSource={(data || { reports: [] }).reports.map((v, k) => {
						v.key = k + 1
						return v
					})}
					loading={loadingData}
					rowSelection={rowSelection}
				/>
			)}
			{chosePostID ? (
				<Modal
					visible={modal}
					width={1200}
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

export default ReportedPosts
