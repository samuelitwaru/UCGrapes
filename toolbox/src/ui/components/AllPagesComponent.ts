export class AllPagesComponent {
    pages: any[];
    constructor(pages:any[]){
        this.pages = pages

        const listContainer = document.createElement("ul");
        listContainer.classList.add("tb-custom-list");
        this.pages.forEach(page => {
            const listItem = this.buildListItem(page)
            console.log(listItem)
            listContainer.appendChild(listItem)
        })

        const treeContainer = document.getElementById("tree-container") as HTMLDivElement
        treeContainer.appendChild(listContainer);
    }

    buildListItem(page:any) {
        const listItem = document.createElement("li");
        listItem.classList.add("tb-custom-list-item");

        const menuItem = document.createElement("div");
        menuItem.classList.add("tb-custom-menu-item");
        menuItem.classList.add("page-list-items");

        const toggle = document.createElement("span");
        toggle.style.textTransform = "capitalize";
        toggle.classList.add("tb-dropdown-toggle");
        toggle.setAttribute("role", "button");
        toggle.setAttribute("aria-expanded", "false");
        toggle.innerHTML = `<i class="fa-regular fa-file tree-icon"></i><span>&nbsp; ${page.PageName}</span>`;

        const deleteIcon = document.createElement("i");
        deleteIcon.classList.add("fa-regular", "fa-trash-can", "tb-delete-icon");

        const updateIcon = document.createElement("i");
        updateIcon.classList.add("fa-regular", "fa-edit", "tb-update-icon");

        if (page.PageName === "Home" || page.PageName === "Web Link") {
            deleteIcon.style.display = "none";
            updateIcon.style.display = "none";
        }

        const iconDiv = document.createElement("div");
        iconDiv.classList.add("tb-menu-icons-container");

        deleteIcon.setAttribute("data-id", page.PageId);
        updateIcon.setAttribute("data-id", page.PageId);

        deleteIcon.addEventListener("click", (event) => 
            this.handleDelete()
        );

        updateIcon.addEventListener("click", (event) =>
            this.handleUpdate()
        );

        menuItem.appendChild(toggle);
        if (page.PageName === "Web Link") {
            menuItem.style.display = "none";
        }
        if (page.PageName !== "Home") {
            // iconDiv.append(updateIcon);
            iconDiv.append(deleteIcon);
            menuItem.appendChild(iconDiv);
        }
        listItem.appendChild(menuItem);
        return listItem;
    }

    handleDelete = () => {
        alert('add delete function')
    }
  
    handleUpdate() {
      alert('add update function')
    }
}