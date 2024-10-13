function actionReaction(state={},actions={},templates={},config={}){
  if (config.localStorageKey && localStorage.getItem(config.LocalStorageKey)) state =  {...state,...JSON.parse(localStorage.getItem(config.LocalStorageKey))}
    const calcs = Object.entries(state).reduce((calcs,calc) => typeof calc[1] === "function" ? [...calcs,calc] : calcs,[])
    const update = transformer => {   
      const newState = typeof(transformer) === "function" ? transformer(state) : Array.isArray(transformer) ? transformer.reduce((s,t) => ({...s,...t({...state,...s})}),{}) : transformer
      if(newState){
      Object.entries(newState).forEach(([prop,value]) => {
      if(!(typeof value === "function")){
        state[prop] = value
        document.querySelectorAll(`[data-reaction="${prop}"]`).forEach(element => render(element,value))
      }
     if(config.debug) console.log(JSON.stringify(state))
   })}
      calcs.forEach(calc => state[calc[0]]=calc[1](state))
      if(config.localStorageKey) localStorage.setItem(config.LocalStorageKey,JSON.stringify(state))
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
  update(actions.initiate ? {...state,...actions?.initiate(state)} : {...state})
}
export default actionReaction