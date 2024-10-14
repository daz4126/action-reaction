function actionReaction(state={},actions={},templates={}){
  const localStorageKey = document.querySelector("[data-base][data-local-storage]") ? document.querySelector("[data-base][data-local-storage]").dataset.localStorage : null
  if (localStorageKey && localStorage.getItem(localStorageKey)) state =  {...state,...JSON.parse(localStorage.getItem(localStorageKey))}
    const update = (transformer,withCalcs=true) => {   
      const newState = typeof(transformer) === "function" ? transformer(state) : Array.isArray(transformer) ? transformer.reduce((s,t) => ({...s,...t({...state,...s})}),{}) : transformer
     if(newState){
     Object.entries(newState).forEach(([prop,value]) => {
       state[prop]  = value
       document.querySelectorAll(`[data-reaction="${prop}"]`).forEach(element => render(element,value))
       if(withCalcs) document.querySelectorAll(`[data-reaction="${prop}"][data-calculation],[data-base][data-calculation]`).forEach(el => update(actions[el.dataset.calculation](state),false))
       if(document.querySelector("[data-base][data-debug]")) console.log(JSON.stringify(state))
   })}
      if(localStorageKey) localStorage.setItem(localStorageKey,JSON.stringify(state))
    }   
function render(element,value,template = templates[element.dataset.template || element.dataset.reaction]){
    if(template){
         element.innerHTML = Array.isArray(value) ? value.map((v,i) => template ? template(v,i,state) : v).join("") : template(value,state)
         element.querySelectorAll("[data-action]").forEach(el => addAction(el))
         element.querySelectorAll("[data-reaction]").forEach(el => render(el,state[el.dataset.reaction]))
    } else element.textContent = value
  }
  document.querySelectorAll("[data-action]").forEach(element => addAction(element))
    function addAction(element){
    const [event,action] = element.dataset.action.includes("->") ?
          [element.dataset.action.split("->")[0].trim(),element.dataset.action.split("->")[1].trim()]
          : [element.tagName === "FORM" ? "submit" 
              : element.tagName === "INPUT" && element.type !== "submit" || element.tagName === "TEXTAREA" ? "input"
              : element.tagName == "SELECT" ? "change"
              : "click"
              ,element.dataset.action]
      if(actions[action]) element.addEventListener(event,e => update(actions[action](e)))  
  }
  update({...state,...actions?.initiate(state)})
}
export default actionReaction