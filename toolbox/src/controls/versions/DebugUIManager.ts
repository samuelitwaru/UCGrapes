// export class DebugUIManager {
//     container:HTMLElement;
//     constructor() {
//         this.container = document.createElement('div');
//         init();
//     }

//     private init() {
//         this.container.id = 'debugModal';
//         this.container.classList.add('tb-debug-modal');

//         this.getProgressStage();
//         this.getResultsStage();
//     }

//     private getProgressStage() {
//         const progressStage = document.createElement('div');
//         progressStage.id = 'debugModalProgressStage';

//         const progressContainer = document.createElement('div');
//         progressContainer.style.textAlign = "center";

//         const spinner = document.createElement('div');
//         spinner.classList.add('tb-progress-spinner');

//         const h2 = document.createElement('h2');
//         h2.innerText = "Scanning Links...";

//         const p = document.createElement('p');
//         p.innerText = "This may take a few seconds";

//         progressContainer.appendChild(spinner);
//         progressContainer.appendChild(h2);
//         progressContainer.appendChild(p);

//         progressStage.appendChild(progressContainer);

//         this.container.appendChild(progressStage);
//     }

//     private getResultsStage() {
//         const resultsState = document.createElement('div')
//         resultsState.id = 'debugModalResultsStage';
//         resultsState.style.display = "none";

//         const header = document.createElement('h2');
//         header.classList.add('tb-modal-header')

//         const h2 = document.createElement('h2');
//         h2.innerText = "Debug Results";

//         const button = document.createElement('button');
//         button.classList.add('tb-close-btn');
//         button.innerHTML = "&times;";

//         button.addEventListener('click', () => {
            
//         })

//         header.appendChild(h2);
//         header.appendChild(button);

//         const resultsList = document.createElement('div');
//         resultsList.id = 'debugModalResultsList';

//         const resultsSummary = document.createElement('div');
//         resultsSummary.classList.add('tb-debug-result-summary');

//         const span = document.createElement('span');
//         span.innerHTML = `Total Links: <span id="totalLinks">0</span>`;

//         const workingSpan = document.createElement('span');
//         workingSpan.innerHTML = `Working Links: <span id="workingLinks">0</span>`;

//         const brokenSpan = document.createElement('span');
//         brokenSpan.innerHTML = `Broken Links: <span id="brokenLinks">0</span>`;

//         resultsSummary.appendChild(span);
//         resultsSummary.appendChild(workingSpan);
//         resultsSummary.appendChild(brokenSpan);

//         this.container.appendChild(header);
//         this.container.appendChild(resultsList);
//         this.container.appendChild(resultsSummary);
//     }



// }