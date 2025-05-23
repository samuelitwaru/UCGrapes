import { ThemeManager } from "../../../controls/themes/ThemeManager";
import { AppConfig } from "../../../AppConfig";

export class PageTreeRenderer {
  themeManager: any;
  currentTheme: any;
  logo: any;
  constructor() {
    this.themeManager = new ThemeManager();
    this.currentTheme = this.themeManager.currentTheme;
    const config = AppConfig.getInstance();
    this.logo = config.organisationLogo;
  }

  private getCtaColor(colorName: string) {
    const ctaColor = this.currentTheme.ThemeCtaColors.find(
      (ctaColor: any) => ctaColor.CtaColorName == colorName
    );
    if (ctaColor) {
      return ctaColor.CtaColorCode;
    }
    return this.currentTheme.ThemeCtaColors[0].CtaColorCode;
  }

  private formatDate(): string {
    const date: string = new Date()
      .toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
      .replace(/(\d{2} \w{3}) (\d{4})/, "$1, $2");

    return date;
  }

  createMenuHTML(page: any) {
    const json = page.PageMenuStructure;
    const container = document.createElement("div");
    container.style.padding = "5px";

    const header = this.createHeaderHTML(page);
    container.appendChild(header);

    json.Rows.forEach((row: any) => {
      const rowDiv = document.createElement("div");
      rowDiv.style.display = "flex";
      rowDiv.style.flexWrap = "wrap";
      rowDiv.style.margin = "5px 5px";
      rowDiv.style.gap = "5px";

      row.Tiles.forEach((tile: any) => {
        const tileDiv = document.createElement("div");
        tileDiv.id = tile.Id;
        // tileDiv.innerHTML = tile.Text;

        const contentDiv = document.createElement("div");
        contentDiv.style.display = "flex";
        contentDiv.style.flexDirection = "column";
        contentDiv.style.alignItems = tile.Align?.toLowerCase() || "left";
        contentDiv.style.justifyContent = "center";
        contentDiv.style.color = tile.Color;

        // const iconSvg = svgIcons[tile.Icon];
        if (tile.Icon) {
          const iconWrapper = document.createElement("div");
          iconWrapper.innerHTML = this.themeManager.getThemeIcon(tile.Icon);
          // iconWrapper.style.marginBottom = "4px";
          iconWrapper.style.display = "inline-block";
          iconWrapper.style.color = tile.Color;
          contentDiv.appendChild(iconWrapper);
        }

        const textSpan = document.createElement("span");
        textSpan.textContent = tile.Text;
        contentDiv.appendChild(textSpan);

        let bgImage = tile.BGImageUrl ? `url('${tile.BGImageUrl}')` : "none";
        let textAlign = ["left", "right", "center"].includes(
          tile.Align?.toLowerCase()
        )
          ? tile.Align.toLowerCase()
          : "left";

        tileDiv.style.cssText = `
          padding: 2px;
          min-width: 50px;
          height: 70px;
          flex: 1;
          color: ${tile.Color};
          background-color: ${this.currentTheme.ThemeColors[tile.BGColor]};
          background-image: ${bgImage};
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center;
          text-align: ${textAlign};
          border-radius: 10px;
          opacity: ${1 - tile.Opacity};
          border: 0.5px solid #999;
          font-size: 10px;
        `;

        tileDiv.appendChild(contentDiv);
        rowDiv.appendChild(tileDiv);
      });

      container?.appendChild(rowDiv);
    });
    return container.outerHTML;
  }

  createHeaderHTML(page: any) {
    const header = document.createElement("div");
    let appBar = `
        <div style="display:flex; padding:2px">
            <svg xmlns="http://www.w3.org/2000/svg" data-name="Group 14" viewBox="0 0 47 47" class="content-back-butto" width="30" height="30">
                <g id="Ellipse_6" data-name="Ellipse 6" fill="none" stroke="#262626" stroke-width="1">
                <circle cx="23.5" cy="23.5" r="23.5" stroke="none"></circle>
                <circle cx="23.5" cy="23.5" r="23" fill="none"></circle>
                </g>
                <path id="Icon_ionic-ios-arrow-round-up" data-name="Icon ionic-ios-arrow-round-up" d="M13.242,7.334a.919.919,0,0,1-1.294.007L7.667,3.073V19.336a.914.914,0,0,1-1.828,0V3.073L1.557,7.348A.925.925,0,0,1,.263,7.341.91.91,0,0,1,.27,6.054L6.106.26h0A1.026,1.026,0,0,1,6.394.07.872.872,0,0,1,6.746,0a.916.916,0,0,1,.64.26l5.836,5.794A.9.9,0,0,1,13.242,7.334Z" transform="translate(13 30.501) rotate(-90)" fill="#262626"></path>
            </svg>
            <div class="">
                <div style="padding: 5px">${page.PageName.toUpperCase()}</div>
            </div>
        </div>
        `;

    if (page.PageName == "Home") {
      appBar = `
            <div class="home-app-bar" style="padding:5px"><div class="logo-added"><img src="${this.logo}" style="height: 35px;"></div><div class="profile-section" style="display: flex;">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="18" viewBox="0 0 19.422 21.363">
                    <path id="Path_1327" data-name="Path 1327" d="M15.711,5a6.8,6.8,0,0,0-3.793,12.442A9.739,9.739,0,0,0,6,26.364H7.942a7.769,7.769,0,1,1,15.537,0h1.942A9.739,9.739,0,0,0,19.5,17.442,6.8,6.8,0,0,0,15.711,5Zm0,1.942A4.855,4.855,0,1,1,10.855,11.8,4.841,4.841,0,0,1,15.711,6.942Z" transform="translate(-6 -5)" fill="#fff"></path>
                </svg>
            </div></div>
            `;
    }

    header.innerHTML = `
            <div class="header"><span id="clock">8:36 AM</span><span class="icons"><i class="fas fa-signal"></i><i class="fas fa-wifi"></i><i class="fas fa-battery"></i></span></div>
            ${appBar}
        `;
    return header;
  }

  createContentHTML(page: any) {
    const data = page.PageContentStructure;
    // Main container
    const container = document.createElement("div");
    container.style.padding = "10px";
    const header = this.createHeaderHTML(page);
    container.appendChild(header);

    // Render content
    data.Content.forEach((item: any) => {
      const contentDiv = document.createElement("div");

      if (item.ContentType === "Image") {
        contentDiv.setAttribute(
          "style",
          `
              width: 100%;
              height: 100px;
              background-image: url('${item.ContentValue}');
              background-size: cover;
              background-position: center;
              border-radius: 8px;
            `
        );
      } else if (item.ContentType === "Description") {
        contentDiv.setAttribute(
          "style",
          `
            `
        );
        contentDiv.innerHTML = item.ContentValue;
      }

      container.appendChild(contentDiv);
    });

    const ctaContainer = this.createCTAs(data.Cta || []);

    container.appendChild(ctaContainer);
    return container.outerHTML;
  }

  createMyActivityHTML(page: any) {
    const container = document.createElement("div");
    container.style.padding = "5px";
    const header = this.createHeaderHTML(page);
    container.appendChild(header);
    const body = document.createElement("div");
    body.innerHTML = `
        <div style="padding:5px;">
        <div class="activity-tabs">
            <button style="background:${this.currentTheme.ThemeColors["backgroundColor"]}" class="activity-tab active">Messages</button>
            <button class="activity-tab inactive">Requests</button>
          </div>
          <div align="center">No Messages Yet</div>
        </div>
        `;
    container.appendChild(body);
    return container.outerHTML;
  }

  createAgendaHTML(page: any) {
    const container = document.createElement("div");
    container.style.padding = "5px";
    const header = this.createHeaderHTML(page);
    container.appendChild(header);
    const body = document.createElement("div");

    let pageData = `
                <div class="tb-date-selector" 
                  style="background-color: ${
                    this.currentTheme.ThemeColors["backgroundColor"]
                  };">
                  <span class="tb-arrow">❮</span>
                  <span class="tb-date-text" id="current-date" > ${this.formatDate()}</span>
                  <span class="tb-arrow">❯</span>
                </div>
                <div class="tb-schedule" id="schedule-container" >
              `;

    for (let hour = 0; hour < 24; hour++) {
      const formattedHour = hour.toString().padStart(2, "0") + ":00";
      pageData += `
                    <div class="tb-time-slot" >
                      <div class="tb-time" >${formattedHour}</div>
                      <div class="tb-events" ></div>
                      ${
                        hour === new Date().getHours()
                          ? `
                        <div class="tb-current-time-indicator" ></div>
                        <div class="tb-current-time-dot" ></div>`
                          : ""
                      }
                    </div>
                  `;
    }
    pageData += `</div>`;

    body.innerHTML = pageData;
    container.appendChild(body);
    return container.outerHTML;
  }

  createMapHTML(page: any) {
    const container = document.createElement("div");
    container.style.padding = "5px";

    const header = this.createHeaderHTML(page);
    container.appendChild(header);

    const body = document.createElement("div");
    const lat = 52.0907;
    const lng = 5.1214;

    body.innerHTML = `
      <iframe
        width="100%"
        height="300"
        frameborder="0"
        style="border:0"
        src="https://www.google.com/maps/embed/v1/view?key=AIzaSyBBaQo7_sF2xk3uNIyKp_Z-4BbaTebGGa4&center=${lat},${lng}&zoom=18"
        allowfullscreen>
      </iframe>
    `;

    container.appendChild(body);
    return container.outerHTML;
  }

  createLinkHTML(pageName: string, url: string) {
    const container = document.createElement("div");
    container.style.padding = "5px";
    const header = this.createHeaderHTML({ PageName: pageName });
    container.appendChild(header);
    const body = document.createElement("div");
    body.innerHTML = `
      <iframe src="${url}" style="pointer-events: none;" width="100%" height="100%" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>
      `;
    container.appendChild(body);
    return container.outerHTML;
  }

  createCTAs(CTAs: any[]) {
    interface Icons {
      [key: string]: string | number;
    }
    interface Models {
      [key: string]: Function;
    }
    const icons: Icons = {
      Phone: `<svg data-gjs-type="svg" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 49.417 49.418"><path id="call" data-gjs-type="svg-in" d="M29.782,3a2.149,2.149,0,1,0,0,4.3A19.3,19.3,0,0,1,49.119,26.634a2.149,2.149,0,1,0,4.3,0A23.667,23.667,0,0,0,29.782,3ZM12.032,7.305a2.548,2.548,0,0,0-.818.067,8.342,8.342,0,0,0-3.9,2.342C2.775,14.254.366,21.907,17.437,38.98S42.16,53.643,46.7,49.1a8.348,8.348,0,0,0,2.346-3.907,2.524,2.524,0,0,0-1.179-2.786c-2.424-1.418-7.654-4.484-10.08-5.9a2.523,2.523,0,0,0-2.568.012l-4.012,2.392a2.517,2.517,0,0,1-2.845-.168,65.811,65.811,0,0,1-5.711-4.981,65.07,65.07,0,0,1-4.981-5.711A2.512,2.512,0,0,1,17.5,25.2L19.9,21.191a2.533,2.533,0,0,0,.008-2.577L14.012,8.556A2.543,2.543,0,0,0,12.032,7.305Zm17.751,4.289a2.149,2.149,0,1,0,0,4.3A10.709,10.709,0,0,1,40.525,26.634a2.149,2.149,0,1,0,4.3,0A15.072,15.072,0,0,0,29.782,11.594Zm0,8.594a2.149,2.149,0,1,0,0,4.3,2.114,2.114,0,0,1,2.149,2.148,2.149,2.149,0,1,0,4.3,0A6.479,6.479,0,0,0,29.782,20.188Z" transform="translate(-4 -3)" fill="#fff"></path></svg>`,
      Email: `<svg data-gjs-type="svg" xmlns="http://www.w3.org/2000/svg" width="32" height="28" viewBox="0 0 41 32.8"><path id="Path_1218" data-gjs-type="svg-in" data-name="Path 1218" d="M6.1,4A4.068,4.068,0,0,0,2.789,5.7a1.5,1.5,0,0,0,.444,2.126l18,11.219a2.387,2.387,0,0,0,2.531,0L41.691,7.732a1.5,1.5,0,0,0,.384-2.2A4.063,4.063,0,0,0,38.9,4Zm35.907,8.376a.963.963,0,0,0-.508.152L23.765,23.711a2.392,2.392,0,0,1-2.531,0L3.5,12.656a.98.98,0,0,0-1.5.833V32.7a4.1,4.1,0,0,0,4.1,4.1H38.9A4.1,4.1,0,0,0,43,32.7V13.357A.981.981,0,0,0,42.007,12.376Z" transform="translate(-2 -4)" fill="#fff"></path></svg>`,
      Form: ``,
      Link: ``,
    };

    const models: Models = {
      FullWidth: (cta: any) => `
              <div class="plain-button-container">
                <button class="cta-plain-button style="background:${this.getCtaColor(
                  cta.CtaBGColor
                )}"">
                  <span class="label">${cta.CtaLabel}</span>
                </button>
              </div>
            `,
      Round: (cta: any) => `
              <div class="cta-round-button">
                <div class="cta-round-button-icon" style="background:${this.getCtaColor(
                  cta.CtaBGColor
                )}">${icons[cta.CtaType]}</div>
                <div>${cta.CtaLabel}<div>
              </div>
            `,
      Image: (cta: any) => `
              <div class="cta-image-button" style="background:${this.getCtaColor(
                cta.CtaBGColor
              )}">
                <div class="cta-image-button-image">${icons[cta.CtaImage]}</div>
                <div class="cta-image-button-label">${cta.CtaLabel}</div>
                  ${cta.CtaLabel}
                </div>
              </div>
              `,
      Icon: (cta: any) => `
              <div class="cta-icon-button" style="background:${this.getCtaColor(
                cta.CtaBGColor
              )}">
                <div class="cta-icon-button-icon" >${icons[cta.CtaType]}</div>
                <div class="cta-icon-button-label">
                  ${cta.CtaLabel}
                </div>
                <i class="fa fa-angle-right img-button-arrow"></i>
              </div>
              `,
    };

    // CTA buttons container
    const ctaContainer = document.createElement("div");
    ctaContainer.setAttribute(
      "style",
      "display: flex; justify-content: center; align-items: center; flex-wrap: wrap; gap: 5px;"
    );
    CTAs.forEach((cta) => {
      ctaContainer.innerHTML += models[cta.CtaButtonType](cta);
    });

    return ctaContainer;
  }
}
