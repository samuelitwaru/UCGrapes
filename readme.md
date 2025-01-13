# UCToolbox: A Genexus User Control Library

**UCToolbox** is a library designed for the **Comforta** project to customize the appearance of mobile applications. It offers components and functions for managing actions, mapping, media, and seamless communication with the Genexus framework. Built on top of **GrapesJS**, it enables dynamic interaction between the frontend and backend.

---

## Features

- **Customizable Components**: Manage actions, mapping, media, and more.
- **Integration with Genexus Framework**: Communicate efficiently with backend processes.
- **Dynamic Themes**: Includes tools for theme selection, tile styling, page creation, and media management.
- **Localization Support**: Offers localized content for better usability across different regions.

---

## Repository Structure

The repository consists of the following folders:

### 1. `js`
Contains JavaScript files for components and helper functions.  
**Files in this folder:**
- **`child-editor-manager.js`**  
  Manages GrapesJS editors for customising mobile app look and fill by creating and styling tyles.
- **`components.js`**  
  Defines the following classes:
  - `ActionListComponent`: Manages action lists that is; what the tile does.
  - `MappingComponent`: Handles mapping functionalities.
  - `MediaComponent`: Manages media operations that is adding a background image to a tile.
- **`data.js`**  
  Contains the `DataManager` class for AJAX functions to interact with the backend.
- **`toolbox.js`**  
  Implements the `ToolBoxManager` class, responsible for:
  - Theme selection
  - Tile styling
  - Page creation
  - Media management
  - Publishing and saving  
  Also includes a `Clock` class for adding dynamic time functionality to editors.
- **`toolbox-utils.js`**  
  Provides utility functions for mapping GrapesJS editor content into a readable format for the mobile app.

### 2. `css`
Holds CSS files to style components and customize the mobile application's appearance.

### 3. `img`
Contains images used for page templates.

### 4. `grapes`
Includes configuration files for GrapesJS.

### 5. `locale`
Stores localization strings and functions for regional content adaptation.

---

## Getting Started with GrapesJS

UCToolbox is built on **GrapesJS**, a versatile framework for building and managing web templates.  
Learn more about GrapesJS: [GrapesJS Documentation](https://grapesjs.com/docs).

---

## Usage

1. Clone the repository.
2. Include the required JavaScript and CSS files in your project in the Resources folder of your Genexus KB files.
3. Ensure that you have the UCToolbox user control in your Genexus project kb.
4. Update your localhost address in the data.js
5. Run your Genexus project and navigate to the Application Design page.

---

## Folder Overview

| **Folder**   | **Purpose**                                                                                 |
|--------------|---------------------------------------------------------------------------------------------|
| `js`         | Core JavaScript functionality, including components and helper functions.                  |
| `css`        | Styling for components and application customization.                                       |
| `img`        | Template images for the application.                                                       |
| `grapes`     | GrapesJS configuration files.                                                              |
| `locale`     | Localization files for regional adaptation.                                                 |

---

## Contributions
N.A for now!

