/* -----------------------------------------------------
   1. DATUM + UHRZEIT mit MonatsZAHL
----------------------------------------------------- */
function updateDateTime() {
    const now = new Date();

    let day = now.getDate();
    let month = now.getMonth() + 1;  // Monat als Zahl
    let year = now.getFullYear();

    document.getElementById("date").textContent =
        `${day}.${month}.${year}`;

    const time = now.toLocaleTimeString("de-DE", {
        hour: "2-digit",
        minute: "2-digit"
    });

    document.getElementById("time").textContent = time;
}

setInterval(updateDateTime, 1000);
updateDateTime();

/* -----------------------------------------------------
   2. TAB Navigation
----------------------------------------------------- */
const sections = {
  todoBtn: "todoSection",
  shopBtn: "shopSection",
  birthdayBtn: "birthdaySection",
  eventsBtn: "eventsSection"
};

for (let btn in sections) {
  document.getElementById(btn).addEventListener("click", () => {
    document.querySelector("nav .active").classList.remove("active");
    document.getElementById(btn).classList.add("active");

    document.querySelector("section.active").classList.remove("active");
    document.getElementById(sections[btn]).classList.add("active");
  });
}

/* -----------------------------------------------------
   3. DARK MODE
----------------------------------------------------- */
document.getElementById("themeToggle").onclick = () => {
    document.body.classList.toggle("dark");
};

/* -----------------------------------------------------
   4. DRAG & DROP Funktion für To-Do + Geburtstage
----------------------------------------------------- */
function enableDrag(containerId) {
    const list = document.getElementById(containerId);

    list.addEventListener("dragstart", e => {
        if (e.target.tagName === "LI") {
            e.target.classList.add("dragging");
        }
    });

    list.addEventListener("dragend", e => {
        if (e.target.tagName === "LI") {
            e.target.classList.remove("dragging");
            saveAll(); // Positionen speichern
        }
    });

    list.addEventListener("dragover", e => {
        e.preventDefault();
        const dragging = document.querySelector(".dragging");
        const after = [...list.querySelectorAll("li:not(.dragging)")]
            .find(li => e.clientY <= li.offsetTop + li.offsetHeight / 2);

        if (after) list.insertBefore(dragging, after);
        else list.appendChild(dragging);
    });
}

enableDrag("todoList");
enableDrag("birthdayList");

/* -----------------------------------------------------
   5. SPEICHERN & LADEN
----------------------------------------------------- */
function saveAll() {
    const saveList = (id) =>
      [...document.getElementById(id).children].map(li => li.textContent);

    localStorage.setItem("todos", JSON.stringify(saveList("todoList")));
    localStorage.setItem("shops", JSON.stringify(saveList("shopList")));
    localStorage.setItem("birthdays", JSON.stringify(saveList("birthdayList")));
    localStorage.setItem("events", JSON.stringify(saveList("eventList")));
}

function loadAll() {
    function loadList(id, items) {
        const ul = document.getElementById(id);
        ul.innerHTML = "";
        items.forEach(text => {
            const li = document.createElement("li");
            li.textContent = text;
            li.draggable = true;
            ul.appendChild(li);
        });
    }

    loadList("todoList", JSON.parse(localStorage.getItem("todos") || "[]"));
    loadList("shopList", JSON.parse(localStorage.getItem("shops") || "[]"));
    loadList("birthdayList", JSON.parse(localStorage.getItem("birthdays") || "[]"));
    loadList("eventList", JSON.parse(localStorage.getItem("events") || "[]"));
}

loadAll();

/* -----------------------------------------------------
   6. EINTRÄGE HINZUFÜGEN
----------------------------------------------------- */
function addItem(inputId, listId) {
    const input = document.getElementById(inputId);
    if (!input.value.trim()) return;

    const li = document.createElement("li");
    li.textContent = input.value;
    li.draggable = true;

    document.getElementById(listId).appendChild(li);
    input.value = "";

    saveAll();
}

document.getElementById("addTodo").onclick = () => addItem("todoInput", "todoList");
document.getElementById("addShop").onclick = () => addItem("shopInput", "shopList");
document.getElementById("addEvent").onclick = () => addItem("eventName", "eventList");

/* -----------------------------------------------------
   7. GEBURTSTAGE MIT ALTER
----------------------------------------------------- */
document.getElementById("addBirthday").onclick = () => {
    const name = document.getElementById("bName").value;
    const date = document.getElementById("bDate").value;

    if (!name || !date) return;

    const age = new Date().getFullYear() - new Date(date).getFullYear();

    const li = document.createElement("li");
    li.textContent = `${name} – ${date} – ${age} Jahre`;
    li.draggable = true;

    document.getElementById("birthdayList").appendChild(li);

    document.getElementById("bName").value = "";
    document.getElementById("bDate").value = "";

    saveAll();
};

/* -----------------------------------------------------
   8. ALLES LÖSCHEN
----------------------------------------------------- */
document.getElementById("clearTodo").onclick = () => {
    document.getElementById("todoList").innerHTML = "";
    saveAll();
};

/* (für alle anderen Listen genauso) */
["clearShop", "clearBirthday", "clearEvents"].forEach(id => {
    document.getElementById(id).onclick = () => {
        const target = id.replace("clear", "").toLowerCase() + "List";
        document.getElementById(target).innerHTML = "";
        saveAll();
    };
});

/* -----------------------------------------------------
   9. TEILEN
----------------------------------------------------- */
function shareList(id) {
    const items = [...document.getElementById(id).children].map(li => "• " + li.textContent).join("\n");

    navigator.share({
        title: "Meine Liste",
        text: items
    });
}

document.getElementById("shareTodo").onclick = () => shareList("todoList");
document.getElementById("shareShop").onclick = () => shareList("shopList");
document.getElementById("shareBirthday").onclick = () => shareList("birthdayList");
document.getElementById("shareEvents").onclick = () => shareList("eventList");
