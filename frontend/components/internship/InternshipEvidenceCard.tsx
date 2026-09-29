'use client';

import React, { useState } from 'react';
import { apiService } from '@/services/api';
import { Modal } from '@/components/ui/Modal';
import { 
  Briefcase, 
  CheckCircle2, 
  Plus, 
  UserCheck, 
  Calendar, 
  ShieldCheck 
} from 'lucide-react';

interface InternshipEvidenceCardProps {
  studentId: number;
  internships: any[];
  onInternshipAdded?: () => void;
}

export function InternshipEvidenceCard({
  studentId,
  internships,
  onInternshipAdded
}: InternshipEvidenceCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [duration, setDuration] = useState('Summer 2025 (10 Weeks)');
  const [mentorName, setMentorName] = useState('');
  const [mentorEmail, setMentorEmail] = useState('');
  const [mentorFeedback, setMentorFeedback] = useState('');
  const [verifiedSkills, setVerifiedSkills] = useState([
    { skill: 'Java', score: 75 },
    { skill: 'Git', score: 80 },
    { skill: 'OOP', score: 72 }
  ]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!company || !role || !mentorName) {
      alert('Please fill company, role, and mentor name');
      return;
    }
    try {
      setSaving(true);
      await apiService.addInternship(studentId, {
        company,
        role,
        duration,
        mentor_name: mentorName,
        mentor_email: mentorEmail,
        mentor_feedback: mentorFeedback,
        verified_skills: verifiedSkills
      });
      setIsModalOpen(false);
      setCompany('');
      setRole('');
      setMentorName('');
      setMentorEmail('');
      setMentorFeedback('');
      if (onInternshipAdded) onInternshipAdded();
    } catch (err: any) {
      alert('Failed to save internship evidence: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl border border-gray-800 space-y-5">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-gray-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">Mentor-Verified Internship Evidence</h3>
            <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/30">
              FR-42
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Converts practical industry work experience into structured, verified evidence linked to Skill DNA.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Record Mentor Evaluation</span>
        </button>
      </div>

      {/* Internships List */}
      <div className="space-y-3">
        {internships.length === 0 ? (
          <div className="p-6 rounded-xl bg-gray-900/60 border border-gray-800 text-center text-xs text-gray-400">
            No internship verification records logged yet.
          </div>
        ) : (
          internships.map((it, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-3"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>{it.role}</span>
                    <span className="text-xs text-gray-400 font-normal">at {it.company}</span>
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-cyan-400" /> Mentor: {it.mentor_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-500" /> {it.duration}
                    </span>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Mentor Verified
                </span>
              </div>

              {it.mentor_feedback && (
                <p className="text-xs text-gray-300 italic bg-gray-950/60 p-3 rounded-lg border border-gray-800">
                  "{it.mentor_feedback}"
                </p>
              )}

              {/* Verified Skills Tags */}
              <div className="flex flex-wrap gap-2 pt-1">
                {it.verified_skills?.map((sk: any, i: number) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-gray-800 border border-gray-700 text-gray-200"
                  >
                    <span className="font-bold text-white">{sk.skill}</span>
                    <span className="text-emerald-400 font-bold">{sk.score}%</span>
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Record Internship Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Mentor-Verified Internship Experience"
        subtitle="Log industry project evaluation to feed verified evidence into SkillTwin (FR-42)"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Company</label>
              <input
                type="text"
                placeholder="e.g. Cisco Systems"
                value={company}
                onChange={e => setCompany(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Role Title</label>
              <input
                type="text"
                placeholder="e.g. Backend Engineering Intern"
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Mentor Name</label>
              <input
                type="text"
                placeholder="e.g. Siddharth Rao (Engineering Manager)"
                value={mentorName}
                onChange={e => setMentorName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-300 block mb-1">Duration</label>
              <input
                type="text"
                placeholder="e.g. May 2025 - July 2025 (10 Weeks)"
                value={duration}
                onChange={e => setDuration(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">Mentor Feedback</label>
            <textarea
              rows={3}
              placeholder="Mentor observations on engineering hygiene, problem solving, teamwork..."
              value={mentorFeedback}
              onChange={e => setMentorFeedback(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs"
            />
          </div>

          <div className="pt-4 border-t border-gray-800 flex justify-end gap-2">
            <button
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold shadow disabled:opacity-50"
            >
              {saving ? 'Saving Evidence...' : 'Commit Evidence to SkillTwin'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
