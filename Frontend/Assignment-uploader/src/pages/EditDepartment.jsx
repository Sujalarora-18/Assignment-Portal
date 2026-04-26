import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getDepartment, updateDepartment } from '../Api/departments';

export default function EditDepartment() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', type: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [globalMsg, setGlobalMsg] = useState('');
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setLoadError('');
      try {
        const res = await getDepartment(id);
        if (res && res.ok && res.department) {
          if (mounted) setForm({ name: res.department.name || '', type: res.department.type || '', address: res.department.address || '' });
        } else {
          setLoadError((res && res.message) || 'Department not found');
        }
      } catch (err) {
        console.error('Error loading dept', err);
        setLoadError(err?.message || 'Server error while loading department');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, [id]);

  function handleChange(e) { setForm(prev => ({ ...prev, [e.target.name]: e.target.value })); }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Department name is required';
    if (!['UG', 'PG', 'Research'].includes(form.type)) e.type = 'Select a valid program type';
    if (!form.address.trim()) e.address = 'Address is required';
    return e;
  }

  async function handleSubmit(ev) {
    ev.preventDefault();
    setGlobalMsg('');
    const e = validate();
    if (Object.keys(e).length) return setErrors(e);
    setErrors({});
    setSaving(true);
    try {
      const res = await updateDepartment(id, form);
      if (res && res.ok) {
        setGlobalMsg('Department updated successfully');
        setTimeout(() => navigate('/admin/departments'), 900);
      } else {
        setGlobalMsg(res.message || 'Update failed');
      }
    } catch (err) {
      console.error('Update error', err);
      if (err && err.errors) {
        const map = {};
        err.errors.forEach(x => { if (x.field) map[x.field] = x.msg; });
        setErrors(map);
      } else {
        setGlobalMsg(err.message || 'Server error');
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-lg font-bold text-gray-100">Loading department…</div>
    </div>
  );
  if (loadError) return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-2xl p-6 border-2 border-red-700">
        <div className="text-red-400 font-bold mb-4">Error loading department: {loadError}</div>
        <Link to="/admin/departments" className="btn-primary inline-block">Back to list</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Link to="/admin/departments" className="text-sm font-bold text-blue-400 hover:text-blue-300">← Back to Departments</Link>
        </div>
        <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 p-8">
          <h1 className="text-2xl font-extrabold text-gray-100 mb-6">Edit Department</h1>

          {globalMsg && <div className="mb-4 p-4 rounded-xl font-bold bg-emerald-900/50 text-emerald-300 border-2 border-emerald-500">{globalMsg}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1">Department Name</label>
              <input name="name" value={form.name} onChange={handleChange} className="input-strong" />
              {errors.name && <div className="text-red-400 font-bold text-sm mt-1">{errors.name}</div>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1">Program Type</label>
              <select name="type" value={form.type} onChange={handleChange} className="input-strong">
                <option value="">Select...</option>
                <option value="UG">UG</option>
                <option value="PG">PG</option>
                <option value="Research">Research</option>
              </select>
              {errors.type && <div className="text-red-400 font-bold text-sm mt-1">{errors.type}</div>}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-1">Address</label>
              <textarea name="address" value={form.address} onChange={handleChange} rows={4} className="input-strong" />
              {errors.address && <div className="text-red-400 font-bold text-sm mt-1">{errors.address}</div>}
            </div>

            <div className="flex gap-3">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => navigate('/admin/departments')} className="px-5 py-3 font-bold rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-700">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
