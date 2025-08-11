
function autocomplete(inp, arr, callback) {
    let currentFocus;

    inp.addEventListener("input", function () {
        const val = this.value.trim().toLowerCase();
        closeAllLists();

        if (!val) return false;
        currentFocus = -1;

        const listDiv = document.createElement("DIV");
        listDiv.setAttribute("id", this.id + "autocomplete-list");
        listDiv.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(listDiv);

        // Improved matching: substring, case-insensitive, ranked
        let matches = arr.filter(item => item.toLowerCase().includes(val));
        matches.sort((a, b) => {
            const ai = a.toLowerCase().indexOf(val);
            const bi = b.toLowerCase().indexOf(val);
            return ai - bi; // earlier matches first
        });

        matches.forEach(item => {
            const itemDiv = document.createElement("DIV");
            const idx = item.toLowerCase().indexOf(val);
            // Highlight matched part
            if (idx >= 0) {
                itemDiv.innerHTML =
                    item.substr(0, idx) +
                    "<strong>" + item.substr(idx, val.length) + "</strong>" +
                    item.substr(idx + val.length);
            } else {
                itemDiv.innerHTML = item;
            }
            itemDiv.innerHTML += "<input type='hidden' value='" + item + "'>";
            itemDiv.addEventListener("click", function () {
                inp.value = this.getElementsByTagName("input")[0].value;
                closeAllLists();
                if (callback) callback(inp.value);
            });
            listDiv.appendChild(itemDiv);
        });
    });

    inp.addEventListener("keydown", function (e) {
        let list = document.getElementById(this.id + "autocomplete-list");
        if (list) list = list.getElementsByTagName("div");
        if (e.keyCode == 40) { // arrow down
            currentFocus++;
            addActive(list);
        } else if (e.keyCode == 38) { // arrow up
            currentFocus--;
            addActive(list);
        } else if (e.keyCode == 13) { // enter
            e.preventDefault();
            if (currentFocus > -1 && list) list[currentFocus].click();
        }
    });

    function addActive(list) {
        if (!list) return false;
        removeActive(list);
        if (currentFocus >= list.length) currentFocus = 0;
        if (currentFocus < 0) currentFocus = list.length - 1;
        list[currentFocus].classList.add("autocomplete-active");
    }

    function removeActive(list) {
        for (let i = 0; i < list.length; i++) list[i].classList.remove("autocomplete-active");
    }

    function closeAllLists(elmnt) {
        const items = document.getElementsByClassName("autocomplete-items");
        for (let i = 0; i < items.length; i++) {
            if (elmnt != items[i] && elmnt != inp) items[i].parentNode.removeChild(items[i]);
        }
    }

    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });

}
