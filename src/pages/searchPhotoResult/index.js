import React from 'react'
import { withRouter } from 'react-router-dom'

//import components
import ImageGrid from '@components/imageGrid'

function SearchResult({
	match: {
		params: { keywords },
	},
}) {
	return (
		<div
			style={{
				width: '100vw',
			}}
		>
			<h1
				style={{
					padding: '1em 2em 0em 2em',
				}}
			>
				{keywords.split('-').map((v) => v.toUpperCase() + ' ')}
			</h1>
			<ImageGrid query="search" keywords={keywords.split('-')} />
		</div>
	)
}

export default withRouter(SearchResult)
