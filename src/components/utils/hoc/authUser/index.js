import React, { Component } from 'react'

function withAuthUser(WrappedComponent) {

	return class index extends Component {
		constructor(props) {
			super(props)
			this.state = {
				authed: false
			}
		}
		componentDidMount() {
			if (this.props.params) { // kiem tra url xem co dang o trong trang profile hay khong ? 
				//let token = localStorage.getItem('Authorization') || ''
			} else {                            //neu o trang newsFeed thi luon luon hien component
				this.setState({
					authed: true
				})
			}
		}
		render() {
			return this.state.authed && <WrappedComponent {...this.props} />
		}
	}
}

export default withAuthUser
