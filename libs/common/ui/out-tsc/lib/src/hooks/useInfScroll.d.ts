/**
 * A utility function to help implementation of an infinite scroll.
 * @param increment the increment to increase every time the scroll element is triggered
 * @param max the maximum number of elements
 * @returns {Object}
 */
export declare function useInfScroll(increment: number, max: number): {
    numShow: number;
    setTriggerElement: import("react").Dispatch<import("react").SetStateAction<HTMLElement | undefined>>;
};
//# sourceMappingURL=useInfScroll.d.ts.map