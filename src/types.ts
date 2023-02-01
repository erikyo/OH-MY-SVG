/** the svg component prop */
export interface SvgAttributesDef {
	svg: string;
	href?: string;
	width: number | string;
	height: number | string;
	rotation?: number;
	align?: string;
	style?: {};
	classNames?: string[];
	linkTarget?: string;
}

/** the svg component prop */
export interface SvgAttributesEditor extends SvgAttributesDef {
	originalSvg?: string; // the original Svg before changes
	rel?: string; // stores whether the link opens into a new window
	fileData?: SvgFileDef;
	alt?: string;
}

/** the svg component prop */
export interface SvgAttributesSave extends SvgAttributesDef {
	className?: string;
}

export interface SvgImgAttributesDef extends SvgAttributesDef {
	svgBase64: string;
}

export type SvgSizeDef = {
	width?: number | string;
	height?: number | string;
};

export type SvgColorDef = {
	color: string;
	name: string;
};

export type SvgFileDef = {
	name: string;
	size: number;
	type: string;
	lastModified: number;
};

export type SvgStrokeDef = {
	svgMarkup: string;
	pathStrokeWith?: number;
	pathStrokeColor?: string;
	pathStrokeEl?: string[];
};
