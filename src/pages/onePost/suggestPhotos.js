import React from 'react'
import ImageGrid from '@components/imageGrid'

const SuggestPhotos = ({ keywords }) => {
	return (
		<div className="suggest-grid">
			<h3>More photos like this</h3>
			<ImageGrid query="search" keywords={keywords} />
		</div>
	)
}

export default SuggestPhotos
