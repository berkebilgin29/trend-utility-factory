# Yerel Panel

Yerel paneli calistir:

```powershell
npm.cmd run panel
```

Tarayicida ac:

```text
http://localhost:4177
```

Panel sunlari gosterir:
- gunluk brief sayisi
- uretilen proje sayisi
- her asamada hangi yapay zeka/provider secildigi
- ChatGPT/Gemini manuel inceleme icin tahmini token
- Ollama secilirse tahmini yerel token
- son calisan komutlar ve ciktilari
- arastirma, prova, gunluk uretim, QA, review ve build butonlari
- panel acik kaldigi surece gunluk otomatik calisma
- Ollama servis durumu ve model listesi

Varsayilan davranis ucretli API cagrisi yapmaz. ChatGPT ve Gemini manuel konsey asamalari olarak gosterilir; panel bu araclara prompt yapistirmadan once yaklasik token maliyetini hesaplar. Ollama, yerelde zaten calisiyorsa secilebilir.

Panel sadece bu repository icindeki izinli npm scriptlerini calistirir.

## Otonom Calisma

Otomasyon aciksa panel, her gun ayarlanan saatte su zinciri calistirir:

1. Trend arastirmasi
2. Gunluk brief/proje uretimi
3. QA
4. Secili proje review
5. Istenirse secili proje build

Bu otomasyon Windows gorev zamanlayicisi kurmaz ve sistem ayari degistirmez. Calismasi icin panel server acik kalmalidir.

## Ollama

Panel `http://localhost:11434/api/tags` adresini kontrol eder. Ollama kurulu ve calisiyorsa durum ve model isimleri panelde gorunur. Ollama yoksa otomasyon `mock` provider ile calisir; `ollama` secilirse ve servis kapaliysa ilgili is basarisiz olur.

Bu kurulumda varsayilan Ollama modeli `qwen2.5:1.5b` olarak ayarlandi. Farkli bir model kullanmak istersen panelde Ollama secili kalabilir, kod tarafinda `OLLAMA_MODEL` environment degiskeniyle model adi verilebilir.
