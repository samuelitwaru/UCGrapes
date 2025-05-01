import { AppConfig } from '../../../AppConfig';
import { ThemeManager } from '../../../controls/themes/ThemeManager';
import { PageTreeRenderer } from './PageTreeRenderer';

interface PageNode {
    id: string;
    title: string;
    structure: string;
    thumbnail: string;
    children: string[]; // recursive type for nested structure
    x: Number,
    y: Number
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
    processedPages!: { id: number; title: string; children: number[]; }[];
    nodes!: any[];
    links!: { source: number; target: number; }[];
    svg: any;
    width: number = 800;
    height: number = 800;
    selfLinks: { source: number; target: number; }[] = [];
    normalLinks: { source: number; target: number; }[] = [];
    container: any;
    selfArcs: any;
    arrows: any;
    graphContainer!: HTMLDivElement;
    zoom: any;
    pageTreeRenderer: PageTreeRenderer;
    constructor(){
        this.pageTreeRenderer = new PageTreeRenderer()
        const config = AppConfig.getInstance();
        this.d3 = config.UC.d3
        this.themeManager = new ThemeManager();
        const appVersionManager = this.themeManager.appVersionManager
        this.pages = appVersionManager.getPages()
        this.processedPages = this.processPageData(this.pages)
        console.log('processed pages', this.processedPages.map((page:any) => page.title).sort())
        this.nodes = this.createNodes()
        this.links = this.createLinks()
        console.log('nodes', this.nodes)
        console.log('links', this.links)
        this.init()
    }

    init() {
        this.graphContainer = this.build();
        this.buildTree();
    }

    show(){
        const editorSections = document.getElementsByClassName("editor-main-section")
        //set display to none for editor section
        if (editorSections.length > 0) {
            // toggle display
            const div = editorSections[0] as HTMLDivElement
            if (div.style.display === "none") {
                div.style.display = "block";
                this.graphContainer.style.display = "none";
              } else {
                div.style.display = "none";
                this.graphContainer.style.display = "block";
                this.graphContainer.style.width = "100%";
                this.graphContainer.style.height = "100%";
              }
            // editorSections[0].setAttribute("style", "display:none;")
        }        
    }

    build() {
        const mainContainer = document.getElementById("main-content") as HTMLDivElement;
        this.graphContainer = document.getElementById("graph-container-1") as HTMLDivElement

        if (!this.graphContainer) {
            this.graphContainer = document.createElement("div");
            this.graphContainer.id = "graph-container-1";
        }
        this.graphContainer.innerHTML = "<svg></svg>"
        // mainContainer.innerHTML = ""
        mainContainer.appendChild(this.graphContainer);
        this.graphContainer.setAttribute("style", "display:block;width:100%;")
        return this.graphContainer;
    }

    processPageData(pages:any[])  {
        const linkPages: PageNode[] = []
        pages = pages.map((page:any)=>{
            let ret:PageNode = {
                id: page.PageId,
                title: page.PageName,
                structure: "",
                thumbnail: page.PageThumbnailUrl,
                children: [],
                x: 0,
                y: 0,
            }
            if (page.PageType === "Menu" || page.PageType === "MyCare" || page.PageType === "MyLiving" || page.PageType === "MyService") {
                ret.structure = this.pageTreeRenderer.createMenuHTML(page)
                page.PageMenuStructure.Rows.forEach((row:any) => {
                    row.Tiles.forEach((tile:any) => {
                        if (tile.Action.ObjectType == "DynamicForm" || tile.Action.ObjectType == "WebLink") {
                            const title = tile.Action.ObjectType == "DynamicForm" ? "Dynamic Form" : "Web Link"
                            linkPages.push({
                                id: tile.Action.ObjectId,
                                title: title,
                                structure: this.pageTreeRenderer.createLinkHTML(title, tile.Action.ObjectUrl),
                                thumbnail: "",
                                children: [],
                                x: 0,
                                y: 0,
                            })
                            ret.children.push(tile.Action.ObjectId)
                        } else if (tile.Action.ObjectId) {
                            if (this.pages.filter((page:any) => page.PageId === tile.Action.ObjectId)) {
                                ret.children.push(tile.Action.ObjectId)
                            }
                        }
                    })
                })
            } else if (page.PageType == "Content" || page.PageType == "Location" || page.PageType == "Reception") {
                ret.structure = this.pageTreeRenderer.createContentHTML(page);
            } else if (page.PageType == "Calendar") {
                ret.structure = this.pageTreeRenderer.createAgendaHTML(page);
            } else if (page.PageType == "MyActivity") {
                ret.structure = this.pageTreeRenderer.createMyActivityHTML(page);
            } else if (page.PageType == "Map") {
                ret.structure = this.pageTreeRenderer.createMapHTML(page);
            }
            return ret
        })

        return pages.concat(linkPages)
    }

    createNodes (processedPages:any[] = this.processedPages) {
        return processedPages.map(p => ({ id: p.id, name: p.title, children: p.children }));
    }
    createLinks(processedPages:any[] = this.processedPages) {
        return processedPages.flatMap(p => p.children.map((childId:string) => ({
            source: p.id,
            target: childId
        })));
    }

    buildTree() {
        this.width = 800;
        this.height = 800;

        // creating the parent svg component
        // this.svg = this.d3.select("svg")
        this.svg = this.d3.select("#graph-container-1").select("svg")
        .attr("viewBox", [0, 0, this.width, this.height]);
        this.container = this.svg.append("g");
        this.splitLinks()
        this.forceSimulation()
        this.createNormalLinks()
        this.createLinkArrows()
        this.createSelfArcs()
        this.createCircularNodes()
        this.onTick()
        this.panAndZoom()
    }

    splitLinks() {
        this.selfLinks = this.links.filter(d => d.source === d.target);
        this.normalLinks = this.links.filter(d => d.source !== d.target);
    }

    forceSimulation () {
        this.simulation = this.d3.forceSimulation(this.nodes)
        .force("link", this.d3.forceLink(this.normalLinks).id((d:any) => d.id).distance(400))
        .force("charge", this.d3.forceManyBody().strength(-400))
        .force("center", this.d3.forceCenter(this.width / 2, this.height / 2));
    }

    createNormalLinks() {
        // Normal links (lines)
        this.link = this.container.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-opacity", 0.6)
        .selectAll("line")
        .data(this.normalLinks)
        .join("line")
        .attr("stroke-width", 1.5);
    }

    createLinkArrows() {
        // Arrow marker definition
        this.svg.append("defs").append("marker")
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
        this.arrows = this.container.append("g")
        .selectAll("path")
        .data(this.normalLinks)
        .join("path")
        .attr("fill", "#fff")
        .attr("marker-end", "url(#arrow)");
    }

    createSelfArcs () {
        // Self-loop arcs
        this.selfArcs = this.container.append("g")
        .selectAll("path")
        .data(this.selfLinks)
        .join("path")
        .attr("fill", "none")
        .attr("stroke", "#fff")
        .attr("stroke-width", 2)
        .attr("marker-end", "url(#arrow)");
    }

    createCircularNodes () {
        const radius = 60
        // Nodes
        this.node = this.container.append("g")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .selectAll("g")
        .data(this.nodes)
        .join("g")
        .call(this.drag())
        .on("click", (event:any, d:any) => this.onNodeClick(event, d));

        this.node.append("circle")
        .attr("r", radius)
        .attr("fill", "#222f54");

        this.node.append("text")
        .text((d:any) => d.name)
        .attr("dy", 6)
        .attr("text-anchor", "middle")
        .attr("stroke", "none")
        .attr("fill", "#fff");

        
    }

    onTick () {
        this.simulation.on("tick", () => {
            // Normal links
            this.link
                .attr("x1", (d:any) => d.source.x)
                .attr("y1", (d:any) => d.source.y)
                .attr("x2", (d:any) => d.target.x)
                .attr("y2", (d:any) => d.target.y);

            // Midpoint arrows
            this.arrows.attr("d", (d:any) => {
                const x1 = d.source.x, y1 = d.source.y;
                const x2 = d.target.x, y2 = d.target.y;
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
            this.selfArcs.attr("d", (d:any) => {
                const x = d.source.x;
                const y = d.source.y;
                const r = 60; // radius of loop
                return `
                M ${x} ${y}
                m 0 -${r}
                a ${r} ${r} 0 1 1 1 0.01
                `;
            });

            // Position nodes
            this.node.attr("transform", (d:any) => `translate(${d.x},${d.y})`);
        });
    }

    panAndZoom () {
        // Zoom and pan
        this.zoom = this.d3.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", (event:any) => {
            this.container.attr("transform", event.transform);
        })
        this.svg.call(
            this.zoom
        );
    }

    drag() {
        return this.d3.drag()
          .on("start", (event:any, d:any) => this.dragstarted(event, d))
          .on("drag", (event:any, d:any) => this.dragged(event, d))
          .on("end", (event:any, d:any) => this.dragended(event, d));
    }

    dragstarted(event:any, d:any) {
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }
    dragged(event:any, d:any) {
        d.fx = event.x;
        d.fy = event.y;
    }
    
    dragended(event:any, d:any) {
        if (!event.active) this.simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    }
    
    onNodeClick(event:any, d:any) {
        let nodesToAdd:string[] = [d.id]
        const processedPages = this.processedPages.filter((page:any) => page.id === d.id)
        const childIds = d.children
        while (childIds.length > 0) {
            // for each childId, add to nodesToAdd
            const childId = childIds.pop()
            if (nodesToAdd.includes(childId)) continue
            nodesToAdd.push(childId)
            const childPage = this.processedPages.find((page:any) => page.id === childId)
            console.log(childPage?.title)
            if (childPage && childPage.children) {
                processedPages.push(childPage)
                childIds.push(...childPage.children)
            }
        }
        console.log('processed pages', processedPages.map((page:any) => page.title).sort())
        this.nodes = this.createNodes(processedPages)
        this.links = this.createLinks(processedPages)
        console.log('nodes', this.nodes)
        console.log('links', this.links)
        this.init()
    }

      

}