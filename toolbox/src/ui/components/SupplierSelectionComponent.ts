// SimpleSelect.ts

import { SupplierList } from "../../interfaces/SupplierList";

  
  export class SupplierSelectionComponent {
    private element: HTMLElement;
    private options: SupplierList[];
    private selectedOption: SupplierList | null = null;
    private onChangeCallback: ((option: SupplierList) => void) | null = null;
  
    constructor(options: SupplierList[]) {
      this.options = options;
      this.element = this.createSelectElement();
      return this;
    }
  
    private createSelectElement(): HTMLElement {
      const container = document.createElement('div');
      container.className = 'simple-select-container';
  
      const selectField = document.createElement('div');
      selectField.className = 'select-field';
      
      const selectValue = document.createElement('span');
      selectValue.className = 'select-value';
      selectValue.textContent = 'Select supplier to connect...';
      
      const selectArrow = document.createElement('span');
      selectArrow.className = 'select-arrow';
      
      selectField.appendChild(selectValue);
      selectField.appendChild(selectArrow);
  
      const dropdown = document.createElement('div');
      dropdown.className = 'select-dropdown';
      
      const searchContainer = document.createElement('div');
      searchContainer.className = 'search-container';
      
      const searchIcon = document.createElement('div');
      searchIcon.className = 'search-icon';
      searchIcon.innerHTML = '<i class="fas fa-search"></i>';
      
      const searchInput = document.createElement('input');
      searchInput.className = 'search-input';
      searchInput.type = 'text';
      searchInput.placeholder = 'Search suppliers...';
      
      searchContainer.appendChild(searchIcon);
      searchContainer.appendChild(searchInput);
      
      // Create options container
      const optionsContainer = document.createElement('div');
      optionsContainer.className = 'options-container';

      const removeSelected = document.createElement('div');
      removeSelected.className = 'select-option';
      removeSelected.textContent = 'Remove selected supplier';
      removeSelected.dataset.value = 'remove';

      removeSelected.addEventListener('click', (e) => {
        e.stopPropagation();
        this.removeSelection();
        dropdown.classList.remove('show');
        selectField.classList.remove('active');
      });

      optionsContainer.appendChild(removeSelected);
      
      this.options.forEach(option => {
        const optionEl = document.createElement('div');
        optionEl.className = 'select-option';
        optionEl.textContent = option.SupplierGenCompanyName;
        optionEl.dataset.value = option.SupplierGenCompanyName;
        
        optionEl.addEventListener('click', (e) => {
          e.stopPropagation();
          this.selectOption(option);
          dropdown.classList.remove('show');
          selectField.classList.remove('active');
        });
        
        optionsContainer.appendChild(optionEl);
      });
      
      dropdown.appendChild(searchContainer);
      dropdown.appendChild(optionsContainer);
  
      // Add event listeners
      selectField.addEventListener('click', (e) => {
        e.stopPropagation();
        selectField.classList.toggle('active');
        dropdown.classList.toggle('show');
        
        if (dropdown.classList.contains('show')) {
          searchInput.value = '';
          this.filterOptions('', optionsContainer);
          setTimeout(() => searchInput.focus(), 100);
        }
      });
      
      searchInput.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        this.filterOptions(target.value, optionsContainer);
      });
      
      searchInput.addEventListener('click', (e) => {
        e.stopPropagation();
      });
      
      document.addEventListener('click', () => {
        dropdown.classList.remove('show');
        selectField.classList.remove('active');
      });
  
      // Add styles
      this.addStyles();
  
      // Assemble the component
      container.appendChild(selectField);
      container.appendChild(dropdown);
      
      return container;
    }
  
    // Filter options based on search term
    private filterOptions(searchTerm: string, optionsContainer: HTMLElement): void {
      const options = optionsContainer.querySelectorAll('.select-option');
      let hasResults = false;
      
      options.forEach(option => {
        const optionEl = option as HTMLElement;
        const text = optionEl.textContent?.toLowerCase() || '';
        
        if (text.includes(searchTerm.toLowerCase())) {
          optionEl.style.display = 'block';
          hasResults = true;
        } else {
          optionEl.style.display = 'none';
        }
      });
      
      // Show or hide "no results" message
      let noResults = optionsContainer.querySelector('.no-results');
      
      if (!hasResults) {
        if (!noResults) {
          noResults = document.createElement('div');
          noResults.className = 'no-results';
          noResults.textContent = 'No suppliers found';
          optionsContainer.appendChild(noResults);
        }
      } else if (noResults) {
        optionsContainer.removeChild(noResults);
      }
    }
  
    // Select an option
    private selectOption(option: SupplierList): void {
      this.selectedOption = option;
      
      const selectValue = this.element.querySelector('.select-value') as HTMLElement;
      selectValue.textContent = option.SupplierGenCompanyName;
      
      // Highlight selected option
      const options = this.element.querySelectorAll('.select-option');
      options.forEach(optionEl => {
        if (optionEl.getAttribute('data-value') === option.SupplierGenCompanyName) {
          optionEl.classList.add('selected');
        } else {
          optionEl.classList.remove('selected');
        }
      });
      
      // Call onChange callback if set
      if (this.onChangeCallback) {
        this.onChangeCallback(option);
      }
    }

    private removeSelection(): void {
        const popup = document.querySelector(".popup-modal-link") as HTMLDivElement;
        const valueField = popup?.querySelector("#field_value") as HTMLInputElement;
        if (valueField) {
            valueField.value = "";
            valueField.disabled = false;
            this.selectedOption = null;
            const selectValue = this.element.querySelector('.select-value') as HTMLElement;
            selectValue.textContent = "Select supplier to connect..."; 
            const options = this.element.querySelectorAll('.select-option');
            options.forEach(optionEl => {
                optionEl.classList.remove('selected');
            });
        }
    }
  
    // Add styles to the document
    private addStyles(): void {
      if (!document.getElementById('simple-select-styles')) {
        const style = document.createElement('style');
        style.id = 'simple-select-styles';
        style.innerHTML = `
          .simple-select-container {
            position: relative;
            width: 100%;
            font-family: Arial, sans-serif;
          }
          
          .select-field {
            padding: 6px 16px;
            background: white;
            border: 1px solid #b4b9bd;
            border-radius: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            align-items: center;
            cursor: pointer;
            user-select: none;
          }
          
          .select-field:hover {
            border-color: #bbb;
          }
          
          .select-field.active {
            border-color: #b4b9bd;
          }
          
          .select-arrow {
            border-right: 2px solid #b4b9bd;
            border-bottom: 2px solid #b4b9bd;
            width: 8px;
            height: 8px;
            transform: rotate(45deg);
            transition: transform 0.2s;
          }
          
          .select-field.active .select-arrow {
            transform: rotate(-135deg);
          }
          
          .select-dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: white;
            border: 1px solid #e2e2e2;
            border-radius: 6px;
            margin-top: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
            z-index: 100;
            display: none;
          }
          
          .select-dropdown.show {
            display: block;
          }
          
          .search-container {
            padding: 10px;
            position: relative;
          }
          
          .search-icon {
            position: absolute;
            left: 20px;
            top: 50%;
            transform: translateY(-50%);
            color: #888;
          }
          
          .search-input {
            width: 100% !important;
            padding: 6px 6px 6px 40px !important;
            border: 1px solid #ddd;
            border-radius: 6px;
            font-size: 14px;
            outline: none;
          }
          
          .options-container {
            max-height: 200px;
            max-height: 170px;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: #ccc transparent;
          }
          
          .select-option {
            padding: 10px 15px;
            cursor: pointer;
          }
          
          .select-option:hover {
            background-color: #f5f5f5;
          }
          
          .select-option.selected {
            background-color: #e9ecef;
            color: #333333;
          }
          
          .no-results {
            padding: 10px 15px;
            color: #666;
            font-style: italic;
            text-align: center;
          }
        `;
        document.head.appendChild(style);
      }
    }
  
    // Public method to get the element
    public getElement(): HTMLElement {
      return this.element;
    }
  
    // Public method to get the selected value
    public getValue(): SupplierList | null {
      return this.selectedOption;
    }
  
    // Public method to set a value
    public setValue(value: string | undefined): void {
      if (value === undefined) {
          return;
      }
      const option = this.options.find(opt => opt.SupplierGenId === value);
      if (option) {
        this.selectOption(option);
      }
    }
  
    // Public method to set an onChange callback
    public onChange(callback: (option: SupplierList) => void): void {
      this.onChangeCallback = callback;
    }
  }
  