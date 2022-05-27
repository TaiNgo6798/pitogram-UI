import React, { useRef, useState } from 'react'
import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { Input, Button, notification, Row, Col, Form } from 'antd'
import logo from '@assets/images/logo.png'
import { useMediaQuery } from 'react-responsive'

import RegisterForm from './register-form'
//import ForgotForm from './forgot-form'

// import css
import './index.scss'

//server
import gql from 'graphql-tag'
import { useMutation } from '@apollo/react-hooks'

const LOGIN = gql`
  mutation login($email: String!, $password: String!) {
    login(loginInput: { email: $email, password: $password }) {
      token
      status
      message
    }
  }
`
const openNotification = (placement, message) => {
	notification.error({
		message,
		placement,
	})
}

const Login = () => {
	const isDesktop = useMediaQuery({ query: '(min-width: 992px)' })
	const emailRef = useRef(null)
	const passwordRef = useRef(null)
	const [login] = useMutation(LOGIN)
	const [isRegister, setIsRegister] = useState(false)

	const registerClick = () => {
		setIsRegister(!isRegister)
	}

	const handleSubmit = () => {
		console.log(emailRef.current.input.value)
		login({
			variables: {
				email: emailRef.current.input.value,
				password: passwordRef.current.input.value,
			},
		})
			.then((res) => {
				const { token } = res.data.login
				if (token) {
					localStorage.setItem('Authorization', `Bearer ${token}`)
					window.location.href = '/'
				} else {
					openNotification(
						'bottomRight',
						res.data.login.message === 'locked'
							? 'Your account has been locked !'
							: 'Wrong username or password !',
					)
				}
			})
			.catch(() => {
				notification.error({
					message: 'Can not login this time !',
					placement: 'bottomRight',
				})
			})
	}

	const loginForm = (
		<>
			<Form
				className="login-container_login-form"
				onFinish={() => handleSubmit()}
			>
				<Row>
					<Col xs={{ span: 12, push: 6 }} lg={{ span: 0 }}>
						<h1 className="col-item-centered">Login</h1>
					</Col>
					<Col xs={{ span: 20, offset: 2 }} lg={{ span: 8, offset: 0 }}>
						<Form.Item
							rules={[
								{
									type: 'email',
									message: 'Email is not available !',
								},
								{
									required: true,
									message: 'Please type your Email !',
								},
							]}
						>
							<Input
								prefix={<MailOutlined className="site-form-item-icon" />}
								placeholder="Email"
								ref={emailRef}
							/>
						</Form.Item>
					</Col>
					<Col xs={{ span: 20, offset: 2 }} lg={{ span: 8, offset: 1 }}>
						<Form.Item
							rules={[
								{ required: true, message: 'Pleaase type your password !' },
							]}
						>
							<Input
								prefix={<LockOutlined className="site-form-item-icon" />}
								type="password"
								placeholder="Password"
								ref={passwordRef}
							/>
						</Form.Item>
					</Col>
					<Col xs={{ span: 20, offset: 2 }} lg={{ span: 5, offset: 1 }}>
						<Form.Item style={{ marginBottom: '0.25em' }}>
							<Button
								type="primary"
								htmlType="submit"
								style={{ width: '100%' }}
							>
                Login
							</Button>
						</Form.Item>
					</Col>
					<Col xs={{ span: 20, offset: 2 }} lg={{ span: 8, offset: 9 }}>
						{/* <Form.Item style={{ marginBottom: '0.25em' }}>
							<a
								className={`login-container_forgot-button ${
									isDesktop && 'login-container_forgot-button-top'
								}`}
							>
                Quên Password ?
							</a>
						</Form.Item> */}
					</Col>
					<Col xs={{ span: 10, offset: 8 }} lg={{ span: 0 }}>
            Or <a onClick={() => registerClick()}>Join us !</a>
					</Col>
				</Row>
			</Form>
		</>
	)

	return (
		<div className={`login-container ${isDesktop ? 'has-background' : ''}`}>
			<div className="login-center">
				<img className="logo" src={logo} />
				<p className='demo-account'>or use this demo account: guestpitogram@gmail.com / Guest123</p>
				<Row>
					<Col
						className="col-item-centered"
						xs={24}
						lg={{ span: 24, offset: 0 }}
					>
						{(!isRegister || isDesktop) && loginForm}
					</Col>
					{(isRegister || isDesktop) && (
						<Col
							className="col-item-centered"
							xs={{ span: 24, offset: 0 }}
							lg={{ span: 24, offset: 0 }}
						>
							<RegisterForm backLogin={() => registerClick()} />
						</Col>
					)}
				</Row>
			</div>
		</div>
	)
}

export default Login
