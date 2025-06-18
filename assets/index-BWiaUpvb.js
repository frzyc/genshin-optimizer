import{t as C,v as w,w as _,g as S,ac as x,ce as A,e as t,d as e,G as m,T as a,at as O,M as f,h as u,cg as k,cf as s,O as o,N as d,r as G,ch as D,ci as l,S as B,ck as c,cl as y,f as $,x as g,cm as T,a1 as R,bG as I,c5 as M,a as N,bN as P,bb as W,cn as j,co as V}from"./index-9dr2FYbS.js";var p={},b;function q(){if(b)return p;b=1;var n=C();Object.defineProperty(p,"__esModule",{value:!0}),p.default=void 0;var i=n(w()),r=_(),h=(0,i.default)((0,r.jsx)("path",{d:"M16.01 11H4v2h12.01v3L20 12l-3.99-4z"}),"ArrowRightAlt");return p.default=h,p}var L=q();const v=S(L);function re(){x.send({hitType:"pageview",page:"/doc"});const{params:{currentTab:n}}=A("/doc/:currentTab")??{params:{currentTab:""}};return t(u,{children:[t(m,{container:!0,sx:{px:2,py:1},children:[e(m,{item:!0,flexGrow:1,children:e(a,{variant:"h6",children:"Documentation"})}),e(m,{item:!0,children:e(a,{variant:"h6",children:e(O,{color:"info",children:"Version. 2"})})})]}),e(f,{}),e(d,{children:t(m,{container:!0,spacing:1,children:[e(m,{item:!0,xs:12,md:2,children:e(u,{bgt:"light",sx:{height:"100%"},children:t(k,{orientation:"vertical",value:n,"aria-label":"Documentation Navigation",sx:{borderRight:1,borderColor:"divider"},children:[e(s,{label:"Overview",value:"",component:o,to:""}),e(s,{label:"Key naming convention",value:"KeyNaming",component:o,to:"KeyNaming"}),e(s,{label:e("code",{children:"StatKey"}),value:"StatKey",component:o,to:"StatKey"}),e(s,{label:e("code",{children:"ArtifactSetKey"}),value:"ArtifactSetKey",component:o,to:"ArtifactSetKey"}),e(s,{label:e("code",{children:"CharacterKey"}),value:"CharacterKey",component:o,to:"CharacterKey"}),e(s,{label:e("code",{children:"WeaponKey"}),value:"WeaponKey",component:o,to:"WeaponKey"}),e(s,{label:e("code",{children:"MaterialKey"}),value:"MaterialKey",component:o,to:"MaterialKey"}),e(s,{label:"Version History",value:"VersionHistory",component:o,to:"VersionHistory"})]})})}),e(m,{item:!0,xs:12,md:10,children:e(u,{bgt:"light",sx:{height:"100%"},children:e(d,{children:e(G.Suspense,{fallback:e(B,{variant:"rectangular",width:"100%",height:600}),children:t(D,{children:[e(l,{index:!0,element:e(J,{})}),e(l,{path:"/VersionHistory",element:e(te,{})}),e(l,{path:"/MaterialKey",element:e(ee,{})}),e(l,{path:"/ArtifactSetKey",element:e(X,{})}),e(l,{path:"/WeaponKey",element:e(Z,{})}),e(l,{path:"/CharacterKey",element:e(Y,{})}),e(l,{path:"/StatKey",element:e(U,{})}),e(l,{path:"/KeyNaming",element:e(Q,{})})]})})})})})]})})]})}const H=`interface IGOOD {
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
}`;function J(){return t(y,{children:[e(a,{gutterBottom:!0,variant:"h4",children:"Genshin Open Object Description (GOOD)"}),t(a,{gutterBottom:!0,children:[e("strong",{children:"GOOD"})," is a data format description to map Genshin Data into a parsable JSON. This is intended to be a standardized format to allow Genshin developers/programmers to transfer data without needing manual conversion."]}),e(a,{gutterBottom:!0,children:"As of version 6.0.0, Genshin Optimizer's database export conforms to this format."}),e(c,{text:H}),e("br",{}),e(a,{gutterBottom:!0,variant:"h4",children:"Artifact data representation"}),e(c,{text:z}),e("br",{}),e(a,{gutterBottom:!0,variant:"h4",children:"Weapon data representation"}),e(c,{text:F}),e("br",{}),e(a,{gutterBottom:!0,variant:"h4",children:"Character data representation"}),e(c,{text:E})]})}function Q(){return t(u,{children:[e(d,{children:e(a,{children:"Key Naming Convention"})}),e(f,{}),t(d,{children:[t(a,{gutterBottom:!0,children:["The keys in the GOOD format, like Artifact sets, weapon keys, character keys, are all in ",e("strong",{children:"PascalCase"}),". This makes the name easy to derive from the in-game text, assuming no renames occur. If a rename is needed, then the standard will have to increment versions. (Last change was in 1.2 when the Prototype weapons were renamed)"]}),t(a,{gutterBottom:!0,children:[" ","To derive the PascalKey from a specific name, remove all symbols from the name, and Capitalize each word:"]}),t(a,{children:[e("code",{children:"Gladiator's Finale"})," ",e(v,{sx:{verticalAlign:"bottom"}})," ",e("code",{children:"GladiatorsFinale"})]}),t(a,{children:[e("code",{children:"Spirit Locket of Boreas"})," ",e(v,{sx:{verticalAlign:"bottom"}})," ",e("code",{children:"SpiritLocketOfBoreas"})]}),t(a,{children:[e("code",{children:'"The Catch"'})," ",e(v,{sx:{verticalAlign:"bottom"}})," ",e("code",{children:"TheCatch"})]})]})]})}function U(){const{t:n}=g("statKey_gen"),r=`type StatKey
  = ${["hp","hp_","atk","atk_","def","def_","eleMas","enerRech_","heal_","critRate_","critDMG_","physical_dmg_","anemo_dmg_","geo_dmg_","electro_dmg_","hydro_dmg_","pyro_dmg_","cryo_dmg_","dendro_dmg_"].map(h=>`"${h}" //${n(h)}${V(h)}`).join(`
  | `)}`;return t(y,{children:[e(a,{gutterBottom:!0,variant:"h4",children:"StatKey"}),e(c,{text:r})]})}function X(){const{t:n}=g("artifactNames_gen"),i=`type ArtifactSetKey
  = ${[...new Set(I)].sort().map(r=>`"${r}" //${n(`artifactNames_gen:${r}`)}`).join(`
  | `)}`;return t(y,{children:[e(a,{gutterBottom:!0,variant:"h4",children:"ArtifactSetKey"}),e(c,{text:i})]})}function Y(){const{t:n}=g("charNames_gen"),i=N(),{gender:r}=P(),h=`type CharacterKey
  = ${[...new Set(W)].sort().map(K=>`"${K}" //${n(`charNames_gen:${j(i.chars.LocationToCharacterKey(K),r)}`)}`).join(`
  | `)}`;return t(y,{children:[e(a,{gutterBottom:!0,variant:"h4",children:"CharacterKey"}),e(c,{text:h})]})}function Z(){const{t:n}=g("weaponNames_gen"),i=`type WeaponKey
  = ${[...new Set(M)].sort().map(r=>`"${r}" //${n(`weaponNames_gen:${r}`)}`).join(`
  | `)}`;return t(y,{children:[e(a,{gutterBottom:!0,variant:"h4",children:"WeaponKey"}),e(c,{text:i})]})}function ee(){const{t:n}=g("material_gen"),i=`type MaterialKey
  = ${Object.keys(T.material).sort().map(r=>`"${r}" // ${n(`${r}.name`)}`).join(`
  | `)}`;return t(y,{children:[e(a,{gutterBottom:!0,variant:"h4",children:"MaterialKey"}),t(a,{gutterBottom:!0,children:["The item names are taken from the english translation, and then converted into"," ",e(R,{component:o,to:"KeyNaming",children:e("code",{children:"PascalCase"})}),"."]}),e(c,{text:i})]})}function te(){return t($,{display:"flex",flexDirection:"column",gap:2,children:[e(a,{gutterBottom:!0,variant:"h4",children:"Version History"}),t(u,{children:[e(d,{children:e(a,{children:"Version 1"})}),e(f,{}),e(d,{children:t(a,{children:["Created general ",e("code",{children:"IGOOD"})," format with character, weapon, artifact fields."]})})]}),t(u,{children:[e(d,{children:e(a,{children:"Version 2"})}),e(f,{}),e(d,{children:t(a,{children:["Adds ",e("code",{children:"materials"})," field to ",e("code",{children:"IGOOD"}),". All other fields remain the same. V2 is backwards compatible with V1."]})})]})]})}export{re as default};
