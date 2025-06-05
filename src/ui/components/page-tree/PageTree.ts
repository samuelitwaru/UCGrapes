import { AppConfig } from '../../../AppConfig';
import { ThemeManager } from '../../../controls/themes/ThemeManager';
import { AppVersionManager } from '../../../controls/versions/AppVersionManager';
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

type D3Node = {
    id: string;
    title: string;
    structure: string;
    thumbnail: string;
    parentId: string | null;
    children: string[];
    x: Number,
    y: Number
};

type D3Link = {
    source: string;
    target: string;
};

export class PageTree {
    sampleData: any;
    graphData: { nodes: unknown[]; links: any[]; };
    graphContainer: HTMLDivElement;
    link: any;
    node: any;
    simulation: any;
    simulationActive: boolean | undefined;
    d3: any;
    pages: any;
    themeManager: ThemeManager;
    pageTreeRenderer: PageTreeRenderer;
    appVersionManager: AppVersionManager;
    constructor(){
        this.pageTreeRenderer = new PageTreeRenderer()
        this.themeManager = new ThemeManager();
        this.themeManager = new ThemeManager();
        this.appVersionManager = new AppVersionManager();
        this.pages = this.appVersionManager.getPages();
        const processsedPages = this.processPageData()
        const config = AppConfig.getInstance();
        this.d3 = config.UC.d3
        this.graphData = this.convertPagesToD3Data(processsedPages)
        this.graphContainer = this.build();
        this.buildTree();
    }

    processPageData()  {
        const linkPages: PageNode[] = []
        const pages = this.pages.map((page:any)=>{
            let ret:PageNode = {
                id: page.PageId,
                title:page.PageName,
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
                            console.log('    tile:', tile.Action.ObjectType)
                            ret.children.push(tile.Action.ObjectId)
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

        // return pages
        return this.assignCoordinates(pages.concat(linkPages))
    }

    convertPagesToD3Data(pages: PageNode[]) {
        const idToNode: Record<string, D3Node> = {};
        const links: D3Link[] = [];
      
        // Step 1: Create basic nodes
        pages.forEach(page => {
            idToNode[page.id] = {
                id: page.id,
                title: page.title,
                structure: page.structure,
                thumbnail: page.thumbnail,
                parentId: null,
                children: page.children,
                x: page.x,
                y: page.y
            };
        });
      
        // Step 2: Assign parentIds and build links
        pages.forEach(parent => {
          parent.children.forEach(childId => {
            if (idToNode[childId]) {
              idToNode[childId].parentId = parent.id;
              links.push({ source: parent.id, target: childId });
            }
          });
        });
      
        // Final D3 format
        const nodes = Object.values(idToNode).filter((node) => node.parentId || node.children.length > 0);
        return { nodes, links };
      }

    build() {
        const mainContainer = document.getElementById("main-content") as HTMLDivElement;

        this.graphContainer = document.getElementById("graph-container-1") as HTMLDivElement

        if (!this.graphContainer) {
            this.graphContainer = document.createElement("div");
            this.graphContainer.id = "graph-container-1";
        } else {
            this.graphContainer.innerHTML = ""
        }

        // const iframe = document.createElement("iframe");
        // iframe.src = "http://localhost:8083/Comforta_version20DevelopmentNETPostgreSQL/wp_toolboxtree.aspx"; // Replace with your URL
        // iframe.width = "100%";
        // iframe.height = "100%";
        // this.graphContainer.appendChild(iframe);

        mainContainer.appendChild(this.graphContainer);
        this.graphContainer.setAttribute("style", "display:none;")
        return this.graphContainer;
    }

    buildTree() {
        // Set up the SVG container
        const width = window.innerWidth;
        const height = window.innerHeight;


        const svg = this.d3.select("#graph-container-1")
            .append("svg")
            .attr("width", width)
            .attr("height", height);
            // Add arrowhead marker definition
        svg.append("defs").append("marker")
        .attr("id", "arrowhead")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 20)
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#adb5bd");

        // Create a group for the graph that will be transformed for zooming
        const g = svg.append("g");
        
        // Set up zoom behavior
        const zoom = this.d3.zoom()
            .scaleExtent([0.1, 4])
            .on("zoom", (event:any) => {
                g.attr("transform", event.transform);
                // Hide popover when zooming
                this.closePopover();
            });
        
        svg.call(zoom);

        // Create nodes
        this.node = g.selectAll(".node")
        .data(this.graphData.nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", (d: { x: any; y: any; }) => `translate(${d.x},${d.y})`)
        .on("click", (event:any , d:any) => {
            // this.showPopover(event, d)
            this.d3.select(event.currentTarget).raise();
        })
        .call(this.d3.drag()
            .on("start", (event:any , d:any) => {this.dragStarted(event, d)})
            .on("drag", (event:any , d:any) => {this.dragged(event, d)})
            .on("end", (event:any , d:any) => {this.dragEnded(event, d)}));

        // Add rectangles to nodes
        this.node.append("rect")
            .attr("width", 250)
            .attr("height", 500)
            .attr("x", (d:any) => -Math.max(d.title.length * 8, 100) / 2)
            .attr("y", -20)
            .style("stroke", (d:any) => this.getNodeColor(d.status))
            .style("background", "#EFEEEC");
    
        
        // Add text to nodes
        this.node.append("foreignObject")
        .attr("height", 500)
        .attr("width", 250)
        .attr("y", -20)
        .attr("x", -50)
        .html((d:any)=>`
        <div xmlns="http://www.w3.org/1999/xhtml" style="width: 100%; height: 100%;">
            ${d.structure }
        </div>
        `);

        // Create links
        this.link = g.selectAll(".link")
            .data(this.graphData.links)
            .enter()
            .append("path")
            .attr("class", "link");
        
         // Force simulation
        this.simulation = this.d3.forceSimulation(this.graphData.nodes)
            .force("link", this.d3.forceLink(this.graphData.links).id((d:any) => d.id).distance(150))
            .force("charge", this.d3.forceManyBody().strength(-300))
            .force("center", this.d3.forceCenter(width / 2, height / 2))
            .on("tick", () => {this.ticked()})
            .alphaDecay(0.028);

        this.simulationActive = true;
        this.updateNodeCounter();

        // Control buttons
        this.d3.select("#zoom-in").on("click", () => {
            svg.transition().duration(300).call(zoom.scaleBy, 1.3);
        });
        
        this.d3.select("#zoom-out").on("click", () => {
            svg.transition().duration(300).call(zoom.scaleBy, 0.7);
        });
        
        this.d3.select("#reset").on("click", () => {
            svg.transition().duration(700).call(
                zoom.transform,
                this.d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8)
            );
        });
        
        // Toggle layout
        this.d3.select("#toggle-layout").on("click", () => {
            this.toggleLayout()
        });

        // Add random node
        this.d3.select("#add-node").on("click", () => {
            // Generate random node
            const parentIndex = Math.floor(Math.random() * this.graphData.nodes.length);
            const parentNode:any = this.graphData.nodes[parentIndex];
            const newId:string = (Math.max(...this.graphData.nodes.map((n:any)=> parseInt(n.id))) + 1).toString();
            
            const newNode = {
                id: newId,
                title: "New Page " + newId,
                parentId: parentNode.id,
                status: Math.random() > 0.3 ? "Published" : "Draft",
                created: "2023-04-13",
                lastModified: "2023-04-13",
                views: 0,
                x: parentNode.x + (Math.random() * 100 - 50),
                y: parentNode.y + (Math.random() * 100 - 50),
                children: []
            };
            
            // Add to parent's children array
            parentNode.children.push(newId);
            
            // Create new link
            const newLink = {
                source: parentNode.id,
                target: newId
            };
            
            // Add to data
            this.graphData.nodes.push(newNode);
            this.graphData.links.push(newLink);
            
            // Update simulation
            this.simulation.nodes(this.graphData.nodes);
            this.simulation.force("link").links(this.graphData.links);
            
            // Update visualization
            this.updateVisualization();
            
            // Restart simulation
            this.simulation.alpha(1).restart();
        });

        // Initial view adjustment
        svg.call(
            zoom.transform,
            this.d3.zoomIdentity.translate(width / 2, height / 2).scale(0.8)
        );
        this.toggleLayout()
        
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

    // Function to convert flat data to hierarchical structure
    processData(data: { pages: any; }) {
        const pages = data.pages;
        const nodesMap: { [key: string]: any; } = {};
        const links: { source: any; target: any; }[] = [];
        
        // Create nodes with additional properties
        pages.forEach((page: { id: any; title: any; parentId: any; status: any; created: any; lastModified: any; views: any; }) => {
            nodesMap[pages.id] = {
                id: page.id,
                title: page.title,
                parentId: page.parentId,
                status: page.status || "Unknown",
                created: page.created || "N/A",
                lastModified: page.lastModified || "N/A",
                views: page.views || 0,
                x: Math.random() * 800,
                y: Math.random() * 600,
                // Add derived properties
                children: []
            };
        });
        
        // Create links and populate children arrays
        pages.forEach((page: { parentId: string | number; id: any; }) => {
            if (page.parentId) {
                links.push({
                    source: page.parentId,
                    target: page.id
                });
                
                // Add to parent's children array
                if (nodesMap[page.parentId]) {
                    nodesMap[page.parentId].children.push(page.id);
                }
            }
        });
        
        return {
            nodes: Object.values(nodesMap),
            links: links
        };
    }

    // Define node color based on status
    getNodeColor(status:string) {
        switch(status) {
            case "Published": return "#28a745";
            case "Draft": return "#ffc107";
            case "Archived": return "#6c757d";
            default: return "#007bff";
        }
    }

    ticked() {
        this.link.attr("d", (d:any) => {
            const sourceNode:any = this.graphData.nodes.find((node:any) => node.id === d.source.id || node.id === d.source);
            const targetNode:any = this.graphData.nodes.find((node:any) => node.id === d.target.id || node.id === d.target);
            
            if (!sourceNode || !targetNode) return "";
            
            // Calculate rectangle dimensions
            const sourceWidth = Math.max(sourceNode.title.length * 8, 100);
            const sourceHeight = 40;
            const targetWidth = Math.max(targetNode.title.length * 8, 100);
            const targetHeight = 40;
            
            // Calculate path
            const sourceX = sourceNode.x;
            const sourceY = sourceNode.y;
            const targetX = targetNode.x;
            const targetY = targetNode.y;
            
            // Calculate direction vector
            const dx = targetX - sourceX;
            const dy = targetY - sourceY;
            const angle = Math.atan2(dy, dx);
            
            // Calculate intersection points with rectangles
            const sourceIntersectX = sourceX + Math.cos(angle) * (sourceWidth / 2);
            const sourceIntersectY = sourceY + Math.sin(angle) * (sourceHeight / 2);
            const targetIntersectX = targetX - Math.cos(angle) * (targetWidth / 2);
            const targetIntersectY = targetY - Math.sin(angle) * (targetHeight / 2);
            
            return `M${sourceIntersectX},${sourceIntersectY} L${targetIntersectX},${targetIntersectY}`;
        });
        
        this.node.attr("transform", (d:any) => `translate(${d.x},${d.y})`);
    }
    
    // Drag functions
    dragStarted(event:any, d:any) {
        this.d3.select(event.currentTarget).raise();
        if (!event.active) this.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        this.closePopover();
    }
    
    dragged(event:any, d:any) {
        this.d3.select(event.currentTarget).raise();
        d.fx = event.x;
        d.fy = event.y;
    }
    
    dragEnded(event:any, d:any) {
        this.d3.select(event.currentTarget).raise();
        if (!event.active) this.simulation.alphaTarget(0);
        // Don't reset position - this keeps the node where it was dragged
        // d.fx = null;
        // d.fy = null;
    }
    
    showPopover(event:any, d:any) {
        event.stopPropagation(); // Prevent triggering container clicks
        
        // Get parent node title if exists
        let parentTitle = "None";
        if (d.parentId) {
            const parentNode:any = this.graphData.nodes.find((node:any) => node.id === d.parentId);
            if (parentNode) parentTitle = parentNode.title;
        }
        
        // Update popover content
        this.d3.select("#popover-title").text(d.title);
        this.d3.select("#popover-id").text(d.id);
        this.d3.select("#popover-parent").text(parentTitle);
        this.d3.select("#popover-children").text(d.children.length);
        this.d3.select("#popover-created").text(d.created);
        this.d3.select("#popover-status").text(d.status);
        
        // Position and show popover
        const popover = this.d3.select("#popover");
        popover
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 15) + "px")
            .classed("active", true);
        
        // Close popover when clicking outside
        document.addEventListener("click", this.closePopoverOnClick);
    }
    
    closePopoverOnClick(event:any) {
        if (!event.target.closest("#popover") && !event.target.closest(".node")) {
            this.closePopover();
        }
    }
    
    closePopover() {
        this.d3.select("#popover").classed("active", false);
        document.removeEventListener("click", this.closePopoverOnClick);
    }
    
    // Update node counter
    updateNodeCounter() {
        this.d3.select("#node-count").text(this.graphData.nodes.length);
    }

    toggleLayout() {
        this.simulationActive = !this.simulationActive;
        if (this.simulationActive) {
            // Release fixed positions
            this.graphData.nodes.forEach((node:any) => {
                node.fx = null;
                node.fy = null;
            });
            this.simulation.alphaTarget(0.3).restart();
            setTimeout(() => this.simulation.alphaTarget(0), 1000);
        } else {
            // Fix all nodes in current positions
            this.graphData.nodes.forEach((node:any) => {
                node.fx = node.x;
                node.fy = node.y;
            });
            this.simulation.alphaTarget(0);
        }
    }

    updateVisualization() {
        // Update links
        this.link = this.link.data(this.graphData.links);
        this.link.exit().remove();
        this.link = this.link.enter()
            .append("path")
            .attr("class", "link")
            .merge(this.link);
        
        // Update nodes
        this.node = this.node.data(this.graphData.nodes);
        this.node.exit().remove();
        
        const nodeEnter = this.node.enter()
            .append("g")
            .attr("class", "node")
            .attr("transform", (d:any) => `translate(${d.x},${d.y})`)
            .on("click", (event:any , d:any) => {this.showPopover(event, d)})
            .call(this.d3.drag()
                .on("start", (event:any , d:any) => {this.dragStarted(event, d)})
                .on("drag", (event:any , d:any) => {this.dragged(event, d)})
                .on("end", (event:any , d:any) => {this.dragEnded(event, d)}));
        
        nodeEnter.append("rect")
            .attr("width", (d:any) => Math.max(d.title.length * 8, 100))
            .attr("height", 40)
            .attr("x", (d:any) => -Math.max(d.title.length * 8, 100) / 2)
            .attr("y", -20)
            .style("stroke", (d:any) => this.getNodeColor(d.status));
        
        nodeEnter.append("circle")
            .attr("r", 5)
            .attr("cx", (d:any) => Math.max(d.title.length * 8, 100) / 2 - 10)
            .attr("cy", -10)
            .attr("fill", (d:any) => this.getNodeColor(d.status));
        
        nodeEnter.append("text")
            .text((d:any) => d.title)
            .attr("dy", 5);
        
        this.node = nodeEnter.merge(this.node);
        
        // Update counter
        this.updateNodeCounter();
    }

    assignCoordinates(nodes:any[]) {
        const nodeMap = new Map();
        nodes.forEach((node) => nodeMap.set(node.id, { ...node }));

        const roots = nodes.filter(
          (node) => !nodes.some((n) => n.children.includes(node.id))
        );

        let yCounter = -500;

        function setPosition(nodeId:string, depth:number) {   
            const node = nodeMap.get(nodeId);
            node.x = -1000 + (depth * 400);
            node.y = yCounter;
            yCounter += 100;

            node.children.forEach((childId:string, index:number) => {
                yCounter = node.y + (100 * index)
                setPosition(childId, depth + 1);
            });
        }

        roots.forEach((root) => {
            setPosition(root.id, 0)
        });

        return Array.from(nodeMap.values());
    }
}