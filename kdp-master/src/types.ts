export type BookModel = 'coloring_book' | 'activity_book' | 'character_book' | 'themed_book';
export type BookStatus = 'à_traiter' | 'generating' | 'ready_for_review' | 'approved' | 'published';
export type PageApproved = 'pending' | 'yes' | 'no';
export type ImageStatus = 'todo' | 'generating' | 'done' | 'error';

export interface Book {
  book_id: string;
  book_model: BookModel;
  titre: string;
  sous_titre: string;
  age_cible: string;
  theme: string;
  style_visuel: string;
  interieur_noir_blanc: 'oui' | 'non';
  personnages_recurrents: string;
  nb_pages: number;
  langue: string;
  statut: BookStatus;
  drive_folder?: string;
  structure_custom?: string;
  created_at: string;
}

export interface Page {
  book_id: string;
  page_number: number;
  page_type: string;
  theme_name: string;
  title_text: string;
  description_page: string;
  texte_page: string;
  image_prompt: string;
  approved: PageApproved;
  image_status: ImageStatus;
  image_url: string;
}

export interface Settings {
  wf1_url: string;
  wf2_url: string;
  wf3_url: string;
  drive_folder_default: string;
  sheet_id: string;
}

export interface StructureItem {
  type: string;
  qty: number;
}
