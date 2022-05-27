import React, { useRef } from 'react'
import { Form } from '@ant-design/compatible'
import { Input, Button, Modal } from 'antd'
import { withRouter } from 'react-router-dom'

// import css
import './index.scss'

const ForgotForm = (props) => {
	const { onCancel, visible } = props

	const forgotEmailRef = useRef(null)

	const { getFieldDecorator } = props.form

	const forgotHandler = (e) => {
		e.preventDefault()
	}

	const enterHandler = (e) => {
		if (e.key === 'Enter') forgotHandler(e)
	}

	return (
		<>
			<Modal
				visible={visible}
				onCancel={() => {
					onCancel()
				}}
				footer={null}
				width="556px"
				className="login-form-forgot"
			>
				<div className="title">Forgot password ?</div>
				<div className="text-1">Please submit your email to reset password</div>
				<div className="text-2">Please check your email after submit</div>
				<Form
					onSubmit={() => {
						forgotHandler()
					}}
				>
					<Form.Item>
						{getFieldDecorator('email', {
							rules: [
								{ required: true, message: 'Vui lòng nhập địa chỉ email' },
								{
									// eslint-disable-next-line max-len
									pattern: /^([A-Z|a-z|0-9](\.|_){0,1})+[A-Z|a-z|0-9]@([A-Z|a-z|0-9])+((\.){0,1}[A-Z|a-z|0-9]){2}\.[a-z]{2,3}$/gm,
									message: 'Địa chỉ Email is not available',
								},
							],
						})(
							<Input
								ref={forgotEmailRef}
								size="large"
								onKeyDown={(e) => {
									enterHandler(e)
								}}
							/>,
						)}
					</Form.Item>
					<Form.Item>
						<Button
							name="btn-send-request"
							type="primary"
							size="large"
							block
							className="btn-innos"
							onClick={(e) => forgotHandler(e)}
						>
              Send
						</Button>
					</Form.Item>
				</Form>
			</Modal>
		</>
	)
}

const WrappedNormalForm = Form.create({ name: 'normal' })(ForgotForm)
export default withRouter(WrappedNormalForm)
