import React, { useMemo, useState, useContext } from 'react'
import { Modal, Button, Tag } from 'antd'
import { useQuery, useMutation } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { UserContext } from '../../contexts/userContext'
import './interest.scss'
const TAGS = gql`
  query {
    tags {
      _id
      tagName
    }
  }
`
const EDIT_USER = gql`
  mutation edit($_id: String!, $interest: [String]!) {
    updateUser(_id: $_id, interest: $interest)
  }
`
const interests = (props) => {
	const { getdata } = props
	const [tags, setTags] = useState([])
	const [editUser] = useMutation(EDIT_USER)
	const [visible, setVisible] = useState(true)
	const [selectTag, setSelectTag] = useState([])
	const { user: currentUser } = useContext(UserContext)

	const { data } = useQuery(TAGS, {
		fetchPolicy: 'network-only',
	})
	const handleChooseTag = (tag) => {
		getdata(tag.tagName)
		const temp = [...selectTag]
		if (!temp.includes(tag)) {
			temp.push(tag)
		} else {
			const index = temp.indexOf(tag)
			temp.splice(index, 1)
		}
		setSelectTag(temp)
	}

	const renderTagList = useMemo(() => {
		try {
			if (data) {
				setTags(data.tags)
			}
		} catch (err) {
			console.log(err)
		}
	}, [data])

	const handleSubmmit = () => {
		const tempArr = []
		selectTag.forEach((e) => {
			tempArr.push(e.tagName)
		})

		editUser({
			variables: {
				_id: currentUser._id,
				interest: tempArr,
			},
		}).then(() => {
			setVisible(false)
			window.location.reload()
		})
	}
	return (
		<div>
			{renderTagList}
			{(currentUser['_id'] && (!currentUser['interestList'] || currentUser['interestList'].length == 0)) ? (
				<Modal
					className="interest-modal"
					visible={visible}
					footer={[
						<Button
							key="submit"
							id="interest-list"
							onClick={handleSubmmit}
							type="primary"
						>
              Done
						</Button>,
					]}
					title="Let us know what you're interested in !"
				>
					<div className="tag-list">
						{tags.map((tag) => {
							return (
								<Tag
									checked={selectTag.includes(tag) > -1}
									className="interest-tag"
									onClick={() => handleChooseTag(tag)}
									color={selectTag.includes(tag) ? 'blue' : 'default'}
									key={tag._id}
								>
									{tag.tagName}
								</Tag>
							)
						})}
					</div>
				</Modal>
			) : (
				''
			)}
		</div>
	)
}

export default interests
