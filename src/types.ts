/** the svg component prop */
export interface svgEditorDef {
	svg: string;
	originalSvg?: string;
	style: string[];
	className: string[];
	stroke: string[];
	name: string;
	alt: string;
	size: string;
	type: string;
	markup: string;
	filename: string;
}

export interface svgAttributesDef {
	svg: string;
	url?: string;
	width: number;
	height: number;
	rotation?: number;
	align?: string;
	style?: {};
	className?: string[];
	markup: string;
	filename: string;
}

/** the svg component prop */
export interface svgAttributesEditor extends svgAttributesDef {
	originalSvg?: string; // the original Svg before changes
	linkTarget?: string;
	rel?: string; // stores whether the link opens into a new window
}

export interface svgImgAttributesDef extends svgAttributesDef {
	svgBase64: string;
}

export interface svgSizes {
	width: number;
	height: number;
}

export type colorDef = {
	color: string;
	name: string;
};


export type fileDef = {
	name: string;
	size: number;
	type: string;
	lastModified: string;
};
