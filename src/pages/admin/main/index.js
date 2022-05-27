import React, { useState } from 'react'

import {
	CarryOutOutlined,
	HomeOutlined,
	InboxOutlined,
	LogoutOutlined,
	TeamOutlined,
	CrownOutlined,
} from '@ant-design/icons'

import { Layout, Menu } from 'antd'
import './index.scss'

import Logo from '../../../assets/images/logo.png'
//components
import Reported from './reportedPosts'
import PostManager from './postsManager'
import AccountManager from './account'
import Dashboard from './dashboard'
import PermissionManager from './permissionManager'
import { withRouter } from 'react-router-dom'

const { Content, Sider } = Layout

function Index({ history }) {
	const [activeMenu, setActiveMenu] = useState('1')
	const menuText = [
		'Dashboard',
		'Reported Posts',
		'Post ',
		'Account ',
		'Permission ',
	]

	const loggOut = () => {
		localStorage.clear()
		history.push('/login')
	}

	return (
		<>
			<Layout>
				<Layout>
					<Sider width={200} style={{ background: '#fff' }}>
						<img src={Logo} className="logo_admin" />
						<Menu
							mode="inline"
							defaultSelectedKeys={['1']}
							onSelect={(e) => setActiveMenu(e.key)}
							style={{
								borderRight: 0,
								display: 'flex',
								flexDirection: 'column',
								paddingTop: '4em',
								overflowX: 'hidden'
							}}
						>
							<Menu.Item key="1">
								<HomeOutlined />
                &nbsp;&nbsp;Dashboard
							</Menu.Item>
							<Menu.Item key="2">
								<CarryOutOutlined />
                &nbsp;&nbsp;Reported Posts
							</Menu.Item>
							<Menu.Item key="3">
								<InboxOutlined />
                &nbsp;&nbsp;Post
							</Menu.Item>
							<Menu.Item key="4">
								<TeamOutlined />
                &nbsp;&nbsp;Account
							</Menu.Item>
							<Menu.Item key="5">
								<CrownOutlined />
                &nbsp;&nbsp;Permission
							</Menu.Item>
							<Menu.Item
								key="6"
								style={{ position: 'absolute', bottom: 0 }}
								onClick={() => loggOut()}
							>
								<LogoutOutlined />
                &nbsp;&nbsp;Logout
							</Menu.Item>
						</Menu>
					</Sider>
					<Layout style={{ padding: '0 24px 24px' }}>
						<h1 style={{ fontSize: 'large', marginTop: '2em' }}>
							{menuText[activeMenu - 1]}
						</h1>
						<Content
							style={{
								background: '#fff',
								padding: '24px 0 0 0',
								margin: 0,
								minHeight: 280,
								overflow: 'hidden',
							}}
						>
							{activeMenu === '1' && (
								<>
									<Dashboard />
								</>
							)}
							{activeMenu === '2' && (
								<>
									<Reported />
								</>
							)}
							{activeMenu === '3' && (
								<>
									<PostManager />
								</>
							)}
							{activeMenu === '4' && (
								<>
									<AccountManager />
								</>
							)}
							{activeMenu === '5' && (
								<>
									<PermissionManager />
								</>
							)}
						</Content>
					</Layout>
				</Layout>
			</Layout>
		</>
	)
}

export default withRouter(Index)
