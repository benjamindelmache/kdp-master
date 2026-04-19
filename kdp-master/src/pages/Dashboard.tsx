import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Trash2, ExternalLink, Play, Eye, CheckCircle2, FileText } from 'lucide-react';
import { Book, BookStatus } from '../types';
import { getBooks, deleteBook } from '../store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

const STATUS_CONFIG: Record<BookStatus, { label: string; className: string }> = {
  'à_traiter':       { label: 'À traiter',      className: 'bg-yellow-100 text-yellow-800' },
  'generating':      { label: 'En cours',        className: 'bg-blue-100 text-blue-800' },
  'ready_for_review':{ label: 'En revue',        className: 'bg-purple-100 text-purple-800' },
  'approved':        { label: 'Approuvé',        className: 'bg-green-100 text-green-800' },
  'published':       { label: 'Publié',          className: 'bg-indigo-100 text-indigo-800' },
};

const MODEL_LABELS: Record<string, string> = {
  coloring_book:  'Coloriage',
  activity_book:  'Activités',
  character_book: 'Personnages',
  themed_book:    'Thématique',
};

export default function Dashboard({ onNewBook }: { onNewBook: () => void }) {
  const [books, setBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setBooks(getBooks());
  }, []);

  const filtered = books.filter(b =>
    b.titre.toLowerCase().includes(search.toLowerCase()) ||
    b.theme.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: 'Livres créés',   value: books.length,                                    icon: FileText,    color: 'bg-black' },
    { label: 'En génération',  value: books.filter(b => b.statut === 'generating').length, icon: Play,    color: 'bg-blue-500' },
    { label: 'En revue',       value: books.filter(b => b.statut === 'ready_for_review').length, icon: Eye, color: 'bg-purple-500' },
    { label: 'Terminés',       value: books.filter(b => b.statut === 'approved').length, icon: CheckCircle2, color: 'bg-green-500' },
  ];

  function handleDelete(e: React.MouseEvent, book_id: string) {
    e.stopPropagation();
    if (confirm('Supprimer ce livre ?')) {
      deleteBook(book_id);
      setBooks(getBooks());
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label} className="border-gray-200 shadow-sm">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{s.label}</p>
                  <h3 className="text-3xl font-bold mt-1">{s.value}</h3>
                </div>
                <div className={`p-2.5 rounded-xl ${s.color} text-white`}>
                  <s.icon size={18} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Books list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Mes projets KDP</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
              <Input
                className="pl-9 w-56 bg-white border-gray-200 h-9 text-sm"
                placeholder="Rechercher..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Button onClick={onNewBook} variant="outline" size="sm" className="gap-2 h-9">
              <Plus size={15} /> Nouveau
            </Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-gray-400" />
            </div>
            <h3 className="font-semibold text-gray-700 mb-1">Aucun livre pour le moment</h3>
            <p className="text-sm text-gray-400 mb-4">Créez votre premier cahier de coloriage !</p>
            <Button onClick={onNewBook} className="bg-black text-white hover:bg-gray-800 gap-2">
              <Plus size={16} /> Créer un livre
            </Button>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Titre</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Statut</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Modèle</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Pages</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Créé le</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((book) => {
                  const sc = STATUS_CONFIG[book.statut];
                  return (
                    <tr
                      key={book.book_id}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/book/${book.book_id}`)}
                    >
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-sm">{book.titre}</div>
                        <div className="text-xs text-gray-400 truncate max-w-xs">{book.sous_titre}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge className={`${sc.className} border-none text-xs font-medium`}>{sc.label}</Badge>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs font-mono text-gray-500">{MODEL_LABELS[book.book_model] || book.book_model}</span>
                      </td>
                      <td className="px-4 py-3.5 text-sm font-medium">{book.nb_pages}</td>
                      <td className="px-4 py-3.5 text-xs text-gray-400">
                        {new Date(book.created_at).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 hover:bg-black hover:text-white"
                            onClick={e => { e.stopPropagation(); navigate(`/book/${book.book_id}`); }}
                          >
                            <ExternalLink size={13} />
                          </Button>
                          <Button
                            variant="ghost" size="icon"
                            className="h-7 w-7 hover:bg-red-100 hover:text-red-600"
                            onClick={e => handleDelete(e, book.book_id)}
                          >
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
