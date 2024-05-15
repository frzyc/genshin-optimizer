import{r as K,i as C,j as _,X as S,bV as w,p as t,V as m,q as e,T as a,a8 as x,D as f,w as n,bX as A,bW as d,L as c,s as r,d as O,a3 as k,bY as D,bZ as h,b$ as l,c0 as u,u as y,c1 as $,bo as B,b as G,bu as T,b2 as P,c2 as W,bU as I,c3 as M,W as j}from"./index-CGxZkPTz.js";import{L as N}from"./Link-CNjkQMIV.js";var v={},R=C;Object.defineProperty(v,"__esModule",{value:!0});var g=v.default=void 0,V=R(K()),L=_,q=(0,V.default)((0,L.jsx)("path",{d:"M16.01 11H4v2h12.01v3L20 12l-3.99-4z"}),"ArrowRightAlt");g=v.default=q;function ne(){S.send({hitType:"pageview",page:"/doc"});const{params:{currentTab:o}}=w("/doc/:currentTab")??{params:{currentTab:""}};return t(n,{children:[t(m,{container:!0,sx:{px:2,py:1},children:[e(m,{item:!0,flexGrow:1,children:e(a,{variant:"h6",children:"Documentation"})}),e(m,{item:!0,children:e(a,{variant:"h6",children:e(x,{color:"info",children:"Version. 2"})})})]}),e(f,{}),e(r,{children:t(m,{container:!0,spacing:1,children:[e(m,{item:!0,xs:12,md:2,children:e(n,{bgt:"light",sx:{height:"100%"},children:t(A,{orientation:"vertical",value:o,"aria-label":"Documentation Navigation",sx:{borderRight:1,borderColor:"divider"},children:[e(d,{label:"Overview",value:"",component:c,to:""}),e(d,{label:"Key naming convention",value:"KeyNaming",component:c,to:"KeyNaming"}),e(d,{label:e("code",{children:"StatKey"}),value:"StatKey",component:c,to:"StatKey"}),e(d,{label:e("code",{children:"ArtifactSetKey"}),value:"ArtifactSetKey",component:c,to:"ArtifactSetKey"}),e(d,{label:e("code",{children:"CharacterKey"}),value:"CharacterKey",component:c,to:"CharacterKey"}),e(d,{label:e("code",{children:"WeaponKey"}),value:"WeaponKey",component:c,to:"WeaponKey"}),e(d,{label:e("code",{children:"MaterialKey"}),value:"MaterialKey",component:c,to:"MaterialKey"}),e(d,{label:"Version History",value:"VersionHistory",component:c,to:"VersionHistory"})]})})}),e(m,{item:!0,xs:12,md:10,children:e(n,{bgt:"light",sx:{height:"100%"},children:e(r,{children:e(O.Suspense,{fallback:e(k,{variant:"rectangular",width:"100%",height:600}),children:t(D,{children:[e(h,{index:!0,element:e(X,{})}),e(h,{path:"/VersionHistory",element:e(te,{})}),e(h,{path:"/MaterialKey",element:e(ee,{})}),e(h,{path:"/ArtifactSetKey",element:e(Y,{})}),e(h,{path:"/WeaponKey",element:e(Q,{})}),e(h,{path:"/CharacterKey",element:e(Z,{})}),e(h,{path:"/StatKey",element:e(U,{})}),e(h,{path:"/KeyNaming",element:e(J,{})})]})})})})})]})})]})}const H=`interface IGOOD {
  format: "GOOD" // A way for people to recognize this format.
  version: number // GOOD API version.
  source: string // The app that generates this data.
  characters?: ICharacter[]
  artifacts?: IArtifact[]
  weapons?: IWeapon[]
  materials?: { // Added in version 2
    [key:MaterialKey]: number
  }
}`,z=`interface IArtifact {
  setKey: SetKey //e.g. "GladiatorsFinale"
  slotKey: SlotKey //e.g. "plume"
  level: number //0-20 inclusive
  rarity: number //1-5 inclusive
  mainStatKey: StatKey
  location: CharacterKey|"" //where "" means not equipped.
  lock: boolean //Whether the artifact is locked in game.
  substats: ISubstat[]
}

interface ISubstat {
  key: StatKey //e.g. "critDMG_"
  value: number //e.g. 19.4
}

type SlotKey = "flower" | "plume" | "sands" | "goblet" | "circlet"`,F=`interface IWeapon {
  key: WeaponKey //"CrescentPike"
  level: number //1-90 inclusive
  ascension: number //0-6 inclusive. need to disambiguate 80/90 or 80/80
  refinement: number //1-5 inclusive
  location: CharacterKey | "" //where "" means not equipped.
  lock: boolean //Whether the weapon is locked in game.
}`,E=`interface ICharacter {
  key: CharacterKey //e.g. "Rosaria"
  level: number //1-90 inclusive
  constellation: number //0-6 inclusive
  ascension: number //0-6 inclusive. need to disambiguate 80/90 or 80/80
  talent: { //does not include boost from constellations. 1-15 inclusive
    auto: number
    skill: number
    burst: number
  }
}`;function X(){return t(u,{children:[e(a,{gutterBottom:!0,variant:"h4",children:"Genshin Open Object Description (GOOD)"}),t(a,{gutterBottom:!0,children:[e("strong",{children:"GOOD"})," is a data format description to map Genshin Data into a parsable JSON. This is intended to be a standardized format to allow Genshin developers/programmers to transfer data without needing manual conversion."]}),e(a,{gutterBottom:!0,children:"As of version 6.0.0, Genshin Optimizer's database export conforms to this format."}),e(n,{children:e(r,{children:e(l,{text:H})})}),e("br",{}),e(a,{gutterBottom:!0,variant:"h4",children:"Artifact data representation"}),e(n,{children:e(r,{children:e(l,{text:z})})}),e("br",{}),e(a,{gutterBottom:!0,variant:"h4",children:"Weapon data representation"}),e(n,{children:e(r,{children:e(l,{text:F})})}),e("br",{}),e(a,{gutterBottom:!0,variant:"h4",children:"Character data representation"}),e(n,{children:e(r,{children:e(l,{text:E})})})]})}function J(){return t(n,{children:[e(r,{children:e(a,{children:"Key Naming Convention"})}),e(f,{}),t(r,{children:[t(a,{gutterBottom:!0,children:["The keys in the GOOD format, like Artifact sets, weapon keys, character keys, are all in ",e("strong",{children:"PascalCase"}),". This makes the name easy to derive from the in-game text, assuming no renames occur. If a rename is needed, then the standard will have to increment versions. (Last change was in 1.2 when the Prototype weapons were renamed)"]}),t(a,{gutterBottom:!0,children:[" ","To derive the PascalKey from a specific name, remove all symbols from the name, and Capitalize each word:"]}),t(a,{children:[e("code",{children:"Gladiator's Finale"})," ",e(g,{sx:{verticalAlign:"bottom"}})," ",e("code",{children:"GladiatorsFinale"})]}),t(a,{children:[e("code",{children:"Spirit Locket of Boreas"})," ",e(g,{sx:{verticalAlign:"bottom"}})," ",e("code",{children:"SpiritLocketOfBoreas"})]}),t(a,{children:[e("code",{children:'"The Catch"'})," ",e(g,{sx:{verticalAlign:"bottom"}})," ",e("code",{children:"TheCatch"})]})]})]})}function U(){const{t:o}=y("statKey_gen"),i=`type StatKey
  = ${["hp","hp_","atk","atk_","def","def_","eleMas","enerRech_","heal_","critRate_","critDMG_","physical_dmg_","anemo_dmg_","geo_dmg_","electro_dmg_","hydro_dmg_","pyro_dmg_","cryo_dmg_","dendro_dmg_"].map(p=>`"${p}" //${o(p)}${$(p)}`).join(`
  | `)}`;return t(u,{children:[e(a,{gutterBottom:!0,variant:"h4",children:"StatKey"}),e(n,{children:e(r,{children:e(l,{text:i})})})]})}function Y(){const{t:o}=y("artifactNames_gen"),s=`type ArtifactSetKey
  = ${[...new Set(B)].sort().map(i=>`"${i}" //${o(`artifactNames_gen:${i}`)}`).join(`
  | `)}`;return t(u,{children:[e(a,{gutterBottom:!0,variant:"h4",children:"ArtifactSetKey"}),e(n,{children:e(r,{children:e(l,{text:s})})})]})}function Z(){const{t:o}=y("charNames_gen"),s=G(),{gender:i}=T(),p=`type CharacterKey
  = ${[...new Set(P)].sort().map(b=>`"${b}" //${o(`charNames_gen:${W(s.chars.LocationToCharacterKey(b),i)}`)}`).join(`
  | `)}`;return t(u,{children:[e(a,{gutterBottom:!0,variant:"h4",children:"CharacterKey"}),e(n,{children:e(r,{children:e(l,{text:p})})})]})}function Q(){const{t:o}=y("weaponNames_gen"),s=`type WeaponKey
  = ${[...new Set(I)].sort().map(i=>`"${i}" //${o(`weaponNames_gen:${i}`)}`).join(`
  | `)}`;return t(u,{children:[e(a,{gutterBottom:!0,variant:"h4",children:"WeaponKey"}),e(n,{children:e(r,{children:e(l,{text:s})})})]})}function ee(){const{t:o}=y("material_gen"),s=`type MaterialKey
  = ${Object.keys(M.material).sort().map(i=>`"${i}" // ${o(`${i}.name`)}`).join(`
  | `)}`;return t(u,{children:[e(a,{gutterBottom:!0,variant:"h4",children:"MaterialKey"}),e(n,{children:t(r,{children:[t(a,{gutterBottom:!0,children:["The item names are taken from the english translation, and then converted into"," ",e(N,{component:c,to:"KeyNaming",children:e("code",{children:"PascalCase"})}),"."]}),e(l,{text:s})]})})]})}function te(){return t(j,{display:"flex",flexDirection:"column",gap:2,children:[e(a,{gutterBottom:!0,variant:"h4",children:"Version History"}),t(n,{children:[e(r,{children:e(a,{children:"Version 1"})}),e(f,{}),e(r,{children:t(a,{children:["Created general ",e("code",{children:"IGOOD"})," format with character, weapon, artifact fields."]})})]}),t(n,{children:[e(r,{children:e(a,{children:"Version 2"})}),e(f,{}),e(r,{children:t(a,{children:["Adds ",e("code",{children:"materials"})," field to ",e("code",{children:"IGOOD"}),". All other fields remain the same. V2 is backwards compatible with V1."]})})]})]})}export{ne as default};
