import{t as w,v as S,w as C,g as x,ac as A,ce as _,e as t,d as e,G as m,T as a,at as O,M as y,h as u,cg as k,cf as l,O as c,N as o,r as G,ch as D,ci as d,S as B,ck as s,cl as f,f as I,x as g,cm as T,a1 as $,bG as R,c5 as M,a as N,bN as P,bb as V,cn as W,co as j}from"./index-Bs2qc7AT.js";var p={},K;function q(){if(K)return p;K=1;var n=w();Object.defineProperty(p,"__esModule",{value:!0}),p.default=void 0;var i=n(S()),r=C(),h=(0,i.default)((0,r.jsx)("path",{d:"M16.01 11H4v2h12.01v3L20 12l-3.99-4z"}),"ArrowRightAlt");return p.default=h,p}var L=q();const v=x(L);function re(){A.send({hitType:"pageview",page:"/doc"});const{params:{currentTab:n}}=_("/doc/:currentTab")??{params:{currentTab:""}};return t(u,{children:[t(m,{container:!0,sx:{px:2,py:1},children:[e(m,{item:!0,flexGrow:1,children:e(a,{variant:"h6",children:"Documentation"})}),e(m,{item:!0,children:e(a,{variant:"h6",children:e(O,{color:"info",children:"Version 3"})})})]}),e(y,{}),e(o,{children:t(m,{container:!0,spacing:1,children:[e(m,{item:!0,xs:12,md:2,children:e(u,{bgt:"light",sx:{height:"100%"},children:t(k,{orientation:"vertical",value:n,"aria-label":"Documentation Navigation",sx:{borderRight:1,borderColor:"divider"},children:[e(l,{label:"Overview",value:"",component:c,to:""}),e(l,{label:"Key naming convention",value:"KeyNaming",component:c,to:"KeyNaming"}),e(l,{label:e("code",{children:"StatKey"}),value:"StatKey",component:c,to:"StatKey"}),e(l,{label:e("code",{children:"ArtifactSetKey"}),value:"ArtifactSetKey",component:c,to:"ArtifactSetKey"}),e(l,{label:e("code",{children:"CharacterKey"}),value:"CharacterKey",component:c,to:"CharacterKey"}),e(l,{label:e("code",{children:"WeaponKey"}),value:"WeaponKey",component:c,to:"WeaponKey"}),e(l,{label:e("code",{children:"MaterialKey"}),value:"MaterialKey",component:c,to:"MaterialKey"}),e(l,{label:"Version History",value:"VersionHistory",component:c,to:"VersionHistory"})]})})}),e(m,{item:!0,xs:12,md:10,children:e(u,{bgt:"light",sx:{height:"100%"},children:e(o,{children:e(G.Suspense,{fallback:e(B,{variant:"rectangular",width:"100%",height:600}),children:t(D,{children:[e(d,{index:!0,element:e(J,{})}),e(d,{path:"/VersionHistory",element:e(te,{})}),e(d,{path:"/MaterialKey",element:e(ee,{})}),e(d,{path:"/ArtifactSetKey",element:e(X,{})}),e(d,{path:"/WeaponKey",element:e(Z,{})}),e(d,{path:"/CharacterKey",element:e(Y,{})}),e(d,{path:"/StatKey",element:e(Q,{})}),e(d,{path:"/KeyNaming",element:e(U,{})})]})})})})})]})})]})}const F=`interface IGOOD {
  format: "GOOD" // A way for people to recognize this format.
  version: number // GOOD API version.
  source: string // The app that generates this data.
  characters?: ICharacter[]
  artifacts?: IArtifact[]
  weapons?: IWeapon[]
  materials?: { // Added in version 2
    [key:MaterialKey]: number
  }
}`,H=`interface IArtifact {
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

type SlotKey = "flower" | "plume" | "sands" | "goblet" | "circlet"`,z=`interface IWeapon {
  key: WeaponKey //"CrescentPike"
  level: number //1-90 inclusive
  ascension: number //0-6 inclusive. need to disambiguate 80/90 or 80/80
  refinement: number //1-5 inclusive
  location: CharacterKey | "" //where "" means not equipped.
  lock: boolean //Whether the weapon is locked in game.
}`,E=`interface ICharacter {
  key: CharacterKey //e.g. "Rosaria"
  level: number //1-100 inclusive
  constellation: number //0-6 inclusive
  ascension: number //0-6 inclusive. need to disambiguate 80/90 or 80/80
  talent: { //does not include boost from constellations. 1-15 inclusive
    auto: number
    skill: number
    burst: number
  }
}`;function J(){return t(f,{children:[e(a,{gutterBottom:!0,variant:"h4",children:"Genshin Open Object Description (GOOD)"}),t(a,{gutterBottom:!0,children:[e("strong",{children:"GOOD"})," is a data format description to map Genshin Data into a parsable JSON. This is intended to be a standardized format to allow Genshin developers/programmers to transfer data without needing manual conversion."]}),e(a,{gutterBottom:!0,children:"As of version 6.0.0, Genshin Optimizer's database export conforms to this format."}),e(s,{text:F}),e("br",{}),e(a,{gutterBottom:!0,variant:"h4",children:"Artifact data representation"}),e(s,{text:H}),e("br",{}),e(a,{gutterBottom:!0,variant:"h4",children:"Weapon data representation"}),e(s,{text:z}),e("br",{}),e(a,{gutterBottom:!0,variant:"h4",children:"Character data representation"}),e(s,{text:E})]})}function U(){return t(u,{children:[e(o,{children:e(a,{children:"Key Naming Convention"})}),e(y,{}),t(o,{children:[t(a,{gutterBottom:!0,children:["The keys in the GOOD format, like Artifact sets, weapon keys, character keys, are all in ",e("strong",{children:"PascalCase"}),". This makes the name easy to derive from the in-game text, assuming no renames occur. If a rename is needed, then the standard will have to increment versions. (Last change was in 1.2 when the Prototype weapons were renamed)"]}),t(a,{gutterBottom:!0,children:[" ","To derive the PascalKey from a specific name, remove all symbols from the name, and Capitalize each word:"]}),t(a,{children:[e("code",{children:"Gladiator's Finale"})," ",e(v,{sx:{verticalAlign:"bottom"}})," ",e("code",{children:"GladiatorsFinale"})]}),t(a,{children:[e("code",{children:"Spirit Locket of Boreas"})," ",e(v,{sx:{verticalAlign:"bottom"}})," ",e("code",{children:"SpiritLocketOfBoreas"})]}),t(a,{children:[e("code",{children:'"The Catch"'})," ",e(v,{sx:{verticalAlign:"bottom"}})," ",e("code",{children:"TheCatch"})]})]})]})}function Q(){const{t:n}=g("statKey_gen"),r=`type StatKey
  = ${["hp","hp_","atk","atk_","def","def_","eleMas","enerRech_","heal_","critRate_","critDMG_","physical_dmg_","anemo_dmg_","geo_dmg_","electro_dmg_","hydro_dmg_","pyro_dmg_","cryo_dmg_","dendro_dmg_"].map(h=>`"${h}" //${n(h)}${j(h)}`).join(`
  | `)}`;return t(f,{children:[e(a,{gutterBottom:!0,variant:"h4",children:"StatKey"}),e(s,{text:r})]})}function X(){const{t:n}=g("artifactNames_gen"),i=`type ArtifactSetKey
  = ${[...new Set(R)].sort().map(r=>`"${r}" //${n(`artifactNames_gen:${r}`)}`).join(`
  | `)}`;return t(f,{children:[e(a,{gutterBottom:!0,variant:"h4",children:"ArtifactSetKey"}),e(s,{text:i})]})}function Y(){const{t:n}=g("charNames_gen"),i=N(),{gender:r}=P(),h=`type CharacterKey
  = ${[...new Set(V)].sort().map(b=>`"${b}" //${n(`charNames_gen:${W(i.chars.LocationToCharacterKey(b),r)}`)}`).join(`
  | `)}`;return t(f,{children:[e(a,{gutterBottom:!0,variant:"h4",children:"CharacterKey"}),e(s,{text:h})]})}function Z(){const{t:n}=g("weaponNames_gen"),i=`type WeaponKey
  = ${[...new Set(M)].sort().map(r=>`"${r}" //${n(`weaponNames_gen:${r}`)}`).join(`
  | `)}`;return t(f,{children:[e(a,{gutterBottom:!0,variant:"h4",children:"WeaponKey"}),e(s,{text:i})]})}function ee(){const{t:n}=g("material_gen"),i=`type MaterialKey
  = ${Object.keys(T.material).sort().map(r=>`"${r}" // ${n(`${r}.name`)}`).join(`
  | `)}`;return t(f,{children:[e(a,{gutterBottom:!0,variant:"h4",children:"MaterialKey"}),t(a,{gutterBottom:!0,children:["The item names are taken from the english translation, and then converted into"," ",e($,{component:c,to:"KeyNaming",children:e("code",{children:"PascalCase"})}),"."]}),e(s,{text:i})]})}function te(){return t(I,{display:"flex",flexDirection:"column",gap:2,children:[e(a,{gutterBottom:!0,variant:"h4",children:"Version History"}),t(u,{children:[e(o,{children:e(a,{children:"Version 1"})}),e(y,{}),e(o,{children:t(a,{children:["Created general ",e("code",{children:"IGOOD"})," format with character, weapon, artifact fields."]})})]}),t(u,{children:[e(o,{children:e(a,{children:"Version 2"})}),e(y,{}),e(o,{children:t(a,{children:["Adds ",e("code",{children:"materials"})," field to ",e("code",{children:"IGOOD"}),". All other fields remain the same. V2 is backwards compatible with V1."]})})]}),t(u,{children:[e(o,{children:e(a,{children:"Version 3"})}),e(y,{}),e(o,{children:t(a,{children:["Adds new fields to ",e("code",{children:"IArtifact"})," to represent new in-game properties, store initial rolls for reroll information, and help differentiate between 3 and 4-line starts for 5* artifacts. All other fields remain the same. V3 is backwards compatible with V2.",e("br",{}),"New fields for ",e("code",{children:"IArtifact"}),":"," ",e("code",{children:"totalRolls, astralMark, elixirCrafted, unactivatedSubstats"}),e("br",{}),"New field for ",e("code",{children:"ISubstat"}),": ",e("code",{children:"initialValue"})]})})]})]})}export{re as default};
