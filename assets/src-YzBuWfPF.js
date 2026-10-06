import{n as e,s as t}from"./prop-types-C98rxrTl.js";import{S as n,h as r,wt as i,zt as a}from"./src-Bj9gIW9D.js";import{An as o,At as s,D as c,Da as l,En as u,Ft as d,K as f,Lr as p,Ua as m,Vn as h,cn as g,ct as _,ft as v,in as y,mn as b,n as x,on as S,ot as C,rn as w,sn as T,tn as E,x as D,xn as O}from"./src-C68SIDZa.js";import{G as k,Xr as A,di as j,ei as M,oi as N,wi as P}from"./index-6jR7n5cg.js";var F=t(e((e=>{var t=p();Object.defineProperty(e,"__esModule",{value:!0}),e.default=void 0;var n=t(w()),r=l();e.default=(0,n.default)((0,r.jsx)(`path`,{d:`M16.01 11H4v2h12.01v3L20 12l-3.99-4z`}),`ArrowRightAlt`)}))()),I=t(m()),L=t(P());function R(){L.default.send({hitType:`pageview`,page:`/doc`});let{params:{currentTab:e}}=v(`/doc/:currentTab`)??{params:{currentTab:``}};return g(y,{children:[g(O,{container:!0,sx:{px:2,py:1},children:[T(O,{item:!0,flexGrow:1,children:T(h,{variant:`h6`,children:`Documentation`})}),T(O,{item:!0,children:T(h,{variant:`h6`,children:T(s,{color:`info`,children:`Version 3`})})})]}),T(a,{}),T(u,{children:g(O,{container:!0,spacing:1,children:[T(O,{item:!0,xs:12,md:2,children:T(y,{bgt:`light`,sx:{height:`100%`},children:g(M,{orientation:`vertical`,value:e,"aria-label":`Documentation Navigation`,sx:{borderRight:1,borderColor:`divider`},children:[T(N,{label:`Overview`,value:``,component:A,to:``}),T(N,{label:`Key naming convention`,value:`KeyNaming`,component:A,to:`KeyNaming`}),T(N,{label:T(`code`,{children:`StatKey`}),value:`StatKey`,component:A,to:`StatKey`}),T(N,{label:T(`code`,{children:`ArtifactSetKey`}),value:`ArtifactSetKey`,component:A,to:`ArtifactSetKey`}),T(N,{label:T(`code`,{children:`CharacterKey`}),value:`CharacterKey`,component:A,to:`CharacterKey`}),T(N,{label:T(`code`,{children:`WeaponKey`}),value:`WeaponKey`,component:A,to:`WeaponKey`}),T(N,{label:T(`code`,{children:`MaterialKey`}),value:`MaterialKey`,component:A,to:`MaterialKey`}),T(N,{label:`Version History`,value:`VersionHistory`,component:A,to:`VersionHistory`})]})})}),T(O,{item:!0,xs:12,md:10,children:T(y,{bgt:`light`,sx:{height:`100%`},children:T(u,{children:T(I.Suspense,{fallback:T(b,{variant:`rectangular`,width:`100%`,height:600}),children:g(_,{children:[T(C,{index:!0,element:T(U,{})}),T(C,{path:`/VersionHistory`,element:T(X,{})}),T(C,{path:`/MaterialKey`,element:T(Y,{})}),T(C,{path:`/ArtifactSetKey`,element:T(K,{})}),T(C,{path:`/WeaponKey`,element:T(J,{})}),T(C,{path:`/CharacterKey`,element:T(q,{})}),T(C,{path:`/StatKey`,element:T(G,{})}),T(C,{path:`/KeyNaming`,element:T(W,{})})]})})})})})]})})]})}var z=`interface IGOOD {
  format: "GOOD" // A way for people to recognize this format.
  version: number // GOOD API version.
  source: string // The app that generates this data.
  characters?: ICharacter[]
  artifacts?: IArtifact[]
  weapons?: IWeapon[]
  materials?: { // Added in version 2
    [key:MaterialKey]: number
  }
}`,B=`interface IArtifact {
  setKey: SetKey //e.g. "GladiatorsFinale"
  slotKey: SlotKey //e.g. "plume"
  level: number //0-20 inclusive
  rarity: number //1-5 inclusive
  mainStatKey: StatKey
  location: CharacterKey|"" //where "" means not equipped.
  lock: boolean //Whether the artifact is locked in game.
  substats: ISubstat[]
  // Below are new to GOOD 3
  totalRolls?: number // 3-9 for valid 5* artifacts; includes starting rolls
  astralMark?: boolean // Favorite star in-game
  elixirCrafted?: boolean // Flag for if the artifact was created using Sanctifying Elixir. This guarantees the main stat + 2 additional rolls on the first 2 substats
  unactivatedSubstats?: ISubstat[] // Unactivated substat(s). Once a substat is activated, it should be moved to \`substats\` instead
}

interface ISubstat {
  key: StatKey //e.g. "critDMG_"
  value: number //e.g. 19.4
  // Below is new to GOOD 3
  initialValue?: number // Initial roll of the artifact, if it is known. This includes the first roll of this stat, even if it was not revealed initially e.g. from \`unactivatedSubstats\`
}

type SlotKey = "flower" | "plume" | "sands" | "goblet" | "circlet"`,V=`interface IWeapon {
  key: WeaponKey //"CrescentPike"
  level: number //1-90 inclusive
  ascension: number //0-6 inclusive. need to disambiguate 80/90 or 80/80
  refinement: number //1-5 inclusive
  location: CharacterKey | "" //where "" means not equipped.
  lock: boolean //Whether the weapon is locked in game.
}`,H=`interface ICharacter {
  key: CharacterKey //e.g. "Rosaria"
  level: number //1-100 inclusive
  constellation: number //0-6 inclusive
  ascension: number //0-6 inclusive. need to disambiguate 80/90 or 80/80
  talent: { //does not include boost from constellations. 1-15 inclusive
    auto: number
    skill: number
    burst: number
  }
}`;function U(){return g(S,{children:[T(h,{gutterBottom:!0,variant:`h4`,children:`Genshin Open Object Description (GOOD)`}),g(h,{gutterBottom:!0,children:[T(`strong`,{children:`GOOD`}),` is a data format description to map Genshin Data into a parsable JSON. This is intended to be a standardized format to allow Genshin developers/programmers to transfer data without needing manual conversion.`]}),T(h,{gutterBottom:!0,children:`As of version 6.0.0, Genshin Optimizer's database export conforms to this format.`}),T(E,{text:z}),T(`br`,{}),T(h,{gutterBottom:!0,variant:`h4`,children:`Artifact data representation`}),T(E,{text:B}),T(`br`,{}),T(h,{gutterBottom:!0,variant:`h4`,children:`Weapon data representation`}),T(E,{text:V}),T(`br`,{}),T(h,{gutterBottom:!0,variant:`h4`,children:`Character data representation`}),T(E,{text:H})]})}function W(){return g(y,{children:[T(u,{children:T(h,{children:`Key Naming Convention`})}),T(a,{}),g(u,{children:[g(h,{gutterBottom:!0,children:[`The keys in the GOOD format, like Artifact sets, weapon keys, character keys, are all in `,T(`strong`,{children:`PascalCase`}),`. This makes the name easy to derive from the in-game text, assuming no renames occur. If a rename is needed, then the standard will have to increment versions. (Last change was in 1.2 when the Prototype weapons were renamed)`]}),g(h,{gutterBottom:!0,children:[` `,`To derive the PascalKey from a specific name, remove all symbols from the name, and Capitalize each word:`]}),g(h,{children:[T(`code`,{children:`Gladiator's Finale`}),` `,T(F.default,{sx:{verticalAlign:`bottom`}}),` `,T(`code`,{children:`GladiatorsFinale`})]}),g(h,{children:[T(`code`,{children:`Spirit Locket of Boreas`}),` `,T(F.default,{sx:{verticalAlign:`bottom`}}),` `,T(`code`,{children:`SpiritLocketOfBoreas`})]}),g(h,{children:[T(`code`,{children:`"The Catch"`}),` `,T(F.default,{sx:{verticalAlign:`bottom`}}),` `,T(`code`,{children:`TheCatch`})]})]})]})}function G(){let{t:e}=d(`statKey_gen`),t=`type StatKey\n  = ${[`hp`,`hp_`,`atk`,`atk_`,`def`,`def_`,`eleMas`,`enerRech_`,`heal_`,`critRate_`,`critDMG_`,`physical_dmg_`,`anemo_dmg_`,`geo_dmg_`,`electro_dmg_`,`hydro_dmg_`,`pyro_dmg_`,`cryo_dmg_`,`dendro_dmg_`].map(t=>`"${t}" //${e(t)}${k(t)}`).join(`
  | `)}`;return g(S,{children:[T(h,{gutterBottom:!0,variant:`h4`,children:`StatKey`}),T(E,{text:t})]})}function K(){let{t:e}=d(`artifactNames_gen`),t=`type ArtifactSetKey\n  = ${[...new Set(f)].sort().map(t=>`"${t}" //${e(`artifactNames_gen:${t}`)}`).join(`
  | `)}`;return g(S,{children:[T(h,{gutterBottom:!0,variant:`h4`,children:`ArtifactSetKey`}),T(E,{text:t})]})}function q(){let{t:e}=d(`charNames_gen`),t=n(),{gender:i}=r(),a=`type CharacterKey\n  = ${[...new Set(D)].sort().map(n=>`"${n}" //${e(`charNames_gen:${c(t.chars.LocationToCharacterKey(n),i)}`)}`).join(`
  | `)}`;return g(S,{children:[T(h,{gutterBottom:!0,variant:`h4`,children:`CharacterKey`}),T(E,{text:a})]})}function J(){let{t:e}=d(`weaponNames_gen`),t=`type WeaponKey\n  = ${[...new Set(x)].sort().map(t=>`"${t}" //${e(`weaponNames_gen:${t}`)}`).join(`
  | `)}`;return g(S,{children:[T(h,{gutterBottom:!0,variant:`h4`,children:`WeaponKey`}),T(E,{text:t})]})}function Y(){let{t:e}=d(`material_gen`),t=`type MaterialKey\n  = ${Object.keys(i.material).sort().map(t=>`"${t}" // ${e(`${t}.name`)}`).join(`
  | `)}`;return g(S,{children:[T(h,{gutterBottom:!0,variant:`h4`,children:`MaterialKey`}),g(h,{gutterBottom:!0,children:[`The item names are taken from the english translation, and then converted into`,` `,T(j,{component:A,to:`KeyNaming`,children:T(`code`,{children:`PascalCase`})}),`.`]}),T(E,{text:t})]})}function X(){return g(o,{display:`flex`,flexDirection:`column`,gap:2,children:[T(h,{gutterBottom:!0,variant:`h4`,children:`Version History`}),g(y,{children:[T(u,{children:T(h,{children:`Version 1`})}),T(a,{}),T(u,{children:g(h,{children:[`Created general `,T(`code`,{children:`IGOOD`}),` format with character, weapon, artifact fields.`]})})]}),g(y,{children:[T(u,{children:T(h,{children:`Version 2`})}),T(a,{}),T(u,{children:g(h,{children:[`Adds `,T(`code`,{children:`materials`}),` field to `,T(`code`,{children:`IGOOD`}),`. All other fields remain the same. V2 is backwards compatible with V1.`]})})]}),g(y,{children:[T(u,{children:T(h,{children:`Version 3`})}),T(a,{}),T(u,{children:g(h,{children:[`Adds new fields to `,T(`code`,{children:`IArtifact`}),` to represent new in-game properties, store initial rolls for reroll information, and help differentiate between 3 and 4-line starts for 5* artifacts. All other fields remain the same. V3 is backwards compatible with V2.`,T(`br`,{}),`New fields for `,T(`code`,{children:`IArtifact`}),`:`,` `,T(`code`,{children:`totalRolls, astralMark, elixirCrafted, unactivatedSubstats`}),T(`br`,{}),`New field for `,T(`code`,{children:`ISubstat`}),`: `,T(`code`,{children:`initialValue`})]})})]})]})}export{R as default};