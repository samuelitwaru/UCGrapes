export interface MenuItem {
    id: string;
    label: string;
    name?: string;
    action: (categoryItems?: any[]) => void;
    expandable?: boolean;
}