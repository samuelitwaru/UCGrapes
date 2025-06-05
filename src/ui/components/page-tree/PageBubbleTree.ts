import { AppConfig } from "../../../AppConfig";
import { ThemeManager } from "../../../controls/themes/ThemeManager";
import { AppVersionManager } from "../../../controls/versions/AppVersionManager";
import { TreeComponent } from "../TreeComponent";
import { PageTreeRenderer } from "./PageTreeRenderer";
import { PageTreeRendererInfoPage } from "./PageTreeRendererInfoPage";
interface PageNode {
  id: string;
  title: string;
  structure: string;
  thumbnail: string;
  children: string[]; // recursive type for nested structure
  x: Number;
  y: Number;
}
export class PageBubbleTree {
  sampleData: any;
  link: any;
  node: any;
  simulation: any;
  simulationActive: boolean | undefined;
  d3: any;
  pages: any;
  themeManager: ThemeManager;
  processedPages!: { id: number; title: string; children: number[] }[];
  nodes!: any[];
  links!: { source: number; target: number }[];
  svg: any;
  width: number = 100;
  height: number = 40;
  selfLinks: { source: number; target: number }[] = [];
  normalLinks: { source: number; target: number }[] = [];
  container: any;
  selfArcs: any;
  arrows: any;
  graphContainer!: HTMLDivElement;
  zoom: any;
  pageTreeRenderer: PageTreeRenderer;
  PageTreeRendererInfoPage: PageTreeRendererInfoPage;
  primaryNodeId: any | null = null;
  appVersionManager: AppVersionManager;

  constructor() {
    this.pageTreeRenderer = new PageTreeRenderer();
    this.PageTreeRendererInfoPage = new PageTreeRendererInfoPage();
    const config = AppConfig.getInstance();
    this.d3 = config.UC.d3;
    this.themeManager = new ThemeManager();
    this.appVersionManager = new AppVersionManager();
    this.pages = this.appVersionManager.getPages();

    this.processedPages = this.processPageData(this.pages);
    const homePage = this.processedPages.find((page) => page.title === "Home");
    if (homePage) {
      this.primaryNodeId = homePage.id;
    }

    // console.log("processed pages", this.processedPages);
    this.nodes = this.createNodes();
    this.links = this.createLinks();
    // console.log("nodes", this.nodes);
    // console.log("links", this.links);

    this.init();
  }

  init() {
    this.graphContainer = this.build();
    this.buildTree();
  }

  show() {
    const editorSections = document.getElementsByClassName(
      "editor-main-section"
    );
    const toolSection = document.getElementById(
      "tools-section"
    ) as HTMLDivElement;

    const treeSection = document.getElementById(
      "tree-container"
    ) as HTMLDivElement;
    //set display to none for editor section
    if (editorSections.length > 0) {
      // toggle display
      const div = editorSections[0] as HTMLDivElement;
      if (div.style.display === "none") {
        div.style.display = "block";
        this.graphContainer.style.display = "none";
        toolSection.style.display = "block";
        treeSection.style.display = "none";
      } else {
        toolSection.style.display = "none";
        div.style.display = "none";
        this.graphContainer.style.display = "block";
        this.graphContainer.style.width = "100%";
        this.graphContainer.style.height = "100%";
        const tree = new TreeComponent(this.appVersionManager);
      }
      // editorSections[0].setAttribute("style", "display:none;")
    }
  }

  build() {
    const mainContainer = document.getElementById(
      "main-content"
    ) as HTMLDivElement;
    this.graphContainer = document.getElementById(
      "graph-container-1"
    ) as HTMLDivElement;

    if (!this.graphContainer) {
      this.graphContainer = document.createElement("div");
      this.graphContainer.id = "graph-container-1";
    }
    this.graphContainer.innerHTML = "<svg></svg>";
    // mainContainer.innerHTML = ""
    mainContainer.appendChild(this.graphContainer);
    this.graphContainer.setAttribute("style", "display:block;width:100%;");
    return this.graphContainer;
  }

  processPageData(pages: any[]) {
    const linkPages: PageNode[] = [];
    pages = pages.map((page: any) => {
      // console.log(
      //   "PageThumbnailUrl for page:",
      //   page.PageName,
      //   page.PageThumbnailUrl
      // );

      let ret: PageNode = {
        id: page.PageId,
        title: page.PageName,
        structure: "",
        thumbnail: page.PageThumbnailUrl,
        children: [],
        x: 0,
        y: 0,
      };

      if (
        page.PageType === "Menu" ||
        page.PageType === "MyCare" ||
        page.PageType === "MyLiving" ||
        page.PageType === "MyService"
      ) {
        ret.structure = this.pageTreeRenderer.createMenuHTML(page);
        page.PageMenuStructure.Rows.forEach((row: any) => {
          row.Tiles.forEach((tile: any) => {
            if (
              tile.Action.ObjectType == "DynamicForm" ||
              tile.Action.ObjectType == "WebLink"
            ) {
              const title =
                tile.Action.ObjectType == "DynamicForm"
                  ? "Dynamic Form"
                  : "Web Link";

              linkPages.push({
                id: tile.Action.ObjectId,
                title: title,
                structure: this.pageTreeRenderer.createLinkHTML(
                  title,
                  tile.Action.ObjectUrl
                ),
                thumbnail: page.PageThumbnailUrl,
                children: [],
                x: 0,
                y: 0,
              });
              ret.children.push(tile.Action.ObjectId);
            } else if (tile.Action.ObjectId) {
              if (
                this.pages.filter(
                  (page: any) => page.PageId === tile.Action.ObjectId
                )
              ) {
                this.primaryNodeId = page.PageId;
                ret.children.push(tile.Action.ObjectId);
              }
            }
          });
        });
      } else if (page.PageType === "Information") {
        if (page.PageInfoStructure.InfoContent) {
          ret.structure = this.PageTreeRendererInfoPage.createMenuHTML(page);
          page.PageInfoStructure.InfoContent.forEach((row: any) => {
            // console.log(`info rows`, row)
            if (row.InfoType === "TileRow") {
              row.Tiles.forEach((tile: any) => {
                if (
                  tile.Action.ObjectType == "DynamicForm" ||
                  tile.Action.ObjectType == "WebLink"
                ) {
                  const title =
                    tile.Action.ObjectType == "DynamicForm"
                      ? "Dynamic Form"
                      : "Web Link";
                  linkPages.push({
                    id: tile.Action.ObjectId,
                    title: title,
                    structure: "",
                    thumbnail: page.PageThumbnailUrl,
                    children: [],
                    x: 0,
                    y: 0,
                  });
                  ret.children.push(tile.Action.ObjectId);
                } else if (tile.Action.ObjectId) {
                  if (
                    this.pages.some(
                      (page: any) => page.PageId === tile.Action.ObjectId
                    )
                  ) {
                    ret.children.push(tile.Action.ObjectId);
                  }
                }
              });
            }
          });
        }
      } else if (
        page.PageType == "Content" ||
        page.PageType == "Location" ||
        page.PageType == "Reception"
      ) {
        ret.structure = this.pageTreeRenderer.createContentHTML(page);
      } else if (page.PageType == "Calendar") {
        ret.structure = this.pageTreeRenderer.createAgendaHTML(page);
      } else if (page.PageType == "MyActivity") {
        ret.structure = this.pageTreeRenderer.createMyActivityHTML(page);
      } else if (page.PageType == "Map") {
        ret.structure = this.pageTreeRenderer.createMapHTML(page);
      }
      return ret;
    });

    return pages.concat(linkPages);
    // console.log(linkPages)
    // return pages
  }

  createNodes(processedPages: any[] = this.processedPages) {
    return processedPages.map((p) => ({
      id: p.id,
      name: p.title,
      children: p.children,
      structure: p.structure,
      thumbnail: p.thumbnail,
    }));
  }
  createLinks(processedPages: any[] = this.processedPages) {
    return processedPages.flatMap((p) =>
      p.children.map((childId: string) => ({
        source: p.id,
        target: childId,
      }))
    );
  }

  buildTree() {
    const nodeCount = this.nodes.length;
    const minSize = 800;
    const spacingFactor = 300; // Adjust based on how spaced out you want nodes

    this.width = Math.max(
      minSize,
      Math.ceil(Math.sqrt(nodeCount)) * spacingFactor
    );
    this.height = this.width;

    // creating the parent svg component
    // this.svg = this.d3.select("svg")
    this.svg = this.d3
      .select("#graph-container-1")
      .select("svg")
      .attr("viewBox", [0, 0, this.width, this.height])
      .attr("preserveAspectRatio", "xMidYMid meet");
    this.container = this.svg.append("g");
    this.splitLinks();
    this.forceSimulation();
    this.createNormalLinks();
    this.createLinkArrows();
    this.createSelfArcs();
    this.createCircularNodes();
    this.onTick();
    this.panAndZoom();
  }

  splitLinks() {
    this.selfLinks = this.links.filter((d) => d.source === d.target);
    this.normalLinks = this.links.filter((d) => d.source !== d.target);
  }

  forceSimulation() {
    this.simulation = this.d3
      .forceSimulation(this.nodes)
      .force(
        "link",
        this.d3
          .forceLink(this.normalLinks)
          .id((d: any) => d.id)
          .distance(300)
      )
      .force("charge", this.d3.forceManyBody().strength(-1000))
      .force("center", this.d3.forceCenter(this.width / 2, this.height / 2));
  }

  createNormalLinks() {
    // Normal links (lines)
    this.link = this.container
      .append("g")
      .attr("stroke", "#fff")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(this.normalLinks)
      .join("line")
      .attr("stroke-width", 2.0);
  }

  createLinkArrows() {
    // Arrow marker definition
    this.svg
      .append("defs")
      .append("marker")
      .attr("id", "arrow")
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 5)
      .attr("refY", 0)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
      .append("path")
      .attr("d", "M0,-5L10,0L0,5")
      .attr("fill", "#fff");

    // Arrows at midpoint
    this.arrows = this.container
      .append("g")
      .selectAll("path")
      .data(this.normalLinks)
      .join("path")
      .attr("fill", "#fff")
      .attr("marker-end", "url(#arrow)");
  }

  createSelfArcs() {
    // Self-loop arcs
    this.selfArcs = this.container
      .append("g")
      .selectAll("path")
      .data(this.selfLinks)
      .join("path")
      .attr("fill", "none")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .attr("marker-end", "url(#arrow)");
  }

  createCircularNodes() {
    const radius = 50;
    // Nodes
    this.node = this.container
      .append("g")
      .attr("stroke", "#222f54")
      .attr("stroke-width", 1.5)
      .selectAll("g")
      .data(this.nodes)
      .join("g")
      .call(this.drag())
      .on("click", (event: any, d: any) => this.onNodeClick(event, d));

    this.node
      .append("rect")
      .attr("width", 200)
      .attr("height", 350)
      .attr("x", (d: any) => -Math.max(d.name.length * 8, 100) / 2)
      .attr("y", -20)
      .attr("stroke", (d: any) =>
        d.id === this.primaryNodeId ? "#FF5722" : "#222f54"
      )
      .attr("fill", "#efeeec");
    // .style("background", "#EFEEEC");

    // this.node
    //   .append("text")
    //   .text((d: any) => d.name)
    //   .attr("dy", 6)
    //   .attr("text-anchor", "middle")
    //   .attr("stroke", "none")
    //   .attr("fill", "#222f54");

    this.node
      .append("foreignObject")
      .attr("height", 350)
      .attr("width", 200)
      .attr("y", -20)
      .attr("x", -50)
      .attr("fill", "#efeeec")
      .html(
        (d: any) => `
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%; padding:2px">
            <div style="display:flex; ">
              <svg xmlns="http://www.w3.org/2000/svg" data-name="Group 14" viewBox="0 0 47 47" class="content-back-butto" width="30" height="30">
                  <g id="Ellipse_6" data-name="Ellipse 6" fill="none" stroke="#262626" stroke-width="1">
                  <circle cx="23.5" cy="23.5" r="23.5" stroke="none"></circle>
                  <circle cx="23.5" cy="23.5" r="23" fill="none"></circle>
                  </g>
                  <path id="Icon_ionic-ios-arrow-round-up" data-name="Icon ionic-ios-arrow-round-up" d="M13.242,7.334a.919.919,0,0,1-1.294.007L7.667,3.073V19.336a.914.914,0,0,1-1.828,0V3.073L1.557,7.348A.925.925,0,0,1,.263,7.341.91.91,0,0,1,.27,6.054L6.106.26h0A1.026,1.026,0,0,1,6.394.07.872.872,0,0,1,6.746,0a.916.916,0,0,1,.64.26l5.836,5.794A.9.9,0,0,1,13.242,7.334Z" transform="translate(13 30.501) rotate(-90)" fill="#262626"></path>
              </svg>
              <div class="">
                <div style="padding: 5px; text-transform: uppercase;">${d.name}</div>
              </div>
            </div>
           <img src="${d.thumbnail}" alt="${d.name}" style="max-width: 100%; margin-top:0px; height: auto; text-transform: uppercase;" />
        </div>
        `
      );
  }

  onTick() {
    this.simulation.on("tick", () => {
      // Normal links
      this.link
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);

      // Midpoint arrows
      this.arrows.attr("d", (d: any) => {
        const x1 = d.source.x,
          y1 = d.source.y;
        const x2 = d.target.x,
          y2 = d.target.y;
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const len = 10;

        const tx = mx - len * Math.cos(angle);
        const ty = my - len * Math.sin(angle);
        const ex = mx + len * Math.cos(angle);
        const ey = my + len * Math.sin(angle);

        return `M${tx},${ty}L${ex},${ey}`;
      });

      // Self-loop arcs
      this.selfArcs.attr("d", (d: any) => {
        const x = d.source.x;
        const y = d.source.y;
        const r = 60; // radius of loop
        return `
                M ${x} ${y}
                m 0 -${r}
                a ${r} ${r} 0 1 1 1 0.01
                `;
      });
      this.node.attr("transform", (d: any) => {
        d.x = Math.max(100, Math.min(this.width - 100, d.x));
        d.y = Math.max(100, Math.min(this.height - 100, d.y));
        return `translate(${d.x},${d.y})`;
      });
    });
  }

  panAndZoom() {
    // Zoom and pan
    // this.zoom = this.d3
    //   .zoom()
    //   .scaleExtent([0.5, 2])
    //   .on("zoom", (event: any) => {
    //     this.container.attr("transform", event.transform);
    //   });
    // this.svg.call(this.zoom);
  }

  drag() {
    return this.d3
      .drag()
      .on("start", (event: any, d: any) => this.dragstarted(event, d))
      .on("drag", (event: any, d: any) => this.dragged(event, d))
      .on("end", (event: any, d: any) => this.dragended(event, d));
  }

  dragstarted(event: any, d: any) {
    if (!event.active) this.simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  dragged(event: any, d: any) {
    d.fx = event.x;
    d.fy = event.y;
  }

  dragended(event: any, d: any) {
    if (!event.active) this.simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  onNodeClick(event: any, d: any) {
    this.primaryNodeId = d.id;
    d.title = d.name;
    let nodesToAdd: string[] = [d.id];
    const processedPages: any[] = [d]; // Start with the clicked node

    const childIds = [...(d.children || [])]; // Defensive copy

    while (childIds.length > 0) {
      const childId = childIds.pop();
      if (!childId || nodesToAdd.includes(childId)) continue;

      nodesToAdd.push(childId);

      const childPage = this.processedPages.find(
        (page: any) => page.id === childId
      );
      if (childPage) {
        processedPages.push(childPage);
        if (childPage.children) {
          childIds.push(...childPage.children);
        }
      }
    }

    // console.log("nodes page", processedPages);

    this.nodes = this.createNodes(processedPages);
    this.links = this.createLinks(processedPages);
    this.init();
  }
}
