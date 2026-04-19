import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Layers, Users, Palette, FileCheck, Sparkles,
  CheckCircle2, AlertCircle, ExternalLink, Loader2,
} from 'lucide-react';
import { Book } from '../types';
import { getBooks, updateBook, getSettings } from '../store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const MODEL_LABELS: Record<string, string> = {
  coloring_book: 'Cahier de coloriage', activity_book: 'Cahier d\'activités',
  character_book: 'Livre de personnages', themed_book: 'Livre thématique',
};

type LogLine = { text: string; type: 'info' | 'success' | 'error' };

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<LogLine[]>([]);

  useEffect(() => {
    const found = getBooks().find(b => b.book_id === id);
    setBook(found || null);
  }, [id]);

  if (!book) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-gray-400">Livre non trouvé</p>
    </div>
  );

  function addLog(text: string, type: LogLine['type'] = 'info') {
    setLogs(prev => [...prev, { text: `[${new Date().toLocaleTimeString()}] ${text}`, type }]);
  }

  async function callWorkflow(url: string, body: object): Promise<boolean> {
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return r.ok;
    } catch {
      return false;
    }
  }

  async function handleGenerate() {
    const settings = getSettings();
    if (!settings.wf1_url) {
      alert('URL du workflow 1 non configurée — allez dans Réglages n8n');
      navigate('/settings');
      return;
    }

    setGenerating(true);
    setLogs([]);
    setProgress(5);
    updateBook(book.book_id, { statut: 'generating' });
    setBook(prev => prev ? { ...prev, statut: 'generating' } : prev);

    // ÉTAPE 1 — Génération du contenu
    addLog('Démarrage — génération du contenu des pages...');
    setProgress(15);
    const ok1 = await callWorkflow(settings.wf1_url, { ...book, statut: 'à_traiter' });
    if (!ok1) {
      addLog('Erreur workflow 1 — vérifiez l\'URL et que le workflow est actif dans n8n', 'error');
      setGenerating(false);
      updateBook(book.book_id, { statut: 'à_traiter' });
      return;
    }
    addLog('Workflow 1 terminé — pages générées dans Google Sheets', 'success');
    setProgress(40);

    // ÉTAPE 2 — Prompts image
    if (settings.wf2_url) {
      addLog('Génération des prompts image...');
      const ok2 = await callWorkflow(settings.wf2_url, { book_id: book.book_id });
      if (ok2) addLog('Workflow 2 terminé — prompts image écrits', 'success');
      else addLog('Workflow 2 — erreur (non bloquant)', 'error');
    } else {
      addLog('Workflow 2 non configuré — prompts image ignorés');
    }
    setProgress(70);

    // ÉTAPE 3 — Images
    if (settings.wf3_url) {
      addLog('Génération des images en cours...');
      const ok3 = await callWorkflow(settings.wf3_url, { book_id: book.book_id });
      if (ok3) addLog('Workflow 3 terminé — images uploadées sur Google Drive', 'success');
      else addLog('Workflow 3 — erreur', 'error');
    } else {
      addLog('Workflow 3 non configuré — génération images ignorée');
    }

    setProgress(100);
    addLog('Génération terminée ! Votre cahier est prêt pour révision.', 'success');
    updateBook(book.book_id, { statut: 'ready_for_review' });
    setBook(prev => prev ? { ...prev, statut: 'ready_for_review' } : prev);
    setGenerating(false);
  }

  const driveUrl = book.drive_folder
    ? `https://drive.google.com/drive/folders/${book.drive_folder}`
    : null;

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{book.titre}</h1>
              <Badge className="bg-purple-100 text-purple-800 border-none text-xs">{book.statut.replace(/_/g, ' ')}</Badge>
            </div>
            <p className="text-sm text-gray-400">{book.sous_titre}</p>
          </div>
        </div>
        {driveUrl && (
          <Button variant="outline" size="sm" className="gap-2" onClick={() => window.open(driveUrl, '_blank')}>
            <ExternalLink size={14} /> Voir sur Drive
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche — lancement */}
        <div className="space-y-4">
          <Card className="border-gray-200 shadow-sm">
            <CardContent className="pt-6 space-y-4">
              {/* Couverture simulée */}
              <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl border border-gray-200 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-3">K</div>
                <h3 className="font-bold text-sm leading-tight">{book.titre}</h3>
                <p className="text-xs text-gray-400 mt-1">{book.sous_titre}</p>
                <div className="mt-3 text-xs text-gray-300 font-mono">{book.nb_pages} pages · {book.langue}</div>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={generating}
                className="w-full bg-black text-white hover:bg-gray-800 h-11 gap-2 font-semibold"
              >
                {generating ? (
                  <><Loader2 size={16} className="animate-spin" /> Génération en cours...</>
                ) : (
                  <><Sparkles size={16} /> Lancer la génération IA</>
                )}
              </Button>

              {generating && (
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progression</span><span>{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {logs.length > 0 && (
                <div className="bg-gray-950 rounded-xl p-3 font-mono text-xs space-y-1 max-h-40 overflow-y-auto">
                  {logs.map((l, i) => (
                    <div key={i} className={l.type === 'success' ? 'text-green-400' : l.type === 'error' ? 'text-red-400' : 'text-gray-400'}>
                      {l.text}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-gray-200 shadow-sm">
            <CardContent className="pt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Créé le</span>
                <span className="font-medium">{new Date(book.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-400">Modèle</span>
                <span className="font-medium text-xs">{MODEL_LABELS[book.book_model]}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-400">Langue</span>
                <span className="font-medium">{book.langue}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-gray-400">Âge cible</span>
                <span className="font-medium">{book.age_cible}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite — brief */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-100">
              <CardTitle className="text-lg">Brief technique</CardTitle>
              <CardDescription>Configuration envoyée aux workflows n8n</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 border-b border-gray-100">
                {[
                  { icon: Layers, label: 'Modèle', value: MODEL_LABELS[book.book_model] },
                  { icon: Users, label: 'Âge cible', value: book.age_cible },
                  { icon: Palette, label: 'Style visuel', value: book.style_visuel || '—' },
                  { icon: FileCheck, label: 'Intérieur', value: book.interieur_noir_blanc === 'oui' ? 'Noir & Blanc' : 'Couleur' },
                ].map((item, i) => (
                  <div key={i} className={`p-5 flex items-start gap-3 ${i % 2 === 0 ? 'border-r border-gray-100' : ''} ${i < 2 ? 'border-b border-gray-100' : ''}`}>
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <item.icon size={15} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{item.label}</p>
                      <p className="font-medium text-sm mt-0.5">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-5 space-y-5">
                <div>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Thème & Concept</h4>
                  <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">{book.theme}</p>
                </div>

                {book.personnages_recurrents && (
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Personnages récurrents</h4>
                    <div className="flex flex-wrap gap-2">
                      {book.personnages_recurrents.split(',').map(c => (
                        <Badge key={c} variant="secondary" className="bg-white border shadow-sm text-xs">{c.trim()}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">Pagination</p>
                    <p className="text-2xl font-black">{book.nb_pages}</p>
                    <p className="text-xs text-gray-400">pages</p>
                  </div>
                  {book.drive_folder && (
                    <div className="p-4 rounded-xl bg-green-50 border border-green-100 text-center">
                      <p className="text-xs text-green-600 font-bold uppercase mb-1">Drive configuré</p>
                      <CheckCircle2 size={24} className="text-green-500 mx-auto" />
                      <p className="text-xs text-green-500 mt-1">Images auto-uploadées</p>
                    </div>
                  )}
                </div>

                {!getSettings().wf1_url && (
                  <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl text-sm text-orange-800">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Workflows n8n non configurés</p>
                      <p className="text-xs mt-0.5">
                        <button className="underline" onClick={() => navigate('/settings')}>Allez dans Réglages</button> pour connecter vos workflows avant de lancer la génération.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
