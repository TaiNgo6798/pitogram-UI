import React, { useState, useContext, useMemo } from 'react'
import { Spin, Result, Button } from 'antd'
import { withRouter } from 'react-router-dom'
import './index.scss'
import Main from './main'
import { UserContext } from '../../contexts/userContext'
function Index(props) {
	//const [isLogged, setIsLogged] = useState(false)

	const { user: currentUser } = useContext(UserContext)

	const [loading] = useState(false)

	const isAdmin = useMemo(() => {
		const currentPermissions = currentUser['permissions']
		if (Array.isArray(currentPermissions)) {
			if (currentPermissions.includes('ADMIN')) {
				return <Main />
			} else {
				return (
					<Result
						status="500"
						title="500"
						subTitle="Sorry, something went wrong."
						extra={
							<Button type="primary" onClick={props.history.goBack}>
                Back Home
							</Button>
						}
					/>
				)
			}
		}
	}, [currentUser])
	// useEffect(() => {
	// 	let mounted = true
	// 	if (mounted) {

	// 	}
	// 	return () => { mounted = false }
	// }, [])

	return (
		<>
			<Spin spinning={loading} style={{ maxHeight: '100vh' }}>
				<div className="content_admin">
					<div className="wrapper_admin">{isAdmin}</div>
				</div>
			</Spin>
		</>
	)
}

export default withRouter(Index)
