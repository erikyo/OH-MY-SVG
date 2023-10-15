import {
	// @ts-ignore
	__experimentalLinkControl as LinkControl,
	BlockControls,
} from '@wordpress/block-editor';
import {
	FormFileUpload,
	Popover,
	ToolbarButton,
	ToolbarGroup,
} from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ALLOWED_MEDIA_TYPES, NEW_TAB_REL } from '../utils/constants';
import { readSvg } from '../utils/svgTools';
import {
	useCallback,
	useEffect,
	useMemo,
	useState,
} from '@wordpress/element';

/**
 * A component that renders SVG controls.
 *
 * @param {Object}   props               - The component props.
 * @param {Object}   props.attributes    - The attributes of the SVG controls.
 * @param {Function} props.setAttributes - A function to set the attributes of the SVG controls.
 * @param {boolean}  props.isSelected    - A boolean value indicating if the SVG controls are selected.
 * @param {Function} props.updateSvg     - A function to update the SVG.
 * @param {Object}   props.SvgRef        - A reference to the SVG.
 * @return {JSX.Element} The rendered SVG controls component.
 */
function SvgControls( {
	attributes,
	setAttributes,
	isSelected,
	updateSvg,
	SvgRef,
} ) {
	/**
	 * @property {boolean} isEditingURL - a bool value that stores id the link panel is open
	 * @callback setIsEditingURL
	 */
	const { svg, href, linkTarget, rel, opensInNewTab, title } = attributes;
	const [ isEditingURL, setIsEditingURL ] = useState( false );
	const isURLSet = !! href;

	const memoizedValue = useMemo(
		() => ( {
			url: href,
			title,
			opensInNewTab,
			rel,
		} ),
		[ href, opensInNewTab, title, rel ]
	);

	const openLinkControl = () => {
		setIsEditingURL( true );
		return false;
	};

	/**
	 * Handle the checkbox state for "Open in new tab"
	 * If the user has checked the "Open in new tab" checkbox, then set the linkTarget attribute to "_blank" and the rel attribute to "noreferrer noopener".
	 * If the user has unchecked the "Open in new tab" checkbox, then set the linkTarget attribute to undefined and the rel attribute to undefined
	 *
	 * @param {boolean} value - The value of the url edit area.
	 */
	function setToggleOpenInNewTab( value: boolean ) {
		const newLinkTarget = value ? '_blank' : undefined;

		let updatedRel = rel;
		if ( newLinkTarget && ! rel ) {
			updatedRel = NEW_TAB_REL;
		} else if ( ! newLinkTarget && rel === NEW_TAB_REL ) {
			updatedRel = undefined;
		}

		return {
			linkTarget: newLinkTarget,
			rel: updatedRel,
		};
	}

	/**
	 * Checking if the block is selected.
	 * If it is not selected, it sets the isEditingURL state to false.
	 *
	 * @type {setIsEditingURL}
	 * @property {boolean} isSelected - if the svg has been selected
	 */
	useEffect( () => {
		if ( ! isSelected ) {
			setIsEditingURL( false );
		}
	}, [ isSelected ] );

	/**
	 * It sets the attributes of the block to undefined, and then sets the state of the block to not editing the URL
	 */
	const unlinkItem = () => {
		setAttributes( {
			href: undefined,
			linkTarget: undefined,
			rel: undefined,
			title: undefined,
			opensInNewTab: false,
		} );
		setIsEditingURL( false );
	};

	const onToggleOpenInNewTab = useCallback(
		( value ) => {
			const newLinkTarget = value ? '_blank' : undefined;

			let updatedRel = rel;
			if ( newLinkTarget && ! rel ) {
				updatedRel = NEW_TAB_REL;
			} else if ( ! newLinkTarget && rel === NEW_TAB_REL ) {
				updatedRel = undefined;
			}

			setAttributes( {
				linkTarget: newLinkTarget,
				rel: updatedRel,
			} );
		},
		[ rel, setAttributes ]
	);

	return (
		<>
			{ svg && (
				<BlockControls>
					<ToolbarGroup>
						<ToolbarButton
							icon="admin-links"
							title={ __( 'Edit Link' ) }
							onClick={ openLinkControl }
							isActive={ isURLSet }
						/>
						<ToolbarButton
							icon="editor-unlink"
							title={ __( 'Unlink' ) }
							onClick={ unlinkItem }
							isDisabled={ ! isURLSet }
						/>
					</ToolbarGroup>
					<ToolbarGroup>
						<FormFileUpload
							type={ 'button' }
							title={ __( 'Replace SVG' ) }
							accept={ ALLOWED_MEDIA_TYPES[ 0 ] }
							multiple={ false }
							onChange={ ( ev ) => {
								const newFile: File | boolean =
									ev.target.files !== null
										? ev.target.files[ 0 ]
										: false;
								if ( newFile ) {
									readSvg( newFile ).then( ( newSvg ) => {
										if ( newSvg !== null ) {
											updateSvg( newSvg, newFile );
										}
									} );
								}
							} }
						>
							Replace
						</FormFileUpload>
					</ToolbarGroup>
				</BlockControls>
			) }

			{ isEditingURL && svg && (
				<Popover
					position="top"
					anchor={ SvgRef.current }
					focusOnMount={ isEditingURL ? 'firstElement' : false }
					onClose={ () => setIsEditingURL( false ) }
				>
					<LinkControl
						hasTextControl
						hasRichPreviews
						value={ memoizedValue }
						settings={ [
							{
								id: 'opensInNewTab',
								title: 'Opens in new tab',
							},
						] }
						onChange={ ( nextValue ) => {
							const {
								url: newHref = '',
								opensInNewTab: newOpensInNewTab,
								alt: newAlt = '',
								rel: newRel = '',
								title: newTitle = '',
							} = nextValue;

							setAttributes( {
								href: newHref,
								alt: newAlt,
								rel: newRel,
								title: newTitle,
							} );

							if (
								( linkTarget === '_blank' ) !==
								newOpensInNewTab
							) {
								onToggleOpenInNewTab( newOpensInNewTab );
							}

							setIsEditingURL( false );
						} }
					/>
				</Popover>
			) }
		</>
	);
}

export default SvgControls;
