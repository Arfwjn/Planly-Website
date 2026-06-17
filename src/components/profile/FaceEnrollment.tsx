/**
 * =============================================================================
 * Planly — FaceEnrollment.tsx
 * 
 * Kegunaan:
 * Komponen konfigurasi Profil pengguna, pencapaian target akademik (IPK/GPA), sinkronisasi kalender OAuth, & backup data.
 * 
 * Relasi & Dependency:
 * - Berelasi dengan ProfileView.tsx (orkestrator), profileService, dan calendarSync.
 * 
 * Aliran Data / State:
 * - Mengambil ringkasan data nilai IPK mahasiswa, kontrol sinkronisasi kalender eksternal, dan ekspor/impor data JSON.
 * =============================================================================
 */

import { useState, useEffect } from 'react';
import * as faceapi from '@vladmandic/face-api';
import { useToast } from '../ui/Toast';
import FaceEnrollmentCard from './face-enrollment/FaceEnrollmentCard';
import FaceEnrollmentModal from './face-enrollment/FaceEnrollmentModal';
import FaceEnrollmentPreviewModal from './face-enrollment/FaceEnrollmentPreviewModal';
import ConfirmModal from '../ui/ConfirmModal';

interface FaceEnrollmentProps {
  theme: 'light' | 'dark';
}

export default function FaceEnrollment({ theme: _theme }: FaceEnrollmentProps) {
  const toast = useToast();
  const [registered, setRegistered] = useState(false);
  const [registerDate, setRegisterDate] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  
  const [showModal, setShowModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Load registration status from localStorage
  const loadRegistrationStatus = () => {
    const descriptor = localStorage.getItem('planly_registered_face');
    const photo = localStorage.getItem('planly_registered_face_photo');
    const date = localStorage.getItem('planly_registered_face_time');
    
    if (descriptor && photo) {
      setRegistered(true);
      setPhotoUrl(photo);
      setRegisterDate(date || 'Tanggal tidak tercatat');
    } else {
      setRegistered(false);
      setPhotoUrl(null);
      setRegisterDate(null);
    }
  };

  useEffect(() => {
    loadRegistrationStatus();
  }, [showModal]);

  const handleScanComplete = async (
    detection: faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<{ detection: faceapi.FaceDetection }, faceapi.FaceLandmarks68>>,
    croppedPhotoBase64: string | null
  ) => {
    try {
      const descriptorArray = Array.from(detection.descriptor);
      const currentDate = new Date().toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      localStorage.setItem('planly_registered_face', JSON.stringify(descriptorArray));
      if (croppedPhotoBase64) {
        localStorage.setItem('planly_registered_face_photo', croppedPhotoBase64);
        setPhotoUrl(croppedPhotoBase64);
      }
      localStorage.setItem('planly_registered_face_time', currentDate);

      setRegistered(true);
      setRegisterDate(currentDate);

      toast.success('Pendaftaran wajah berhasil dilakukan!');
    } catch (error) {
      console.error('Error saving face enrollment:', error);
      toast.error('Gagal menyimpan pendaftaran wajah.');
    } finally {
      // Small timeout to let user see success message before closing modal
      setTimeout(() => {
        setShowModal(false);
      }, 1000);
    }
  };

  const handleDeleteFace = () => {
    setShowDeleteConfirm(true);
  };

  const performDeleteFace = () => {
    localStorage.removeItem('planly_registered_face');
    localStorage.removeItem('planly_registered_face_photo');
    localStorage.removeItem('planly_registered_face_time');
    
    setRegistered(false);
    setPhotoUrl(null);
    setRegisterDate(null);
    
    toast.info('Data wajah terdaftar berhasil dihapus.');
  };

  return (
    <>
      <FaceEnrollmentCard
        registered={registered}
        registerDate={registerDate}
        onShowPreview={() => setShowPreview(true)}
        onOpenRegister={() => setShowModal(true)}
        onDeleteFace={handleDeleteFace}
      />

      <FaceEnrollmentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onScanComplete={handleScanComplete}
      />

      <FaceEnrollmentPreviewModal
        isOpen={showPreview}
        photoUrl={photoUrl}
        registerDate={registerDate}
        onClose={() => setShowPreview(false)}
      />

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={performDeleteFace}
        title="Hapus Data Wajah"
        message="Apakah Anda yakin ingin menghapus data wajah terdaftar? Anda tidak akan bisa melakukan absensi wajah tanpa mendaftarkan ulang."
        confirmText="Hapus Wajah"
        cancelText="Batal"
        isDanger={true}
      />
    </>
  );
}
