import React, { useContext, useState, useEffect, useMemo } from 'react'
import { useQuery, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import * as _ from 'lodash'
import './index.scss'
import { useMediaQuery } from 'react-responsive'

import 'react-lazy-load-image-component/src/effects/opacity.css'
import { LazyLoadImage } from 'react-lazy-load-image-component'

import { saveAs } from 'file-saver'

import DropdownTN from '@components/DropdownTN'
import { Row, Col } from 'antd'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
dayjs.extend(relativeTime)
import 'dayjs/locale/en'
dayjs.locale('en')

import {
	DeleteOutlined,
	EditOutlined,
	EllipsisOutlined,
	DownloadOutlined,
	BookOutlined,
	LockOutlined,
	UnlockOutlined,
} from '@ant-design/icons'

import 'emoji-mart/css/emoji-mart.css'

import {
	Avatar,
	Modal,
	notification,
	Button,
	Result,
	Tooltip,
	Tabs,
	Menu,
	Tag,
} from 'antd'
import { Link, withRouter } from 'react-router-dom'

//import components
import PostFooter from '@components/post/postFooter'
import CreateComment from '@components/createComment'
import Comments from '@components/comments'
import EmojiReaction from '@components/emoji-reaction-button'
import Exif from './exif'
import SuggestPhotos from './suggestPhotos'

//Context
import { UserContext } from '@contexts/userContext'
import { PostContext } from '@contexts/postContext'
import { DefaultValues } from '@contexts/defaultValues'

//Custom hooks
import { useUrlify } from '@components/utils/hook/urlify'
import { CKEditor } from '@ckeditor/ckeditor5-react'
import ClassicEditor from '@ckeditor/ckeditor5-build-classic'
import TextArea from 'antd/lib/input/TextArea'
import { useRef } from 'react'

const DO_LIKE = gql`
  mutation like($parentID: String!, $react: REACT!) {
    doLike(likeInput: { parentID: $parentID, react: $react })
  }
`
const UN_LIKE = gql`
  mutation unlike($parentID: String!) {
    unLike(parentID: $parentID)
  }
`

const APOST = gql`
  query getOnePost($_id: String!) {
    getOnePost(_id: $_id) {
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
      tags
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
      isBlock
    }
  }
`

const EDIT_A_POST = gql`
  mutation edit($_id: ID!, $description: String!) {
    updatePost(post: { _id: $_id, description: $description })
  }
`
const EDIT_BLOCK_POST = gql`
  mutation edit($_id: ID!, $isBlock: Boolean!) {
    blockAndUnblockCmt(post: { _id: $_id, isBlock: $isBlock })
  }
`
const DELETE_ONE_POST = gql`
  mutation delete($deleteInput: DeleteInput!) {
    deletePost(deleteInput: $deleteInput)
  }
`
const CREATE_POST_REPORT = gql`
  mutation createReport($report: ReportInput!) {
    createReport(report: $report)
  }
`
const { TabPane } = Tabs
const { SubMenu } = Menu

function OnePost(props) {
	const isDesktopOrTablet = useMediaQuery({ minWidth: 425 })
	const isDesktop = useMediaQuery({ minWidth: 1024 })
	const isMobile = useMediaQuery({ maxWidth: 425 })
	const message = useRef('')
	const {
		match: {
			params: { postID },
		},
	} = props

	//context
	const { user: currentUser, getAvatarLinkById } = useContext(UserContext)
	const { defaultWho } = useContext(DefaultValues)

	// graphql
	const [likeAPost] = useMutation(DO_LIKE)
	const [unlikeAPost] = useMutation(UN_LIKE)
	const [createPostReport] = useMutation(CREATE_POST_REPORT)
	const [isMessReport, setIsMessReport] = useState(false)
	const { data: { getOnePost } = {}, loading, refetch } = useQuery(APOST, {
		fetchPolicy: 'network-only',
		variables: {
			_id: postID,
		},
	})
	const {
		_id,
		who,
		photo,
		description,
		time,
		likes: dataLikes = [],
		commentsCount,
		tags,
		isBlock,
	} = getOnePost || {}

	const { _id: userID, avatar, firstName, lastName, gender } = who
		? who._id === currentUser._id
			? currentUser
			: who
		: defaultWho

	const {
		height,
		width,
		flash,
		focalLength,
		iso,
		lensModel,
		make,
		model,
		pathID,
	} = photo || {}

	//local state
	const [isEdit, setIsEdit] = useState(false)
	const [localDecscription, setLocalDecscription] = useState('')
	const [showFullDescription, setShowFullDescription] = useState(false)
	const [likes, setLikes] = useState(dataLikes)
	const [showZoomInModal, setShowZoomInModal] = useState(false)

	//Custom hooks
	const urlify = useUrlify()

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
	const { confirm } = Modal

	const { setDeleteID } = useContext(PostContext)
	const [deleteAPost] = useMutation(DELETE_ONE_POST)
	const [editAPost] = useMutation(EDIT_A_POST)
	const [blockAPost] = useMutation(EDIT_BLOCK_POST)
	const [isCommentBlocked, setIsCommentBlocked] = useState(isBlock)

	useEffect(() => {
		setIsCommentBlocked(isBlock === true) //because this can be null/undefined -> true
	}, [isBlock])
	
	const unLikeHandler = () => {
		setLikes((prev) => [
			...prev.filter((v) => v.who && v.who._id !== currentUser._id),
		])
		unlikeAPost({
			variables: {
				parentID: _id,
			},
		})
	}

	const reactHandler = (reaction) => {
		if (_.isEmpty(currentUser)) {
			window.location.href = '/login'
		} else {
			let newLike = {
				who: currentUser,
				react: reaction,
			}
			// them like moi
			if (
				likes.filter(
					(v) => (v.who ? v.who._id : defaultWho._id) === currentUser._id,
				).length === 0
			) {
				setLikes([...likes, newLike])
			} else {
				// thay doi reaction (like => love)
				let newList = likes.map((v) => {
					let who = v.who || defaultWho
					if (who._id === currentUser._id) {
						v.react = reaction
					}
					return v
				})
				setLikes([...newList])
			}
			likeAPost({
				variables: {
					parentID: _id,
					react: reaction,
				},
			})
		}
	}

	const deleteHandler = () => {
		confirm({
			title: 'Are you sure ?',
			centered: true,
			onOk() {
				deleteAPost({
					variables: {
						deleteInput: {
							postID: _id,
						},
					},
				}).then((res) => {
					if (res.data.deletePost) {
						setDeleteID(_id)
						if (window.location.href.indexOf('post') !== -1) {
							window.location.href = '/'
						}
					} else notify('Something wrong when deleting !', false)
				})
			},
			onCancel() {},
		})
	}

	const editHandler = () => {
		try {
			if (description !== localDecscription) {
				editAPost({
					variables: {
						_id,
						description: _.escape(localDecscription),
					},
				}).then((res) => {
					if (res.data.updatePost) {
						notify('Done !', 1)
					} else notify('Something is wrong !', false)
				})
			}
		} catch (error) {
			console.log(error)
			notify('Something is wrong !', false)
		}
		setIsEdit(false)
	}

	const blockOrUnblock = async () => {
		try {
			console.log(_id)
			blockAPost({
				variables: {
					_id,
					isBlock: !isCommentBlocked,
				},
			}).then(() => {
				setIsCommentBlocked(!isCommentBlocked)
				refetch()
			})
		} catch (err) {
			console.log(err)
		}
	}

	const triggerDownload = (size) => {
		saveAs(
			`${process.env.SERVER_MEDIA_URL}/url?type=post&id=${pathID}&size=${size}`,
			`${_id}.jpg`,
		)
	}
	const toggleReportMess = () => {
		setIsMessReport(false)
	}
	const submitReport = () => {
		createPostReport({
			variables: {
				report: {
					reporterID: currentUser._id,
					postID: _id,
					message: message.current.resizableTextArea.textArea.value,
				},
			},
		}).then((res) => {
			if (res.data.createReport) {
				notify(
					'Thank for your report. We will check again with this post content !',
					true,
				)
			} else {
				notify('Something wrong when give report', false)
			}
		})
		setIsMessReport(false)
	}

	const updatePostStatus = useMemo(() => {
		return (
			<Menu.Item onClick={() => blockOrUnblock()}>
				{isCommentBlocked ? (
					<>
						<UnlockOutlined />
             Unblock Comment
					</>
				) : (
					<>
						<LockOutlined /> Block Comment
					</>
				)}
			</Menu.Item>
		)
	})

	const menu = (
		<>
			<Menu>
				<SubMenu icon={<DownloadOutlined />} title="Free Download">
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
				</SubMenu>

				{userID === currentUser._id && (
					<Menu.Item
						onClick={() => {
							setIsEdit(true)
						}}
					>
						<EditOutlined /> Edit
					</Menu.Item>
				)}
				{userID === currentUser._id && (
					<Menu.Item onClick={() => deleteHandler()}>
						<DeleteOutlined /> Delete
					</Menu.Item>
				)}
				{/* <Menu.Item>
          <ExclamationCircleOutlined /> Báo cáo bài viết
        </Menu.Item> */}
				{userID !== currentUser._id ? (
					<Menu.Item
						onClick={() => {
							setIsMessReport(true)
						}}
					>
						<BookOutlined /> Report
					</Menu.Item>
				) : (
					''
				)}
				{userID === currentUser._id ? updatePostStatus : ''}
			</Menu>
		</>
	)

	useEffect(() => {
		description && setLocalDecscription(description)
	}, [description])

	useEffect(() => {
		window.scrollTo(0, 0)
	}, [])

	const postDescription = isEdit ? (
		<Row>
			<Col>
				<CKEditor
					id="ckeditor"
					editor={ClassicEditor}
					data={_.unescape(localDecscription)}
					onChange={(event, editor) => {
						const data = editor.getData()
						setLocalDecscription(data)
					}}
					onReady={(editor) => {
						// You can store the "editor" and use when it is needed.
						console.log('Editor is ready to use!', editor)
					}}
				/>
			</Col>
			<Col>
			</Col>
		</Row>
	) : localDecscription.length > 0 ? (
		<>
			<p
				style={{
					whiteSpace: 'pre-wrap',
					wordWrap: 'anywhere',
					marginBottom: '0em',
				}}
				dangerouslySetInnerHTML={{
					__html: urlify(
						_.unescape(
							!showFullDescription
								? _.truncate(localDecscription, { length: 100 })
								: localDecscription,
						),
					),
				}}
			></p>
		</>
	) : null

	useEffect(() => {
		!loading && setLikes(dataLikes)
	}, [loading])

	const renderPost = () => {
		try {
			if (!loading) {
				if (!getOnePost) {
					return (
						<Result
							status="404"
							title="404"
							subTitle="This post has been deleted or you have no permission to see this post !"
							extra={
								<Button
									type="primary"
									onClick={() => (window.location.href = '/')}
								>
                  Back to home !
								</Button>
							}
						/>
					)
				}
				const daysCount = Math.round(new Date(Date.now() - time) / 3600000 / 24)

				return (
					<div className="post-detail_container drop-shadow">
						<div className="image-section">
							{
								<>
									<div className="onePost_reactions">
										<EmojiReaction
											key={_id}
											reactHandler={(e) => reactHandler(e)}
											unLikeHandler={() => unLikeHandler()}
											likes={likes}
											currentUser={currentUser}
											iconType="full"
											defaultIconColor="white"
											defaultIconFontSize="2em"
											iconHeight="1.2em"
											iconWidth="1.2em"
										/>
									</div>
								</>
							}
							<LazyLoadImage
								onClick={() => setShowZoomInModal(isDesktopOrTablet)}
								className="onePost__image"
								style={{
									minHeight: isDesktop
										? Math.round((height * 500) / width)
										: isMobile &&
                      Math.round((height * window.innerWidth) / width),
								}}
								effect="opacity"
								src={`https://storage.googleapis.com/taingoblog.appspot.com/social/post/${pathID}-large.jpg`}
							/>
						</div>

						<div className="detail" id="detail">
							<div className="user" id="user-header">
								<div className="avatar">
									<Link to={`/profile/${userID}`}>
										<Avatar size={40} src={getAvatarLinkById(avatar, gender)} />
									</Link>
								</div>
								<div className="username">
									<Link to={`/profile/${userID}`}>
										<p>{`${firstName || ''} ${lastName || ' '}`}</p>
									</Link>
									<div className="time">
										<Tooltip
											arrowPointAtCenter={false}
											title={dayjs(time).format('DD/MM/YYYY, [at] HH:mm')}
										>
											<Link to={`/post/${_id}`}>
												<span>
													{daysCount === 1
														? dayjs(time).format('[Yesterday], [at] HH:mm')
														: daysCount > 1
															? dayjs(time).format('DD/MM/YYYY')
															: dayjs(time).fromNow()}
												</span>
											</Link>
										</Tooltip>
									</div>
								</div>

								<div className="top-right">
									{isEdit ? (
										<div className="edit_btns">
											<Button type="primary" onClick={() => editHandler()}>
                        Done
											</Button>
										</div>
									) : (
										<DropdownTN
											overlay={menu}
											trigger={['click']}
											placement="bottomRight"
										>
											<EllipsisOutlined
												style={{
													fontSize: '28px',
													padding: '0.1em',
													color: 'black',
												}}
												className="ant-dropdown-link circle-icon"
											/>
										</DropdownTN>
									)}
								</div>
							</div>
							<Modal
								title="Report Message"
								visible={isMessReport}
								onCancel={() => toggleReportMess()}
								onOk={() => submitReport()}
							>
								<TextArea
									ref={message}
									placeholder="Type message..."
								></TextArea>
							</Modal>
							<div className="post-content">
								{postDescription}
								{!showFullDescription &&
                  !isEdit &&
                  localDecscription.length > 100 && (
									<a onClick={() => setShowFullDescription(true)}>see more</a>
								)}
							</div>
							<div className="post__footer">
								<PostFooter
									postID={_id}
									dataLikes={likes}
									commentsCount={commentsCount}
								/>
							</div>

							<Tabs defaultActiveKey="1">
								<TabPane tab="Details" key="1">
									<Exif
										{...{ flash, focalLength, iso, lensModel, make, model }}
									/>
									<div className="one-post__tags">
										{(tags || []).map((tag, k) => (
											<Tag key={`${_id}-tag-${k}`}>
												<Link
													to={`/s/photos/${tag}`}
													key={`link-${_id}-tag-${k}`}
												>
													{tag}
												</Link>
											</Tag>
										))}
									</div>
								</TabPane>
								<TabPane tab="Comments" key="2">
									<Row>
										<Col offset="5">
											{isCommentBlocked === true ? (
												<h5>{`${who.firstName} ${who.lastName} has turned off comment of this post.`}</h5>
											) : (
												''
											)}
										</Col>
									</Row>
									<div className="create-comment">
										<CreateComment postID={_id} isBlock={isCommentBlocked} />
									</div>
									<Comments
										postID={_id}
										commentsCount={commentsCount}
										isBlock={isCommentBlocked}
									/>
								</TabPane>
							</Tabs>
						</div>
					</div>
				)
			} else return 'loading...'
		} catch (err) {
			notify(err.toString(), false)
		}
	}

	const renderSuggestGrid = useMemo(() => {
		return tags && <SuggestPhotos keywords={tags} />
	}, [tags])
	return (
		<div className="one-post-content">
			<div className="post-detail">{renderPost()}</div>
			<Modal
				style={{
					minWidth: '99vw',
					overflow: 'hidden',
					top: '0',
				}}
				title={`${firstName || ''} ${lastName || ' '}`}
				visible={showZoomInModal}
				onCancel={() => setShowZoomInModal(false)}
				footer=""
			>
				<LazyLoadImage
					onClick={() => setShowZoomInModal(false)}
					className="one-post__zoom-in-image"
					style={{
						minHeight: Math.round((height * 500) / width / 2),
						maxWidth: '100%',
						width: '100%'
					}}
					effect="blur"
					placeholderSrc={`https://storage.googleapis.com/taingoblog.appspot.com/social/post/${pathID}-original.jpg`}
					src={`https://storage.googleapis.com/taingoblog.appspot.com/social/post/${pathID}-original.jpg`}
				/>
			</Modal>
			{renderSuggestGrid}
		</div>
	)
}

export default withRouter(OnePost)
