import React from 'react'
import './App.scss'
import AppRouters from './Router'
import { BackTop } from 'antd'

const App = () => {
	return (
		<>
			<div className="pages">
				<div className="wrapper">
					<BackTop style={{right: '2em'}}/>
					<AppRouters />
				</div>
			</div>
		</>
	)
}

export default App
