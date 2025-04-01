export class TileAlignmentSection {
  container: HTMLElement;
  constructor() {
    this.container = document.createElement("div");
    this.init();
  }

  init() {
    this.container.classList.add("text-alignment");

    const leftAlign = document.createElement("div");
    leftAlign.classList.add("align-item");
    leftAlign.innerHTML = `
            <input type="radio" id="tile-left"
                name="alignment" value="left" />
            <label for="tile-left" class="fas fa-align-left">
            </label>
        `;

    const centerAlign = document.createElement("div");
    centerAlign.classList.add("align-item");
    centerAlign.innerHTML = `
            <input type="radio" id="tile-center"
                     name="alignment" value="center" />
            <label for="tile-center">
                <svg xmlns="http://www.w3.org/2000/svg"
                width="12.7" height="14.626"
                viewBox="0 0 12.7 14.626">
                <path id="Group_2344-converted"
                    data-name="Group 2344-converted"
                    d="M5.863,1.868V3.736L5.031,2.9,4.2,2.073l-.336.341-.336.342,1.411,1.41L6.35,5.577,7.758,4.17,9.165,2.762l-.333-.333L8.5,2.1l-.831.817-.83.817V0H5.863V1.868M0,7.313v.794H12.7V6.519H0v.794m4.937,3.149-1.4,1.4.333.333.334.333.83-.816.831-.817v3.729h.974V10.89l.832.832.831.832.336-.342.336-.341L7.766,10.465c-.773-.773-1.41-1.406-1.416-1.406s-.642.631-1.413,1.4"
                    fill-rule="evenodd" fill="#696969" />
                </svg>
            </label>
        `;

    leftAlign.onclick = (e) => {
      e.preventDefault();
      const leftAlignInput = document.getElementById(
        "tile-left"
      ) as HTMLInputElement;

      const selectedComponent = (globalThis as any).selectedComponent;
      if (!selectedComponent) return;

      selectedComponent.addStyle({
        "justify-content": "start",
        "align-items": "start",
      });

      const titleSection = selectedComponent.find(".tile-title")[0];
      if (titleSection) {
        titleSection.addStyle({
          "text-align": "left",
        });
      }

      (globalThis as any).tileMapper.updateTile(
        selectedComponent.parent().getId(),
        "Align",
        "left"
      );

      leftAlignInput.checked = true;
    };

    centerAlign.onclick = (e) => {
      e.preventDefault();
      const centerAlignInput = document.getElementById(
        "tile-center"
      ) as HTMLInputElement;

      const selectedComponent = (globalThis as any).selectedComponent;
      if (!selectedComponent) return;

      selectedComponent.addStyle({
        "justify-content": "center",
        "align-items": "center",
      });

      const titleSection = selectedComponent.find(".tile-title")[0];
      if (titleSection) {
        titleSection.addStyle({
          "text-align": "center",
        });
      }

      (globalThis as any).tileMapper.updateTile(
        selectedComponent.parent().getId(),
        "Align",
        "center"
      );

      centerAlignInput.checked = true;
    };

    this.container.appendChild(leftAlign);
    this.container.appendChild(centerAlign);
  }

  render(container: HTMLElement) {
    container.appendChild(this.container);
  }
}
