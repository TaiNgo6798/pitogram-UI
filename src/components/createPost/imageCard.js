import React, { useState, useRef } from 'react'
import { Tag, Input } from 'antd'
import {
	PlusOutlined,
	CloseOutlined,
} from '@ant-design/icons'
import 'react-lazy-load-image-component/src/effects/blur.css'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { uuid } from 'uuidv4'
// import { useVisionAPI } from '@utils/hook/visionAI'

import AdultSrc from '@assets/images/18.png'
import uploadoadingGif from '@assets/images/uploading.gif'

const { TextArea } = Input
const imageCard = ({ pathID, src, deleteHandler, ready, isAdultContent }) => {
	//local states
	const [inputVisible, setInputVisible] = useState(false)
	const [tags, setTags] = useState([])
	// const [detecting, setDetecting] = useState(false)
	// const [isDetected, setIsDetected] = useState(false)

	//refs
	const saveInputRef = useRef(null)

	const addTagHandler = () => {
		const newTag = saveInputRef.current.input.value || ''
		if (newTag.length > 0 && tags.indexOf(newTag) === -1) {
			setTags((prev) => [...prev, newTag])
		}
		setInputVisible(false)
	}

	const removeTagHandler = (tag) => {
		setTags((prev) => prev.filter((v) => v !== tag))
	}

	// const getTags_AI = async (pathID) => {
	//   setDetecting(true)
	//   const url = `http://pitogram.com:6798/file/download?type=post&id=${pathID}&size=small`
	//   const detectedTags = await useVisionAPI('autoTags')(url)
	//   setTags((prev) => [...prev, ...detectedTags])
	//   setDetecting(false)
	//   setIsDetected(true)
	// }

	const tagsContainer = () => {
		const tagChild = tags.map((tag) => (
			<Tag
				key={uuid()}
				closable
				onClose={(e) => {
					e.preventDefault()
					removeTagHandler(tag)
				}}
			>
				{tag}
			</Tag>
		))

		return (
			<>
				{tagChild}
				{inputVisible && (
					<Input
						autoFocus
						ref={saveInputRef}
						type="text"
						size="small"
						style={{ width: 78 }}
						onBlur={() => addTagHandler()}
						onPressEnter={() => addTagHandler()}
					/>
				)}
				{!inputVisible && (
					<>
						<Tag
							onClick={() => setInputVisible(true)}
							className="site-tag-plus"
						>
							<PlusOutlined /> Add tag
						</Tag>
						{/* {isDetected || (
              <>
                {!detecting ? (
                  <Tag
                    onClick={() => getTags_AI(pathID)}
                    className="site-tag-plus"
                  >
                    <FireOutlined />
                    Vision AI Detecting
                  </Tag>
                ) : (
                  <Tag className="site-tag-plus">
                    <LoadingOutlined />
                  </Tag>
                )}
              </>
            )} */}
					</>
				)}
			</>
		)
	}

	return (
		<div className="image-card">
			{ready && (
				<>
					<CloseOutlined
						className="delete-button"
						onClick={() => deleteHandler()}
					/>
				</>
			)}
			<div className="img-container">
				{isAdultContent && (
					<img className="image-card_img adult_logo" src={AdultSrc} />
				)}
				<LazyLoadImage
					className={`image-card_img ${isAdultContent ? 'adult-warning' : ''}`}
					effect="opacity"
					src={pathID ? src : uploadoadingGif}
				/>
			</div>

			{ready && (
				<>
					<div id={`${pathID}-tags`} className="image-card_tags">
						{tagsContainer()}
					</div>
					<TextArea
						id={`${pathID}-description`}
						className="image-card_description"
						rows={3}
					/>
				</>
			)}
		</div>
	)
}

export default imageCard
