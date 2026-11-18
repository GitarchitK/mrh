import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  PlusCircle,
  Shield,
  Phone,
  Mail,
  UserX,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Lock,
} from 'lucide-react';
import { StaffUser, UserRole } from '../../types';
import {
  getStaffUsers,
  createStaffUser,
  updateStaffUser,
  deleteStaffUser,
} from '../../services/db';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../lib/utils';

export const StaffPage: React.FC = () => {
  const { currentUser, isOwner } = useAuth();

  const [staffList, setStaffList] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('technician');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadStaff = async () => {
    setLoading(true);
    try {
      const list = await getStaffUsers();
      setStaffList(list);
    } catch (err) {
      console.error('Failed to load staff list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !email.trim()) {
      setError('Please fill out name and email.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await createStaffUser({
        email: email.trim().toLowerCase(),
        displayName: displayName.trim(),
        role,
        phone: phone.trim() || undefined,
        password: password.trim() || undefined,
      });

      setModalOpen(false);
      setDisplayName('');
      setEmail('');
      setPhone('');
      setPassword('');
      await loadStaff();
    } catch (err: any) {
      console.error('Failed to create staff user:', err);
      setError(err?.message || 'Failed to create staff account.');
    } finally {
      setSaving(false);
    }
  };

  const toggleStaffActive = async (uid: string, currentActive: boolean) => {
    if (uid === 'owner_debasish') {
      alert('Cannot deactivate primary owner account.');
      return;
    }
    try {
      await updateStaffUser(uid, { active: !currentActive });
      await loadStaff();
    } catch (err: any) {
      alert(err?.message || 'Failed to update staff status.');
    }
  };

  const handleDeleteStaff = async (uid: string, name: string) => {
    if (uid === 'owner_debasish') {
      alert('Cannot delete primary owner account.');
      return;
    }
    if (!confirm(`Are you sure you want to permanently delete staff account for "${name}"?`)) {
      return;
    }
    try {
      await deleteStaffUser(uid);
      await loadStaff();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete staff member.');
    }
  };

  if (!isOwner) {
    return (
      <div className="p-12 text-center text-xs text-brand-secondary bg-white rounded-2xl border border-brand-border">
        Access restricted. Only the business owner (Debasish) can manage staff accounts.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-brand-navy tracking-tight">
            Staff & Role Permissions
          </h1>
          <p className="text-xs text-brand-secondary mt-0.5">
            Manage authenticated workshop access, technicians, and managerial roles in PostgreSQL.
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
          onClick={() => {
            setError('');
            setModalOpen(true);
          }}
        >
          Add Staff Member
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-brand-border shadow-xs overflow-hidden divide-y divide-brand-border text-xs">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-orange mx-auto" />
            <p className="text-xs text-slate-500 mt-2">Connecting to staff database...</p>
          </div>
        ) : staffList.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No staff records found in database.
          </div>
        ) : (
          staffList.map((staff) => (
            <div
              key={staff.uid}
              className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-brand-light/40 transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-sm text-brand-navy">
                    {staff.displayName}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      staff.role === 'owner'
                        ? 'bg-brand-orange-light text-brand-orange border border-brand-orange/30'
                        : staff.role === 'manager'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {staff.role}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      staff.active
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {staff.active ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-brand-secondary text-[11px]">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{staff.email}</span>
                  </span>
                  {staff.phone && (
                    <>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{staff.phone}</span>
                      </span>
                    </>
                  )}
                  <span>&bull;</span>
                  <span>Registered: {formatDate(staff.createdAt)}</span>
                </div>
              </div>

              {staff.uid !== 'owner_debasish' && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={staff.active ? 'outline' : 'secondary'}
                    className="text-xs"
                    onClick={() => toggleStaffActive(staff.uid, staff.active)}
                  >
                    {staff.active ? 'Deactivate Access' : 'Reactivate Access'}
                  </Button>
                  {!staff.active && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                      onClick={() => handleDeleteStaff(staff.uid, staff.displayName)}
                    >
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Staff Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Staff Member"
        description="Provision authorized access to the repair shop CRM in PostgreSQL."
      >
        <form onSubmit={handleCreateStaff} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <Input
            label="Staff Full Name *"
            required
            placeholder="e.g. Subir Karmakar"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />

          <Input
            label="Login Email Address *"
            type="email"
            required
            placeholder="name@mobilerepairinghouse.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Phone Number"
            placeholder="10-digit mobile number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <Input
            label="Initial Account Password"
            type="password"
            placeholder="Default: Debasish@2026"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="Leave blank to use default password (Debasish@2026)"
          />

          <Select
            label="System Role *"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
          >
            <option value="technician">Technician (Workbench access only)</option>
            <option value="manager">Manager (Repairs, Invoices & Reports)</option>
            <option value="owner">Owner (Full administrative rights)</option>
          </Select>

          <div className="pt-2 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={saving}>
              Provision Staff Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
