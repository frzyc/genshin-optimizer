import{w as b,x as C,j as _,a8 as S,ca as x,e as t,G as h,d as e,T as a,al as w,M as f,i as m,cc as A,cb as s,O as i,N as d,r as O,S as k,cd as B,ce as l,cg as o,ch as u,y as p,ci as G,bB as D,a as $,bI as T,be as I,cj as M,c7 as P,ck as j,h as N}from"./index-Cl6OMFhC.js";import{L as W}from"./Link-Q1RrlXGk.js";var v={},R=C;Object.defineProperty(v,"__esModule",{value:!0});var g=v.default=void 0,V=R(b()),L=_,H=(0,V.default)((0,L.jsx)("path",{d:"M16.01 11H4v2h12.01v3L20 12l-3.99-4z"}),"ArrowRightAlt");g=v.default=H;function ne(){S.send({hitType:"pageview",page:"/doc"});const{params:{currentTab:n}}=x("/doc/:currentTab")??{params:{currentTab:""}};return t(m,{children:[t(h,{container:!0,sx:{px:2,py:1},children:[e(h,{item:!0,flexGrow:1,children:e(a,{variant:"h6",children:"Documentation"})}),e(h,{item:!0,children:e(a,{variant:"h6",children:e(w,{color:"info",children:"Version. 2"})})})]}),e(f,{}),e(d,{children:t(h,{container:!0,spacing:1,children:[e(h,{item:!0,xs:12,md:2,children:e(m,{bgt:"light",sx:{height:"100%"},children:t(A,{orientation:"vertical",value:n,"aria-label":"Documentation Navigation",sx:{borderRight:1,borderColor:"divider"},children:[e(s,{label:"Overview",value:"",component:i,to:""}),e(s,{label:"Key naming convention",value:"KeyNaming",component:i,to:"KeyNaming"}),e(s,{label:e("code",{children:"StatKey"}),value:"StatKey",component:i,to:"StatKey"}),e(s,{label:e("code",{children:"ArtifactSetKey"}),value:"ArtifactSetKey",component:i,to:"ArtifactSetKey"}),e(s,{label:e("code",{children:"CharacterKey"}),value:"CharacterKey",component:i,to:"CharacterKey"}),e(s,{label:e("code",{children:"WeaponKey"}),value:"WeaponKey",component:i,to:"WeaponKey"}),e(s,{label:e("code",{children:"MaterialKey"}),value:"MaterialKey",component:i,to:"MaterialKey"}),e(s,{label:"Version History",value:"VersionHistory",component:i,to:"VersionHistory"})]})})}),e(h,{item:!0,xs:12,md:10,children:e(m,{bgt:"light",sx:{height:"100%"},children:e(d,{children:e(O.Suspense,{fallback:e(k,{variant:"rectangular",width:"100%",height:600}),children:t(B,{children:[e(l,{index:!0,element:e(J,{})}),e(l,{path:"/VersionHistory",element:e(te,{})}),e(l,{path:"/MaterialKey",element:e(ee,{})}),e(l,{path:"/ArtifactSetKey",element:e(X,{})}),e(l,{path:"/WeaponKey",element:e(Z,{})}),e(l,{path:"/CharacterKey",element:e(Y,{})}),e(l,{path:"/StatKey",element:e(U,{})}),e(l,{path:"/KeyNaming",element:e(Q,{})})]})})})})})]})})]})}const q=`interface IGOOD {
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
}`;function J(){return t(u,{children:[e(a,{gutterBottom:!0,variant:"h4",children:"Genshin Open Object Description (GOOD)"}),t(a,{gutterBottom:!0,children:[e("strong",{children:"GOOD"})," is a data format description to map Genshin Data into a parsable JSON. This is intended to be a standardized format to allow Genshin developers/programmers to transfer data without needing manual conversion."]}),e(a,{gutterBottom:!0,children:"As of version 6.0.0, Genshin Optimizer's database export conforms to this format."}),e(o,{text:q}),e("br",{}),e(a,{gutterBottom:!0,variant:"h4",children:"Artifact data representation"}),e(o,{text:z}),e("br",{}),e(a,{gutterBottom:!0,variant:"h4",children:"Weapon data representation"}),e(o,{text:F}),e("br",{}),e(a,{gutterBottom:!0,variant:"h4",children:"Character data representation"}),e(o,{text:E})]})}function Q(){return t(m,{children:[e(d,{children:e(a,{children:"Key Naming Convention"})}),e(f,{}),t(d,{children:[t(a,{gutterBottom:!0,children:["The keys in the GOOD format, like Artifact sets, weapon keys, character keys, are all in ",e("strong",{children:"PascalCase"}),". This makes the name easy to derive from the in-game text, assuming no renames occur. If a rename is needed, then the standard will have to increment versions. (Last change was in 1.2 when the Prototype weapons were renamed)"]}),t(a,{gutterBottom:!0,children:[" ","To derive the PascalKey from a specific name, remove all symbols from the name, and Capitalize each word:"]}),t(a,{children:[e("code",{children:"Gladiator's Finale"})," ",e(g,{sx:{verticalAlign:"bottom"}})," ",e("code",{children:"GladiatorsFinale"})]}),t(a,{children:[e("code",{children:"Spirit Locket of Boreas"})," ",e(g,{sx:{verticalAlign:"bottom"}})," ",e("code",{children:"SpiritLocketOfBoreas"})]}),t(a,{children:[e("code",{children:'"The Catch"'})," ",e(g,{sx:{verticalAlign:"bottom"}})," ",e("code",{children:"TheCatch"})]})]})]})}function U(){const{t:n}=p("statKey_gen"),r=`type StatKey
  = ${["hp","hp_","atk","atk_","def","def_","eleMas","enerRech_","heal_","critRate_","critDMG_","physical_dmg_","anemo_dmg_","geo_dmg_","electro_dmg_","hydro_dmg_","pyro_dmg_","cryo_dmg_","dendro_dmg_"].map(y=>`"${y}" //${n(y)}${G(y)}`).join(`
  | `)}`;return t(u,{children:[e(a,{gutterBottom:!0,variant:"h4",children:"StatKey"}),e(o,{text:r})]})}function X(){const{t:n}=p("artifactNames_gen"),c=`type ArtifactSetKey
  = ${[...new Set(D)].sort().map(r=>`"${r}" //${n(`artifactNames_gen:${r}`)}`).join(`
  | `)}`;return t(u,{children:[e(a,{gutterBottom:!0,variant:"h4",children:"ArtifactSetKey"}),e(o,{text:c})]})}function Y(){const{t:n}=p("charNames_gen"),c=$(),{gender:r}=T(),y=`type CharacterKey
  = ${[...new Set(I)].sort().map(K=>`"${K}" //${n(`charNames_gen:${M(c.chars.LocationToCharacterKey(K),r)}`)}`).join(`
  | `)}`;return t(u,{children:[e(a,{gutterBottom:!0,variant:"h4",children:"CharacterKey"}),e(o,{text:y})]})}function Z(){const{t:n}=p("weaponNames_gen"),c=`type WeaponKey
  = ${[...new Set(P)].sort().map(r=>`"${r}" //${n(`weaponNames_gen:${r}`)}`).join(`
  | `)}`;return t(u,{children:[e(a,{gutterBottom:!0,variant:"h4",children:"WeaponKey"}),e(o,{text:c})]})}function ee(){const{t:n}=p("material_gen"),c=`type MaterialKey
  = ${Object.keys(j.material).sort().map(r=>`"${r}" // ${n(`${r}.name`)}`).join(`
  | `)}`;return t(u,{children:[e(a,{gutterBottom:!0,variant:"h4",children:"MaterialKey"}),t(a,{gutterBottom:!0,children:["The item names are taken from the english translation, and then converted into"," ",e(W,{component:i,to:"KeyNaming",children:e("code",{children:"PascalCase"})}),"."]}),e(o,{text:c})]})}function te(){return t(N,{display:"flex",flexDirection:"column",gap:2,children:[e(a,{gutterBottom:!0,variant:"h4",children:"Version History"}),t(m,{children:[e(d,{children:e(a,{children:"Version 1"})}),e(f,{}),e(d,{children:t(a,{children:["Created general ",e("code",{children:"IGOOD"})," format with character, weapon, artifact fields."]})})]}),t(m,{children:[e(d,{children:e(a,{children:"Version 2"})}),e(f,{}),e(d,{children:t(a,{children:["Adds ",e("code",{children:"materials"})," field to ",e("code",{children:"IGOOD"}),". All other fields remain the same. V2 is backwards compatible with V1."]})})]})]})}export{ne as default};
