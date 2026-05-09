import { createFileRoute } from "@tanstack/react-router";
import { useStore } from "@/store/useStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { User, Role } from "@/store/types";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/admin/users")({ component: UsersAdmin });

const empty = { fullName: "", email: "", password: "", role: "staff" as Role, phone: "", address: "" };

function UsersAdmin() {
  const { users, addUser, updateUser, deleteUser } = useStore();
  const staff = users.filter((u) => u.role !== "customer");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState(empty);

  const openNew = () => { setEditing(null); setForm(empty); setOpen(true); };
  const openEdit = (u: User) => { setEditing(u); setForm({ fullName: u.fullName, email: u.email, password: u.password, role: u.role, phone: u.phone ?? "", address: u.address ?? "" }); setOpen(true); };
  const save = () => {
    if (!form.fullName || !form.email || !form.password) { toast.error("Thiếu thông tin"); return; }
    if (editing) { updateUser(editing.id, form); toast.success("Đã cập nhật"); }
    else { addUser(form); toast.success("Đã thêm"); }
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-3xl font-bold">Phân quyền người dùng</h1><p className="text-muted-foreground">Quản lý tài khoản admin & nhân viên</p></div>
        <Button onClick={openNew}><Plus className="mr-1 h-4 w-4" />Thêm tài khoản</Button>
      </div>

      <div className="rounded-xl border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
            <tr><th className="px-4 py-3">Họ tên</th><th>Email</th><th>Vai trò</th><th>SĐT</th><th className="text-right pr-4">Thao tác</th></tr>
          </thead>
          <tbody>
            {staff.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-4 py-3 font-medium">{u.fullName}</td>
                <td>{u.email}</td>
                <td><Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge></td>
                <td className="text-muted-foreground">{u.phone}</td>
                <td className="pr-4 text-right">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(u)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => { if (confirm("Xoá tài khoản?")) { deleteUser(u.id); toast.success("Đã xoá"); } }}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Sửa" : "Thêm"} tài khoản</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2"><Label>Họ tên</Label><Input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
            <div><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div><Label>Mật khẩu</Label><Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
            <div><Label>Vai trò</Label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} className="h-10 w-full rounded-md border bg-background px-3">
                <option value="admin">Quản trị viên</option>
                <option value="staff">Nhân viên</option>
                <option value="customer">Khách hàng</option>
              </select>
            </div>
            <div><Label>SĐT</Label><Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Huỷ</Button><Button onClick={save}>Lưu</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
