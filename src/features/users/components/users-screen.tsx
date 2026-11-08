"use client";

import { useCallback, useEffect, useState } from "react";
import { ROLE_LABELS } from "@/constants/strings";
import { usersService } from "@/features/users/services/users-service";
import type { CreateUserInput, SystemUser, UsersQuery, UpdateUserInput } from "@/features/users/types";
import type { PageMeta, Role } from "@/types";
import { ApiRequestError } from "@/lib/api-client";
import { defer } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";
import { PageHeading } from "@/components/shared/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Field, SelectField } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { Status } from "@/components/ui/status";

/** أدوار الموظفين القابلة للإنشاء — الزبون خارج هذه القائمة */
const STAFF_ROLES: Array<Exclude<Role, "CUSTOMER">> = ["RECEPTIONIST", "ADMIN", "SUPERVISOR"];

const EMPTY_FORM = { fullName: "", phone: "", password: "", role: "RECEPTIONIST" as string };

/** إدارة الموظفين والصلاحيات: قائمة + بحث + إضافة وتعديل وتعطيل */
export function UsersScreen() {
  const [query, setQuery] = useState<UsersQuery>({ q: "", role: "", isActive: "", page: 1 });
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [meta, setMeta] = useState<PageMeta | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<SystemUser | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const debouncedQuery = useDebounce(query, 350);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await usersService.list(debouncedQuery);
      setUsers(result.users);
      setMeta(result.meta);
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر تحميل قائمة الموظفين.");
    } finally {
      setLoading(false);
    }
  }, [debouncedQuery]);

  useEffect(() => {
    defer(load);
  }, [load]);

  function startCreate() {
    setCreating(true);
    setSelected(null);
    setForm(EMPTY_FORM);
    setNotice(null);
  }

  function startEdit(user: SystemUser) {
    setCreating(false);
    setSelected(user);
    setForm({ fullName: user.fullName, phone: user.phone, password: "", role: user.role });
    setNotice(null);
  }

  function resetForm() {
    setCreating(false);
    setSelected(null);
    setForm(EMPTY_FORM);
    setNotice(null);
  }

  async function submit() {
    setError(null);
    setNotice(null);

    try {
      if (creating) {
        if (!form.fullName.trim() || !form.phone.trim() || !form.password) {
          setError("أكمل الاسم ورقم الهاتف وكلمة المرور.");
          return;
        }
        await usersService.create({
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          password: form.password,
          role: form.role as CreateUserInput["role"],
        });
        setNotice("تمت إضافة الموظف بنجاح.");
      } else if (selected) {
        await usersService.update(selected.id, {
          fullName: form.fullName.trim(),
          phone: form.phone.trim(),
          role: form.role as UpdateUserInput["role"],
        });
        setNotice("تم حفظ تعديلات الموظف.");
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر حفظ البيانات.");
    }
  }

  async function toggleStatus(user: SystemUser) {
    setError(null);
    setNotice(null);
    try {
      await usersService.setStatus(user.id, !user.isActive);
      setNotice(user.isActive ? `تم تعطيل حساب ${user.fullName}.` : `تم تفعيل حساب ${user.fullName}.`);
      await load();
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "تعذّر تغيير حالة الحساب.");
    }
  }

  const columns: Column<SystemUser>[] = [
    { key: "name", label: "الموظف", render: (user) => user.fullName },
    { key: "role", label: "الدور", render: (user) => ROLE_LABELS[user.role] ?? user.role },
    {
      key: "status",
      label: "الحالة",
      render: (user) => (
        <Status tone={user.isActive ? "success" : "neutral"}>
          {user.isActive ? "نشط" : "غير نشط"}
        </Status>
      ),
    },
    {
      key: "actions",
      label: "إجراءات",
      render: (user) => (
        <span className="row-actions">
          <button type="button" onClick={() => startEdit(user)}>
            تعديل
          </button>
          <button type="button" onClick={() => void toggleStatus(user)}>
            {user.isActive ? "تعطيل" : "إعادة تفعيل"}
          </button>
        </span>
      ),
    },
  ];

  const activeCount = users.filter((user) => user.isActive).length;

  return (
    <>
      <PageHeading
        title="الموظفون والصلاحيات"
        subtitle={`حسابات فريق الشركة · ${activeCount} نشطين من ${users.length} معروض`}
        action={
          <Button type="button" onClick={startCreate} disabled={creating}>
            إضافة موظف
          </Button>
        }
      />

      <div className="filters">
        <Field
          label="بحث عن موظف"
          placeholder="الاسم أو رقم الهاتف"
          value={query.q ?? ""}
          onChange={(event) => setQuery((prev) => ({ ...prev, q: event.target.value, page: 1 }))}
        />
        <SelectField
          label="الدور"
          value={query.role ?? ""}
          onChange={(event) =>
            setQuery((prev) => ({
              ...prev,
              role: event.target.value as UsersQuery["role"],
              page: 1,
            }))
          }
        >
          <option value="">كل الأدوار</option>
          {STAFF_ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </SelectField>
        <SelectField
          label="الحالة"
          value={String(query.isActive ?? "")}
          onChange={(event) =>
            setQuery((prev) => ({
              ...prev,
              isActive: event.target.value === "" ? "" : event.target.value === "true",
              page: 1,
            }))
          }
        >
          <option value="">كل الحالات</option>
          <option value="true">نشط</option>
          <option value="false">غير نشط</option>
        </SelectField>
      </div>

      <div className="content-grid content-grid--form">
        <div>
          <DataTable
            columns={columns}
            rows={users}
            rowKey={(user) => user.id}
            loading={loading}
            meta={meta}
            onPageChange={(page) => setQuery((prev) => ({ ...prev, page }))}
            emptyMessage="لا يوجد موظفون مطابقون للفلاتر الحالية."
          />

          {error && (
            <Notice title="تعذّر إتمام العملية" tone="danger">
              {error}
            </Notice>
          )}
          {notice && (
            <Notice title="تم التنفيذ" tone="info">
              {notice}
            </Notice>
          )}

          <p className="last-edit">
            قبل التعطيل: أكّد اسم الموظف؛ تتوقف جلساته ولا تُحذف حجوزاته أو آثاره في السجل.
          </p>
        </div>

        <Card
          title={creating ? "إضافة موظف جديد" : selected ? `تعديل بيانات ${selected.fullName}` : "تعديل بيانات موظف"}
          className="form-card"
        >
          {!creating && !selected && <p className="caption">اختر موظفاً من الجدول لعرض بياناته.</p>}

          {(creating || selected) && (
            <>
              {!creating && selected && (
                <Status tone={selected.isActive ? "success" : "neutral"}>
                  {selected.isActive ? "حساب نشط" : "حساب غير نشط"}
                </Status>
              )}

              <Field
                label="الاسم الكامل"
                value={form.fullName}
                onChange={(event) => setForm((prev) => ({ ...prev, fullName: event.target.value }))}
              />
              <Field
                label="رقم الهاتف"
                type="tel"
                inputMode="tel"
                value={form.phone}
                onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
              />
              {creating && (
                <Field
                  label="كلمة المرور"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                />
              )}
              <SelectField
                label="الدور"
                value={form.role}
                onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
              >
                {STAFF_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {ROLE_LABELS[role]}
                  </option>
                ))}
              </SelectField>

              <p className="caption">
                الاستقبال يدير حجوزاته ولا يرى تقارير الإدارة أو إعداداتها. المدير يرث صلاحيات
                الاستقبال.
              </p>

              <div className="actions">
                <Button type="button" onClick={() => void submit()}>
                  {creating ? "إضافة الموظف" : "حفظ التعديلات"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  تراجع
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
}
