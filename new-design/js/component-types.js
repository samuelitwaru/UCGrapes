// Register a custom component in GrapesJS
const tileComponent = {
    model: {
      defaults: {
        tagName: 'div',
        classes: ['template-wrapper', 'default-template'],
        // script: function () {
        //     // This script runs in the browser context for the component
        //     this.addEventListener('click', () => {
        //         console.dir(this)
        //       // Trigger the 'duplicate' event
        //       //this.dispatchEvent(new CustomEvent('duplicate', { bubbles: true }));
        //     });
        //   },
        attributes: {
          'tile-text': 'Tile',
          'tile-text-color': '#000000',
          'tile-text-align': 'left',
          'tile-icon': '',
          'tile-icon-color': '#000000',
          'tile-icon-align': 'left',
          'tile-bg-color': '#ffffff',
          'tile-bg-color-name': 'cardBgColor',
          'tile-bg-image': '',
          'tile-bg-image-opacity': '100',
          'tile-action-object': 'Page',
          'tile-action-object-id': '',
          id: 'i8gm',
        },
        droppable: false,
        selectable: false,
        components: [
          {
            tagName: 'div',
            classes: ['template-block'],
            attributes: {
              'tile-action-object-id': 'c4632a68-ec58-4995-bc56-96810d4cc714',
              'tile-action-object': 'Page, Clothing',
            },
            components: [
              {
                tagName: 'div',
                classes: ['tile-icon-section'],
                components: [
                  {
                    tagName: 'span',
                    classes: ['tile-close-icon', 'top-right', 'selected-tile-icon'],
                    components: [{ type: 'textnode', content: '×' }],
                  },
                  {
                    tagName: 'span',
                    classes: ['tile-icon'],
                    components: [{ type: 'textnode', content: '\n                ' }],
                  },
                ],
              },
              {
                tagName: 'div',
                classes: ['tile-title-section'],
                components: [
                  {
                    tagName: 'span',
                    classes: ['tile-close-icon', 'top-right', 'selected-tile-title'],
                    components: [{ type: 'textnode', content: '×' }],
                  },
                  {
                    tagName: 'span',
                    classes: ['tile-title'],
                    components: [{ type: 'textnode', content: 'Clothing' }],
                  },
                ],
              },
            ],
          },
          {
            tagName: 'button',
            classes: ['action-button', 'add-button-bottom'],
            attributes: { title: 'Add template below' },
            components: [
              {
                tagName: 'svg',
                attributes: {
                  xmlns: 'http://www.w3.org/2000/svg',
                  width: '16',
                  height: '16',
                  viewBox: '0 0 24 24',
                  fill: 'none',
                  stroke: 'currentColor',
                  'stroke-width': '2',
                  'stroke-linecap': 'round',
                  'stroke-linejoin': 'round',
                },
                components: [
                  {
                    tagName: 'line',
                    attributes: { x1: '12', y1: '5', x2: '12', y2: '19' },
                  },
                  {
                    tagName: 'line',
                    attributes: { x1: '5', y1: '12', x2: '19', y2: '12' },
                  },
                ],
              },
            ],
          },
          {
            tagName: 'button',
            classes: ['action-button', 'add-button-right'],
            attributes: { title: 'Add template right', id: 'is531' },
            components: [
              {
                tagName: 'svg',
                attributes: {
                  xmlns: 'http://www.w3.org/2000/svg',
                  width: '16',
                  height: '16',
                  viewBox: '0 0 24 24',
                  fill: 'none',
                  stroke: 'currentColor',
                  'stroke-width': '2',
                  'stroke-linecap': 'round',
                  'stroke-linejoin': 'round',
                },
                components: [
                  {
                    tagName: 'line',
                    attributes: { x1: '12', y1: '5', x2: '12', y2: '19' },
                  },
                  {
                    tagName: 'line',
                    attributes: { x1: '5', y1: '12', x2: '19', y2: '12' },
                  },
                ],
              },
            ],
          },
          {
            type: 'text',
            classes: ['resize-handle'],
            components: [{ type: 'textnode', content: '\n          ' }],
          },
        ],
      },
      init() {
        this.on('custom:event', () => {
            console.log('Custom event triggered!');
            console.log(this)
        });
    
        // Dispatching the custom event
        this.trigger('custom:event');
      },
    },
    view: {
        // events: {
        //     'click': 'handleClick',
        // },
      
        // handleClick() {
        //     console.dir(this.model.parent())
        //     // Trigger custom event when the component is clicked
        //     const clonedComponent = this.model.clone();

        //     // Get the parent of the current component
        //     const parent = this.model.parent();

        //     // Append the cloned component to the same parent
        //     parent.append(clonedComponent);

        //     // Optionally, you can also set the cloned component's position, or other attributes.
        //     console.log('Component duplicated');
        // },
    },
}

function createTemplateHTML(isDefault = false) {
  return `
      <div class="template-wrapper ${
        isDefault ? "default-template" : ""
      }"        
            data-gjs-selectable="false"
            data-gjs-type="template-wrapper"
            data-gjs-editable="false"
            data-gjs-highlightable="false"
            data-gjs-droppable="false"
            data-gjs-resizable="false"
            data-gjs-hoverable="false">
        <div class="template-block"
            ${defaultTileAttrs} 
           data-gjs-draggable="false"
           data-gjs-selectable="true"
           data-gjs-editable="false"
           data-gjs-highlightable="false"
           data-gjs-droppable="false"
           data-gjs-resizable="false"
           data-gjs-hoverable="false">
          
           <div class="tile-icon-section"
            data-gjs-draggable="false"
            data-gjs-selectable="false"
            data-gjs-editable="false"
            data-gjs-highlightable="false"
            data-gjs-droppable="false"
            data-gjs-resizable="false"
            data-gjs-hoverable="false"
            >
              <span class="tile-close-icon top-right selected-tile-icon"
                data-gjs-draggable="false"
                data-gjs-selectable="false"
                data-gjs-editable="false"
                data-gjs-highlightable="false"
                data-gjs-droppable="false"
                data-gjs-resizable="false"
                data-gjs-hoverable="false"
                >&times;</span>
              <span 
                class="tile-icon"
                data-gjs-draggable="false"
                data-gjs-selectable="false"
                data-gjs-editable="false"
                data-gjs-droppable="false"
                data-gjs-highlightable="false"
                data-gjs-hoverable="false">
              </span>
          </div>
          <div class="tile-title-section"
            data-gjs-draggable="false"
            data-gjs-selectable="false"
            data-gjs-editable="false"
            data-gjs-highlightable="false"
            data-gjs-droppable="false"
            data-gjs-resizable="false"
            data-gjs-hoverable="false"
            >
              <span class="tile-close-icon top-right selected-tile-title"
                data-gjs-draggable="false"
                data-gjs-selectable="false"
                data-gjs-editable="false"
                data-gjs-highlightable="false"
                data-gjs-droppable="false"
                data-gjs-resizable="false"
                data-gjs-hoverable="false"
                >&times;</span>
              <span 
                class="tile-title"
                data-gjs-draggable="false"
                data-gjs-selectable="false"
                data-gjs-editable="false"
                data-gjs-droppable="false"
                data-gjs-highlightable="false"
                data-gjs-hoverable="false">Title</span>
              </div>
          </div>
        ${
          !isDefault
            ? `
          <button class="action-button delete-button" title="Delete template"
                    data-gjs-draggable="false"
                    data-gjs-selectable="false"
                    data-gjs-editable="false"
                    data-gjs-droppable="false"
                    data-gjs-highlightable="false"
                    data-gjs-hoverable="false">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    data-gjs-draggable="false"
                    data-gjs-selectable="false"
                    data-gjs-editable="false"
                    data-gjs-editable="false"
                    data-gjs-droppable="false"
                    data-gjs-highlightable="false"
                    data-gjs-hoverable="false">
              <line x1="5" y1="12" x2="19" y2="12" 
                data-gjs-draggable="false"
                data-gjs-selectable="false"
                data-gjs-editable="false"
                data-gjs-highlightable="false"
                data-gjs-droppable="false"
                data-gjs-hoverable="false"/>
            </svg>
          </button>
        `
            : ""
        }
        <button class="action-button add-button-bottom" title="Add template below"
                data-gjs-draggable="false"
                data-gjs-selectable="false"
                data-gjs-droppable="false"
                data-gjs-editable="false"
                data-gjs-highlightable="false"
                data-gjs-hoverable="false">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                data-gjs-draggable="false"
                data-gjs-selectable="false"
                data-gjs-editable="false"
                data-gjs-editable="false"
                data-gjs-droppable="false"
                data-gjs-highlightable="false"
                data-gjs-hoverable="false">
            <line x1="12" y1="5" x2="12" y2="19" 
                data-gjs-draggable="false"
                data-gjs-selectable="false"
                data-gjs-editable="false"
                data-gjs-highlightable="false"
                data-gjs-droppable="false"
                data-gjs-hoverable="false"/>
            <line x1="5" y1="12" x2="19" y2="12" 
                data-gjs-draggable="false"
                data-gjs-selectable="false"
                data-gjs-editable="false"
                data-gjs-highlightable="false"
                data-gjs-droppable="false"
                data-gjs-hoverable="false"/>
          </svg>
        </button>
        <button class="action-button add-button-right" title="Add template right"
                data-gjs-draggable="false"
                data-gjs-selectable="false"
                data-gjs-editable="false"
                data-gjs-droppable="false"
                data-gjs-highlightable="false"
                data-gjs-hoverable="false">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                data-gjs-draggable="false"
                data-gjs-selectable="false"
                data-gjs-editable="false"
                data-gjs-editable="false"
                data-gjs-highlightable="false"
                data-gjs-droppable="false"
                data-gjs-hoverable="false">
            <line x1="12" y1="5" x2="12" y2="19" 
                data-gjs-draggable="false"
                data-gjs-selectable="false"
                data-gjs-editable="false"
                data-gjs-highlightable="false"
                data-gjs-droppable="false"
                data-gjs-hoverable="false"/>
            <line x1="5" y1="12" x2="19" y2="12" 
                data-gjs-draggable="false"
                data-gjs-selectable="false"
                data-gjs-editable="false"
                data-gjs-highlightable="false"
                data-gjs-droppable="false"
                data-gjs-hoverable="false"/>
          </svg>
        </button>
        <div class="resize-handle"
                data-gjs-draggable="false"
                data-gjs-selectable="false"
                data-gjs-editable="false"
                data-gjs-highlightable="false"
                data-gjs-droppable="false"
                data-gjs-hoverable="false">
        </div>
      </div>
    `;
}
