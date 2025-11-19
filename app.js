/* Sections and storage keys */
const sections = ["todo", "shop", "birthday", "events"];
const STORAGE = { todo:"todo_mobile_v1", shop:"shop_mobile_v1", birthday:"birthday_mobile_v1", events:"events_mobile_v1" };

/* Navigation */
sections.forEach(sec=>{
  const btn=document.getElementById(sec+"Btn");
  if(!btn)return;
  btn.addEventListener("click",()=>switchSection(sec));
});
function switchSection(type){
  sections.forEach(sec=>{
    const secEl=document.getElementById(sec+"Section");
    const btnEl=document.getElementById(sec+"Btn");
    if(secEl) secEl.style.display=(sec===type)?"block":"none";
    if(btnEl) btnEl.classList.toggle("active", sec===type);
  });
}

/* Theme toggle */
const themeToggle=document.getElementById("themeToggle");
if(themeToggle){
  themeToggle.addEventListener("click",()=>{
    const isDark=document.documentElement.getAttribute("data-theme")==="dark";
    if(isDark){ document.documentElement.removeAttribute("data-theme"); localStorage.removeItem("theme"); }
    else{ document.documentElement.setAttribute("data-theme","dark"); localStorage.setItem("theme","dark"); }
  });
  if(localStorage.getItem("theme")==="dark") document.documentElement.setAttribute("data-theme","dark");
}

/* Date & Time */
function updateDateTime(){
  const now=new Date();
  const dd=String(now.getDate()).padStart(2,"0");
  const mm=String(now.getMonth()+1).padStart(2,"0");
  const yyyy=now.getFullYear();
  const time=now.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"});
  const node=document.getElementById("dateTime");
  if(node) node.textContent=`${dd}.${mm}.${yyyy} ${time} Uhr`;
}
updateDateTime(); setInterval(updateDateTime,1000);

/* Storage */
function loadItems(type){ try{ return JSON.parse(localStorage.getItem(STORAGE[type])||"[]"); }catch(e){return[];} }
function saveItems(type,items){ localStorage.setItem(STORAGE[type],JSON.stringify(items)); }

/* Generic add/delete/clear/share */
function addItem(type){
  const input=document.getElementById(type+"Input");
  if(!input) return;
  const text=input.value.trim();
  if(!text) return;
  const items=loadItems(type);
  items.push({text,done:false,date:new Date().toLocaleDateString(),id:Date.now()});
  saveItems(type,items); input.value=""; renderList(type);
}
function deleteItem(type,index){ if(!confirm("Wirklich löschen?")) return; const items=loadItems(type); if(index<0||index>=items.length) return; items.splice(index,1); saveItems(type,items); renderList(type); }
function clearAll(type){ if(!confirm("Wirklich alle löschen?")) return; localStorage.removeItem(STORAGE[type]); renderList(type); }
function shareList(type){
  const items=loadItems(type); if(!items.length){ alert("Keine Einträge zum Teilen."); return; }
  let text=""; items.forEach(i=>text+=`- ${i.text}\n`);
  if(navigator.share){ navigator.share({title:`Meine ${type} Liste`, text}).catch(()=>{}); } else { prompt("Liste kopieren:",text); }
}

/* Birthday */
const birthdayName=document.getElementById("birthdayName");
const birthdayDate=document.getElementById("birthdayDate");
function addBirthday(){
  if(!birthdayName||!birthdayDate) return;
  const name=birthdayName.value.trim();
  const dateStr=birthdayDate.value.trim();
  if(!name||!dateStr) return;
  const items=loadItems("birthday");
  items.push({text:name,birthDate:dateStr,done:false,date:new Date().toLocaleDateString(),id:Date.now()});
  saveItems("birthday",items);
  birthdayName.value=""; birthdayDate.value=""; renderList("birthday");
}
function calcAge(birthDateStr){ const b=new Date(birthDateStr); const today=new Date(); let age=today.getFullYear()-b.getFullYear(); const m=today.getMonth()-b.getMonth(); if(m<0||(m===0&&today.getDate()<b.getDate())) age--; return age; }

/* Render lists */
function renderList(type){
  const list=document.getElementById(type+"List"); if(!list) return;
  list.innerHTML=""; const items=loadItems(type);
  items.forEach(item=>{
    const li=document.createElement("li");
    const draggable=(type==="todo"||type==="birthday"); if(draggable) li.setAttribute("draggable","true");
    li.dataset.id=item.id; if(item.done) li.classList.add("completed");

    const left=document.createElement("div"); left.style.display="flex"; left.style.alignItems="center"; left.style.gap="10px";
    const cb=document.createElement("input"); cb.type="checkbox"; cb.checked=!!item.done;
    cb.addEventListener("change",()=>{ const arr=loadItems(type); const localIdx=arr.findIndex(i=>i.id===item.id); if(localIdx>=0){ arr[localIdx].done=!arr[localIdx].done; saveItems(type,arr); renderList(type); } });
    const span=document.createElement("span"); span.className="text";
    if(type==="birthday"&&item.birthDate){ span.textContent=`${item.text} — ${calcAge(item.birthDate)} Jahre`; }
    else{ span.textContent=item.text; }
    const meta=document.createElement("span"); meta.className="meta";
    if(type==="birthday"&&item.birthDate){ meta.textContent=item.birthDate; } else { meta.textContent=item.date||""; }
    const delBtn=document.createElement("button"); delBtn.textContent="✖"; delBtn.addEventListener("click",()=>{ const arr=loadItems(type); const localIdx=arr.findIndex(i=>i.id===item.id); deleteItem(type,localIdx); });

    left.appendChild(cb); left.appendChild(span); left.appendChild(meta);
    li.appendChild(left); li.appendChild(delBtn);
    list.appendChild(li);

    if(draggable){
      li.addEventListener("dragstart",e=>{ e.dataTransfer.setData("text/plain",item.id); li.style.opacity="0.5"; });
      li.addEventListener("dragend",e=>{ li.style.opacity="1"; });
      li.addEventListener("dragover",e=>e.preventDefault());
      li.addEventListener("drop",e=>{
        e.preventDefault();
        const draggedId=parseInt(e.dataTransfer.getData("text/plain"));
        const targetId=item.id;
        if(draggedId===targetId) return;
        const arr=loadItems(type);
        const from=arr.findIndex(i=>i.id===draggedId);
        const to=arr.findIndex(i=>i.id===targetId);
        if(from<0||to<0) return;
        const [moved]=arr.splice(from,1); arr.splice(to,0,moved);
        saveItems(type,arr); renderList(type);
      });
    }
  });
}

/* Setup UI */
function setupUI(){
  ["todo","shop","events"].forEach(type=>{
    const addBtn=document.getElementById(type+"Add");
    const input=document.getElementById(type+"Input");
    const clearBtn=document.getElementById(type+"Clear");
    const shareBtn=document.getElementById(type+"Share");
    if(addBtn) addBtn.addEventListener("click",()=>addItem(type));
    if(input) input.addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); addItem(type); }});
    if(clearBtn) clearBtn.addEventListener("click",()=>clearAll(type));
    if(shareBtn) shareBtn.addEventListener("click",()=>shareList(type));
  });

  const bAdd=document.getElementById("birthdayAdd");
  const bClear=document.getElementById("birthdayClear");
  const bShare=document.getElementById("birthdayShare");
  if(bAdd) bAdd.addEventListener("click",()=>addBirthday());
  if(bClear) bClear.addEventListener("click",()=>clearAll("birthday"));
  if(bShare) bShare.addEventListener("click",()=>shareList("birthday"));
  if(birthdayName) birthdayName.addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); addBirthday(); }});
  if(birthdayDate) birthdayDate.addEventListener("keydown",e=>{ if(e.key==="Enter"){ e.preventDefault(); addBirthday(); }});
}

/* Initial render */
setupUI(); sections.forEach(s=>renderList(s));
