import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2, Save } from 'lucide-react';
import { Settings } from '../types';
import { getSettings, saveSettings } from '../store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type TestStatus = 'idle' | 'testing' | 'ok' | 'error';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    wf1_url: '', wf2_url: '', wf3_url: '', drive_folder_default: '', sheet_id: '',
  });
  const [testStatus, setTestStatus] = useState<Record<string, TestStatus>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const s = getSettings();
    setSettings({ wf1_url: '', wf2_url: '', wf3_url: '', drive_folder_default: '', sheet_id: '', ...s });
  }, []);

  function update(key: keyof Settings, value: string) {
    setSettings(prev => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function testWebhook(key: string, url: string) {
    if (!url) { alert('URL non renseignée'); return; }
    setTestStatus(prev => ({ ...prev, [key]: 'testing' }));
    try {
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true }),
      });
      setTestStatus(prev => ({ ...prev, [key]: r.ok ? 'ok' : 'error' }));
    } catch {
      setTestStatus(prev => ({ ...prev, [key]: 'error' }));
    }
  }

  const StatusIcon = ({ k }: { k: string }) => {
    const s = testStatus[k] || 'idle';
    if (s === 'testing') return <Loader2 size={16} className="text-blue-500 animate-spin" />;
    if (s === 'ok') return <CheckCircle2 size={16} className="text-green-500" />;
    if (s === 'error') return <XCircle size={16} className="text-red-500" />;
    return <div className="w-4 h-4 rounded-full border-2 border-gray-300" />;
  };

  const workflows = [
    { key: 'wf1_url', label: 'Workflow 1 — Génération du contenu des pages', desc: 'Déclenche la génération Claude des pages via n8n' },
    { key: 'wf2_url', label: 'Workflow 2 — Génération des prompts image',    desc: 'Génère les prompts Imagen pour chaque page' },
    { key: 'wf3_url', label: 'Workflow 3 — Génération des images',           desc: 'Génère les images via Gemini et les upload sur Drive' },
  ];

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Réglages n8n</h1>
        <p className="text-sm text-gray-500 mt-1">Connectez vos workflows n8n pour automatiser la génération des cahiers</p>
      </div>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Webhooks n8n</CardTitle>
          <CardDescription className="text-xs leading-relaxed">
            Dans chaque workflow n8n, remplacez le nœud <strong>▶ Déclencheur</strong> par un nœud <strong>Webhook</strong>.
            Copiez l'URL générée ici. Le workflow recevra les données du livre via POST JSON.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {workflows.map(wf => (
            <div key={wf.key} className="space-y-2">
              <label className="text-sm font-medium text-gray-700">{wf.label}</label>
              <p className="text-xs text-gray-400">{wf.desc}</p>
              <div className="flex gap-2 items-center">
                <StatusIcon k={wf.key} />
                <Input
                  placeholder="https://votre-n8n.com/webhook/..."
                  value={settings[wf.key as keyof Settings]}
                  onChange={e => update(wf.key as keyof Settings, e.target.value)}
                  className="flex-1 text-sm h-9 font-mono"
                />
                <Button
                  variant="outline" size="sm"
                  onClick={() => testWebhook(wf.key, settings[wf.key as keyof Settings])}
                  className="shrink-0 h-9"
                >
                  Tester
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Google Sheets & Drive</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">ID du Google Sheet</label>
            <p className="text-xs text-gray-400">L'ID dans l'URL de votre sheet : docs.google.com/spreadsheets/d/<strong>[ID ICI]</strong>/edit</p>
            <Input
              placeholder="1fsBaYO5Xoy71oMt7Z2zyFSBRUORLyiey0c37k8jaA20"
              value={settings.sheet_id}
              onChange={e => update('sheet_id', e.target.value)}
              className="text-sm h-9 font-mono"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Dossier Google Drive par défaut</label>
            <p className="text-xs text-gray-400">L'ID du dossier Drive où seront uploadées les images</p>
            <Input
              placeholder="1SL__OI3TGRUlYRaqzYBLwkbCliftxAPC"
              value={settings.drive_folder_default}
              onChange={e => update('drive_folder_default', e.target.value)}
              className="text-sm h-9 font-mono"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="bg-black text-white hover:bg-gray-800 gap-2">
          <Save size={15} />
          {saved ? 'Enregistré !' : 'Enregistrer'}
        </Button>
      </div>

      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-5 text-sm text-blue-800 space-y-2">
          <p className="font-semibold">Comment connecter un workflow n8n ?</p>
          <ol className="list-decimal list-inside text-xs space-y-1 text-blue-700">
            <li>Ouvrez votre workflow dans n8n</li>
            <li>Supprimez le nœud <code className="bg-blue-100 px-1 rounded">▶ Déclencheur</code></li>
            <li>Ajoutez un nœud <code className="bg-blue-100 px-1 rounded">Webhook</code> — choisissez méthode POST</li>
            <li>Copiez l'URL de production (onglet "Production URL")</li>
            <li>Collez-la dans le champ correspondant ci-dessus</li>
            <li>Dans le workflow, accédez aux données via <code className="bg-blue-100 px-1 rounded">$json.body</code></li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
