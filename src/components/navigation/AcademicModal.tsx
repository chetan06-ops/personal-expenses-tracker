import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { GraduationCap, Award, User, Users, BookOpen, Building2 } from 'lucide-react';

interface AcademicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AcademicModal: React.FC<AcademicModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Academic Project Information"
      description="Official curriculum project documentation and credentials"
      maxWidth="lg"
    >
      <div className="space-y-5 text-sm">
        {/* University Header */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 to-blue-950/60 border border-cyan-500/20 text-center">
          <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center mb-2 border border-cyan-400/30">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-100">
            Maharishi Markandeshwar Institute of Computer Technology & Business Management
          </h3>
          <p className="text-xs text-cyan-300 font-medium mt-0.5">
            Maharishi Markandeshwar (Deemed to be University), Mullana, Ambala, Haryana – 133207
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <span className="text-[11px] bg-slate-800/80 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
              Project-I (BCA-308)
            </span>
            <span className="text-[11px] bg-slate-800/80 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
              Session 2025–2028
            </span>
          </div>
        </div>

        {/* Project Meta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Project Identity</span>
            </div>
            <p className="text-sm font-bold text-white">Personal Expenses Tracker</p>
            <p className="text-xs text-slate-400 mt-1">
              Upgraded modern 3D-based financial web application with local-first IndexedDB persistence.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Project Guide</span>
            </div>
            <p className="text-sm font-bold text-white">Dr. Bharti Sharma</p>
            <p className="text-xs text-slate-400 mt-0.5">Associate Professor, MMICT & BM</p>
            <p className="text-[11px] text-emerald-400 font-medium mt-1">Supervising Faculty</p>
          </div>
        </div>

        {/* Team Members */}
        <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-2.5">
            <Users className="w-4 h-4 text-violet-400" />
            <span>Project Team Members (BCA 3rd Semester)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <p className="text-xs font-bold text-slate-200">Abhijeet Singh</p>
              <p className="text-[11px] font-mono text-cyan-400 mt-0.5">Roll: 13250311</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <p className="text-xs font-bold text-slate-200">Aanchal Saini</p>
              <p className="text-[11px] font-mono text-cyan-400 mt-0.5">Roll: 13250304</p>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60">
              <p className="text-xs font-bold text-slate-200">Ankit</p>
              <p className="text-[11px] font-mono text-cyan-400 mt-0.5">Roll: 13250329</p>
            </div>
          </div>
        </div>

        {/* Technology Highlights */}
        <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 text-xs text-slate-400">
          <span className="font-semibold text-slate-300">Modern Architecture: </span>
          React 18 • TypeScript • Tailwind CSS • Three.js • React Three Fiber • Dexie (IndexedDB) • Zod • Recharts • Minor-unit (Paise) Precision.
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
