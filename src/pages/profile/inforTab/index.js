import React, { useState, useRef, useMemo } from 'react'
import { useQuery } from '@apollo/react-hooks'
import {
	EditOutlined,
	HeartFilled,
	PhoneOutlined,
	UserOutlined,
	SaveOutlined,
	CloseOutlined,
	HeartOutlined,
} from '@ant-design/icons'
import { Row, Col, Tag, Input, Radio, Select } from 'antd'
import gql from 'graphql-tag'
//replace momentjs by dayjs
import dayjsGenerateConfig from 'rc-picker/lib/generate/dayjs'
import generatePicker from 'antd/es/date-picker/generatePicker'
import 'antd/es/date-picker/style/index'
const DatePicker = generatePicker(dayjsGenerateConfig)

//dayjs
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import LocalizedFormat from 'dayjs/plugin/localizedFormat'
import 'dayjs/locale/en'
dayjs.extend(relativeTime)
dayjs.extend(LocalizedFormat)
dayjs.locale('en')

import './index.scss'

const { Option } = Select
const TAGS = gql`
  query {
    tags {
      _id
      tagName
    }
  }
`
function InforTab(props) {
	const {
		canEdit,
		user: {
			firstName,
			lastName,
			gender,
			relationship,
			dob,
			email,
			phone,
			interestList,
		},
		updateProfile,
		refetch,
	} = props
	const { data } = useQuery(TAGS, {
		fetchPolicy: 'network-only',
	})

	//local state
	const [edittingKey, setEdittingKey] = useState('')
	const [tags, setTags] = useState([])
	const [dobState, setDob] = useState('')
	const [genderState, setGender] = useState('')
	const [relaState, setRela] = useState('')
	const [selectedTags, setSelectedTags] = useState([])

	//refs
	const firstNameRef = useRef(null)
	const lastNameRef = useRef(null)
	const phoneRef = useRef(null)
	const schoolRef = useRef(null)
	const companiesRef = useRef(null)

	const editClick = (key) => {
		setEdittingKey(key)
	}

	const cancelEdit = () => {
		setEdittingKey('')
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

	const submitEdit = (e, key) => {
		if ((e && e.key === 'Enter') || !e) {
			const values = {
				userName: {
					firstName: firstNameRef.current ? firstNameRef.state.value : '',
					lastName: lastNameRef.current ? lastNameRef.state.value : '',
				},
				gender: genderState,
				dob: dobState,
				phone: phoneRef.current ? phoneRef.state.value : '',
				relationship: relaState,
				schools: schoolRef.current ? schoolRef.state.value : '',
				companies: companiesRef.current ? companiesRef.state.value : '',
			}

			let info =
        key === 'userName'
        	? values[key].firstName && values[key].lastName
        		? values[key]
        		: ''
        	: {
        		[key]: values[key],
        	}

			if (Object.values(info).filter((v) => v).length > 0) {
				updateProfile({
					variables: {
						userInfo: info,
					},
				}).then(() => {
					refetch()
					setEdittingKey('')
					setDob('')
					setGender('')
					setRela('')
				})
			}
		}
	}

	const renderButtons = (key) => {
		return (
			<div className="buttons">
				{canEdit ? (
					edittingKey === key ? (
						<>
							<SaveOutlined
								className="circle-icon hover-color"
								onClick={() => submitEdit(null, key)}
							/>
							<CloseOutlined
								className="circle-icon hover-color"
								onClick={() => cancelEdit()}
							/>
						</>
					) : (
						<>
							<EditOutlined
								className="circle-icon hover-color"
								onClick={() => editClick(key)}
							/>
						</>
					)
				) : (
					<div />
				)}
			</div>
		)
	}

	const handleChange = (value) => {
		setSelectedTags(value)
	}

	const handeChangeTag = () => {
		updateProfile({
			variables: {
				userInfo: { interestList: selectedTags },
			},
		}).then(() => {
			setSelectedTags([])
			refetch()
		})
	}

	return (
		<>
			<div className="container_detail_profile">
				{/* //thong tin ca nhan */}
				{renderTagList}
				<Row type="flex" justify="space-between">
					<Col>
						<h3>
							<UserOutlined style={{ fontSize: '22px' }} /> Personal Information
						</h3>
					</Col>
					<Col></Col>
				</Row>

				<div className="infor_detail_profile">
					<hr className="hr_profile" />
					<div className="row_detail_profile">
						<p>UserName</p>
						{edittingKey === 'userName' ? (
							<div className="user-name-edit">
								<Input
									ref={firstNameRef}
									autoFocus
									className="edit-input"
									defaultValue={`${firstName}`}
									onKeyDown={(e) => submitEdit(e, 'userName')}
								/>
								<Input
									ref={lastNameRef}
									autoFocus
									className="edit-input"
									defaultValue={`${lastName}`}
									onKeyDown={(e) => submitEdit(e, 'userName')}
								/>
							</div>
						) : (
							<p>{`${firstName} ${lastName}`}</p>
						)}
						{renderButtons('userName')}
					</div>
					<hr className="hr_profile" />
					<div className="row_detail_profile">
						<p>Gender</p>
						{edittingKey === 'gender' ? (
							<Radio.Group
								onChange={(e) => setGender(e.target.value)}
								defaultValue={gender}
							>
								<Radio value={'male'}>Male</Radio>
								<Radio value={'female'}>Female</Radio>
							</Radio.Group>
						) : gender ? (
							gender === 'male' ? (
								<Tag color="geekblue">♂ Male</Tag>
							) : (
								<Tag color="magenta">♀ Female</Tag>
							)
						) : (
							''
						)}
						{renderButtons('gender')}
					</div>
					<hr className="hr_profile" />
					<div className="row_detail_profile">
						<p>Day of Birth</p>
						{edittingKey === 'dob' ? (
							<DatePicker
								onChange={(date, dateString) => setDob(dateString)}
								defaultValue={dayjs(
									dob === '' || dob === '0' ? '1/1/2020' : dob,
									'DD/MM/YYYY',
								)}
								format="DD/MM/YYYY"
							/>
						) : (
							<p>{dob === '' || dob === '0' ? 'Not Updated' : dob}</p>
						)}
						{renderButtons('dob')}
					</div>
					<hr className="hr_profile" />
				</div>

				{/* // thong tin lien he */}
				<div>
					<h3>
						<HeartOutlined style={{ fontSize: '22px' }} /> Tags
					</h3>
					<hr className="hr_profile" />
					<div className="row_detail_profile">
						<p>Interest in</p>
						<Select
							mode="multiple"
							className="select-tag"
							allowClear
							style={{ width: '300px', border: 'none' }}
							placeholder="Please select"
							defaultValue={interestList}
							onChange={handleChange}
							disabled={!canEdit}
						>
							{tags.map((tag) => {
								return <Option key={tag.tagName}>{tag.tagName}</Option>
							})}
						</Select>
						{selectedTags.length > 0 && (
							<div className="buttons">
								<SaveOutlined
									className="circle-icon hover-color"
									onClick={() => handeChangeTag()}
								/>
							</div>
						)}
					</div>
				</div>
				<h3>
					<PhoneOutlined style={{ fontSize: '22px' }} /> Contact
				</h3>
				<div className="infor_detail_profile">
					<hr className="hr_profile" />
					<div className="row_detail_profile">
						<p>Phone</p>
						{edittingKey === 'phone' ? (
							<Input
								ref={phoneRef}
								autoFocus
								className="edit-input"
								defaultValue={phone}
								onKeyDown={(e) => submitEdit(e, 'phone')}
							/>
						) : (
							<p>{phone || 'Not Updated'}</p>
						)}
						{renderButtons('phone')}
					</div>
					<hr className="hr_profile" />
					<div className="row_detail_profile">
						<p>Email</p>
						<p>{email}</p>
						<div />
					</div>
					<hr className="hr_profile" />
				</div>

				{/* // moi quan he */}
				<h3>
					<HeartFilled style={{ fontSize: '22px' }} /> Relationship
				</h3>
				<div className="infor_detail_profile">
					<hr className="hr_profile" />
					<div className="row_detail_profile">
						<p>Status</p>
						{edittingKey === 'relationship' ? (
							<Select
								onChange={(e) => setRela(e.value)}
								labelInValue
								defaultValue={{ value: relationship }}
								style={{ width: 120 }}
							>
								<Option value="single">Single</Option>
								<Option value="married">Married</Option>
								<Option value="else">Else</Option>
							</Select>
						) : (
							<p>
								{relationship === 'single'
									? 'Single'
									: relationship === 'married'
										? 'Married'
										: 'Else' || 'Not Updated'}
							</p>
						)}
						{renderButtons('relationship')}
					</div>

					<hr className="hr_profile" />
				</div>
			</div>
		</>
	)
}

export default InforTab
