/**
 * =============================================================================
 * Planly — faceBiometricService.ts
 * 
 * Kegunaan:
 * Service Layer frontend untuk melakukan kueri / pengiriman data ke server API Laravel (atau localStorage mock).
 * 
 * Relasi & Dependency:
 * - Menggunakan httpClient/apiHelper. Objek dikatalogkan terpadu di dalam api.ts untuk dipakai oleh UI.
 * 
 * Aliran Data / State:
 * - Melakukan request HTTP GET/POST/PUT/DELETE secara asinkron ke endpoint API backend dan mengembalikan raw data.
 * =============================================================================
 */

import * as faceapi from '@vladmandic/face-api';

let modelsLoaded = false;

/**
 * Memuat semua model face-api.js dari direktori lokal /models.
 */
export async function loadFaceApiModels(): Promise<boolean> {
  if (modelsLoaded) return true;
  try {
    await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
    await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
    modelsLoaded = true;
    return true;
  } catch (error) {
    console.error('Gagal memuat model face-api:', error);
    throw new Error('Gagal memuat model deteksi wajah dari sistem.');
  }
}

/**
 * Mendeteksi wajah tunggal beserta landmark dan deskriptornya pada elemen video.
 */
export async function detectSingleFaceWithDescriptor(
  video: HTMLVideoElement,
  minConfidence = 0.5
) {
  return faceapi
    .detectSingleFace(video, new faceapi.SsdMobilenetv1Options({ minConfidence }))
    .withFaceLandmarks()
    .withFaceDescriptor();
}

/**
 * Menghitung jarak Euclidean antara dua deskriptor wajah (Float32Array / Array).
 */
export function calculateEuclideanDistance(
  descriptor1: number[] | Float32Array,
  descriptor2: number[] | Float32Array
): number {
  let sum = 0;
  const len = Math.min(descriptor1.length, descriptor2.length);
  for (let i = 0; i < len; i++) {
    const diff = descriptor1[i] - descriptor2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/**
 * Memverifikasi kecocokan wajah dengan membandingkan deskriptor wajah saat ini
 * dengan deskriptor wajah terdaftar berdasarkan ambang batas (default: 0.6).
 */
export function verifyFaceSimilarity(
  currentDescriptor: number[] | Float32Array,
  registeredDescriptor: number[] | Float32Array,
  threshold = 0.6
): { match: boolean; distance: number } {
  const distance = calculateEuclideanDistance(currentDescriptor, registeredDescriptor);
  return {
    match: distance <= threshold,
    distance,
  };
}

/**
 * Menggambar kotak sudut kustom (premium brackets) di sekeliling area wajah terdeteksi pada canvas.
 */
export function drawCustomFaceBrackets(
  ctx: CanvasRenderingContext2D,
  box: { x: number; y: number; width: number; height: number },
  color = '#6366F1',
  lineWidth = 4,
  pad = 10
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = 'round';
  
  const x = box.x - pad;
  const y = box.y - pad;
  const w = box.width + pad * 2;
  const h = box.height + pad * 2;
  const len = Math.min(25, w / 4);

  // Top-left bracket
  ctx.beginPath();
  ctx.moveTo(x + len, y);
  ctx.lineTo(x, y);
  ctx.lineTo(x, y + len);
  ctx.stroke();

  // Top-right bracket
  ctx.beginPath();
  ctx.moveTo(x + w - len, y);
  ctx.lineTo(x + w, y);
  ctx.lineTo(x + w, y + len);
  ctx.stroke();

  // Bottom-left bracket
  ctx.beginPath();
  ctx.moveTo(x, y + h - len);
  ctx.lineTo(x, y + h);
  ctx.lineTo(x + len, y + h);
  ctx.stroke();

  // Bottom-right bracket
  ctx.beginPath();
  ctx.moveTo(x + w - len, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.lineTo(x + w, y + h - len);
  ctx.stroke();
}
