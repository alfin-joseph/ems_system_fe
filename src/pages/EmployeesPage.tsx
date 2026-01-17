import { useEffect, useState } from 'react';
import { Trash2, Edit2, X } from 'lucide-react';
import { employeeAPI } from '../api/client';

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
  role: string;
  status: string;
  hire_date?: string;
}

interface FormField {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  order: number;
  options?: string[];
}

export function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchEmployees();
    loadFormFields();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const response = await employeeAPI.getAll();
      setEmployees(response.data);
      setError('');
    } catch (err: any) {
      setError('Failed to load employees');
      console.error(err);
      // Use sample data on error
      setEmployees([
        { id: 1, name: 'John Doe', email: 'john@example.com', department: 'Engineering', role: 'Developer', status: 'ACTIVE' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', department: 'HR', role: 'Manager', status: 'ACTIVE' },
        { id: 3, name: 'Mike Johnson', email: 'mike@example.com', department: 'Sales', role: 'Sales Rep', status: 'INACTIVE' },
        { id: 4, name: 'Sarah Williams', email: 'sarah@example.com', department: 'Engineering', role: 'Senior Developer', status: 'ACTIVE' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadFormFields = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/forms/1/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const allFields = [...getFixedFields(), ...(data.fields || [])];
        setFormFields(allFields.sort((a, b) => a.order - b.order));
        // Initialize form data
        const initialData: Record<string, any> = {};
        allFields.forEach(field => {
          initialData[field.name] = '';
        });
        setFormData(initialData);
      }
    } catch (err) {
      console.error('Error loading form fields:', err);
    }
  };

  const getFixedFields = (): FormField[] => [
    { id: 'fixed_name', name: 'name', label: 'Full Name', type: 'TEXT', required: true, order: 1 },
    { id: 'fixed_email', name: 'email', label: 'Email', type: 'EMAIL', required: true, order: 2 },
    { id: 'fixed_department', name: 'department', label: 'Department', type: 'SELECT', required: true, order: 3, options: ['HR', 'IT', 'SALES', 'MARKETING', 'FINANCE', 'OPERATIONS', 'OTHER'] },
    { id: 'fixed_role', name: 'role', label: 'Role', type: 'TEXT', required: true, order: 4 },
    { id: 'fixed_hire_date', name: 'hire_date', label: 'Hire Date', type: 'DATE', required: false, order: 5 },
    { id: 'fixed_status', name: 'status', label: 'Status', type: 'SELECT', required: false, order: 6, options: ['ACTIVE', 'INACTIVE', 'LEAVE'] },
  ];

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleDeleteEmployee = async (id: number) => {
  const confirmDelete = window.confirm('Are you sure you want to delete this employee?');
  if (!confirmDelete) return;

  try {
    await employeeAPI.delete(id);
    setEmployees(prev => prev.filter(emp => emp.id !== id));
  } catch (err) {
    console.error(err);
    alert('Failed to delete employee');
  }
};

const handleEditEmployee = (employee: Employee) => {
  setEditingEmployee(employee);
  setShowAddModal(true);

  const populatedData: Record<string, any> = {};
  formFields.forEach(field => {
    populatedData[field.name] = (employee as any)[field.name] ?? '';
  });
  setFormData(populatedData);
};

 const handleSubmitEmployee = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);
  setSubmitError('');
  setSubmitSuccess('');

  try {
    const emptyRequired = formFields.filter(
      field => field.required && !formData[field.name]
    );

    if (emptyRequired.length > 0) {
      setSubmitError(`Required fields: ${emptyRequired.map(f => f.label).join(', ')}`);
      setSubmitting(false);
      return;
    }

    let response: { data: Employee };
    let savedEmployee: Employee;

    if (editingEmployee) {
      // UPDATE
      response = await employeeAPI.update(editingEmployee.id, formData);
      savedEmployee = response.data;

      setEmployees(prev =>
        prev.map(emp =>
          emp.id === editingEmployee.id ? savedEmployee : emp
        )
      );
      setSubmitSuccess('Employee updated successfully!');
    } else {
      // CREATE
      response = await employeeAPI.create(formData);
      savedEmployee = response.data;

      setEmployees(prev => [...prev, savedEmployee]);
      setSubmitSuccess('Employee added successfully!');
    }

    setTimeout(() => {
      setShowAddModal(false);
      setEditingEmployee(null);
      setSubmitSuccess('');
    }, 1200);

  } catch (err: any) {
    setSubmitError(err?.message || 'Error saving employee');
    console.error(err);
  } finally {
    setSubmitting(false);
  }
};


const filteredEmployees = employees.filter(emp => {
  const matchesSearch =
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesDepartment =
    !departmentFilter || emp.department === departmentFilter;

  const matchesStatus =
    !statusFilter || emp.status === statusFilter;

  return matchesSearch && matchesDepartment && matchesStatus;
});


  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Employees</h1>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
        >
          + Add Employee
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
        {/* Filters */}
<div className="mb-4 bg-white p-4 rounded-lg shadow">
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

    {/* Search */}
    <input
      type="text"
      placeholder="Search name or email..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    />

    {/* Department */}
    <select
      value={departmentFilter}
      onChange={(e) => setDepartmentFilter(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    >
      <option value="">All Departments</option>
      <option value="HR">HR</option>
      <option value="IT">IT</option>
      <option value="SALES">Sales</option>
      <option value="MARKETING">Marketing</option>
      <option value="FINANCE">Finance</option>
    </select>

    {/* Status */}
    <select
      value={statusFilter}
      onChange={(e) => setStatusFilter(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
    >
      <option value="">All Status</option>
      <option value="ACTIVE">Active</option>
      <option value="INACTIVE">Inactive</option>
      <option value="LEAVE">Leave</option>
    </select>

    {/* Clear */}
    <button
      onClick={() => {
        setSearchTerm('');
        setDepartmentFilter('');
        setStatusFilter('');
      }}
      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
    >
      Clear Filters
    </button>
  </div>
</div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Department</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Role</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">{emp.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{emp.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{emp.department}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{emp.role}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        emp.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm flex gap-2">
                      <button onClick={() => handleEditEmployee(emp)} className="p-2 text-blue-600 hover:bg-blue-50 rounded transition">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteEmployee(emp.id)} className="p-2 text-red-600 hover:bg-red-50 rounded transition">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredEmployees.map((emp) => (
              <div key={emp.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800">{emp.name}</h3>
                    <p className="text-sm text-gray-500">{emp.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    emp.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {emp.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1"><strong>Department:</strong> {emp.department}</p>
                <p className="text-sm text-gray-600 mb-3"><strong>Role:</strong> {emp.role}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleEditEmployee(emp)} className="flex-1 p-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition text-sm font-medium">
                    Edit
                  </button>
                  <button onClick={() => handleDeleteEmployee(emp.id)} className="flex-1 p-2 text-red-600 border border-red-600 rounded hover:bg-red-50 transition text-sm font-medium">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add Employee Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">
                   {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmitEmployee} className="p-6 space-y-4">
              {submitError && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                  {submitError}
                </div>
              )}

              {submitSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
                  {submitSuccess}
                </div>
              )}

              {/* Dynamic Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formFields.map((field) => (
                  <div
                    key={field.id}
                    className={field.type === 'TEXTAREA' ? 'md:col-span-2' : ''}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-600">*</span>}
                    </label>

                    {field.type === 'TEXT' || field.type === 'EMAIL' || field.type === 'PHONE' || field.type === 'URL' ? (
                      <input
                        type={field.type === 'EMAIL' ? 'email' : field.type === 'PHONE' ? 'tel' : field.type === 'URL' ? 'url' : 'text'}
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        required={field.required}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : field.type === 'NUMBER' || field.type === 'DECIMAL' ? (
                      <input
                        type="number"
                        step={field.type === 'DECIMAL' ? '0.01' : '1'}
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        required={field.required}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : field.type === 'DATE' ? (
                      <input
                        type="date"
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        required={field.required}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : field.type === 'SELECT' ? (
                      <select
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        required={field.required}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">Select {field.label}</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.type === 'TEXTAREA' ? (
                      <textarea
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleInputChange(field.name, e.target.value)}
                        required={field.required}
                        placeholder={`Enter ${field.label.toLowerCase()}`}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : field.type === 'CHECKBOX' ? (
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          name={field.name}
                          checked={formData[field.name] || false}
                          onChange={(e) => handleInputChange(field.name, e.target.checked)}
                          className="w-4 h-4 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{field.label}</span>
                      </label>
                    ) : field.type === 'RADIO' ? (
                      <div className="space-y-2">
                        {field.options?.map((option) => (
                          <label key={option} className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={field.name}
                              value={option}
                              checked={formData[field.name] === option}
                              onChange={(e) => handleInputChange(field.name, e.target.value)}
                              className="w-4 h-4 border border-gray-300 focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    ) : field.type === 'FILE' ? (
                      <input
                        type="file"
                        name={field.name}
                        onChange={(e) => handleInputChange(field.name, e.target.files?.[0])}
                        required={field.required}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    ) : null}
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="flex gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium disabled:opacity-50"
                >
                  {submitting
                    ? 'Saving...'
                    : editingEmployee
                    ? 'Update Employee'
                    : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
