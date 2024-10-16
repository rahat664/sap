export interface PreHireChecklistModel {
  categoryName: string;
  items: checkListItem[];
}

export interface checkListItem {
  checklistId: number;
  id: number;
  name: string;
  status: string;
  category: string;
}
