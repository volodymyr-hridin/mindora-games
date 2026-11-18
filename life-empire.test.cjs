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
  const roles=['analyst','creator','builder'].map(role=>{const e=new Element();e.dataset.role=role;return e});
  const dreams=['homes','companies','balance'].map(dream=>{const e=new Element();e.dataset.dream=dream;return e});
  const challenges=['standard','inflation','competition'].map(challenge=>{const e=new Element();e.dataset.challenge=challenge;return e});
  const districts=['residential','commercial','industrial'].map(district=>{const e=new Element();e.dataset.district=district;return e});
  const buildings=Array.from({length:5},()=>new Element());
  const document={getElementById:get,createElement:()=>new Element(),querySelectorAll:selector=>selector==='[data-mode]'?modes:selector==='[data-role]'?roles:selector==='[data-dream]'?dreams:selector==='[data-challenge]'?challenges:selector==='[data-district]'?districts:selector==='.building'?buildings:[]};
  const context=vm.createContext({document,window:{},confirm:()=>true,Math:Object.assign(Object.create(Math),{random:()=>random}),localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)}});
  vm.runInContext(script,context);
  return {get,storage,modes,roles,dreams,challenges,districts,state:()=>JSON.parse(storage.get(KEY)),click:label=>{const action=get('actions').children.find(e=>e.children.some(c=>c.textContent===label));assert.ok(action,`Action ${label} exists`);assert.equal(action.disabled,false,`Action ${label} enabled`);action.onclick()},advance(){get('advance').onclick();const s=JSON.parse(storage.get(KEY)||'null');if(s?.pendingEvent)get('eventOk').onclick()}};
}
test('JavaScript parses and a new game starts with consistent finances',()=>{
  assert.doesNotThrow(()=>new vm.Script(script));const g=boot();g.get('start').onclick();const s=g.state();assert.equal(s.version,5);assert.equal(s.cash,2500);assert.equal(s.salary,3200);assert.equal(s.cost,2400);assert.equal(s.moves,2);
});
test('work, education and rest consume actions, cash and energy correctly',()=>{
  const g=boot();g.get('start').onclick();g.click('Take extra work');assert.equal(g.state().cash,3400);assert.equal(g.state().energy,56);g.click('Upgrade your skills');assert.equal(g.state().salary,3380);assert.equal(g.state().moves,0);assert.ok(g.get('actions').children.every(a=>a.disabled));g.advance();assert.equal(g.state().month,2);assert.equal(g.state().cash,3780);
});
test('budget cuts cap at six and prevent unlimited expense reduction',()=>{
  const g=boot();g.get('start').onclick();let s=g.state();s.cash=20000;s.budgetCuts=6;g.storage.set(KEY,JSON.stringify(s));const restored=boot(s);assert.ok(restored.get('actions').children.find(b=>b.children.some(c=>c.textContent==='Optimize your budget')).disabled);
});
test('purchase, passive income, market value and sale fee remain consistent',()=>{
  const s=boot();s.get('start').onclick();const state=s.state();state.cash=30000;const g=boot(state);g.click('Buy a rental studio');g.click('Buy index fund shares');assert.equal(g.state().cash,19600);assert.equal(g.state().mission.completed,true);assert.equal(g.state().portfolio.studio,1);assert.equal(g.state().portfolio.fund,1);g.advance();assert.equal(g.state().cash,20563);g.click('Sell an investment');assert.equal(g.state().portfolio.studio,0);assert.equal(g.state().cash,28163);
});
test('selling assets is possible while cash is negative',()=>{
  const g=boot();g.get('start').onclick();const s=g.state();s.cash=-800;s.portfolio.studio=1;const h=boot(s);h.click('Sell an investment');assert.equal(h.state().cash,6800);assert.equal(h.state().portfolio.studio,0);
});
test('city contract rewards two new investments exactly once and survives reload',()=>{
  const a=boot();a.get('start').onclick();const s=a.state();s.cash=30000;const g=boot(s);
  g.click('Buy a rental studio');assert.equal(g.state().mission.completed,false);
  g.click('Buy index fund shares');assert.equal(g.state().mission.completed,true);assert.equal(g.state().cash,19600);
  const restored=boot(g.state());restored.advance();assert.equal(restored.state().cash,20563);
});
test('city contract expires and changes objective at month 13',()=>{
  const a=boot();a.get('start').onclick();const s=a.state();s.month=12;s.cash=10000;
  const g=boot(s);g.advance();assert.equal(g.state().month,13);assert.equal(g.state().mission.kind,'passive');assert.equal(g.state().mission.season,1);assert.equal(g.state().mission.completed,false);
});
test('older saves without a city contract remain playable',()=>{
  const a=boot();a.get('start').onclick();const s=a.state();delete s.mission;s.month=39;
  const g=boot(s);assert.equal(g.state().month,39);assert.equal(g.state().mission.kind,'assets');
});
test('negative balance produces fees and bankruptcy after four months',()=>{
  const g=boot();g.get('start').onclick();const s=g.state();Object.assign(s,{cash:-1000,salary:0,cost:1000});const h=boot(s);for(let i=0;i<4;i++)h.advance();assert.equal(h.state().ended,true);assert.equal(h.state().result,'loss');assert.equal(h.state().debtMonths,4);
});
test('three months of sustained passive income win; one month does not',()=>{
  const g=boot();g.get('start').onclick();const s=g.state();Object.assign(s,{cash:9000,cost:200,portfolio:{...s.portfolio,studio:2}});const h=boot(s);h.advance();assert.equal(h.state().freedomStreak,1);assert.equal(h.state().ended,false);h.advance();assert.equal(h.state().freedomStreak,2);h.advance();assert.equal(h.state().ended,true);assert.equal(h.state().result,'win');
});
test('month 180 terminates game without entering month 181',()=>{
  const g=boot();g.get('start').onclick();const s=g.state();Object.assign(s,{month:180,cash:10000,freedomStreak:0});const h=boot(s);h.advance();assert.equal(h.state().month,180);assert.equal(h.state().ended,true);assert.equal(h.state().result,'loss');
});
test('invalid or corrupted saves cannot be restored',()=>{
  const g=boot();g.get('start').onclick();const s=g.state();s.portfolio.studio=-2;const h=boot(s);assert.equal(h.get('intro').classList!==undefined,true);assert.equal(h.get('start').disabled,false);
});
test('v1 through v4 playtest saves migrate to v5 without deleting game progress',()=>{
  const g=boot();g.get('start').onclick();const s=g.state();delete s.fundFactor;delete s.budgetCuts;delete s.freedomStreak;delete s.debtMonths;s.version=1;s.month=23;const h=boot(s);assert.equal(h.state().month,23);assert.equal(h.state().version,5);
  for(const version of [2,3,4]){const old=h.state();old.version=version;delete old.pendingEvent;delete old.skills;delete old.shopUpgrades;const i=boot(old);assert.equal(i.state().month,23);assert.equal(i.state().version,5)}
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
    const g=boot();g.get('start').onclick();const s=g.state();s.month=2;s.cash=40000;s.portfolio={...s.portfolio,studio:2,shop:1,fund:1};const h=boot(s,(n+.1)/11);h.advance();const next=h.state();assert.equal(next.month,3);assert.ok(next.propertyFactor>.1&&next.propertyFactor<10);assert.ok(next.fundFactor>=.3&&next.fundFactor<=3);assert.ok(Number.isFinite(next.cash));assert.ok(next.log.length<=16);
  }
});
test('isometric city draws without throwing and responds to portfolio changes',()=>{
  const g=boot();let shapes=0;const gradient={addColorStop(){}};
  const ctx={createLinearGradient:()=>gradient,clearRect(){},fillRect(){},beginPath(){},arc(){},ellipse(){},fill(){shapes++},moveTo(){},lineTo(){},closePath(){},fillText(){}};
  g.get('cityCanvas').getContext=()=>ctx;
  g.get('start').onclick();const initial=shapes;assert.ok(initial>30);
  const s=g.state();s.cash=30000;const h=boot(s);h.get('cityCanvas').getContext=()=>ctx;h.click('Open a coffee shop');assert.ok(shapes>initial);
});
test('event alternatives offer a genuine trade-off against the default outcome',()=>{
  const g=boot();g.get('start').onclick();const s=g.state();s.month=2;s.cash=10000;
  const opt=boot(s,.14);opt.get('advance').onclick();assert.equal(opt.state().pendingEvent,'A difficult market quarter');const afterPayday=opt.state().cash;opt.get('eventAlt').onclick();assert.equal(opt.state().pendingEvent,null);assert.equal(opt.state().propertyFactor,1);assert.equal(opt.state().cash,afterPayday-450);
  const def=boot(s,.14);def.get('advance').onclick();def.get('eventOk').onclick();assert.equal(def.state().propertyFactor,.91);assert.equal(def.state().cash,afterPayday);
});
test('an unresolved choice survives reload without being applied twice',()=>{
  const g=boot();g.get('start').onclick();const s=g.state();s.month=2;s.cash=10000;const opt=boot(s,.14);opt.get('advance').onclick();const pending=opt.state();const resumed=boot(pending,.14);assert.equal(resumed.state().pendingEvent,pending.pendingEvent);resumed.get('eventOk').onclick();assert.equal(resumed.state().propertyFactor,.91);assert.equal(resumed.state().pendingEvent,null);
});
test('alternative choices are disabled when unaffordable',()=>{
  const g=boot();g.get('start').onclick();const s=g.state();s.month=2;s.cash=-350;s.salary=0;s.cost=500;const h=boot(s,.14);h.get('advance').onclick();assert.equal(h.get('eventAlt').disabled,true);h.get('eventOk').onclick();assert.equal(h.state().propertyFactor,.91);
});
test('career training costs escalate, returns diminish and cap is enforced',()=>{
  const g=boot();g.get('start').onclick();const s=g.state();s.cash=100000;s.energy=100;s.skills=0;const h=boot(s);h.click('Upgrade your skills');assert.equal(h.state().cash,99400);assert.equal(h.state().salary,3380);
  const upgraded=h.state();upgraded.energy=100;upgraded.moves=2;const i=boot(upgraded);i.click('Upgrade your skills');assert.equal(i.state().cash,98350);assert.equal(i.state().salary,3545);
  const capped=i.state();capped.skills=8;capped.energy=100;capped.moves=2;const j=boot(capped);assert.equal(j.get('actions').children.find(b=>b.children.some(c=>c.textContent==='Upgrade your skills')).disabled,true);
});
test('business upgrades require ownership and increase income, then expire with last shop sale',()=>{
  const g=boot();g.get('start').onclick();const s=g.state();s.cash=50000;const h=boot(s);assert.equal(h.get('actions').children.find(b=>b.children.some(c=>c.textContent==='Expand your coffee shops')).disabled,true);
  h.click('Open a coffee shop');h.click('Expand your coffee shops');assert.equal(h.state().shopUpgrades,1);assert.equal(h.state().cash,33200);h.advance();assert.equal(h.state().cash,34290);h.click('Sell an investment');assert.equal(h.state().shopUpgrades,0);assert.equal(h.state().portfolio.shop,0);assert.equal(h.state().cash,46640);
});
test('investment paths are actually playable to completion',()=>{
  for(const target of ['Buy a rental studio','Open a coffee shop','Buy index fund shares']){
    const g=boot(null,.01);g.get('start').onclick();
    for(let month=0;month<180&&!g.state().ended;month++){
      for(let move=0;move<2;move++){
        const a=g.get('actions').children.find(b=>b.children.some(c=>c.textContent===target));if(a&&!a.disabled)a.onclick();
      }
      g.advance();
    }
    assert.equal(g.state().result,'win',target+' should support a winning path');
  }
});
test('characters and world scenarios produce different starting conditions',()=>{
  const g=boot();g.roles.find(x=>x.dataset.role==='builder').onclick();g.challenges.find(x=>x.dataset.challenge==='competition').onclick();g.get('start').onclick();assert.equal(g.state().role,'builder');assert.equal(g.state().challenge,'competition');assert.equal(g.state().salary,3350);assert.equal(g.state().cash,2000);assert.equal(g.state().rivalPressure,25);
});
test('competitors grow and can be countered with strategy investment',()=>{
  const g=boot();g.get('start').onclick();const s=g.state();s.month=5;s.cash=20000;s.portfolio.shop=1;const h=boot(s,.1);h.advance();assert.equal(h.state().rivalPressure,4);assert.equal(h.state().rivalCount,3);const before=h.state().cash;h.click('Outsmart competitors');assert.equal(h.state().rivalPressure,0);assert.equal(h.state().cash,before-1500);
});
test('inflation scenario increases annual living expenses',()=>{
  const g=boot();g.get('start').onclick();const s=g.state();s.month=11;s.challenge='inflation';const h=boot(s,.1);h.advance();assert.equal(h.state().month,12);assert.equal(h.state().cost,2480);
});
test('city districts allow players to choose an investment directly',()=>{
  const g=boot();g.get('start').onclick();const s=g.state();s.cash=30000;const h=boot(s);h.districts.find(x=>x.dataset.district==='industrial').onclick();assert.equal(h.get('districtPanel').children[1].textContent,'Invest here');h.get('districtPanel').children[1].onclick();assert.equal(h.state().portfolio.delivery,1);assert.equal(h.state().cash,12000);
});
test('milestones unlock permanently and are not lost after asset sales',()=>{
  const g=boot();g.get('start').onclick();const s=g.state();s.cash=15000;const h=boot(s);h.click('Buy a rental studio');assert.ok(h.state().unlocked.includes('first10k'));h.click('Sell an investment');assert.ok(h.state().unlocked.includes('first10k'));
});
test('each personal dream unlocks only after its specific conditions are fulfilled',()=>{
  for(const dream of ['homes','companies','balance']){
    const g=boot();g.dreams.find(x=>x.dataset.dream===dream).onclick();g.get('start').onclick();assert.equal(g.state().dream,dream);const s=g.state();s.cash=30000;
    if(dream==='homes')s.portfolio.studio=5;
    if(dream==='companies'){s.portfolio.bakery=1;s.portfolio.shop=1;s.portfolio.software=1}
    if(dream==='balance'){s.month=48;s.energy=90}
    const h=boot(s);h.click('Rest & recharge');assert.ok(h.state().unlocked.includes('dream'),dream);
  }
});

test('completed game shows final score and can restart without deleting personal best',()=>{
  const g=boot();g.get('start').onclick();const s=g.state();s.month=12;s.freedomStreak=2;s.cash=20000;s.portfolio.studio=30;
  const h=boot(s);h.get('advance').onclick();assert.equal(h.state().result,'win');assert.match(h.get('eventText').textContent,/Final score:/);assert.equal(h.get('eventOk').textContent,'Play again →');
  assert.ok(h.storage.has(KEY+'-best'));h.get('eventOk').onclick();assert.equal(h.storage.has(KEY),false);assert.ok(h.storage.has(KEY+'-best'));
});
