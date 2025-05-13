import { ActionPage } from "./ActionPage";

export interface Category {
    name: string;
    displayName: string;
    label: string;
    options: ActionPage[];
    canCreatePage: boolean;
  }