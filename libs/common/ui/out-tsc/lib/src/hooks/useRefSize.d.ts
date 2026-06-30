/**
 * NOTE: the values of `width` & `height` starts at 0, since ref takes a rendering cycle to attach.
 * @param deferred - When true, returns deferred values that update less frequently to improve performance
 * @returns
 */
export declare function useRefSize(deferred?: boolean): {
    width: number;
    height: number;
    ref: import("react").MutableRefObject<HTMLElement | undefined>;
};
//# sourceMappingURL=useRefSize.d.ts.map