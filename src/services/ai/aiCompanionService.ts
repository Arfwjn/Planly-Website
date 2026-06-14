import { GoogleGenAI } from '@google/genai';
import { 
  TranscriptLine, 
  AcademicEnrichment, 
  LectureChapter,
  ChatMessage
} from '../../components/ai-companion/types';

export interface LectureAnalysisResult {
  transcript: TranscriptLine[];
  chapters: LectureChapter[];
  takeaways: string[];
  enrichment: AcademicEnrichment;
}


// Helper to convert a Blob to Base64 in the browser
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// Helper to convert an AudioBuffer to a WAV Blob (16-bit PCM mono 16kHz)
export function bufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // 1 = raw PCM (unsigned/signed integers)
  const bitDepth = 16;
  
  let result;
  if (numOfChan === 2) {
    result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
  } else {
    result = buffer.getChannelData(0);
  }
  
  const bufferLength = result.length * 2;
  const bufferArr = new ArrayBuffer(44 + bufferLength);
  const view = new DataView(bufferArr);
  
  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + bufferLength, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, format, true);
  /* channel count */
  view.setUint16(22, numOfChan, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * numOfChan * (bitDepth / 8), true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, numOfChan * (bitDepth / 8), true);
  /* bits per sample */
  view.setUint16(34, bitDepth, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, bufferLength, true);
  
  // Write the PCM audio samples
  floatTo16BitPCM(view, 44, result);
  
  return new Blob([view], { type: 'audio/wav' });
}

function interleave(inputL: Float32Array, inputR: Float32Array): Float32Array {
  const length = inputL.length + inputR.length;
  const result = new Float32Array(length);
  let index = 0;
  let inputIndex = 0;
  
  while (index < length) {
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
}

function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Extracts audio track from MP4 file, down-samples it to 16kHz mono, and encodes as WAV.
 * Returns the encoded WAV Blob and the exact audio duration in seconds.
 */
export async function extractAudioAsWav(
  videoFile: File,
  onProgress?: (stage: string, progress: number) => void
): Promise<{ blob: Blob; duration: number }> {
  if (onProgress) onProgress('Membaca berkas video...', 10);
  
  // 1. Read file as array buffer
  const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = (e) => reject(new Error('Gagal membaca berkas video: ' + e));
    reader.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 40); // Max 40% for reading
        onProgress('Membaca berkas video...', 10 + percent);
      }
    };
    reader.readAsArrayBuffer(videoFile);
  });

  if (onProgress) onProgress('Mendecode audio dari video...', 50);

  // 2. Decode Audio Data
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) {
    throw new Error('Web Audio API tidak didukung di browser ini.');
  }
  
  const tempCtx = new AudioContextClass();
  let audioBuffer: AudioBuffer;
  try {
    audioBuffer = await tempCtx.decodeAudioData(arrayBuffer);
  } catch (err) {
    throw new Error('Gagal melakukan decoding audio data: ' + err);
  } finally {
    await tempCtx.close();
  }

  if (onProgress) onProgress('Melakukan down-sampling audio ke 16kHz mono...', 75);

  // 3. Down-sample to 16kHz Mono using OfflineAudioContext
  const targetSampleRate = 16000;
  const duration = audioBuffer.duration;
  const length = Math.round(duration * targetSampleRate);
  
  const offlineCtx = new OfflineAudioContext(1, length, targetSampleRate);
  const sourceNode = offlineCtx.createBufferSource();
  sourceNode.buffer = audioBuffer;
  sourceNode.connect(offlineCtx.destination);
  sourceNode.start();
  
  const renderedBuffer = await offlineCtx.startRendering();

  if (onProgress) onProgress('Mengompresi dan mengekspor ke format WAV...', 90);

  // 4. Encode as WAV
  const wavBlob = bufferToWav(renderedBuffer);
  
  if (onProgress) onProgress('Ekstraksi audio selesai.', 100);
  return { blob: wavBlob, duration };
}

/**
 * Sends audio WAV blob to Gemini API to analyze the lecture, generating structured JSON.
 */
export async function analyzeLectureAudio(
  audioBlob: Blob,
  duration: number,
  apiKey: string,
  onProgress?: (stage: string, progress: number) => void
): Promise<LectureAnalysisResult> {
  if (onProgress) onProgress('Mengonversi trek audio ke format Base64...', 85);
  
  const base64Audio = await blobToBase64(audioBlob);

  if (onProgress) onProgress('Mengirim data audio ke Gemini AI untuk analisis...', 90);

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Analisis rekaman audio kuliah ini secara menyeluruh. Durasi total rekaman audio kuliah ini adalah ${duration} detik. Semua penanda waktu (properti "time" dalam detik) yang dihasilkan di dalam daftar transkrip ("transcript") dan daftar bab perkuliahan ("chapters") HARUS berupa nilai numerik detik yang akurat dan berada dalam rentang 0 hingga ${duration} detik, dan mutlak TIDAK BOLEH melebihi ${duration} detik.
Penting: Saat Anda ingin menyoroti atau mempertebal (bold) kata atau frasa penting di dalam ringkasan ("takeaways"), deskripsi bab ("chapters"), penjelasan ("enrichment.explanation"), atau kartu konsep ("enrichment.cards.description"), gunakan format tag HTML <b>teks</b> (contoh: <b>Jaringan Saraf Tiruan</b>), dan mutlak JANGAN gunakan format markdown seperti **teks** atau *teks*.

Buatlah output data terstruktur dalam Bahasa Indonesia yang berisi:
1. Transkrip bertimestamp lengkap ("transcript"):
   - Lakukan transkripsi secara verbatim dan akurat kata demi kata.
   - Tentukan waktu mulai (time dalam detik, bertipe integer) untuk setiap kalimat/bagian pembicaraan dengan SANGAT AKURAT. Pastikan waktu (detik) tersebut benar-benar menunjukkan detik awal saat pembicara mengucapkan kalimat/kata tersebut di dalam audio. Jangan menebak-nebak atau membagi waktu secara rata.
   - Pisahkan transkrip menjadi segmen-segmen pendek yang berurutan (idealnya setiap 5 hingga 15 detik sekali) agar sinkronisasi dan perpindahan baris transkrip saat video diputar menjadi presisi.
   - Deteksi pembicara jika memungkinkan (misal "Dosen" atau "Mahasiswa").
   - Transkrip harus lengkap tanpa melewatkan bagian pembicaraan penting dari rekaman kuliah.
2. Daftar Bab Perkuliahan ("chapters"):
   - Tentukan penanda bab bahasan utama perkuliahan (misal mulai dari pendahuluan, topik A, topik B, diskusi, penutup).
   - Cantumkan waktu mulai bab dalam detik ("time", harus <= ${duration}), judul bab ("title"), dan deskripsi singkat ("desc").
3. Ringkasan poin penting ("takeaways"):
   - Ringkaskan materi penting kuliah dalam bentuk butir-butir ringkasan (key takeaways) yang padat informasi.
4. Pengayaan materi akademik tambahan ("enrichment"):
   - Berikan tambahan informasi akademik pendukung dari luar rekaman kuliah.
   - Cantumkan penjelasan tambahan ("explanation").
     - Sediakan daftar kartu konsep ("cards") yang memiliki properti: judul ("title"), penjelasan detil cara kerja konsep tersebut ("description"), dan rumus/formula matematika/pseudocode pendukung HANYA JIKA ADA ("formula" - jika tidak ada rumus, hilangkan properti "formula" ini atau jangan sertakan dalam objek kartu konsep tersebut. Jika berupa rumus matematika, gunakan format penulisan LaTeX standar tanpa tanda dollar/pembatas seperti \frac{1}{1 + e^{-x}} atau f(x) = \max(0, x)).
     - Sediakan daftar pranala referensi web terpercaya ("sources") yang memiliki properti nama sumber ("label") dan alamat URL lengkap ("url").`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: 'audio/wav',
                data: base64Audio
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'object',
          properties: {
            transcript: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  time: { type: 'integer' },
                  speaker: { type: 'string' },
                  text: { type: 'string' }
                },
                required: ['time', 'speaker', 'text']
              }
            },
            chapters: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  time: { type: 'integer' },
                  title: { type: 'string' },
                  desc: { type: 'string' }
                },
                required: ['time', 'title', 'desc']
              }
            },
            takeaways: {
              type: 'array',
              items: { type: 'string' }
            },
            enrichment: {
              type: 'object',
              properties: {
                explanation: { type: 'string' },
                cards: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      title: { type: 'string' },
                      formula: { type: 'string' },
                      description: { type: 'string' }
                    },
                    required: ['title', 'description']
                  }
                },
                sources: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      label: { type: 'string' },
                      url: { type: 'string' }
                    },
                    required: ['label', 'url']
                  }
                }
              },
              required: ['explanation', 'cards', 'sources']
            }
          },
          required: ['transcript', 'chapters', 'takeaways', 'enrichment']
        }
      }
    });

    const responseText = response.text;
    if (!responseText) {
      throw new Error('Respons kosong diterima dari Gemini AI.');
    }

    const result = JSON.parse(responseText) as LectureAnalysisResult;

    // Post-processing: Linear scaling to align timestamps with actual duration and fix drift
    if (result.transcript && result.transcript.length > 0) {
      const transcriptTimes = result.transcript.map(line => line.time);
      const chapterTimes = (result.chapters || []).map(ch => ch.time);
      const allTimes = [...transcriptTimes, ...chapterTimes];
      const maxGeneratedTime = allTimes.length > 0 ? Math.max(...allTimes) : 0;

      if (maxGeneratedTime > duration && maxGeneratedTime > 0) {
        const scale = duration / maxGeneratedTime;
        
        result.transcript = result.transcript.map(line => ({
          ...line,
          time: Math.min(Math.max(0, Math.round(line.time * scale)), Math.floor(duration))
        }));

        if (result.chapters) {
          result.chapters = result.chapters.map(ch => ({
            ...ch,
            time: Math.min(Math.max(0, Math.round(ch.time * scale)), Math.floor(duration))
          }));
        }
      } else {
        // Safe check: even if no scaling is applied, clamp all timestamps to the video duration
        result.transcript = result.transcript.map(line => ({
          ...line,
          time: Math.min(Math.max(0, line.time), Math.floor(duration))
        }));

        if (result.chapters) {
          result.chapters = result.chapters.map(ch => ({
            ...ch,
            time: Math.min(Math.max(0, ch.time), Math.floor(duration))
          }));
        }
      }
    }

    if (onProgress) onProgress('Analisis AI selesai diproses.', 100);
    return result;
  } catch (error) {
    console.error('Gemini Analysis error:', error);
    throw new Error('Gagal menganalisis kuliah dengan Gemini AI: ' + (error instanceof Error ? error.message : error));
  }
}

/**
 * Sends a message along with the lecture transcript and chat history to Gemini
 * to get a context-grounded response.
 */
export async function chatWithLectureContext(
  message: string,
  history: ChatMessage[],
  transcript: TranscriptLine[],
  apiKey: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey });

  // Format the transcript as a text context block for the model
  const transcriptContext = transcript
    .map(line => `[${formatTime(line.time)}] ${line.speaker}: ${line.text}`)
    .join('\n');

  const systemInstruction = `Anda adalah Asisten Kuliah AI Planly. Tugas Anda adalah membantu mahasiswa memahami isi materi perkuliahan berdasarkan transkrip yang disediakan.
  
Berikut adalah transkrip lengkap rekaman kuliah:
=== AWAL TRANSKRIP ===
${transcriptContext}
=== AKHIR TRANSKRIP ===

Aturan Penting:
1. Jika mahasiswa bertanya tentang hal yang ada di transkrip kuliah, jawablah dengan detail dan cantumkan timestamp dalam format [MM:SS] (misalnya: "Dosen menjelaskan hal ini pada menit [02:15]") agar mahasiswa dapat mengklik tombol tersebut dan melompat ke detik yang dimaksud. Gunakan format [MM:SS] secara tepat agar sistem kami bisa mengubahnya menjadi tombol navigasi video yang interaktif.
2. Jika mahasiswa menanyakan hal yang TIDAK dibahas atau tidak ada kaitannya dengan transkrip kuliah (seperti meminta kode program python, tips karir, atau topik akademis lain di luar video), Anda HARUS menolak untuk menjawab dengan sopan dalam Bahasa Indonesia (misalnya: "Maaf, konsep tersebut tidak dibahas dalam rekaman kuliah ini. Silakan tanyakan konsep materi kuliah yang ada pada transkrip.") dan ingatkan mahasiswa untuk tetap fokus pada topik video kuliah. JANGAN berikan jawaban umum Anda atau penjelasan tambahan di luar isi transkrip kuliah tersebut.
3. Saat Anda ingin mempertebal (bold) atau menyoroti kata/frasa penting dalam jawaban Anda, gunakan format tag HTML <b>teks</b> (contoh: <b>Sigmoid</b>), dan mutlak JANGAN gunakan format markdown seperti **teks** atau *teks*.
4. Jawablah seluruhnya dalam Bahasa Indonesia yang ramah, jelas, terstruktur, dan akademis.`;

  // Map history to roles and parts
  const chatTurns = history.filter(m => !m.text.startsWith('Halo! Saya adalah Asisten Kuliah AI Anda'));
  
  const formattedTurns = chatTurns.map(msg => ({
    role: msg.sender === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  // Append current user message
  formattedTurns.push({
    role: 'user',
    parts: [{ text: message }]
  });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedTurns,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text || 'Gagal menghasilkan tanggapan dari AI.';
  } catch (error) {
    console.error('Chat Gemini error:', error);
    throw new Error('Gagal menghubungi Gemini AI: ' + (error instanceof Error ? error.message : error));
  }
}

// Helper to format seconds to MM:SS
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
