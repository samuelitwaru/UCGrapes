import * as d3 from 'd3';

// Define types for your nodes and links
interface NodeData {
  id: string;
  title: string;
  parentId: string | null;
  status: string;
  created: string;
  lastModified: string;
  views: number;
  x: number;
  y: number;
  children: string[];
  index: number;
  vy: number;
  vx: number;
  fx: number;
  fy: number;
  // Will be added for hierarchy
  childrenNodes?: NodeData[];
}

interface LinkData {
  source: NodeData;
  target: NodeData;
  index: number;
}

interface GraphData {
  nodes: NodeData[];
  links: LinkData[];
}


export class PageTree {
    sampleData: any;
    graphData: { nodes: unknown[]; links: any[]; };
    graphContainer: HTMLDivElement;
    constructor(){
        this.graphContainer = this.build();
        // this.build2();
        
        this.sampleData = 
        {
            "pages": 
            [
                {"id": "1", "title": "Home Page", "parentId": null, "status": "Published", "created": "2023-01-10", "lastModified": "2023-04-01", "views": 12500},
                {"id": "2", "title": "Products", "parentId": "1", "status": "Published", "created": "2023-01-15", "lastModified": "2023-03-20", "views": 8750},
                {"id": "3", "title": "Services", "parentId": "1", "status": "Published", "created": "2023-01-15", "lastModified": "2023-03-18", "views": 7300},
                {"id": "4", "title": "About Us", "parentId": "1", "status": "Published", "created": "2023-01-12", "lastModified": "2023-02-28", "views": 5200},
                {"id": "5", "title": "Product A", "parentId": "2", "status": "Published", "created": "2023-01-20", "lastModified": "2023-03-25", "views": 4800},
                {"id": "6", "title": "Product B", "parentId": "2", "status": "Published", "created": "2023-01-22", "lastModified": "2023-03-27", "views": 3650},
                {"id": "7", "title": "Service X", "parentId": "3", "status": "Published", "created": "2023-01-25", "lastModified": "2023-03-10", "views": 2800},
                {"id": "8", "title": "Service Y", "parentId": "3", "status": "Draft", "created": "2023-01-27", "lastModified": "2023-03-15", "views": 0},
                {"id": "9", "title": "Team", "parentId": "4", "status": "Published", "created": "2023-02-05", "lastModified": "2023-02-20", "views": 1950},
                {"id": "10", "title": "History", "parentId": "4", "status": "Published", "created": "2023-02-08", "lastModified": "2023-02-25", "views": 1200},
                {"id": "11", "title": "Team Member 1", "parentId": "9", "status": "Published", "created": "2023-02-10", "lastModified": "2023-02-22", "views": 980},
                {"id": "12", "title": "Team Member 2", "parentId": "9", "status": "Published", "created": "2023-02-12", "lastModified": "2023-02-24", "views": 850}
            ]
        };

        // Process the data
        this.graphData = this.processData(this.sampleData);

        // this.createGraph()
    }

    build() {
        const mainContainer = document.getElementById("main-content") as HTMLDivElement;
        this.graphContainer = document.createElement("div");
        this.graphContainer.id = "graph-container-1";
        
        // add an iframe to the graphContainer
        const iframe = document.createElement("iframe");
        iframe.src = "http://localhost:8083/Comforta_version20DevelopmentNETPostgreSQL/wp_toolboxtree.aspx"; // Replace with your URL
        iframe.width = "100%";
        iframe.height = "100%";
        this.graphContainer.appendChild(iframe);
        mainContainer.appendChild(this.graphContainer);
        this.graphContainer.setAttribute("style", "display:none;")
        return this.graphContainer;
    }

    build2 () {
        // Your input data
        const graphData: GraphData = {"nodes":[{"id":"1","title":"Home Page","parentId":null,"status":"Published","created":"2023-01-10","lastModified":"2023-04-01","views":12500,"x":160.3810881801417,"y":241.49175563767668,"children":["2","3","4"],"index":0,"vy":0,"vx":0,"fx":-610,"fy":102},{"id":"2","title":"Products","parentId":"1","status":"Published","created":"2023-01-15","lastModified":"2023-03-20","views":8750,"x":234.21713414452663,"y":203.9996885862305,"children":[],"index":1,"vy":0,"vx":0,"fx":-300,"fy":-152},{"id":"3","title":"Services","parentId":"1","status":"Published","created":"2023-01-15","lastModified":"2023-03-18","views":7300,"x":152.57869477016035,"y":139.69278572792626,"children":[],"index":2,"vy":0,"vx":0,"fx":152.57869477016035,"fy":139.69278572792626},{"id":"4","title":"About Us","parentId":"1","status":"Published","created":"2023-01-12","lastModified":"2023-02-28","views":5200,"x":492.61037418345535,"y":496.46783876381375,"children":[],"index":3,"vy":0,"vx":0,"fx":492.61037418345535,"fy":496.46783876381375}],"links":[{"source":{"id":"1","title":"Home Page","parentId":null,"status":"Published","created":"2023-01-10","lastModified":"2023-04-01","views":12500,"x":160.3810881801417,"y":241.49175563767668,"children":["2","3","4"],"index":0,"vy":0,"vx":0,"fx":160.3810881801417,"fy":241.49175563767668},"target":{"id":"2","title":"Products","parentId":"1","status":"Published","created":"2023-01-15","lastModified":"2023-03-20","views":8750,"x":234.21713414452663,"y":203.9996885862305,"children":[],"index":1,"vy":0,"vx":0,"fx":234.21713414452663,"fy":203.9996885862305},"index":0},{"source":{"id":"1","title":"Home Page","parentId":null,"status":"Published","created":"2023-01-10","lastModified":"2023-04-01","views":12500,"x":160.3810881801417,"y":241.49175563767668,"children":["2","3","4"],"index":0,"vy":0,"vx":0,"fx":160.3810881801417,"fy":241.49175563767668},"target":{"id":"3","title":"Services","parentId":"1","status":"Published","created":"2023-01-15","lastModified":"2023-03-18","views":7300,"x":152.57869477016035,"y":139.69278572792626,"children":[],"index":2,"vy":0,"vx":0,"fx":152.57869477016035,"fy":139.69278572792626},"index":1},{"source":{"id":"1","title":"Home Page","parentId":null,"status":"Published","created":"2023-01-10","lastModified":"2023-04-01","views":12500,"x":160.3810881801417,"y":241.49175563767668,"children":["2","3","4"],"index":0,"vy":0,"vx":0,"fx":160.3810881801417,"fy":241.49175563767668},"target":{"id":"4","title":"About Us","parentId":"1","status":"Published","created":"2023-01-12","lastModified":"2023-02-28","views":5200,"x":492.61037418345535,"y":496.46783876381375,"children":[],"index":3,"vy":0,"vx":0,"fx":492.61037418345535,"fy":496.46783876381375},"index":2}]}

        // Step 1: Create a map for quick node access
        const nodeMap = new Map<string, NodeData>();
        graphData.nodes.forEach((node) => {
            node.childrenNodes = []; // initialize children container
            nodeMap.set(node.id, node);
        });

        // Step 2: Build hierarchy from root
        let rootNode: NodeData;
        rootNode = graphData.nodes.find(node => node.parentId === null) as NodeData; // Find the root node (no parentId)
        graphData.nodes.forEach((node) => {
            console.log(node)
            if (node.parentId) {
              const parent = nodeMap.get(node.parentId);
              if (parent) {
                parent.childrenNodes?.push(node);
              }
            } else {
              rootNode = node;
            }
        });

        // Step 3: Convert to D3 hierarchy
        const rootHierarchy = d3.hierarchy<NodeData>(rootNode, d => d.childrenNodes);

        // Step 4: Apply D3 tree layout (or use another layout if desired)
        // const treeLayout = d3.tree<NodeData>().size([800, 600]);
        // treeLayout(rootHierarchy);

        // Done! You can now use `rootHierarchy` for rendering
        console.log(rootHierarchy);

        // Create an SVG inside the container div
        const width = 800;
        const height = 600;
        const svg = d3.select("#graph-container-1")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(d3.zoom<SVGSVGElement, unknown>()
            .scaleExtent([0.5, 2]) // zoom limits
            .on("zoom", (event) => {
                g.attr("transform", event.transform); // zoom/pan all content
            }))
        .append("g");

        const g = svg.append("g")
        .attr("transform", "translate(50, 50)"); // initial offset


        // Generate tree layout
        const treeLayout = d3.tree<NodeData>().size([width - 100, height - 100]);
        treeLayout(rootHierarchy);

        // Draw links (edges)
        g.selectAll(".link")
        .data(rootHierarchy.links())
        .enter()
        .append("line")
        .attr("class", "link")
        .attr("x1", d => d.source.x || 0)
        .attr("y1", d => d.source.y || 0)
        .attr("x2", d => d.target.x || 0)
        .attr("y2", d => d.target.y || 0)
        .attr("stroke", "#ccc")
        .attr("stroke-width", 2);

        // Create nodes (group for circle + text)
        
        const nodes = g.selectAll(".node")
        .data(rootHierarchy.descendants())
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x},${d.y})`)

        // Draw circles
        nodes.append("circle")
        .attr("r", 20)
        .attr("fill", "#69b3a2")

        // Draw labels
        nodes.append("text")
        .text(d => d.data.title)
        .attr("dy", 5)
        .attr("x", d => d.children ? -25 : 25)
        .style("text-anchor", d => d.children ? "end" : "start")
        .style("font-size", "12px");

    }

    show(){
        const editorSection = document.getElementsByClassName("editor-main-section")
        //set display to none for editor section
        if (editorSection.length > 0) {
            editorSection[0].setAttribute("style", "display:none;")
        }    
        this.graphContainer.style.display = "block";
        this.graphContainer.style.width = "100%";
        this.graphContainer.style.height = "100%";
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

    createGraph() {
        const width = 800;
        const height = 600;

        const svg = d3.select(this.graphContainer)
            .append("svg")
            .attr("width", width)
            .attr("height", height);

        // const simulation = d3.forceSimulation(this.graphData.nodes)
        //     .force("link", d3.forceLink().id((d: any) => d.id).distance(100))
        //     .force("charge", d3.forceManyBody().strength(-300))
        //     .force("center", d3.forceCenter(width / 2, height / 2));

        const link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(this.graphData.links)
            .enter()
            .append("line")
            .attr("stroke-width", 2)
            .attr("stroke", "#999");

        const node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("circle")
            .data(this.graphData.nodes)
            .enter()
            .append("circle")
            .attr("r", 5)
            .attr("fill", "#69b3a2");

        node.append("title").text((d: any) => d.title);

        // simulation
        //     .nodes(this.graphData.nodes)
        //     .on("tick", () => {
        //         link.attr("x1", (d: { source: { x: any; }; }) => d.source.x)
        //             .attr("y1", (d: { source: { y: any; }; }) => d.source.y)
        //             .attr("x2", (d: { target: { x: any; }; }) => d.target.x)
        //             .attr("y2", (d: { target: { y: any; }; }) => d.target.y);

        //         node.attr("cx", (d: { x: any; }) => d.x)
        //             .attr("cy", (d: { y: any; }) => d.y);
        //     });
       
    }

    
}