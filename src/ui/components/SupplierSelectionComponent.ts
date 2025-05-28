import { SelectOptionConfig } from "../../types";

export class SupplierSelectionComponent<DropdownOption> {
  private element: HTMLElement;
  private options: DropdownOption[];
  private selectedOption: DropdownOption | null = null;
  private onChangeCallback: ((option: DropdownOption) => void) | null = null;
  private config: SelectOptionConfig<DropdownOption>;
  private placeholder: string;

  constructor(options: DropdownOption[], config: SelectOptionConfig<DropdownOption>) {
    this.options = options;
    this.config = config;
    this.placeholder = config.placeholder || 'Select an option...';
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
    selectValue.textContent = this.placeholder;

    const selectArrow = document.createElement('span');
    selectArrow.className = 'select-arrow';

    const clearIcon = document.createElement('span');
    clearIcon.className = 'select-clear-icon';
    clearIcon.innerHTML = '&times;';
    clearIcon.style.display = 'none';
    clearIcon.style.cursor = 'pointer';
    clearIcon.style.marginLeft = '8px';

    clearIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close any open dropdowns
      document.querySelectorAll('.select-dropdown.show').forEach(drop => drop.classList.remove('show'));
      document.querySelectorAll('.select-field.active').forEach(field => field.classList.remove('active'));
      this.removeSelection();
      clearIcon.style.display = 'none';
    });


    selectField.appendChild(selectValue);
    selectField.appendChild(selectArrow);
    selectField.appendChild(clearIcon);

    const dropdown = document.createElement('div');
    dropdown.className = 'select-dropdown';

    const searchContainer = document.createElement('div');
    searchContainer.className = 'supplier-search-container';

    const searchIcon = document.createElement('div');
    searchIcon.className = 'search-icon';
    searchIcon.innerHTML = '<i class="fas fa-search"></i>&nbsp;&nbsp;';

    const searchInput = document.createElement('input');
    searchInput.className = 'search-input';
    searchInput.type = 'text';
    searchInput.placeholder = 'Search...';

    searchContainer.appendChild(searchIcon);
    searchContainer.appendChild(searchInput);

    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'options-container';

    this.options.forEach(option => {
      const optionEl = document.createElement('div');
      optionEl.className = 'select-option';
      const label = option[this.config.labelField] as unknown as string;
      const value = option[this.config.valueField] as unknown as string;
      optionEl.textContent = label;
      optionEl.dataset.value = value;

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

    // Event Listeners
    selectField.addEventListener('click', (e) => {
      e.stopPropagation();
      // Close all other dropdowns first
      const allSelectFields = document.querySelectorAll(".select-field.active");
      const allDropdowns = document.querySelectorAll(".select-dropdown.show");

      allSelectFields.forEach((field) => {
        if (field !== selectField) field.classList.remove("active");
      });

      allDropdowns.forEach((drop) => {
        if (drop !== dropdown) drop.classList.remove("show");
      });
      // Toggle current dropdown
      const isCurrentlyOpen = dropdown.classList.contains("show");
      selectField.classList.toggle("active", !isCurrentlyOpen);
      dropdown.classList.toggle("show", !isCurrentlyOpen);

      if (!isCurrentlyOpen) {
        searchInput.value = '';
        this.filterOptions('', optionsContainer);
        setTimeout(() => searchInput.focus(), 100);
      }
    });

    searchInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      this.filterOptions(target.value, optionsContainer);
    });

    searchInput.addEventListener('click', (e) => e.stopPropagation());

    document.addEventListener('click', () => {
      dropdown.classList.remove('show');
      selectField.classList.remove('active');
    });

    this.addStyles();
    container.appendChild(selectField);
    container.appendChild(dropdown);
    return container;
  }

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

    let noResults = optionsContainer.querySelector('.no-results');
    if (!hasResults) {
      if (!noResults) {
        noResults = document.createElement('div');
        noResults.className = 'no-results';
        noResults.textContent = 'No records found';
        optionsContainer.appendChild(noResults);
      }
    } else if (noResults) {
      optionsContainer.removeChild(noResults);
    }
  }

  private selectOption(option: DropdownOption): void {
    this.selectedOption = option;
    const label = option[this.config.labelField] as unknown as string;
    const value = option[this.config.valueField] as unknown as string;

    const selectValue = this.element.querySelector('.select-value') as HTMLElement;
    selectValue.textContent = label;

    const clearIcon = this.element.querySelector('.select-clear-icon') as HTMLElement;
    clearIcon.style.display = 'flex';

    const selectArrow = this.element.querySelector('.select-arrow') as HTMLElement;
    if (selectArrow) selectArrow.style.display = 'none';

    const options = this.element.querySelectorAll('.select-option');
    options.forEach(optionEl => {
      if (optionEl.getAttribute('data-value') === value) {
        optionEl.classList.add('selected');
      } else {
        optionEl.classList.remove('selected');
      }
    });

    if (this.onChangeCallback) {
      this.onChangeCallback(option);
    }
  }

  public removeSelection(): void {
    const valueField = document.querySelector("#field_value") as HTMLInputElement;
    if (valueField) {
      valueField.value = "";
      valueField.disabled = false;
    }
    this.selectedOption = null;
    const selectValue = this.element.querySelector('.select-value') as HTMLElement;
    selectValue.textContent = this.placeholder;
    const options = this.element.querySelectorAll('.select-option');
    options.forEach(optionEl => optionEl.classList.remove('selected'));
    const clearIcon = this.element.querySelector('.select-clear-icon') as HTMLElement;
    if (clearIcon) clearIcon.style.display = 'none';
    const selectArrow = this.element.querySelector('.select-arrow') as HTMLElement;
    if (selectArrow) selectArrow.style.display = 'inline';
    // custom event to notify that the supplier has been cleared
    const event = new CustomEvent('supplier-cleared', { bubbles: true });
    this.getElement().dispatchEvent(event);
  }

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
            padding: 6px 7px;
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

          .select-clear-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            width: 18px;
            height: 18px;
            border-radius: 50%;
            background: #fff;
            color: #ccc;
            border: 1px solid #ccc;
            box-shadow: 0 1px 2px rgba(0,0,0,0.04);
            margin-left: 8px;
            cursor: pointer;
            line-height: 1;
            padding: 0;
            transition: color 0.2s, border-color 0.2s, background 0.2s;
          }
          .select-clear-icon:hover {
            color: #4e4e4e;
            border-color: #4e4e4e;
            background: #fff;
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
          
          .supplier-search-container {
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

  public getElement(): HTMLElement {
    return this.element;
  }

  public getValue(): DropdownOption | null {
    return this.selectedOption;
  }

  public setValue(value: string | undefined): void {
    if (value === undefined) return;
    const match = this.options.find(opt => (opt[this.config.valueField] as unknown as string) === value);
    if (match) this.selectOption(match);
  }

  public onChange(callback: (option: DropdownOption) => void): void {
    this.onChangeCallback = callback;
  }
}
