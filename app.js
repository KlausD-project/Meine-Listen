const sections=["todo","shop","birthday","events"];
const STORAGE={todo:"todoItems_mobile",shop:"shopItems_mobile",birthday:"birthdayItems_mobile",events:"eventItems_mobile"};

// Navigation
sections.forEach(sec=>{
  document.getElementById(sec+"Btn").addEventListener("click",()=>switchSection(sec));
});
function switchSection(type){
  sections.forEach(sec=>{
    document.getElementById(sec+"Section").style.display=(sec===type)?"block":"none";
    document.getElementById(sec+"Btn").classList.toggle("active", sec===type);
  });
}

// Theme toggle
const themeToggle=document.getElementById("themeToggle");
themeToggle.addEventListener("click",()=>{
  const isDark=document.documentElement.getAttribute("data-theme")==="dark";
  if(isDark){document.documentElement.removeAttribute("data-theme");localStorage.removeItem("theme");}
  else{document.documentElement.setAttribute("data-theme","dark");localStorage.setItem("theme","dark");}
});
if(localStorage.getItem("theme")==="dark"){document.documentElement.setAttribute("data-theme","dark");}

// Datum & Uhrzeit
function updateDateTime(){
  const now=new Date();
  const options={day:"2-digit",month:"long",year:"numeric"};
  const dateStr=now.toLocaleDateString("de-DE",options);
  const timeStr=now.toLocaleTimeString("de-DE",{hour:"2-digit",minute:"2-digit"});
  document.getElementById("dateTime").textContent=`${dateStr} — ${timeStr} Uhr`;
}
updateDateTime(); setInterval(updateDateTime,1000);

// CRUD & Sharing
sections.forEach(sec=>{
  const input=document.getElementById(sec+"Input") || document.getElementById(sec+"Name");
  const addBtn=document.getElementById(sec+"Add");
  const clearBtn=document.getElementById(sec+"Clear");
  const shareBtn=document.getElementById(sec+"Share");
  if(addBtn) addBtn.addEventListener("click",()=> sec==="birthday"? addBirthday(): addItem(sec));
  if(clearBtn) clearBtn.addEventListener("click",()=>clearAll(sec));
  if(shareBtn) shareBtn.addEventListener("click",()=>shareList(sec));
  if(input) input.addEventListener("keydown",e=>{if(e.key==="Enter") sec==="birthday"? addBirthday(): addItem(sec);});
});

function loadItems(type){return JSON.parse(localStorage.getItem(STORAGE[type])||"[]");}
function saveItems(type,items){localStorage.setItem(STORAGE[type],JSON.stringify(items));}

function addItem(type){
  const input=document.getElementById(type+"Input");
  const text=input.value.trim(); if(!text) return;
  const item={text,done:false,date:new Date().toLocaleDateString(),id:Date.now()};
  const items=loadItems(type); items.push(item); saveItems(type,items); input.value="";
  renderList(type);
}

function deleteItem(type,index){
  if(!confirm("Wirklich löschen?")) return;
  const items=loadItems(type);
  items.splice(index,1); saveItems(type,items);
  renderList(type);
}

function clearAll(type){
  if(!confirm("Wirklich alle löschen?")) return;
  localStorage.removeItem(STORAGE[type]);
  renderList(type);
}

function shareList(type){
  const items=loadItems(type);
  if(items.length===0){alert("Keine Einträge zum Teilen."); return;}
  let text="";
  if(type==="birthday"){
    items.forEach(i=>text+=`${i.text} — ${calculateAge(i.birthDate)} Jahre\n`);
  }else{
    items.forEach(i=>text+=`- ${i.text}\n`);
  }
  if(navigator.share){navigator.share({title:`Meine ${type} Liste`,text});}
  else{prompt("Liste kopieren:",text);}
}

// Geburtstagsliste
const birthdayNameInput=document.getElementById("birthdayName");
const birthdayDateInput=document.getElementById("birthdayDate");
function addBirthday(){
  const name=birthdayNameInput.value.trim();
  const dateStr=birthdayDateInput.value;
  if(!name || !dateStr) return;
  const item={text:name,birthDate:dateStr,done:false,date:new Date().toLocaleDateString(),id:Date.now()};
  const items=loadItems("birthday"); items.push(item); saveItems("birthday",items);
  birthdayNameInput.value=""; birthdayDateInput.value="";
  renderList("birthday");
}
function calculateAge(birthDateStr){
  const birthDate=new Date(birthDateStr);
  const today=new Date();
  let age=today.getFullYear()-birthDate.getFullYear();
  const m=today.getMonth()-birthDate.getMonth();
  if(m<0||(m===0 && today.getDate()<birthDate.getDate())) age--;
  return age;
}

// Render List & Drag & Drop To-Do + Birthday
function renderList(type){
  const list=document.getElementById(type+"List");
  if(!list) return;
  list.innerHTML="";
  const items=loadItems(type);
  items.forEach(item=>{
    const li=document.createElement("li");
    li.setAttribute("draggable",(type==="todo"||type==="birthday"));
    li.dataset.id=item.id;
    if(item.done) li.classList.add("completed");

    const left=document.createElement("div");
    left.style.display="flex"; left.style.alignItems="center"; left.style.gap="12px";

    const checkbox=document.createElement("input");
    checkbox.type="checkbox"; checkbox.checked=item.done;
    checkbox.addEventListener("change",()=>{item.done=!item.done; saveItems(type,items); renderList(type);});

    const span=document.createElement("span"); span.className="text";
    if(type==="birthday" && item.birthDate) span.textContent=`${item.text} — ${calculateAge(item.birthDate)} Jahre`;
    else span.textContent=item.text;

    const meta=document.createElement("span"); meta.className="meta"; meta.textContent=item.date;

    const del=document.createElement("button"); del.textContent="✖";
    del.addEventListener("click",()=>deleteItem(type,items.findIndex(i=>i.id===item.id)));

    left.appendChild(checkbox); left.appendChild(span); left.appendChild(meta);
    li.appendChild(left); li.appendChild(del);
    list.appendChild(li);

    // Drag & Drop for To-Do & Birthday
    if(type==="todo"||type==="birthday"){
      li.addEventListener("dragstart",e=>{e.dataTransfer.setData("text/plain",item.id); li.style.opacity="0.5";});
      li.addEventListener("dragend",e=>{li.style.opacity="1";});
      li.addEventListener("dragover",e=>e.preventDefault());
      li.addEventListener("drop",e=>{
        e.preventDefault();
        const draggedId=parseInt(e.dataTransfer.getData("text/plain"));
        const targetId=item.id;
        if(draggedId===targetId) return;
        const items=loadItems(type);
        const draggedIndex=items.findIndex(i=>i.id===draggedId);
        const targetIndex=items.findIndex(i=>i.id===targetId);
        const [draggedItem]=items.splice(draggedIndex,1);
        items.splice(targetIndex,0,draggedItem);
        saveItems(type,items);
        renderList(type);
      });
    }
  });
}

// Initial Render
sections.forEach(sec=>renderList(sec));
