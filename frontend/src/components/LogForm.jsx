import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateField, resetInteraction } from '../store/interactionSlice';
import axios from 'axios';

const INTERACTION_TYPES = ['Meeting', 'Virtual Call', 'Email', 'Phone', 'Conference', 'In-Person'];

const AI_SUGGESTED_FOLLOWUPS = [
  'Schedule follow-up meeting in 2 weeks',
  'Send product efficacy brochure PDF',
  'Add HCP to advisory board invite list',
];

const LogForm = () => {
  const dispatch = useDispatch();
  const interaction = useSelector((state) => state.interaction.activeInteraction);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [hcpName, setHcpName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0,5));
  const [attendees, setAttendees] = useState('');
  const [topicsDiscussed, setTopicsDiscussed] = useState('');
  const [outcomes, setOutcomes] = useState('');
  const [materialsShared] = useState([]);
  const [samplesDistributed] = useState([]);

  const handleChange = (e) => {
    dispatch(updateField({ field: e.target.name, value: e.target.value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = {
        ...interaction,
        notes: topicsDiscussed,
        action_items: outcomes,
      };
      if (interaction.id) {
        await axios.put(`http://localhost:8000/api/interactions/${interaction.id}`, payload);
      } else {
        const res = await axios.post('http://localhost:8000/api/interactions', payload);
        dispatch(updateField({ field: 'id', value: res.data.id }));
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      alert('Failed to save. Ensure backend is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">Interaction Details</div>
      <div className="card-body">

        {/* Row 1: HCP Name + Interaction Type */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">HCP Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search or select HCP..."
              value={hcpName}
              onChange={(e) => setHcpName(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Interaction Type</label>
            <select
              name="interaction_type"
              className="form-control"
              value={interaction.interaction_type}
              onChange={handleChange}
            >
              {INTERACTION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>

        {/* Row 2: Date + Time */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-control"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Time</label>
            <input
              type="time"
              className="form-control"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        {/* Attendees */}
        <div className="form-group">
          <label className="form-label">Attendees</label>
          <input
            type="text"
            className="form-control"
            placeholder="Enter names or search..."
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
          />
        </div>

        {/* Topics Discussed */}
        <div className="form-group">
          <label className="form-label">Topics Discussed</label>
          <textarea
            className="form-control"
            placeholder="Enter key discussion points..."
            value={topicsDiscussed}
            onChange={(e) => setTopicsDiscussed(e.target.value)}
            style={{ minHeight: '90px' }}
          />
          <button className="voice-btn">
            🎙️ Summarize from Voice Note (Requires Consent)
          </button>
        </div>

        {/* Materials Shared / Samples */}
        <div className="form-group">
          <label className="form-label" style={{ marginBottom: '8px' }}>Materials Shared / Samples Distributed</label>
          <div className="materials-section">
            <div className="material-block">
              <div className="material-row">
                <span className="material-name">Materials Shared</span>
                <button className="btn-sm">🔍 Search/Add</button>
              </div>
              <p className="material-empty">
                {materialsShared.length === 0 ? 'No materials added.' : materialsShared.join(', ')}
              </p>
            </div>
            <div className="material-block">
              <div className="material-row">
                <span className="material-name">Samples Distributed</span>
                <button className="btn-sm">⚙️ Add Sample</button>
              </div>
              <p className="material-empty">
                {samplesDistributed.length === 0 ? 'No samples added.' : samplesDistributed.join(', ')}
              </p>
            </div>
          </div>
        </div>

        {/* Sentiment */}
        <div className="form-group">
          <label className="form-label">Observed/Inferred HCP Sentiment</label>
          <div className="sentiment-group">
            {['Positive', 'Neutral', 'Negative'].map(s => (
              <label key={s} className={`sentiment-option ${s.toLowerCase()}`}>
                <input
                  type="radio"
                  name="sentiment"
                  value={s}
                  checked={interaction.sentiment === s}
                  onChange={handleChange}
                />
                {s}
              </label>
            ))}
          </div>
        </div>

        {/* Outcomes */}
        <div className="form-group">
          <label className="form-label">Outcomes</label>
          <textarea
            className="form-control"
            placeholder="Key outcomes or agreements..."
            value={outcomes}
            onChange={(e) => setOutcomes(e.target.value)}
            style={{ minHeight: '72px' }}
          />
        </div>

        {/* Follow-up Actions */}
        <div className="form-group">
          <label className="form-label">Follow-up Actions</label>
          <textarea
            name="action_items"
            className="form-control"
            placeholder="Enter next steps or tasks..."
            value={interaction.action_items}
            onChange={handleChange}
            style={{ minHeight: '72px' }}
          />
          {/* AI Suggested Follow-ups */}
          <div className="ai-suggestions">
            <div className="ai-suggestions-title">AI Suggested Follow-ups:</div>
            <ul>
              {AI_SUGGESTED_FOLLOWUPS.map((s, i) => (
                <li key={i} onClick={() => dispatch(updateField({ field: 'action_items', value: interaction.action_items ? interaction.action_items + '\n• ' + s : '• ' + s }))}>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary" onClick={handleSave} disabled={loading}>
            {loading ? 'Saving...' : saved ? '✓ Saved!' : '💾 Log Interaction'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default LogForm;
