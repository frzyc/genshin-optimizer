import { z } from 'zod';
export declare const zoodFormatSchema: z.ZodObject<{
    wengines: z.ZodOptional<z.ZodArray<any>>;
    characters: z.ZodOptional<z.ZodArray<any>>;
    discs: z.ZodOptional<z.ZodArray<any>>;
    format: z.ZodLiteral<"ZOOD">;
    version: z.ZodNumber;
    source: z.ZodOptional<z.ZodString>;
    exportDate: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export type ZOODFormat = z.infer<typeof zoodFormatSchema>;
export declare function validateZOODImport(obj: unknown): {
    success: true;
    data: {
        format: "ZOOD";
        version: number;
        wengines?: any[] | undefined;
        characters?: any[] | undefined;
        discs?: any[] | undefined;
        source?: string | undefined;
        exportDate?: number | undefined;
    };
    errors?: undefined;
} | {
    success: false;
    errors: {
        path: string;
        message: string;
    }[];
    data?: undefined;
};
//# sourceMappingURL=zood-format.d.ts.map