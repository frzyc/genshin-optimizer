import{y as j,r as o,aY as J,a as U,bI as Q,d as e,bL as Y,cj as q,ap as z,b3 as X,cR as N,P as Z,S as K,cS as ee,b as ae,z as te,cT as se,cU as re,aa as oe,bA as ne,aC as le,aD as ce,az as ie,aE as me,e as S,N as $,h as M,bg as A,aI as he,i as P,aF as ue,ac as L,L as de,M as pe,T as fe,ah as ge,G as W,cV as ye}from"./index-BY2iovwx.js";import{T as Te}from"./TeamCard-CYpaUcvB.js";import{d as G}from"./Upload-BAzf3ccs.js";import"./useTeamChar-Dpqek32E.js";import"./TeamDelModal-aNyexcnU.js";function Ce({teamIds:s,charKeys:r,setCharKey:m,acProps:c}){const{t:h}=j(["page_team","sillyWisher_charNames","charNames_gen"]),{silly:u}=o.useContext(J),l=U(),{gender:p}=Q(),d=o.useCallback(a=>l.charMeta.get(a).favorite,[l.charMeta]),E=o.useCallback(a=>e(Y,{characterKey:a}),[]),T=o.useCallback((a,n)=>h(`${n?"sillyWisher_charNames":"charNames_gen"}:${q(a,p)}`),[p,h]),x=ae,[D,I]=z();o.useEffect(()=>l.chars.followAny((a,n)=>["new","remove"].includes(n)&&I()),[l.chars,I]);const f=o.useMemo(()=>D&&l.chars.keys,[l,D]),{characterTeamTotal:g}=o.useMemo(()=>X({characterTeamTotal:f},n=>{l.teams.values.forEach(C=>{const{loadoutData:b}=C;b.filter(N).forEach(({teamCharId:w})=>{const v=l.teamChars.get(w);if(!v)return;const y=v.key;n.characterTeamTotal[y].total++})}),s.forEach(C=>{const b=l.teams.get(C);if(!b)return;const{loadoutData:w}=b;w.filter(N).forEach(({teamCharId:v})=>{const y=l.teamChars.get(v);if(!y)return;const B=y.key;n.characterTeamTotal[B].current++})})}),[l,f,s]),k=o.useCallback(a=>e("strong",{children:g[a]}),[g]),F=o.useCallback(a=>e(Z,{size:"small",label:g[a]}),[g]),_=o.useMemo(()=>f.map(a=>({key:a,label:T(a,u),alternateNames:u?[T(a,!u)]:void 0,favorite:d(a),color:x(a)})).sort((a,n)=>a.favorite&&!n.favorite?-1:!a.favorite&&n.favorite?1:a.label.localeCompare(n.label)),[u,T,x,d,f]);return e(o.Suspense,{fallback:e(K,{variant:"text",width:100}),children:e(ee,{label:h("searchLabel.char"),options:_,toImg:E,valueKeys:r,onChange:a=>m(a),toExLabel:k,toExItemLabel:F,chipProps:{variant:"outlined"},...c})})}function xe(){return{name:s=>s.name??"",lastEdit:s=>s.lastEdit??0}}const be={name:["name","lastEdit"],lastEdit:["lastEdit"]};function we(s){return{charKeys:(r,m)=>{var l;if(!m.length)return!0;const c=(l=s.teams.get(r))==null?void 0:l.loadoutData.filter(N),h=c==null?void 0:c.map(({teamCharId:p})=>{var d;return(d=s.teamChars.get(p))==null?void 0:d.key}).filter(N);return m.every(p=>h==null?void 0:h.includes(p))},name:(r,m)=>{var c;return!m||!!((c=s.teams.get(r))!=null&&c.name.toLowerCase().includes(m.toLowerCase()))}}}const ve={xs:1,sm:2,md:2,lg:3,xl:3},Se={xs:6,sm:12,md:18,lg:24,xl:24};function Me(){const{t:s}=j(["page_team","page_teams","sillyWisher_charNames","charNames_gen"]),r=U(),[m,c]=z(),h=te(),u=se();o.useEffect(()=>r.teams.followAny((t,i)=>(i==="new"||i==="remove"||i==="update")&&c()),[c,r]),re();const l=()=>{const t=r.teams.new();h(t)},[p,d,E]=oe(),[T,x]=o.useState("");o.useEffect(()=>{var t,i;(t=u.state)!=null&&t.openImportModal&&(x((i=u.state)==null?void 0:i.teamData),d())},[u.state,d,x]);const D=()=>{try{const t=JSON.parse(T);r.teams.import(t)||window.alert(s("importForm.error.verifi")),E()}catch(t){window.alert(s("importForm.error.import")+`
${t}`);return}},I=ne(r.displayTeam),{sortType:f,ascending:g,charKeys:k}=I,[F,_]=o.useState(I.searchTerm),a=o.useDeferredValue(F);o.useEffect(()=>{r.displayTeam.set({searchTerm:a})},[r,a]);const{teamIds:n,totalTeamNum:C}=o.useMemo(()=>{const t=r.teams.keys.length,i=r.teams.keys.filter(le({charKeys:k,name:a},we(r))).sort((V,R)=>ce(be[f],g,xe())(r.teams.get(V),r.teams.get(R)));return m&&{teamIds:i,totalTeamNum:t}},[m,r,k,a,f,g]),b=ie(),{numShow:w,setTriggerElement:v}=me(Se[b],n.length),y=o.useMemo(()=>n.slice(0,w),[n,w]),B=n.length!==C?`${n.length}/${C}`:`${C}`,H={numShowing:y.length,total:B,t:s,namespace:"page_teams"},O={sortKeys:[...ye],value:f,onChange:t=>r.displayTeam.set({sortType:t}),ascending:g,onChangeAsc:t=>r.displayTeam.set({ascending:t})};return S(M,{display:"flex",flexDirection:"column",gap:1,children:[e(P,{children:S($,{sx:{display:"flex",flexDirection:"column",gap:1},children:[S(M,{display:"flex",gap:1,alignItems:"stretch",children:[e(Ce,{teamIds:n,charKeys:k,setCharKey:t=>r.displayTeam.set({charKeys:t}),acProps:{sx:{flexGrow:1}}}),e(A,{autoFocus:!0,value:F,onChange:t=>_(t.target.value),label:s("searchLabel.team"),sx:{height:"100%",flexGrow:1},InputProps:{sx:{height:"100%"}}})]}),e(M,{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",children:e(he,{showingTextProps:H,sortByButtonProps:O})})]})}),S(M,{sx:{display:"flex",gap:1},children:[e(L,{fullWidth:!0,onClick:l,color:"info",startIcon:e(ue,{}),children:s("addTeamBtn")}),e(ge,{open:p,onClose:E,children:S(P,{children:[e(de,{title:s("importForm.title")}),e(pe,{}),S($,{sx:{display:"flex",flexDirection:"column",gap:2},children:[e(fe,{children:s("importForm.desc")}),e(A,{fullWidth:!0,label:s("importForm.label"),placeholder:s("importForm.placeholder"),value:T,onChange:t=>x(t.target.value),multiline:!0,rows:4}),e(L,{startIcon:e(G,{}),disabled:!T,onClick:D,children:s("importForm.importBtn")})]})]})}),e(L,{fullWidth:!0,onClick:d,color:"info",startIcon:e(G,{}),children:s("importTeamBtn")})]}),e(o.Suspense,{fallback:e(K,{variant:"rectangular",sx:{width:"100%",height:"100%",minHeight:5e3}}),children:e(W,{container:!0,spacing:2,columns:ve,children:y.map(t=>e(W,{item:!0,xs:1,children:e(o.Suspense,{fallback:e(K,{variant:"rectangular",width:"100%",height:150}),children:e(Te,{teamId:t,bgt:"light",onClick:i=>h(`${t}${i?`/${i}`:""}`)})})},t))})}),n.length!==y.length&&e(K,{ref:t=>{t&&v(t)},sx:{borderRadius:1},variant:"rectangular",width:"100%",height:100})]})}export{Me as default};