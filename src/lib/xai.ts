import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
  dangerouslyAllowBrowser: true
});

if (!openai.apiKey) {
  console.error('API anahtarı bulunamadı! Lütfen .env dosyasında XAI_API_KEY değişkenini tanımlayın.');
  throw new Error('API anahtarı bulunamadı! Lütfen .env dosyasını kontrol edin.');
}

console.log('XAI Grok API Anahtarı Yüklendi:', openai.apiKey.substring(0, 8) + '...');

async function makeGrokRequest(prompt: string): Promise<string> {
  try {
    console.log('API isteği gönderiliyor...');
    
    const completion = await openai.chat.completions.create({
      model: "grok-2-latest",
      messages: [
        {
          role: "system",
          content: "Sen bir kripto para analisti ve uzmanısın. Verilen bilgilere göre detaylı ve profesyonel analizler yaparsın."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    console.log('API yanıtı alındı');
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('XAI Grok API Hata Detayları:', {
      error: error instanceof Error ? error.message : 'Bilinmeyen hata',
      timestamp: new Date().toISOString()
    });
    
    if (error instanceof Error) {
      return `Analiz yapılırken bir hata oluştu: ${error.message}`;
    }
    
    return 'Analiz yapılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.';
  }
}

export async function analyzeCrypto(
  coinName: string,
  currentPrice: number,
  priceChange24h: number,
  marketCap: number,
  volume24h: number
): Promise<string> {
  const prompt = `
    Lütfen aşağıdaki kripto para birimi için detaylı bir analiz yapın:

    Coin: ${coinName}
    Güncel Fiyat: $${currentPrice}
    24 Saatlik Değişim: %${priceChange24h}
    Piyasa Değeri: $${marketCap}
    24 Saatlik İşlem Hacmi: $${volume24h}

    Analiz şunları içermeli:
    1. Fiyat hareketinin teknik analizi
    2. İşlem hacmi ve piyasa değeri değerlendirmesi
    3. Kısa vadeli (24 saat) tahmin
    4. Riskler ve fırsatlar
    5. Genel piyasa durumu ile ilişkisi

    Lütfen yanıtınızı Türkçe olarak, anlaşılır ve özet bir şekilde verin.
  `;

  return makeGrokRequest(prompt);
}

export async function getCryptoNews(coinName: string): Promise<string> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const formattedDate = thirtyDaysAgo.toISOString().split('T')[0];

  const prompt = `
    Lütfen ${coinName} ile ilgili ${formattedDate} tarihinden bugüne kadar olan gelişmeleri ve haberleri analiz edin.
    
    Analiz şunları içermeli:
    1. Son 30 gündeki önemli gelişmeler
    2. Projenin güncel durumu
    3. Yaklaşan önemli etkinlikler veya güncellemeler
    4. Piyasa duyarlılığı
    5. Sosyal medyadaki öne çıkan tartışmalar

    Lütfen yanıtınızı Türkçe olarak, anlaşılır ve özet bir şekilde verin.
  `;

  return makeGrokRequest(prompt);
}

export async function getCoinInfo(coinName: string): Promise<string> {
  const prompt = `
    Lütfen ${coinName} kripto para birimi hakkında detaylı bilgi verin.
    
    Bilgiler şunları içermeli:
    1. Projenin kuruluş tarihi ve kurucuları
    2. Projenin amacı ve çözdüğü problem
    3. Kullanılan teknoloji ve blockchain altyapısı
    4. Projenin sektördeki yeri ve rekabet avantajları
    5. Önemli ortaklıklar ve gelişmeler
    6. Tokenomics (toplam arz, dolaşımdaki arz, token dağılımı)
    7. Yol haritası ve gelecek planları

    Lütfen yanıtınızı Türkçe olarak, anlaşılır ve detaylı bir şekilde verin.
  `;

  return makeGrokRequest(prompt);
} 