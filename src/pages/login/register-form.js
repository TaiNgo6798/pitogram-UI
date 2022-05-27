import React, { useState, useEffect } from 'react'
import {
	Input,
	Select,
	Button,
	Spin,
	notification,
	Row,
	Col,
	Divider,
	Form,
} from 'antd'

//server
import gql from 'graphql-tag'
import { useMutation } from '@apollo/react-hooks'
// import css
import './index.scss'
const REGISTER = gql`
  mutation createUser($user: UserInput!) {
    createUser(user: $user)
  }
`

const LOGIN = gql`
  mutation login($email: String!, $password: String!) {
    login(loginInput: { email: $email, password: $password }) {
      token
      status
      message
    }
  }
`
function RegistrationForm(props) {
	const [register] = useMutation(REGISTER)
	const [login] = useMutation(LOGIN)
	const [loading, setLoading] = useState(false)
	const [password, setPassword] = useState('')
	const [status, setStatus] = useState('')
	const handlePassword = (e) => {
		setPassword(e.target.value)
	}
	useEffect(() => {
		if (password.length > 15) {
			setStatus('warning')
		}
		if (password.length > 0 && password.length < 8) {
			setStatus('error')
		}
		if (password.length >= 8 && password.length <= 15) {
			setStatus('success')
		}
		if (!password.match(/^[A-Z]/)) {
			setStatus('error')
		}
		if (!password.match(/(?=.*?[0-9])/)) {
			setStatus('error')
		}
		if (password.length === 0) {
			setStatus('')
		}
	})
	const openNotification = (status) =>
		status
			? notification.success({
				message: 'Welcome !',
				placement: 'bottomRight',
			})
			: notification.error({
				message: 'Email is not available !',
				placement: 'bottomRight',
			})
	const handleSubmit = (values) => {
		setLoading(true)
		const { email, password, firstName, lastName, gender } = values

		register({
			variables: {
				user: {
					email,
					password,
					firstName,
					lastName,
					gender,
				},
			},
		})
			.then((res) => {
				setLoading(false)
				login({
					variables: {
						email: email,
						password: password,
					},
				})
					.then((res) => {
						const { token } = res.data.login
						if (token) {
							localStorage.setItem('Authorization', `Bearer ${token}`)
							window.location.href = '/'
						}
					})
					.catch(() => {})
				//console.log(res.data.createUser);
				openNotification(res.data.createUser)

				if (res.data.createUser) {
					props.backLogin()
				}
			})
			.catch(() => {
				setLoading(false)
				notification.error({
					message: 'Something is wrong, please try again !',
					placement: 'bottomRight',
				})
			})
	}

	const registerForm = () => {
		return (
			<Form onFinish={handleSubmit} className="login-container_register-form">
				<h1>Create a new account</h1>
				<Form.Item
					name="firstName"
					rules={[
						{
							required: true,
							message: 'Please type your First Name !',
						},
						{
							pattern: new RegExp(
								/^[a-zA-ZaAàÀảẢãÃáÁạẠăĂằẰẳẲẵẴắẮặẶâÂầẦẩẨẫẪấẤậẬbBcCdDđĐeEèÈẻẺẽẼéÉẹẸêÊềỀểỂễỄếẾệỆfFgGhHiIìÌỉỈĩĨíÍịỊjJkKlLmMnNoOòÒỏỎõÕóÓọỌôÔồỒổỔỗỖốỐộỘơƠờỜởỞỡỠớỚợỢpPqQrRsStTuUùÙủỦũŨúÚụỤưƯừỪửỬữỮứỨựỰvVwWxXyYỳỲỷỶỹỸýÝỵỴzZ@~`!@#$%^&*()_=+\\\\';:\"\\/?>.<,-]+$/i,
							),
							message: 'No Special Character Please !',
						},
					]}
					style={{ display: 'inline-block', width: 'calc(50% - 8px)' }}
				>
					<Input placeholder="First Name" />
				</Form.Item>
				<Form.Item
					name="lastName"
					rules={[
						{
							required: true,
							message: 'Please type your Last Name !',
						},
						{
							pattern: new RegExp(
								/^[a-zA-ZaAàÀảẢãÃáÁạẠăĂằẰẳẲẵẴắẮặẶâÂầẦẩẨẫẪấẤậẬbBcCdDđĐeEèÈẻẺẽẼéÉẹẸêÊềỀểỂễỄếẾệỆfFgGhHiIìÌỉỈĩĨíÍịỊjJkKlLmMnNoOòÒỏỎõÕóÓọỌôÔồỒổỔỗỖốỐộỘơƠờỜởỞỡỠớỚợỢpPqQrRsStTuUùÙủỦũŨúÚụỤưƯừỪửỬữỮứỨựỰvVwWxXyYỳỲỷỶỹỸýÝỵỴzZ@~`!@#$%^&*()_=+\\\\';:\"\\/?>.<,-]+$/i,
							),
							message: 'No Special Character please !',
						},
					]}
					style={{
						display: 'inline-block',
						width: 'calc(50% - 8px)',
						margin: '0 0 0 15px',
					}}
				>
					<Input placeholder="Name" />
				</Form.Item>
				<Form.Item
					name="email"
					rules={[
						{
							type: 'email',
							message: 'Email is not available !',
						},
						{
							required: true,
							message: 'Please type your E-mail !',
						},
					]}
				>
					<Input placeholder="E-mail" />
				</Form.Item>
				<Form.Item
					name="gender"
					rules={[
						{
							required: true,
							message: 'Please select your Gender !',
						},
					]}
				>
					<Select placeholder="Gender">
						<Select.Option value="male">Male</Select.Option>
						<Select.Option value="female">Female</Select.Option>
					</Select>
				</Form.Item>
				<Form.Item
					name="password"
					validateStatus={status}
					rules={[
						{
							required: true,
							message: 'Password can not be empty !',
						},
						{
							min: 8,
							message: 'Password is too short !',
						},
						{
							max: 15,
							message: 'Too long password !',
						},
						{
							pattern: new RegExp(/^[A-Z]/),
							message: 'First character should be Uppercase !',
						},
						{
							pattern: new RegExp(/(?=.*?[0-9])/),
							message: 'At least 1 number in your password !',
						},
					]}
					hasFeedback
				>
					<Input.Password placeholder="Password" onChange={handlePassword} />
				</Form.Item>
				<Form.Item
					name="confirm"
					dependencies={['password']}
					hasFeedback
					rules={[
						{
							required: true,
							message: 'Please confirm your password !',
						},

						({ getFieldValue }) => ({
							validator(rule, value) {
								if (!value || getFieldValue('password') === value) {
									return Promise.resolve()
								}
								return Promise.reject('2 passwords is not the same !')
							},
						}),
					]}
				>
					<Input.Password placeholder="Confirm your password" />
				</Form.Item>
				<Row>
					<Col span={24}>
						<Button type="primary" style={{ width: '100%' }} htmlType="submit">
							{'Sign Up'}
						</Button>
					</Col>
				</Row>
				<Row>
					<Col span={20} push={2}>
						<Divider style={{ marginTop: '1.2em', marginBottom: '1.2em' }} />
					</Col>
				</Row>
				<Row>
					<Col xs={{ span: 24 }} lg={{ span: 0 }}>
						<a
							onClick={() => props.backLogin()}
							style={{
								width: '100%',
								display: 'flex',
								justifyContent: 'center',
							}}
						>
              Back to Login
						</a>
					</Col>
				</Row>
			</Form>
		)
	}

	return <Spin spinning={loading}>{registerForm()}</Spin>
}

export default RegistrationForm
