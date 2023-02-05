/// <reference types="react" />
declare const _default: {
    supports: {
        align: boolean;
        anchor: boolean;
        className: boolean;
        color: {
            background: boolean;
            gradients: boolean;
        };
        spacing: {
            margin: boolean;
            padding: boolean;
            blockGap: boolean;
        };
    };
    attributes: {
        style: {
            type: string;
            default: {};
        };
        svg: {
            type: string;
            default: string;
        };
        originalSvg: {
            type: string;
            default: boolean;
        };
        url: {
            type: string;
            default: string;
        };
        height: {
            type: string;
            default: boolean;
        };
        width: {
            type: string;
            default: boolean;
        };
        rotation: {
            type: string;
            default: number;
        };
        colors: {
            type: string;
            default: never[];
        };
    };
    migrate(attributes: any): any;
    save(props: any): JSX.Element;
}[];
export default _default;
//# sourceMappingURL=deprecated.d.ts.map