'use client';

import { useState } from 'react';
import { AssessmentQuestion, AssessmentResultResponse } from '@/types';
import { apiService } from '@/services/api';

export function useAssessment(studentId?: number | null, onAssessmentComplete?: () => void) {
  const [assessmentId, setAssessmentId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [result, setResult] = useState<AssessmentResultResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const startTest = async (targetRoleId?: number) => {
    if (!studentId) return;
    try {
      setLoading(true);
      setError(null);
      setResult(null);
      setAnswers({});
      setCurrentIndex(0);

      const data = await apiService.startAssessment(studentId, targetRoleId);
      setAssessmentId(data.assessment_id);
      setQuestions(data.questions);
    } catch (err: any) {
      setError(err.message || 'Failed to start assessment');
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionId: number, optionId: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const submitTest = async () => {
    if (!assessmentId || !studentId) return;
    try {
      setSubmitting(true);
      setError(null);

      const formattedAnswers = Object.entries(answers).map(([qId, optId]) => ({
        question_id: parseInt(qId, 10),
        selected_option_id: optId
      }));

      // For unanswered questions, record blank
      for (const q of questions) {
        if (!answers[q.id]) {
          formattedAnswers.push({
            question_id: q.id,
            selected_option_id: ''
          });
        }
      }

      const res = await apiService.submitAssessment(assessmentId, studentId, formattedAnswers);
      setResult(res);
      if (onAssessmentComplete) {
        onAssessmentComplete();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const resetTest = () => {
    setAssessmentId(null);
    setQuestions([]);
    setCurrentIndex(0);
    setAnswers({});
    setResult(null);
    setError(null);
  };

  return {
    assessmentId,
    questions,
    currentIndex,
    currentQuestion: questions[currentIndex] || null,
    answers,
    result,
    loading,
    submitting,
    error,
    startTest,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    submitTest,
    resetTest
  };
}
