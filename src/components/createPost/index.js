import React, { useEffect, useState, useContext, useRef, useMemo } from 'react'
import { Modal, notification, Upload, Progress, Button } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { useVisionAPI } from '@utils/hook/visionAI'

import exifr from 'exifr/dist/full.esm.mjs'
import sizeOf from 'buffer-image-size'
// import css
import './index.scss'
//components
import ImageCard from './imageCard'

import axios from 'axios'
import gql from 'graphql-tag'
import { useMutation } from '@apollo/react-hooks'

//context
import { PostContext } from '@contexts/postContext'
import { PostingModalContext } from '@contexts/postingModalContext'

const { Dragger } = Upload

const ADD_TAGS = gql`
  mutation addTags($tags: [String!]) {
    createTags(tags: $tags)
  }
`

const UPDATE_PROFILE = gql`
  mutation updateUserInfo($userInfo: UserInfoInput!) {
    updateUserInfo(userInfo: $userInfo)
  }
`

const ADD_POST = gql`
  mutation add($description: String, $tags: [String], $photo: PhotoInput!) {
    addPost(post: { description: $description, tags: $tags, photo: $photo }) {
      _id
      who {
        email
        firstName
        lastName
        _id
        gender
        avatar
        interestList
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
          email
        }
      }
    }
  }
`

const PHOTO_LIMIT = 5

const CreatePost = () => {
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

	// const { user, getAvatarLinkById } = useContext(UserContext)
	// const { avatar, gender, firstName } = user
	const { setAddPostData } = useContext(PostContext)
	const { showPostingModal, setShowPostingModal } = useContext(
		PostingModalContext,
	)

	//graphql
	const [addPost] = useMutation(ADD_POST)
	const [addTags] = useMutation(ADD_TAGS)
	const [updateProfile] = useMutation(UPDATE_PROFILE)

	const [photos, setPhotos] = useState([])

	//local states
	const [posting, setPosting] = useState(false)
	const [ready, setReady] = useState(false)
	const [photoCount, setPhotoCount] = useState(0)

	//refs
	const photosLengthRef = useRef()
	photosLengthRef.current = photos.filter((v) => v.pathID).length
	const selectedPhotos = useRef(0)

	useEffect(() => {
		let mount = true
		if (mount) {
			photosLengthRef.current === 0
				? ready && setReady(false)
				: photoCount === photosLengthRef.current
					? setReady(true)
					: ready && setReady(false)
		}
		return () => {
			mount = false
		}
	}, [photos, photoCount])

	useEffect(() => {
		window.addEventListener('beforeunload', (e) => {
			e.preventDefault()
			photosLengthRef.current > 0 &&
        (() => {
        	event.returnValue = ''
        })()
		})
	}, [])

	const deleteImageFromServer = (e) => {
		try {
			const {
				response: {
					data: { id },
				},
			} = e
			if (id !== -1) {
				setPhotos((prev) => [...prev.filter((v) => v.pathID !== id)])
				setPhotoCount((prev) => prev - 1)
				selectedPhotos.current -= 1
				const config = {
					headers: {
						'Content-Type': 'text/plain',
						Authorization: localStorage.getItem('Authorization'),
					},
				}
				axios.put(
					`${process.env.SERVER_MEDIA_URL}/delete?type=post&id=${id}`,
					id,
					config,
				)
			}
		} catch (err) {
			notify(err.toString(), false)
			return err
		}
	}

	const checkContent = async (imageId) => {
		const url = `https://storage.googleapis.com/taingoblog.appspot.com/social/post/${imageId}-small.jpg`
		const checkRes = await useVisionAPI('checkContent')(url)
		return checkRes
	}

	const uploadToServer = ({ file, onSuccess }) => {
		setPhotoCount((prev) => prev + 1)

		getBase64(file, async (img) => {
			const exif = await getExif(img)

			setPhotos((prev) => [
				...prev,
				{
					_id: file.uid,
					pathID: null,
					src: img,
					isAdultContent: false,
					...exif,
				},
			])

			const url = `${process.env.SERVER_MEDIA_URL}/upload?type=post`
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
				.then((res) => {
					checkContent(res.data.id)
						.then((checkRes) => {
							setPhotos((prev) => [
								...prev.map((v) => {
									if (v._id === file.uid) {
										if (checkRes.isAdultContent) {
											v.isAdultContent = true
										}
										v.tags = checkRes.tags
									}
									return v
								}),
							])

							onSuccess(res)
						})
						.catch(() => {
							onSuccess(res)
						})
				})
				.catch((err) => console.log(err))
		})
	}

	const getExif = async (img) => {
		try {
			let buffer = Buffer.from(img.split(',')[1], 'base64')
			let dimensions = sizeOf(buffer)
			const output = await exifr.parse(img)
			const {
				Artist,
				Copyright,
				Flash,
				FocalLength,
				ISO,
				LensModel,
				Make,
				Model,
				CreateDate,
			} = output || {}

			return {
				height: dimensions.height,
				width: dimensions.width,
				artist: Artist,
				copyright: Copyright,
				flash: Flash,
				focalLength: FocalLength,
				iso: ISO,
				lensModel: LensModel,
				make: Make,
				model: Model,
				createDate: CreateDate,
			}
		} catch (error) {
			notify('Cant get photo\'s information', false)
		}
	}

	const submitTags = (tags) => {
		//add new tags to user's interest list
		updateProfile({
			variables: {
				userInfo: { interestList: tags },
			},
		}).catch((err) => notify(err, false))

		//add new tags
		return addTags({
			variables: {
				tags,
			},
		})
	}

	const onSubmitPost = async () => {
		if (photosLengthRef.current > 0) {
			setPosting(true)
			setReady(false)
			const x = await Promise.all(
				photos.map(
					(v) =>
						new Promise((resolve, reject) => {
							{
								if (!v.isAdultContent) {
                  const { src, _id, isAdultContent, tags, ...newObject } = v // eslint-disable-line
									addPost({
										variables: {
											description: document.getElementById(
												`${v.pathID}-description`,
											).value,
											tags: [
												...(tags || []),
												...([
													...document.getElementById(`${v.pathID}-tags`)
														.childNodes,
												]
													.map((v) => v.textContent)
													.slice(0, -1) || []),
											],
											photo: newObject,
										},
									}).then((res) => {
										if (
											res.data.addPost.tags &&
                      res.data.addPost.who.interestList
										) {
											submitTags([
												...new Set([
													...res.data.addPost.who.interestList,
													...res.data.addPost.tags,
												]),
											])
										}
										resolve(v)
									})
								} else {
									const config = {
										headers: {
											'Content-Type': 'text/plain',
											Authorization: localStorage.getItem('Authorization'),
										},
									}
									axios
										.put(
											`${process.env.SERVER_MEDIA_URL}/delete?type=post&id=${v.pathID}`,
											v.pathID,
											config,
										)
										.then(() => reject())
								}
							}
						}),
				),
			)
			if (x.some((v) => !v)) {
				notify('Something went wrong !', false)
			} else {
				setReady(true)
				setShowPostingModal(false)
				setAddPostData(x)
			}
			setPhotos([])
			setPhotoCount(0)
			setPosting(false)
			selectedPhotos.current = 0
		}
	}

	const handleChange = async (info) => {
		if (info.file.status === 'uploading') {
			setReady(false)
		}

		if (info.file.status === 'done') {
			if (!info.file.response.data) {
				setReady(false)
				notify('Can not upload !', false)
			} else {
				const pathID = info.file.response.data.id
				const uid = info.file.uid

				setPhotos((prev) =>
					prev.map((v) => {
						if (v._id === uid) {
							return { ...v, pathID: pathID }
						}
						return v
					}),
				)
			}
		}
	}

	const beforeUpload = (file) => {
		if (selectedPhotos.current >= PHOTO_LIMIT) {
			return false
		}
		selectedPhotos.current += 1

		const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png'
		if (!isJpgOrPng) {
			notify('Only allow JPG/PNG !', false)
		}
		const isLtM = file.size / 1024 / 1024 < 25
		if (!isLtM) {
			notify('Maximum size is 25MB!', false)
		}
		const isMrM = file.size / 1024 / 1024 > 0.5
		if (!isMrM) {
			notify('Minimum size is 500KB!', false)
		}
		const result = isJpgOrPng && isLtM && isMrM
		return result
	}

	const getBase64 = (img, callback) => {
		const reader = new FileReader()
		reader.addEventListener('load', () => callback(reader.result))
		reader.readAsDataURL(img)
	}

	const closeModalHandler = () => {
		if (photosLengthRef.current === 0 && photoCount === 0) {
			setShowPostingModal(false)
			return
		}

		if (
			photosLengthRef.current !== 0 &&
      photoCount !== 0 &&
      photosLengthRef.current - photoCount === 0
		) {
			const { confirm } = Modal
			confirm({
				title: 'Are you sure ? ALL of your photos will be deleted',
				centered: true,
				onOk() {
					(async () => {
						await Promise.all(
							photos.map((v) => {
								const config = {
									headers: {
										'Content-Type': 'text/plain',
										Authorization: localStorage.getItem('Authorization'),
									},
								}
								axios.put(
									`${process.env.SERVER_MEDIA_URL}/delete?type=post&id=${v.pathID}`,
									v.pathID,
									config,
								)
							}),
						)
					})()
					setPhotos([])
					setPhotoCount(0)
					setShowPostingModal(false)
					selectedPhotos.current = 0
				},
				onCancel() {},
			})
		}
	}

	const modalFooter = (
		<div className="create-post__footer">
			<div className="create-post__footer__progress">
				<Progress
					strokeColor={{
						'0%': '#108ee9',
						'100%': '#87d068',
					}}
					percent={((photosLengthRef.current / photoCount) * 100 || 0).toFixed(
						2,
					)}
				/>

				<p
					style={{
						margin: '0 1em 0 2.2em',
						fontSize: 'small',
					}}
				>
					{photosLengthRef.current}/{photoCount}
				</p>
			</div>
			<p
				style={{
					color: 'red',
					position: 'absolute',
					bottom: 0,
					left: '1.5em',
					fontSize: 'small',
				}}
			>
        We are not going to upload any photo has Adult Content !
			</p>
			<div className="create-post__footer__buttons">
				<Button type="secondary" onClick={() => closeModalHandler()}>
          Cancel
				</Button>
				<Button
					type="primary"
					onClick={() => onSubmitPost()}
					disabled={!ready}
					loading={posting}
				>
          Post
				</Button>
			</div>
		</div>
	)

	const uploadedImages = useMemo(() => {
		return photos.map((v) => (
			<ImageCard
				key={v._id}
				src={v.src}
				pathID={v.pathID}
				isAdultContent={v.isAdultContent}
				deleteHandler={() =>
					deleteImageFromServer({ response: { data: { id: v.pathID || -1 } } })
				}
				ready={ready}
			/>
		))
	}, [photos, ready])

	return (
		<>
			<Modal
				title="What do you have today ?"
				centered
				visible={showPostingModal}
				className="posting-modal"
				confirmLoading={posting}
				destroyOnClose={true}
				footer={modalFooter}
				onCancel={() => closeModalHandler()}
				onOk={() => onSubmitPost()}
			>
				<Dragger
					name="photo"
					multiple={true}
					accept=".jpg, .png"
					customRequest={uploadToServer}
					beforeUpload={beforeUpload}
					onChange={handleChange}
					onRemove={deleteImageFromServer}
					openFileDialogOnClick={!posting}
					showUploadList={false}
				>
					<p className="ant-upload-drag-icon">
						<InboxOutlined />
					</p>
					<p className="ant-upload-text">Choose or Drag here to upload</p>
					<p className="ant-upload-hint">
            Only support PNG and JPG smaller than 25MB and bigger than 1MB.
					</p>
				</Dragger>
				<div className="uploaded-zone">{uploadedImages}</div>
			</Modal>
		</>
	)
}

export default CreatePost
