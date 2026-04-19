import { Book, Settings } from '../types';

const BOOKS_KEY = 'kdp_books';
const SETTINGS_KEY = 'kdp_settings';

export const BOOK_MODELS: Record<string, { type: string; qty: number }[]> = {
  coloring_book: [
    { type: 'appartenance', qty: 1 }, { type: 'page_titre', qty: 1 }, { type: 'introduction', qty: 1 },
    { type: 'coloriage', qty: 24 }, { type: 'stickers', qty: 2 }, { type: 'certificat', qty: 1 }, { type: 'page_finale', qty: 1 },
  ],
  activity_book: [
    { type: 'appartenance', qty: 1 }, { type: 'page_titre', qty: 1 }, { type: 'introduction', qty: 1 },
    { type: 'instructions', qty: 1 }, { type: 'carte_globale', qty: 1 }, { type: 'ouverture_theme', qty: 4 },
    { type: 'coloriage', qty: 10 }, { type: 'labyrinthe', qty: 3 }, { type: 'cherche_et_trouve', qty: 2 },
    { type: 'relier', qty: 3 }, { type: 'mini_activite', qty: 4 }, { type: 'mini_priere', qty: 4 },
    { type: 'certificat', qty: 1 }, { type: 'page_finale', qty: 1 },
  ],
  character_book: [
    { type: 'appartenance', qty: 1 }, { type: 'page_titre', qty: 1 }, { type: 'introduction', qty: 1 },
    { type: 'fiche_personnage', qty: 12 }, { type: 'coloriage', qty: 12 },
    { type: 'mini_priere', qty: 3 }, { type: 'certificat', qty: 1 }, { type: 'page_finale', qty: 1 },
  ],
  themed_book: [
    { type: 'appartenance', qty: 1 }, { type: 'page_titre', qty: 1 }, { type: 'introduction', qty: 1 },
    { type: 'ouverture_theme', qty: 1 }, { type: 'coloriage', qty: 18 }, { type: 'mini_activite', qty: 4 },
    { type: 'mini_priere', qty: 3 }, { type: 'stickers', qty: 2 }, { type: 'certificat', qty: 1 }, { type: 'page_finale', qty: 1 },
  ],
};

export function getBooks(): Book[] {
  try {
    return JSON.parse(localStorage.getItem(BOOKS_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveBooks(books: Book[]): void {
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
}

export function addBook(book: Book): void {
  const books = getBooks();
  books.push(book);
  saveBooks(books);
}

export function updateBook(book_id: string, updates: Partial<Book>): void {
  const books = getBooks();
  const idx = books.findIndex(b => b.book_id === book_id);
  if (idx !== -1) {
    books[idx] = { ...books[idx], ...updates };
    saveBooks(books);
  }
}

export function deleteBook(book_id: string): void {
  saveBooks(getBooks().filter(b => b.book_id !== book_id));
}

export function getSettings(): Settings {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}');
  } catch {
    return { wf1_url: '', wf2_url: '', wf3_url: '', drive_folder_default: '', sheet_id: '' };
  }
}

export function saveSettings(s: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

export function generateBookId(): string {
  return 'BK' + Date.now().toString().slice(-6) + Math.random().toString(36).slice(2, 5).toUpperCase();
}
