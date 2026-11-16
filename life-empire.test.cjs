// Self-contained game-state smoke and regression tests. Run: node --test life-empire.test.cjs
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const markup=fs.readFileSync(require('node:path').join(__dirname,'life-empire.html'),'utf8');
const script=markup.match(/<script>([\s\S]*?)<\/script>/)[1];
const KEY='mindora-life-empire-v1';
class Element{
  constructor(){this.textContent='';this.disabled=false;this.dataset={};this.style={};this.children=[];this.classList={add(){},remove(){},toggle(){}};}
  append(...children){this.children.push(...children)}
  replaceChildren(...children){this.children=children}
  setAttribute(){}
}
function boot(saved=null,random=.1){
  const storage=new Map(saved?[[KEY,JSON.stringify(saved)]]:[]);
  const elements=new Map();
  const get=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id)};
  const modes=['easy','medium','hard'].map(mode=>{const e=new Element();e.dataset.mode=mode;return e});
  const buildings=Array.from({length:5},()=>new Element());
  const document={getElementById:get,createElement:()=>new Element(),querySelectorAll:selector=>selector==='[data-mode]'?modes:selector==='.building'?buildings:[]};
  const context=vm.createContext({document,window:{},confirm:()=>true,Math:Object.assign(Object.create(Math),{random:()=>random}),localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}});
  vm.runInContext(script,context);
  return {get,storage,modes,state:()=>JSON.parse(storage.get(KEY)),click:label=>{const action=get('actions').children.find(e=>e.children.some(c=>c.textContent===label));assert.ok(action,`Action ${label} exists`);assert.equal(action.disabled,false,`Action ${label} enabled`);action.onclick()},advance(){get('advance').onclick();if(!get('overlay').classList.hidden)get('eventOk').onclick()}};
}
test('JavaScript parses and a new game starts with consistent finances',()=>{
  assert.doesNotThrow(()=>new vm.Script(script));const g=boot();g.get('start').onclick();const s=g.state();assert.equal(s.version,2);assert.equal(s.cash,2500);assert.equal(s.salary,3200);assert.equal(s.cost,2400);assert.equal(s.moves,2);
});
test('work, education and rest consume actions, cash and energy correctly',()=>{
  const g=boot();g.get('start').onclick();g.click('Take extra work');assert.equal(g.state().cash,3400);assert.equal(g.state().energy,56);g.click('Upgrade your skills');assert.equal(g.state().salary,3380);assert.equal(g.state().moves,0);assert.ok(g.get('actions').children.every(a=>a.disabled));g.advance();assert.equal(g.state().month,2);assert.equal(g.state().cash,3780);
});
test('budget cuts cap at six and prevent unlimited expense reduction',()=>{
  const g=boot();g.get('start').onclick();let s=g.state();s.cash=20000;s.budgetCuts=6;g.storage.set(KEY,JSON.stringify(s));const restored=boot(s);assert.ok(restored.get('actions').children.find(b=>b.children.some(c=>c.textContent==='Optimize your budget')).disabled);
});
test('purchase, passive income, market value and sale fee remain consistent',()=>{
  const s=boot();s.get('start').onclick();const state=s.state();state.cash=30000;const g=boot(state);g.click('Buy a rental studio');g.click('Buy index fund shares');assert.equal(g.state().cash,19000);assert.equal(g.state().portfolio.studio,1);assert.equal(g.state().portfolio.fund,1);g.advance();assert.equal(g.state().cash,19963);g.click('Sell an investment');assert.equal(g.state().portfolio.studio,0);assert.equal(g.state().cash,27563);
});
test('selling assets is possible while cash is negative',()=>{
  const g=boot();g.get('start').onclick();const s=g.state();s.cash=-800;s.portfolio.studio=1;const h=boot(s);h.click('Sell an investment');assert.equal(h.state().cash,6800);assert.equal(h.state().portfolio.studio,0);
});
test('negative balance produces fees and bankruptcy after four months',()=>{
  const g=boot();g.get('start').onclick();const s=g.state();Object.assign(s,{cash:-1000,salary:0,cost:1000});const h=boot(s);for(let i=0;i<4;i++)h.advance();assert.equal(h.state().ended,true);assert.equal(h.state().result,'loss');assert.equal(h.state().debtMonths,4);
});
test('three months of sustained passive income win; one month does not',()=>{
  const g=boot();g.get('start').onclick();const s=g.state();Object.assign(s,{cash:9000,cost:200,portfolio:{studio:2,shop:0,fund:0}});const h=boot(s);h.advance();assert.equal(h.state().freedomStreak,1);assert.equal(h.state().ended,false);h.advance();assert.equal(h.state().freedomStreak,2);h.advance();assert.equal(h.state().ended,true);assert.equal(h.state().result,'win');
});
test('month 180 terminates game without entering month 181',()=>{
  const g=boot();g.get('start').onclick();const s=g.state();Object.assign(s,{month:180,cash:10000,freedomStreak:0});const h=boot(s);h.advance();assert.equal(h.state().month,180);assert.equal(h.state().ended,true);assert.equal(h.state().result,'loss');
});
test('invalid or corrupted saves cannot be restored',()=>{
  const g=boot();g.get('start').onclick();const s=g.state();s.portfolio.studio=-2;const h=boot(s);assert.equal(h.get('intro').classList!==undefined,true);assert.equal(h.get('start').disabled,false);
});
test('v1 playtest save migrates to v2 without deleting game progress',()=>{
  const g=boot();g.get('start').onclick();const s=g.state();delete s.fundFactor;delete s.budgetCuts;delete s.freedomStreak;delete s.debtMonths;s.version=1;s.month=23;const h=boot(s);assert.equal(h.state().month,23);assert.equal(h.state().version,2);
});
test('100 simulated full games never create invalid state or exceed month 180',()=>{
  const names=['Upgrade your skills','Take extra work','Rest & recharge','Buy a rental studio','Open a coffee shop','Buy index fund shares','Optimize your budget','Sell an investment'];
  for(let seed=0;seed<100;seed++){
    const g=boot(null,((seed*37)%99)/100);g.get('start').onclick();
    for(let step=0;step<180&&!g.state().ended;step++){
      for(let n=0;n<2;n++){
        const choice=names[(seed+step*3+n*7)%names.length];
        const action=g.get('actions').children.find(e=>e.children.some(c=>c.textContent===choice));
        if(action&&!action.disabled)action.onclick();
      }
      g.advance();const s=g.state();assert.ok(Number.isFinite(s.cash));assert.ok(s.month<=180);assert.ok(s.energy>=0&&s.energy<=100);assert.ok(s.moves>=0&&s.moves<=2);assert.ok(s.cost>0);assert.ok(s.portfolio.studio>=0&&s.portfolio.shop>=0&&s.portfolio.fund>=0);
    }
    assert.equal(g.state().ended,true,'game reaches a terminal condition');
  }
});
test('a deliberate investment strategy can win on standard difficulty',()=>{
  const g=boot(null,.01);g.get('start').onclick();
  for(let i=0;i<180&&!g.state().ended;i++){
    for(let j=0;j<2;j++){
      const choices=['Open a coffee shop','Buy a rental studio','Upgrade your skills'];
      const action=g.get('actions').children.find(e=>choices.some(name=>e.children.some(c=>c.textContent===name))&&!e.disabled);
      if(action)action.onclick();
    }
    g.advance();
  }
  assert.equal(g.state().result,'win');
});
test('all difficulty settings initialize distinct valid scenarios',()=>{
  for(const label of ['easy','medium','hard']){
    const g=boot();g.modes.find(x=>x.dataset.mode===label).onclick();g.get('start').onclick();assert.equal(g.state().mode,label);assert.equal(g.state().moves,2);assert.equal(g.state().month,1);
  }
});
test('energy cannot become negative and burnout triggers a recovery penalty',()=>{
  const g=boot();g.get('start').onclick();const s=g.state();s.energy=0;s.cash=5000;const h=boot(s);h.advance();assert.equal(h.state().energy,28);assert.equal(h.state().cash,5300);
});
test('all random event outcomes produce valid saved states',()=>{
  for(let n=0;n<11;n++){
    const g=boot();g.get('start').onclick();const s=g.state();s.month=2;s.cash=40000;s.portfolio={studio:2,shop:1,fund:1};const h=boot(s,(n+.1)/11);h.advance();const next=h.state();assert.equal(next.month,3);assert.ok(next.propertyFactor>.1&&next.propertyFactor<10);assert.ok(next.fundFactor>=.3&&next.fundFactor<=3);assert.ok(Number.isFinite(next.cash));assert.ok(next.log.length<=16);
  }
});
test('isometric city draws without throwing and responds to portfolio changes',()=>{
  const g=boot();let shapes=0;const gradient={addColorStop(){}};
  const ctx={createLinearGradient:()=>gradient,clearRect(){},fillRect(){},beginPath(){},arc(){},ellipse(){},fill(){shapes++},moveTo(){},lineTo(){},closePath(){},fillText(){}};
  g.get('cityCanvas').getContext=()=>ctx;
  g.get('start').onclick();const initial=shapes;assert.ok(initial>30);
  const s=g.state();s.cash=30000;const h=boot(s);h.get('cityCanvas').getContext=()=>ctx;h.click('Open a coffee shop');assert.ok(shapes>initial);
});
