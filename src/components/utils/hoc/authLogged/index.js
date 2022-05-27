import React, { Component } from 'react'
import * as jwt from 'jsonwebtoken'

function withAuthLogged(WrappedComponent) {
	return class index extends Component {
		constructor(props) {
			super(props)
			this.state = {
				logged: false
			}
		}
		componentDidMount() {
			try {
				const token = localStorage.getItem('Authorization').split(' ')[1] || ''
				const user = jwt.verify(token, 'taingo6798')
				if(user) {
					this.setState({logged: true})
				} else {
					this.setState({logged: false})
				}
			} catch (error) {
				this.setState({logged: false})
			}
		}
		render() {
			return this.state.logged && <WrappedComponent {...this.props} /> 
		}
	}
}

export default withAuthLogged
