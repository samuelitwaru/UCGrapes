export class CtaIconList {
    iconsList: any;
    container: HTMLElement;
    constructor(iconsList: any) {
        this.iconsList = iconsList;
        this.container = document.createElement('div');
        this.init();
    }

    init() {
        this.container.id = 'call-to-actions';
        this.iconsList.forEach((icon: any) => {
            const iconElement = document.createElement('div');
            iconElement.className = 'call-to-action-item';
            iconElement.title = icon.CallToActionName;
            if (icon.CallToActionType === "Phone") {
                iconElement.innerHTML = iconSVGs.phone;
            } else if (icon.CallToActionType === "Email") {
                iconElement.innerHTML = iconSVGs.email;
            } else if (icon.CallToActionType === "Website") {
                iconElement.innerHTML = iconSVGs.website_url;
            } else if (icon.CallToActionType === "Map") {
                // iconElement.innerHTML = iconSVGs.location;
            } else if (icon.CallToActionType === "Form") {
                iconElement.innerHTML = iconSVGs.form;
            }

            this.container.appendChild(iconElement);
        })
    }

    render (container: HTMLElement) {
        container.appendChild(this.container);
    }
}

const iconSVGs = {
    phone: `<svg data-gjs-draggable="false" data-gjs-selectable="false" data-gjs-editable="false" data-gjs-highlightable="false" data-gjs-droppable="false" data-gjs-resizable="false" data-gjs-hoverable="false" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 49.417 49.418">
                <path data-gjs-draggable="false" data-gjs-selectable="false" data-gjs-editable="false" data-gjs-highlightable="false" data-gjs-droppable="false" data-gjs-resizable="false" data-gjs-hoverable="false" id="call" d="M29.782,3a2.149,2.149,0,1,0,0,4.3A19.3,19.3,0,0,1,49.119,26.634a2.149,2.149,0,1,0,4.3,0A23.667,23.667,0,0,0,29.782,3ZM12.032,7.305a2.548,2.548,0,0,0-.818.067,8.342,8.342,0,0,0-3.9,2.342C2.775,14.254.366,21.907,17.437,38.98S42.16,53.643,46.7,49.1a8.348,8.348,0,0,0,2.346-3.907,2.524,2.524,0,0,0-1.179-2.786c-2.424-1.418-7.654-4.484-10.08-5.9a2.523,2.523,0,0,0-2.568.012l-4.012,2.392a2.517,2.517,0,0,1-2.845-.168,65.811,65.811,0,0,1-5.711-4.981,65.07,65.07,0,0,1-4.981-5.711A2.512,2.512,0,0,1,17.5,25.2L19.9,21.191a2.533,2.533,0,0,0,.008-2.577L14.012,8.556A2.543,2.543,0,0,0,12.032,7.305Zm17.751,4.289a2.149,2.149,0,1,0,0,4.3A10.709,10.709,0,0,1,40.525,26.634a2.149,2.149,0,1,0,4.3,0A15.072,15.072,0,0,0,29.782,11.594Zm0,8.594a2.149,2.149,0,1,0,0,4.3,2.114,2.114,0,0,1,2.149,2.148,2.149,2.149,0,1,0,4.3,0A6.479,6.479,0,0,0,29.782,20.188Z" transform="translate(-4 -3)" fill="#fff"></path>
            </svg>`,
    email: `<svg data-gjs-draggable="false" data-gjs-selectable="false" data-gjs-editable="false" data-gjs-highlightable="false" data-gjs-droppable="false" data-gjs-resizable="false" data-gjs-hoverable="false" xmlns="http://www.w3.org/2000/svg" width="32" height="28" viewBox="0 0 41 32.8">
                <path data-gjs-draggable="false" data-gjs-selectable="false" data-gjs-editable="false" data-gjs-highlightable="false" data-gjs-droppable="false" data-gjs-resizable="false" data-gjs-hoverable="false" id="Path_1218" data-name="Path 1218" d="M6.1,4A4.068,4.068,0,0,0,2.789,5.7a1.5,1.5,0,0,0,.444,2.126l18,11.219a2.387,2.387,0,0,0,2.531,0L41.691,7.732a1.5,1.5,0,0,0,.384-2.2A4.063,4.063,0,0,0,38.9,4Zm35.907,8.376a.963.963,0,0,0-.508.152L23.765,23.711a2.392,2.392,0,0,1-2.531,0L3.5,12.656a.98.98,0,0,0-1.5.833V32.7a4.1,4.1,0,0,0,4.1,4.1H38.9A4.1,4.1,0,0,0,43,32.7V13.357A.981.981,0,0,0,42.007,12.376Z" transform="translate(-2 -4)" fill="#fff"></path>
            </svg>`,
    form: `<svg data-gjs-draggable="false" data-gjs-selectable="false" data-gjs-editable="false" data-gjs-highlightable="false" data-gjs-droppable="false" data-gjs-resizable="false" data-gjs-hoverable="false" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 49.417 49.418">
                <path data-gjs-draggable="false" data-gjs-selectable="false" data-gjs-editable="false" data-gjs-highlightable="false" data-gjs-droppable="false" data-gjs-resizable="false" data-gjs-hoverable="false" id="call" d="M29.782,3a2.149,2.149,0,1,0,0,4.3A19.3,19.3,0,0,1,49.119,26.634a2.149,2.149,0,1,0,4.3,0A23.667,23.667,0,0,0,29.782,3ZM12.032,7.305a2.548,2.548,0,0,0-.818.067,8.342,8.342,0,0,0-3.9,2.342C2.775,14.254.366,21.907,17.437,38.98S42.16,53.643,46.7,49.1a8.348,8.348,0,0,0,2.346-3.907,2.524,2.524,0,0,0-1.179-2.786c-2.424-1.418-7.654-4.484-10.08-5.9a2.523,2.523,0,0,0-2.568.012l-4.012,2.392a2.517,2.517,0,0,1-2.845-.168,65.811,65.811,0,0,1-5.711-4.981,65.07,65.07,0,0,1-4.981-5.711A2.512,2.512,0,0,1,17.5,25.2L19.9,21.191a2.533,2.533,0,0,0,.008-2.577L14.012,8.556A2.543,2.543,0,0,0,12.032,7.305Zm17.751,4.289a2.149,2.149,0,1,0,0,4.3A10.709,10.709,0,0,1,40.525,26.634a2.149,2.149,0,1,0,4.3,0A15.072,15.072,0,0,0,29.782,11.594Zm0,8.594a2.149,2.149,0,1,0,0,4.3,2.114,2.114,0,0,1,2.149,2.148,2.149,2.149,0,1,0,4.3,0A6.479,6.479,0,0,0,29.782,20.188Z" transform="translate(-4 -3)" fill="#fff"></path>
            </svg>`,
    website_url: `
            <svg data-gjs-draggable="false" data-gjs-selectable="false" data-gjs-editable="false" data-gjs-highlightable="false" data-gjs-droppable="false" data-gjs-resizable="false" data-gjs-hoverable="false" xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 49.417 49.418">
                <path data-gjs-draggable="false" data-gjs-selectable="false" data-gjs-editable="false" data-gjs-highlightable="false" data-gjs-droppable="false" data-gjs-resizable="false" data-gjs-hoverable="false" id="call" d="M29.782,3a2.149,2.149,0,1,0,0,4.3A19.3,19.3,0,0,1,49.119,26.634a2.149,2.149,0,1,0,4.3,0A23.667,23.667,0,0,0,29.782,3ZM12.032,7.305a2.548,2.548,0,0,0-.818.067,8.342,8.342,0,0,0-3.9,2.342C2.775,14.254.366,21.907,17.437,38.98S42.16,53.643,46.7,49.1a8.348,8.348,0,0,0,2.346-3.907,2.524,2.524,0,0,0-1.179-2.786c-2.424-1.418-7.654-4.484-10.08-5.9a2.523,2.523,0,0,0-2.568.012l-4.012,2.392a2.517,2.517,0,0,1-2.845-.168,65.811,65.811,0,0,1-5.711-4.981,65.07,65.07,0,0,1-4.981-5.711A2.512,2.512,0,0,1,17.5,25.2L19.9,21.191a2.533,2.533,0,0,0,.008-2.577L14.012,8.556A2.543,2.543,0,0,0,12.032,7.305Zm17.751,4.289a2.149,2.149,0,1,0,0,4.3A10.709,10.709,0,0,1,40.525,26.634a2.149,2.149,0,1,0,4.3,0A15.072,15.072,0,0,0,29.782,11.594Zm0,8.594a2.149,2.149,0,1,0,0,4.3,2.114,2.114,0,0,1,2.149,2.148,2.149,2.149,0,1,0,4.3,0A6.479,6.479,0,0,0,29.782,20.188Z" transform="translate(-4 -3)" fill="#fff"></path>
            </svg>
    `
};