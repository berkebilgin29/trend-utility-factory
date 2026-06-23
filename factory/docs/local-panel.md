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

Varsayilan davranis ucretli API cagrisi yapmaz. ChatGPT ve Gemini manuel konsey asamalari olarak gosterilir; panel bu araclara prompt yapistirmadan once yaklasik token maliyetini hesaplar. Ollama, yerelde zaten calisiyorsa secilebilir.

Panel sadece bu repository icindeki izinli npm scriptlerini calistirir.
