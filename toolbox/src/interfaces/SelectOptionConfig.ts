export interface SelectOptionConfig<DropdownOption> {
  labelField: keyof DropdownOption;
  valueField: keyof DropdownOption;
  placeholder?: string;
}
