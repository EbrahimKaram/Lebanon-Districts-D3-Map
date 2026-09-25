function autocomplete(inp, items, onSelect, opts) {
    let currentFocus;
    opts = opts || {};
    const maxResults = opts.maxResults || 12;
    // matcher(item, query) -> index of match in the searchable text, or -1
    const matcher = opts.matcher || ((item, q) => String(item.label).toLowerCase().indexOf(q));

    inp.addEventListener("input", function () {
        const val = this.value.trim();
        closeAllLists();

        if (!val) return false;
        currentFocus = -1;

        const listDiv = document.createElement("DIV");
        listDiv.setAttribute("id", this.id + "autocomplete-list");
        listDiv.setAttribute("class", "autocomplete-items");
        this.parentNode.appendChild(listDiv);

        const q = val.toLowerCase();

        // Ranked matching: earliest match position first
        let matches = [];
        items.forEach(item => {
            const idx = matcher(item, q);
            if (idx >= 0) matches.push({ item, idx });
        });
        matches.sort((a, b) => a.idx - b.idx);
        matches = matches.slice(0, maxResults);

        if (!matches.length) {
            const noneDiv = document.createElement("DIV");
            noneDiv.setAttribute("class", "autocomplete-no-results");
            noneDiv.textContent = "No villages found";
            listDiv.appendChild(noneDiv);
            return;
        }

        matches.forEach(({ item }) => {
            const itemDiv = document.createElement("DIV");
            const label = String(item.label);
            // Highlight the matched part when the query appears in the label itself
            const li = label.toLowerCase().indexOf(q);
            if (li >= 0) {
                itemDiv.innerHTML =
                    escapeHtml(label.substr(0, li)) +
                    "<strong>" + escapeHtml(label.substr(li, q.length)) + "</strong>" +
                    escapeHtml(label.substr(li + q.length));
            } else {
                itemDiv.textContent = label;
            }
            if (item.sub) {
                const subSpan = document.createElement("SPAN");
                subSpan.setAttribute("class", "sub");
                subSpan.textContent = item.sub;
                itemDiv.appendChild(subSpan);
            }
            itemDiv.addEventListener("mousedown", function (e) {
                e.preventDefault(); // keep focus so the click registers before blur
                closeAllLists();
                if (onSelect) onSelect(item);
            });
            listDiv.appendChild(itemDiv);
        });
    });

    inp.addEventListener("keydown", function (e) {
        let list = document.getElementById(this.id + "autocomplete-list");
        if (list) list = list.querySelectorAll(":scope > div:not(.autocomplete-no-results)");
        if (e.keyCode == 40) { // arrow down
            e.preventDefault();
            currentFocus++;
            addActive(list);
        } else if (e.keyCode == 38) { // arrow up
            e.preventDefault();
            currentFocus--;
            addActive(list);
        } else if (e.keyCode == 13) { // enter
            e.preventDefault();
            if (currentFocus > -1 && list && list[currentFocus]) {
                list[currentFocus].dispatchEvent(new MouseEvent("mousedown"));
            } else if (opts.onEnterRaw && this.value.trim()) {
                closeAllLists();
                opts.onEnterRaw(this.value);
            }
        } else if (e.keyCode == 27) { // escape
            closeAllLists();
        }
    });

    function addActive(list) {
        if (!list || !list.length) return false;
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

    function escapeHtml(s) {
        return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    document.addEventListener("click", function (e) {
        closeAllLists(e.target);
    });

}
