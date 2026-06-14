import type { GrammarCategory, GrammarPoint } from "../../types";

export interface CategoryNode {
  id: number;
  category: GrammarCategory;
  children: CategoryNode[];
  points: GrammarPoint[];
}
