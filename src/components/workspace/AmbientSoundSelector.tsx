/**
 * =============================================================================
 * Planly — AmbientSoundSelector.tsx
 * 
 * Kegunaan:
 * Berkas kode dalam proyek Planly.
 * 
 * Relasi & Dependency:
 * - Berhubungan dengan modul utama aplikasi.
 * 
 * Aliran Data / State:
 * - Mengikuti alur data terpadu (REST API / local mock storage).
 * =============================================================================
 */


import { Volume2, VolumeX } from 'lucide-react';
import CustomSelect from '../ui/CustomSelect';
import type { SelectOption } from '../ui/CustomSelect';

interface AmbientSoundSelectorProps {
  selectedSound: string;
  onSelectedSoundChange: (val: string) => void;
  isAudioMuted: boolean;
  onMuteToggle: () => void;
}

const AMBIENT_SOUNDS = [
  { id: 'none', name: 'Hening (Tanpa Suara)' },
  { id: 'rain', name: 'Rintik Hujan Syahdu (Rain)' },
  { id: 'lofi', name: 'Musik Fokus Lo-Fi (Lofi Synth)' },
  { id: 'nature', name: 'Kebisingan Alam (Nature Wind)' },
  { id: 'ocean', name: 'Deburan Ombak Pantai (Ocean)' },
  { id: 'fireplace', name: 'Perapian Kayu Hangat (Fireplace)' },
  { id: 'crickets', name: 'Jangkrik Malam Pedesaan (Crickets)' },
  { id: 'cafe', name: 'Suasana Kafe Tenang (Coffee Shop)' },
  { id: 'train', name: 'Perjalanan Kereta Malam (Night Train)' }
];

/**
 * Komponen AmbientSoundSelector
 * 
 * Pengendali suara latar belajar (binaural/white noise) untuk menemani sesi belajar.
 * Dilengkapi dengan tombol mute/unmute visual.
 */
export default function AmbientSoundSelector({
  selectedSound,
  onSelectedSoundChange,
  isAudioMuted,
  onMuteToggle
}: AmbientSoundSelectorProps) {
  
  const ambientSoundOptions: SelectOption[] = AMBIENT_SOUNDS.map(sound => ({
    value: sound.id,
    label: sound.name
  }));

  return (
    <div className="flex items-center gap-2">
      {/* Dropdown Kustom */}
      <CustomSelect
        value={selectedSound}
        onChange={onSelectedSoundChange}
        options={ambientSoundOptions}
        placeholder="Pilih Suara..."
        position="down"
      />
      
      {/* Tombol Mute / Volume */}
      {selectedSound !== 'none' && (
        <button
          onClick={onMuteToggle}
          className="p-1 text-on-surface-variant hover:text-on-surface hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg cursor-pointer transition-colors bg-transparent border-none"
          title={isAudioMuted ? 'Buka Suara' : 'Senyap'}
        >
          {isAudioMuted ? (
            <VolumeX className="w-4 h-4 text-red-500" />
          ) : (
            <Volume2 className="w-4 h-4 text-primary" />
          )}
        </button>
      )}
    </div>
  );
}
