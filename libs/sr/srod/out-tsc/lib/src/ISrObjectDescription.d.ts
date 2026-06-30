import type { ICharacter, ILightCone, IRelic } from '@genshin-optimizer/sr-schema';
export type ISrObjectDescription = {
    format: string;
    source: string;
    version: 1;
    characters?: ICharacter[];
    relics?: IRelic[];
    lightCones?: ILightCone[];
};
//# sourceMappingURL=ISrObjectDescription.d.ts.map