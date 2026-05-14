
global.localStorage = { data:{}, setItem(k,v){this.data[k]=v}, getItem(k){return this.data[k]||null} };
function elem(){
  return { classList:{add(){},remove(){},toggle(){},contains(){return true}}, 
    innerHTML:"", textContent:"", disabled:false, dataset:{}, style:{}, 
    onclick:null, onchange:null, addEventListener(){}, querySelectorAll(){return []}, querySelector(){return elem()} };
}
global.document = {
  querySelector(q){ return elem(); },
  querySelectorAll(q){ return []; },
  createElement(t){ return {href:"",download:"",click(){}}; },
  addEventListener(ev, cb){ if(ev === "DOMContentLoaded") cb(); }
};
global.Blob = function(){};
global.URL = {createObjectURL(){return "blob:"}, revokeObjectURL(){}};
require(process.argv[2]);
console.log("EXEC OK");
