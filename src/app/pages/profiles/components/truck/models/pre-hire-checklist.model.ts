export interface PreHireChecklistModel {
  categoryName: string;
  items: checkListItem[];
}

export interface checkListItem {
  id: number;
  name: string;
  status: string;
  category: string;
}
