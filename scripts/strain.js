const MODULE_ID = "pressao-das-profundezas";
const TOOLBELT = "pf2e-toolbelt";
const RESOURCE_SETTING = "resourceTracker.worldResources";
const VERSION = "0.1.0";

const LABELS = {
  fortitude:"Fortitude", reflex:"Reflexos", will:"Vontade", perception:"Percepção",
  athletics:"Atletismo", acrobatics:"Acrobacia", survival:"Sobrevivência",
  religion:"Religião", occultism:"Ocultismo", society:"Sociedade", medicine:"Medicina",
  stealth:"Furtividade", arcana:"Arcana", crafting:"Ofício", diplomacy:"Diplomacia",
  initiative:"Iniciativa"
};

const EVENTS = {
  1:["Pressão Sufocante",["fortitude","athletics","survival"]],
  2:["Sussurros nas Paredes",["will","religion","occultism"]],
  3:["Terreno Instável",["reflex","acrobatics","athletics"]],
  4:["Ecos Enganosos",["perception","society","occultism"]],
  5:["Ar Estagnado",["fortitude","medicine","survival"]],
  6:["Sombras Inquietas",["reflex","stealth","acrobatics"]],
  7:["Mau Presságio",["will","religion","society"]],
  8:["A Masmorra Observa",["perception","stealth","survival"]],
  9:["Influência Crescente",["fortitude","religion","occultism"]],
  10:["Memórias Intrusas",["will","society","occultism"]],
  11:["Ressonância Hostil",["reflex","arcana","crafting"]],
  12:["A Masmorra Aprende",["perception","survival","stealth"]],
  13:["Pulso das Profundezas",["fortitude","medicine","athletics"]],
  14:["Silêncio Absoluto",["will","survival","religion"]],
  15:["Presença Dominante",["reflex","acrobatics","occultism"]],
  16:["Caminhos Impossíveis",["perception","survival","society"]],
  17:["Olhos na Escuridão",["reflex","stealth","acrobatics"]],
  18:["Presságio de Desastre",["will","religion","diplomacy"]],
  19:["Pressão das Profundezas",["fortitude","athletics","medicine"]],
  20:["Desespero",["perception","religion","occultism"]]
};

const CONSEQUENCES = {
  1:[
    ["Ferimento Leve","O personagem sofre [[/r 1d6]] de dano."],
    ["Equipamento Arranhado","Um item sendo reparado perde [[/r 1d8]] HP."],
    ["Distraído","–1 de circunstância na próxima Iniciativa.",{selector:"initiative",value:-1}],
    ["Sentidos Perturbados","–1 de circunstância no próximo teste de Percepção.",{selector:"perception",value:-1}],
    ["Trabalho Prejudicado","–1 de circunstância no próximo teste de Crafting.",{selector:"crafting",value:-1}],
    ["Exploração Perturbada","–1 de circunstância no próximo teste relacionado à atividade de Exploração."]
  ],
  2:[
    ["Ferimento","O personagem sofre [[/r 2d6]] de dano."],
    ["Equipamento Danificado","Um item sendo reparado perde [[/r 2d8]] HP."],
    ["Mau Presságio","Começa o próximo encontro Frightened 1."],
    ["Reação Lenta","–2 de circunstância na próxima Iniciativa.",{selector:"initiative",value:-2}],
    ["Atenção Dividida","–2 de circunstância no próximo teste de Percepção.",{selector:"perception",value:-2}],
    ["Rastro Evidente","–2 de circunstância no próximo teste de Stealth.",{selector:"stealth",value:-2}],
    ["Exploração Prejudicada","–2 de circunstância no próximo teste relacionado à atividade de Exploração."]
  ],
  3:[
    ["Ferimento Grave","O personagem sofre [[/r 3d6]] de dano."],
    ["Equipamento Comprometido","Um item sendo reparado perde [[/r 3d8]] HP."],
    ["Nervos à Flor da Pele","Começa o próximo encontro Frightened 2."],
    ["Guarda Baixa","Off-Guard até o início do primeiro turno no próximo encontro."],
    ["Resposta Lenta","Slowed 1 durante o primeiro turno do próximo encontro."],
    ["Foco Interrompido","Se realizou Refocus, não recupera 1 Focus Point."],
    ["Tratamento Prejudicado","Fica imune a Treat Wounds por 1 hora."],
    ["Vigilância Quebrada","Se estava usando Scout, não fornece o bônus de Scout na próxima Iniciativa."],
    ["Busca Prejudicada","–2 de circunstância em Perception para Search até o próximo encontro."]
  ],
  4:[
    ["Ferimento Crítico","O personagem sofre [[/r 4d6]] de dano."],
    ["Equipamento Severamente Danificado","Um item sendo reparado perde [[/r 4d8]] HP."],
    ["Foco Drenado","Perde 1 Focus Point."],
    ["Refocus Frustrado","Se realizou Refocus, não recupera o Focus Point."],
    ["Tratamento Bloqueado","Fica imune a Treat Wounds por 1 hora."],
    ["Medicina de Combate Exaurida","Fica imune a Battle Medicine por 1 hora."],
    ["Terror Crescente","Começa o próximo encontro Frightened 2."],
    ["Resposta Comprometida","Slowed 1 durante o primeiro turno do próximo encontro."],
    ["Guarda Baixa","Off-Guard até o fim do primeiro turno no próximo encontro."],
    ["Sentidos Confusos","Dazzled durante a primeira rodada do próximo encontro."],
    ["Exploração Interrompida","Não recebe o benefício da atividade de Exploração quando o próximo encontro começa."]
  ]
};

const LEVEL_DC = {0:14,1:15,2:16,3:18,4:19,5:20,6:22,7:23,8:24,9:26,10:27,11:28,12:30,13:31,14:32,15:34,16:35,17:36,18:38,19:39,20:40,21:42,22:44,23:46,24:48,25:50};

let activeRest = null;
let socketReady = false;

function esc(s){ return foundry.utils.escapeHTML(String(s ?? "")); }
function requiredProgress(minutes){ return Math.max(Math.floor(minutes/10)-1,0); }
function penaltyFor(n){ return -Math.min((n-1)*2,8); }
function getResources(){ return game.settings.get(TOOLBELT, RESOURCE_SETTING) ?? []; }
function getResource(name){ return getResources().find(r=>r.name===name); }

async function changeResource(name, amount){
  const resources = foundry.utils.deepClone(getResources());
  const r = resources.find(x=>x.name===name);
  if(!r) throw new Error(`Resource "${name}" não encontrado.`);
  const oldValue=Number(r.value??0);
  r.value=Math.max(Number(r.min??0),Math.min(Number(r.max??999),oldValue+amount));
  await game.settings.set(TOOLBELT, RESOURCE_SETTING, resources);
  return {oldValue,newValue:r.value};
}

function getStatistic(actor, slug){
  const s=actor.getStatistic?.(slug);
  if(s) return s;
  if(["fortitude","reflex","will"].includes(slug)) return actor.saves?.[slug] ?? null;
  if(slug==="perception") return actor.perception ?? null;
  return actor.skills?.[slug] ?? null;
}

function normalizeDegree(v){
  if(typeof v==="number") return ({0:"criticalFailure",1:"failure",2:"success",3:"criticalSuccess"})[v] ?? null;
  if(v==null) return null;
  const t=String(v).toLowerCase().replaceAll(" ","").replaceAll("-","").replaceAll("_","");
  return ({criticalsuccess:"criticalSuccess",success:"success",failure:"failure",criticalfailure:"criticalFailure"})[t] ?? null;
}

function makeModifier(value,n){
  if(!value) return [];
  const data={label:`Pressão das Profundezas — Teste ${n}`,modifier:value,type:"untyped"};
  const C=game.pf2e?.Modifier ?? CONFIG.PF2E?.Modifier;
  try { return C ? [new C(data)] : [data]; } catch { return [data]; }
}

async function rollStatistic(actor, slug, penalty, eventName, n){
  const statistic=getStatistic(actor,slug);
  if(!statistic) throw new Error(`${actor.name} não possui ${slug}.`);
  const level=Number(actor.level ?? actor.system?.details?.level?.value ?? 0);
  const dc=LEVEL_DC[level];
  if(dc===undefined) throw new Error(`DC não configurada para nível ${level}.`);
  let cbOutcome=null, cbMessage=null;
  const result=await statistic.roll({
    dc:{value:dc},
    modifiers:makeModifier(penalty,n),
    label:`${eventName} — ${LABELS[slug]??slug}`,
    callback:(roll,outcome,message)=>{ cbOutcome=outcome??null; cbMessage=message??null; }
  });
  return normalizeDegree(cbOutcome ?? result?.degreeOfSuccess ?? result?.outcome ?? cbMessage?.flags?.pf2e?.context?.outcome);
}

function playerActor(){
  const char=game.user.character;
  if(char?.type==="character") return char;
  const owned=canvas?.tokens?.placeables?.map(t=>t.actor).filter(a=>a?.type==="character" && a.isOwner) ?? [];
  return owned.length===1 ? owned[0] : null;
}

async function createPenaltyEffect(actor,name,selector,value){
  return actor.createEmbeddedDocuments("Item",[{
    name:`Strain — ${name}`, type:"effect", img:"icons/svg/downgrade.svg",
    system:{
      description:{value:`<p>${value} de penalidade de circunstância no próximo teste de ${LABELS[selector]??selector}.</p>`},
      level:{value:1},
      duration:{value:-1,unit:"unlimited",sustained:false,expiry:null},
      tokenIcon:{show:true}, unidentified:false, start:{value:0,initiative:null}, badge:null,
      rules:[{key:"FlatModifier",selector,type:"circumstance",value,label:`Strain — ${name}`,removeAfterRoll:"if-enabled"}],
      slug:null, traits:{value:[],rarity:"common",otherTags:[]}
    }
  }]);
}

async function gmFailure(data){
  if(!game.user.isGM) return;
  const actor=await fromUuid(data.actorUuid);
  if(!actor) return;
  let vp={oldValue:"?",newValue:"?"};
  try { vp=await changeResource("Villain Point",1); } catch(e){ console.error(e); }
  const severity=data.degree==="criticalFailure" ? Math.min(data.strain+1,4) : data.strain;
  await ChatMessage.create({content:`<h2>${data.degree==="criticalFailure"?"Falha Crítica":"Falha"}</h2>
    <p><strong>${esc(actor.name)}</strong> sucumbe à pressão de <strong>${esc(data.eventName)}</strong>.</p>
    <p><strong>+1 Villain Point</strong> (${vp.oldValue} → ${vp.newValue})</p>`});
  const rows=(CONSEQUENCES[severity]??[]).map((c,i)=>{
    const btn=c[2]?`<button class="pdp-effect" data-actor="${actor.uuid}" data-severity="${severity}" data-index="${i}">
      <i class="fas fa-bolt"></i> Aplicar Efeito</button>`:"";
    return `<div class="pdp-consequence"><strong>${i+1}. ${c[0]}</strong><p>${c[1]}</p>${btn}</div>`;
  }).join("");
  const hist=data.history.map(h=>`<li>Teste ${h.n}: <strong>${({criticalSuccess:"Sucesso Crítico",success:"Sucesso",failure:"Falha",criticalFailure:"Falha Crítica"})[h.degree]}</strong> ${h.penalty?`(${h.penalty})`:"(sem penalidade)"}</li>`).join("");
  await ChatMessage.create({
    whisper:game.users.filter(u=>u.isGM).map(u=>u.id),
    content:`<h2>Consequência de Strain</h2><p><strong>Personagem:</strong> ${esc(actor.name)}</p>
    <p><strong>Evento:</strong> ${esc(data.eventName)}</p><p><strong>Teste:</strong> ${LABELS[data.check]??data.check}</p>
    <p><strong>Strain:</strong> ${data.strain}${severity!==data.strain?` → consequências Strain ${severity}`:""}</p>
    <h3>Rolagens</h3><ul>${hist}</ul><hr><h3>Escolha 1 consequência — Strain ${severity}</h3>${rows}`
  });
  activeRest=null;
}

async function gmSuccess(data){
  if(!game.user.isGM) return;
  const actor=await fromUuid(data.actorUuid);
  await ChatMessage.create({content:`<h2>Pressão Superada</h2><p><strong>${esc(actor?.name??"Personagem")}</strong> superou <strong>${esc(data.eventName)}</strong>.</p>
  <p>Progresso: <strong>${data.progress}/${data.required}</strong></p><p>O descanso de <strong>${data.minutes} minutos</strong> foi concluído.</p>`});
  activeRest=null;
}

async function runPlayerSequence(payload){
  if(payload.userId!==game.user.id) return;
  const actor=playerActor();
  if(!actor){
    ui.notifications.warn("Defina um personagem para este usuário em User Configuration, ou tenha exatamente um personagem seu na cena.");
    return;
  }
  let progress=0, n=1;
  const history=[];
  while(progress<payload.required){
    const penalty=penaltyFor(n);
    let degree;
    try { degree=await rollStatistic(actor,payload.check,penalty,payload.eventName,n); }
    catch(e){ console.error(e); ui.notifications.error(`Erro ao rolar ${LABELS[payload.check]??payload.check}.`); return; }
    if(!degree){ ui.notifications.error("Não foi possível identificar o grau de sucesso."); return; }
    history.push({n,penalty,degree});
    if(degree==="criticalSuccess") progress+=2;
    else if(degree==="success") progress+=1;
    else {
      game.socket.emit(`module.${MODULE_ID}`,{type:"failure",data:{
        actorUuid:actor.uuid,eventName:payload.eventName,check:payload.check,strain:payload.strain,degree,history
      }});
      return;
    }
    if(progress>=payload.required){
      game.socket.emit(`module.${MODULE_ID}`,{type:"success",data:{
        actorUuid:actor.uuid,eventName:payload.eventName,progress,required:payload.required,minutes:payload.minutes
      }});
      return;
    }
    n++;
  }
}

async function startRest(){
  if(!game.user.isGM){ ui.notifications.warn("Apenas o GM pode iniciar."); return; }
  const strain=Number(getResource("Strain")?.value);
  if(!Number.isInteger(strain)||strain<1||strain>4){ ui.notifications.error("Resource Tracker 'Strain' precisa estar entre 1 e 4."); return; }

  let opts="";
  for(let m=10;m<=120;m+=10) opts+=`<option value="${m}">${m} minutos</option>`;
  new Dialog({
    title:"Pressão das Profundezas — Short Rest",
    content:`<div class="form-group"><label>Duração</label><select id="pdp-duration">${opts}</select></div><p>Os primeiros <strong>10 minutos</strong> são seguros.</p>`,
    buttons:{
      start:{label:"Resolver Descanso",callback:async html=>{
        const minutes=Number(html.find("#pdp-duration").val());
        const required=requiredProgress(minutes);
        if(required===0){ await ChatMessage.create({content:"<h2>Short Rest Concluída</h2><p>10 minutos de descanso. Nenhum Evento de Strain ocorreu.</p>"}); return; }
        const r=await new Roll("1d20").evaluate();
        const eventNo=Number(r.total), [eventName,tests]=EVENTS[eventNo];
        const restId=foundry.utils.randomID();
        activeRest={restId,eventNo,eventName,tests,minutes,required,strain,resolved:false};
        const buttons=tests.map(t=>`<button class="pdp-check" data-rest="${restId}" data-check="${t}"><i class="fas fa-dice-d20"></i> ${LABELS[t]??t}</button>`).join("");
        await ChatMessage.create({content:`<h2>Evento de Strain</h2><h3>${esc(eventName)}</h3>
          <p><strong>Duração:</strong> ${minutes} minutos<br><strong>Strain:</strong> ${strain}/4<br><strong>Progresso necessário:</strong> ${required}</p>
          <p><strong>Escolha como enfrentar o evento:</strong></p><div class="pdp-checks">${buttons}</div>
          <p class="pdp-note">Sucesso = 1 progresso • Sucesso Crítico = 2<br>Penalidades: +0 → −2 → −4 → −6 → −8</p>`});
      }},
      cancel:{label:"Cancelar"}
    }, default:"start"
  }).render(true);
}

Hooks.once("init",()=>{
  console.log(`Pressão das Profundezas v${VERSION} | init`);
});

Hooks.once("ready",()=>{
  game.pressaoDasProfundezas={startRest,version:VERSION};

  game.socket.on(`module.${MODULE_ID}`, async packet=>{
    if(!packet?.type) return;
    if(packet.type==="choose"){
      if(!game.user.isGM) return;
      if(!activeRest || activeRest.restId!==packet.data.restId || activeRest.resolved) return;
      activeRest.resolved=true;
      game.socket.emit(`module.${MODULE_ID}`,{type:"run",data:{
        userId:packet.data.userId,check:packet.data.check,eventName:activeRest.eventName,
        minutes:activeRest.minutes,required:activeRest.required,strain:activeRest.strain
      }});
      return;
    }
    if(packet.type==="run") return runPlayerSequence(packet.data);
    if(packet.type==="failure") return gmFailure(packet.data);
    if(packet.type==="success") return gmSuccess(packet.data);
  });

  Hooks.on("renderChatMessageHTML",(message,html)=>{
    const root=html instanceof HTMLElement?html:html?.[0]??html;
    if(!root) return;

    for(const b of root.querySelectorAll(".pdp-check")){
      if(b.dataset.pdpReady) continue;
      b.dataset.pdpReady="1";
      b.addEventListener("click",()=>{
        const restId=b.dataset.rest, check=b.dataset.check;
        game.socket.emit(`module.${MODULE_ID}`,{type:"choose",data:{restId,check,userId:game.user.id}});
        for(const x of root.querySelectorAll(".pdp-check")) x.disabled=true;
        b.innerHTML=`<i class="fas fa-spinner fa-spin"></i> ${LABELS[check]??check}`;
      });
    }

    for(const b of root.querySelectorAll(".pdp-effect")){
      if(b.dataset.pdpReady) continue;
      b.dataset.pdpReady="1";
      b.addEventListener("click",async()=>{
        if(!game.user.isGM) return;
        const actor=await fromUuid(b.dataset.actor);
        const c=CONSEQUENCES[Number(b.dataset.severity)]?.[Number(b.dataset.index)];
        if(!actor||!c?.[2]) return;
        try{
          await createPenaltyEffect(actor,c[0],c[2].selector,c[2].value);
          b.disabled=true; b.innerHTML='<i class="fas fa-check"></i> Aplicado';
          ui.notifications.info(`${c[0]} aplicado em ${actor.name}.`);
        }catch(e){ console.error(e); ui.notifications.error("Falha ao criar o Effect; veja o console."); }
      });
    }
  });

  console.log(`Pressão das Profundezas v${VERSION} pronta. Use game.pressaoDasProfundezas.startRest()`);
});
