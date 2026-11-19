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
  Edit2,
  KeyRound,
  Info,
} from 'lucide-react';
import { StaffUser, UserRole } from '../../types';
import {
  getStaffUsers,
  createStaffUser,
  updateStaffUser,
  deleteStaffUser,
  resetStaffPassword,
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
  const [successToast, setSuccessToast] = useState('');

  // Add Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('technician');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Edit Modal State
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null);
  const [editDisplayName, setEditDisplayName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('technician');
  const [editPassword, setEditPassword] = useState('');
  const [editActive, setEditActive] = useState(true);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState('');

  // Delete Modal State
  const [deleteConfirmStaff, setDeleteConfirmStaff] = useState<StaffUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Reset Password State
  const [resettingUid, setResettingUid] = useState<string | null>(null);

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
      setSuccessToast(`Staff account created successfully for "${displayName.trim()}".`);
      setTimeout(() => setSuccessToast(''), 4000);
      await loadStaff();
    } catch (err: any) {
      console.error('Failed to create staff user:', err);
      setError(err?.message || 'Failed to create staff account.');
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (staff: StaffUser) => {
    setEditingStaff(staff);
    setEditDisplayName(staff.displayName);
    setEditEmail(staff.email);
    setEditPhone(staff.phone || '');
    setEditRole(staff.role);
    setEditPassword('');
    setEditActive(staff.active);
    setEditError('');
  };

  const handleUpdateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff) return;
    if (!editDisplayName.trim() || !editEmail.trim()) {
      setEditError('Name and email cannot be blank.');
      return;
    }

    setSavingEdit(true);
    setEditError('');
    try {
      await updateStaffUser(editingStaff.uid, {
        displayName: editDisplayName.trim(),
        email: editEmail.trim().toLowerCase(),
        phone: editPhone.trim() || undefined,
        role: editRole,
        active: editActive,
        password: editPassword.trim() || undefined,
      });

      setSuccessToast(`Staff profile for "${editDisplayName.trim()}" updated successfully.`);
      setTimeout(() => setSuccessToast(''), 4000);
      setEditingStaff(null);
      await loadStaff();
    } catch (err: any) {
      console.error('Failed to update staff user:', err);
      setEditError(err?.message || 'Failed to update staff user.');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleResetPassword = async (staff: StaffUser) => {
    if (!confirm(`Reset password for "${staff.displayName}" to default (Debasish@2026)?`)) {
      return;
    }

    setResettingUid(staff.uid);
    try {
      const res = await resetStaffPassword(staff.email);
      if (res.success) {
        setSuccessToast(`Password for ${staff.displayName} reset to default (Debasish@2026).`);
        setTimeout(() => setSuccessToast(''), 4000);
      } else {
        alert(res.error || 'Failed to reset password.');
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to reset password.');
    } finally {
      setResettingUid(null);
    }
  };

  const toggleStaffActive = async (uid: string, currentActive: boolean) => {
    if (uid === 'owner_debasish') {
      alert('Cannot deactivate primary owner account.');
      return;
    }
    try {
      await updateStaffUser(uid, { active: !currentActive });
      setSuccessToast(`Staff status updated.`);
      setTimeout(() => setSuccessToast(''), 3000);
      await loadStaff();
    } catch (err: any) {
      alert(err?.message || 'Failed to update staff status.');
    }
  };

  const handleDeleteStaff = async () => {
    if (!deleteConfirmStaff) return;
    if (deleteConfirmStaff.uid === 'owner_debasish') {
      alert('Cannot delete primary owner account.');
      return;
    }

    setDeleting(true);
    try {
      await deleteStaffUser(deleteConfirmStaff.uid);
      setSuccessToast(`Deleted staff account for "${deleteConfirmStaff.displayName}".`);
      setTimeout(() => setSuccessToast(''), 4000);
      setDeleteConfirmStaff(null);
      await loadStaff();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete staff member.');
    } finally {
      setDeleting(false);
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
            Manage authenticated workshop technicians, managers, and owner credentials in PostgreSQL.
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

      {successToast && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-800 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-bold">{successToast}</span>
        </div>
      )}

      {/* Role Explanation Card */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-xs text-xs grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-3 rounded-xl bg-orange-50/70 border border-orange-200/80 space-y-1">
          <div className="font-bold text-brand-orange flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
            <Shield className="w-3.5 h-3.5" />
            <span>Owner Role</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Full control: Edit & delete stock, manage staff, view wholesale costs, reports, and shop settings.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200/80 space-y-1">
          <div className="font-bold text-purple-700 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Manager Role</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Operational access: Repair jobs, counter billing, estimates, warranties, customer CRM, and reports.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200/80 space-y-1">
          <div className="font-bold text-blue-700 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Technician Role</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Workbench access: Intake repairs, assign jobs, update status, adjust parts inventory, counter bills.
          </p>
        </div>
      </div>

      {/* Staff Accounts List */}
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
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-bold text-sm text-brand-navy">
                    {staff.displayName}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                      staff.role === 'owner'
                        ? 'bg-brand-orange-light text-brand-orange border border-brand-orange/30'
                        : staff.role === 'manager'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}
                  >
                    {staff.role}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      staff.active
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {staff.active ? 'Active' : 'Disabled'}
                  </span>
                  {staff.uid === 'owner_debasish' && (
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Primary Shop Owner
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-brand-secondary text-[11px]">
                  <span className="flex items-center gap-1 text-slate-700 font-medium">
                    <Mail className="w-3.5 h-3.5 text-brand-orange" />
                    <span>{staff.email}</span>
                  </span>
                  {staff.phone && (
                    <>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{staff.phone}</span>
                      </span>
                    </>
                  )}
                  <span>&bull;</span>
                  <span>Registered: {formatDate(staff.createdAt)}</span>
                  {staff.lastLoginAt && (
                    <>
                      <span>&bull;</span>
                      <span className="text-emerald-700">Last active: {formatDate(staff.lastLoginAt)}</span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                {/* Edit Staff Button */}
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-brand-navy border border-slate-300"
                  leftIcon={<Edit2 className="w-3.5 h-3.5 text-blue-600" />}
                  onClick={() => openEditModal(staff)}
                >
                  Edit Profile
                </Button>

                {staff.uid !== 'owner_debasish' && (
                  <>
                    {/* Reset Password Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-slate-700 hover:bg-slate-50"
                      leftIcon={<KeyRound className="w-3.5 h-3.5 text-brand-orange" />}
                      isLoading={resettingUid === staff.uid}
                      onClick={() => handleResetPassword(staff)}
                      title="Reset password to default (Debasish@2026)"
                    >
                      Reset Pass
                    </Button>

                    {/* Toggle Active Button */}
                    <Button
                      size="sm"
                      variant={staff.active ? 'outline' : 'secondary'}
                      className="text-xs"
                      onClick={() => toggleStaffActive(staff.uid, staff.active)}
                    >
                      {staff.active ? 'Deactivate' : 'Reactivate'}
                    </Button>

                    {/* Delete Staff Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs text-rose-600 hover:bg-rose-50 border-rose-200"
                      leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                      onClick={() => setDeleteConfirmStaff(staff)}
                      title="Permanently remove staff account"
                    >
                      Delete
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Staff Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Staff Member"
        description="Provision authorized workshop access to the repair shop CRM in PostgreSQL."
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
            label="Account Password"
            type="password"
            placeholder="Default: Debasish@2026"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="Leave blank to use default workshop password (Debasish@2026)"
          />

          <Select
            label="System Role *"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
          >
            <option value="technician">Technician (Workbench repair jobs, status & counter intake)</option>
            <option value="manager">Manager (Repairs, Invoices, Billing, Estimates & Reports)</option>
            <option value="owner">Owner (Full administrative rights, staff & settings)</option>
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

      {/* Edit Staff Modal */}
      {editingStaff && (
        <Modal
          isOpen={!!editingStaff}
          onClose={() => setEditingStaff(null)}
          title={`Edit Staff: ${editingStaff.displayName}`}
          description="Update staff profile, contact number, role permissions, or password."
        >
          <form onSubmit={handleUpdateStaff} className="space-y-4">
            {editError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{editError}</span>
              </div>
            )}

            <Input
              label="Staff Full Name *"
              required
              value={editDisplayName}
              onChange={(e) => setEditDisplayName(e.target.value)}
            />

            <Input
              label="Login Email Address *"
              type="email"
              required
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
            />

            <Input
              label="Phone Number"
              placeholder="10-digit mobile number"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
            />

            {editingStaff.uid !== 'owner_debasish' ? (
              <Select
                label="System Role *"
                value={editRole}
                onChange={(e) => setEditRole(e.target.value as UserRole)}
              >
                <option value="technician">Technician (Workbench access only)</option>
                <option value="manager">Manager (Repairs, Invoices & Reports)</option>
                <option value="owner">Owner (Full administrative rights)</option>
              </Select>
            ) : (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                <strong>System Role:</strong> Owner (Primary Administrator &mdash; Cannot change)
              </div>
            )}

            <Input
              label="Set New Password (Optional)"
              type="password"
              placeholder="Leave empty to keep existing password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              helperText="Only fill if you want to reset or update this staff member's password."
            />

            {editingStaff.uid !== 'owner_debasish' && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-brand-navy block">Account Status</span>
                  <span className="text-[11px] text-slate-500">Allow this user to sign in to the CRM</span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={editActive ? 'primary' : 'outline'}
                  onClick={() => setEditActive(!editActive)}
                >
                  {editActive ? 'Active' : 'Disabled'}
                </Button>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={() => setEditingStaff(null)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={savingEdit}>
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Staff Confirmation Modal */}
      {deleteConfirmStaff && (
        <Modal
          isOpen={!!deleteConfirmStaff}
          onClose={() => setDeleteConfirmStaff(null)}
          title="Delete Staff Member"
          description="Confirm permanent removal of this staff account."
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-rose-900 text-sm">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Permanently delete staff member "{deleteConfirmStaff.displayName}"?</span>
              </div>
              <p>
                Email: <strong className="text-brand-navy">{deleteConfirmStaff.email}</strong> &bull; Role: <strong className="uppercase text-brand-navy">{deleteConfirmStaff.role}</strong>
              </p>
              <p className="text-rose-700">
                This account will be permanently removed from PostgreSQL and will no longer be able to sign in.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteConfirmStaff(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                className="bg-rose-600 hover:bg-rose-700 text-white"
                isLoading={deleting}
                onClick={handleDeleteStaff}
              >
                Yes, Delete Account
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
