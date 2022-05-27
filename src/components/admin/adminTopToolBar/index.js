import React from 'react'
import {
	ReloadOutlined,
} from '@ant-design/icons'

import './index.scss'

//const { Search } = Input
const TopToolBar = ({ refetch }) => {
	//const [isGrid, setIsGrid] = useState(false)

	// const changeViewHandler = () => {
	// 	changeView()
	// 	setIsGrid(!isGrid)
	// }

	return (
		<div className="top-bar">
			{/* <Search
				placeholder="Search..."
				style={{
					width: '15em',
					height: '50%',
					borderRadius: '30px',
					display: 'flex',
					alignItems: 'center',
				}}
			/> */}
			<ReloadOutlined
				style={{
					margin: '1em 0.5em',
					padding: '0.5em',
				}}
				onClick={() => refetch()}
				className="circle-icon"
			/>
			{/* {isGrid ? (
				<UnorderedListOutlined
					className="circle-icon"
					style={{
						margin: '1em 0',
						padding: '0.5em',
					}}
					onClick={() => changeViewHandler()}
				/>
			) : (
				<TableOutlined
					className="circle-icon"
					style={{
						margin: '1em 0',
						padding: '0.5em',
					}}
					onClick={() => changeViewHandler()}
				/>
			)} */}
		</div>
	)
}

export default TopToolBar
