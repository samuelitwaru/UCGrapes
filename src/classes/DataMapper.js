class DataMapper {
    styles = []
    pages = []
    extractedStyles = {}

    constructor(pageData){
        this.styles = pageData.styles
        this.rows = pageData.pages[0].frames[0].component.components[0].components[0].components
        this.extractStyles()
    }

    getTiles() {
        const outputData = {
          Rows: []
        }
        this.rows.forEach(row => {
          const rowTiles = []
          row.components.forEach(tile => {
            outputData.Rows.push(this.getTileData(tile))
          })
          outputData.Rows.push(rowTiles)
        })

    }

    getStyle(id, styleName) {
      if (id) {
        let val = this.extractedStyles[`#${id}`]?.[styleName]
        return val
      }
    }

    extractStyles() {
        // Loop through the array
        this.styles.forEach(item => {
          // Retrieve the first selector
          const selector = item.selectors[0];
          
          // Retrieve the styles from the 'style' property
          const style = item.style;
      
          // Extract the required style properties (if they exist)
          const backgroundImage = style['background-image'] || null;
          const backgroundColor = style['background-color'] || null;
          const color = style['color'] || null;
          const textAlign = style['text-align'] || null;
          const alignSelf = style['align-self'] || null;
      
          // Log or store the extracted values
          this.extractedStyles[selector] = {
            backgroundImage: backgroundImage,
            backgroundColor: backgroundColor,
            textAlign: textAlign,
            alignSelf: alignSelf,
            color: color
          };
        });
    }

    getTileData(tile) {
        let tileData = {}
        tileData.TileName = this.getTileText(tile)
        tileData.TileText = tileData.TileName
        tileData.TileTextColor = this.getTileTextColor(tile)
        tileData.TileTextAlignment = this.getTileTextAlignment(tile)
        tileData.TileIcon = this.getTileIcon(tile)
        tileData.TileIconColor = this.getTileIconColor(tile)
        tileData.TileIconAlignment = this.getTileIconAlignment(tile)
        tileData.TileBGImageUrl = this.getTileBGImage(tile)
        tileData.TileBGColor = this.getTileBGColor(tile)
        tile.TileBGImageOpacity = 100
        return tileData
    }

    getTileText(tile) {
      let tileTextSection = tile.components[0].components.find(comp => comp.classes.includes('tile-title-section'))
      if (tileTextSection) {
        let tileText = tileTextSection.components.find(comp=>comp.classes.includes('tile-title')).components[0].content
        return tileText
      }
      return ""
    }

    getTileTextColor(tile) {
        let id = tile.components?.find(comp => comp.classes.includes('template-block'))?.attributes?.id
        let val = this.getStyle(id, 'color')
        return val
    }

    getTileTextAlignment(tile) {
        let id = tile.components[0].components.find(comp => comp.classes.includes('tile-title-section'))?.attributes?.id
        return this.getStyle(id, 'textAlign') || 'left'
    }

    getTileIcon(tile) {
      let tileIconSection = tile.components[0].components.find(comp => comp.classes.includes('tile-icon-section'))
      if(tileIconSection) {
        let tileIcon = tileIconSection.components?.find(comp=>comp.classes.includes('tile-icon'))
        if (tileIcon) {
          let svg = tileIcon.components.find(comp=>comp.type == 'svg')
          if (svg) {
            let path = svg.components.find(comp=>comp.type == 'svg-in')
            if (path) {
              return path.attributes['data-name']
            }
          }
        }
      }
      return ""
    }

    getTileIconColor(tile) {
      let tileIconSection = tile.components[0].components.find(comp => comp.classes.includes('tile-icon-section'))
      if(tileIconSection) {
        let tileIcon = tileIconSection.components?.find(comp=>comp.classes.includes('tile-icon'))
        if (tileIcon) {
          let svg = tileIcon.components.find(comp=>comp.type == 'svg')
          if (svg) {
            let path = svg.components.find(comp=>comp.type == 'svg-in')
            if (path) {
              return path.attributes['fill']
            }
          }
        }
      }
      return ''
    }

    getTileIconAlignment(tile) {
      let id = tile.components[0].components.find(comp => comp.classes.includes('tile-icon-section'))?.attributes?.id
      let val = this.getStyle(id, 'alignSelf') || 'left'
      if (val == 'start') {
        return 'left'
      } else if (val == 'end') {
        return 'right'
      }
      return val
    }

    getTileBGImage(tile) {
      let id = tile.components.find(comp => comp.classes.includes('template-block'))?.attributes?.id
      let val = this.getStyle(id, 'backgroundImage') || ''
      if (val) {
        val = this.extractUrl(val)
      }
      return val
    }

    getTileBGColor (tile) {
      let id = tile.components.find(comp => comp.classes.includes('template-block'))?.attributes?.id
      let val = this.getStyle(id, 'backgroundColor')
      return val
    }

    extractUrl(inputString) {
      const regex = /url\((['"]?)(https?:\/\/[^\)]+)\1\)/;
      const match = inputString.match(regex);
      return match ? match[2] : null;
    }


}

const fs = require('fs');
const path = require('path');
const { title } = require('process')

// Read the JSON content from MenuPage.json
const menuPagePath = path.join(__dirname, '../../PredefinedPages/MenuPage.json');
const menuPageContent = fs.readFileSync(menuPagePath, 'utf8');
const pageData = JSON.parse(menuPageContent);

// pageData = {
//   "assets": [],
//   "styles": [
//     {
//       "selectors": ["#ilrn"],
//       "style": { "flex": "0 0 49%)", "background": "#173f5f", "width": "100%" }
//     },
//     {
//       "selectors": ["#ifm6f"],
//       "style": { "flex": "0 0 calc(50% - 0.3.5rem)", "background": "#173f5f" }
//     },
//     {
//       "selectors": ["#i4r6b"],
//       "style": { "flex": "0 0 49%)", "background": "#173f5f", "width": "100%" }
//     },
//     {
//       "selectors": ["#i2vb4n"],
//       "style": {
//         "flex": "0 0 calc(33.333333333333336% - 0.3.5rem)",
//         "background": "#173f5f"
//       }
//     },
//     {
//       "selectors": ["#it15ck"],
//       "style": {
//         "flex": "0 0 calc(33.333333333333336% - 0.3.5rem)",
//         "background": "#173f5f"
//       }
//     },
//     { "selectors": ["#i4vat"], "style": { "display": "flex" } },
//     {
//       "selectors": ["#iv5f"],
//       "style": {
//         "background-color": "#d99e80",
//         "background-image": "url(https://staging.comforta.yukon.software/media/receptie-197@3x.png)",
//         "background-size": "cover",
//         "background-position": "center",
//         "color": "#ffffff",
//         "background-blend-mode": "overlay"
//       }
//     },
//     {
//       "selectors": ["#iiryl"],
//       "style": {
//         "background-color": "#d99e80",
//         "color": "#ffffff",
//         "background-image": "url(https://staging.comforta.yukon.software/media/Calendar.png)",
//         "background-size": "cover",
//         "background-position": "center",
//         "background-blend-mode": "overlay"
//       }
//     },
//     {
//       "selectors": ["#i913l"],
//       "style": {
//         "background-color": "#d99e80",
//         "color": "#ffffff",
//         "background-image": "url(https://staging.comforta.yukon.software/media/LocationInfo.png)",
//         "background-size": "cover",
//         "background-position": "center",
//         "background-blend-mode": "overlay"
//       }
//     },
//     {
//       "selectors": ["#ibj3bv"],
//       "style": { "background-color": "#d99e80", "color": "#ffffff" }
//     },
//     {
//       "selectors": ["#i5xrqj"],
//       "style": { "background-color": "#7f3e3a", "color": "#ffffff" }
//     },
//     {
//       "selectors": ["#iz2mdk"],
//       "style": {
//         "background": "#173f5f",
//         "background-color": "#d99e80",
//         "color": "#ffffff"
//       }
//     },
//     {
//       "selectors": ["#iit8pl"],
//       "style": { "flex": "0 0 calc(50% - 0.3.5rem)" }
//     },
//     { "selectors": ["#ijqn5"], "style": { "display": "flex" } },
//     { "selectors": ["#iu6wdj"], "style": { "display": "flex" } },
//     { "selectors": ["#i3y9x"], "style": { "display": "flex" } },
//     {
//       "selectors": ["#igltzf"],
//       "style": {
//         "background": "#173f5f",
//         "color": "#ffffff",
//         "background-color": "#554940"
//       }
//     },
//     {
//       "selectors": ["#ikadpy"],
//       "style": { "flex": "0 0 calc(33.333333333333336% - 0.3.5rem)" }
//     },
//     { "selectors": ["#i9n6nx"], "style": { "display": "none" } },
//     { "selectors": ["#iy6tu1"], "style": { "display": "none" } },
//     { "selectors": ["#iq9j0u"], "style": { "display": "none" } }
//   ],
//   "pages": [
//     {
//       "frames": [
//         {
//           "component": {
//             "type": "wrapper",
//             "droppable": false,
//             "stylable": [
//               "background",
//               "background-color",
//               "background-image",
//               "background-repeat",
//               "background-attachment",
//               "background-position",
//               "background-size"
//             ],
//             "resizable": { "handles": "e" },
//             "selectable": false,
//             "hoverable": false,
//             "attributes": { "page-id": "Home", "theme": "Modern" },
//             "_undoexc": ["status", "open"],
//             "components": [
//               {
//                 "type": "template-wrapper",
//                 "draggable": false,
//                 "droppable": false,
//                 "highlightable": false,
//                 "selectable": false,
//                 "hoverable": false,
//                 "classes": ["frame-container"],
//                 "attributes": { "id": "frame-container" },
//                 "_undoexc": ["status", "open"],
//                 "components": [
//                   {
//                     "type": "template-wrapper",
//                     "draggable": false,
//                     "droppable": false,
//                     "highlightable": false,
//                     "selectable": false,
//                     "hoverable": false,
//                     "classes": ["container-column"],
//                     "_undoexc": ["status", "open"],
//                     "components": [
//                       {
//                         "type": "template-wrapper",
//                         "draggable": false,
//                         "droppable": "[data-gjs-type='tile-wrapper']",
//                         "selectable": false,
//                         "classes": ["container-row"],
//                         "_undoexc": ["status", "open"],
//                         "components": [
//                           {
//                             "type": "tile-wrapper",
//                             "droppable": false,
//                             "selectable": false,
//                             "classes": ["template-wrapper"],
//                             "attributes": { "id": "ilrn" },
//                             "_undoexc": ["status", "open"],
//                             "components": [
//                               {
//                                 "draggable": false,
//                                 "droppable": false,
//                                 "highlightable": false,
//                                 "hoverable": false,
//                                 "classes": ["template-block"],
//                                 "attributes": {
//                                   "tile-bgcolor": "#d99e80",
//                                   "tile-bgcolor-name": "cardBgColor",
//                                   "tile-text": "Tile",
//                                   "tile-text-color": "#ffffff",
//                                   "tile-text-align": "left",
//                                   "tile-icon": "Curtain",
//                                   "tile-icon-color": "#ffffff",
//                                   "tile-icon-align": "left",
//                                   "tile-bg-image": "",
//                                   "tile-bg-image-opacity": "100",
//                                   "tile-action-object": "Predefined Page, Reception",
//                                   "tile-action-object-id": "",
//                                   "id": "iv5f",
//                                   "tile-bg-image-url": "https://staging.comforta.yukon.software/media/1737609477356-Receptie.png"
//                                 },
//                                 "_undoexc": ["status", "open"],
//                                 "components": [
//                                   {
//                                     "draggable": false,
//                                     "droppable": false,
//                                     "highlightable": false,
//                                     "selectable": false,
//                                     "hoverable": false,
//                                     "classes": ["tile-icon-section"],
//                                     "_undoexc": ["status", "open"],
//                                     "components": [
//                                       {
//                                         "tagName": "span",
//                                         "type": "text",
//                                         "draggable": false,
//                                         "highlightable": false,
//                                         "editable": false,
//                                         "selectable": false,
//                                         "hoverable": false,
//                                         "classes": [
//                                           "tile-close-icon",
//                                           "top-right",
//                                           "selected-tile-icon"
//                                         ],
//                                         "_undoexc": ["status", "open"],
//                                         "components": [
//                                           {
//                                             "type": "textnode",
//                                             "content": "×",
//                                             "_undoexc": ["status", "open"]
//                                           }
//                                         ]
//                                       },
//                                       {
//                                         "tagName": "span",
//                                         "type": "text",
//                                         "draggable": false,
//                                         "highlightable": false,
//                                         "editable": false,
//                                         "selectable": false,
//                                         "hoverable": false,
//                                         "classes": ["tile-icon"],
//                                         "_undoexc": ["status", "open"],
//                                         "components": [
//                                           {
//                                             "type": "svg",
//                                             "resizable": { "ratioDefault": 1 },
//                                             "attributes": {
//                                               "xmlns": "http://www.w3.org/2000/svg",
//                                               "width": "31",
//                                               "height": "27.5",
//                                               "viewBox": "0 0 31 27.5"
//                                             },
//                                             "_undoexc": ["status", "open"],
//                                             "components": [
//                                               {
//                                                 "tagName": "g",
//                                                 "type": "svg-in",
//                                                 "resizable": {
//                                                   "ratioDefault": 1
//                                                 },
//                                                 "attributes": {
//                                                   "id": "Screenshot-2024-10-31-233134",
//                                                   "transform": "translate(-104.601 174)"
//                                                 },
//                                                 "_undoexc": ["status", "open"],
//                                                 "components": [
//                                                   {
//                                                     "tagName": "path",
//                                                     "type": "svg-in",
//                                                     "resizable": {
//                                                       "ratioDefault": 1
//                                                     },
//                                                     "attributes": {
//                                                       "id": "Path_1198",
//                                                       "data-name": "Path 1198",
//                                                       "d": "M104.8-173.447c-.43.781-.132,1.4.628,1.4.595,0,.628.456.694,12.757l.1,12.79h8.924l.1-1.627a16.583,16.583,0,0,0-1.421-7.16l-.76-1.725.826-.423c1.454-.749,4.032-3.84,5.156-6.151l1.091-2.246.958,2.148c.958,2.18,3.669,5.435,5.255,6.249l.826.456-.661,1.237a18.223,18.223,0,0,0-1.553,7.42l.1,1.822h8.924l.1-12.79c.066-12.3.1-12.757.694-12.757.76,0,1.058-.618.628-1.4-.264-.521-1.322-.553-15.3-.553S105.064-173.967,104.8-173.447Zm14.013,3.027c-.562,4.133-2.875,8.82-5.189,10.414-.992.716-1.058.716-.793.13.132-.325.463-1.53.727-2.669.4-1.595.43-2.115.1-2.506-.992-1.172-1.619-.456-2.28,2.506-.43,1.985-2.115,4.817-2.875,4.817-.4,0-.463-1.2-.463-6.932a57.327,57.327,0,0,1,.231-7.16,34.848,34.848,0,0,1,5.486-.228h5.288Zm13.286,5.6c.066,5.956,0,7.095-.4,7.095-.76,0-2.347-2.7-2.809-4.751-.231-1.074-.5-2.115-.562-2.343a1.038,1.038,0,0,0-1.653-.358c-.595.488-.4,2.571.4,4.491a2.741,2.741,0,0,1,.331,1.269,5.9,5.9,0,0,1-1.653-1.4c-2.347-2.343-4.495-7.388-4.495-10.447v-.781l5.387.065,5.354.1Zm-20.26,10.512a13.865,13.865,0,0,1,1.058,3.938l.2,2.115-2.446-.1-2.446-.1-.1-3.482-.1-3.482.925-.228a12.322,12.322,0,0,0,1.256-.293,2.272,2.272,0,0,1,.562-.13A6.268,6.268,0,0,1,111.839-154.311Zm19.434-1.334.925.228-.1,3.482-.1,3.482-2.38.1-2.413.1v-1.269a16.525,16.525,0,0,1,1.553-5.7c.3-.586.661-.846,1.025-.749C130.083-155.905,130.777-155.743,131.272-155.645Z",
//                                                       "transform": "translate(0)",
//                                                       "fill": "#ffffff"
//                                                     },
//                                                     "_undoexc": [
//                                                       "status",
//                                                       "open"
//                                                     ]
//                                                   }
//                                                 ]
//                                               }
//                                             ]
//                                           }
//                                         ]
//                                       }
//                                     ]
//                                   },
//                                   {
//                                     "draggable": false,
//                                     "droppable": false,
//                                     "highlightable": false,
//                                     "selectable": false,
//                                     "hoverable": false,
//                                     "classes": ["tile-title-section"],
//                                     "_undoexc": ["status", "open"],
//                                     "components": [
//                                       {
//                                         "tagName": "span",
//                                         "type": "text",
//                                         "draggable": false,
//                                         "highlightable": false,
//                                         "editable": false,
//                                         "selectable": false,
//                                         "hoverable": false,
//                                         "classes": [
//                                           "tile-close-icon",
//                                           "top-right",
//                                           "selected-tile-title"
//                                         ],
//                                         "_undoexc": ["status", "open"],
//                                         "components": [
//                                           {
//                                             "type": "textnode",
//                                             "content": "×",
//                                             "_undoexc": ["status", "open"]
//                                           }
//                                         ]
//                                       },
//                                       {
//                                         "tagName": "span",
//                                         "type": "text",
//                                         "draggable": false,
//                                         "highlightable": false,
//                                         "editable": false,
//                                         "selectable": false,
//                                         "hoverable": false,
//                                         "classes": ["tile-title", "tile-reception"],
//                                         "_undoexc": ["status", "open"],
//                                         "components": [
//                                           {
//                                             "attributes": {
//                                               "id": "reception-text"
//                                             },
//                                             "type": "textnode",
//                                             "content": "RECEPTION",
//                                             "_undoexc": ["status", "open"]
//                                           }
//                                         ]
//                                       }
//                                     ]
//                                   }
//                                 ]
//                               },
//                               {
//                                 "tagName": "button",
//                                 "draggable": false,
//                                 "droppable": false,
//                                 "highlightable": false,
//                                 "selectable": false,
//                                 "hoverable": false,
//                                 "classes": [
//                                   "action-button",
//                                   "add-button-bottom"
//                                 ],
//                                 "attributes": { "title": "Add template below" },
//                                 "_undoexc": ["status", "open"],
//                                 "components": [
//                                   {
//                                     "type": "svg",
//                                     "draggable": false,
//                                     "droppable": false,
//                                     "highlightable": false,
//                                     "resizable": { "ratioDefault": 1 },
//                                     "selectable": false,
//                                     "hoverable": false,
//                                     "attributes": {
//                                       "xmlns": "http://www.w3.org/2000/svg",
//                                       "width": "16",
//                                       "height": "16",
//                                       "viewBox": "0 0 24 24",
//                                       "fill": "none",
//                                       "stroke": "currentColor",
//                                       "stroke-width": "2",
//                                       "stroke-linecap": "round",
//                                       "stroke-linejoin": "round"
//                                     },
//                                     "_undoexc": ["status", "open"],
//                                     "components": [
//                                       {
//                                         "tagName": "line",
//                                         "type": "svg-in",
//                                         "draggable": false,
//                                         "droppable": false,
//                                         "highlightable": false,
//                                         "resizable": { "ratioDefault": 1 },
//                                         "attributes": {
//                                           "x1": "12",
//                                           "y1": "5",
//                                           "x2": "12",
//                                           "y2": "19"
//                                         },
//                                         "_undoexc": ["status", "open"]
//                                       },
//                                       {
//                                         "tagName": "line",
//                                         "type": "svg-in",
//                                         "draggable": false,
//                                         "droppable": false,
//                                         "highlightable": false,
//                                         "resizable": { "ratioDefault": 1 },
//                                         "attributes": {
//                                           "x1": "5",
//                                           "y1": "12",
//                                           "x2": "19",
//                                           "y2": "12"
//                                         },
//                                         "_undoexc": ["status", "open"]
//                                       }
//                                     ]
//                                   }
//                                 ]
//                               },
//                               {
//                                 "tagName": "button",
//                                 "draggable": false,
//                                 "droppable": false,
//                                 "highlightable": false,
//                                 "selectable": false,
//                                 "hoverable": false,
//                                 "classes": [
//                                   "action-button",
//                                   "add-button-right"
//                                 ],
//                                 "attributes": {
//                                   "title": "Add template right",
//                                   "id": "i4vat"
//                                 },
//                                 "_undoexc": ["status", "open"],
//                                 "components": [
//                                   {
//                                     "type": "svg",
//                                     "draggable": false,
//                                     "droppable": false,
//                                     "highlightable": false,
//                                     "resizable": { "ratioDefault": 1 },
//                                     "selectable": false,
//                                     "hoverable": false,
//                                     "attributes": {
//                                       "xmlns": "http://www.w3.org/2000/svg",
//                                       "width": "16",
//                                       "height": "16",
//                                       "viewBox": "0 0 24 24",
//                                       "fill": "none",
//                                       "stroke": "currentColor",
//                                       "stroke-width": "2",
//                                       "stroke-linecap": "round",
//                                       "stroke-linejoin": "round"
//                                     },
//                                     "_undoexc": ["status", "open"],
//                                     "components": [
//                                       {
//                                         "tagName": "line",
//                                         "type": "svg-in",
//                                         "draggable": false,
//                                         "droppable": false,
//                                         "highlightable": false,
//                                         "resizable": { "ratioDefault": 1 },
//                                         "attributes": {
//                                           "x1": "12",
//                                           "y1": "5",
//                                           "x2": "12",
//                                           "y2": "19"
//                                         },
//                                         "_undoexc": ["status", "open"]
//                                       },
//                                       {
//                                         "tagName": "line",
//                                         "type": "svg-in",
//                                         "draggable": false,
//                                         "droppable": false,
//                                         "highlightable": false,
//                                         "resizable": { "ratioDefault": 1 },
//                                         "attributes": {
//                                           "x1": "5",
//                                           "y1": "12",
//                                           "x2": "19",
//                                           "y2": "12"
//                                         },
//                                         "_undoexc": ["status", "open"]
//                                       }
//                                     ]
//                                   }
//                                 ]
//                               },
//                               {
//                                 "type": "text",
//                                 "draggable": false,
//                                 "highlightable": false,
//                                 "editable": false,
//                                 "selectable": false,
//                                 "hoverable": false,
//                                 "classes": ["resize-handle"],
//                                 "_undoexc": ["status", "open"],
//                                 "components": [
//                                   {
//                                     "type": "textnode",
//                                     "content": "\n                          ",
//                                     "_undoexc": ["status", "open"]
//                                   }
//                                 ]
//                               }
//                             ]
//                           }
//                         ]
//                       },
//                       {
//                         "type": "template-wrapper",
//                         "draggable": false,
//                         "droppable": "[data-gjs-type='tile-wrapper']",
//                         "selectable": false,
//                         "classes": ["container-row"],
//                         "_undoexc": ["status", "open"],
//                         "components": [
//                           {
//                             "type": "tile-wrapper",
//                             "droppable": false,
//                             "selectable": false,
//                             "classes": ["template-wrapper"],
//                             "attributes": { "id": "ifm6f" },
//                             "_undoexc": ["status", "open"],
//                             "components": [
//                               {
//                                 "draggable": false,
//                                 "droppable": false,
//                                 "highlightable": false,
//                                 "hoverable": false,
//                                 "classes": ["template-block"],
//                                 "attributes": {
//                                   "tile-bgcolor": "#d99e80",
//                                   "tile-bgcolor-name": "cardBgColor",
//                                   "tile-text": "Tile",
//                                   "tile-text-color": "#ffffff",
//                                   "tile-text-align": "left",
//                                   "tile-icon": "",
//                                   "tile-icon-color": "#000000",
//                                   "tile-icon-align": "left",
//                                   "tile-bg-image": "",
//                                   "tile-bg-image-opacity": "100",
//                                   "tile-action-object": "Predefined Page, Calendar",
//                                   "tile-action-object-id": "",
//                                   "id": "iiryl",
//                                   "tile-bg-image-url": "https://staging.comforta.yukon.software/media/1737609553150-Calendar.png"
//                                 },
//                                 "_undoexc": ["status", "open"],
//                                 "components": [
//                                   {
//                                     "draggable": false,
//                                     "droppable": false,
//                                     "highlightable": false,
//                                     "selectable": false,
//                                     "hoverable": false,
//                                     "classes": ["tile-title-section"],
//                                     "_undoexc": ["status", "open"],
//                                     "components": [
//                                       {
//                                         "tagName": "span",
//                                         "type": "text",
//                                         "draggable": false,
//                                         "highlightable": false,
//                                         "editable": false,
//                                         "selectable": false,
//                                         "hoverable": false,
//                                         "classes": [
//                                           "tile-close-icon",
//                                           "top-right",
//                                           "selected-tile-title"
//                                         ],
//                                         "_undoexc": ["status", "open"],
//                                         "components": [
//                                           {
//                                             "type": "textnode",
//                                             "content": "×",
//                                             "_undoexc": ["status", "open"]
//                                           }
//                                         ]
//                                       },
//                                       {
//                                         "tagName": "span",
//                                         "type": "text",
//                                         "draggable": false,
//                                         "highlightable": false,
//                                         "editable": false,
//                                         "selectable": false,
//                                         "hoverable": false,
//                                         "classes": ["tile-title", "tile-calendar"],
//                                         "_undoexc": ["status", "open"],
//                                         "components": [
//                                           {
//                                             "type": "textnode",
//                                             "content": "CALENDAR",
//                                             "_undoexc": ["status", "open"]
//                                           }
//                                         ]
//                                       }
//                                     ]
//                                   }
//                                 ]
//                               },
//                               {
//                                 "tagName": "button",
//                                 "draggable": false,
//                                 "droppable": false,
//                                 "highlightable": false,
//                                 "selectable": false,
//                                 "hoverable": false,
//                                 "classes": [
//                                   "action-button",
//                                   "add-button-bottom"
//                                 ],
//                                 "attributes": { "title": "Add template below" },
//                                 "_undoexc": ["status", "open"],
//                                 "components": [
//                                   {
//                                     "type": "svg",
//                                     "draggable": false,
//                                     "droppable": false,
//                                     "highlightable": false,
//                                     "resizable": { "ratioDefault": 1 },
//                                     "selectable": false,
//                                     "hoverable": false,
//                                     "attributes": {
//                                       "xmlns": "http://www.w3.org/2000/svg",
//                                       "width": "16",
//                                       "height": "16",
//                                       "viewBox": "0 0 24 24",
//                                       "fill": "none",
//                                       "stroke": "currentColor",
//                                       "stroke-width": "2",
//                                       "stroke-linecap": "round",
//                                       "stroke-linejoin": "round"
//                                     },
//                                     "_undoexc": ["status", "open"],
//                                     "components": [
//                                       {
//                                         "tagName": "line",
//                                         "type": "svg-in",
//                                         "draggable": false,
//                                         "droppable": false,
//                                         "highlightable": false,
//                                         "resizable": { "ratioDefault": 1 },
//                                         "attributes": {
//                                           "x1": "12",
//                                           "y1": "5",
//                                           "x2": "12",
//                                           "y2": "19"
//                                         },
//                                         "_undoexc": ["status", "open"]
//                                       },
//                                       {
//                                         "tagName": "line",
//                                         "type": "svg-in",
//                                         "draggable": false,
//                                         "droppable": false,
//                                         "highlightable": false,
//                                         "resizable": { "ratioDefault": 1 },
//                                         "attributes": {
//                                           "x1": "5",
//                                           "y1": "12",
//                                           "x2": "19",
//                                           "y2": "12"
//                                         },
//                                         "_undoexc": ["status", "open"]
//                                       }
//                                     ]
//                                   }
//                                 ]
//                               },
//                               {
//                                 "tagName": "button",
//                                 "draggable": false,
//                                 "droppable": false,
//                                 "highlightable": false,
//                                 "selectable": false,
//                                 "hoverable": false,
//                                 "classes": [
//                                   "action-button",
//                                   "add-button-right"
//                                 ],
//                                 "attributes": {
//                                   "title": "Add template right",
//                                   "id": "ijqn5"
//                                 },
//                                 "_undoexc": ["status", "open"],
//                                 "components": [
//                                   {
//                                     "type": "svg",
//                                     "draggable": false,
//                                     "droppable": false,
//                                     "highlightable": false,
//                                     "resizable": { "ratioDefault": 1 },
//                                     "selectable": false,
//                                     "hoverable": false,
//                                     "attributes": {
//                                       "xmlns": "http://www.w3.org/2000/svg",
//                                       "width": "16",
//                                       "height": "16",
//                                       "viewBox": "0 0 24 24",
//                                       "fill": "none",
//                                       "stroke": "currentColor",
//                                       "stroke-width": "2",
//                                       "stroke-linecap": "round",
//                                       "stroke-linejoin": "round"
//                                     },
//                                     "_undoexc": ["status", "open"],
//                                     "components": [
//                                       {
//                                         "tagName": "line",
//                                         "type": "svg-in",
//                                         "draggable": false,
//                                         "droppable": false,
//                                         "highlightable": false,
//                                         "resizable": { "ratioDefault": 1 },
//                                         "attributes": {
//                                           "x1": "12",
//                                           "y1": "5",
//                                           "x2": "12",
//                                           "y2": "19"
//                                         },
//                                         "_undoexc": ["status", "open"]
//                                       },
//                                       {
//                                         "tagName": "line",
//                                         "type": "svg-in",
//                                         "draggable": false,
//                                         "droppable": false,
//                                         "highlightable": false,
//                                         "resizable": { "ratioDefault": 1 },
//                                         "attributes": {
//                                           "x1": "5",
//                                           "y1": "12",
//                                           "x2": "19",
//                                           "y2": "12"
//                                         },
//                                         "_undoexc": ["status", "open"]
//                                       }
//                                     ]
//                                   }
//                                 ]
//                               },
//                               {
//                                 "type": "text",
//                                 "draggable": false,
//                                 "highlightable": false,
//                                 "editable": false,
//                                 "selectable": false,
//                                 "hoverable": false,
//                                 "classes": ["resize-handle"],
//                                 "_undoexc": ["status", "open"],
//                                 "components": [
//                                   {
//                                     "type": "textnode",
//                                     "content": "\n                          ",
//                                     "_undoexc": ["status", "open"]
//                                   }
//                                 ]
//                               }
//                             ]
//                           },
//                           {
//                             "type": "tile-wrapper",
//                             "droppable": false,
//                             "highlightable": false,
//                             "selectable": false,
//                             "hoverable": false,
//                             "classes": ["template-wrapper"],
//                             "attributes": { "id": "iit8pl" },
//                             "_undoexc": ["status", "open"],
//                             "components": [
//                               {
//                                 "draggable": false,
//                                 "droppable": false,
//                                 "highlightable": false,
//                                 "hoverable": false,
//                                 "classes": ["template-block"],
//                                 "attributes": {
//                                   "tile-bgcolor": "#d99e80",
//                                   "tile-bgcolor-name": "cardBgColor",
//                                   "tile-text": "Tile",
//                                   "tile-text-color": "#ffffff",
//                                   "tile-text-align": "left",
//                                   "tile-icon": "Monitor",
//                                   "tile-icon-color": "#ffffff",
//                                   "tile-icon-align": "left",
//                                   "tile-bg-image": "",
//                                   "tile-bg-image-opacity": "100",
//                                   "tile-action-object": "Predefined Page, Mailbox",
//                                   "tile-action-object-id": "",
//                                   "id": "iz2mdk"
//                                 },
//                                 "_undoexc": ["status", "open"],
//                                 "components": [
//                                   {
//                                     "draggable": false,
//                                     "droppable": false,
//                                     "highlightable": false,
//                                     "selectable": false,
//                                     "hoverable": false,
//                                     "classes": ["tile-icon-section"],
//                                     "_undoexc": ["status", "open"],
//                                     "components": [
//                                       {
//                                         "tagName": "span",
//                                         "type": "text",
//                                         "draggable": false,
//                                         "highlightable": false,
//                                         "editable": false,
//                                         "selectable": false,
//                                         "hoverable": false,
//                                         "classes": [
//                                           "tile-close-icon",
//                                           "top-right",
//                                           "selected-tile-icon"
//                                         ],
//                                         "_undoexc": ["status", "open"],
//                                         "components": [
//                                           {
//                                             "type": "textnode",
//                                             "content": "×",
//                                             "_undoexc": ["status", "open"]
//                                           }
//                                         ]
//                                       },
//                                       {
//                                         "tagName": "span",
//                                         "type": "text",
//                                         "draggable": false,
//                                         "highlightable": false,
//                                         "editable": false,
//                                         "selectable": false,
//                                         "hoverable": false,
//                                         "classes": ["tile-icon"],
//                                         "_undoexc": ["status", "open"],
//                                         "components": [
//                                           {
//                                             "type": "svg",
//                                             "resizable": { "ratioDefault": 1 },
//                                             "attributes": {
//                                               "xmlns": "http://www.w3.org/2000/svg",
//                                               "width": "31.987",
//                                               "height": "29.496",
//                                               "viewBox": "0 0 31.987 29.496"
//                                             },
//                                             "_undoexc": ["status", "open"],
//                                             "components": [
//                                               {
//                                                 "tagName": "path",
//                                                 "type": "svg-in",
//                                                 "resizable": {
//                                                   "ratioDefault": 1
//                                                 },
//                                                 "attributes": {
//                                                   "id": "Group_613-converted",
//                                                   "data-name": "Group 613-converted",
//                                                   "d": "M2.315.079A3.092,3.092,0,0,0,.348,1.606C-.025,2.312,0,1.66.012,11.9l.015,9.242.142.367a3.136,3.136,0,0,0,2.018,1.879c.277.094.628.1,6.546.115l6.254.015v4H12.372c-2.886,0-2.828-.006-3.13.338A1,1,0,0,0,9.56,29.38l.234.113H22.206l.234-.113a1,1,0,0,0,.318-1.522c-.3-.344-.244-.338-3.13-.338H17.013v-4l6.254-.015c5.918-.015,6.269-.021,6.546-.115a3.136,3.136,0,0,0,2.018-1.879l.142-.367.015-9.242c.012-8.15,0-9.282-.068-9.594A3.058,3.058,0,0,0,29.66.077c-.511-.109-26.846-.106-27.345,0M29.435,2.1a1.336,1.336,0,0,1,.512.577c.016.065.023,4.189.014,9.163l-.014,9.044-.154.2a1.18,1.18,0,0,1-.373.3c-.213.1-.642.1-13.42.1s-13.207,0-13.42-.1a1.18,1.18,0,0,1-.373-.3l-.154-.2-.014-9.044c-.009-4.974,0-9.1.013-9.16a1.261,1.261,0,0,1,.479-.558c.157-.1.6-.1,13.458-.1,11.507,0,13.316.01,13.446.077",
//                                                   "transform": "translate(-0.005 0.003)",
//                                                   "fill": "#ffffff",
//                                                   "fill-rule": "evenodd"
//                                                 },
//                                                 "_undoexc": ["status", "open"]
//                                               }
//                                             ]
//                                           }
//                                         ]
//                                       }
//                                     ]
//                                   },
//                                   {
//                                     "draggable": false,
//                                     "droppable": false,
//                                     "highlightable": false,
//                                     "selectable": false,
//                                     "hoverable": false,
//                                     "classes": ["tile-title-section"],
//                                     "_undoexc": ["status", "open"],
//                                     "components": [
//                                       {
//                                         "tagName": "span",
//                                         "type": "text",
//                                         "draggable": false,
//                                         "highlightable": false,
//                                         "editable": false,
//                                         "selectable": false,
//                                         "hoverable": false,
//                                         "classes": [
//                                           "tile-close-icon",
//                                           "top-right",
//                                           "selected-tile-title"
//                                         ],
//                                         "_undoexc": ["status", "open"],
//                                         "components": [
//                                           {
//                                             "type": "textnode",
//                                             "content": "×",
//                                             "_undoexc": ["status", "open"]
//                                           }
//                                         ]
//                                       },
//                                       {
//                                         "tagName": "span",
//                                         "type": "text",
//                                         "draggable": false,
//                                         "highlightable": false,
//                                         "editable": false,
//                                         "selectable": false,
//                                         "hoverable": false,
//                                         "classes": ["tile-title", "tile-mailbox"],
//                                         "_undoexc": ["status", "open"],
//                                         "components": [
//                                           {
//                                             "type": "textnode",
//                                             "content": "MAILBOX",
//                                             "_undoexc": ["status", "open"]
//                                           }
//                                         ]
//                                       }
//                                     ]
//                                   }
//                                 ]
//                               },
//                               {
//                                 "tagName": "button",
//                                 "draggable": false,
//                                 "droppable": false,
//                                 "highlightable": false,
//                                 "selectable": false,
//                                 "hoverable": false,
//                                 "classes": [
//                                   "action-button",
//                                   "add-button-bottom"
//                                 ],
//                                 "attributes": { "title": "Add template below" },
//                                 "_undoexc": ["status", "open"],
//                                 "components": [
//                                   {
//                                     "type": "svg",
//                                     "draggable": false,
//                                     "droppable": false,
//                                     "highlightable": false,
//                                     "resizable": { "ratioDefault": 1 },
//                                     "selectable": false,
//                                     "hoverable": false,
//                                     "attributes": {
//                                       "xmlns": "http://www.w3.org/2000/svg",
//                                       "width": "16",
//                                       "height": "16",
//                                       "viewBox": "0 0 24 24",
//                                       "fill": "none",
//                                       "stroke": "currentColor",
//                                       "stroke-width": "2",
//                                       "stroke-linecap": "round",
//                                       "stroke-linejoin": "round"
//                                     },
//                                     "_undoexc": ["status", "open"],
//                                     "components": [
//                                       {
//                                         "tagName": "line",
//                                         "type": "svg-in",
//                                         "draggable": false,
//                                         "droppable": false,
//                                         "highlightable": false,
//                                         "resizable": { "ratioDefault": 1 },
//                                         "attributes": {
//                                           "x1": "12",
//                                           "y1": "5",
//                                           "x2": "12",
//                                           "y2": "19"
//                                         },
//                                         "_undoexc": ["status", "open"]
//                                       },
//                                       {
//                                         "tagName": "line",
//                                         "type": "svg-in",
//                                         "draggable": false,
//                                         "droppable": false,
//                                         "highlightable": false,
//                                         "resizable": { "ratioDefault": 1 },
//                                         "attributes": {
//                                           "x1": "5",
//                                           "y1": "12",
//                                           "x2": "19",
//                                           "y2": "12"
//                                         },
//                                         "_undoexc": ["status", "open"]
//                                       }
//                                     ]
//                                   }
//                                 ]
//                               },
//                               {
//                                 "tagName": "button",
//                                 "draggable": false,
//                                 "droppable": false,
//                                 "highlightable": false,
//                                 "selectable": false,
//                                 "hoverable": false,
//                                 "classes": [
//                                   "action-button",
//                                   "add-button-right"
//                                 ],
//                                 "attributes": {
//                                   "title": "Add template right",
//                                   "id": "iu6wdj"
//                                 },
//                                 "_undoexc": ["status", "open"],
//                                 "components": [
//                                   {
//                                     "type": "svg",
//                                     "draggable": false,
//                                     "droppable": false,
//                                     "highlightable": false,
//                                     "resizable": { "ratioDefault": 1 },
//                                     "selectable": false,
//                                     "hoverable": false,
//                                     "attributes": {
//                                       "xmlns": "http://www.w3.org/2000/svg",
//                                       "width": "16",
//                                       "height": "16",
//                                       "viewBox": "0 0 24 24",
//                                       "fill": "none",
//                                       "stroke": "currentColor",
//                                       "stroke-width": "2",
//                                       "stroke-linecap": "round",
//                                       "stroke-linejoin": "round"
//                                     },
//                                     "_undoexc": ["status", "open"],
//                                     "components": [
//                                       {
//                                         "tagName": "line",
//                                         "type": "svg-in",
//                                         "draggable": false,
//                                         "droppable": false,
//                                         "highlightable": false,
//                                         "resizable": { "ratioDefault": 1 },
//                                         "attributes": {
//                                           "x1": "12",
//                                           "y1": "5",
//                                           "x2": "12",
//                                           "y2": "19"
//                                         },
//                                         "_undoexc": ["status", "open"]
//                                       },
//                                       {
//                                         "tagName": "line",
//                                         "type": "svg-in",
//                                         "draggable": false,
//                                         "droppable": false,
//                                         "highlightable": false,
//                                         "resizable": { "ratioDefault": 1 },
//                                         "attributes": {
//                                           "x1": "5",
//                                           "y1": "12",
//                                           "x2": "19",
//                                           "y2": "12"
//                                         },
//                                         "_undoexc": ["status", "open"]
//                                       }
//                                     ]
//                                   }
//                                 ]
//                               },
//                               {
//                                 "type": "text",
//                                 "draggable": false,
//                                 "highlightable": false,
//                                 "editable": false,
//                                 "selectable": false,
//                                 "hoverable": false,
//                                 "classes": ["resize-handle"],
//                                 "_undoexc": ["status", "open"],
//                                 "components": [
//                                   {
//                                     "type": "textnode",
//                                     "content": "\n              ",
//                                     "_undoexc": ["status", "open"]
//                                   }
//                                 ]
//                               }
//                             ]
//                           }
//                         ]
//                       },
//                       {
//                         "type": "template-wrapper",
//                         "draggable": false,
//                         "droppable": "[data-gjs-type='tile-wrapper']",
//                         "selectable": false,
//                         "classes": ["container-row"],
//                         "_undoexc": ["status", "open"],
//                         "components": [
//                           {
//                             "type": "tile-wrapper",
//                             "droppable": false,
//                             "selectable": false,
//                             "classes": ["template-wrapper"],
//                             "attributes": { "id": "i4r6b" },
//                             "_undoexc": ["status", "open"],
//                             "components": [
//                               {
//                                 "draggable": false,
//                                 "droppable": false,
//                                 "highlightable": false,
//                                 "hoverable": false,
//                                 "classes": ["template-block"],
//                                 "attributes": {
//                                   "tile-bgcolor": "#d99e80",
//                                   "tile-bgcolor-name": "cardBgColor",
//                                   "tile-text": "Tile",
//                                   "tile-text-color": "#ffffff",
//                                   "tile-text-align": "left",
//                                   "tile-icon": "",
//                                   "tile-icon-color": "#000000",
//                                   "tile-icon-align": "left",
//                                   "tile-bg-image": "",
//                                   "tile-bg-image-opacity": "100",
//                                   "tile-action-object": "Predefined Page, Location",
//                                   "tile-action-object-id": "",
//                                   "id": "i913l",
//                                   "tile-bg-image-url": "https://staging.comforta.yukon.software/media/1737609615966-LocationInfo.png"
//                                 },
//                                 "_undoexc": ["status", "open"],
//                                 "components": [
//                                   {
//                                     "draggable": false,
//                                     "droppable": false,
//                                     "highlightable": false,
//                                     "selectable": false,
//                                     "hoverable": false,
//                                     "classes": ["tile-icon-section"],
//                                     "_undoexc": ["status", "open"],
//                                     "components": [
//                                       {
//                                         "tagName": "span",
//                                         "type": "text",
//                                         "draggable": false,
//                                         "highlightable": false,
//                                         "editable": false,
//                                         "selectable": false,
//                                         "hoverable": false,
//                                         "classes": [
//                                           "tile-close-icon",
//                                           "top-right",
//                                           "selected-tile-icon"
//                                         ],
//                                         "_undoexc": ["status", "open"],
//                                         "components": [
//                                           {
//                                             "type": "textnode",
//                                             "content": "×",
//                                             "_undoexc": ["status", "open"]
//                                           }
//                                         ]
//                                       },
//                                       {
//                                         "tagName": "span",
//                                         "type": "text",
//                                         "draggable": false,
//                                         "highlightable": false,
//                                         "editable": false,
//                                         "selectable": false,
//                                         "hoverable": false,
//                                         "classes": ["tile-icon"],
//                                         "_undoexc": ["status", "open"],
//                                         "components": [
//                                           {
//                                             "type": "textnode",
//                                             "content": "\n                                ",
//                                             "_undoexc": ["status", "open"]
//                                           }
//                                         ]
//                                       }
//                                     ]
//                                   },
//                                   {
//                                     "draggable": false,
//                                     "droppable": false,
//                                     "highlightable": false,
//                                     "selectable": false,
//                                     "hoverable": false,
//                                     "classes": ["tile-title-section"],
//                                     "_undoexc": ["status", "open"],
//                                     "components": [
//                                       {
//                                         "tagName": "span",
//                                         "type": "text",
//                                         "draggable": false,
//                                         "highlightable": false,
//                                         "editable": false,
//                                         "selectable": false,
//                                         "hoverable": false,
//                                         "classes": [
//                                           "tile-close-icon",
//                                           "top-right",
//                                           "selected-tile-title"
//                                         ],
//                                         "_undoexc": ["status", "open"],
//                                         "components": [
//                                           {
//                                             "type": "textnode",
//                                             "content": "×",
//                                             "_undoexc": ["status", "open"]
//                                           }
//                                         ]
//                                       },
//                                       {
//                                         "tagName": "span",
//                                         "type": "text",
//                                         "draggable": false,
//                                         "highlightable": false,
//                                         "editable": false,
//                                         "selectable": false,
//                                         "hoverable": false,
//                                         "classes": ["tile-title", "tile-location"],
//                                         "_undoexc": ["status", "open"],
//                                         "components": [
//                                           {
//                                             "type": "textnode",
//                                             "content": "LOCATION",
//                                             "_undoexc": ["status", "open"]
//                                           }
//                                         ]
//                                       }
//                                     ]
//                                   }
//                                 ]
//                               },
//                               {
//                                 "tagName": "button",
//                                 "draggable": false,
//                                 "droppable": false,
//                                 "highlightable": false,
//                                 "selectable": false,
//                                 "hoverable": false,
//                                 "classes": [
//                                   "action-button",
//                                   "add-button-bottom"
//                                 ],
//                                 "attributes": { "title": "Add template below" },
//                                 "_undoexc": ["status", "open"],
//                                 "components": [
//                                   {
//                                     "type": "svg",
//                                     "draggable": false,
//                                     "droppable": false,
//                                     "highlightable": false,
//                                     "resizable": { "ratioDefault": 1 },
//                                     "selectable": false,
//                                     "hoverable": false,
//                                     "attributes": {
//                                       "xmlns": "http://www.w3.org/2000/svg",
//                                       "width": "16",
//                                       "height": "16",
//                                       "viewBox": "0 0 24 24",
//                                       "fill": "none",
//                                       "stroke": "currentColor",
//                                       "stroke-width": "2",
//                                       "stroke-linecap": "round",
//                                       "stroke-linejoin": "round"
//                                     },
//                                     "_undoexc": ["status", "open"],
//                                     "components": [
//                                       {
//                                         "tagName": "line",
//                                         "type": "svg-in",
//                                         "draggable": false,
//                                         "droppable": false,
//                                         "highlightable": false,
//                                         "resizable": { "ratioDefault": 1 },
//                                         "attributes": {
//                                           "x1": "12",
//                                           "y1": "5",
//                                           "x2": "12",
//                                           "y2": "19"
//                                         },
//                                         "_undoexc": ["status", "open"]
//                                       },
//                                       {
//                                         "tagName": "line",
//                                         "type": "svg-in",
//                                         "draggable": false,
//                                         "droppable": false,
//                                         "highlightable": false,
//                                         "resizable": { "ratioDefault": 1 },
//                                         "attributes": {
//                                           "x1": "5",
//                                           "y1": "12",
//                                           "x2": "19",
//                                           "y2": "12"
//                                         },
//                                         "_undoexc": ["status", "open"]
//                                       }
//                                     ]
//                                   }
//                                 ]
//                               },
//                               {
//                                 "tagName": "button",
//                                 "draggable": false,
//                                 "droppable": false,
//                                 "highlightable": false,
//                                 "selectable": false,
//                                 "hoverable": false,
//                                 "classes": [
//                                   "action-button",
//                                   "add-button-right"
//                                 ],
//                                 "attributes": {
//                                   "title": "Add template right",
//                                   "id": "i3y9x"
//                                 },
//                                 "_undoexc": ["status", "open"],
//                                 "components": [
//                                   {
//                                     "type": "svg",
//                                     "draggable": false,
//                                     "droppable": false,
//                                     "highlightable": false,
//                                     "resizable": { "ratioDefault": 1 },
//                                     "selectable": false,
//                                     "hoverable": false,
//                                     "attributes": {
//                                       "xmlns": "http://www.w3.org/2000/svg",
//                                       "width": "16",
//                                       "height": "16",
//                                       "viewBox": "0 0 24 24",
//                                       "fill": "none",
//                                       "stroke": "currentColor",
//                                       "stroke-width": "2",
//                                       "stroke-linecap": "round",
//                                       "stroke-linejoin": "round"
//                                     },
//                                     "_undoexc": ["status", "open"],
//                                     "components": [
//                                       {
//                                         "tagName": "line",
//                                         "type": "svg-in",
//                                         "draggable": false,
//                                         "droppable": false,
//                                         "highlightable": false,
//                                         "resizable": { "ratioDefault": 1 },
//                                         "attributes": {
//                                           "x1": "12",
//                                           "y1": "5",
//                                           "x2": "12",
//                                           "y2": "19"
//                                         },
//                                         "_undoexc": ["status", "open"]
//                                       },
//                                       {
//                                         "tagName": "line",
//                                         "type": "svg-in",
//                                         "draggable": false,
//                                         "droppable": false,
//                                         "highlightable": false,
//                                         "resizable": { "ratioDefault": 1 },
//                                         "attributes": {
//                                           "x1": "5",
//                                           "y1": "12",
//                                           "x2": "19",
//                                           "y2": "12"
//                                         },
//                                         "_undoexc": ["status", "open"]
//                                       }
//                                     ]
//                                   }
//                                 ]
//                               },
//                               {
//                                 "type": "text",
//                                 "draggable": false,
//                                 "highlightable": false,
//                                 "editable": false,
//                                 "selectable": false,
//                                 "hoverable": false,
//                                 "classes": ["resize-handle"],
//                                 "_undoexc": ["status", "open"],
//                                 "components": [
//                                   {
//                                     "type": "textnode",
//                                     "content": "\n                          ",
//                                     "_undoexc": ["status", "open"]
//                                   }
//                                 ]
//                               }
//                             ]
//                           }
//                         ]
//                       },
//                       {
//                         "type": "template-wrapper",
//                         "draggable": false,
//                         "droppable": "[data-gjs-type='tile-wrapper']",
//                         "selectable": false,
//                         "classes": ["container-row"],
//                         "_undoexc": ["status", "open"],
//                         "components": [
//                           {
//                             "type": "tile-wrapper",
//                             "droppable": false,
//                             "selectable": false,
//                             "classes": ["template-wrapper"],
//                             "attributes": { "id": "i2vb4n" },
//                             "_undoexc": ["status", "open"],
//                             "components": [
//                               {
//                                 "draggable": false,
//                                 "droppable": false,
//                                 "highlightable": false,
//                                 "hoverable": false,
//                                 "classes": ["template-block"],
//                                 "attributes": {
//                                   "tile-bgcolor": "#d99e80",
//                                   "tile-bgcolor-name": "cardBgColor",
//                                   "tile-text": "Tile",
//                                   "tile-text-color": "#ffffff",
//                                   "tile-text-align": "left",
//                                   "tile-icon": "",
//                                   "tile-icon-color": "#000000",
//                                   "tile-icon-align": "left",
//                                   "tile-bg-image": "",
//                                   "tile-bg-image-opacity": "100",
//                                   "tile-action-object": "Page",
//                                   "tile-action-object-id": "",
//                                   "id": "ibj3bv"
//                                 },
//                                 "_undoexc": ["status", "open"],
//                                 "components": [
//                                   {
//                                     "draggable": false,
//                                     "droppable": false,
//                                     "highlightable": false,
//                                     "selectable": false,
//                                     "hoverable": false,
//                                     "classes": ["tile-title-section"],
//                                     "_undoexc": ["status", "open"],
//                                     "components": [
//                                       {
//                                         "tagName": "span",
//                                         "type": "text",
//                                         "draggable": false,
//                                         "highlightable": false,
//                                         "editable": false,
//                                         "selectable": false,
//                                         "hoverable": false,
//                                         "classes": [
//                                           "tile-close-icon",
//                                           "top-right",
//                                           "selected-tile-title"
//                                         ],
//                                         "_undoexc": ["status", "open"],
//                                         "components": [
//                                           {
//                                             "type": "textnode",
//                                             "content": "×",
//                                             "_undoexc": ["status", "open"]
//                                           }
//                                         ]
//                                       },
//                                       {
//                                         "tagName": "span",
//                                         "type": "text",
//                                         "draggable": false,
//                                         "highlightable": false,
//                                         "editable": false,
//                                         "selectable": false,
//                                         "hoverable": false,
//                                         "classes": ["tile-title", "tile-my-care"],
//                                         "_undoexc": ["status", "open"],
//                                         "components": [
//                                           {
//                                             "type": "textnode",
//                                             "content": "MIJN ZORG",
//                                             "_undoexc": ["status", "open"]
//                                           }
//                                         ]
//                                       }
//                                     ]
//                                   }
//                                 ]
//                               },
//                               {
//                                 "tagName": "button",
//                                 "draggable": false,
//                                 "droppable": false,
//                                 "highlightable": false,
//                                 "selectable": false,
//                                 "hoverable": false,
//                                 "classes": [
//                                   "action-button",
//                                   "add-button-bottom"
//                                 ],
//                                 "attributes": { "title": "Add template below" },
//                                 "_undoexc": ["status", "open"],
//                                 "components": [
//                                   {
//                                     "type": "svg",
//                                     "draggable": false,
//                                     "droppable": false,
//                                     "highlightable": false,
//                                     "resizable": { "ratioDefault": 1 },
//                                     "selectable": false,
//                                     "hoverable": false,
//                                     "attributes": {
//                                       "xmlns": "http://www.w3.org/2000/svg",
//                                       "width": "16",
//                                       "height": "16",
//                                       "viewBox": "0 0 24 24",
//                                       "fill": "none",
//                                       "stroke": "currentColor",
//                                       "stroke-width": "2",
//                                       "stroke-linecap": "round",
//                                       "stroke-linejoin": "round"
//                                     },
//                                     "_undoexc": ["status", "open"],
//                                     "components": [
//                                       {
//                                         "tagName": "line",
//                                         "type": "svg-in",
//                                         "draggable": false,
//                                         "droppable": false,
//                                         "highlightable": false,
//                                         "resizable": { "ratioDefault": 1 },
//                                         "attributes": {
//                                           "x1": "12",
//                                           "y1": "5",
//                                           "x2": "12",
//                                           "y2": "19"
//                                         },
//                                         "_undoexc": ["status", "open"]
//                                       },
//                                       {
//                                         "tagName": "line",
//                                         "type": "svg-in",
//                                         "draggable": false,
//                                         "droppable": false,
//                                         "highlightable": false,
//                                         "resizable": { "ratioDefault": 1 },
//                                         "attributes": {
//                                           "x1": "5",
//                                           "y1": "12",
//                                           "x2": "19",
//                                           "y2": "12"
//                                         },
//                                         "_undoexc": ["status", "open"]
//                                       }
//                                     ]
//                                   }
//                                 ]
//                               },
//                               {
//                                 "tagName": "button",
//                                 "draggable": false,
//                                 "droppable": false,
//                                 "highlightable": false,
//                                 "selectable": false,
//                                 "hoverable": false,
//                                 "classes": [
//                                   "action-button",
//                                   "add-button-right"
//                                 ],
//                                 "attributes": {
//                                   "title": "Add template right",
//                                   "id": "i9n6nx"
//                                 },
//                                 "_undoexc": ["status", "open"],
//                                 "components": [
//                                   {
//                                     "type": "svg",
//                                     "draggable": false,
//                                     "droppable": false,
//                                     "highlightable": false,
//                                     "resizable": { "ratioDefault": 1 },
//                                     "selectable": false,
//                                     "hoverable": false,
//                                     "attributes": {
//                                       "xmlns": "http://www.w3.org/2000/svg",
//                                       "width": "16",
//                                       "height": "16",
//                                       "viewBox": "0 0 24 24",
//                                       "fill": "none",
//                                       "stroke": "currentColor",
//                                       "stroke-width": "2",
//                                       "stroke-linecap": "round",
//                                       "stroke-linejoin": "round"
//                                     },
//                                     "_undoexc": ["status", "open"],
//                                     "components": [
//                                       {
//                                         "tagName": "line",
//                                         "type": "svg-in",
//                                         "draggable": false,
//                                         "droppable": false,
//                                         "highlightable": false,
//                                         "resizable": { "ratioDefault": 1 },
//                                         "attributes": {
//                                           "x1": "12",
//                                           "y1": "5",
//                                           "x2": "12",
//                                           "y2": "19"
//                                         },
//                                         "_undoexc": ["status", "open"]
//                                       },
//                                       {
//                                         "tagName": "line",
//                                         "type": "svg-in",
//                                         "draggable": false,
//                                         "droppable": false,
//                                         "highlightable": false,
//                                         "resizable": { "ratioDefault": 1 },
//                                         "attributes": {
//                                           "x1": "5",
//                                           "y1": "12",
//                                           "x2": "19",
//                                           "y2": "12"
//                                         },
//                                         "_undoexc": ["status", "open"]
//                                       }
//                                     ]
//                                   }
//                                 ]
//                               },
//                               {
//                                 "type": "text",
//                                 "draggable": false,
//                                 "highlightable": false,
//                                 "editable": false,
//                                 "selectable": false,
//                                 "hoverable": false,
//                                 "classes": ["resize-handle"],
//                                 "_undoexc": ["status", "open"],
//                                 "components": [
//                                   {
//                                     "type": "textnode",
//                                     "content": "\n                          ",
//                                     "_undoexc": ["status", "open"]
//                                   }
//                                 ]
//                               }
//                             ]
//                           },
//                           {
//                             "type": "tile-wrapper",
//                             "droppable": false,
//                             "selectable": false,
//                             "classes": ["template-wrapper"],
//                             "attributes": { "id": "it15ck" },
//                             "_undoexc": ["status", "open"],
//                             "components": [
//                               {
//                                 "draggable": false,
//                                 "droppable": false,
//                                 "highlightable": false,
//                                 "hoverable": false,
//                                 "classes": ["template-block"],
//                                 "attributes": {
//                                   "tile-bgcolor": "#7f3e3a",
//                                   "tile-bgcolor-name": "backgroundColor",
//                                   "tile-text": "Tile",
//                                   "tile-text-color": "#ffffff",
//                                   "tile-text-align": "left",
//                                   "tile-icon": "",
//                                   "tile-icon-color": "#000000",
//                                   "tile-icon-align": "left",
//                                   "tile-bg-image": "",
//                                   "tile-bg-image-opacity": "100",
//                                   "tile-action-object": "Page",
//                                   "tile-action-object-id": "",
//                                   "id": "i5xrqj"
//                                 },
//                                 "_undoexc": ["status", "open"],
//                                 "components": [
//                                   {
//                                     "draggable": false,
//                                     "droppable": false,
//                                     "highlightable": false,
//                                     "selectable": false,
//                                     "hoverable": false,
//                                     "classes": ["tile-title-section"],
//                                     "_undoexc": ["status", "open"],
//                                     "components": [
//                                       {
//                                         "tagName": "span",
//                                         "type": "text",
//                                         "draggable": false,
//                                         "highlightable": false,
//                                         "editable": false,
//                                         "selectable": false,
//                                         "hoverable": false,
//                                         "classes": [
//                                           "tile-close-icon",
//                                           "top-right",
//                                           "selected-tile-title"
//                                         ],
//                                         "_undoexc": ["status", "open"],
//                                         "components": [
//                                           {
//                                             "type": "textnode",
//                                             "content": "×",
//                                             "_undoexc": ["status", "open"]
//                                           }
//                                         ]
//                                       },
//                                       {
//                                         "tagName": "span",
//                                         "type": "text",
//                                         "draggable": false,
//                                         "highlightable": false,
//                                         "editable": false,
//                                         "selectable": false,
//                                         "hoverable": false,
//                                         "classes": ["tile-title", "tile-my-living"],
//                                         "_undoexc": ["status", "open"],
//                                         "components": [
//                                           {
//                                             "type": "textnode",
//                                             "content": "MIJN WONEN",
//                                             "_undoexc": ["status", "open"]
//                                           }
//                                         ]
//                                       }
//                                     ]
//                                   }
//                                 ]
//                               },
//                               {
//                                 "tagName": "button",
//                                 "draggable": false,
//                                 "droppable": false,
//                                 "highlightable": false,
//                                 "selectable": false,
//                                 "hoverable": false,
//                                 "classes": [
//                                   "action-button",
//                                   "add-button-bottom"
//                                 ],
//                                 "attributes": { "title": "Add template below" },
//                                 "_undoexc": ["status", "open"],
//                                 "components": [
//                                   {
//                                     "type": "svg",
//                                     "draggable": false,
//                                     "droppable": false,
//                                     "highlightable": false,
//                                     "resizable": { "ratioDefault": 1 },
//                                     "selectable": false,
//                                     "hoverable": false,
//                                     "attributes": {
//                                       "xmlns": "http://www.w3.org/2000/svg",
//                                       "width": "16",
//                                       "height": "16",
//                                       "viewBox": "0 0 24 24",
//                                       "fill": "none",
//                                       "stroke": "currentColor",
//                                       "stroke-width": "2",
//                                       "stroke-linecap": "round",
//                                       "stroke-linejoin": "round"
//                                     },
//                                     "_undoexc": ["status", "open"],
//                                     "components": [
//                                       {
//                                         "tagName": "line",
//                                         "type": "svg-in",
//                                         "draggable": false,
//                                         "droppable": false,
//                                         "highlightable": false,
//                                         "resizable": { "ratioDefault": 1 },
//                                         "attributes": {
//                                           "x1": "12",
//                                           "y1": "5",
//                                           "x2": "12",
//                                           "y2": "19"
//                                         },
//                                         "_undoexc": ["status", "open"]
//                                       },
//                                       {
//                                         "tagName": "line",
//                                         "type": "svg-in",
//                                         "draggable": false,
//                                         "droppable": false,
//                                         "highlightable": false,
//                                         "resizable": { "ratioDefault": 1 },
//                                         "attributes": {
//                                           "x1": "5",
//                                           "y1": "12",
//                                           "x2": "19",
//                                           "y2": "12"
//                                         },
//                                         "_undoexc": ["status", "open"]
//                                       }
//                                     ]
//                                   }
//                                 ]
//                               },
//                               {
//                                 "tagName": "button",
//                                 "draggable": false,
//                                 "droppable": false,
//                                 "highlightable": false,
//                                 "selectable": false,
//                                 "hoverable": false,
//                                 "classes": [
//                                   "action-button",
//                                   "add-button-right"
//                                 ],
//                                 "attributes": {
//                                   "title": "Add template right",
//                                   "id": "iy6tu1"
//                                 },
//                                 "_undoexc": ["status", "open"],
//                                 "components": [
//                                   {
//                                     "type": "svg",
//                                     "draggable": false,
//                                     "droppable": false,
//                                     "highlightable": false,
//                                     "resizable": { "ratioDefault": 1 },
//                                     "selectable": false,
//                                     "hoverable": false,
//                                     "attributes": {
//                                       "xmlns": "http://www.w3.org/2000/svg",
//                                       "width": "16",
//                                       "height": "16",
//                                       "viewBox": "0 0 24 24",
//                                       "fill": "none",
//                                       "stroke": "currentColor",
//                                       "stroke-width": "2",
//                                       "stroke-linecap": "round",
//                                       "stroke-linejoin": "round"
//                                     },
//                                     "_undoexc": ["status", "open"],
//                                     "components": [
//                                       {
//                                         "tagName": "line",
//                                         "type": "svg-in",
//                                         "draggable": false,
//                                         "droppable": false,
//                                         "highlightable": false,
//                                         "resizable": { "ratioDefault": 1 },
//                                         "attributes": {
//                                           "x1": "12",
//                                           "y1": "5",
//                                           "x2": "12",
//                                           "y2": "19"
//                                         },
//                                         "_undoexc": ["status", "open"]
//                                       },
//                                       {
//                                         "tagName": "line",
//                                         "type": "svg-in",
//                                         "draggable": false,
//                                         "droppable": false,
//                                         "highlightable": false,
//                                         "resizable": { "ratioDefault": 1 },
//                                         "attributes": {
//                                           "x1": "5",
//                                           "y1": "12",
//                                           "x2": "19",
//                                           "y2": "12"
//                                         },
//                                         "_undoexc": ["status", "open"]
//                                       }
//                                     ]
//                                   }
//                                 ]
//                               },
//                               {
//                                 "type": "text",
//                                 "draggable": false,
//                                 "highlightable": false,
//                                 "editable": false,
//                                 "selectable": false,
//                                 "hoverable": false,
//                                 "classes": ["resize-handle"],
//                                 "_undoexc": ["status", "open"],
//                                 "components": [
//                                   {
//                                     "type": "textnode",
//                                     "content": "\n                          ",
//                                     "_undoexc": ["status", "open"]
//                                   }
//                                 ]
//                               }
//                             ]
//                           },
//                           {
//                             "type": "tile-wrapper",
//                             "droppable": false,
//                             "highlightable": false,
//                             "selectable": false,
//                             "hoverable": false,
//                             "classes": ["template-wrapper"],
//                             "attributes": { "id": "ikadpy" },
//                             "_undoexc": ["status", "open"],
//                             "components": [
//                               {
//                                 "draggable": false,
//                                 "droppable": false,
//                                 "highlightable": false,
//                                 "hoverable": false,
//                                 "classes": ["template-block"],
//                                 "attributes": {
//                                   "tile-bgcolor": "#554940",
//                                   "tile-bgcolor-name": "accentColor",
//                                   "tile-text": "Tile",
//                                   "tile-text-color": "#ffffff",
//                                   "tile-text-align": "left",
//                                   "tile-icon": "",
//                                   "tile-icon-color": "#000000",
//                                   "tile-icon-align": "left",
//                                   "tile-bg-image": "",
//                                   "tile-bg-image-opacity": "100",
//                                   "tile-action-object": "Page",
//                                   "tile-action-object-id": "",
//                                   "id": "igltzf"
//                                 },
//                                 "_undoexc": ["status", "open"],
//                                 "components": [
//                                   {
//                                     "draggable": false,
//                                     "droppable": false,
//                                     "highlightable": false,
//                                     "selectable": false,
//                                     "hoverable": false,
//                                     "classes": ["tile-title-section"],
//                                     "_undoexc": ["status", "open"],
//                                     "components": [
//                                       {
//                                         "tagName": "span",
//                                         "type": "text",
//                                         "draggable": false,
//                                         "highlightable": false,
//                                         "editable": false,
//                                         "selectable": false,
//                                         "hoverable": false,
//                                         "classes": [
//                                           "tile-close-icon",
//                                           "top-right",
//                                           "selected-tile-title"
//                                         ],
//                                         "_undoexc": ["status", "open"],
//                                         "components": [
//                                           {
//                                             "type": "textnode",
//                                             "content": "×",
//                                             "_undoexc": ["status", "open"]
//                                           }
//                                         ]
//                                       },
//                                       {
//                                         "tagName": "span",
//                                         "type": "text",
//                                         "draggable": false,
//                                         "highlightable": false,
//                                         "editable": false,
//                                         "selectable": false,
//                                         "hoverable": false,
//                                         "classes": ["tile-title", "tile-my-services"],
//                                         "_undoexc": ["status", "open"],
//                                         "components": [
//                                           {
//                                             "type": "textnode",
//                                             "content": "MIJN DIENSTEN",
//                                             "_undoexc": ["status", "open"]
//                                           }
//                                         ]
//                                       }
//                                     ]
//                                   }
//                                 ]
//                               },
//                               {
//                                 "tagName": "button",
//                                 "draggable": false,
//                                 "droppable": false,
//                                 "highlightable": false,
//                                 "selectable": false,
//                                 "hoverable": false,
//                                 "classes": [
//                                   "action-button",
//                                   "add-button-bottom"
//                                 ],
//                                 "attributes": { "title": "Add template below" },
//                                 "_undoexc": ["status", "open"],
//                                 "components": [
//                                   {
//                                     "type": "svg",
//                                     "draggable": false,
//                                     "droppable": false,
//                                     "highlightable": false,
//                                     "resizable": { "ratioDefault": 1 },
//                                     "selectable": false,
//                                     "hoverable": false,
//                                     "attributes": {
//                                       "xmlns": "http://www.w3.org/2000/svg",
//                                       "width": "16",
//                                       "height": "16",
//                                       "viewBox": "0 0 24 24",
//                                       "fill": "none",
//                                       "stroke": "currentColor",
//                                       "stroke-width": "2",
//                                       "stroke-linecap": "round",
//                                       "stroke-linejoin": "round"
//                                     },
//                                     "_undoexc": ["status", "open"],
//                                     "components": [
//                                       {
//                                         "tagName": "line",
//                                         "type": "svg-in",
//                                         "draggable": false,
//                                         "droppable": false,
//                                         "highlightable": false,
//                                         "resizable": { "ratioDefault": 1 },
//                                         "attributes": {
//                                           "x1": "12",
//                                           "y1": "5",
//                                           "x2": "12",
//                                           "y2": "19"
//                                         },
//                                         "_undoexc": ["status", "open"]
//                                       },
//                                       {
//                                         "tagName": "line",
//                                         "type": "svg-in",
//                                         "draggable": false,
//                                         "droppable": false,
//                                         "highlightable": false,
//                                         "resizable": { "ratioDefault": 1 },
//                                         "attributes": {
//                                           "x1": "5",
//                                           "y1": "12",
//                                           "x2": "19",
//                                           "y2": "12"
//                                         },
//                                         "_undoexc": ["status", "open"]
//                                       }
//                                     ]
//                                   }
//                                 ]
//                               },
//                               {
//                                 "tagName": "button",
//                                 "draggable": false,
//                                 "droppable": false,
//                                 "highlightable": false,
//                                 "selectable": false,
//                                 "hoverable": false,
//                                 "classes": [
//                                   "action-button",
//                                   "add-button-right"
//                                 ],
//                                 "attributes": {
//                                   "title": "Add template right",
//                                   "id": "iq9j0u"
//                                 },
//                                 "_undoexc": ["status", "open"],
//                                 "components": [
//                                   {
//                                     "type": "svg",
//                                     "draggable": false,
//                                     "droppable": false,
//                                     "highlightable": false,
//                                     "resizable": { "ratioDefault": 1 },
//                                     "selectable": false,
//                                     "hoverable": false,
//                                     "attributes": {
//                                       "xmlns": "http://www.w3.org/2000/svg",
//                                       "width": "16",
//                                       "height": "16",
//                                       "viewBox": "0 0 24 24",
//                                       "fill": "none",
//                                       "stroke": "currentColor",
//                                       "stroke-width": "2",
//                                       "stroke-linecap": "round",
//                                       "stroke-linejoin": "round"
//                                     },
//                                     "_undoexc": ["status", "open"],
//                                     "components": [
//                                       {
//                                         "tagName": "line",
//                                         "type": "svg-in",
//                                         "draggable": false,
//                                         "droppable": false,
//                                         "highlightable": false,
//                                         "resizable": { "ratioDefault": 1 },
//                                         "attributes": {
//                                           "x1": "12",
//                                           "y1": "5",
//                                           "x2": "12",
//                                           "y2": "19"
//                                         },
//                                         "_undoexc": ["status", "open"]
//                                       },
//                                       {
//                                         "tagName": "line",
//                                         "type": "svg-in",
//                                         "draggable": false,
//                                         "droppable": false,
//                                         "highlightable": false,
//                                         "resizable": { "ratioDefault": 1 },
//                                         "attributes": {
//                                           "x1": "5",
//                                           "y1": "12",
//                                           "x2": "19",
//                                           "y2": "12"
//                                         },
//                                         "_undoexc": ["status", "open"]
//                                       }
//                                     ]
//                                   }
//                                 ]
//                               },
//                               {
//                                 "type": "text",
//                                 "draggable": false,
//                                 "highlightable": false,
//                                 "editable": false,
//                                 "selectable": false,
//                                 "hoverable": false,
//                                 "classes": ["resize-handle"],
//                                 "_undoexc": ["status", "open"],
//                                 "components": [
//                                   {
//                                     "type": "textnode",
//                                     "content": "\n              ",
//                                     "_undoexc": ["status", "open"]
//                                   }
//                                 ]
//                               }
//                             ]
//                           }
//                         ]
//                       }
//                     ]
//                   }
//                 ]
//               }
//             ]
//           }
//         }
//       ],
//       "type": "main",
//       "id": "M1I3WJbl1jsJyHc2"
//     }
//   ]
// }


let dm = new DataMapper(pageData)

let tile = {
  "type": "tile-wrapper",
  "droppable": false,
  "selectable": false,
  "classes": ["template-wrapper"],
  "attributes": { "id": "ilrn" },
  "_undoexc": ["status", "open"],
  "components": [
    {
      "draggable": false,
      "droppable": false,
      "highlightable": false,
      "hoverable": false,
      "classes": ["template-block"],
      "attributes": {
        "tile-bgcolor": "#d99e80",
        "tile-bgcolor-name": "cardBgColor",
        "tile-text": "Tile",
        "tile-text-color": "#ffffff",
        "tile-text-align": "left",
        "tile-icon": "Curtain",
        "tile-icon-color": "#ffffff",
        "tile-icon-align": "left",
        "tile-bg-image": "",
        "tile-bg-image-opacity": "100",
        "tile-action-object": "Predefined Page, Reception",
        "tile-action-object-id": "",
        "id": "iv5f",
        "tile-bg-image-url": "https://staging.comforta.yukon.software/media/1737609477356-Receptie.png"
      },
      "_undoexc": ["status", "open"],
      "components": [
        {
          "draggable": false,
          "droppable": false,
          "highlightable": false,
          "selectable": false,
          "hoverable": false,
          "classes": ["tile-icon-section"],
          "_undoexc": ["status", "open"],
          "components": [
            {
              "tagName": "span",
              "type": "text",
              "draggable": false,
              "highlightable": false,
              "editable": false,
              "selectable": false,
              "hoverable": false,
              "classes": [
                "tile-close-icon",
                "top-right",
                "selected-tile-icon"
              ],
              "_undoexc": ["status", "open"],
              "components": [
                {
                  "type": "textnode",
                  "content": "×",
                  "_undoexc": ["status", "open"]
                }
              ]
            },
            {
              "tagName": "span",
              "type": "text",
              "draggable": false,
              "highlightable": false,
              "editable": false,
              "selectable": false,
              "hoverable": false,
              "classes": ["tile-icon"],
              "_undoexc": ["status", "open"],
              "components": [
                {
                  "type": "svg",
                  "resizable": { "ratioDefault": 1 },
                  "attributes": {
                    "xmlns": "http://www.w3.org/2000/svg",
                    "width": "31",
                    "height": "27.5",
                    "viewBox": "0 0 31 27.5"
                  },
                  "_undoexc": ["status", "open"],
                  "components": [
                    {
                      "tagName": "g",
                      "type": "svg-in",
                      "resizable": {
                        "ratioDefault": 1
                      },
                      "attributes": {
                        "id": "Screenshot-2024-10-31-233134",
                        "transform": "translate(-104.601 174)"
                      },
                      "_undoexc": ["status", "open"],
                      "components": [
                        {
                          "tagName": "path",
                          "type": "svg-in",
                          "resizable": {
                            "ratioDefault": 1
                          },
                          "attributes": {
                            "id": "Path_1198",
                            "data-name": "Path 1198",
                            "d": "M104.8-173.447c-.43.781-.132,1.4.628,1.4.595,0,.628.456.694,12.757l.1,12.79h8.924l.1-1.627a16.583,16.583,0,0,0-1.421-7.16l-.76-1.725.826-.423c1.454-.749,4.032-3.84,5.156-6.151l1.091-2.246.958,2.148c.958,2.18,3.669,5.435,5.255,6.249l.826.456-.661,1.237a18.223,18.223,0,0,0-1.553,7.42l.1,1.822h8.924l.1-12.79c.066-12.3.1-12.757.694-12.757.76,0,1.058-.618.628-1.4-.264-.521-1.322-.553-15.3-.553S105.064-173.967,104.8-173.447Zm14.013,3.027c-.562,4.133-2.875,8.82-5.189,10.414-.992.716-1.058.716-.793.13.132-.325.463-1.53.727-2.669.4-1.595.43-2.115.1-2.506-.992-1.172-1.619-.456-2.28,2.506-.43,1.985-2.115,4.817-2.875,4.817-.4,0-.463-1.2-.463-6.932a57.327,57.327,0,0,1,.231-7.16,34.848,34.848,0,0,1,5.486-.228h5.288Zm13.286,5.6c.066,5.956,0,7.095-.4,7.095-.76,0-2.347-2.7-2.809-4.751-.231-1.074-.5-2.115-.562-2.343a1.038,1.038,0,0,0-1.653-.358c-.595.488-.4,2.571.4,4.491a2.741,2.741,0,0,1,.331,1.269,5.9,5.9,0,0,1-1.653-1.4c-2.347-2.343-4.495-7.388-4.495-10.447v-.781l5.387.065,5.354.1Zm-20.26,10.512a13.865,13.865,0,0,1,1.058,3.938l.2,2.115-2.446-.1-2.446-.1-.1-3.482-.1-3.482.925-.228a12.322,12.322,0,0,0,1.256-.293,2.272,2.272,0,0,1,.562-.13A6.268,6.268,0,0,1,111.839-154.311Zm19.434-1.334.925.228-.1,3.482-.1,3.482-2.38.1-2.413.1v-1.269a16.525,16.525,0,0,1,1.553-5.7c.3-.586.661-.846,1.025-.749C130.083-155.905,130.777-155.743,131.272-155.645Z",
                            "transform": "translate(0)",
                            "fill": "#ffffff"
                          },
                          "_undoexc": [
                            "status",
                            "open"
                          ]
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          "draggable": false,
          "droppable": false,
          "highlightable": false,
          "selectable": false,
          "hoverable": false,
          "classes": ["tile-title-section"],
          "_undoexc": ["status", "open"],
          "components": [
            {
              "tagName": "span",
              "type": "text",
              "draggable": false,
              "highlightable": false,
              "editable": false,
              "selectable": false,
              "hoverable": false,
              "classes": [
                "tile-close-icon",
                "top-right",
                "selected-tile-title"
              ],
              "_undoexc": ["status", "open"],
              "components": [
                {
                  "type": "textnode",
                  "content": "×",
                  "_undoexc": ["status", "open"]
                }
              ]
            },
            {
              "tagName": "span",
              "type": "text",
              "draggable": false,
              "highlightable": false,
              "editable": false,
              "selectable": false,
              "hoverable": false,
              "classes": ["tile-title", "tile-reception"],
              "_undoexc": ["status", "open"],
              "components": [
                {
                  "attributes": {
                    "id": "reception-text"
                  },
                  "type": "textnode",
                  "content": "RECEPTION",
                  "_undoexc": ["status", "open"]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      "tagName": "button",
      "draggable": false,
      "droppable": false,
      "highlightable": false,
      "selectable": false,
      "hoverable": false,
      "classes": [
        "action-button",
        "add-button-bottom"
      ],
      "attributes": { "title": "Add template below" },
      "_undoexc": ["status", "open"],
      "components": [
        {
          "type": "svg",
          "draggable": false,
          "droppable": false,
          "highlightable": false,
          "resizable": { "ratioDefault": 1 },
          "selectable": false,
          "hoverable": false,
          "attributes": {
            "xmlns": "http://www.w3.org/2000/svg",
            "width": "16",
            "height": "16",
            "viewBox": "0 0 24 24",
            "fill": "none",
            "stroke": "currentColor",
            "stroke-width": "2",
            "stroke-linecap": "round",
            "stroke-linejoin": "round"
          },
          "_undoexc": ["status", "open"],
          "components": [
            {
              "tagName": "line",
              "type": "svg-in",
              "draggable": false,
              "droppable": false,
              "highlightable": false,
              "resizable": { "ratioDefault": 1 },
              "attributes": {
                "x1": "12",
                "y1": "5",
                "x2": "12",
                "y2": "19"
              },
              "_undoexc": ["status", "open"]
            },
            {
              "tagName": "line",
              "type": "svg-in",
              "draggable": false,
              "droppable": false,
              "highlightable": false,
              "resizable": { "ratioDefault": 1 },
              "attributes": {
                "x1": "5",
                "y1": "12",
                "x2": "19",
                "y2": "12"
              },
              "_undoexc": ["status", "open"]
            }
          ]
        }
      ]
    },
    {
      "tagName": "button",
      "draggable": false,
      "droppable": false,
      "highlightable": false,
      "selectable": false,
      "hoverable": false,
      "classes": [
        "action-button",
        "add-button-right"
      ],
      "attributes": {
        "title": "Add template right",
        "id": "i4vat"
      },
      "_undoexc": ["status", "open"],
      "components": [
        {
          "type": "svg",
          "draggable": false,
          "droppable": false,
          "highlightable": false,
          "resizable": { "ratioDefault": 1 },
          "selectable": false,
          "hoverable": false,
          "attributes": {
            "xmlns": "http://www.w3.org/2000/svg",
            "width": "16",
            "height": "16",
            "viewBox": "0 0 24 24",
            "fill": "none",
            "stroke": "currentColor",
            "stroke-width": "2",
            "stroke-linecap": "round",
            "stroke-linejoin": "round"
          },
          "_undoexc": ["status", "open"],
          "components": [
            {
              "tagName": "line",
              "type": "svg-in",
              "draggable": false,
              "droppable": false,
              "highlightable": false,
              "resizable": { "ratioDefault": 1 },
              "attributes": {
                "x1": "12",
                "y1": "5",
                "x2": "12",
                "y2": "19"
              },
              "_undoexc": ["status", "open"]
            },
            {
              "tagName": "line",
              "type": "svg-in",
              "draggable": false,
              "droppable": false,
              "highlightable": false,
              "resizable": { "ratioDefault": 1 },
              "attributes": {
                "x1": "5",
                "y1": "12",
                "x2": "19",
                "y2": "12"
              },
              "_undoexc": ["status", "open"]
            }
          ]
        }
      ]
    },
    {
      "type": "text",
      "draggable": false,
      "highlightable": false,
      "editable": false,
      "selectable": false,
      "hoverable": false,
      "classes": ["resize-handle"],
      "_undoexc": ["status", "open"],
      "components": [
        {
          "type": "textnode",
          "content": "\n                          ",
          "_undoexc": ["status", "open"]
        }
      ]
    }
  ]
}
