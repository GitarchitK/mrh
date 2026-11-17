import React, { useState } from 'react';
import {
  UserCheck,
  PlusCircle,
  Shield,
  Phone,
  Mail,
  UserX,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { StaffUser, UserRole } from '../../types';
import { Button } from '../../components/ui/Button';
import { Input, Select } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { formatDate } from '../../lib/utils';

export const StaffPage: React.FC = () => {
  const { currentUser, isOwner } = useAuth();

  const [staffList, setStaffList] = useState<StaffUser[]>([
    {
      uid: 'owner_debasish',
      email: 'debasish@mobilerepairinghouse.in',
      displayName: 'Debasish',
      role: 'owner',
      phone: '+91 97327 89938',
      active: true,
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      uid: 'tech_counter',
      email: 'technician@mobilerepairinghouse.in',
      displayName: 'Workshop Technician',
      role: 'technician',
      phone: '+91 97327 89938',
      active: true,
      createdAt: '2026-02-15T00:00:00Z',
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('technician');

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || !email.trim()) {
      alert('Please fill out name and email.');
      return;
    }

    const newStaff: StaffUser = {
      uid: `staff_${Date.now()}`,
      email: email.trim(),
      displayName: displayName.trim(),
      role,
      phone: phone.trim() || undefined,
      active: true,
      createdAt: new Date().toISOString(),
    };

    setStaffList([...staffList, newStaff]);
    setModalOpen(false);
    setDisplayName('');
    setEmail('');
    setPhone('');
  };

  const toggleStaffActive = (uid: string) => {
    if (uid === 'owner_debasish') {
      alert('Cannot deactivate primary owner account.');
      return;
    }
    setStaffList(
      staffList.map((s) => (s.uid === uid ? { ...s, active: !s.active } : s))
    );
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
            Manage workshop access, technicians, and managerial roles.
          </p>
        </div>
        <Button
          size="sm"
          variant="primary"
          leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
          onClick={() => setModalOpen(true)}
        >
          Add Staff Member
        </Button>
      </div>

      <div className="bg-white rounded-2xl border border-brand-border shadow-xs overflow-hidden divide-y divide-brand-border text-xs">
        {staffList.map((staff) => (
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
                <span>Added: {formatDate(staff.createdAt)}</span>
              </div>
            </div>

            {staff.uid !== 'owner_debasish' && (
              <Button
                size="sm"
                variant={staff.active ? 'outline' : 'secondary'}
                className="text-xs"
                onClick={() => toggleStaffActive(staff.uid)}
              >
                {staff.active ? 'Deactivate Access' : 'Reactivate Access'}
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Add Staff Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Staff Member"
        description="Provision authorized access to the repair shop CRM."
      >
        <form onSubmit={handleCreateStaff} className="space-y-4">
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
            placeholder="name@mobilerepairinghouse.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Phone Number"
            placeholder="10-digit mobile"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
            <Button type="submit" variant="primary">
              Provision Staff Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
