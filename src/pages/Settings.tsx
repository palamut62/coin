import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { getXaiApiKey, saveXaiApiKey } from '@/api/settings';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';

interface ApiKeyDisplay {
  key: string;
  maskedValue: string;
  isVisible: boolean;
}

export default function Settings() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedKeys, setSavedKeys] = useState<ApiKeyDisplay[]>([]);

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    try {
      const value = await getXaiApiKey();
      setApiKey(value);
      if (value) {
        setSavedKeys([
          {
            key: 'XAI API Key',
            maskedValue: maskApiKey(value),
            isVisible: false
          }
        ]);
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast.error('API Key\'ler yüklenirken bir hata oluştu');
    }
  };

  const maskApiKey = (key: string) => {
    if (key.length <= 8) return '********';
    return key.substring(0, 4) + '...' + key.substring(key.length - 4);
  };

  const toggleKeyVisibility = (index: number) => {
    setSavedKeys(keys => 
      keys.map((k, i) => 
        i === index ? { ...k, isVisible: !k.isVisible } : k
      )
    );
  };

  const handleSaveApiKey = async () => {
    setLoading(true);
    try {
      await saveXaiApiKey(apiKey);
      toast.success('API Key başarıyla kaydedildi');
      await fetchApiKeys(); // Listeyi güncelle
    } catch (error) {
      console.error('Error saving API key:', error);
      toast.error('API Key kaydedilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Ana Sayfaya Dön
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>API Anahtarları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {savedKeys.map((key, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{key.key}</h3>
                  <p className="font-mono mt-1">
                    {key.isVisible ? savedKeys[index].maskedValue.replace('...', apiKey.substring(4, -4)) : key.maskedValue}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleKeyVisibility(index)}
                >
                  {key.isVisible ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Yeni API Anahtarı Ekle</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="apiKey" className="block text-sm font-medium mb-2">
                XAI API Key
              </label>
              <div className="flex gap-2">
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="XAI API Key'inizi girin"
                />
                <Button onClick={handleSaveApiKey} disabled={loading}>
                  {loading ? 'Kaydediliyor...' : 'Kaydet'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 