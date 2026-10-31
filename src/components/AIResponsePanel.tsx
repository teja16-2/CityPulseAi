import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Wrench,
  Megaphone,
  Radio,
  Send,
  Loader2,
  Cpu,
} from 'lucide-react';
import { Incident, AIRecommendation } from '../types';
import { api } from '../services/api';

interface AIResponsePanelProps {
  selectedIncident: Incident | null;
  onDispatchAction?: (actionText: string) => void;
}

export const AIResponsePanel: React.FC<AIResponsePanelProps> = ({
  selectedIncident,
  onDispatchAction,
}) => {
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});
  const [customQuestion, setCustomQuestion] = useState('');
  const [customAnswer, setCustomAnswer] = useState<string | null>(null);
  const [answeringQuestion, setAnsweringQuestion] = useState(false);
  const [dispatchedSuccess, setDispatchedSuccess] = useState(false);

  useEffect(() => {
    if (!selectedIncident) {
      setRecommendation(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setCompletedActions({});
    setCustomAnswer(null);
    setDispatchedSuccess(false);

    api.getAIRecommendation(selectedIncident).then((rec) => {
      if (isMounted) {
        setRecommendation(rec);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [selectedIncident?.id]);

  const toggleAction = (action: string) => {
    setCompletedActions((prev) => ({
      ...prev,
      [action]: !prev[action],
    }));
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuestion.trim() || !selectedIncident) return;

    setAnsweringQuestion(true);
    setTimeout(() => {
      // Dynamic situational response
      const q = customQuestion.toLowerCase();
      let answer = '';
      if (q.includes('eta') || q.includes('time') || q.includes('how long')) {
        answer = `Based on current traffic conditions along Pari Chowk corridor and team mobilization rates, estimated resolution time is ${selectedIncident.estimatedResolutionMinutes} minutes. Primary hydraulic and field equipment is already queued.`;
      } else if (q.includes('traffic') || q.includes('route') || q.includes('road')) {
        answer = `Traffic impact is calculated at Sector ${selectedIncident.location.sector}. Re-routing traffic through peripheral service lanes will prevent secondary congestion. Recommended detour: Knowledge Park II road.`;
      } else if (q.includes('cost') || q.includes('budget') || q.includes('resource')) {
        answer = `Standard municipal contingency allocation for ${selectedIncident.category} operations applies. Estimated materials & mobilization cost: ₹35,000 - ₹85,000 under Ward 14 maintenance quota.`;
      } else {
        answer = `AI Analysis for ${selectedIncident.title}: Coordinated dispatch with ${selectedIncident.department} is recommended. Ensure field personnel establish a 50m safety perimeter and cross-reference municipal utility schematics before digging.`;
      }

      setCustomAnswer(answer);
      setAnsweringQuestion(false);
      setCustomQuestion('');
    }, 600);
  };

  const handleExecuteDispatch = () => {
    if (!selectedIncident || !recommendation) return;
    setDispatchedSuccess(true);
    if (onDispatchAction) {
      onDispatchAction(
        `AI Automated Protocol dispatched for ${selectedIncident.id} to ${recommendation.recommendedDepartment}`
      );
    }
  };

  if (!selectedIncident) {
    return (
      <div className="bg-[#131F33] border border-[#1E2D4A] rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[360px]">
        <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-3">
          <Bot className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold text-[#F8FAFC]">AI City Assistant Standby</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">
          Select an incident from the Command Center table or City Map to review automated root-cause analysis, priority justification, and tactical dispatch recommendations.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#131F33] border border-[#1E2D4A] rounded-xl overflow-hidden flex flex-col shadow-xl">
      {/* Panel Header */}
      <div className="px-5 py-3.5 bg-[#0D1728] border-b border-[#1E2D4A] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-[#F8FAFC]">CityPulse AI Dispatch Assistant</h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-950 text-blue-400 border border-blue-800">
                Rule Engine + Gemini Ready
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Active incident: <span className="font-mono text-slate-200">{selectedIncident.id}</span>
            </p>
          </div>
        </div>

        {/* Simulated AI Notice */}
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 bg-[#131F33] px-2.5 py-1 rounded border border-[#1E2D4A]">
          <Cpu className="w-3 h-3 text-blue-400" />
          <span>Simulated AI Recommendations</span>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">
            Analyzing Greater Noida spatial telemetry and infrastructure schematics...
          </p>
        </div>
      ) : recommendation ? (
        <div className="p-5 space-y-4 overflow-y-auto max-h-[600px]">
          {/* Incident Summary Card */}
          <div className="bg-[#0D1728] border border-[#1E2D4A] rounded-lg p-3.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Incident Diagnostics Summary
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  recommendation.riskFactor === 'Severe'
                    ? 'bg-red-500/10 text-red-400 border-red-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}
              >
                Risk: {recommendation.riskFactor}
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">{recommendation.summary}</p>
          </div>

          {/* Priority Explanation */}
          <div className="bg-[#0D1728] border border-[#1E2D4A] rounded-lg p-3.5 space-y-1">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              Priority Justification & SLA Analysis
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {recommendation.priorityExplanation}
            </p>
          </div>

          {/* Recommended Department */}
          <div className="bg-[#0D1728] border border-[#1E2D4A] rounded-lg p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-900/30 border border-blue-700/50 flex items-center justify-center text-blue-400">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">
                  Recommended Primary Department
                </span>
                <span className="text-xs font-bold text-[#F8FAFC]">
                  {recommendation.recommendedDepartment}
                </span>
              </div>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
              High Department Match (98%)
            </span>
          </div>

          {/* Suggested Response Actions Checklist */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Recommended Tactical Action Sequence
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Check to acknowledge steps
              </span>
            </div>
            <div className="space-y-2">
              {(recommendation.suggestedActions || []).map((action, idx) => {
                const isDone = completedActions[action];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleAction(action)}
                    className={`p-2.5 rounded-lg border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isDone
                        ? 'bg-emerald-950/30 border-emerald-800/50 text-slate-300'
                        : 'bg-[#0D1728] border-[#1E2D4A] text-slate-200 hover:border-blue-500/50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center shrink-0 border transition-colors ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-400 text-black'
                          : 'border-slate-500 bg-[#131F33]'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="w-3.5 h-3.5" />}
                    </div>
                    <span className={`text-xs leading-relaxed ${isDone ? 'line-through text-slate-400' : ''}`}>
                      {action}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recommended Next Steps */}
          <div className="bg-[#0D1728] border border-[#1E2D4A] rounded-lg p-3.5 space-y-2">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
              Follow-up Protocol & Invariants
            </span>
            <ul className="space-y-1.5 pl-1">
              {(recommendation.recommendedNextSteps || []).map((step, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="text-blue-400 font-mono text-[11px] shrink-0">0{idx + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Required Equipment */}
          {(recommendation.equipmentNeeded || []).length > 0 && (
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                <Wrench className="w-3 h-3" /> Equipment Queued:
              </span>
              {(recommendation.equipmentNeeded || []).map((eq, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0D1728] border border-[#1E2D4A] text-slate-300"
                >
                  {eq}
                </span>
              ))}
            </div>
          )}

          {/* Citizen Advisory Notice */}
          {recommendation.citizenAdvisoryNotice && (
            <div className="bg-blue-950/30 border border-blue-800/40 rounded-lg p-3 flex items-start gap-2.5">
              <Megaphone className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-blue-300 block">Citizen Advisory Notice</span>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                  {recommendation.citizenAdvisoryNotice}
                </p>
              </div>
            </div>
          )}

          {/* Interactive Inquiries / Ask AI input */}
          <div className="pt-2 border-t border-[#1E2D4A]/60 space-y-2">
            <span className="text-xs font-bold text-slate-300 block">Operator Inquiry to AI</span>
            <form onSubmit={handleAskQuestion} className="flex gap-2">
              <input
                type="text"
                value={customQuestion}
                onChange={(e) => setCustomQuestion(e.target.value)}
                placeholder="Ask about ETA, detour routes, equipment availability..."
                className="flex-1 bg-[#0D1728] border border-[#1E2D4A] rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={answeringQuestion || !customQuestion.trim()}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                {answeringQuestion ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Ask</span>
              </button>
            </form>

            {customAnswer && (
              <div className="p-3 bg-[#0D1728] border border-blue-900/50 rounded-lg text-xs text-slate-200 leading-relaxed animate-in fade-in">
                <span className="font-semibold text-blue-400 block mb-1">AI Assistant Response:</span>
                {customAnswer}
              </div>
            )}
          </div>

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              onClick={handleExecuteDispatch}
              disabled={dispatchedSuccess}
              className={`w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                dispatchedSuccess
                  ? 'bg-emerald-600 text-white cursor-default'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30'
              }`}
            >
              {dispatchedSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>AI Tactical Sequence Dispatched to Department</span>
                </>
              ) : (
                <>
                  <Radio className="w-4 h-4" />
                  <span>Authorize & Transmit AI Dispatch Checklist</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
