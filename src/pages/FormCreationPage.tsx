import { useState, useEffect } from 'react';
import { Trash2, Plus, GripVertical } from 'lucide-react';

interface FormField {
  id: string;
  name: string;
  label: string;
  type: 'TEXT' | 'EMAIL' | 'NUMBER' | 'DATE' | 'TEXTAREA' | 'SELECT' | 'CHECKBOX' | 'RADIO' | 'FILE' | 'PHONE' | 'URL' | 'DECIMAL';
  required: boolean;
  order: number;
  options?: string[];
  validation?: string;
}

const FIXED_FIELDS: FormField[] = [
  { id: 'fixed_name', name: 'name', label: 'Full Name', type: 'TEXT', required: true, order: 1 },
  { id: 'fixed_email', name: 'email', label: 'Email', type: 'EMAIL', required: true, order: 2 },
  { id: 'fixed_department', name: 'department', label: 'Department', type: 'SELECT', required: true, order: 3 },
  { id: 'fixed_role', name: 'role', label: 'Role', type: 'TEXT', required: true, order: 4 },
  { id: 'fixed_hire_date', name: 'hire_date', label: 'Hire Date', type: 'DATE', required: false, order: 5 },
  { id: 'fixed_status', name: 'status', label: 'Status', type: 'SELECT', required: false, order: 6 },
];

const FIELD_TYPES = [
  'TEXT',
  'EMAIL',
  'NUMBER',
  'DATE',
  'TEXTAREA',
  'SELECT',
  'CHECKBOX',
  'RADIO',
  'FILE',
  'PHONE',
  'URL',
  'DECIMAL',
];

export function FormCreationPage() {
  const [formName, setFormName] = useState('Employee Form');
  const [formDescription, setFormDescription] = useState('');
  const [customFields, setCustomFields] = useState<FormField[]>([]);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [expandedField, setExpandedField] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Load existing form on mount
  useEffect(() => {
    loadForm();
  }, []);

  const loadForm = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/forms/1/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFormName(data.form_name || 'Employee Form');
        setFormDescription(data.form_description || '');
        setCustomFields(data.fields || []);
      }
    } catch (err) {
      console.error('Error loading form:', err);
    } finally {
      setLoading(false);
    }
  };

  const allFields = [...FIXED_FIELDS, ...customFields].sort((a, b) => a.order - b.order);

  const addNewField = () => {
    const newField: FormField = {
      id: `field_${Date.now()}`,
      name: `field_${customFields.length + 1}`,
      label: `New Field`,
      type: 'TEXT',
      required: false,
      order: FIXED_FIELDS.length + customFields.length + 1,
    };
    setCustomFields([...customFields, newField]);
    setExpandedField(newField.id);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setCustomFields(customFields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    if (id.startsWith('fixed_')) {
      setError('Cannot delete fixed fields');
      return;
    }
    setCustomFields(customFields.filter(f => f.id !== id));
    setExpandedField(null);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) return;

    const draggedField = allFields.find(f => f.id === draggedId);
    const targetField = allFields.find(f => f.id === targetId);

    if (!draggedField || !targetField) return;

    const newFields = [...allFields];
    const draggedIndex = newFields.findIndex(f => f.id === draggedId);
    const targetIndex = newFields.findIndex(f => f.id === targetId);

    // Swap
    [newFields[draggedIndex], newFields[targetIndex]] = [newFields[targetIndex], newFields[draggedIndex]];

    // Update orders
    newFields.forEach((f, idx) => {
      f.order = idx + 1;
    });

    // Separate fixed and custom fields
    const updatedCustom = newFields.filter(f => !f.id.startsWith('fixed_'));
    setCustomFields(updatedCustom);
    setDraggedId(null);
  };

  const handleSaveForm = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const formData = {
        form_name: formName,
        form_description: formDescription,
        fields: customFields.map(f => ({
          id: f.id,
          name: f.name,
          label: f.label,
          type: f.type,
          required: f.required,
          order: f.order,
          options: f.options || [],
          validation: f.validation || '',
        })),
        is_active: true,
      };

      const response = await fetch('http://localhost:8000/api/forms/1/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save form');
      }

      setSuccess('Form updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Error saving form');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Loading form...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Form Configuration</h1>
      <p className="text-gray-600 mb-6">Customize the employee form by adding fields and adjusting their order.</p>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-800">Form Details</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Form Name</label>
              <input
                type="text"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g., Employee Form"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Describe this form's purpose"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              onClick={addNewField}
              className="w-full px-4 py-2 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition font-medium"
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Add Custom Field
            </button>

            <button
              onClick={handleSaveForm}
              disabled={saving}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Form Fields Preview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Form Fields (Drag to Reorder)</h2>

            <div className="space-y-2">
              {allFields.map((field) => (
                <div
                  key={field.id}
                  draggable={!field.id.startsWith('fixed_')}
                  onDragStart={(e) => handleDragStart(e, field.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, field.id)}
                  className={`border-2 rounded-lg p-4 transition ${
                    draggedId === field.id ? 'opacity-50 border-blue-400' : 'border-gray-200'
                  } ${field.id.startsWith('fixed_') ? 'bg-gray-50 cursor-not-allowed' : 'bg-white cursor-move hover:border-blue-300'}`}
                >
                  <div className="flex items-start gap-3">
                    {!field.id.startsWith('fixed_') && (
                      <GripVertical className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                    )}

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <button
                          onClick={() => setExpandedField(expandedField === field.id ? null : field.id)}
                          className="text-left flex-1"
                        >
                          <h3 className="font-semibold text-gray-800">{field.label}</h3>
                          <p className="text-xs text-gray-500">
                            {field.type} {field.required ? '(Required)' : '(Optional)'} {field.id.startsWith('fixed_') ? '(Fixed)' : '(Custom)'}
                          </p>
                        </button>
                        {!field.id.startsWith('fixed_') && (
                          <button
                            onClick={() => removeField(field.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Expanded Edit View */}
                      {expandedField === field.id && !field.id.startsWith('fixed_') && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Field Label</label>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) => updateField(field.id, { label: e.target.value })}
                              className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Field Name</label>
                            <input
                              type="text"
                              value={field.name}
                              onChange={(e) => updateField(field.id, { name: e.target.value })}
                              className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                              placeholder="field_name"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Field Type</label>
                            <select
                              value={field.type}
                              onChange={(e) => updateField(field.id, { type: e.target.value as any })}
                              className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                            >
                              {FIELD_TYPES.map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </div>

                          {(field.type === 'SELECT' || field.type === 'RADIO' || field.type === 'CHECKBOX') && (
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Options (comma separated)</label>
                              <input
                                type="text"
                                value={field.options?.join(', ') || ''}
                                onChange={(e) => updateField(field.id, { options: e.target.value.split(',').map(s => s.trim()) })}
                                className="w-full px-3 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                                placeholder="Option 1, Option 2, Option 3"
                              />
                            </div>
                          )}

                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={field.required}
                              onChange={(e) => updateField(field.id, { required: e.target.checked })}
                              className="rounded border-gray-300"
                            />
                            <span className="text-gray-700">Required Field</span>
                          </label>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
              <p className="font-semibold mb-2">Fixed Fields:</p>
              <p>These fields are always present and cannot be removed. You can reorder them with custom fields.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
