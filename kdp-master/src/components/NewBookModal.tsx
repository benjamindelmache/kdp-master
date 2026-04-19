import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { Book, BookModel, StructureItem } from '../types';
import { addBook, generateBookId, BOOK_MODELS, getSettings } from '../store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Props { onClose: () => void; }

const MODELS: { value: BookModel; label: string; desc: string }[] = [
  { value: 'coloring_book',   label: 'Cahier de coloriage',   desc: '31 pages · coloriage + stickers + certificat' },
  { value: 'activity_book',   label: 'Cahier d\'activités',   desc: '36 pages · labyrinthes, cherche & trouve, prières...' },
  { value: 'character_book',  label: 'Livre de personnages',  desc: '31 pages · fiches personnage + coloriages' },
  { value: 'themed_book',     label: 'Livre thématique',      desc: '31 pages · thème principal + activités + prières' },
];

const LANGUAGES = ['français', 'english', 'español', 'deutsch', 'italiano', 'português'];
const AGES = ['2-4 ans', '3-5 ans', '4-7 ans', '5-8 ans', '6-9 ans', '7-10 ans', '8-12 ans'];

export default function NewBookModal({ onClose }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  // Form state
  const [titre, setTitre] = useState('');
  const [sousTitre, setSousTitre] = useState('');
  const [model, setModel] = useState<BookModel>('coloring_book');
  const [langue, setLangue] = useState('français');
  const [age, setAge] = useState('4-7 ans');
  const [interieur, setInterieur] = useState<'oui' | 'non'>('oui');
  const [theme, setTheme] = useState('');
  const [style, setStyle] = useState('');
  const [perso, setPerso] = useState('');
  const [driveFolder, setDriveFolder] = useState('');
  const [structure, setStructure] = useState<StructureItem[]>([]);

  useEffect(() => {
    const s = getSettings();
    if (s.drive_folder_default) setDriveFolder(s.drive_folder_default);
  }, []);

  useEffect(() => {
    setStructure(BOOK_MODELS[model].map(item => ({ ...item })));
  }, [model]);

  const totalPages = structure.reduce((acc, s) => acc + s.qty, 0);

  function updateQty(index: number, val: number) {
    setStructure(prev => prev.map((s, i) => i === index ? { ...s, qty: Math.max(0, val) } : s));
  }

  function canNext() {
    if (step === 1) return titre.trim() !== '';
    if (step === 2) return theme.trim() !== '';
    return true;
  }

  function handleCreate() {
    const book: Book = {
      book_id: generateBookId(),
      book_model: model,
      titre: titre.trim(),
      sous_titre: sousTitre.trim(),
      age_cible: age,
      theme: theme.trim(),
      style_visuel: style.trim(),
      interieur_noir_blanc: interieur,
      personnages_recurrents: perso.trim(),
      nb_pages: totalPages,
      langue,
      statut: 'à_traiter',
      drive_folder: driveFolder.trim(),
      structure_custom: JSON.stringify(structure),
      created_at: new Date().toISOString(),
    };
    addBook(book);
    onClose();
    navigate(`/book/${book.book_id}`);
  }

  const steps = ['Général', 'Thème', 'Structure', 'Confirmer'];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="font-bold text-lg">Nouveau cahier</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center px-6 pt-5 pb-4 gap-2">
          {steps.map((s, i) => {
            const n = i + 1;
            const done = n < step;
            const active = n === step;
            return (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors ${done ? 'bg-green-500 text-white' : active ? 'bg-black text-white' : 'border border-gray-300 text-gray-400'}`}>
                  {done ? <Check size={12} /> : n}
                </div>
                <span className={`text-xs hidden sm:block ${active ? 'font-semibold text-black' : 'text-gray-400'}`}>{s}</span>
                {i < steps.length - 1 && <div className="flex-1 h-px bg-gray-200" />}
              </div>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 pb-4">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Titre du livre *</label>
                <Input placeholder="ex : La Carte au Trésor de la Bible" value={titre} onChange={e => setTitre(e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Sous-titre</label>
                <Input placeholder="ex : Cahier d'activités bibliques pour enfants" value={sousTitre} onChange={e => setSousTitre(e.target.value)} className="h-9" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Modèle de livre *</label>
                <div className="grid grid-cols-1 gap-2">
                  {MODELS.map(m => (
                    <button
                      key={m.value}
                      onClick={() => setModel(m.value)}
                      className={`text-left p-3 rounded-xl border transition-colors ${model === m.value ? 'border-black bg-gray-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="font-medium text-sm">{m.label}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Langue</label>
                  <select value={langue} onChange={e => setLangue(e.target.value)} className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm bg-white">
                    {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Âge cible</label>
                  <select value={age} onChange={e => setAge(e.target.value)} className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm bg-white">
                    {AGES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Intérieur</label>
                  <select value={interieur} onChange={e => setInterieur(e.target.value as 'oui' | 'non')} className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm bg-white">
                    <option value="oui">Noir & Blanc</option>
                    <option value="non">Couleur</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Thème principal *</label>
                <Input placeholder="ex : Histoires bibliques, Espace, Animaux de la forêt..." value={theme} onChange={e => setTheme(e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Style visuel</label>
                <Input placeholder="ex : Kawaii, cartoon, ligne claire, réaliste simplifié..." value={style} onChange={e => setStyle(e.target.value)} className="h-9" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Personnages récurrents</label>
                <Textarea
                  placeholder="ex : Une petite fille métisse avec des cheveux afro bouclés, un garçon explorateur avec un sac à dos, Noé et ses animaux..."
                  value={perso}
                  onChange={e => setPerso(e.target.value)}
                  className="min-h-[80px] text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Dossier Google Drive (optionnel)</label>
                <Input placeholder="ID du dossier Drive pour ce livre" value={driveFolder} onChange={e => setDriveFolder(e.target.value)} className="h-9 font-mono text-xs" />
                <p className="text-xs text-gray-400">Laissez vide pour utiliser la valeur par défaut des réglages</p>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="space-y-3">
              <p className="text-xs text-gray-400">Ajustez les quantités selon vos besoins</p>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="text-left text-xs font-semibold text-gray-500 px-4 py-2.5">Type de page</th>
                      <th className="text-right text-xs font-semibold text-gray-500 px-4 py-2.5">Quantité</th>
                    </tr>
                  </thead>
                  <tbody>
                    {structure.map((item, i) => (
                      <tr key={item.type} className="border-b border-gray-100 last:border-0">
                        <td className="px-4 py-2.5 text-gray-700 capitalize">{item.type.replace(/_/g, ' ')}</td>
                        <td className="px-4 py-2.5 text-right">
                          <input
                            type="number" min="0" max="50"
                            value={item.qty}
                            onChange={e => updateQty(i, parseInt(e.target.value) || 0)}
                            className="w-16 text-right border border-gray-200 rounded-lg px-2 py-1 text-sm"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-sm font-semibold text-center">
                Total : {totalPages} pages
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm border border-gray-200">
                {[
                  ['Titre', titre],
                  ['Sous-titre', sousTitre || '—'],
                  ['Modèle', MODELS.find(m => m.value === model)?.label || model],
                  ['Thème', theme],
                  ['Style', style || '—'],
                  ['Langue', langue],
                  ['Âge', age],
                  ['Pages', `${totalPages} pages`],
                  ['Drive', driveFolder || 'Dossier par défaut'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4">
                    <span className="text-gray-400 shrink-0">{label}</span>
                    <span className="font-medium text-right truncate">{value}</span>
                  </div>
                ))}
              </div>
              {perso && (
                <div className="text-sm">
                  <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">Personnages</span>
                  <p className="mt-1 text-gray-700">{perso}</p>
                </div>
              )}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
                Le livre sera créé avec le statut <strong>À traiter</strong>. Vous pourrez lancer la génération IA depuis la page du livre.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
          <Button variant="ghost" onClick={step === 1 ? onClose : () => setStep(s => s - 1)} className="gap-1">
            {step === 1 ? 'Annuler' : <><ChevronLeft size={15} /> Précédent</>}
          </Button>
          {step < totalSteps ? (
            <Button onClick={() => setStep(s => s + 1)} disabled={!canNext()} className="bg-black text-white hover:bg-gray-800 gap-1">
              Suivant <ChevronRight size={15} />
            </Button>
          ) : (
            <Button onClick={handleCreate} className="bg-green-600 text-white hover:bg-green-700 gap-1">
              <Check size={15} /> Créer le livre
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
