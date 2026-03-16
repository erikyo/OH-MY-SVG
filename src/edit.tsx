import { useEffect, useRef, useState } from '@wordpress/element';
import {
	Button,
	ColorPalette,
	FormFileUpload,
	Panel,
	PanelBody,
	PanelRow,
	Placeholder,
	Popover,
	RangeControl,
	ResizableBox,
	TextareaControl,
	TextControl,
	ToolbarButton,
	ToolbarGroup,
	Spinner,
} from '@wordpress/components';
import {
	__experimentalImageSizeControl as ImageSizeControl,
	BlockControls,
	BlockIcon,
	InspectorControls,
	LinkControl,
	store as blockEditorStore,
	useBlockProps,
} from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { link, linkOff, pencil, upload } from '@wordpress/icons';
import { useDispatch, useSelect } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { BlockEditProps } from '@wordpress/blocks';
import apiFetch from '@wordpress/api-fetch';

// Local imports
import getSVG from './Svg';
import {
	collectColors,
	getSvgSize,
	loadSvg,
	optimizeSvg,
	readSvg,
	svgAddPathStroke,
	svgRemoveFill,
	updateColor,
} from './utils/svgTools';
import { svgToPngBlob } from './utils/canvas';
import { hasAlign, scaleProportionally } from './utils/fn';
import { rotationRangePresets } from './utils/presets';
import { svgIcon } from './utils/icons';
import { ALLOWED_MEDIA_TYPES, NEW_TAB_REL } from './constants';
import { SvgoStats } from './utils/components';
import { SvgAttributesEditor, SvgColorDef, SvgSizeDef } from './types';

// Extend attributes interface to include mediaId
interface ExtendedAttributes extends SvgAttributesEditor {
	mediaId?: number;
	mediaUrl?: string;
	storage?: 'inline' | 'media';
}

export const Edit = (props: BlockEditProps<ExtendedAttributes>): JSX.Element => {
	const { attributes, setAttributes, isSelected } = props;
	const {
		mediaId,
		storage,
		align,
		height,
		width,
		rotation,
		href,
		linkTarget,
		rel,
		svg,
		originalSvg,
	} = attributes;

	const { toggleSelection } = useDispatch(blockEditorStore);
	const { createErrorNotice, createSuccessNotice } = useDispatch(noticesStore);

	const ref = useRef<HTMLDivElement>(null);

	// State
	const [isEditingURL, setIsEditingURL] = useState(false);
	const [isUploading, setIsUploading] = useState(false);
	const [maxWidth, setMaxWidth] = useState<number | undefined>(undefined);
	const [colors, setColors] = useState<SvgColorDef[]>([]);
	const [currentColor, setColor] = useState<string>('');
	const [pathStrokeWith, setPathStrokeWith] = useState<number>(1.0);
	const [originalSize, setOriginalSize] = useState<SvgSizeDef>({ width: 0, height: 0 });

	// Local SVG is the source of truth for the editor view
	const [localSvg, setLocalSvg] = useState<string>(svg);

	const isURLSet = !!href;
	const opensInNewTab = linkTarget === '_blank';

	const defaultLayout = useSelect((select) => {
		const settings = select(blockEditorStore).getSettings();
		return settings.layout || {};
	}, []);

	const contentWidth = defaultLayout.contentSize ? parseInt(defaultLayout.contentSize) : 1200;

	// --- 1. HANDLE UPLOAD & CONVERSION LOGIC ---
	const handleSaveToLibrary = async () => {
		const contentToSave = localSvg || svg;
		if (!contentToSave) {
			return;
		}

		setIsUploading(true);

		try {
			// A. Convert SVG to PNG Blob
			// Use current width/height or default to 300x300 for the proxy image
			const w = typeof width === 'number' ? width : 300;
			const h = typeof height === 'number' ? height : 300;

			const pngBlob = await svgToPngBlob(contentToSave, w, h);
			if (!pngBlob) {
				throw new Error('Conversion failed');
			}

			// B. Upload PNG to Media Library
			const filename = `svg-proxy-${Date.now()}.png`;
			const file = new File([pngBlob], filename, { type: 'image/png' });

			const uploadedMedia: any = await apiFetch({
				path: '/wp/v2/media',
				method: 'POST',
				body: file,
				headers: {
					'Content-Disposition': `attachment; filename="${filename}"`,
				},
			});

			if (!uploadedMedia || !uploadedMedia.id) {
				throw new Error('Upload failed');
			}

			// C. Update the Media Attachment with SVG Data (Meta)
			// This saves the RAW SVG string into the attachment's meta field
			await apiFetch({
				path: `/wp/v2/media/${uploadedMedia.id}`,
				method: 'POST',
				data: {
					meta: {
						_oh_my_svg_data: contentToSave,
					},
					alt_text: 'SVG Proxy Image',
					title: 'SVG Proxy',
				},
			});

			// D. Update Block Attributes
			setAttributes({
				mediaId: uploadedMedia.id,
				storage: 'media',
				svg: '', // Clear inline SVG to save space in post_content
			});

			createSuccessNotice(__('SVG converted and saved to Media Library!'));
		} catch (error: any) {
			console.error(error);
			createErrorNotice(error.message || __('Error saving to Media Library'));
		} finally {
			setIsUploading(false);
		}
	};

	const handleDisconnectMedia = async () => {
		if (!mediaId) {
			return;
		}
		setIsUploading(true);
		try {
			await apiFetch({
				path: `/wp/v2/media/${mediaId}`,
				method: 'DELETE',
				data: { force: true },
			});

			setAttributes({
				mediaId: 0,
				storage: 'inline',
				svg: localSvg,
			});
			createSuccessNotice(__('Unlinked and deleted from Media Library'));
		} catch (error: any) {
			console.error(error);
			createErrorNotice(error.message || __('Error deleting media'));
		} finally {
			setIsUploading(false);
		}
	};

	// --- 2. EFFECTS ---

	// On Mount: If we have a mediaId but no localSvg, fetch it from the API
	useEffect(() => {
		const fetchSvgFromMedia = async () => {
			if (storage === 'media' && mediaId && !localSvg) {
				try {
					const media: any = await apiFetch({ path: `/wp/v2/media/${mediaId}` });
					if (media?.meta?._oh_my_svg_data) {
						setLocalSvg(media.meta._oh_my_svg_data);
						// Also update originalSvg if missing
						if (!originalSvg) {
							setAttributes({ originalSvg: media.meta._oh_my_svg_data });
						}
					}
				} catch (e) {
					console.error('Could not fetch linked SVG data');
				}
			} else if (svg) {
				setLocalSvg(svg);
			}
		};
		fetchSvgFromMedia();
	}, []);

	useEffect(() => {
		if (!isSelected) {
			setIsEditingURL(false);
		}
	}, [isSelected]);

	useEffect(() => {
		if (localSvg) {
			const newColors = collectColors(localSvg);
			setColors(newColors);
			if (newColors.length > 0 && !currentColor) {
				setColor(newColors[0].color);
			}
		}
	}, [localSvg]);

	useEffect(() => {
		if (!align) {
			return;
		}
		const getContentMaxWidth = () => {
			if (align?.includes('wide')) {
				return defaultLayout.wideSize ? parseInt(defaultLayout.wideSize) : undefined;
			}
			return undefined;
		};
		if (isSelected && !height && !width && ref.current) {
			const rect = ref.current.getBoundingClientRect();
			setAttributes({ width: rect.width, height: rect.height });
		}
		setMaxWidth(getContentMaxWidth());
	}, [align, isSelected, defaultLayout]);

	useEffect(() => {
		if (svg && !originalSvg) {
			setAttributes({ originalSvg: svg });
		}
		const source = svg || localSvg;
		if (source) {
			setOriginalSize(getSvgSize(source));
		}
	}, []);

	// --- 3. HELPER FUNCTIONS ---

	const updateSvgData = (newSvgData: Partial<SvgAttributesEditor>) => {
		if (!newSvgData.svg) {
			return;
		}

		const newSvgSize = { width: newSvgData.width, height: newSvgData.height };
		setOriginalSize(newSvgSize);

		let calculatedSize = newSvgSize;
		if (typeof newSvgData.width === 'number' && newSvgData.width >= contentWidth) {
			calculatedSize = {
				width: contentWidth,
				height: scaleProportionally(width, height, contentWidth),
			};
		}

		setAttributes({
			originalSvg: newSvgData.svg,
			storage: 'inline',
			mediaId: 0,
			...newSvgData,
			...calculatedSize,
		} as ExtendedAttributes);
		setLocalSvg(newSvgData.svg);
	};

	const processSvgContent = (content: string, file?: File) => {
		const processed = loadSvg({ newSvg: content, fileData: file, oldSvg: attributes });
		if (processed) {
			updateSvgData(processed);
		} else {
			createErrorNotice(__('😓 Cannot process SVG!'));
		}
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = event.target.files;
		if (!files || files.length === 0) {
			return;
		}
		const file = files[0];
		readSvg(file).then((content) => {
			if (content) {
				processSvgContent(content, file);
			}
		}).catch((err) => {
			console.error(err);
			createErrorNotice(__('Error reading file'));
		});
	};

	const setToggleOpenInNewTab = (value: boolean) => {
		const newLinkTarget = value ? '_blank' : undefined;
		let updatedRel = rel;
		if (newLinkTarget && !rel) {
			updatedRel = NEW_TAB_REL;
		} else if (!newLinkTarget && rel === NEW_TAB_REL) {
			updatedRel = undefined;
		}
		return { linkTarget: newLinkTarget, rel: updatedRel };
	};
	const startEditing = (event: React.MouseEvent) => {
		event.preventDefault(); setIsEditingURL(true);
	};
	const unlink = () => {
		setAttributes({ href: undefined, linkTarget: undefined, rel: undefined }); setIsEditingURL(false);
	};
	const blockProps = useBlockProps({ ref });

	// --- 4. RENDER ---

	// A. EMPTY STATE
	if (!localSvg) {
		return (
			<div {...blockProps}>
				<Placeholder
					icon={<BlockIcon icon={svgIcon} />}
					label={__('SVG')}
					instructions={__('Upload an SVG file to get started.')}
				>
					<div className="components-upload-btn-wrapper" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
						<FormFileUpload
							onChange={handleFileUpload}
							accept={ALLOWED_MEDIA_TYPES.join(',')}
							icon={upload}
						>
							{__('Upload SVG')}
						</FormFileUpload>

						<span style={{ color: '#757575' }}>{__('or')}</span>

						<TextControl
							className="components-placeholder__input"
							placeholder={__('Paste SVG markup...')}
							value={svg || ''}
							onChange={(val) => processSvgContent(val)}
							hideLabelFromVision
							label={__('SVG Markup')}
						/>
					</div>
				</Placeholder>
			</div>
		);
	}

	// B. FILLED STATE
	return (
		<div {...blockProps}>
			<InspectorControls>
				<Panel>
					<PanelBody title="Settings">
						<ImageSizeControl
							width={width}
							height={height}
							imageWidth={originalSize.width}
							imageHeight={originalSize.height}
							onChange={(nextDimensions: SvgSizeDef) => {
								setAttributes({
									width: typeof nextDimensions.width === 'string' ? parseInt(nextDimensions.width) : nextDimensions.width,
									height: typeof nextDimensions.height === 'string' ? parseInt(nextDimensions.height) : nextDimensions.height,
								});
							}}
							slug={'custom'}
						/>
						<RangeControl
							label={__('Rotation')}
							value={rotation || 0}
							min={-180}
							max={180}
							marks={rotationRangePresets}
							step={1}
							onChange={(ev) => setAttributes({ rotation: Number(ev) })}
						/>
					</PanelBody>

					<PanelBody title="Optimization">
						<PanelRow>
							<p>
								SVGO <SvgoStats original={originalSvg} compressed={localSvg} />
							</p>
							<Button
								isSmall={true}
								variant={'primary'}
								onClick={() => {
									const optimized = optimizeSvg(localSvg);
									setLocalSvg(optimized);
									// If stored in media, warn user they need to save again
									if (storage === 'media') {
										createErrorNotice('SVG modified. Click "Update Media" to save to library.');
									} else {
										setAttributes({ svg: optimized });
									}
								}}
							>
								{__('Optimize')}
							</Button>
						</PanelRow>
						<PanelRow>
							<p>{__('Restore Original')}</p>
							<Button
								disabled={!originalSvg}
								isSmall={true}
								variant={'secondary'}
								onClick={() => {
									setLocalSvg(originalSvg || '');
									if (storage !== 'media') {
										setAttributes({ svg: originalSvg });
									}
								}}
							>
								{__('Reset')}
							</Button>
						</PanelRow>
						<hr />

						{/* STORAGE CONTROLS */}
						<PanelRow>
							<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
								<span>{storage === 'media' ? '✅ Linked to Media' : '⚠️ Inline SVG'}</span>
								<div style={{ display: 'flex', gap: '5px' }}>
									{storage === 'media' && (
										<Button
											isSmall
											variant="secondary"
											isDestructive
											onClick={handleDisconnectMedia}
										>
											{__('Unlink')}
										</Button>
									)}
									<Button
										isSmall
										variant="primary"
										isBusy={isUploading}
										disabled={isUploading}
										onClick={handleSaveToLibrary}
									>
										{isUploading ? <Spinner /> : (storage === 'media' ? __('Update Media') : __('Save to Library'))}
									</Button>
								</div>
							</div>
						</PanelRow>

						<hr />
						<TextareaControl
							label={__('SVG Markup Editor')}
							value={localSvg || ''}
							onChange={(newSvg) => {
								setLocalSvg(newSvg);
								if (storage !== 'media') {
									setAttributes({ svg: newSvg });
								}
							}}
							rows={5}
						/>
					</PanelBody>

					<PanelBody title={'Tools'} initialOpen={false}>
						<PanelRow>
							<Button
								isSmall
								variant="secondary"
								onClick={() => {
									const noFill = svgRemoveFill(localSvg);
									setLocalSvg(noFill);
									if (storage !== 'media') {
										setAttributes({ svg: noFill });
									}
								}}
							>
								{__('Remove Fill')}
							</Button>
							<Button
								isSmall
								variant="secondary"
								onClick={() => {
									const stroked = svgAddPathStroke({
										svgMarkup: localSvg,
										pathStrokeWith,
										pathStrokeColor: currentColor || undefined,
									});
									setLocalSvg(stroked);
									if (storage !== 'media') {
										setAttributes({ svg: stroked });
									}
								}}
							>
								{__('Add Stroke')}
							</Button>
						</PanelRow>
						<RangeControl
							label={'Stroke Size'}
							value={pathStrokeWith}
							onChange={(e) => setPathStrokeWith(e || 1)}
							min={0}
							max={20}
							step={0.1}
						/>
					</PanelBody>

					<PanelBody title="Colors">
						<ColorPalette
							enableAlpha={true}
							clearable={false}
							colors={colors}
							value={currentColor}
							onChange={(newColor) => {
								if (newColor) {
									const newSvg = updateColor(localSvg, newColor, currentColor);
									setLocalSvg(newSvg);
									setColor(newColor);
									if (storage !== 'media') {
										setAttributes({ svg: newSvg });
									}
								}
							}}
						/>
					</PanelBody>
				</Panel>
			</InspectorControls>

			<BlockControls>
				<ToolbarGroup>
					{!isURLSet ? (
						<ToolbarButton
							icon={link}
							title={__('Link')}
							onClick={startEditing}
						/>
					) : (
						<>
							<ToolbarButton
								icon={linkOff}
								title={__('Unlink')}
								onClick={unlink}
								isActive={true}
							/>
							<ToolbarButton
								icon={pencil}
								title={__('Edit Link')}
								onClick={startEditing}
							/>
						</>
					)}

					{/* Toolbar Replace Button */}
					<FormFileUpload
						render={({ openFileDialog }) => (
							<ToolbarButton
								icon={upload}
								label={__('Replace')}
								onClick={openFileDialog}
							/>
						)}
						accept={ALLOWED_MEDIA_TYPES.join(',')}
						onChange={handleFileUpload}
					/>
				</ToolbarGroup>
			</BlockControls>

			{isSelected && isEditingURL && (
				<Popover
					position="bottom center"
					onClose={() => setIsEditingURL(false)}
					anchor={ref.current}
				>
					<LinkControl
						value={{ url: href, opensInNewTab }}
						onChange={({ url = '', opensInNewTab: newTab = false }) => {
							let toggleMeta = {};
							if (opensInNewTab !== newTab) {
								toggleMeta = setToggleOpenInNewTab(newTab);
							}
							setAttributes({ ...toggleMeta, href: url });
						}}
						onRemove={unlink}
					/>
				</Popover>
			)}

			<ResizableBox
				size={{
					width: hasAlign(align, ['full', 'wide']) ? '100%' : width,
					height: hasAlign(align, ['full', 'wide']) ? 'auto' : height,
				}}
				style={{
					margin: hasAlign(align, ['center']) ? 'auto' : undefined,
					display: hasAlign(align, ['center']) ? 'flex' : undefined,
					justifyContent: hasAlign(align, ['center']) ? 'center' : undefined,
				}}
				showHandle={isSelected && align !== 'full'}
				minHeight={20}
				minWidth={20}
				maxWidth={maxWidth}
				lockAspectRatio
				enable={!hasAlign(align, ['full', 'wide']) ? {
					top: false,
					right: !hasAlign(align, 'right'),
					bottom: true,
					left: !hasAlign(align, 'left'),
				} : undefined}
				onResizeStop={async (e, direction, ref, delta) => {
					setAttributes({
						width: typeof width === 'number' ? width + delta.width : delta.width,
						height: typeof height === 'number' ? height + delta.height : delta.height,
					});
					await toggleSelection(true);
				}}
				onResizeStart={() => {
					toggleSelection(false);
				}}
			>
				<div
					style={{ display: 'flex', width: '100%', height: '100%' }}
					dangerouslySetInnerHTML={getSVG({ ...attributes, svg: localSvg })}
				/>
			</ResizableBox>
		</div>
	);
};
