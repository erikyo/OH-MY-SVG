import { createHigherOrderComponent } from '@wordpress/compose';

/**
 * Component
 */
export const withClientIdClassName = createHigherOrderComponent(
	( BlockListBlock ) => {
		return ( props ) => {
			return (
				<BlockListBlock
					{ ...props }
					className={ 'block-' + props.clientId }
				/>
			);
		};
	},
	'withClientIdClassName'
);
