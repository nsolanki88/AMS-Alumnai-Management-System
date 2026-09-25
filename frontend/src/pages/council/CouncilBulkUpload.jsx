import React, { useState } from 'react';
import api from '../../services/api';
import { Upload, CheckCircle2, AlertTriangle, FileText, ArrowRight, RefreshCw, Trash2 } from 'lucide-react';

export default function CouncilBulkUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [mapping, setMapping] = useState({});
  const [editableRows, setEditableRows] = useState([]);

  // Import Results
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setPreviewData(null);
      setImportResult(null);
      setError('');
    }
  };

  const handleUploadAndPreview = async () => {
    if (!file) return;
    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/alumni-records/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.data?.success) {
        setPreviewData(res.data.data);
        setMapping(res.data.data.suggestedMapping || {});
        setEditableRows(res.data.data.allRows || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to parse file');
    } finally {
      setUploading(false);
    }
  };

  const handleDiscardRow = (index) => {
    setEditableRows(prev => prev.filter((_, i) => i !== index));
  };

  const handleExecuteImport = async () => {
    if (editableRows.length === 0) return;
    setImporting(true);
    setError('');
    setImportResult(null);

    try {
      const res = await api.post('/alumni-records/import', {
        rows: editableRows,
        columnMapping: mapping
      });
      if (res.data?.success) {
        setImportResult(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import records');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Bulk Alumni Registry Import & Deduplication
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Upload historical university alumni registries (CSV). The system maps columns, previews records, and detects duplicate roll numbers.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          {error}
        </div>
      )}

      {/* Step 1: File Upload */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Upload className="w-4 h-4 text-amber-600" />
          Step 1: Select Alumni Registry CSV File
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            className="block w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
          />
          <button
            onClick={handleUploadAndPreview}
            disabled={!file || uploading}
            className="w-full sm:w-auto px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all flex-shrink-0"
          >
            {uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
            {uploading ? 'Parsing CSV...' : 'Parse & Preview Rows'}
          </button>
        </div>
      </div>

      {/* Step 2: Column Mapping & Data Preview */}
      {previewData && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Step 2: Map Columns & Preview Rows ({editableRows.length} total rows)
            </h2>
            <button
              onClick={handleExecuteImport}
              disabled={importing || editableRows.length === 0}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all"
            >
              {importing ? 'Importing...' : 'Execute Import to Database'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Column Mapping Grid */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Column Header Mappings</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { key: 'fullName', label: 'Full Name *' },
                { key: 'rollNumber', label: 'Roll Number *' },
                { key: 'graduationYear', label: 'Graduation Year *' },
                { key: 'branch', label: 'Branch / Dept' },
                { key: 'contactEmail', label: 'Email' },
                { key: 'company', label: 'Company' },
                { key: 'jobRole', label: 'Job Role' },
                { key: 'cityCountry', label: 'Location' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">{label}</label>
                  <select
                    value={mapping[key] || ''}
                    onChange={(e) => setMapping({ ...mapping, [key]: e.target.value })}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 text-slate-800"
                  >
                    <option value="">-- Select Header --</option>
                    {previewData.headers.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Preview Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Roll Number</th>
                  <th className="p-3">Batch</th>
                  <th className="p-3">Branch</th>
                  <th className="p-3">Company</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {editableRows.slice(0, 10).map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="p-3 text-slate-400">{idx + 1}</td>
                    <td className="p-3 font-semibold text-slate-900">{row[mapping.fullName] || row.fullName || row.Name || row.name}</td>
                    <td className="p-3 text-slate-700 font-mono">{row[mapping.rollNumber] || row.rollNumber || row['Roll Number']}</td>
                    <td className="p-3 text-slate-600">{row[mapping.graduationYear] || row.graduationYear || row.Batch}</td>
                    <td className="p-3 text-slate-600">{row[mapping.branch] || row.branch || row.Branch}</td>
                    <td className="p-3 text-slate-600">{row[mapping.company] || row.company || row.Company}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDiscardRow(idx)}
                        className="text-red-500 hover:text-red-700 p-1"
                        title="Discard row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {editableRows.length > 10 && (
            <p className="text-[11px] text-slate-400 text-center">
              Showing first 10 rows for preview ({editableRows.length} records ready for import).
            </p>
          )}
        </div>
      )}

      {/* Step 3: Import Report & Duplicate Report */}
      {importResult && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            Import Execution Summary
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Processed</span>
              <p className="text-lg font-black text-slate-900">{importResult.totalProcessed}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-emerald-600 uppercase font-semibold">Successfully Imported</span>
              <p className="text-lg font-black text-emerald-700">{importResult.importedCount}</p>
            </div>
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
              <span className="text-[10px] text-amber-600 uppercase font-semibold">Duplicates Detected</span>
              <p className="text-lg font-black text-amber-700">{importResult.duplicatesCount}</p>
            </div>
            <div className="p-3 bg-red-50 rounded-xl border border-red-100">
              <span className="text-[10px] text-red-600 uppercase font-semibold">Invalid / Discarded</span>
              <p className="text-lg font-black text-red-700">{importResult.invalidCount}</p>
            </div>
          </div>

          {/* Duplicate Report Table */}
          {importResult.duplicateRecords && importResult.duplicateRecords.length > 0 && (
            <div className="pt-3">
              <h3 className="text-xs font-bold text-amber-900 mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                Duplicate Detection Report (Roll Number Conflicts)
              </h3>
              <div className="overflow-x-auto rounded-xl border border-amber-200">
                <table className="w-full text-left text-xs bg-amber-50/40">
                  <thead className="bg-amber-100/60 text-amber-900 font-bold text-[10px]">
                    <tr>
                      <th className="p-2.5">Row #</th>
                      <th className="p-2.5">Name</th>
                      <th className="p-2.5">Roll Number</th>
                      <th className="p-2.5">Conflict Detail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100">
                    {importResult.duplicateRecords.map((dup, i) => (
                      <tr key={i}>
                        <td className="p-2.5 font-bold text-amber-900">{dup.row}</td>
                        <td className="p-2.5 text-slate-800">{dup.fullName}</td>
                        <td className="p-2.5 font-mono text-slate-700">{dup.rollNumber}</td>
                        <td className="p-2.5 text-amber-800">{dup.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
