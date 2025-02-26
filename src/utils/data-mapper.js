class TileMapper {
  icons = [
    "Bed",
    "Car",
    "Cleaning",
    "Curtain",
    "Door",
    "FirstAid",
    "Food",
    "Home",
    "HomeSettings",
    "Intercom",
    "Key",
    "Monitor",
    "Shower",
    "Wash",
    "Wellbeing",
  ];
  constructor(tileComponent) {
    this.component = tileComponent;
  }

  setTileAttributes() {
    const bgColor = this.component.getStyle()["background-color"] || "#ffffff";
    const bgImage = this.component.getStyle()["background-image"] || "";
    const textColor = this.component.getStyle()["color"] || "#ffffff";
    this.component.addAttributes({
      "tile-bgcolor": bgColor,
      "tile-bg-image-url": bgImage,
      "tile-text-color": textColor,
    });

    let icon = "";
    let iconColor = "";
    let iconAlign = "center";
    let textAlign = "center";
    let text = "Tile";

    // iconAlignment
    if (this.component.find(".tile-icon-section").length) {
      const tileIconSection = this.component.find(".tile-icon-section")[0];
      iconAlign = tileIconSection.getStyle()["align-self"] || "left";
      if (iconAlign == "start") {
        iconAlign = "left";
      } else if (iconAlign == "end") {
        iconAlign = "right";
      }
    }
    this.component.addAttributes({
      "tile-icon-align": iconAlign,
    });
    // icon and iconColor
    if (this.component.find("path").length) {
      const svg = this.component.find("path")[0];
      iconColor = svg.getAttributes().fill;
      icon = svg.getAttributes().id;
      if (!this.icons.includes(icon)) {
        svg.remove();
        icon = "";
      }
      this.component.addAttributes({
        "tile-icon-color": iconColor,
        "tile-icon": icon,
      });

      // textAlign
      if (this.component.find(".tile-title-section")) {
        let tileTitleSection = this.component.find(".tile-title-section")[0];
        textAlign = tileTitleSection.getStyle()["text-align"];
      }
      this.component.addAttributes({
        "tile-text-align": textAlign,
      });

      // text
      if (this.component.find("span.tile-title").length) {
        const tileTitle = this.component.find("span.tile-title")[0];
        text = tileTitle.components().first().get("content");
      }
      this.component.addAttributes({
        "tile-text": text,
      });
    }
  }
}

function mapTemplateToPageData(templateData, page) {
  // Create the base page structure
  const pageData = {
    PageId: page.PageId,
    PageName: page.PageName,
    Row: [],
  };

  // Find container-column in template data
  const containerColumn = (() => {
    const pages = templateData.pages || [];
    for (const page of pages) {
      for (const frame of page.frames || []) {
        const container = frame.component?.components?.[0]?.components?.[0];
        if (container?.classes?.includes("container-column")) {
          return container;
        }
      }
    }
    return null;
  })();

  if (!containerColumn) return pageData;

  // Find and map container rows
  const containerRows =
    containerColumn.components?.filter((comp) =>
      comp.classes?.includes("container-row")
    ) || [];

  // Map rows to final structure
  pageData.Row = containerRows.map((rowComponent) => {
    const row = {
      Col: [],
    };
    // Find and map templates to columns
    const templates =
      rowComponent.components?.filter(
        (comp) =>
          (comp.type === "template-wrapper" || comp.type === "tile-wrapper") &&
          !comp.classes?.includes("container-row")
      ) || [];

    row.Col = templates.map((templateComponent) => {
      // Map column
      const col = {
        Tile: null,
      };

      // Map tile
      let attributes = {};
      if (templateComponent.components) {
        attributes = templateComponent.components[0].attributes || {};
      }
      // Find tile title
      const templateBlock = templateComponent.components?.find((comp) =>
        comp.classes?.includes("template-block")
      );
      const titleSection = templateBlock?.components?.find((comp) =>
        comp.classes?.includes("tile-title-section")
      );
      const titleSpan = titleSection?.components?.find((comp) =>
        comp.classes?.includes("tile-title")
      );
      const titleText = titleSpan?.components?.[0]?.content || "";

      // Create tile object
      let tileActionObjectId = attributes["tile-action-object-id"];
      const tileBG = attributes["tile-bgcolor"];

      col.Tile = {
        TileName: titleText,
        TileText: titleText,
        TileTextColor: attributes["tile-text-color"], // Not present in source data
        TileTextAlignment: attributes["tile-text-align"] || "center",

        TileIcon: attributes["tile-icon"] || "",
        TileIconColor: attributes["tile-icon-color"] || "",
        TileIconAlignment: attributes["tile-icon-align"] || "center",

        TileBGColor: `${tileBG}` || "",
        TileBGImageUrl: attributes["tile-bg-image-url"] || "",
        TileBGImageOpacity: attributes["tile-bg-image-opacity"] || "",

        TileAction: {
          ObjectType: attributes["tile-action-object"],
          ObjectId: tileActionObjectId || "00000000-0000-0000-0000-000000000000",
          ObjectUrl: attributes["tile-action-object-url"] || "",
        },
      };
      console.log(col.Tile.TileAction);
      return col;
    });

    return row;
  });
  if (page.PageName == "Home") {
    console.log(pageData);
  }
  return pageData;
}

function mapContentToPageData(templateData, page) {
  const pages = templateData.pages;
  const output = {
    PageId: page.PageId,
    PageName: page.PageName,
    Content: [],
    Cta: [],
  };
  if (pages) {
    const components =
      pages[0].frames[0].component.components[0].components[0].components;

    // Find image and text content
    components.forEach((component) => {
      const topComponents =
        component.components?.[0]?.components?.[0]?.components || [];
      for (let index = 0; index < topComponents.length; index++) {
        const component = topComponents[index];
        if (component?.tagName === "img") {
          const imageUrl = component?.attributes.src.startsWith("http")
            ? component?.attributes.src
            : baseURL + "/" + component?.attributes.src;

          output.Content.push({
            ContentType: "Image",
            ContentValue: imageUrl,
          });
        }

        if (component?.tagName === "p") {
          const textContent = component.components?.[0]?.content?.trim();
          if (textContent) {
            output.Content.push({
              ContentType: "Description",
              ContentValue: textContent,
            });
          }
        }
      }

      // CTA buttons
      if (component.classes?.includes("cta-button-container")) {
        const ctaChildren = component.components || [];
        ctaChildren.forEach((ctaChild) => {
          const attributes = ctaChild.attributes || {};
          if (
            ctaChild.classes?.includes("cta-container-child") ||
            ctaChild.classes?.includes("img-button-container") ||
            ctaChild.classes?.includes("plain-button-container")
          ) {
            if (ctaChild.classes?.includes("plain-button-container")) {
              attributes["is-full-width"] = true;
            }
            if (ctaChild.classes?.includes("img-button-container")) {
              attributes["is-full-width"] = true;
              attributes["is-image-button"] = true;
            }

            output.Cta.push({
              CtaId: attributes["cta-button-id"],
              CtaType: attributes["cta-button-type"],
              CtaLabel: attributes["cta-button-label"] || "Email Us",
              CtaAction: attributes["cta-button-action"],
              CtaBGColor: attributes["cta-background-color"] || "#EEA622",
              IsFullWidth: attributes["is-full-width"] || false,
              IsImageButton: attributes["is-image-button"] || false,
            });
          }
        });
      }
    });
  }
  return output;
}

function generateNewPage(theme) {
  return {
    assets: [],
    styles: [],
    pages: [
      {
        frames: [
          {
            component: {
              type: "wrapper",
              droppable: false,
              stylable: [
                "background",
                "background-color",
                "background-image",
                "background-repeat",
                "background-attachment",
                "background-position",
                "background-size",
              ],
              resizable: {
                handles: "e",
              },
              selectable: false,
              attributes: {
                theme: `${theme.ThemeName}`,
              },
              _undoexc: ["status", "open"],
              components: [
                {
                  type: "template-wrapper",
                  draggable: false,
                  droppable: false,
                  highlightable: false,
                  selectable: false,
                  hoverable: false,
                  classes: ["frame-container"],
                  attributes: {
                    id: "frame-container",
                  },
                  _undoexc: ["status", "open"],
                  components: [
                    {
                      type: "template-wrapper",
                      draggable: false,
                      droppable: false,
                      highlightable: false,
                      selectable: false,
                      hoverable: false,
                      classes: ["container-column"],
                      _undoexc: ["status", "open"],
                      components: [
                        {
                          type: "template-wrapper",
                          draggable: false,
                          selectable: false,
                          droppable: false,
                          classes: ["container-row"],
                          _undoexc: ["status", "open"],
                          components: [
                            {
                              type: "template-wrapper",
                              droppable: false,
                              selectable: false,
                              classes: ["template-wrapper", "default-template"],
                              _undoexc: ["status", "open"],
                              components: [
                                {
                                  draggable: false,
                                  droppable: false,
                                  highlightable: false,
                                  hoverable: false,
                                  classes: [
                                    "template-block",
                                    "high-priority-template",
                                  ],
                                  style: {
                                    color: "#ffffff",
                                  },
                                  attributes: {
                                    "tile-text": "Tile",
                                    "tile-text-color": "#ffffff",
                                    "tile-text-align": "left",
                                    "tile-icon": "icon-name",
                                    "tile-icon-color": "#ffffff",
                                    "tile-icon-align": "left",
                                    "tile-bgcolor": `${theme.ThemeColors.accentColor}`,
                                    "tile-bgcolor-name": "accentColor",
                                    "tile-bg-image": "",
                                    "tile-bg-image-opacity": "100",
                                    "tile-action-object": "Page",
                                    "tile-action-object-id": "",
                                  },
                                  _undoexc: ["status", "open"],
                                  components: [
                                    {
                                      draggable: false,
                                      droppable: false,
                                      highlightable: false,
                                      selectable: false,
                                      hoverable: false,
                                      classes: ["tile-icon-section"],
                                      _undoexc: ["status", "open"],
                                      components: [
                                        {
                                          tagName: "span",
                                          type: "text",
                                          draggable: false,
                                          highlightable: false,
                                          editable: false,
                                          selectable: false,
                                          hoverable: false,
                                          classes: [
                                            "tile-close-icon",
                                            "top-right",
                                            "selected-tile-icon",
                                          ],
                                          _undoexc: ["status", "open"],
                                          components: [
                                            {
                                              type: "textnode",
                                              content: "×",
                                              _undoexc: ["status", "open"],
                                            },
                                          ],
                                        },
                                        {
                                          tagName: "span",
                                          type: "text",
                                          draggable: false,
                                          highlightable: false,
                                          editable: false,
                                          selectable: false,
                                          hoverable: false,
                                          classes: ["tile-icon"],
                                          _undoexc: ["status", "open"],
                                          components: [
                                            {
                                              type: "textnode",
                                              content: "\n                ",
                                              _undoexc: ["status", "open"],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                    {
                                      draggable: false,
                                      droppable: false,
                                      highlightable: false,
                                      selectable: false,
                                      hoverable: false,
                                      classes: ["tile-title-section"],
                                      _undoexc: ["status", "open"],
                                      components: [
                                        {
                                          tagName: "span",
                                          type: "text",
                                          draggable: false,
                                          highlightable: false,
                                          editable: false,
                                          selectable: false,
                                          hoverable: false,
                                          classes: [
                                            "tile-close-icon",
                                            "top-right",
                                            "selected-tile-title",
                                          ],
                                          _undoexc: ["status", "open"],
                                          components: [
                                            {
                                              type: "textnode",
                                              content: "×",
                                              _undoexc: ["status", "open"],
                                            },
                                          ],
                                        },
                                        {
                                          tagName: "span",
                                          type: "text",
                                          draggable: false,
                                          highlightable: false,
                                          editable: false,
                                          selectable: false,
                                          hoverable: false,
                                          classes: ["tile-title"],
                                          _undoexc: ["status", "open"],
                                          components: [
                                            {
                                              type: "textnode",
                                              content: "Title",
                                              _undoexc: ["status", "open"],
                                            },
                                          ],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  tagName: "button",
                                  draggable: false,
                                  droppable: false,
                                  highlightable: false,
                                  selectable: false,
                                  hoverable: false,
                                  classes: [
                                    "action-button",
                                    "add-button-bottom",
                                  ],
                                  attributes: {
                                    title: "Add template below",
                                  },
                                  _undoexc: ["status", "open"],
                                  components: [
                                    {
                                      type: "svg",
                                      draggable: false,
                                      droppable: false,
                                      highlightable: false,
                                      resizable: {
                                        ratioDefault: 1,
                                      },
                                      selectable: false,
                                      hoverable: false,
                                      attributes: {
                                        xmlns: "http://www.w3.org/2000/svg",
                                        width: "16",
                                        height: "16",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        "stroke-width": "2",
                                        "stroke-linecap": "round",
                                        "stroke-linejoin": "round",
                                      },
                                      _undoexc: ["status", "open"],
                                      components: [
                                        {
                                          tagName: "line",
                                          type: "svg-in",
                                          draggable: false,
                                          droppable: false,
                                          highlightable: false,
                                          resizable: {
                                            ratioDefault: 1,
                                          },
                                          attributes: {
                                            x1: "12",
                                            y1: "5",
                                            x2: "12",
                                            y2: "19",
                                          },
                                          _undoexc: ["status", "open"],
                                        },
                                        {
                                          tagName: "line",
                                          type: "svg-in",
                                          draggable: false,
                                          droppable: false,
                                          highlightable: false,
                                          resizable: {
                                            ratioDefault: 1,
                                          },
                                          attributes: {
                                            x1: "5",
                                            y1: "12",
                                            x2: "19",
                                            y2: "12",
                                          },
                                          _undoexc: ["status", "open"],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  tagName: "button",
                                  draggable: false,
                                  droppable: false,
                                  highlightable: false,
                                  selectable: false,
                                  hoverable: false,
                                  classes: [
                                    "action-button",
                                    "add-button-right",
                                  ],
                                  attributes: {
                                    title: "Add template right",
                                  },
                                  _undoexc: ["status", "open"],
                                  components: [
                                    {
                                      type: "svg",
                                      draggable: false,
                                      droppable: false,
                                      highlightable: false,
                                      resizable: {
                                        ratioDefault: 1,
                                      },
                                      selectable: false,
                                      hoverable: false,
                                      attributes: {
                                        xmlns: "http://www.w3.org/2000/svg",
                                        width: "16",
                                        height: "16",
                                        viewBox: "0 0 24 24",
                                        fill: "none",
                                        stroke: "currentColor",
                                        "stroke-width": "2",
                                        "stroke-linecap": "round",
                                        "stroke-linejoin": "round",
                                      },
                                      _undoexc: ["status", "open"],
                                      components: [
                                        {
                                          tagName: "line",
                                          type: "svg-in",
                                          draggable: false,
                                          droppable: false,
                                          highlightable: false,
                                          resizable: {
                                            ratioDefault: 1,
                                          },
                                          attributes: {
                                            x1: "12",
                                            y1: "5",
                                            x2: "12",
                                            y2: "19",
                                          },
                                          _undoexc: ["status", "open"],
                                        },
                                        {
                                          tagName: "line",
                                          type: "svg-in",
                                          draggable: false,
                                          droppable: false,
                                          highlightable: false,
                                          resizable: {
                                            ratioDefault: 1,
                                          },
                                          attributes: {
                                            x1: "5",
                                            y1: "12",
                                            x2: "19",
                                            y2: "12",
                                          },
                                          _undoexc: ["status", "open"],
                                        },
                                      ],
                                    },
                                  ],
                                },
                                {
                                  type: "text",
                                  draggable: false,
                                  highlightable: false,
                                  editable: false,
                                  selectable: false,
                                  hoverable: false,
                                  classes: ["resize-handle"],
                                  _undoexc: ["status", "open"],
                                  components: [
                                    {
                                      type: "textnode",
                                      content: "\n          ",
                                      _undoexc: ["status", "open"],
                                    },
                                  ],
                                },
                              ],
                            },
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          },
        ],
        type: "main",
        id: "M1I3WJbl1jsJyHc2",
      },
    ],
  };
}
